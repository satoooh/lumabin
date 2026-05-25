import { describe, expect, it } from 'vitest';
import {
  buildLumabinMediaUrl,
  parseLumabinMediaUrl,
} from '../../src/shared/media-url';

describe('media url', () => {
  it('round-trips Japanese asset keys for the local media protocol', () => {
    const key = 'clips/素材/東京 sample.mp4';

    const url = buildLumabinMediaUrl('profile-1', key);

    expect(url).toBe(
      'lumabin-media://asset/profile-1/clips%2F%E7%B4%A0%E6%9D%90%2F%E6%9D%B1%E4%BA%AC%20sample.mp4',
    );
    expect(parseLumabinMediaUrl(url)).toEqual({
      profileId: 'profile-1',
      key,
    });
  });

  it('ignores retry query parameters when parsing media URLs', () => {
    expect(
      parseLumabinMediaUrl(buildLumabinMediaUrl('profile-1', 'clips/sample.mp4', 123)),
    ).toEqual({
      profileId: 'profile-1',
      key: 'clips/sample.mp4',
    });
  });

  it('rejects non-media URLs', () => {
    expect(parseLumabinMediaUrl('https://example.com/clips/sample.mp4')).toBeNull();
  });
});
