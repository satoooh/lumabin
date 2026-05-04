import { describe, expect, it } from 'vitest';
import {
  basenameFromKey,
  commonParentPrefixFromKeys,
  parentPrefixFromKey,
} from '../../src/features/shared/asset-key';

describe('asset key state', () => {
  it('derives basename and parent prefix from object keys', () => {
    expect(basenameFromKey('photos/2026/image.png')).toBe('image.png');
    expect(basenameFromKey('/photos/2026/')).toBe('2026');
    expect(parentPrefixFromKey('photos/2026/image.png')).toBe('photos/2026/');
    expect(parentPrefixFromKey('image.png')).toBe('');
  });

  it('finds the common parent prefix for bulk moves', () => {
    expect(commonParentPrefixFromKeys([
      'photos/2026/day1/a.png',
      'photos/2026/day2/b.png',
    ])).toBe('photos/2026/');

    expect(commonParentPrefixFromKeys([
      'photos/a.png',
      'videos/b.mp4',
    ])).toBe('');

    expect(commonParentPrefixFromKeys([])).toBe('');
  });
});
