import type { ComponentProps } from 'react';
import { GalleryActionModals } from '../gallery/action-modals';
import { QuickPreviewModal } from '../preview/quick-preview-modal';
import { ConnectionSetupModal } from '../settings/connection-setup-modal';
import { ShortcutHelpModal } from '../settings/shortcut-help-modal';
import { WorkspaceSettingsModal } from '../settings/workspace-settings-modal';
import { WorkspaceFeedbackLayer } from './workspace-feedback-layer';

interface AppOverlaysProps {
  quickPreview: ComponentProps<typeof QuickPreviewModal>;
  galleryActionModals: ComponentProps<typeof GalleryActionModals>;
  shortcutHelp: ComponentProps<typeof ShortcutHelpModal>;
  workspaceSettings: ComponentProps<typeof WorkspaceSettingsModal>;
  connectionSetup: ComponentProps<typeof ConnectionSetupModal>;
  feedbackLayer: ComponentProps<typeof WorkspaceFeedbackLayer>;
}

export const AppOverlays = ({
  quickPreview,
  galleryActionModals,
  shortcutHelp,
  workspaceSettings,
  connectionSetup,
  feedbackLayer,
}: AppOverlaysProps) => {
  return (
    <>
      <QuickPreviewModal {...quickPreview} />
      <GalleryActionModals {...galleryActionModals} />
      <ShortcutHelpModal {...shortcutHelp} />
      <WorkspaceSettingsModal {...workspaceSettings} />
      <ConnectionSetupModal {...connectionSetup} />
      <WorkspaceFeedbackLayer {...feedbackLayer} />
    </>
  );
};
