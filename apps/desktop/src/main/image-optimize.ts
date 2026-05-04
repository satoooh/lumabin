import { randomUUID } from 'node:crypto';
import { mkdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';

const OPTIMIZABLE_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.avif',
]);

const isOptimizableImage = (filePath: string): boolean => {
  const extension = extname(filePath).toLowerCase();
  return OPTIMIZABLE_IMAGE_EXTENSIONS.has(extension);
};

const toWebpFileName = (filePath: string): string => {
  const sourceFileName = basename(filePath);
  const extension = extname(sourceFileName);
  if (!extension) {
    return `${sourceFileName}.webp`;
  }
  return `${sourceFileName.slice(0, -extension.length)}.webp`;
};

export interface MaybeOptimizeImageInput {
  sourcePath: string;
  sourceSize: number;
  enabled: boolean;
  maxWidthPx: number;
  webpQuality: number;
}

export interface MaybeOptimizeImageResult {
  sourcePath: string;
  sourceSize: number;
  fileName: string;
  optimized: boolean;
  cleanup: () => Promise<void>;
}

let sharpLoader: Promise<typeof import('sharp') | null> | null = null;

const loadSharp = async (): Promise<typeof import('sharp') | null> => {
  if (!sharpLoader) {
    sharpLoader = import('sharp')
      .then((module): typeof import('sharp') => {
        if ('default' in module) {
          return module.default;
        }
        return module;
      })
      .catch((): typeof import('sharp') | null => null);
  }
  return sharpLoader;
};

export const maybeOptimizeImageForUpload = async (
  input: MaybeOptimizeImageInput,
): Promise<MaybeOptimizeImageResult> => {
  const fallback: MaybeOptimizeImageResult = {
    sourcePath: input.sourcePath,
    sourceSize: input.sourceSize,
    fileName: basename(input.sourcePath),
    optimized: false,
    cleanup: async () => undefined,
  };

  if (!input.enabled || !isOptimizableImage(input.sourcePath)) {
    return fallback;
  }

  const sharp = await loadSharp();
  if (!sharp) {
    return fallback;
  }

  const tempDirectory = join(tmpdir(), `lumabin-upload-opt-${randomUUID()}`);
  const optimizedFileName = toWebpFileName(input.sourcePath);
  const optimizedPath = join(tempDirectory, optimizedFileName);

  try {
    const metadata = await sharp(input.sourcePath, { failOn: 'none' }).metadata();
    let transformer = sharp(input.sourcePath, { failOn: 'none' }).rotate();
    if (metadata.width && metadata.width > input.maxWidthPx) {
      transformer = transformer.resize({
        width: input.maxWidthPx,
        withoutEnlargement: true,
      });
    }

    await mkdir(tempDirectory, { recursive: true });
    await transformer.webp({ quality: input.webpQuality }).toFile(optimizedPath);
    const optimizedStats = await stat(optimizedPath);

    return {
      sourcePath: optimizedPath,
      sourceSize: optimizedStats.size,
      fileName: optimizedFileName,
      optimized: true,
      cleanup: async () => {
        await rm(tempDirectory, { recursive: true, force: true });
      },
    };
  } catch {
    await rm(tempDirectory, { recursive: true, force: true });
    return fallback;
  }
};
