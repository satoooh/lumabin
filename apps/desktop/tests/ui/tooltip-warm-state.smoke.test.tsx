import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isTooltipWarmTrigger,
  useTooltipWarmState,
} from '../../src/features/layout/use-tooltip-warm-state';

const Probe = () => {
  const isTooltipWarm = useTooltipWarmState();
  return (
    <>
      <span data-testid="warm-state">{String(isTooltipWarm)}</span>
      <button className="icon-action-button" data-tooltip="Share" type="button">
        Share
      </button>
      <button type="button">Plain</button>
    </>
  );
};

const dispatchPointerEnter = (target: Element): void => {
  target.dispatchEvent(new Event('pointerenter', { bubbles: true }));
};

describe('tooltip warm state', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('detects only icon action buttons with tooltip metadata', () => {
    const tooltipButton = document.createElement('button');
    tooltipButton.className = 'icon-action-button';
    tooltipButton.dataset.tooltip = 'Share';

    const plainButton = document.createElement('button');

    expect(isTooltipWarmTrigger(tooltipButton)).toBe(true);
    expect(isTooltipWarmTrigger(plainButton)).toBe(false);
    expect(isTooltipWarmTrigger(null)).toBe(false);
  });

  it('warms tooltips after the pointer rests on a trigger', () => {
    vi.useFakeTimers();
    render(<Probe />);

    expect(screen.getByTestId('warm-state').textContent).toBe('false');

    act(() => {
      dispatchPointerEnter(screen.getByRole('button', { name: 'Share' }));
      vi.advanceTimersByTime(419);
    });
    expect(screen.getByTestId('warm-state').textContent).toBe('false');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('warm-state').textContent).toBe('true');
  });

  it('ignores pointer entry on non-tooltip controls', () => {
    vi.useFakeTimers();
    render(<Probe />);

    act(() => {
      dispatchPointerEnter(screen.getByRole('button', { name: 'Plain' }));
      vi.advanceTimersByTime(420);
    });

    expect(screen.getByTestId('warm-state').textContent).toBe('false');
  });
});
