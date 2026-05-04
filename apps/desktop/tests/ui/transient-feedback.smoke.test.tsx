import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTransientFeedback } from '../../src/features/layout/use-transient-feedback';

const Probe = () => {
  const feedback = useTransientFeedback({
    copyFeedbackAutoHideMs: 50,
    statusAutoHideMs: 50,
  });

  return (
    <div>
      <output data-testid="status">{feedback.status}</output>
      <output data-testid="status-tone">{feedback.statusTone}</output>
      <output data-testid="copied-label">{feedback.copiedLabel}</output>
      <output data-testid="inline-feedback">{feedback.inlineFeedback}</output>
      <button type="button" onClick={() => feedback.setStatusLine('Ready.', 'success')}>
        Set status
      </button>
      <button type="button" onClick={() => feedback.setStatusLine('Failed.', 'error')}>
        Set error
      </button>
      <button type="button" onClick={feedback.dismissStatusLine}>
        Dismiss status
      </button>
      <button type="button" onClick={() => feedback.markCopied('Public URL')}>
        Mark copied
      </button>
      <button type="button" onClick={() => feedback.pushInlineFeedback('Copied.')}>
        Push inline
      </button>
      <button type="button" onClick={() => feedback.pushInlineFeedback('   ')}>
        Push blank
      </button>
    </div>
  );
};

const text = (testId: string): string => screen.getByTestId(testId).textContent ?? '';
const click = (name: string): void => {
  act(() => {
    fireEvent.click(screen.getByRole('button', { name }));
  });
};

describe('transient feedback hook', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('auto hides non-error status lines', () => {
    vi.useFakeTimers();
    render(<Probe />);

    click('Set status');
    expect(text('status')).toBe('Ready.');
    expect(text('status-tone')).toBe('success');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(text('status')).toBe('');
  });

  it('keeps error status visible until dismissed', () => {
    vi.useFakeTimers();
    render(<Probe />);

    click('Set error');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(text('status')).toBe('Failed.');

    click('Dismiss status');
    expect(text('status')).toBe('');
  });

  it('auto hides copy and inline feedback while ignoring blank inline messages', () => {
    vi.useFakeTimers();
    render(<Probe />);

    click('Push blank');
    expect(text('inline-feedback')).toBe('');

    click('Mark copied');
    click('Push inline');
    expect(text('copied-label')).toBe('Public URL');
    expect(text('inline-feedback')).toBe('Copied.');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(text('copied-label')).toBe('');
    expect(text('inline-feedback')).toBe('');
  });
});
