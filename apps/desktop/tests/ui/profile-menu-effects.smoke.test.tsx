import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { useProfileMenuEffects } from '../../src/features/settings/use-profile-menu-effects';

interface ProbeProps {
  hasInitialized?: boolean;
  isProfileMenuOpen?: boolean;
  onClose: () => void;
  selectedProfileId?: string;
}

const Probe = ({
  hasInitialized = true,
  isProfileMenuOpen = true,
  onClose,
  selectedProfileId = 'profile-1',
}: ProbeProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useProfileMenuEffects({
    closeProfileMenu: onClose,
    hasInitialized,
    isProfileMenuOpen,
    profileMenuButtonRef: buttonRef,
    profileMenuListRef: listRef,
    selectedProfileId,
  });

  return (
    <>
      <button ref={buttonRef} type="button">
        Profile
      </button>
      <div ref={listRef} role="listbox" tabIndex={-1}>
        <button type="button">Inside</button>
      </div>
      <button type="button">Outside</button>
    </>
  );
};

describe('profile menu effects', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('closes the menu on outside pointer down but ignores inside pointer down', () => {
    const onClose = vi.fn();
    render(<Probe onClose={onClose} />);

    screen.getByRole('button', { name: 'Inside' }).dispatchEvent(
      new Event('pointerdown', { bubbles: true }),
    );
    expect(onClose).not.toHaveBeenCalled();

    screen.getByRole('button', { name: 'Outside' }).dispatchEvent(
      new Event('pointerdown', { bubbles: true }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and restores focus to the profile button', () => {
    const onClose = vi.fn();
    render(<Probe onClose={onClose} />);

    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Escape',
    });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Profile' }));
  });

  it('focuses the menu list when opened', () => {
    vi.useFakeTimers();
    render(<Probe onClose={vi.fn()} />);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.activeElement).toBe(screen.getByRole('listbox'));
  });

  it('closes when the guided start replaces the menu', () => {
    const onClose = vi.fn();
    render(<Probe onClose={onClose} selectedProfileId="" />);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
