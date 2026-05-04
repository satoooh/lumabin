import { describe, expect, it } from 'vitest';
import { collectClipboardUploadCandidates } from '../../src/features/upload/upload-candidates';

describe('collectClipboardUploadCandidates', () => {
  it('prefers clipboard dataTransfer items when present', () => {
    const itemFile = new File(['item'], 'item.png', { type: 'image/png' });
    const fallbackFile = new File(['fallback'], 'fallback.png', { type: 'image/png' });
    const dataTransfer = {
      items: [
        {
          kind: 'file',
          getAsFile: () => itemFile,
        },
      ],
      files: [fallbackFile],
    } as unknown as DataTransfer;

    const candidates = collectClipboardUploadCandidates(dataTransfer);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.file).toBe(itemFile);
  });

  it('falls back to clipboard files list when items are unavailable', () => {
    const fallbackFile = new File(['fallback'], 'fallback.png', { type: 'image/png' });
    const dataTransfer = {
      items: [],
      files: [fallbackFile],
    } as unknown as DataTransfer;

    const candidates = collectClipboardUploadCandidates(dataTransfer);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.file).toBe(fallbackFile);
  });
});
