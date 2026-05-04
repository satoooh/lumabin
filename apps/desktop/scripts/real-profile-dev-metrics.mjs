#!/usr/bin/env node

import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const cdpPort = Number(process.env.LUMABIN_REAL_PROFILE_CDP_PORT ?? 9334);
const cdpEndpoint =
  process.env.LUMABIN_REAL_PROFILE_CDP_ENDPOINT ?? `http://127.0.0.1:${cdpPort}`;
const outputPath =
  process.env.LUMABIN_REAL_PROFILE_METRICS_OUTPUT ??
  path.resolve(process.cwd(), 'test-results', 'real-profile-dev-metrics-snapshot.txt');
const searchRuns = Number(process.env.LUMABIN_REAL_PROFILE_SEARCH_RUNS ?? 3);
const previewRuns = Number(process.env.LUMABIN_REAL_PROFILE_PREVIEW_RUNS ?? 3);
const previewProbeMaxBytes = Number(
  process.env.LUMABIN_REAL_PROFILE_PREVIEW_MAX_BYTES ??
    String(262_144 + (Date.now() % 65_536)),
);

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isAppWindowPage = (page) => {
  const url = page.url();
  if (url.startsWith('devtools://')) {
    return false;
  }
  if (url.startsWith('chrome-extension://')) {
    return false;
  }
  return true;
};

