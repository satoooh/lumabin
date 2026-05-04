import { cleanup, render } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAppDomRefs } from '../../src/features/layout/use-app-dom-refs';

type AppDomRefs = ReturnType<typeof useAppDomRefs>;

interface ProbeProps {
  onRefs: (refs: AppDomRefs) => void;
}

const Probe = ({ onRefs }: ProbeProps) => {
  const refs = useAppDomRefs();
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    onRefs(refs);
    if (tick === 0) {
      setTick(1);
    }
  }, [onRefs, refs, tick]);

  return <div data-tick={tick} />;
};

describe('app DOM refs', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps root DOM ref identities stable across rerenders', async () => {
    const snapshots: AppDomRefs[] = [];

    render(<Probe onRefs={(refs) => snapshots.push(refs)} />);

    await vi.waitFor(() => {
      expect(snapshots.length).toBeGreaterThanOrEqual(2);
    });

    const [first, second] = snapshots;
    expect(second.appShellRef).toBe(first.appShellRef);
    expect(second.searchInputRef).toBe(first.searchInputRef);
    expect(second.galleryScrollRef).toBe(first.galleryScrollRef);
    expect(second.listContainerRef).toBe(first.listContainerRef);
    expect(second.profileFormRefs).toBe(first.profileFormRefs);
    expect(second.profileFormRefs.profileNameInputRef).toBe(first.profileFormRefs.profileNameInputRef);
    expect(second.profileFormRefs.profileSecretKeyInputRef).toBe(first.profileFormRefs.profileSecretKeyInputRef);
    expect(second.uploadToastRef).toBe(first.uploadToastRef);
  });
});
