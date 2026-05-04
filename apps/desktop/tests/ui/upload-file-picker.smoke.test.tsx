import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUploadFilePicker } from '../../src/features/upload/use-upload-file-picker';
import type { UploadCandidate } from '../../src/features/upload/upload-candidates';

interface ProbeProps {
  onStatusLine?: (message: string, tone: 'neutral' | 'success' | 'error') => void;
  onUploadCandidates?: (candidates: UploadCandidate[]) => Promise<void> | void;
  selectedProfileId?: string;
}

const Probe = ({
  onStatusLine = vi.fn(),
  onUploadCandidates = vi.fn(),
  selectedProfileId = 'profile-1',
}: ProbeProps) => {
  const {
    fileInputRef,
    handleFilePickerChange,
    handleOpenFilePicker,
  } = useUploadFilePicker({
    onStatusLine,
    onUploadCandidates,
    selectedProfileId,
  });

  return (
    <>
      <button type="button" onClick={handleOpenFilePicker}>
        Open picker
      </button>
      <input
        ref={fileInputRef}
        aria-label="Upload files"
        multiple
        onChange={handleFilePickerChange}
        type="file"
      />
    </>
  );
};

describe('useUploadFilePicker', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('opens the file picker when a profile is selected', () => {
    const onStatusLine = vi.fn();
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);

    render(<Probe onStatusLine={onStatusLine} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open picker' }));

    expect(onStatusLine).toHaveBeenCalledWith('Choose files to upload.', 'neutral');
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('blocks file picker opening until a profile is selected', () => {
    const onStatusLine = vi.fn();
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);

    render(
      <Probe
        onStatusLine={onStatusLine}
        selectedProfileId=""
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open picker' }));

    expect(onStatusLine).toHaveBeenCalledWith('Select a profile first.', 'error');
    expect(click).not.toHaveBeenCalled();
  });

  it('converts selected files into upload candidates and clears the input', () => {
    const onUploadCandidates = vi.fn();
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    Object.defineProperty(file, 'webkitRelativePath', {
      configurable: true,
      value: '/album//image.png',
    });

    render(<Probe onUploadCandidates={onUploadCandidates} />);
    const input = screen.getByLabelText('Upload files') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    });

    fireEvent.change(input);

    expect(onUploadCandidates).toHaveBeenCalledWith([
      {
        file,
        relativePath: 'album/image.png',
      },
    ]);
    expect(input.value).toBe('');
  });
});
