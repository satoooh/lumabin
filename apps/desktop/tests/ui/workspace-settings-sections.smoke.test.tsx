import { describe, expect, it } from 'vitest';
import {
  resolveActiveWorkspaceSettingsSection,
  resolveWorkspaceSettingsSections,
} from '../../src/features/settings/workspace-settings-sections';

describe('workspace settings sections', () => {
  it('summarizes connection, defaults, browser, and saved-view state for the settings nav', () => {
    expect(
      resolveWorkspaceSettingsSections({
        isDevEnv: false,
        isSettingsDirty: true,
        savedViewCount: 2,
        selectedProfileId: 'profile-1',
      }),
    ).toEqual([
      {
        id: 'connection',
        label: 'Connection profile',
        description: 'Profile and public URL',
        badge: 'Ready',
      },
      {
        id: 'defaults',
        label: 'Workspace defaults',
        description: 'Appearance, upload, and share expiry',
        badge: 'Unsaved',
      },
      {
        id: 'browser',
        label: 'Browser session',
        description: 'Current prefix, sort, and paging',
      },
      {
        id: 'views',
        label: 'Saved views',
        description: '2 saved',
      },
    ]);
  });

  it('uses setup and developer labels only when those states apply', () => {
    const sections = resolveWorkspaceSettingsSections({
      isDevEnv: true,
      isSettingsDirty: false,
      savedViewCount: 0,
      selectedProfileId: '',
    });

    expect(sections.map((section) => section.id)).toEqual([
      'connection',
      'defaults',
      'browser',
      'views',
      'developer',
    ]);
    expect(sections[0]).toMatchObject({
      description: 'Set up a profile',
      badge: 'Setup',
    });
    expect(sections[1].badge).toBeUndefined();
    expect(sections[4]).toMatchObject({
      label: 'Dev metrics',
      description: 'Cache and runtime metrics',
    });
  });

  it('falls back to the first section when the active section disappears', () => {
    const sections = resolveWorkspaceSettingsSections({
      isDevEnv: false,
      isSettingsDirty: false,
      savedViewCount: 1,
      selectedProfileId: 'profile-1',
    });

    expect(resolveActiveWorkspaceSettingsSection(sections, 'views').id).toBe('views');
    expect(resolveActiveWorkspaceSettingsSection(sections, 'developer').id).toBe('connection');
  });
});
