import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDesktopWorkbenchShellResources } from '../../src/features/workbench/use-desktop-workbench-shell-resources';

const dispatchPointerEnter = (target: Element): void => {
  target.dispatchEvent(new Event('pointerenter', { bubbles: true }));
};

describe('desktop workbench shell resources', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('keeps DOM refs, feedback timers, and tooltip warm-up behind one shell resource boundary', () => {
    vi.useFakeTimers();
    const { rerender, result } = renderHook(() => useDesktopWorkbenchShellResources());

    const initialRefs = result.current.domRefs;
    expect(result.current.isTooltipWarm).toBe(false);

    act(() => {
      result.current.feedback.setStatusLine('Ready.', 'success');
    });
    expect(result.current.feedback.status).toBe('Ready.');

    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(result.current.feedback.status).toBe('');

    const tooltipButton = document.createElement('button');
    tooltipButton.className = 'icon-action-button';
    tooltipButton.dataset.tooltip = 'Share';
    document.body.appendChild(tooltipButton);

    act(() => {
      dispatchPointerEnter(tooltipButton);
      vi.advanceTimersByTime(420);
    });
    expect(result.current.isTooltipWarm).toBe(true);

    rerender();

    expect(result.current.domRefs.appShellRef).toBe(initialRefs.appShellRef);
    expect(result.current.domRefs.profileFormRefs).toBe(initialRefs.profileFormRefs);
    expect(result.current.domRefs.uploadToastRef).toBe(initialRefs.uploadToastRef);
  });
});
