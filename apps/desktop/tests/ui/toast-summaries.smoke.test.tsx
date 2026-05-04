import { describe, expect, it } from 'vitest';
import { formatCount } from '../../src/features/shared/format-count';

describe('toast summaries', () => {
  it('formats singular and plural counts without mechanical item(s) copy', () => {
    expect(formatCount(1, 'item')).toBe('1 item');
    expect(formatCount(2, 'item')).toBe('2 items');
    expect(formatCount(1, 'file')).toBe('1 file');
    expect(formatCount(3, 'file')).toBe('3 files');
  });
});
