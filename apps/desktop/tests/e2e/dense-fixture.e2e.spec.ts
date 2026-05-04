import {
  chromium,
  expect,
  test,
  type Browser,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type { DevMetricsSnapshot } from '../../src/shared/ipc';

const cdpPort = Number(process.env.LUMABIN_E2E_CDP_PORT ?? 9222);
const cdpEndpoint = process.env.LUMABIN_E2E_CDP_ENDPOINT ?? `http://127.0.0.1:${cdpPort}`;
const expectedFixtureAssetCount = Number.parseInt(
  process.env.LUMABIN_E2E_FIXTURE_ASSET_COUNT ?? '0',
  10,
);

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isAppWindowPage = (page: Page): boolean => {
  const url = page.url();
  if (url.startsWith('devtools://')) {
    return false;
  }
  if (url.startsWith('chrome-extension://')) {
    return false;
  }
  return true;
};

const connectToAppPage = async (): Promise<{ browser: Browser; page: Page }> => {
  const browser = await chromium.connectOverCDP(cdpEndpoint);
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    for (const context of browser.contexts()) {
      for (const candidate of context.pages()) {
        if (!isAppWindowPage(candidate)) {
          continue;
        }
        await candidate.waitForLoadState('domcontentloaded');
        return { browser, page: candidate };
      }
    }
    await wait(200);
  }

  await browser.close();
  throw new Error(`Could not find app window page on ${cdpEndpoint}.`);
};

const metricValue = async (label: string): Promise<string> => {
  const item = page.locator('.dev-metrics-item').filter({ hasText: label });
  await expect(item).toBeVisible();
  return item.locator('strong').innerText();
};

const formatDevMetricsSnapshot = (
  metrics: DevMetricsSnapshot,
  options: {
    generatedAt: string;
    profileLabel: string;
  },
): string => {
  const previewCacheTotal = metrics.cache.previewHit + metrics.cache.previewMiss;
  const headCacheTotal = metrics.cache.headHit + metrics.cache.headMiss;
  const searchCacheTotal =
    metrics.cache.searchSnapshotHit + metrics.cache.searchSnapshotMiss;
  const hitRate = (hit: number, total: number): number =>
    total > 0 ? Math.round((hit / total) * 100) : 0;

  return [
    '# LumaBin Dev Metrics Snapshot',
    `Generated at: ${options.generatedAt}`,
    `Profile: ${options.profileLabel}`,
    `Collected at: ${metrics.collectedAt}`,
    `Preview cache hit rate: ${hitRate(metrics.cache.previewHit, previewCacheTotal)}%`,
    `HEAD cache hit rate: ${hitRate(metrics.cache.headHit, headCacheTotal)}%`,
    `Search cache hit rate: ${hitRate(metrics.cache.searchSnapshotHit, searchCacheTotal)}%`,
    `List calls: ${metrics.storage.listCalls}`,
    `HEAD calls: ${metrics.storage.headCalls}`,
    `GET calls: ${metrics.storage.getCalls}`,
    `PUT calls: ${metrics.storage.putCalls}`,
    `Exists checks: ${metrics.storage.existsChecks}`,
    `Downloaded bytes: ${metrics.storage.bytesDownloaded}`,
    `Uploaded bytes: ${metrics.storage.bytesUploaded}`,
    `Failures: ${metrics.storage.failures}`,
  ].join('\n');
};

const attachDevMetricsSnapshot = async (
  testInfo: TestInfo,
): Promise<DevMetricsSnapshot> => {
  const metrics = await page.evaluate(async () => {
    const api = (window as unknown as {
      lumabin?: {
        dev?: {
          getMetrics(): Promise<DevMetricsSnapshot>;
        };
      };
    }).lumabin;
    if (!api?.dev) {
      throw new Error('LumaBin dev metrics API is unavailable.');
    }
    return api.dev.getMetrics();
  });
  const snapshot = formatDevMetricsSnapshot(metrics, {
    generatedAt: new Date().toISOString(),
    profileLabel: 'E2E fixture / 1000 assets',
  });
  const snapshotPath = testInfo.outputPath('dev-metrics-snapshot.txt');
  await writeFile(snapshotPath, snapshot);
  await testInfo.attach('dev-metrics-snapshot.txt', {
    path: snapshotPath,
    contentType: 'text/plain',
  });
  return metrics;
};

