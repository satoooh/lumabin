#!/usr/bin/env node

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

process.on('uncaughtException', (error) => {
  console.error(`[verify-public-snapshot-import] ${error.message}`);
  process.exit(1);
});

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(projectRoot, '..', '..');
const snapshotDir = path.join(repoRoot, 'out', 'public-snapshot');

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
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

const parseArgs = (argv) => {
  const options = {
    manifestPath: null,
    keep: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--keep') {
      options.keep = true;
      continue;
    }
    if (arg === '--manifest') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--manifest requires a value');
      }
      options.manifestPath = path.resolve(repoRoot, value);
      index += 1;
      continue;
    }
    if (arg.startsWith('--manifest=')) {
      options.manifestPath = path.resolve(repoRoot, arg.slice('--manifest='.length));
      continue;
    }
    throw new Error(`unknown option: ${arg}`);
  }

  return options;
};

const findLatestManifest = () => {
  if (!existsSync(snapshotDir)) {
    throw new Error(`public snapshot directory is missing: ${snapshotDir}`);
  }

  const candidates = readdirSync(snapshotDir)
    .filter((fileName) => /^lumabin-public-snapshot-[0-9a-f]+\.json$/.test(fileName))
    .map((fileName) => path.join(snapshotDir, fileName))
    .sort((left, right) => statSync(left).mtimeMs - statSync(right).mtimeMs);

  const latest = candidates.at(-1);
  if (!latest) {
    throw new Error('no LumaBin public snapshot manifest found; run npm run release:public-snapshot first');
  }
  return latest;
};

const collectGitDirectories = (basePath, currentPath = basePath) => {
  const matches = [];
  for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
    const absolutePath = path.join(currentPath, entry.name);
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name === '.git') {
      matches.push(path.relative(basePath, absolutePath));
      continue;
    }
    matches.push(...collectGitDirectories(basePath, absolutePath));
  }
  return matches;
};

const verifyImport = ({ manifestPath, keep }) => {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const archivePath = path.resolve(repoRoot, manifest.snapshot?.path ?? '');
  const rootDirectory = manifest.snapshot?.rootDirectory;

  if (!manifest.checks || manifest.checks.publicReadiness !== 'passed' || manifest.checks.archiveAudit !== 'passed') {
    throw new Error('snapshot manifest does not record passed public readiness and archive audit checks');
  }
  if (manifest.checks.includesGitHistory !== false || manifest.checks.includesGitDirectory !== false) {
    throw new Error('snapshot manifest does not explicitly exclude git history and git directory');
  }
  if (!rootDirectory) {
    throw new Error('snapshot manifest is missing snapshot.rootDirectory');
  }
  if (!existsSync(archivePath)) {
    throw new Error(`snapshot archive is missing: ${archivePath}`);
  }

  const importRoot = mkdtempSync(path.join(tmpdir(), 'lumabin-public-import-'));
  try {
    run('tar', ['-xzf', archivePath, '-C', importRoot]);
    const checkoutPath = path.join(importRoot, rootDirectory);
    if (!existsSync(checkoutPath)) {
      throw new Error(`snapshot root is missing after extraction: ${rootDirectory}`);
    }

    const nestedGitDirectories = collectGitDirectories(checkoutPath);
    if (nestedGitDirectories.length > 0) {
      throw new Error(`snapshot includes git metadata before import: ${nestedGitDirectories.join(', ')}`);
    }

    run('git', ['init', '--initial-branch=main'], { cwd: checkoutPath });
    run('git', ['add', '.'], { cwd: checkoutPath });
    run(
      'git',
      [
        '-c',
        'user.name=LumaBin Public Import Verifier',
        '-c',
        'user.email=public-import@example.invalid',
        'commit',
        '-m',
        'chore: initial public import',
      ],
      { cwd: checkoutPath },
    );

    const commitCount = run('git', ['rev-list', '--count', 'HEAD'], { cwd: checkoutPath });
    if (commitCount !== '1') {
      throw new Error(`expected a single initial import commit, got ${commitCount}`);
    }

    const status = run('git', ['status', '--short'], { cwd: checkoutPath });
    if (status) {
      throw new Error(`import repository is dirty after initial commit: ${status}`);
    }

    console.log('[verify-public-snapshot-import] public snapshot import verified');
    console.log(`Manifest: ${manifestPath}`);
    console.log(`Archive : ${archivePath}`);
    console.log(`Import  : ${keep ? checkoutPath : 'temporary checkout removed'}`);
  } finally {
    if (!keep) {
      rmSync(importRoot, { recursive: true, force: true });
    }
  }
};

const { manifestPath, keep } = parseArgs(process.argv.slice(2));
verifyImport({
  manifestPath: manifestPath ?? findLatestManifest(),
  keep,
});
