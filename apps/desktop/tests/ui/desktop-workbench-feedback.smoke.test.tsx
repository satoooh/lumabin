import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDesktopWorkbenchFeedback } from '../../src/features/workbench/use-desktop-workbench-feedback';

describe('desktop workbench feedback', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('owns desktop feedback auto-hide policy outside the root workbench', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDesktopWorkbenchFeedback());

    act(() => {
      result.current.setStatusLine('Ready.', 'success');
      result.current.markCopied('Public URL');
      result.current.pushInlineFeedback('Copied.');
    });

    expect(result.current.status).toBe('Ready.');
    expect(result.current.copiedLabel).toBe('Public URL');
    expect(result.current.inlineFeedback).toBe('Copied.');

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(result.current.status).toBe('');
    expect(result.current.copiedLabel).toBe('');
    expect(result.current.inlineFeedback).toBe('');
  });
});
