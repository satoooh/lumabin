#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const shouldSkipBuild = process.argv.includes('--verify-only');

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (!shouldSkipBuild) {
  run('npm', ['run', 'smoke:ci']);
  run('npm', ['run', 'verify:mac-signing-readiness']);
  run('npm', ['run', 'package:darwin']);
}
if (shouldSkipBuild) {
  run('npm', ['run', 'verify:mac-signing-readiness']);
}
run('npm', ['run', 'verify:darwin-artifact']);
if (!shouldSkipBuild) {
  run('npm', ['run', 'release:launch-smoke']);
}
