import {
  chromium,
  expect,
  test,
  type Browser,
  type Locator,
  type Page,
} from '@playwright/test';

const cdpPort = Number(process.env.LUMABIN_E2E_CDP_PORT ?? 9222);
const cdpEndpoint = process.env.LUMABIN_E2E_CDP_ENDPOINT ?? `http://127.0.0.1:${cdpPort}`;
const tinyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l4gAAAABJRU5ErkJggg==',
  'base64',
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

test.describe.configure({ mode: 'serial' });

let browser: Browser;
let page: Page;

const expectWithinViewport = async (
  locator: Locator,
  label: string,
): Promise<void> => {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box, `${label} should have a visible bounding box`).not.toBeNull();
  expect(viewport, 'Viewport should be available for layout checks').not.toBeNull();
  if (!box || !viewport) {
    return;
  }

  expect(box.x, `${label} should not overflow left`).toBeGreaterThanOrEqual(-1);
  expect(box.y, `${label} should not overflow top`).toBeGreaterThanOrEqual(-1);
  expect(
    box.x + box.width,
    `${label} should not overflow right`,
  ).toBeLessThanOrEqual(viewport.width + 1);
  expect(
    box.y + box.height,
    `${label} should not overflow bottom`,
  ).toBeLessThanOrEqual(viewport.height + 1);
};

const openPreviewForFirstCard = async (): Promise<Locator> => {
  const firstCard = page.locator('.gallery-card').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  const preview = page.getByRole('dialog', { name: 'Asset Preview' });
  await expect(preview).toBeVisible();
  return preview;
};

const queueDeleteFromPreview = async (): Promise<void> => {
  const preview = await openPreviewForFirstCard();
  const manageAsset = preview.getByRole('heading', { name: 'Manage asset' });
  await expect(manageAsset).toBeVisible();
  await preview.getByRole('button', { name: 'Delete asset' }).click();

  const deleteDialog = page.getByRole('dialog', { name: 'Delete asset' });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole('button', { name: 'Delete' }).click();
};

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

