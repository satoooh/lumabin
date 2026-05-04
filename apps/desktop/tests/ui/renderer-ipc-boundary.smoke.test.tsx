import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_ROOT = join(process.cwd(), 'src');
const DIRECT_PRELOAD_API_PATTERN = /window\.lumabin/g;
const ALLOWED_DIRECT_PRELOAD_API_FILE = 'App.tsx';

const listSourceFiles = (directory: string): string[] => {
  const entries = readdirSync(directory);
  return entries.flatMap((entry) => {
    const filePath = join(directory, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      return listSourceFiles(filePath);
    }
    return /\.(ts|tsx)$/.test(entry) ? [filePath] : [];
  });
};

describe('renderer IPC boundary', () => {
  it('keeps direct preload API access inside the renderer composition root', () => {
    const directAccessFiles = listSourceFiles(SOURCE_ROOT).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const matchCount = source.match(DIRECT_PRELOAD_API_PATTERN)?.length ?? 0;
      if (matchCount === 0) {
        return [];
      }
      return [
        {
          matchCount,
          relativePath: relative(SOURCE_ROOT, filePath),
        },
      ];
    });

    expect(directAccessFiles).toEqual([
      {
        matchCount: 1,
        relativePath: ALLOWED_DIRECT_PRELOAD_API_FILE,
      },
    ]);
  });
});
