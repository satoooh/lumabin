import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type ReleaseEvidencePolicy = {
  validateReleaseEvidence: (evidence: unknown) => void;
  validateReleaseEvidenceArtifact: (input: { evidence: ReleaseEvidence; projectRoot: string }) => void;
};

type ReleaseEvidence = ReturnType<typeof createEvidence>;

const loadPolicy = async (): Promise<ReleaseEvidencePolicy> =>
  (await import('../../scripts/release-evidence-policy.mjs')) as ReleaseEvidencePolicy;

const artifactBody = 'test';
const artifactDigest = createHash('sha256').update(artifactBody).digest('hex');

function createEvidence(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    schemaVersion: 1,
    generatedAt: '2026-05-05T00:00:00.000Z',
    app: {
      name: 'LumaBin',
      packageName: 'lumabin-desktop',
      version: '1.0.3',
    },
    target: {
      platform: 'darwin',
      arch: 'arm64',
    },
    signing: {
      mode: 'unsigned-ad-hoc',
      bundleId: 'com.satoooh.lumabin',
      authority: null,
      teamIdentifier: null,
      hardenedRuntime: null,
    },
    artifact: {
      path: 'out/make/zip/darwin/arm64/LumaBin-darwin-arm64-1.0.3.zip',
      fileName: 'LumaBin-darwin-arm64-1.0.3.zip',
      sha256: artifactDigest,
    },
    bundle: {
      bundleId: 'com.satoooh.lumabin',
      bundleName: 'LumaBin',
      shortVersion: '1.0.3',
    },
    verification: {
      zipIncludesAppAsar: true,
      zipIncludesIcon: true,
      extractedAppBundle: true,
      extractedAppAsar: true,
      extractedIcon: true,
      extractedExecutable: true,
      extractedInfoPlist: true,
      bundleMetadata: true,
      codesign: true,
      developerIdAuthority: 'not-required',
      hardenedRuntime: 'not-required',
      teamIdentifier: 'not-required',
      spctlAssess: 'not-required',
      staplerValidate: 'not-required',
    },
    github: {
      runId: '123',
      sha: 'abcdef',
      refName: 'v1.0.3',
    },
    ...overrides,
  };
}

describe('release evidence policy', () => {
  it('accepts complete unsigned release evidence and verifies the artifact digest', async () => {
    const policy = await loadPolicy();
    const projectRoot = mkdtempSync(path.join(tmpdir(), 'lumabin-release-evidence-'));
    try {
      const evidence = createEvidence();
      const artifactPath = path.join(projectRoot, evidence.artifact.path);
      mkdirSync(path.dirname(artifactPath), { recursive: true });
      writeFileSync(artifactPath, artifactBody);

      policy.validateReleaseEvidence(evidence);
      policy.validateReleaseEvidenceArtifact({ evidence, projectRoot });
    } finally {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('rejects signed evidence without hardened runtime verification', async () => {
    const policy = await loadPolicy();
    const evidence = createEvidence({
      signing: {
        mode: 'signed',
        bundleId: 'com.satoooh.lumabin',
        authority: 'Developer ID Application: Example, Inc. (TEAMID1234)',
        teamIdentifier: 'TEAMID1234',
        hardenedRuntime: null,
      },
      verification: {
        ...createEvidence().verification,
        developerIdAuthority: true,
        hardenedRuntime: false,
        teamIdentifier: true,
        spctlAssess: true,
        staplerValidate: true,
      },
    });

    expect(() => policy.validateReleaseEvidence(evidence)).toThrow(/signing\.hardenedRuntime/);
  });
});
