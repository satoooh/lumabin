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
    const releaseEvidenceValidator = readFileSync(
      join(process.cwd(), 'scripts/validate-release-evidence.mjs'),
      'utf8',
    );
    const releaseEvidencePolicy = readFileSync(
      join(process.cwd(), 'scripts/release-evidence-policy.mjs'),
      'utf8',
    );
    const devMetricsSnapshotVerifier = readFileSync(
      join(process.cwd(), 'scripts/verify-dev-metrics-snapshot.mjs'),
      'utf8',
    );
    const signingReadinessVerifier = readFileSync(
      join(process.cwd(), 'scripts/verify-mac-signing-readiness.mjs'),
      'utf8',
    );
    const mainProcess = readFileSync(join(process.cwd(), 'src/main.ts'), 'utf8');
    const e2eRuntime = readFileSync(join(process.cwd(), 'src/main/e2e-runtime.ts'), 'utf8');
    const forgeConfig = readFileSync(join(process.cwd(), 'forge.config.ts'), 'utf8');
    const packageJson = readFileSync(join(process.cwd(), 'package.json'), 'utf8');

    expect(indexOfRequired(ciWorkflow, 'run: npm run verify:mac-signing-readiness')).toBeLessThan(
      indexOfRequired(ciWorkflow, 'run: npm run package:darwin'),
    );
    expect(indexOfRequired(releaseWorkflow, 'run: npm run verify:mac-signing-readiness')).toBeLessThan(
      indexOfRequired(releaseWorkflow, 'run: npm run package:darwin'),
    );
    expect(releaseWorkflow).toContain('fetch-depth: 0');
    expect(releaseWorkflow).toContain('Verify release ref provenance');
    expect(releaseWorkflow).toContain('git fetch --no-tags origin main:refs/remotes/origin/main');
    expect(releaseWorkflow).toContain('git merge-base --is-ancestor "${GITHUB_SHA}" origin/main');
    expect(indexOfRequired(releaseWorkflow, 'Verify release ref provenance')).toBeLessThan(
      indexOfRequired(releaseWorkflow, 'run: npm run smoke:ci'),
    );
    expect(indexOfRequired(releasePreflight, "run('npm', ['run', 'verify:mac-signing-readiness']);")).toBeLessThan(
      indexOfRequired(releasePreflight, "run('npm', ['run', 'package:darwin']);"),
    );
    expect(releaseWorkflow).toContain('SIGNING_MODE: ${{ steps.signing.outputs.mode }}');
    expect(releaseWorkflow).toContain(
      'for key in LUMABIN_APPLE_SIGN_IDENTITY LUMABIN_APPLE_ID LUMABIN_APPLE_ID_PASSWORD LUMABIN_APPLE_TEAM_ID LUMABIN_APPLE_CERTIFICATE_BASE64 LUMABIN_APPLE_CERTIFICATE_PASSWORD; do',
    );
    expect(indexOfRequired(releaseWorkflow, 'Import Apple Developer ID certificate')).toBeLessThan(
      indexOfRequired(releaseWorkflow, 'run: npm run verify:mac-signing-readiness'),
    );
    expect(releaseWorkflow).toContain('LUMABIN_APPLE_CERTIFICATE_BASE64: ${{ secrets.LUMABIN_APPLE_CERTIFICATE_BASE64 }}');
    expect(releaseWorkflow).toContain('LUMABIN_APPLE_CERTIFICATE_PASSWORD: ${{ secrets.LUMABIN_APPLE_CERTIFICATE_PASSWORD }}');
    expect(releaseWorkflow).toContain('base64 --decode > "${CERTIFICATE_PATH}"');
    expect(releaseWorkflow).toContain('security import "${CERTIFICATE_PATH}"');
    expect(releaseWorkflow).toContain('security set-key-partition-list');
    expect(releaseWorkflow).toContain('Clean up Apple signing keychain');
    expect(signingReadinessVerifier).toContain("'LUMABIN_APPLE_SIGN_IDENTITY'");
    expect(signingReadinessVerifier).toContain("'LUMABIN_APPLE_CERTIFICATE_BASE64'");
    expect(signingReadinessVerifier).toContain("'LUMABIN_APPLE_CERTIFICATE_PASSWORD'");
    expect(signingReadinessVerifier).toContain("execFileSync('/usr/bin/security', ['find-identity', '-p', 'codesigning', '-v']");
    expect(signingReadinessVerifier).toContain('Developer ID signing identity is available');
    expect(signingReadinessVerifier).toContain('Developer ID certificate import inputs are configured');
    expect(forgeConfig).toContain('const notarizeCredentials =');
    expect(forgeConfig).toContain('osxNotarize:');
    expect(forgeConfig).toContain('enableMacSign && appleId && appleIdPassword && appleTeamId');
    expect(forgeConfig).toContain('osxNotarize: notarizeCredentials');
    expect(forgeConfig).toContain('teamId: appleTeamId');
    expect(forgeConfig).toContain('vitePackageRuntimeAllowlist');
    expect(forgeConfig).toContain("filePath.startsWith('/node_modules')");
    expect(releaseWorkflow).toContain('Signing mode: %s');
    expect(releaseWorkflow).toContain('release-evidence.json');
    expect(releaseLaunchSmoke).toContain("import { createServer } from 'node:net';");
    expect(releaseLaunchSmoke).toContain('process.env.LUMABIN_E2E_CDP_PORT');
    expect(releaseLaunchSmoke).toContain('findAvailableCdpPort');
    expect(releaseLaunchSmoke).toContain('spawn(');
    expect(releaseLaunchSmoke).toContain('executablePath,');
    expect(releaseLaunchSmoke).not.toContain("spawn('open'");
    expect(releaseLaunchSmoke).toContain('Packaged app exited before exposing CDP');
    expect(releaseLaunchSmoke).toContain('LUMABIN_E2E_CDP_PORT: String(cdpPort)');
    expect(mainProcess).toContain("app.commandLine.appendSwitch('remote-debugging-port', e2eRemoteDebuggingPort);");
    expect(e2eRuntime).toContain('export const e2eRemoteDebuggingPort');
    expect(e2eRuntime).toContain('process.env.LUMABIN_E2E_CDP_PORT');
    expect(e2eRuntime).toContain("argvValue('--remote-debugging-port=')");
    expect(packageJson).toContain('"e2e": "npm run package:darwin && node ./scripts/release-launch-smoke.mjs --app"');
    expect(packageJson).toContain('"e2e:dense": "npm run package:darwin && LUMABIN_E2E_DENSE=1');
    expect(packageJson).toContain('"verify:dev-metrics-snapshot": "node ./scripts/verify-dev-metrics-snapshot.mjs"');
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
    expect(artifactVerifier).toContain('signed release artifact is missing hardened runtime');
    expect(artifactVerifier).toContain('hardenedRuntime: enableMacSign ? false :');
    expect(artifactVerifier).toContain('authority: signingMetadata.authority');
    expect(artifactVerifier).toContain('teamIdentifier: signingMetadata.teamIdentifier');
    expect(artifactVerifier).toContain('hardenedRuntime: signingMetadata.hardenedRuntime');
    expect(artifactVerifier).toContain('verification,');
    expect(artifactVerifier).toContain('validateReleaseEvidence(evidence);');
    expect(artifactVerifier).toContain('validateReleaseEvidenceArtifact({ evidence, projectRoot });');
    expect(releaseEvidenceValidator).toContain("path.join(projectRoot, 'out', 'make', 'release-evidence.json')");
    expect(releaseEvidenceValidator).toContain('validateReleaseEvidence(evidence);');
    expect(releaseEvidenceValidator).toContain('validateReleaseEvidenceArtifact({ evidence, projectRoot });');
    expect(releaseEvidencePolicy).toContain("evidence.signing.mode === 'signed'");
    expect(releaseEvidencePolicy).toContain('verification.${key} must be true for signed releases');
    expect(releaseEvidencePolicy).toContain('verification.${key} must be not-required for unsigned releases');
    expect(packageJson).toContain('"verify:release-evidence": "node ./scripts/validate-release-evidence.mjs"');
    expect(indexOfRequired(ciWorkflow, 'run: npm run verify:darwin-artifact')).toBeLessThan(
      indexOfRequired(ciWorkflow, 'run: npm run verify:release-evidence'),
    );
    expect(indexOfRequired(releaseWorkflow, 'run: npm run verify:darwin-artifact')).toBeLessThan(
      indexOfRequired(releaseWorkflow, 'run: npm run verify:release-evidence'),
    );
    expect(indexOfRequired(releaseWorkflow, 'run: npm run verify:release-evidence')).toBeLessThan(
      indexOfRequired(releaseWorkflow, 'run: npm run release:launch-smoke'),
    );
    expect(devMetricsSnapshotVerifier).toContain('List calls must be greater than 0');
    expect(devMetricsSnapshotVerifier).toContain('Failures must be 0');
    expect(indexOfRequired(e2eWorkflow, 'run: npm run e2e:dense')).toBeLessThan(
      indexOfRequired(e2eWorkflow, 'run: npm run verify:dev-metrics-snapshot'),
    );
    expect(indexOfRequired(e2eWorkflow, 'run: npm run verify:dev-metrics-snapshot')).toBeLessThan(
      indexOfRequired(e2eWorkflow, 'path: apps/desktop/test-results/**/dev-metrics-snapshot.txt'),
    );
    expect(e2eWorkflow).toContain('name: desktop-e2e-metrics-${{ github.run_id }}');
    expect(e2eWorkflow).toContain('retention-days: 30');
  });
});
