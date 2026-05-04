import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_ROOT = join(process.cwd(), 'src');
const CONTEXTS_ROOT = join(SOURCE_ROOT, 'main/application/contexts');

const runtimeCompositionFiles = new Set([
  'runtime-composition.ts',
  'query-runtime-composition.ts',
  'projection-runtime-composition.ts',
]);

const infrastructureImportPattern =
  /from\s+['"](?:\.\.\/){3}(?:adapters|repositories|storage-client|search-index|asset-cache|persistent-state|profile-secret-store|application-policies)(?:\/|['"])/;
const relativeImportPattern = /from\s+['"](?<specifier>\.{1,2}\/[^'"]+)['"]/g;

const listTypeScriptFiles = (root: string): string[] => {
  const entries = readdirSync(root);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(root, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath));
      continue;
    }

    if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
};

const contextNameForFile = (filePath: string) => relative(CONTEXTS_ROOT, filePath).split(sep)[0];

describe('main architecture boundaries', () => {
  it('keeps context services and transports away from direct infrastructure imports', () => {
    const violations = listTypeScriptFiles(CONTEXTS_ROOT)
      .filter((filePath) => !runtimeCompositionFiles.has(filePath.split(sep).at(-1) ?? ''))
      .flatMap((filePath) => {
        const source = readFileSync(filePath, 'utf8');

        if (!infrastructureImportPattern.test(source)) {
          return [];
        }

        return [relative(SOURCE_ROOT, filePath)];
      });

    expect(violations).toEqual([]);
  });

  it('keeps bounded contexts from importing sibling context modules directly', () => {
    const violations = listTypeScriptFiles(CONTEXTS_ROOT).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const contextName = contextNameForFile(filePath);
      const fileViolations: string[] = [];

      for (const match of source.matchAll(relativeImportPattern)) {
        const specifier = match.groups?.specifier;

        if (!specifier) {
          continue;
        }

        const resolvedPath = join(dirname(filePath), specifier);

        if (!existsSync(resolvedPath) && !existsSync(`${resolvedPath}.ts`)) {
          continue;
        }

        const targetPath = existsSync(resolvedPath) ? resolvedPath : `${resolvedPath}.ts`;

        if (!relative(CONTEXTS_ROOT, targetPath).startsWith('..')) {
          const targetContextName = contextNameForFile(targetPath);

          if (targetContextName !== contextName) {
            fileViolations.push(`${relative(SOURCE_ROOT, filePath)} -> ${specifier}`);
          }
        }
      }

      return fileViolations;
    });

    expect(violations).toEqual([]);
  });
});