const connectToAppPage = async () => {
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

const withLumabinApi = async (page, operation, input = null) =>
  page.evaluate(async ({ operation: operationName, input: operationInput }) => {
    const api = window.lumabin;
    if (!api) {
      throw new Error('LumaBin preload API is unavailable.');
    }
    switch (operationName) {
      case 'profiles.list':
        return api.profiles.list();
      case 'assets.list':
        return api.assets.list({
          profileId: operationInput.profileId,
          limit: operationInput.limit,
        });
      case 'assets.preview':
        return api.assets.preview({
          profileId: operationInput.profileId,
          key: operationInput.key,
          maxBytes: operationInput.maxBytes,
        });
      case 'dev.getMetrics':
        return api.dev.getMetrics();
      case 'dev.resetMetrics':
        return api.dev.resetMetrics();
      default:
        throw new Error(`Unsupported LumaBin operation: ${operationName}`);
    }
  }, { operation, input });

const collectProfile = async (page) => {
  const profiles = await withLumabinApi(page, 'profiles.list');
  const profile = profiles[0];
  if (!profile) {
    throw new Error('No local profile is available for real-profile metrics.');
  }
  return profile;
};

const collectCandidateKeys = async (page, profileId) => {
  const listed = await withLumabinApi(
    page,
    'assets.list',
    { profileId, limit: 80 },
  );
  return listed.items.map((item) => item.key);
};

const buildSearchQueries = (keys) => {
  const extensionQueries = keys
    .map((key) => key.match(/\.([a-z0-9]{2,5})(?:$|\?)/i)?.[1]?.toLowerCase())
    .filter(Boolean);
  const pathQueries = keys
    .flatMap((key) => key.split(/[\/._\-\s]+/u))
    .map((part) => part.trim())
    .filter((part) => part.length >= 3 && !/^\d+$/.test(part))
    .map((part) => part.toLowerCase());
  return [...new Set([...extensionQueries, ...pathQueries])].slice(0, searchRuns);
};

const getMetrics = async (page) =>
  withLumabinApi(page, 'dev.getMetrics');

const resetMetrics = async (page) =>
  withLumabinApi(page, 'dev.resetMetrics');

const percentage = (hit, total) => (total > 0 ? Math.round((hit / total) * 100) : 0);

const formatSnapshot = ({ generatedAt, profile, keys, queries, previewProbeKeys, metrics }) => {
  const previewCacheTotal = metrics.cache.previewHit + metrics.cache.previewMiss;
  const headCacheTotal = metrics.cache.headHit + metrics.cache.headMiss;
  const searchCacheTotal =
    metrics.cache.searchSnapshotHit + metrics.cache.searchSnapshotMiss;

  return [
    '# LumaBin Dev Metrics Snapshot',
    `Generated at: ${generatedAt}`,
    `Profile: ${profile.name} (${profile.provider}, bucket: ${profile.bucket})`,
    'Scenario: real profile read-only walkthrough via development app CDP',
    `Candidate keys sampled: ${keys.length}`,
    `Search queries: ${queries.length > 0 ? queries.join(', ') : '(none)'}`,
    `Preview API probes: ${previewProbeKeys.length}`,
    `Preview probe max bytes: ${previewProbeMaxBytes}`,
    `Collected at: ${metrics.collectedAt}`,
    `Preview cache hit rate: ${percentage(metrics.cache.previewHit, previewCacheTotal)}%`,
    `HEAD cache hit rate: ${percentage(metrics.cache.headHit, headCacheTotal)}%`,
    `Search cache hit rate: ${percentage(metrics.cache.searchSnapshotHit, searchCacheTotal)}%`,
    `List calls: ${metrics.storage.listCalls}`,
    `HEAD calls: ${metrics.storage.headCalls}`,
    `GET calls: ${metrics.storage.getCalls}`,
    `PUT calls: ${metrics.storage.putCalls}`,
    `Exists checks: ${metrics.storage.existsChecks}`,
    `Test connection calls: ${metrics.storage.testConnectionCalls}`,
    `Downloaded bytes: ${metrics.storage.bytesDownloaded}`,
    `Uploaded bytes: ${metrics.storage.bytesUploaded}`,
    `Failures: ${metrics.storage.failures}`,
  ].join('\n');
};

const runSearchWalkthrough = async (page, queries) => {
  const searchInput = page.getByPlaceholder('Search in this bucket… (Cmd/Ctrl+K)');
  await searchInput.waitFor({ state: 'visible', timeout: 20_000 });

  for (const query of queries) {
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await wait(900);
  }

  await searchInput.fill('');
  await searchInput.press('Enter');
  await wait(900);
};

const runScrollWalkthrough = async (page) => {
  const galleryScroll = page.locator('.gallery-scroll');
  await galleryScroll.waitFor({ state: 'visible', timeout: 20_000 });
  await galleryScroll.evaluate((node) => {
    node.scrollTo({ top: Math.max(0, node.scrollHeight - node.clientHeight), behavior: 'auto' });
  });
  await wait(500);
  await galleryScroll.evaluate((node) => {
    node.scrollTo({ top: 0, behavior: 'auto' });
  });
  await wait(500);
};

const runPreviewWalkthrough = async (page) => {
  for (let index = 0; index < previewRuns; index += 1) {
    const cards = page.locator('.gallery-card');
    const count = await cards.count();
    if (count === 0) {
      return;
    }

    await cards.nth(Math.min(index, count - 1)).click();
    const preview = page.getByRole('dialog', { name: 'Asset Preview' });
    await preview.waitFor({ state: 'visible', timeout: 12_000 });
    await wait(800);
    await preview.getByRole('button', { name: 'Close preview' }).click();
    await preview.waitFor({ state: 'hidden', timeout: 12_000 });
  }
};

const runPreviewApiProbes = async (page, profileId, keys) => {
  const probeKeys = keys.slice(-previewRuns);
  for (const key of probeKeys) {
    await withLumabinApi(
      page,
      'assets.preview',
      { profileId, key, maxBytes: previewProbeMaxBytes },
    );
  }
  return probeKeys;
};

const main = async () => {
  const { browser, page } = await connectToAppPage();

  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('heading', { name: 'LumaBin' }).waitFor({
      state: 'visible',
      timeout: 30_000,
    });

    const profile = await collectProfile(page);
    await resetMetrics(page);

    const keys = await collectCandidateKeys(page, profile.id);
    if (keys.length === 0) {
      throw new Error(`Profile ${profile.name} returned no assets to walk through.`);
    }
    const queries = buildSearchQueries(keys);

    await page.locator('.gallery-card').first().waitFor({
      state: 'visible',
      timeout: 30_000,
    });
    await runSearchWalkthrough(page, queries);
    await runScrollWalkthrough(page);
    await runPreviewWalkthrough(page);
    const previewProbeKeys = await runPreviewApiProbes(page, profile.id, keys);

    const metrics = await getMetrics(page);
    if (metrics.storage.putCalls !== 0 || metrics.storage.bytesUploaded !== 0) {
      throw new Error('Read-only walkthrough unexpectedly recorded upload activity.');
    }
    if (metrics.storage.failures !== 0) {
      throw new Error(`Read-only walkthrough recorded ${metrics.storage.failures} storage failures.`);
    }

    const snapshot = formatSnapshot({
      generatedAt: new Date().toISOString(),
      profile,
      keys,
      queries,
      previewProbeKeys,
      metrics,
    });
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${snapshot}\n`);
    console.log(snapshot);
    console.log(`\n[real-profile-dev-metrics] wrote ${outputPath}`);
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(`[real-profile-dev-metrics] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
