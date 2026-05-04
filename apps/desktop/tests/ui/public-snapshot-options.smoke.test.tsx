import { describe, expect, it } from 'vitest';
import {
  normalizeSnapshotSlug,
  parseSnapshotArgs,
} from '../../scripts/create-public-snapshot.mjs';

describe('public snapshot options', () => {
  it('defaults to the private codename slug for existing release automation compatibility', () => {
    expect(parseSnapshotArgs([])).toEqual({
      allowDirty: false,
      slug: 'lumabin',
    });
  });

  it('accepts an explicit public repository slug for snapshot import archives', () => {
    expect(parseSnapshotArgs(['--allow-dirty', '--slug', 'public-import'])).toEqual({
      allowDirty: true,
      slug: 'public-import',
    });
    expect(parseSnapshotArgs(['--slug=object-pane'])).toEqual({
      allowDirty: false,
      slug: 'object-pane',
    });
  });

  it('normalizes and rejects slugs that are unsafe for archive roots', () => {
    expect(normalizeSnapshotSlug('Public-Import')).toBe('public-import');
    expect(() => normalizeSnapshotSlug('../public-import')).toThrow(/snapshot slug/);
    expect(() => normalizeSnapshotSlug('public--import')).toThrow(/snapshot slug/);
    expect(() => parseSnapshotArgs(['--slug'])).toThrow(/requires a value/);
    expect(() => parseSnapshotArgs(['--unknown'])).toThrow(/unknown option/);
  });
});
