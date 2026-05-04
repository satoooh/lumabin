import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const REPOSITORY_ROOT = join(process.cwd(), '../..');

const indexOfRequired = (source: string, pattern: string): number => {
  const index = source.indexOf(pattern);
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
};

describe('release workflow gates', () => {
  it('keeps signing readiness before macOS packaging in CI and release workflows', () => {
    const ciWorkflow = readFileSync(join(REPOSITORY_ROOT, '.github/workflows/desktop-ci.yml'), 'utf8');
    const releaseWorkflow = readFileSync(
      join(REPOSITORY_ROOT, '.github/workflows/desktop-release.yml'),
      'utf8',
    );
    const e2eWorkflow = readFileSync(
      join(REPOSITORY_ROOT, '.github/workflows/desktop-e2e.yml'),
      'utf8',
    );
    const releasePreflight = readFileSync(join(process.cwd(), 'scripts/release-preflight.mjs'), 'utf8');
    const releaseLaunchSmoke = readFileSync(join(process.cwd(), 'scripts/release-launch-smoke.mjs'), 'utf8');
    const publicSnapshot = readFileSync(join(process.cwd(), 'scripts/create-public-snapshot.mjs'), 'utf8');
    const publicSnapshotImportVerifier = readFileSync(
      join(process.cwd(), 'scripts/verify-public-snapshot-import.mjs'),
      'utf8',
    );
    const artifactVerifier = readFileSync(join(process.cwd(), 'scripts/verify-darwin-artifact.mjs'), 'utf8');
    const packageJson = readFileSync(join(process.cwd(), 'package.json'), 'utf8');

    expect(indexOfRequired(ciWorkflow, 'run: npm run verify:mac-signing-readiness')).toBeLessThan(
      indexOfRequired(ciWorkflow, 'run: npm run package:darwin'),
    );
    expect(indexOfRequired(releaseWorkflow, 'run: npm run verify:mac-signing-readiness')).toBeLessThan(
      indexOfRequired(releaseWorkflow, 'run: npm run package:darwin'),
    );
    expect(indexOfRequired(releasePreflight, "run('npm', ['run', 'verify:mac-signing-readiness']);")).toBeLessThan(
      indexOfRequired(releasePreflight, "run('npm', ['run', 'package:darwin']);"),
    );
    expect(releaseWorkflow).toContain('SIGNING_MODE: ${{ steps.signing.outputs.mode }}');
    expect(releaseWorkflow).toContain('Signing mode: %s');
    expect(releaseWorkflow).toContain('release-evidence.json');
    expect(releaseLaunchSmoke).toContain("import { createServer } from 'node:net';");
    expect(releaseLaunchSmoke).toContain('process.env.LUMABIN_E2E_CDP_PORT');
    expect(releaseLaunchSmoke).toContain('findAvailableCdpPort');
    expect(releaseLaunchSmoke).toContain('LUMABIN_E2E_CDP_PORT: String(cdpPort)');
    expect(packageJson).toContain('"e2e": "npm run package:darwin && node ./scripts/release-launch-smoke.mjs --app"');
    expect(packageJson).toContain('"e2e:dense": "npm run package:darwin && LUMABIN_E2E_DENSE=1');
    expect(packageJson).toContain('"e2e:prelaunch": "npm run package:darwin && open out/LumaBin-darwin-arm64/LumaBin.app');
    expect(packageJson).toContain('"release:public-snapshot": "node ./scripts/create-public-snapshot.mjs"');
    expect(packageJson).toContain('"verify:public-snapshot-import": "node ./scripts/verify-public-snapshot-import.mjs"');
    expect(publicSnapshot).toContain("runInDesktop('npm', ['run', 'audit:public-readiness']);");
    expect(publicSnapshot).toContain("run('git', [");
    expect(publicSnapshot).toContain("'archive',");
    expect(publicSnapshot).toContain('verifyArchive({ archivePath, shortSha, snapshotSlug: slug });');
    expect(publicSnapshot).toContain("archiveAudit: 'passed'");
    expect(publicSnapshot).toContain('includesGitHistory: false');
    expect(publicSnapshot).toContain("slug: 'lumabin'");
    expect(publicSnapshot).toContain('rootDirectory: `${slug}-${shortSha}`');
    expect(publicSnapshotImportVerifier).toContain("run('tar', ['-xzf', archivePath, '-C', importRoot]);");
    expect(publicSnapshotImportVerifier).toContain("run('git', ['init', '--initial-branch=main']");
    expect(publicSnapshotImportVerifier).toContain("run('git', ['add', '.']");
    expect(publicSnapshotImportVerifier).toContain("'chore: initial public import'");
    expect(publicSnapshotImportVerifier).toContain("run('git', ['rev-list', '--count', 'HEAD']");
    expect(artifactVerifier).toContain("path.join(projectRoot, 'out', 'make', 'release-evidence.json')");
    expect(artifactVerifier).toContain('artifact: {');
    expect(artifactVerifier).toContain('verification,');
    expect(indexOfRequired(e2eWorkflow, 'run: npm run e2e:dense')).toBeLessThan(
      indexOfRequired(e2eWorkflow, 'path: apps/desktop/test-results/**/dev-metrics-snapshot.txt'),
    );
    expect(e2eWorkflow).toContain('name: desktop-e2e-metrics-${{ github.run_id }}');
    expect(e2eWorkflow).toContain('retention-days: 30');
  });
});
