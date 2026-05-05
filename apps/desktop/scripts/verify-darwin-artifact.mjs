#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const expectedBundleId = process.env.LUMABIN_APP_BUNDLE_ID ?? 'com.satoooh.lumabin';
const enableMacSign = process.env.LUMABIN_ENABLE_MAC_SIGN === '1';
const packageManifest = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const evidencePath = path.join(projectRoot, 'out', 'make', 'release-evidence.json');
const verification = {
  zipIncludesAppAsar: false,
  zipIncludesIcon: false,
  extractedAppBundle: false,
  extractedAppAsar: false,
  extractedIcon: false,
  extractedExecutable: false,
  extractedInfoPlist: false,
  bundleMetadata: process.platform === 'darwin' ? false : 'skipped-non-darwin',
  codesign: process.platform === 'darwin' ? false : 'skipped-non-darwin',
  developerIdAuthority: enableMacSign ? false : 'not-required',
  hardenedRuntime: enableMacSign ? false : 'not-required',
  teamIdentifier: enableMacSign ? false : 'not-required',
  spctlAssess: enableMacSign ? false : 'not-required',
  staplerValidate: enableMacSign ? false : 'not-required',
};
const bundleMetadata = {
  bundleId: null,
  bundleName: null,
  shortVersion: null,
};
const signingMetadata = {
  authority: null,
  teamIdentifier: null,
  hardenedRuntime: null,
};

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
  return `${result.stdout || ''}${result.stderr || ''}`.trim();
};

const artifactDirectory = path.join(projectRoot, 'out', 'make', 'zip', 'darwin', 'arm64');
if (!existsSync(artifactDirectory)) {
  throw new Error(`artifact directory not found: ${artifactDirectory}`);
}

const zipFiles = readdirSync(artifactDirectory)
  .filter((entry) => entry.endsWith('.zip'))
  .map((entry) => path.join(artifactDirectory, entry))
  .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);

if (zipFiles.length === 0) {
  throw new Error(`no zip artifacts found under: ${artifactDirectory}`);
}

const latestZipPath = zipFiles[0];
const zipListing = runCapture('unzip', ['-l', latestZipPath]);
if (!zipListing.includes('LumaBin.app/Contents/Resources/app.asar')) {
  throw new Error(`missing app.asar in zip: ${latestZipPath}`);
}
verification.zipIncludesAppAsar = true;
if (!zipListing.includes('LumaBin.app/Contents/Resources/electron.icns')) {
  throw new Error(`missing electron.icns in zip: ${latestZipPath}`);
}
verification.zipIncludesIcon = true;

