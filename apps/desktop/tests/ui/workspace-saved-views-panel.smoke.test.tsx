import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WorkspaceSavedViewsPanel } from '../../src/features/settings/workspace-saved-views-panel';
import type { SavedView } from '../../src/shared/ipc';

const savedView: SavedView = {
  createdAt: '2026-05-03T00:00:00.000Z',
  id: 'view-1',
  name: 'Recent photos',
  query: {
    filter: {
      kind: 'image',
      smart: 'recent-uploads',
    },
    prefix: 'photos/',
    search: 'camera',
    sort: {
      by: 'modified',
      direction: 'desc',
    },
    viewMode: 'gallery',
  },
  updatedAt: '2026-05-03T01:02:03.000Z',
};

const defaultProps = {
  formatDate: (value: string) => `formatted:${value}`,
  isSearchBusy: false,
  newSavedViewName: '',
  onApplySavedView: vi.fn(),
  onChangeNewSavedViewName: vi.fn(),
  onDeleteSavedView: vi.fn(),
  onSaveCurrentView: vi.fn(),
  savedViews: [savedView],
};

describe('WorkspaceSavedViewsPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('routes saved view create and apply commands', async () => {
    render(<WorkspaceSavedViewsPanel {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText('View name…'), {
      target: { value: 'Camera roll' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText('View name…'), {
      key: 'Enter',
    });
    screen.getByRole('button', { name: 'Save view' }).click();
    screen.getByRole('button', { name: /Recent photos/ }).click();

    expect(defaultProps.onChangeNewSavedViewName).toHaveBeenLastCalledWith('Camera roll');
    expect(defaultProps.onSaveCurrentView).toHaveBeenCalledTimes(2);
    expect(defaultProps.onApplySavedView).toHaveBeenCalledWith(savedView);
    expect(defaultProps.onDeleteSavedView).not.toHaveBeenCalled();
    expect(screen.getByText(`formatted:${savedView.updatedAt}`)).toBeTruthy();
  });

  it('requires confirmation before deleting a saved view', async () => {
    const user = userEvent.setup();
    render(<WorkspaceSavedViewsPanel {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Delete saved view' }));

    expect(defaultProps.onDeleteSavedView).not.toHaveBeenCalled();
    expect(screen.getByText('Delete Recent photos?')).toBeTruthy();
    expect(
      screen.getByText('This removes the saved search and filters. Assets stay in the bucket.'),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Delete Recent photos?')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Delete saved view' }));
    await user.click(screen.getByRole('button', { name: 'Delete view' }));

    expect(defaultProps.onDeleteSavedView).toHaveBeenCalledWith('view-1');
  });

  it('shows an empty state and disables destructive actions while search is busy', () => {
    const { rerender } = render(
      <WorkspaceSavedViewsPanel
        {...defaultProps}
        savedViews={[]}
      />,
    );

    expect(screen.getByText('No saved views.')).toBeTruthy();

    rerender(
      <WorkspaceSavedViewsPanel
        {...defaultProps}
        isSearchBusy={true}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save view' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Delete saved view' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});
