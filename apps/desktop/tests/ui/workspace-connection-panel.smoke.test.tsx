import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WorkspaceConnectionPanel } from '../../src/features/settings/workspace-connection-panel';
import type { ProfileSummary } from '../../src/shared/ipc';

const selectedProfile: ProfileSummary = {
  bucket: 'lumabin-assets',
  createdAt: '2026-05-03T00:00:00.000Z',
  endpoint: 'https://example.r2.cloudflarestorage.com',
  hasSecret: true,
  id: 'profile-1',
  name: 'Production',
  provider: 'r2',
  region: 'auto',
  updatedAt: '2026-05-03T00:00:00.000Z',
};

const defaultProps = {
  isProfileBusy: false,
  onChangePublicBaseUrl: vi.fn(),
  onConnectionTest: vi.fn(),
  onOpenConnectionSetup: vi.fn(),
  selectedProfile,
  selectedProfileId: selectedProfile.id,
  selectedPublicBaseUrl: 'https://cdn.example.com',
};

describe('WorkspaceConnectionPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows the active profile and routes connection commands', () => {
    render(<WorkspaceConnectionPanel {...defaultProps} />);

    expect(screen.getByText('Ready')).toBeTruthy();
    expect(screen.getByText('Production')).toBeTruthy();
    expect(screen.getByText('r2')).toBeTruthy();
    expect(screen.getByText('lumabin-assets')).toBeTruthy();

    screen.getByRole('button', { name: 'Test connection' }).click();
    screen.getByRole('button', { name: 'Manage connection' }).click();
    fireEvent.change(screen.getByLabelText('Public URL base'), {
      target: { value: 'https://static.example.com' },
    });

    expect(defaultProps.onConnectionTest).toHaveBeenCalledTimes(1);
    expect(defaultProps.onOpenConnectionSetup).toHaveBeenCalledTimes(1);
    expect(defaultProps.onChangePublicBaseUrl).toHaveBeenCalledWith(
      'https://static.example.com',
    );
  });

  it('disables profile-scoped controls when no profile is selected', () => {
    render(
      <WorkspaceConnectionPanel
        {...defaultProps}
        selectedProfile={undefined}
        selectedProfileId=""
        selectedPublicBaseUrl=""
      />,
    );

    expect(screen.getByText('No profile')).toBeTruthy();
    expect(screen.getByText('Not selected')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create connection' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Test connection' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.getByLabelText('Public URL base')).toHaveProperty('disabled', true);
  });
});
