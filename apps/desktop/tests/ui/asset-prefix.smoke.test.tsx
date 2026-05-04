import { describe, expect, it } from 'vitest';
import { normalizeAssetPrefix } from '../../src/features/shared/asset-prefix';

describe('normalizeAssetPrefix', () => {
  it('trims prefix input and preserves bucket root', () => {
    expect(normalizeAssetPrefix('')).toBe('');
    expect(normalizeAssetPrefix('  ')).toBe('');
    expect(normalizeAssetPrefix(' photos ')).toBe('photos/');
    expect(normalizeAssetPrefix('photos/')).toBe('photos/');
  });
});
