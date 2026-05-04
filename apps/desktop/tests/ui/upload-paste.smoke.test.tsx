import {
  act,
  cleanup,
  render,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadPaste } from '../../src/features/upload/use-upload-paste';
import type { UploadCandidate } from '../../src/features/upload/upload-candidates';
import type {
  PersistSystemClipboardImageResult,
  UploadSource,
} from '../../src/shared/ipc';

const createPasteEvent = (): ClipboardEvent => {
  const event = new Event('paste', {
    bubbles: true,
    cancelable: true,
  }) as ClipboardEvent;
  Object.defineProperty(event, 'clipboardData', {
    configurable: true,
    value: {
      items: [],
      files: [],
    },
  });
  return event;
};

interface ProbeProps {
  collectCandidates?: (dataTransfer: DataTransfer | null) => UploadCandidate[];
  handleUploadCandidates?: (candidates: UploadCandidate[]) => Promise<void> | void;
  isConnectionReady?: boolean;
  onInlineFeedback?: (message: string) => void;
  onStatusLine?: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  persistClipboardImageFromSystem?: () => Promise<PersistSystemClipboardImageResult | null>;
  startUploadFromSources?: (sources: UploadSource[]) => Promise<void> | void;
}

const Probe = ({
  collectCandidates = vi.fn(() => []),
  handleUploadCandidates = vi.fn(),
  isConnectionReady = true,
  onInlineFeedback = vi.fn(),
  onStatusLine = vi.fn(),
  persistClipboardImageFromSystem = vi.fn(async () => null),
  startUploadFromSources = vi.fn(),
}: ProbeProps) => {
  useUploadPaste({
    collectCandidates,
    handleUploadCandidates,
    isConnectionReady,
    onInlineFeedback,
    onStatusLine,
    persistClipboardImageFromSystem,
    startUploadFromSources,
  });

  return null;
};

describe('useUploadPaste', () => {
  afterEach(() => {
    cleanup();
  });

  it('uploads clipboard candidates and reports paste feedback', async () => {
    const candidate = {
      file: new File(['image'], 'image.png', { type: 'image/png' }),
      relativePath: 'image.png',
    };
    const collectCandidates = vi.fn(() => [candidate]);
    const handleUploadCandidates = vi.fn(async () => undefined);
    const onStatusLine = vi.fn();

    render(
      <Probe
        collectCandidates={collectCandidates}
        handleUploadCandidates={handleUploadCandidates}
        onStatusLine={onStatusLine}
      />,
    );

    await act(async () => {
      document.dispatchEvent(createPasteEvent());
    });

    expect(onStatusLine).toHaveBeenCalledWith(
      'Pasted 1 file. Starting upload...',
      'neutral',
    );
    expect(handleUploadCandidates).toHaveBeenCalledWith([candidate]);
  });

  it('uses the system clipboard image fallback when clipboard data has no files', async () => {
    const persistClipboardImageFromSystem = vi.fn(async () => ({
      fileName: 'clipboard.png',
      mimeType: 'image/png',
      path: '/tmp/clipboard.png',
      size: 123,
    }));
    const startUploadFromSources = vi.fn(async () => undefined);
    const onInlineFeedback = vi.fn();

    render(
      <Probe
        onInlineFeedback={onInlineFeedback}
        persistClipboardImageFromSystem={persistClipboardImageFromSystem}
        startUploadFromSources={startUploadFromSources}
      />,
    );

    await act(async () => {
      document.dispatchEvent(createPasteEvent());
    });

    await waitFor(() =>
      expect(startUploadFromSources).toHaveBeenCalledWith([
        {
          path: '/tmp/clipboard.png',
          size: 123,
        },
      ]),
    );
    expect(onInlineFeedback).toHaveBeenCalledWith('Pasted 1 file');
  });

  it('ignores paste events when the connection is not ready', async () => {
    const collectCandidates = vi.fn(() => []);
    const persistClipboardImageFromSystem = vi.fn(async () => null);

    render(
      <Probe
        collectCandidates={collectCandidates}
        isConnectionReady={false}
        persistClipboardImageFromSystem={persistClipboardImageFromSystem}
      />,
    );

    await act(async () => {
      document.dispatchEvent(createPasteEvent());
    });

    expect(collectCandidates).not.toHaveBeenCalled();
    expect(persistClipboardImageFromSystem).not.toHaveBeenCalled();
  });
});
