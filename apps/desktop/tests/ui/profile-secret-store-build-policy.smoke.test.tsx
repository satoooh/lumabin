import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('profile secret store build policy', () => {
  it('does not depend on import.meta.url createRequire in the Electron main bundle', () => {
    const source = readFileSync(join(process.cwd(), 'src/main/profile-secret-store.ts'), 'utf8');

    expect(source).not.toContain('createRequire(import.meta.url)');
  });
});
