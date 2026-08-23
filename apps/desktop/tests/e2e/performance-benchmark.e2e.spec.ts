import {
  chromium,
  expect,
  test,
  type Browser,
  type CDPSession,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const cdpPort = Number(process.env.LUMABIN_E2E_CDP_PORT ?? 9222);
const cdpEndpoint =
  process.env.LUMABIN_E2E_CDP_ENDPOINT ?? `http://127.0.0.1:${cdpPort}`;
const expectedFixtureAssetCount = Number.parseInt(
  process.env.LUMABIN_E2E_FIXTURE_ASSET_COUNT ?? '0',
  10,
);
const BENCHMARK_RUN_COUNT = 5;
const SCROLL_FRAME_COUNT = 120;
const VIEWPORT = { width: 1440, height: 900 };

interface CdpPerformanceMetrics {
  LayoutCount: number;
  LayoutDuration: number;
  RecalcStyleCount: number;
  RecalcStyleDuration: number;
  ScriptDuration: number;
  TaskDuration: number;
}

interface ScrollSample {
  durationMs: number;
  estimatedFrameBudgetMs: number;
  frameMedianMs: number;
  frameP95Ms: number;
  frameMaxMs: number;
  overBudgetFrameCount: number;
  overBudgetFrameRate: number;
  renderedCardMax: number;
  scrollHeightDriftPx: number;
}

interface BenchmarkRun extends ScrollSample {
  layoutCount: number;
  layoutDurationMs: number;
  recalcStyleCount: number;
  recalcStyleDurationMs: number;
  scriptDurationMs: number;
  taskDurationMs: number;
}

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const isAppWindowPage = (page: Page): boolean => {
  const url = page.url();
  return !url.startsWith('devtools://') && !url.startsWith('chrome-extension://');
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

const readCdpPerformanceMetrics = async (
  session: CDPSession,
): Promise<CdpPerformanceMetrics> => {
  const response = (await session.send('Performance.getMetrics')) as {
    metrics: Array<{ name: string; value: number }>;
  };
  const values = Object.fromEntries(
    response.metrics.map((metric) => [metric.name, metric.value]),
  );
  const read = (name: keyof CdpPerformanceMetrics): number => values[name] ?? 0;

  return {
    LayoutCount: read('LayoutCount'),
    LayoutDuration: read('LayoutDuration'),
    RecalcStyleCount: read('RecalcStyleCount'),
    RecalcStyleDuration: read('RecalcStyleDuration'),
    ScriptDuration: read('ScriptDuration'),
    TaskDuration: read('TaskDuration'),
  };
};

const delta = (
  after: CdpPerformanceMetrics,
  before: CdpPerformanceMetrics,
  key: keyof CdpPerformanceMetrics,
): number => after[key] - before[key];

const median = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

const round = (value: number, digits = 3): number => {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
};

const measureScroll = async (page: Page): Promise<ScrollSample> =>
  page.evaluate(async ({ frameCount }) => {
    const scroll = document.querySelector('.gallery-scroll');
    if (!(scroll instanceof HTMLElement)) {
      throw new Error('Gallery scroll container is unavailable.');
    }

    const nextFrame = (): Promise<number> =>
      new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    const percentile = (values: number[], ratio: number): number => {
      const sorted = [...values].sort((left, right) => left - right);
      const index = Math.min(
        sorted.length - 1,
        Math.max(0, Math.ceil(sorted.length * ratio) - 1),
      );
      return sorted[index] ?? 0;
    };

    scroll.scrollTop = 0;
    await nextFrame();
    await nextFrame();

    const scrollHeights = [scroll.scrollHeight];
    const renderedCardCounts = [
      document.querySelectorAll('.gallery-card').length,
    ];
    const frameDeltas: number[] = [];
    const halfFrameCount = frameCount / 2;
    const startedAt = performance.now();
    let previousFrame = await nextFrame();

    for (let index = 0; index < frameCount; index += 1) {
      const outbound = index < halfFrameCount;
      const progress = outbound
        ? index / Math.max(1, halfFrameCount - 1)
        : (frameCount - index - 1) / Math.max(1, halfFrameCount - 1);
      const maxScrollTop = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      scroll.scrollTop = maxScrollTop * progress;

      const frame = await nextFrame();
      frameDeltas.push(frame - previousFrame);
      previousFrame = frame;

      if (index % 8 === 0 || index === frameCount - 1) {
        scrollHeights.push(scroll.scrollHeight);
        renderedCardCounts.push(
          document.querySelectorAll('.gallery-card').length,
        );
      }
    }

    const durationMs = performance.now() - startedAt;
    const estimatedFrameBudgetMs = percentile(frameDeltas, 0.1);
    const overBudgetThresholdMs = estimatedFrameBudgetMs * 1.5;
    const overBudgetFrameCount = frameDeltas.filter(
      (duration) => duration > overBudgetThresholdMs,
    ).length;

    return {
      durationMs,
      estimatedFrameBudgetMs,
      frameMedianMs: percentile(frameDeltas, 0.5),
      frameP95Ms: percentile(frameDeltas, 0.95),
      frameMaxMs: Math.max(...frameDeltas),
      overBudgetFrameCount,
      overBudgetFrameRate: overBudgetFrameCount / frameDeltas.length,
      renderedCardMax: Math.max(...renderedCardCounts),
      scrollHeightDriftPx:
        Math.max(...scrollHeights) - Math.min(...scrollHeights),
    };
  }, { frameCount: SCROLL_FRAME_COUNT });

const writeBenchmarkResult = async (
  testInfo: TestInfo,
  page: Page,
  runs: BenchmarkRun[],
): Promise<void> => {
  const aggregate = {
    durationMs: round(median(runs.map((run) => run.durationMs))),
    frameMedianMs: round(median(runs.map((run) => run.frameMedianMs))),
    frameP95Ms: round(median(runs.map((run) => run.frameP95Ms))),
    frameMaxMs: round(median(runs.map((run) => run.frameMaxMs))),
    layoutCount: round(median(runs.map((run) => run.layoutCount))),
    layoutDurationMs: round(
      median(runs.map((run) => run.layoutDurationMs)),
    ),
    overBudgetFrameRate: round(
      median(runs.map((run) => run.overBudgetFrameRate)),
      4,
    ),
    recalcStyleDurationMs: round(
      median(runs.map((run) => run.recalcStyleDurationMs)),
    ),
    renderedCardMax: round(median(runs.map((run) => run.renderedCardMax))),
    scriptDurationMs: round(
      median(runs.map((run) => run.scriptDurationMs)),
    ),
    scrollHeightDriftPx: round(
      median(runs.map((run) => run.scrollHeightDriftPx)),
    ),
    taskDurationMs: round(median(runs.map((run) => run.taskDurationMs))),
  };
  const result = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    runtime: {
      userAgent: await page.evaluate(() => navigator.userAgent),
      viewport: VIEWPORT,
    },
    fixture: {
      assetCount: expectedFixtureAssetCount,
      scrollFrameCount: SCROLL_FRAME_COUNT,
      runCount: BENCHMARK_RUN_COUNT,
    },
    aggregate,
    runs: runs.map((run) =>
      Object.fromEntries(
        Object.entries(run).map(([key, value]) => [key, round(value)]),
      ),
    ),
  };
  const outputPath = testInfo.outputPath('performance-benchmark.json');
  await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  await testInfo.attach('performance-benchmark.json', {
    path: outputPath,
    contentType: 'application/json',
  });
  console.log(`[performance-benchmark] ${JSON.stringify(aggregate)}`);
};

test.skip(
  process.env.LUMABIN_PERF_BENCHMARK !== '1',
  'Performance benchmark runs only when LUMABIN_PERF_BENCHMARK=1.',
);

test.describe.configure({ mode: 'serial' });

let browser: Browser;
let page: Page;
let performanceSession: CDPSession;

test.beforeAll(async () => {
  const connected = await connectToAppPage();
  browser = connected.browser;
  page = connected.page;
  performanceSession = await page.context().newCDPSession(page);
  await performanceSession.send('Performance.enable');

  await page.setViewportSize(VIEWPORT);
  await expect(page.getByRole('heading', { name: 'LumaBin' })).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Gallery' }).click();
  await expect
    .poll(async () => page.locator('.gallery-card').count())
    .toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  await wait(1_000);
});

test.afterAll(async () => {
  if (performanceSession) {
    await performanceSession.detach();
  }
  if (browser) {
    await browser.close();
  }
});

test('performance benchmark measures dense gallery scroll', async (
  { browserName: _browserName },
  testInfo,
) => {
  void _browserName;
  expect(expectedFixtureAssetCount).toBe(2_000);

  await measureScroll(page);
  await wait(300);

  const runs: BenchmarkRun[] = [];
  for (let index = 0; index < BENCHMARK_RUN_COUNT; index += 1) {
    const before = await readCdpPerformanceMetrics(performanceSession);
    const sample = await measureScroll(page);
    const after = await readCdpPerformanceMetrics(performanceSession);
    runs.push({
      ...sample,
      layoutCount: delta(after, before, 'LayoutCount'),
      layoutDurationMs: delta(after, before, 'LayoutDuration') * 1_000,
      recalcStyleCount: delta(after, before, 'RecalcStyleCount'),
      recalcStyleDurationMs:
        delta(after, before, 'RecalcStyleDuration') * 1_000,
      scriptDurationMs: delta(after, before, 'ScriptDuration') * 1_000,
      taskDurationMs: delta(after, before, 'TaskDuration') * 1_000,
    });
    await wait(300);
  }

  await writeBenchmarkResult(testInfo, page, runs);
  expect(runs).toHaveLength(BENCHMARK_RUN_COUNT);
  expect(runs.every((run) => run.frameP95Ms > 0)).toBe(true);
  expect(runs.every((run) => run.renderedCardMax <= 100)).toBe(true);
  expect(runs.every((run) => run.scrollHeightDriftPx <= 1)).toBe(true);
});
