import { describe, expect, it } from 'vitest';
import {
  collectAdrIssues,
  collectContentIssues,
  collectRequiredFileIssues,
  collectTrackedFileIssues,
  collectTrackedPathIssues,
} from '../../scripts/audit-public-readiness.mjs';

const issueNames = (issues: string[]): string[] =>
  issues.map((issue) => issue.match(/\(([^)]+)\)$/)?.[1] ?? issue);

describe('public readiness audit', () => {
  it('detects private metadata and token-shaped content without echoing the value', () => {
    const privateHost = ['assets', 'private', 'example', 'invalid'].join('.');
    const privateProfile = ['private', 'r2', 'profile'].join('-');
    const privateEmail = ['private-user', 'example.invalid'].join('@');
    const objectKeyHint = ['real', 'object', 'key', 'hint', '000001'].join('-');
    const tokenLikeAccessKey = `AKIA${'A'.repeat(16)}`;

    const issues = collectContentIssues(
      'README.md',
      [
        privateHost,
        privateProfile,
        privateEmail,
        objectKeyHint,
        tokenLikeAccessKey,
        ['-----BEGIN ', 'PRIVATE KEY-----'].join(''),
      ].join('\n'),
    );

    expect(issueNames(issues)).toEqual([
      'aws-access-key-id',
      'private-key-block',
      'private-profile-name',
      'private-image-host',
      'private-email',
      'private-object-key-hint',
    ]);
    expect(issues.join('\n')).not.toContain(privateHost);
    expect(issues.join('\n')).not.toContain(tokenLikeAccessKey);
  });

  it('detects tracked path types that should never be published', () => {
    expect(issueNames(collectTrackedPathIssues('.env.local'))).toEqual(['local-env-file']);
    expect(issueNames(collectTrackedPathIssues('secrets/app.p12'))).toEqual([
      'private-key-or-certificate',
    ]);
    expect(issueNames(collectTrackedPathIssues('tmp/state.sqlite'))).toEqual(['local-database']);
    expect(issueNames(collectTrackedPathIssues('apps/desktop/out/LumaBin.zip'))).toEqual([
      'packaged-release-artifact',
    ]);
  });

  it('requires public repository hygiene files', () => {
    const issues = collectRequiredFileIssues((relativePath) => relativePath === 'LICENSE');

    expect(issues).toEqual([
      '.gitignore: missing required public repository hygiene file',
      'SECURITY.md: missing required public repository hygiene file',
      'CONTRIBUTING.md: missing required public repository hygiene file',
      'CODE_OF_CONDUCT.md: missing required public repository hygiene file',
      'SUPPORT.md: missing required public repository hygiene file',
    ]);
  });

  it('skips binary assets while auditing tracked text files', () => {
    const textPath = 'README.md';
    const imagePath = 'docs/assets/screenshot.svg.png';
    const textByPath = new Map([
      [textPath, 'clean public copy'],
      [imagePath, ['assets', 'private', 'example', 'invalid'].join('.')],
    ]);

    const issues = collectTrackedFileIssues({
      basePath: '/repo',
      trackedFiles: [
        '.gitignore',
        'LICENSE',
        'SECURITY.md',
        'CONTRIBUTING.md',
        'CODE_OF_CONDUCT.md',
        'SUPPORT.md',
        textPath,
        imagePath,
      ],
      fileExists: () => true,
      readTextFile: (absolutePath) => textByPath.get(absolutePath.replace('/repo/', '')) ?? '',
      getFileStats: () => ({ size: 64 }),
    });

    expect(issues).toEqual([]);
  });

  it('skips tracked files that are deleted in the working tree', () => {
    let stattedDeletedFile = false;
    const issues = collectTrackedFileIssues({
      basePath: '/repo',
      trackedFiles: [
        '.gitignore',
        'LICENSE',
        'SECURITY.md',
        'CONTRIBUTING.md',
        'CODE_OF_CONDUCT.md',
        'SUPPORT.md',
        'docs/STATUS.md',
      ],
      fileExists: (absolutePath) => !absolutePath.endsWith('docs/STATUS.md'),
      readTextFile: () => 'clean public copy',
      getFileStats: (absolutePath) => {
        if (absolutePath.endsWith('docs/STATUS.md')) {
          stattedDeletedFile = true;
        }
        return { size: 64 };
      },
    });

    expect(issues).toEqual([]);
    expect(stattedDeletedFile).toBe(false);
  });

  it('requires unique ADR numbers with matching headings', () => {
    const textByPath = new Map([
      ['docs/adr/0001-first-decision.md', '# ADR 0001: First Decision\n'],
      ['docs/adr/0001-duplicate-decision.md', '# ADR 0001: Duplicate Decision\n'],
      ['docs/adr/0003-number-drift.md', '# ADR 0002: Number Drift\n'],
      ['docs/adr/0004-missing-heading.md', '# Not an ADR\n'],
    ]);

    const issues = collectAdrIssues({
      basePath: '/repo',
      trackedFiles: [...textByPath.keys(), 'docs/adr/README.md'],
      fileExists: () => true,
      readTextFile: (absolutePath) => textByPath.get(absolutePath.replace('/repo/', '')) ?? '',
    });

    expect(issues).toEqual([
      'docs/adr/0001-duplicate-decision.md: duplicate ADR number 0001 already used by docs/adr/0001-first-decision.md',
      'docs/adr/0003-number-drift.md: ADR heading number 0002 does not match filename number 0003',
      'docs/adr/0004-missing-heading.md: missing ADR heading',
    ]);
  });
});
