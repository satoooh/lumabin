import { describe, expect, it } from 'vitest';
import { extractLegacyPublicBaseUrls } from '../../src/features/settings/use-legacy-public-base-url-migration';

describe('legacy public base URL migration', () => {
  it('extracts normalized URL bases from legacy per-profile storage', () => {
    expect(
      extractLegacyPublicBaseUrls({
        'profile-1': ' https://cdn.example/assets/ ',
        'profile-2': '',
        'profile-3': 'https://static.example/public',
        'profile-4': 42,
      }),
    ).toEqual({
      'profile-1': 'https://cdn.example/assets/',
      'profile-3': 'https://static.example/public',
    });
  });

  it('ignores malformed legacy payloads', () => {
    expect(extractLegacyPublicBaseUrls(null)).toEqual({});
    expect(extractLegacyPublicBaseUrls('not-json-object')).toEqual({});
  });
});
