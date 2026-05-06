import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('vite main process config', () => {
  it('keeps Node-first runtime packages external for packaged resolution', () => {
    const config = readFileSync(join(process.cwd(), 'vite.main.config.ts'), 'utf8');

    expect(config).toContain("'@aws-sdk/client-s3'");
    expect(config).toContain("'@aws-sdk/s3-request-presigner'");
    expect(config).toContain("'sharp'");
    expect(config).toContain('/^node:/');
  });
});
