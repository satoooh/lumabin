#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const artifactDirectory = path.join(projectRoot, 'out', 'make', 'zip', 'darwin', 'arm64');
const configuredCdpPort = process.env.LUMABIN_E2E_CDP_PORT
  ? Number(process.env.LUMABIN_E2E_CDP_PORT)
  : null;
const runId = process.env.LUMABIN_E2E_RUN_ID ?? `release-smoke-${Date.now()}`;
const startupLogPath = path.join(tmpdir(), `lumabin-e2e-startup-${runId}.log`);
const shouldUsePackagedApp = process.argv.includes('--app');
const shouldRunHeaded = process.argv.includes('--headed');
const testGrep = process.env.LUMABIN_E2E_TEST_GREP?.trim();
const appBundleId = process.env.LUMABIN_APP_BUNDLE_ID ?? 'com.satoooh.lumabin';
const cdpProbeTimeoutMs = 1_000;
const cdpReadyTimeoutMs = Number(process.env.LUMABIN_E2E_CDP_READY_TIMEOUT_MS ?? 60_000);

if (!Number.isFinite(cdpReadyTimeoutMs) || cdpReadyTimeoutMs <= 0) {
  throw new Error(`Invalid LUMABIN_E2E_CDP_READY_TIMEOUT_MS: ${process.env.LUMABIN_E2E_CDP_READY_TIMEOUT_MS}`);
}

if (configuredCdpPort !== null && (!Number.isInteger(configuredCdpPort) || configuredCdpPort <= 0)) {
  throw new Error(`Invalid LUMABIN_E2E_CDP_PORT: ${process.env.LUMABIN_E2E_CDP_PORT}`);
}

const findAvailableCdpPort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to resolve an available CDP port')));
        return;
      }
      server.close(() => resolve(address.port));
    });
  });

const cdpPort = configuredCdpPort ?? await findAvailableCdpPort();
const cdpHttpEndpoint = `http://127.0.0.1:${cdpPort}`;
const cdpVersionEndpoint = `${cdpHttpEndpoint}/json/version`;

const runCapture = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    throw new Error(stderr || `${command} ${args.join(' ')} failed`);
  }
  return (result.stdout || '').trim();
};

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const waitForHttpCdp = async () => {
  const deadline = Date.now() + cdpReadyTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(cdpVersionEndpoint, cdpProbeTimeoutMs);
      if (response.ok) {
        return cdpHttpEndpoint;
      }
    } catch {
      // Keep polling until the packaged app exposes the debugging endpoint.
    }
    await wait(250);
  }

  return null;
};

const waitForDevToolsEndpoint = async (endpointPromise) => {
  const detectedEndpoint = await Promise.race([
    endpointPromise,
    waitForHttpCdp(),
  ]);

  if (detectedEndpoint) {
    return detectedEndpoint;
  }

  if (existsSync(startupLogPath)) {
    console.warn(`[release-launch-smoke] startup log:\n${readFileSync(startupLogPath, 'utf8').trim()}`);
  }

  throw new Error(`Timed out waiting for packaged app CDP endpoint after ${cdpReadyTimeoutMs}ms: ${cdpVersionEndpoint}`);
};

const terminate = async (childProcess) => {
  if (!childProcess || childProcess.exitCode !== null) {
    return;
  }

  childProcess.kill('SIGTERM');
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    if (childProcess.exitCode !== null) {
      return;
    }
    await wait(100);
  }
  childProcess.kill('SIGKILL');
};

if (process.platform !== 'darwin') {
  console.log('[release-launch-smoke] skipped: packaged macOS launch smoke requires darwin');
  process.exit(0);
}

const findLatestZip = () => {
  if (!existsSync(artifactDirectory)) {
    throw new Error(`artifact directory not found: ${artifactDirectory}`);
  }

  const zipFiles = readdirSync(artifactDirectory)
    .filter((entry) => entry.endsWith('.zip'))
    .map((entry) => path.join(artifactDirectory, entry))
    .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);

  const latestZipPath = zipFiles[0];
  if (!latestZipPath) {
    throw new Error(`no zip artifacts found under: ${artifactDirectory}`);
  }
  return latestZipPath;
};

const findLatestPackagedApp = () => {
  const outDirectory = path.join(projectRoot, 'out');
  if (!existsSync(outDirectory)) {
    throw new Error(`package output directory not found: ${outDirectory}`);
  }

  const packagedDirectories = readdirSync(outDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.endsWith('-darwin-arm64'))
    .map((entry) => path.join(outDirectory, entry.name))
    .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);

  for (const packagedDirectory of packagedDirectories) {
    const appCandidates = readdirSync(packagedDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.endsWith('.app'))
      .map((entry) => path.join(packagedDirectory, entry.name))
      .sort();
    const appPath = appCandidates.at(-1);
    if (appPath) {
      return appPath;
    }
  }

  throw new Error(`packaged app bundle not found under: ${outDirectory}`);
};

