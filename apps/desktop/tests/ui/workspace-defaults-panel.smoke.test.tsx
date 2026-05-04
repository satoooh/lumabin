import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';
import { useState } from 'react';
import { WorkspaceDefaultsPanel } from '../../src/features/settings/workspace-defaults-panel';
import type { AppSettings } from '../../src/shared/ipc';

const settings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  uploadOptimizeImagesBeforeUpload: true,
};

const StatefulProbe = ({ isInitiallyDirty = false }: { isInitiallyDirty?: boolean }) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [isDirty, setIsDirty] = useState(isInitiallyDirty);

  return (
    <WorkspaceDefaultsPanel
      isSettingsDirty={isDirty}
      onChangeAppearance={(appearance) => {
        setCurrentSettings((current) => ({
          ...current,
          appearance,
        }));
        setIsDirty(true);
      }}
      onChangeDefaultConflictPolicy={(defaultConflictPolicy) => {
        setCurrentSettings((current) => ({
          ...current,
          defaultConflictPolicy,
        }));
        setIsDirty(true);
      }}
      onChangePresignedUrlTTLSeconds={(presignedUrlTTLSeconds) => {
        setCurrentSettings((current) => ({
          ...current,
          presignedUrlTTLSeconds,
        }));
        setIsDirty(true);
      }}
      onChangeUploadOptimizeImagesBeforeUpload={(uploadOptimizeImagesBeforeUpload) => {
        setCurrentSettings((current) => ({
          ...current,
          uploadOptimizeImagesBeforeUpload,
        }));
        setIsDirty(true);
      }}
      settings={currentSettings}
    />
  );
};

describe('WorkspaceDefaultsPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows saved state and updates workspace defaults from user input', async () => {
    const user = userEvent.setup();

    render(<StatefulProbe />);

    expect(screen.getByText('Saved')).toBeTruthy();

    const appearanceSelect = screen.getByLabelText('Appearance') as HTMLSelectElement;
    const conflictSelect = screen.getByLabelText('Default conflict') as HTMLSelectElement;
    const ttlInput = screen.getByLabelText('URL TTL (sec)') as HTMLInputElement;
    const optimizeCheckbox = screen.getByRole('checkbox') as HTMLInputElement;

    await user.selectOptions(appearanceSelect, 'dark');
    await user.selectOptions(conflictSelect, 'overwrite');
    fireEvent.change(ttlInput, {
      target: { value: '1200' },
    });
    await user.click(optimizeCheckbox);

    expect(screen.getByText('Needs save')).toBeTruthy();
    expect(appearanceSelect.value).toBe('dark');
    expect(conflictSelect.value).toBe('overwrite');
    expect(ttlInput.value).toBe('1200');
    expect(optimizeCheckbox.checked).toBe(false);
  });

  it('marks unsaved settings', () => {
    render(<StatefulProbe isInitiallyDirty={true} />);

    expect(screen.getByText('Needs save')).toBeTruthy();
  });
});