const extractRoot = mkdtempSync(path.join(tmpdir(), 'lumabin-artifact-'));
try {
  runCapture('unzip', ['-q', latestZipPath, '-d', extractRoot]);

  const appPath = path.join(extractRoot, 'LumaBin.app');
  if (!existsSync(appPath)) {
    throw new Error(`app bundle not found after unzip: ${appPath}`);
  }
  verification.extractedAppBundle = true;

  const appAsarPath = path.join(appPath, 'Contents', 'Resources', 'app.asar');
  if (!existsSync(appAsarPath)) {
    throw new Error(`missing app.asar after unzip: ${appAsarPath}`);
  }
  verification.extractedAppAsar = true;

  const iconPath = path.join(appPath, 'Contents', 'Resources', 'electron.icns');
  if (!existsSync(iconPath)) {
    throw new Error(`missing icon after unzip: ${iconPath}`);
  }
  verification.extractedIcon = true;

  const executablePath = path.join(appPath, 'Contents', 'MacOS', 'LumaBin');
  if (!existsSync(executablePath)) {
    throw new Error(`missing app executable after unzip: ${executablePath}`);
  }
  verification.extractedExecutable = true;

  const plistPath = path.join(appPath, 'Contents', 'Info.plist');
  if (!existsSync(plistPath)) {
    throw new Error(`missing Info.plist after unzip: ${plistPath}`);
  }
  verification.extractedInfoPlist = true;

  if (process.platform === 'darwin') {
    const bundleId = runCapture('plutil', ['-extract', 'CFBundleIdentifier', 'raw', '-o', '-', plistPath]);
    if (bundleId !== expectedBundleId) {
      throw new Error(`unexpected CFBundleIdentifier: ${bundleId}`);
    }
    bundleMetadata.bundleId = bundleId;

    const bundleName = runCapture('plutil', ['-extract', 'CFBundleName', 'raw', '-o', '-', plistPath]);
    if (bundleName !== 'LumaBin') {
      throw new Error(`unexpected CFBundleName: ${bundleName}`);
    }
    bundleMetadata.bundleName = bundleName;

    const shortVersion = runCapture('plutil', [
      '-extract',
      'CFBundleShortVersionString',
      'raw',
      '-o',
      '-',
      plistPath,
    ]);
    if (shortVersion !== packageManifest.version) {
      throw new Error(`unexpected CFBundleShortVersionString: ${shortVersion}`);
    }
    bundleMetadata.shortVersion = shortVersion;
    verification.bundleMetadata = true;

    runCapture('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath]);
    verification.codesign = true;
    if (enableMacSign) {
      const codesignDetails = runCapture('codesign', ['-dv', '--verbose=4', appPath]);
      const authority = codesignDetails
        .split('\n')
        .find((line) => line.startsWith('Authority=Developer ID Application:'));
      if (!authority) {
        throw new Error('signed release artifact is not signed with Developer ID Application authority');
      }
      signingMetadata.authority = authority.replace(/^Authority=/, '');
      verification.developerIdAuthority = true;
      if (!/\bflags=.*\bruntime\b/.test(codesignDetails)) {
        throw new Error('signed release artifact is missing hardened runtime');
      }
      signingMetadata.hardenedRuntime = true;
      verification.hardenedRuntime = true;
      const teamIdentifier = codesignDetails.match(/^TeamIdentifier=(.+)$/m)?.[1] ?? null;
      if (process.env.LUMABIN_APPLE_TEAM_ID && teamIdentifier !== process.env.LUMABIN_APPLE_TEAM_ID) {
        throw new Error(`signed release artifact TeamIdentifier does not match LUMABIN_APPLE_TEAM_ID`);
      }
      signingMetadata.teamIdentifier = teamIdentifier;
      verification.teamIdentifier = true;
      runCapture('spctl', ['--assess', '--type', 'execute', '--verbose', appPath]);
      verification.spctlAssess = true;
      runCapture('xcrun', ['stapler', 'validate', appPath]);
      verification.staplerValidate = true;
    }
  } else {
    console.warn('[verify-darwin-artifact] skip codesign verification on non-darwin platform');
  }
} finally {
  rmSync(extractRoot, { recursive: true, force: true });
}

const zipBuffer = readFileSync(latestZipPath);
const digest = createHash('sha256').update(zipBuffer).digest('hex');
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  app: {
    name: packageManifest.productName ?? 'LumaBin',
    packageName: packageManifest.name,
    version: packageManifest.version,
  },
  target: {
    platform: 'darwin',
    arch: 'arm64',
  },
  signing: {
    mode: enableMacSign ? 'signed' : 'unsigned-ad-hoc',
    bundleId: expectedBundleId,
    authority: signingMetadata.authority,
    teamIdentifier: signingMetadata.teamIdentifier,
    hardenedRuntime: signingMetadata.hardenedRuntime,
  },
  artifact: {
    path: path.relative(projectRoot, latestZipPath),
    fileName: path.basename(latestZipPath),
    sha256: digest,
  },
  bundle: bundleMetadata,
  verification,
  github: {
    runId: process.env.GITHUB_RUN_ID ?? null,
    sha: process.env.GITHUB_SHA ?? null,
    refName: process.env.GITHUB_REF_NAME ?? null,
  },
};
mkdirSync(path.dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log('');
console.log('Artifact verification passed.');
console.log(`Artifact: ${latestZipPath}`);
console.log(`SHA256 : ${digest}`);
console.log(`Evidence: ${evidencePath}`);
