export type WorkspaceSettingsSectionId =
  | 'connection'
  | 'defaults'
  | 'browser'
  | 'views'
  | 'developer';

export interface WorkspaceSettingsSection {
  id: WorkspaceSettingsSectionId;
  label: string;
  description: string;
  badge?: string;
}

interface ResolveWorkspaceSettingsSectionsOptions {
  isDevEnv: boolean;
  isSettingsDirty: boolean;
  savedViewCount: number;
  selectedProfileId: string;
}

export const DEFAULT_WORKSPACE_SETTINGS_SECTION_ID: WorkspaceSettingsSectionId = 'connection';

export const resolveWorkspaceSettingsSections = ({
  isDevEnv,
  isSettingsDirty,
  savedViewCount,
  selectedProfileId,
}: ResolveWorkspaceSettingsSectionsOptions): WorkspaceSettingsSection[] => {
  const sections: WorkspaceSettingsSection[] = [
    {
      id: 'connection',
      label: 'Connection profile',
      description: selectedProfileId ? 'Profile and public URL' : 'Set up a profile',
      badge: selectedProfileId ? 'Ready' : 'Setup',
    },
    {
      id: 'defaults',
      label: 'Workspace defaults',
      description: 'Appearance, upload, and share expiry',
      badge: isSettingsDirty ? 'Unsaved' : undefined,
    },
    {
      id: 'browser',
      label: 'Browser session',
      description: 'Current prefix, sort, and paging',
    },
    {
      id: 'views',
      label: 'Saved views',
      description: `${savedViewCount} saved`,
    },
  ];

  if (isDevEnv) {
    sections.push({
      id: 'developer',
      label: 'Dev metrics',
      description: 'Cache and runtime metrics',
    });
  }

  return sections;
};

export const resolveActiveWorkspaceSettingsSection = (
  sections: WorkspaceSettingsSection[],
  activeSectionId: WorkspaceSettingsSectionId,
): WorkspaceSettingsSection =>
  sections.find((section) => section.id === activeSectionId) ?? sections[0];
