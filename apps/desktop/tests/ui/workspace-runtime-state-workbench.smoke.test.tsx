import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useWorkspaceRuntimeStateWorkbench } from '../../src/features/workbench/use-workspace-runtime-state-workbench';

describe('workspace runtime state workbench', () => {
  it('derives loading, pagination, and guided-start state from workspace and gallery inputs', () => {
    const { result, rerender } = renderHook(
      ({
        activeSearchQuery,
        hasInitialized,
        isBrowserBusy,
        isSearchBusy,
        nextAssetsContinuationToken,
        selectedProfileId,
      }) =>
        useWorkspaceRuntimeStateWorkbench({
          activeSearchQuery,
          hasInitialized,
          isBrowserBusy,
          isSearchBusy,
          nextAssetsContinuationToken,
          selectedProfileId,
        }),
      {
        initialProps: {
          activeSearchQuery: '',
          hasInitialized: true,
          isBrowserBusy: false,
          isSearchBusy: false,
          nextAssetsContinuationToken: 'next-page',
          selectedProfileId: 'profile-1',
        },
      },
    );

    expect(result.current).toEqual({
      isListLoading: false,
      isNextPageDisabled: false,
      showGuidedStart: false,
    });

    rerender({
      activeSearchQuery: 'camera',
      hasInitialized: true,
      isBrowserBusy: false,
      isSearchBusy: true,
      nextAssetsContinuationToken: 'next-page',
      selectedProfileId: '',
    });

    expect(result.current).toEqual({
      isListLoading: true,
      isNextPageDisabled: true,
      showGuidedStart: true,
    });
  });
});
