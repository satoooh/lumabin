#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import process from 'node:process';

const repository = process.env.LUMABIN_GITHUB_REPOSITORY || 'satoooh/lumabin';

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
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

const parseJson = (source, fallback) => {
  if (!source.trim()) {
    return fallback;
  }
  return JSON.parse(source);
};

const summarizeReleases = () => {
  const releases = parseJson(
    run('gh', [
      'release',
      'list',
      '--repo',
      repository,
      '--limit',
      '100',
      '--json',
      'tagName,name,isDraft,isPrerelease,createdAt,publishedAt',
    ]),
    [],
  );
  return releases.map((release) => ({
    tagName: release.tagName,
    name: release.name,
    isDraft: release.isDraft,
    isPrerelease: release.isPrerelease,
    publishedAt: release.publishedAt,
  }));
};

const summarizeArtifacts = () => {
  const artifacts = parseJson(
    run('gh', ['api', `repos/${repository}/actions/artifacts`, '--paginate']),
    { artifacts: [] },
  ).artifacts ?? [];
  return artifacts
    .filter((artifact) => !artifact.expired)
    .map((artifact) => ({
      id: artifact.id,
      name: artifact.name,
      sizeInBytes: artifact.size_in_bytes,
      expiresAt: artifact.expires_at,
      workflowRun: {
        id: artifact.workflow_run?.id ?? null,
        headBranch: artifact.workflow_run?.head_branch ?? null,
      },
    }));
};

const summarizeSecrets = () =>
  run('gh', ['secret', 'list', '--repo', repository])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/)[0]);

const summarizeVariables = () =>
  run('gh', ['variable', 'list', '--repo', repository])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/)[0]);

try {
  const repo = parseJson(
    run('gh', ['repo', 'view', repository, '--json', 'nameWithOwner,visibility,isPrivate,defaultBranchRef']),
    {},
  );
  const releases = summarizeReleases();
  const activeArtifacts = summarizeArtifacts();
  const secretNames = summarizeSecrets();
  const variableNames = summarizeVariables();
  const issues = [];

  if (repo.visibility !== 'PRIVATE' || repo.isPrivate !== true) {
    issues.push(`repository is already ${repo.visibility}`);
  }
  if (activeArtifacts.length > 0) {
    issues.push(`${activeArtifacts.length} active GitHub Actions artifacts remain`);
  }
  const nonDraftReleases = releases.filter((release) => !release.isDraft);
  if (nonDraftReleases.length > 0) {
    issues.push(`${nonDraftReleases.length} non-draft GitHub releases remain`);
  }

  const report = {
    repository: {
      nameWithOwner: repo.nameWithOwner,
      visibility: repo.visibility,
      isPrivate: repo.isPrivate,
      defaultBranch: repo.defaultBranchRef?.name ?? null,
    },
    publicReadiness: issues.length === 0 ? 'passed' : 'blocked',
    issues,
    releases: {
      total: releases.length,
      nonDraft: nonDraftReleases.map((release) => ({
        tagName: release.tagName,
        isPrerelease: release.isPrerelease,
        publishedAt: release.publishedAt,
      })),
    },
    actionsArtifacts: {
      activeCount: activeArtifacts.length,
      active: activeArtifacts,
    },
    repositorySecrets: {
      count: secretNames.length,
      names: secretNames,
    },
    repositoryVariables: {
      count: variableNames.length,
      names: variableNames,
    },
  };

  console.log(JSON.stringify(report, null, 2));

  if (issues.length > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error(`[audit-github-public-readiness] ${error.message}`);
  process.exit(1);
}
