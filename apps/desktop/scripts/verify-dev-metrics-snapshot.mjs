#!/usr/bin/env node

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

const optionValue = (name) => {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return null;
  }
  return process.argv[index + 1] ?? null;
};

const defaultSnapshotRoot = path.join(projectRoot, 'test-results');
const snapshotRoot = path.resolve(optionValue('--root') ?? defaultSnapshotRoot);

const fail = (message) => {
  console.error(`[verify-dev-metrics-snapshot] ${message}`);
  process.exit(1);
};

export const findSnapshotFiles = (root) => {
  if (!existsSync(root)) {
    return [];
  }

  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile() && entry.name === 'dev-metrics-snapshot.txt') {
        files.push(entryPath);
      }
    }
  };

  visit(root);
  return files.sort();
};

export const parseDevMetricsSnapshot = (content) => {
  const metrics = {};
  for (const line of content.split(/\r?\n/)) {
    const matched = line.match(/^([^:]+):\s*(.+)$/);
    if (!matched) {
      continue;
    }
    metrics[matched[1].trim()] = matched[2].trim();
  }
  return metrics;
};

const parseNonNegativeInteger = (metrics, label) => {
  const value = metrics[label];
  if (value === undefined) {
    throw new Error(`missing metric: ${label}`);
  }
  if (!/^\d+$/.test(value)) {
    throw new Error(`invalid integer metric ${label}: ${value}`);
  }
  return Number.parseInt(value, 10);
};

export const validateDevMetricsSnapshot = (content) => {
  const metrics = parseDevMetricsSnapshot(content);
  const listCalls = parseNonNegativeInteger(metrics, 'List calls');
  const failures = parseNonNegativeInteger(metrics, 'Failures');
  parseNonNegativeInteger(metrics, 'HEAD calls');
  parseNonNegativeInteger(metrics, 'GET calls');
  parseNonNegativeInteger(metrics, 'PUT calls');
  parseNonNegativeInteger(metrics, 'Downloaded bytes');
  parseNonNegativeInteger(metrics, 'Uploaded bytes');

  if (listCalls <= 0) {
    throw new Error('List calls must be greater than 0');
  }
  if (failures !== 0) {
    throw new Error(`Failures must be 0, got ${failures}`);
  }

  return {
    failures,
    listCalls,
  };
};

export const verifyDevMetricsSnapshots = (root) => {
  const snapshotFiles = findSnapshotFiles(root);
  if (snapshotFiles.length === 0) {
    throw new Error(`no dev-metrics-snapshot.txt files found under: ${root}`);
  }

  const verified = [];
  for (const snapshotFile of snapshotFiles) {
    const stats = statSync(snapshotFile);
    if (stats.size === 0) {
      throw new Error(`empty snapshot file: ${snapshotFile}`);
    }
    const result = validateDevMetricsSnapshot(readFileSync(snapshotFile, 'utf8'));
    verified.push({
      path: snapshotFile,
      ...result,
    });
  }
  return verified;
};

const isCliEntrypoint = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

if (isCliEntrypoint) {
  try {
    const verified = verifyDevMetricsSnapshots(snapshotRoot);
    for (const snapshot of verified) {
      console.log(
        `[verify-dev-metrics-snapshot] ${path.relative(projectRoot, snapshot.path)}: List calls=${snapshot.listCalls}, Failures=${snapshot.failures}`,
      );
    }
    console.log(`[verify-dev-metrics-snapshot] verified ${verified.length} snapshot file(s)`);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}
