import type { ComponentProps } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppOverlays } from '../../src/features/layout/app-overlays';

const overlayCalls = vi.hoisted(() => ({
  rendered: [] as string[],
  quickPreview: undefined as { marker?: string } | undefined,
  galleryActionModals: undefined as { marker?: string } | undefined,
  shortcutHelp: undefined as { marker?: string } | undefined,
  workspaceSettings: undefined as { marker?: string } | undefined,
  connectionSetup: undefined as { marker?: string } | undefined,
  feedbackLayer: undefined as { marker?: string } | undefined,
}));

vi.mock('../../src/features/preview/quick-preview-modal', () => ({
  QuickPreviewModal: (props: { marker?: string }) => {
    overlayCalls.rendered.push('quick-preview');
    overlayCalls.quickPreview = props;
    return <div data-testid="quick-preview-overlay" />;
  },
}));

vi.mock('../../src/features/gallery/action-modals', () => ({
  GalleryActionModals: (props: { marker?: string }) => {
    overlayCalls.rendered.push('gallery-actions');
    overlayCalls.galleryActionModals = props;
    return <div data-testid="gallery-actions-overlay" />;
  },
}));

vi.mock('../../src/features/settings/shortcut-help-modal', () => ({
  ShortcutHelpModal: (props: { marker?: string }) => {
    overlayCalls.rendered.push('shortcut-help');
    overlayCalls.shortcutHelp = props;
    return <div data-testid="shortcut-help-overlay" />;
  },
}));

vi.mock('../../src/features/settings/workspace-settings-modal', () => ({
  WorkspaceSettingsModal: (props: { marker?: string }) => {
    overlayCalls.rendered.push('workspace-settings');
    overlayCalls.workspaceSettings = props;
    return <div data-testid="workspace-settings-overlay" />;
  },
}));

vi.mock('../../src/features/settings/connection-setup-modal', () => ({
  ConnectionSetupModal: (props: { marker?: string }) => {
    overlayCalls.rendered.push('connection-setup');
    overlayCalls.connectionSetup = props;
    return <div data-testid="connection-setup-overlay" />;
  },
}));

vi.mock('../../src/features/layout/workspace-feedback-layer', () => ({
  WorkspaceFeedbackLayer: (props: { marker?: string }) => {
    overlayCalls.rendered.push('feedback-layer');
    overlayCalls.feedbackLayer = props;
    return <div data-testid="feedback-layer-overlay" />;
  },
}));

const createProps = (): ComponentProps<typeof AppOverlays> => ({
  quickPreview: { marker: 'quick-preview' },
  galleryActionModals: { marker: 'gallery-actions' },
  shortcutHelp: { marker: 'shortcut-help' },
  workspaceSettings: { marker: 'workspace-settings' },
  connectionSetup: { marker: 'connection-setup' },
  feedbackLayer: { marker: 'feedback-layer' },
} as ComponentProps<typeof AppOverlays>);

describe('app overlays', () => {
  afterEach(() => {
    cleanup();
    overlayCalls.rendered = [];
    overlayCalls.quickPreview = undefined;
    overlayCalls.galleryActionModals = undefined;
    overlayCalls.shortcutHelp = undefined;
    overlayCalls.workspaceSettings = undefined;
    overlayCalls.connectionSetup = undefined;
    overlayCalls.feedbackLayer = undefined;
  });

  it('keeps overlay ownership and render order in the layout boundary', () => {
    render(<AppOverlays {...createProps()} />);

    expect(overlayCalls.rendered).toEqual([
      'quick-preview',
      'gallery-actions',
      'shortcut-help',
      'workspace-settings',
      'connection-setup',
      'feedback-layer',
    ]);
    expect(overlayCalls.quickPreview).toMatchObject({ marker: 'quick-preview' });
    expect(overlayCalls.galleryActionModals).toMatchObject({ marker: 'gallery-actions' });
    expect(overlayCalls.shortcutHelp).toMatchObject({ marker: 'shortcut-help' });
    expect(overlayCalls.workspaceSettings).toMatchObject({ marker: 'workspace-settings' });
    expect(overlayCalls.connectionSetup).toMatchObject({ marker: 'connection-setup' });
    expect(overlayCalls.feedbackLayer).toMatchObject({ marker: 'feedback-layer' });
    expect(screen.getAllByTestId(/-overlay$/)).toHaveLength(6);
  });
});