const extractRoot = shouldUsePackagedApp ? null : mkdtempSync(path.join(tmpdir(), 'lumabin-launch-smoke-'));
let appProcess;
let exitCode = 0;

try {
  let appPath;
  if (shouldUsePackagedApp) {
    appPath = findLatestPackagedApp();
  } else {
    const latestZipPath = findLatestZip();
    runCapture('unzip', ['-q', latestZipPath, '-d', extractRoot]);
    appPath = path.join(extractRoot, 'LumaBin.app');
    console.log(`[release-launch-smoke] extracted ${latestZipPath}`);
  }

  const executablePath = path.join(appPath, 'Contents', 'MacOS', 'LumaBin');
  if (!existsSync(executablePath)) {
    throw new Error(`packaged app executable not found: ${executablePath}`);
  }

  console.log(`[release-launch-smoke] launching ${appPath}`);
  let detectedDevToolsEndpoint = null;
  let appOutputBuffer = '';
  let resolveDetectedDevToolsEndpoint;
  const detectedDevToolsEndpointPromise = new Promise((resolve) => {
    resolveDetectedDevToolsEndpoint = resolve;
  });
  const observeAppOutput = (chunk, stream) => {
    stream.write(chunk);
    appOutputBuffer = `${appOutputBuffer}${chunk.toString('utf8')}`.slice(-2_000);
    const matched = appOutputBuffer.match(/DevTools listening on (ws:\/\/\S+)/);
    if (matched && !detectedDevToolsEndpoint) {
      detectedDevToolsEndpoint = matched[1];
      resolveDetectedDevToolsEndpoint(detectedDevToolsEndpoint);
    }
  };
  const launchArguments = [
    '--use-mock-keychain',
    `--remote-debugging-port=${cdpPort}`,
    '--lumabin-e2e',
    '--lumabin-e2e-fixture',
    `--lumabin-e2e-run-id=${runId}`,
  ];
  const launchEnvironment = {
    LUMABIN_E2E: '1',
    LUMABIN_E2E_CDP_PORT: String(cdpPort),
    LUMABIN_E2E_FIXTURE: '1',
    LUMABIN_E2E_RUN_ID: runId,
    LUMABIN_E2E_STARTUP_LOG: startupLogPath,
    ...(process.env.LUMABIN_E2E_FIXTURE_ASSET_COUNT
      ? { LUMABIN_E2E_FIXTURE_ASSET_COUNT: process.env.LUMABIN_E2E_FIXTURE_ASSET_COUNT }
      : {}),
    ...(process.env.LUMABIN_E2E_DENSE ? { LUMABIN_E2E_DENSE: process.env.LUMABIN_E2E_DENSE } : {}),
  };
  appProcess = spawn(
    executablePath,
    launchArguments,
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        ...launchEnvironment,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  appProcess.stdout.on('data', (chunk) => observeAppOutput(chunk, process.stdout));
  appProcess.stderr.on('data', (chunk) => observeAppOutput(chunk, process.stderr));

  const appLaunchRejectedPromise = new Promise((_, reject) => {
    appProcess.once('exit', (code, signal) => {
      reject(new Error(`Packaged app exited before exposing CDP: code=${code ?? 'null'} signal=${signal ?? 'null'}`));
    });
  });
  const cdpEndpoint = await waitForDevToolsEndpoint(Promise.race([detectedDevToolsEndpointPromise, appLaunchRejectedPromise]));

  const testResult = spawnSync(
    'npx',
    [
      'playwright',
      'test',
      '--config',
      'playwright.e2e.config.ts',
      ...(testGrep ? ['--grep', testGrep] : []),
      ...(shouldRunHeaded ? ['--headed'] : []),
    ],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        LUMABIN_E2E_ATTACH: '1',
        LUMABIN_E2E_CDP_ENDPOINT: cdpEndpoint,
        LUMABIN_E2E_CDP_PORT: String(cdpPort),
        LUMABIN_E2E_RUN_ID: runId,
      },
      stdio: 'inherit',
    },
  );

  exitCode = testResult.status ?? 1;

  if (exitCode === 0) {
    console.log('[release-launch-smoke] packaged app launch smoke passed');
  }
} finally {
  try {
    runCapture('osascript', ['-e', `tell application id "${appBundleId}" to quit`]);
  } catch (error) {
    console.warn(`[release-launch-smoke] packaged app quit request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  await terminate(appProcess);
  if (extractRoot) {
    rmSync(extractRoot, { recursive: true, force: true });
  }
}

process.exit(exitCode);
