import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useUiDerivations } from '../../src/features/layout/use-ui-derivations';

const renderDerivations = (
  overrides: Partial<Parameters<typeof useUiDerivations>[0]> = {},
) =>
  renderHook(() =>
    useUiDerivations({
      activeKindFilter: 'all',
      activeSearchQuery: '',
      activeSmartCollection: 'all',
      assetsPrefix: '',
      devMetrics: null,
      hasAssetActionDialog: false,
      hasBulkDeleteDialog: false,
      hasBulkMoveDialog: false,
      hasUploadConflictDialog: false,
      isConnectionSetupOpen: false,
      isQuickPreviewOpen: false,
      isShortcutHelpOpen: false,
      isWorkspaceSettingsOpen: false,
      listVirtualItems: [],
      normalizePrefix: (prefix) => prefix.trim().replace(/^\/+|\/+$/g, ''),
      searchInput: '',
      selectedAssetKey: '',
      status: '',
      visibleItems: [],
      ...overrides,
    }),
  );

describe('UI derivations', () => {
  it('treats pending search input as no-matches empty state', () => {
    const { result } = renderDerivations({ searchInput: '  invoice  ' });

    expect(result.current.emptyStateMode).toBe('no-matches');
    expect(result.current.canClearSearch).toBe(true);
    expect(result.current.canResetFilters).toBe(false);
  });

  it('treats active collection filters as no-matches empty state', () => {
    const { result } = renderDerivations({
      activeKindFilter: 'image',
      activeSmartCollection: 'all',
    });

    expect(result.current.emptyStateMode).toBe('no-matches');
    expect(result.current.canClearSearch).toBe(false);
    expect(result.current.canResetFilters).toBe(true);
  });

  it('normalizes drop overlay prefix labels with root fallback', () => {
    expect(
      renderDerivations({ assetsPrefix: ' /raw uploads/ ' }).result.current
        .dropOverlayPrefixLabel,
    ).toBe('raw uploads');

    expect(renderDerivations({ assetsPrefix: ' / ' }).result.current.dropOverlayPrefixLabel).toBe(
      '/',
    );
  });
});
