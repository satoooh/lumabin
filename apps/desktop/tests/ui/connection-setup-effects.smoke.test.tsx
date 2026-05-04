import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { useConnectionSetupEffects } from '../../src/features/settings/use-connection-setup-effects';
import { extractR2AccountId } from '../../src/features/settings/profile-form-state';
import type { ProfileSummary, SaveProfileInput } from '../../src/shared/ipc';

const r2Profile: ProfileSummary = {
  bucket: 'images',
  endpoint: 'https://abc123def456.r2.cloudflarestorage.com',
  hasSecret: true,
  id: 'profile-1',
  name: 'Production Assets',
  provider: 'r2',
  region: 'auto',
};

interface ProbeProps {
  isConnectionSetupOpen?: boolean;
  isCreatingProfile?: boolean;
  onProfileForm: (value: SaveProfileInput) => void;
  onR2AccountId: (value: string) => void;
  selectedProfile?: ProfileSummary;
}

const Probe = ({
  isConnectionSetupOpen = false,
  isCreatingProfile = false,
  onProfileForm,
  onR2AccountId,
  selectedProfile,
}: ProbeProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useConnectionSetupEffects({
    isConnectionSetupOpen,
    isCreatingProfile,
    profileNameInputRef: inputRef,
    selectedProfile,
    setProfileForm: onProfileForm,
    setR2AccountId: onR2AccountId,
  });

  return <input aria-label="Connection name" ref={inputRef} />;
};

describe('connection setup effects', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
      writable: true,
    });
  });

  it('extracts an R2 account id from a Cloudflare endpoint', () => {
    expect(extractR2AccountId('https://abc123def456.r2.cloudflarestorage.com')).toBe(
      'abc123def456',
    );
    expect(extractR2AccountId('https://abc123def456.r2.cloudflarestorage.com/')).toBe(
      'abc123def456',
    );
    expect(extractR2AccountId('https://example.com')).toBe('');
  });

  it('syncs the selected profile into the connection form', () => {
    const onProfileForm = vi.fn();
    const onR2AccountId = vi.fn();

    render(
      <Probe
        onProfileForm={onProfileForm}
        onR2AccountId={onR2AccountId}
        selectedProfile={r2Profile}
      />,
    );

    expect(onProfileForm).toHaveBeenCalledWith({
      id: 'profile-1',
      name: 'Production Assets',
      provider: 'r2',
      endpoint: 'https://abc123def456.r2.cloudflarestorage.com',
      region: 'auto',
      bucket: 'images',
      accessKeyId: '',
      secretAccessKey: '',
    });
    expect(onR2AccountId).toHaveBeenCalledWith('abc123def456');
  });

  it('does not overwrite the form while creating a new profile', () => {
    const onProfileForm = vi.fn();
    const onR2AccountId = vi.fn();

    render(
      <Probe
        isCreatingProfile={true}
        onProfileForm={onProfileForm}
        onR2AccountId={onR2AccountId}
        selectedProfile={r2Profile}
      />,
    );

    expect(onProfileForm).not.toHaveBeenCalled();
    expect(onR2AccountId).not.toHaveBeenCalled();
  });

  it('focuses the connection name field on fine-pointer devices', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: true,
        media: '(pointer: fine)',
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
      writable: true,
    });

    render(
      <Probe
        isConnectionSetupOpen={true}
        onProfileForm={vi.fn()}
        onR2AccountId={vi.fn()}
      />,
    );

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.activeElement).toBe(screen.getByLabelText('Connection name'));
  });
});