test.skip(
  process.env.LUMABIN_E2E_DENSE !== '1',
  'Dense fixture smoke runs only when LUMABIN_E2E_DENSE=1.',
);

test.describe.configure({ mode: 'serial' });

let browser: Browser;
let page: Page;

test.beforeAll(async () => {
  const connected = await connectToAppPage();
  browser = connected.browser;
  page = connected.page;
  await expect(page.getByRole('heading', { name: 'LumaBin' })).toBeVisible({
    timeout: 30_000,
  });
});

test.afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

test('dense fixture supports search, virtual scroll, and preview walkthrough', async ({ browserName: _browserName }, testInfo) => {
  void _browserName;
  expect(expectedFixtureAssetCount).toBeGreaterThanOrEqual(100);
  await page.setViewportSize({ width: 1440, height: 900 });

  await expect.poll(async () => page.locator('.gallery-card').count()).toBeGreaterThan(0);

  const searchInput = page.getByPlaceholder('Search in this bucket… (Cmd/Ctrl+K)');
  await searchInput.fill('dense');
  await searchInput.press('Enter');

  await expect(page.locator('.active-query-summary-text')).toContainText('dense');
  const firstDenseCard = page.locator('.gallery-card').first();
  await expect(firstDenseCard).toBeVisible();
  await expect(firstDenseCard).toHaveAccessibleName(/lumabin-fixture|CSV|PDF/);

  const galleryScroll = page.locator('.gallery-scroll');
  await expect
    .poll(
      async () =>
        galleryScroll.evaluate((node) =>
          Math.max(0, node.scrollHeight - node.clientHeight),
        ),
      {
        timeout: 8_000,
      },
    )
    .toBeGreaterThan(0);
  const initialScrollTop = await galleryScroll.evaluate((node) => node.scrollTop);
  await galleryScroll.evaluate((node) => {
    node.scrollTo({
      top: Math.max(0, node.scrollHeight - node.clientHeight),
      behavior: 'auto',
    });
  });
  await expect
    .poll(async () => galleryScroll.evaluate((node) => node.scrollTop), {
      timeout: 8_000,
    })
    .toBeGreaterThan(initialScrollTop);

  await expect(page.locator('.gallery-card').first()).toBeVisible();
  await page.locator('.gallery-card').first().click();
  const preview = page.getByRole('dialog', { name: 'Asset Preview' });
  await expect(preview).toBeVisible();
  await expect(preview.getByRole('heading', { name: 'Manage asset' })).toBeVisible();
  await preview.getByRole('button', { name: 'Close preview' }).click();
  await expect(preview).toBeHidden();

  const topbarBounds = await page.locator('.topbar').boundingBox();
  const firstCardBounds = await page.locator('.gallery-card').first().boundingBox();
  expect(topbarBounds).not.toBeNull();
  expect(firstCardBounds).not.toBeNull();
  if (!topbarBounds || !firstCardBounds) {
    return;
  }

  expect(firstCardBounds.y).toBeGreaterThan(topbarBounds.y + topbarBounds.height - 1);

  await page.getByRole('button', { name: 'Open workspace settings' }).click();
  const settingsDialog = page.getByRole('dialog', { name: 'Workspace Settings' });
  await expect(settingsDialog).toBeVisible();
  await settingsDialog.getByRole('tab', { name: /Dev metrics/ }).click();
  await settingsDialog.getByRole('button', { name: 'Refresh' }).click();

  await expect.poll(() => metricValue('List calls')).not.toBe('0');
  await expect.poll(() => metricValue('Failures')).toBe('0');
  await expect(settingsDialog.getByRole('button', { name: 'Copy snapshot' })).toBeEnabled();
  const metrics = await attachDevMetricsSnapshot(testInfo);
  expect(metrics.storage.listCalls).toBeGreaterThan(0);
  expect(metrics.storage.failures).toBe(0);
});
