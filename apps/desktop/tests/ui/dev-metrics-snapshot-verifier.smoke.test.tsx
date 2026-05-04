import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  validateDevMetricsSnapshot,
  verifyDevMetricsSnapshots,
} from '../../scripts/verify-dev-metrics-snapshot.mjs';

const validSnapshot = [
  '# LumaBin Dev Metrics Snapshot',
  'Generated at: 2026-05-05T00:00:00.000Z',
  'Profile: E2E fixture / 1000 assets',
  'Collected at: 2026-05-05T00:00:00.000Z',
  'Preview cache hit rate: 0%',
  'HEAD cache hit rate: 0%',
  'Search cache hit rate: 0%',
  'List calls: 3',
  'HEAD calls: 2',
  'GET calls: 1',
  'PUT calls: 0',
  'Exists checks: 0',
  'Downloaded bytes: 42',
  'Uploaded bytes: 0',
  'Failures: 0',
].join('\n');

let tempRoot: string | null = null;

const makeTempRoot = () => {
  tempRoot = mkdtempSync(join(tmpdir(), 'lumabin-dev-metrics-'));
  return tempRoot;
};

describe('dev metrics snapshot verifier', () => {
  afterEach(() => {
    if (tempRoot) {
      rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = null;
    }
  });

  it('accepts dense fixture snapshots with list calls and zero failures', () => {
    expect(validateDevMetricsSnapshot(validSnapshot)).toEqual({
      failures: 0,
      listCalls: 3,
    });
  });

  it('rejects snapshots that cannot prove storage activity', () => {
    expect(() => validateDevMetricsSnapshot(validSnapshot.replace('List calls: 3', 'List calls: 0'))).toThrow(
      'List calls must be greater than 0',
    );
  });

  it('rejects snapshots with storage failures', () => {
    expect(() => validateDevMetricsSnapshot(validSnapshot.replace('Failures: 0', 'Failures: 1'))).toThrow(
      'Failures must be 0, got 1',
    );
  });

  it('finds nested Playwright snapshot files', () => {
    const root = makeTempRoot();
    const nested = join(root, 'dense-fixture', 'attachments');
    mkdirSync(nested, { recursive: true });
    writeFileSync(join(nested, 'dev-metrics-snapshot.txt'), validSnapshot);

    expect(verifyDevMetricsSnapshots(root)).toHaveLength(1);
  });
});
