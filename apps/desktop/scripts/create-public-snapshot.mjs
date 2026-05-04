#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { collectTrackedFileIssues } from './audit-public-readiness.mjs';

process.on('uncaughtException', (error) => {
  console.error(`[create-public-snapshot] ${error.message}`);
  process.exit(1);
});

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(projectRoot, '..', '..');
const outputDir = path.join(repoRoot, 'out', 'public-snapshot');
const isCliEntrypoint = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

export const normalizeSnapshotSlug = (slug) => {
  const normalized = String(slug ?? '').trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    throw new Error('snapshot slug must use lowercase letters, numbers, and single hyphens only');
  }
  return normalized;
};

export const parseSnapshotArgs = (argv) => {
  const options = {
    allowDirty: false,
    slug: 'lumabin',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--allow-dirty') {
      options.allowDirty = true;
      continue;
    }

    if (arg === '--slug') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--slug requires a value');
      }
      options.slug = normalizeSnapshotSlug(value);
      index += 1;
      continue;
    }

    if (arg.startsWith('--slug=')) {
      options.slug = normalizeSnapshotSlug(arg.slice('--slug='.length));
      continue;
    }

    throw new Error(`unknown option: ${arg}`);
  }

  options.slug = normalizeSnapshotSlug(options.slug);
  return options;
};

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

const runInDesktop = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
};

const collectFiles = (basePath, currentPath = basePath) => {
  const files = [];
  for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
    const absolutePath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(basePath, absolutePath));
      continue;
    }
    if (entry.isFile()) {
      files.push(path.relative(basePath, absolutePath));
    }
  }
  return files;
};

const verifyArchive = ({ archivePath, shortSha, snapshotSlug }) => {
  const extractRoot = mkdtempSync(path.join(tmpdir(), 'lumabin-public-snapshot-'));
  try {
    run('tar', ['-xzf', archivePath, '-C', extractRoot]);
    const snapshotRoot = path.join(extractRoot, `${snapshotSlug}-${shortSha}`);
    if (!existsSync(snapshotRoot)) {
      throw new Error(`snapshot root is missing after extraction: ${snapshotSlug}-${shortSha}`);
    }

    const archivedFiles = collectFiles(snapshotRoot);
    const gitMetadata = archivedFiles.find((relativePath) => relativePath === '.git' || relativePath.startsWith('.git/'));
    if (gitMetadata) {
      throw new Error(`snapshot archive includes git metadata: ${gitMetadata}`);
    }

    const issues = collectTrackedFileIssues({
      basePath: snapshotRoot,
      trackedFiles: archivedFiles,
      fileExists: existsSync,
      readTextFile: readFileSync,
      getFileStats: statSync,
    });
    if (issues.length > 0) {
      throw new Error(`snapshot archive failed public readiness audit: ${issues.join('; ')}`);
    }
  } finally {
    rmSync(extractRoot, { recursive: true, force: true });
  }
};

const main = () => {
  const { allowDirty, slug } = parseSnapshotArgs(process.argv.slice(2));
  const status = run('git', ['status', '--porcelain']);
  if (status && !allowDirty) {
    throw new Error('working tree is dirty; commit or stash changes before creating a public snapshot');
  }

  runInDesktop('npm', ['run', 'audit:public-readiness']);

  const shortSha = run('git', ['rev-parse', '--short=12', 'HEAD']);
  const branch = run('git', ['branch', '--show-current']) || 'detached';
  const archiveName = `${slug}-public-snapshot-${shortSha}.tar.gz`;
  const archivePath = path.join(outputDir, archiveName);
  const manifestPath = path.join(outputDir, `${slug}-public-snapshot-${shortSha}.json`);

  mkdirSync(outputDir, { recursive: true });

  run('git', [
    'archive',
    '--format=tar.gz',
    `--prefix=${slug}-${shortSha}/`,
    '--output',
    archivePath,
    'HEAD',
  ]);

  if (!existsSync(archivePath)) {
    throw new Error(`snapshot archive was not created: ${archivePath}`);
  }

  verifyArchive({ archivePath, shortSha, snapshotSlug: slug });

  const sha256 = createHash('sha256').update(readFileSync(archivePath)).digest('hex');
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      repository: 'satoooh/lumabin',
      branch,
      commit: run('git', ['rev-parse', 'HEAD']),
      dirty: Boolean(status),
    },
    snapshot: {
      slug,
      rootDirectory: `${slug}-${shortSha}`,
      path: path.relative(repoRoot, archivePath),
      fileName: archiveName,
      sha256,
    },
    checks: {
      publicReadiness: 'passed',
      archiveAudit: 'passed',
      includesGitHistory: false,
      includesGitDirectory: false,
    },
  };

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('[create-public-snapshot] snapshot created');
  console.log(`Archive : ${archivePath}`);
  console.log(`SHA256  : ${sha256}`);
  console.log(`Manifest: ${manifestPath}`);
};

if (isCliEntrypoint) {
  main();
}