test('app shell renders key controls', async () => {
  await expect(page.getByRole('heading', { name: 'LumaBin' })).toBeVisible();
  await expect(
    page.getByPlaceholder('Search in this bucket… (Cmd/Ctrl+K)'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select profile' })).toBeVisible();
});

test('workspace settings opens and closes by overlay click', async () => {
  await page.setViewportSize({ width: 1120, height: 760 });
  await page.getByRole('button', { name: 'Open workspace settings' }).click();
  const dialog = page.getByRole('dialog', { name: 'Workspace Settings' });
  await expect(dialog).toBeVisible();
  await expectWithinViewport(page.locator('.modal-card--settings'), 'Workspace settings modal');
  await expectWithinViewport(
    dialog.getByRole('button', { name: 'Close' }),
    'Workspace settings close button',
  );
  await expect(dialog.getByRole('tab', { name: /Connection profile/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await dialog.getByRole('tab', { name: /Workspace defaults/ }).click();
  await expect(dialog.getByLabel('Appearance')).toBeVisible();

  await dialog.getByRole('tab', { name: /Browser session/ }).click();
  await expect(dialog.getByLabel('Prefix')).toBeVisible();

  await dialog.getByRole('tab', { name: /Saved views/ }).click();
  await expect(dialog.getByRole('button', { name: 'Save view' })).toBeVisible();

  await page.locator('.modal-overlay').click({ position: { x: 12, y: 12 } });
  await expect(dialog).toBeHidden();
});

test('profile menu opens connection setup modal', async () => {
  await page.getByRole('button', { name: 'Select profile' }).click();
  await page.getByRole('option', { name: 'New connection…' }).click();

  const dialog = page.getByRole('dialog', { name: 'Connection Setup' });
  await expect(dialog).toBeVisible();
  await expectWithinViewport(page.locator('.modal-card--connection'), 'Connection setup modal');
  await expectWithinViewport(
    dialog.getByRole('button', { name: 'Close' }),
    'Connection setup close button',
  );
  await expectWithinViewport(
    dialog.getByRole('button', { name: 'Save' }),
    'Connection setup save button',
  );

  await page.locator('.modal-overlay').click({ position: { x: 12, y: 12 } });
  await expect(dialog).toBeHidden();
});

test('topbar profile selector remains visible in narrow viewport', async () => {
  await page.setViewportSize({ width: 980, height: 760 });
  await expect(page.getByRole('button', { name: 'Select profile' })).toBeVisible();

  const topbarBounds = await page.locator('.topbar').boundingBox();
  const profileBounds = await page
    .locator('.topbar-profile-select .profile-select-trigger')
    .boundingBox();

  expect(topbarBounds).not.toBeNull();
  expect(profileBounds).not.toBeNull();
  if (!topbarBounds || !profileBounds) {
    return;
  }

  expect(profileBounds.x).toBeGreaterThanOrEqual(topbarBounds.x - 1);
  expect(profileBounds.x + profileBounds.width).toBeLessThanOrEqual(
    topbarBounds.x + topbarBounds.width + 1,
  );
});

test('quick preview can copy public URL with feedback', async () => {
  await page.setViewportSize({ width: 1180, height: 780 });
  const preview = await openPreviewForFirstCard();
  await expectWithinViewport(page.locator('.modal-card--preview'), 'Quick preview modal');
  await expectWithinViewport(
    preview.getByRole('button', { name: 'Close preview' }),
    'Quick preview close button',
  );
  await expectWithinViewport(
    preview.getByRole('heading', { name: 'Manage asset' }),
    'Quick preview management section',
  );
  const copyPublicUrlButton = preview.getByRole('button', { name: 'Copy public URL' });
  await expect(copyPublicUrlButton).toBeEnabled();
  await copyPublicUrlButton.click();
  await expect(preview.getByRole('button', { name: 'Copied!' })).toBeVisible();
  await preview.getByRole('button', { name: 'Close preview' }).click();
  await expect(preview).toBeHidden();
});

test('delete flow supports undo and delete-now', async () => {
  const beforeDeleteCount = await page.locator('.gallery-card').count();
  expect(beforeDeleteCount).toBeGreaterThan(1);

  await queueDeleteFromPreview();
  const pendingDeleteToast = page.locator('.delete-undo-toast');
  await expect(pendingDeleteToast).toBeVisible();
  await expectWithinViewport(pendingDeleteToast, 'Delete undo toast');
  await expectWithinViewport(
    pendingDeleteToast.getByRole('button', { name: 'Undo' }),
    'Delete undo button',
  );
  await pendingDeleteToast.getByRole('button', { name: 'Undo' }).click();
  await expect(pendingDeleteToast).toBeHidden();
  await expect
    .poll(async () => page.locator('.gallery-card').count(), {
      timeout: 8_000,
    })
    .toBe(beforeDeleteCount);

  await queueDeleteFromPreview();
  await expect(pendingDeleteToast).toBeVisible();
  await pendingDeleteToast.getByRole('button', { name: 'Delete now' }).click();
  await expect(pendingDeleteToast).toBeHidden();
  await expect
    .poll(async () => page.locator('.gallery-card').count(), {
      timeout: 8_000,
    })
    .toBe(beforeDeleteCount - 1);
});

test('hidden file input upload adds a new gallery item', async () => {
  const countBeforeUpload = await page.locator('.gallery-card').count();
  const hiddenFileInput = page.locator('input.hidden-file-input[type="file"]');
  await hiddenFileInput.setInputFiles({
    name: 'e2e-upload.png',
    mimeType: 'image/png',
    buffer: tinyPngBuffer,
  });

  await expect
    .poll(async () => page.locator('.gallery-card').count(), {
      timeout: 10_000,
    })
    .toBe(countBeforeUpload + 1);
});
