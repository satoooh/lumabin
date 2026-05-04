import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WorkspaceBrowserSessionPanel } from '../../src/features/settings/workspace-browser-session-panel';

const defaultProps = {
  assetsPrefix: 'photos/',
  isListLoading: false,
  isNextPageDisabled: false,
  onChangeAssetsPrefix: vi.fn(),
  onChangeSortBy: vi.fn(),
  onChangeSortDirection: vi.fn(),
  onChangeViewMode: vi.fn(),
  onLoadFirstPage: vi.fn(),
  onLoadNextPage: vi.fn(),
  onOpenPrefix: vi.fn(),
  prefixes: ['photos/2026/', 'videos/'],
  selectedProfileId: 'profile-1',
  sortBy: 'modified' as const,
  sortDirection: 'desc' as const,
  viewMode: 'gallery' as const,
};

describe('WorkspaceBrowserSessionPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('routes browser session controls to their commands', async () => {
    const user = userEvent.setup();

    render(<WorkspaceBrowserSessionPanel {...defaultProps} />);

    const disclosure = screen.getByText('Browser session').closest('details');
    expect(disclosure).toHaveProperty('open', false);

    await user.click(screen.getByText('Browser session'));
    expect(disclosure).toHaveProperty('open', true);

    await user.selectOptions(screen.getByLabelText('View mode'), 'list');
    await user.selectOptions(screen.getByLabelText('Sort'), 'name');
    await user.selectOptions(screen.getByLabelText('Order'), 'asc');
    fireEvent.change(screen.getByLabelText('Prefix'), {
      target: { value: 'archive/' },
    });
    fireEvent.keyDown(screen.getByLabelText('Prefix'), {
      key: 'Enter',
    });
    screen.getByRole('button', { name: 'Load next page' }).click();
    screen.getByRole('button', { name: 'photos/2026/' }).click();

    expect(defaultProps.onChangeViewMode).toHaveBeenCalledWith('list');
    expect(defaultProps.onChangeSortBy).toHaveBeenCalledWith('name');
    expect(defaultProps.onChangeSortDirection).toHaveBeenCalledWith('asc');
    expect(defaultProps.onChangeAssetsPrefix).toHaveBeenCalledWith('archive/');
    expect(defaultProps.onLoadFirstPage).toHaveBeenCalledTimes(1);
    expect(defaultProps.onLoadNextPage).toHaveBeenCalledTimes(1);
    expect(defaultProps.onOpenPrefix).toHaveBeenCalledWith('photos/2026/');
  });

  it('disables profile-scoped actions without an active profile', () => {
    render(
      <WorkspaceBrowserSessionPanel
        {...defaultProps}
        selectedProfileId=""
      />,
    );

    fireEvent.click(screen.getByText('Browser session'));

    expect(screen.getByLabelText('Prefix')).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Reload current prefix' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});
