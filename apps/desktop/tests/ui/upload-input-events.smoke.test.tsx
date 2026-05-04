import { describe, expect, it, vi } from 'vitest';
import {
  clipboardFallbackFileName,
  hasFileTransfer,
  isEditableEventTarget,
  isLikelyAbsolutePath,
} from '../../src/features/upload/upload-input-events';

describe('upload input events', () => {
  it('keeps browser-provided file names when available', () => {
    const file = new File(['hello'], ' original.png ', { type: 'image/png' });

    expect(clipboardFallbackFileName(file, 0)).toBe('original.png');
  });

  it('builds stable clipboard fallback names from known mime types', () => {
    vi.setSystemTime(new Date('2026-05-03T00:00:00.000Z'));
    const file = new File(['hello'], '', { type: 'image/png' });

    expect(clipboardFallbackFileName(file, 1)).toBe('clipboard-1777766400000-2.png');
  });

  it('detects editable paste targets', () => {
    const input = document.createElement('input');
    const wrapper = document.createElement('div');
    wrapper.setAttribute('contenteditable', 'true');
    const child = document.createElement('span');
    wrapper.append(child);

    expect(isEditableEventTarget(input)).toBe(true);
    expect(isEditableEventTarget(child)).toBe(true);
    expect(isEditableEventTarget(document.createElement('button'))).toBe(false);
  });

  it('detects absolute paths and file drag payloads', () => {
    expect(isLikelyAbsolutePath('/tmp/file.png')).toBe(true);
    expect(isLikelyAbsolutePath('C:\\Users\\file.png')).toBe(true);
    expect(isLikelyAbsolutePath('relative/file.png')).toBe(false);

    const fileDragEvent = {
      dataTransfer: {
        types: ['text/plain', 'Files'],
      },
    } as unknown as DragEvent;
    const textDragEvent = {
      dataTransfer: {
        types: ['text/plain'],
      },
    } as unknown as DragEvent;

    expect(hasFileTransfer(fileDragEvent)).toBe(true);
    expect(hasFileTransfer(textDragEvent)).toBe(false);
  });
});
