import { describe, expect, it } from 'vitest';
import {
  createGithubPublicReadinessReport,
  parseAuditMode,
} from '../../scripts/audit-github-public-readiness.mjs';

const publicRepo = {
  nameWithOwner: 'satoooh/lumabin',
  visibility: 'PUBLIC',
  isPrivate: false,
  defaultBranchRef: { name: 'main' },
};

const privateRepo = {
  nameWithOwner: 'satoooh/lumabin',
  visibility: 'PRIVATE',
  isPrivate: true,
  defaultBranchRef: { name: 'main' },
};

const publishedRelease = {
  tagName: 'v1.0.2',
  name: 'LumaBin v1.0.2',
  isDraft: false,
  isPrerelease: false,
  publishedAt: '2026-05-04T10:55:13Z',
};

const activeArtifact = {
  id: 1,
  name: 'desktop-e2e-metrics',
  sizeInBytes: 497,
  expiresAt: '2026-06-03T18:44:06Z',
  workflowRun: { id: 2, headBranch: 'main' },
};

describe('github public readiness audit', () => {
  it('defaults to post-public mode', () => {
    expect(parseAuditMode([])).toBe('post-public');
    expect(parseAuditMode(['--post-public'])).toBe('post-public');
    expect(parseAuditMode(['--pre-public'])).toBe('pre-public');
  });

  it('treats published releases and retained artifacts as healthy post-public observations', () => {
    const report = createGithubPublicReadinessReport({
      repo: publicRepo,
      releases: [publishedRelease],
      activeArtifacts: [activeArtifact],
      secretNames: [],
      variableNames: [],
      mode: 'post-public',
    });

    expect(report.publicReadiness).toBe('passed');
    expect(report.issues).toEqual([]);
    expect(report.observations).toEqual([
      '1 active GitHub Actions artifacts are retained',
      '1 published GitHub releases are available',
    ]);
  });

  it('keeps artifacts and releases blocking for pre-public conversion audits', () => {
    const report = createGithubPublicReadinessReport({
      repo: privateRepo,
      releases: [publishedRelease],
      activeArtifacts: [activeArtifact],
      secretNames: [],
      variableNames: [],
      mode: 'pre-public',
    });

    expect(report.publicReadiness).toBe('blocked');
    expect(report.issues).toEqual([
      '1 active GitHub Actions artifacts remain',
      '1 non-draft GitHub releases remain',
    ]);
  });
});
