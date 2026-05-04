import { describe, expect, it } from 'vitest';
import { toUploadFailureMessage } from '../../src/features/upload/upload-failure-message';

describe('upload failure message policy', () => {
  it('normalizes missing source file messages to a recoverable user action', () => {
    expect(toUploadFailureMessage('ENOENT: no such file or directory')).toBe(
      'Source file is missing on disk. Confirm the file still exists, then retry failed files.',
    );
    expect(toUploadFailureMessage('Source file not found: photo.png')).toBe(
      'Source file is missing on disk. Confirm the file still exists, then retry failed files.',
    );
  });

  it('normalizes source permission failures', () => {
    expect(toUploadFailureMessage('EACCES: permission denied')).toBe(
      'Cannot read source file due to permissions. Check access rights, then retry.',
    );
    expect(toUploadFailureMessage('EPERM: operation not permitted')).toBe(
      'Cannot read source file due to permissions. Check access rights, then retry.',
    );
  });

  it('preserves unknown messages and empty state', () => {
    expect(toUploadFailureMessage()).toBe('');
    expect(toUploadFailureMessage('Upload failed for an unknown reason.')).toBe(
      'Upload failed for an unknown reason.',
    );
  });
});
