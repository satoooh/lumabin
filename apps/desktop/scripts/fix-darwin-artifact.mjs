#!/usr/bin/env node

import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status ?? 1}`);
  }
};

if (process.platform !== 'darwin') {
  console.log('[fix-darwin-artifact] skipped: non-darwin platform');
  process.exit(0);
}

const desktopRoot = process.cwd();
const packagedDir = path.resolve(desktopRoot, 'out');
const zipDir = path.resolve(desktopRoot, 'out/make/zip/darwin/arm64');
const entitlementsPath = path.resolve(desktopRoot, 'build/entitlements.darwin.plist');
const enableMacSign = process.env.LUMABIN_ENABLE_MAC_SIGN === '1';

const packagedCandidates = readdirSync(packagedDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.endsWith('-darwin-arm64'))
  .map((entry) => path.resolve(packagedDir, entry.name))
  .sort();
const latestPackagedDir = packagedCandidates.at(-1);
if (!latestPackagedDir) {
  throw new Error(`packaged app directory not found under: ${packagedDir}`);
}

const appCandidates = readdirSync(latestPackagedDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.endsWith('.app'))
  .map((entry) => path.resolve(latestPackagedDir, entry.name))
  .sort();
const appPath = appCandidates.at(-1);

const zipCandidates = readdirSync(zipDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.zip'))
  .map((entry) => path.resolve(zipDir, entry.name))
  .sort();
const zipPath = zipCandidates.at(-1);

if (!appPath) {
  throw new Error(`app bundle not found under: ${latestPackagedDir}`);
}
if (!zipPath) {
  throw new Error(`zip artifact not found under: ${zipDir}`);
}

if (!existsSync(appPath)) {
  throw new Error(`app bundle not found: ${appPath}`);
}
if (!existsSync(zipPath)) {
  throw new Error(`zip artifact not found: ${zipPath}`);
}

if (enableMacSign) {
  console.log('[fix-darwin-artifact] skipped: signed release mode keeps Forge Developer ID signature/notarization output');
  process.exit(0);
}

console.log('[fix-darwin-artifact] re-signing app bundle with ad-hoc identity');
run('codesign', [
  '--force',
  '--deep',
  '--options',
  'runtime',
  '--entitlements',
  entitlementsPath,
  '--sign',
  '-',
  appPath,
]);

console.log('[fix-darwin-artifact] verifying signature');
run('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath]);

console.log('[fix-darwin-artifact] rebuilding zip from signed app bundle');
rmSync(zipPath, { force: true });
run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appPath, zipPath]);

console.log('[fix-darwin-artifact] done');
