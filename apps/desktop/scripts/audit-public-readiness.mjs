#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(projectRoot, '..', '..');
const shouldAuditHistory = process.argv.includes('--history');
const isCliEntrypoint = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

const fail = (message) => {
  console.error(`[audit-public-readiness] ${message}`);
  process.exit(1);
};

const runGit = (args) => {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    fail((result.stderr || '').trim() || `git ${args.join(' ')} failed`);
  }
  return result.stdout;
};

const runGitAllowNoMatch = (args) => {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0 && result.status !== 1) {
    fail((result.stderr || '').trim() || `git ${args.join(' ')} failed`);
  }
  return result.stdout;
};

export const requiredFiles = [
  '.gitignore',
  'LICENSE',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SUPPORT.md',
];
export const binaryExtensions = new Set([
  '.avif',
  '.gif',
  '.icns',
  '.ico',
  '.jpeg',
  '.jpg',
  '.mov',
  '.mp4',
  '.pdf',
  '.png',
  '.webp',
]);
export const blockedTrackedPathRules = [
  {
    name: 'local-env-file',
    pattern: /(^|\/)\.env(\.|$)/i,
  },
  {
    name: 'private-key-or-certificate',
    pattern: /\.(pem|key|p12|p8|mobileprovision)$/i,
  },
  {
    name: 'local-database',
    pattern: /\.(sqlite|sqlite3|db)$/i,
  },
  {
    name: 'packaged-release-artifact',
    pattern: /\.(zip|dmg|asar|pkg)$/i,
  },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const literalPattern = (...parts) => new RegExp(`\\b${escapeRegExp(parts.join(''))}\\b`, 'g');
const literalHistoryPattern = (...parts) => escapeRegExp(parts.join(''));

export const contentRules = [
  {
    name: 'aws-access-key-id',
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
    historyPattern: '(AKIA|ASIA)[0-9A-Z]{16}',
  },
  {
    name: 'github-token',
    pattern: /\b(?:github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9_]{20,})\b/g,
    historyPattern: '(github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9_]{20,})',
  },
  {
    name: 'npm-token',
    pattern: /\bnpm_[A-Za-z0-9]{20,}\b/g,
    historyPattern: 'npm_[A-Za-z0-9]{20,}',
  },
  {
    name: 'slack-token',
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
    historyPattern: 'xox[baprs]-[A-Za-z0-9-]{10,}',
  },
  {
    name: 'private-key-block',
    pattern: /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/g,
    historyPattern: '-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----',
  },
  {
    name: 'private-profile-name',
    pattern: literalPattern('private', '-r2-', 'profile'),
    historyPattern: literalHistoryPattern('private', '-r2-', 'profile'),
  },
  {
    name: 'private-image-host',
    pattern: literalPattern('assets.', 'private.', 'example.invalid'),
    historyPattern: literalHistoryPattern('assets.', 'private.', 'example.invalid'),
  },
  {
    name: 'private-email',
    pattern: literalPattern('private-user', '@', 'example.invalid'),
    historyPattern: literalHistoryPattern('private-user', '@', 'example.invalid'),
  },
  {
    name: 'private-object-key-hint',
    pattern: new RegExp(`\\b${['real', 'object', 'key', 'hint'].join('-')}-\\d+\\b`, 'g'),
    historyPattern: `${['real', 'object', 'key', 'hint'].join('-')}[\\-][0-9]+`,
  },
];
export const collectRequiredFileIssues = (fileExists) => {
  const issues = [];
  for (const requiredFile of requiredFiles) {
    if (!fileExists(requiredFile)) {
      issues.push(`${requiredFile}: missing required public repository hygiene file`);
    }
  }
  return issues;
};

export const collectTrackedPathIssues = (relativePath) => {
  const issues = [];
  for (const rule of blockedTrackedPathRules) {
    if (rule.pattern.test(relativePath)) {
      issues.push(`${relativePath}: blocked tracked path (${rule.name})`);
    }
  }
  return issues;
};

export const collectContentIssues = (relativePath, content) => {
  const issues = [];
  for (const rule of contentRules) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(content)) {
      issues.push(`${relativePath}: blocked content pattern (${rule.name})`);
    }
  }
  return issues;
};

export const collectTrackedFileIssues = ({ basePath, trackedFiles, fileExists, readTextFile, getFileStats }) => {
  const issues = [
    ...collectRequiredFileIssues((requiredFile) => fileExists(path.join(basePath, requiredFile))),
  ];

  for (const relativePath of trackedFiles) {
    issues.push(...collectTrackedPathIssues(relativePath));

    const absolutePath = path.join(basePath, relativePath);
    const extension = path.extname(relativePath).toLowerCase();
    if (binaryExtensions.has(extension)) {
      continue;
    }
    if (!fileExists(absolutePath)) {
      continue;
    }

    const fileStats = getFileStats(absolutePath);
    if (fileStats.size > 1_000_000) {
      continue;
    }

    let content;
    try {
      content = readTextFile(absolutePath, 'utf8');
    } catch {
      continue;
    }

    issues.push(...collectContentIssues(relativePath, content));
  }

  return issues;
};

const auditTrackedFiles = () => {
  const trackedFiles = runGit(['ls-files', '-z']).split('\0').filter(Boolean);
  const issues = collectTrackedFileIssues({
    basePath: repoRoot,
    trackedFiles,
    fileExists: existsSync,
    readTextFile: readFileSync,
    getFileStats: statSync,
  });

  if (issues.length > 0) {
    console.error('[audit-public-readiness] public readiness audit failed:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log('[audit-public-readiness] tracked files passed public readiness audit');
};

const auditHistory = () => {
  const commits = runGit(['rev-list', '--all']).trim().split('\n').filter(Boolean);
  const historyIssues = new Map();

  const recordHistoryIssue = ({ filePath, commit, ruleName }) => {
    const key = `${filePath}: historical blocked content pattern (${ruleName})`;
    const issue = historyIssues.get(key) ?? {
      count: 0,
      commits: [],
    };
    issue.count += 1;
    const shortCommit = commit.slice(0, 12);
    if (issue.commits.length < 5 && !issue.commits.includes(shortCommit)) {
      issue.commits.push(shortCommit);
    }
    historyIssues.set(key, issue);
  };

  for (const rule of contentRules) {
    const grepOutput = runGitAllowNoMatch([
      'grep',
      '-I',
      '-l',
      '-E',
      '-e',
      rule.historyPattern,
      ...commits,
      '--',
    ]);
    const matchedFiles = grepOutput.trim().split('\n').filter(Boolean);
    for (const matchedFile of matchedFiles) {
      const separatorIndex = matchedFile.indexOf(':');
      const commit = separatorIndex === -1 ? 'unknown' : matchedFile.slice(0, separatorIndex);
      const filePath = separatorIndex === -1 ? matchedFile : matchedFile.slice(separatorIndex + 1);
      recordHistoryIssue({ filePath, commit, ruleName: rule.name });
    }
  }

  if (historyIssues.size > 0) {
    console.error('[audit-public-readiness] public history audit failed:');
    for (const [issue, metadata] of [...historyIssues.entries()].sort(([left], [right]) => left.localeCompare(right))) {
      console.error(`- ${issue}; commits=${metadata.count}; samples=${metadata.commits.join(', ')}`);
    }
    console.error('[audit-public-readiness] rewrite/squash history before making the full repository public');
    process.exit(1);
  }

  console.log('[audit-public-readiness] git history passed public readiness audit');
};

if (isCliEntrypoint) {
  auditTrackedFiles();
  if (shouldAuditHistory) {
    auditHistory();
  }
}
