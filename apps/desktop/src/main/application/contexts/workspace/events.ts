export type WorkspaceEvent =
  | {
      type: 'workspace.profile.saved';
      occurredAt: string;
      payload: { profileId: string; provider: string; bucket: string };
    }
  | {
      type: 'workspace.profile.deleted';
      occurredAt: string;
      payload: { profileId: string };
    }
  | {
      type: 'workspace.settings.saved';
      occurredAt: string;
      payload: { appearance?: string; defaultConflictPolicy?: string };
    };
