import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadDropZone } from '../../src/features/upload/use-upload-drop-zone';
import type { UploadCandidate } from '../../src/features/upload/upload-candidates';

const createFileDragEvent = (type: string): DragEvent => {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
  }) as DragEvent;
  Object.defineProperty(event, 'dataTransfer', {
    configurable: true,
    value: {
      dropEffect: 'none',
      types: ['Files'],
    },
  });
  return event;
};

interface ProbeProps {
  collectCandidates?: (dataTransfer: DataTransfer | null) => Promise<UploadCandidate[]>;
  onUploadCandidates?: (candidates: UploadCandidate[]) => Promise<void> | void;
}

const Probe = ({
  collectCandidates = vi.fn(async () => []),
  onUploadCandidates = vi.fn(),
}: ProbeProps) => {
  const isDropActive = useUploadDropZone({
    collectCandidates,
    onUploadCandidates,
  });

  return <output>{isDropActive ? 'active' : 'idle'}</output>;
};

describe('useUploadDropZone', () => {
  afterEach(() => {
    cleanup();
  });

  it('tracks active file drags and resets on leave', async () => {
    render(<Probe />);

    expect(screen.getByText('idle')).toBeTruthy();

    await act(async () => {
      window.dispatchEvent(createFileDragEvent('dragenter'));
    });

    expect(screen.getByText('active')).toBeTruthy();

    await act(async () => {
      window.dispatchEvent(createFileDragEvent('dragleave'));
    });

    expect(screen.getByText('idle')).toBeTruthy();
  });

  it('collects dropped candidates and resets the active state', async () => {
    const candidate = {
      file: new File(['image'], 'image.png', { type: 'image/png' }),
      relativePath: 'album/image.png',
    };
    const collectCandidates = vi.fn(async () => [candidate]);
    const onUploadCandidates = vi.fn(async () => undefined);

    render(
      <Probe
        collectCandidates={collectCandidates}
        onUploadCandidates={onUploadCandidates}
      />,
    );

    await act(async () => {
      window.dispatchEvent(createFileDragEvent('dragenter'));
      window.dispatchEvent(createFileDragEvent('drop'));
    });

    await waitFor(() => expect(onUploadCandidates).toHaveBeenCalledWith([candidate]));
    expect(collectCandidates).toHaveBeenCalledTimes(1);
    expect(screen.getByText('idle')).toBeTruthy();
  });
});
