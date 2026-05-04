import {
  cleanup,
  render,
  waitFor,
} from '@testing-library/react';
import {
  useEffect,
  useRef,
} from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadCandidateUpload } from '../../src/features/upload/use-upload-candidate-upload';
import type { UploadCandidate } from '../../src/features/upload/upload-candidates';
import type { UploadSource } from '../../src/shared/ipc';

interface ProbeProps {
  candidates: UploadCandidate[];
  files: {
    getPathForFile: (file: File) => string;
    persistClipboardFile: (input: {
      fileName?: string;
      mimeType?: string;
      bytes: Uint8Array;
    }) => Promise<string>;
  };
  onInlineFeedback?: (message: string) => void;
  onStatusLine?: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  startUploadFromSources?: (sources: UploadSource[]) => Promise<void> | void;
}

const Probe = ({
  candidates,
  files,
  onInlineFeedback = vi.fn(),
  onStatusLine = vi.fn(),
  startUploadFromSources = vi.fn(),
}: ProbeProps) => {
  const didStartRef = useRef(false);
  const handleUploadCandidates = useUploadCandidateUpload({
    files,
    onInlineFeedback,
    onStatusLine,
    startUploadFromSources,
  });

  useEffect(() => {
    if (didStartRef.current) {
      return;
    }
    didStartRef.current = true;
    void handleUploadCandidates(candidates);
  }, [candidates, handleUploadCandidates]);

  return null;
};

describe('useUploadCandidateUpload', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('resolves candidates and starts upload from sources', async () => {
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const startUploadFromSources = vi.fn(async () => undefined);

    render(
      <Probe
        candidates={[{ file, relativePath: 'album/image.png' }]}
        files={{
          getPathForFile: vi.fn(() => '/tmp/image.png'),
          persistClipboardFile: vi.fn(async () => ''),
        }}
        startUploadFromSources={startUploadFromSources}
      />,
    );

    await waitFor(() =>
      expect(startUploadFromSources).toHaveBeenCalledWith([
        {
          path: '/tmp/image.png',
          relativePath: 'album/image.png',
          size: file.size,
        },
      ]),
    );
  });

  it('reports unresolved files and still delegates the empty source list', async () => {
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const onStatusLine = vi.fn();
    const startUploadFromSources = vi.fn(async () => undefined);

    render(
      <Probe
        candidates={[{ file }]}
        files={{
          getPathForFile: vi.fn(() => ''),
          persistClipboardFile: vi.fn(async () => ''),
        }}
        onStatusLine={onStatusLine}
        startUploadFromSources={startUploadFromSources}
      />,
    );

    await waitFor(() => expect(startUploadFromSources).toHaveBeenCalledWith([]));
    expect(onStatusLine).toHaveBeenCalledWith(
      'Skipped 1 file: local path unavailable',
      'error',
    );
  });

  it('reports clipboard persistence feedback', async () => {
    vi.setSystemTime(new Date('2026-05-03T00:00:00.000Z'));
    const file = new File(['image'], '', { type: 'image/png' });
    const onInlineFeedback = vi.fn();

    render(
      <Probe
        candidates={[{ file }]}
        files={{
          getPathForFile: vi.fn(() => ''),
          persistClipboardFile: vi.fn(async () => '/tmp/clipboard.png'),
        }}
        onInlineFeedback={onInlineFeedback}
      />,
    );

    await waitFor(() => expect(onInlineFeedback).toHaveBeenCalledWith('Pasted 1 file'));
  });
});
