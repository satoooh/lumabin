import { cleanup, render, screen } from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WorkspaceSettingsFooter } from '../../src/features/settings/workspace-settings-footer';

describe('WorkspaceSettingsFooter', () => {
  afterEach(() => {
    cleanup();
  });

  it('enables save only when settings are dirty and not busy', () => {
    const onSaveSettings = vi.fn();
    const { rerender } = render(
      <WorkspaceSettingsFooter
        isSettingsBusy={false}
        isSettingsDirty={false}
        onSaveSettings={onSaveSettings}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveProperty(
      'disabled',
      true,
    );

    rerender(
      <WorkspaceSettingsFooter
        isSettingsBusy={false}
        isSettingsDirty={true}
        onSaveSettings={onSaveSettings}
      />,
    );
    screen.getByRole('button', { name: 'Save changes' }).click();
    expect(onSaveSettings).toHaveBeenCalledTimes(1);
  });

  it('shows busy copy and keeps save disabled while saving', () => {
    const onSaveSettings = vi.fn();

    render(
      <WorkspaceSettingsFooter
        isSettingsBusy={true}
        isSettingsDirty={true}
        onSaveSettings={onSaveSettings}
      />,
    );

    const saveButton = screen.getByRole('button', { name: 'Saving…' });
    expect(saveButton).toHaveProperty('disabled', true);
    expect(saveButton.getAttribute('aria-busy')).toBe('true');
  });
});
