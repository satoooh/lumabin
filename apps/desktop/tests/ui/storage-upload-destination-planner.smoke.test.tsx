import { describe, expect, it } from 'vitest';
import {
  resolveStorageUploadDestinationKey,
  toInitialStorageUploadDestinationKey,
} from '../../src/main/adapters/storage-upload-destination-planner';
import {
  normalizeDestinationPrefix,
  sourceRelativePathOrFileName,
  splitFileName,
} from '../../src/main/adapters/upload-planning-adapter';
import type { StartUploadInput, UploadSource } from '../../src/shared/ipc';

const dependencies = {
  getDefaultConflictPolicy: (): StartUploadInput['conflictPolicy'] => 'rename',
  normalizeDestinationPrefix,
  sourceRelativePathOrFileName,
  splitFileName,
};

const source: UploadSource = {
  path: '/tmp/photo.png',
  size: 12_345,
};

describe('storage upload destination planner', () => {
  it('builds initial destination keys from prefixes and optimized file names', () => {
    expect(toInitialStorageUploadDestinationKey('photos', source, dependencies)).toBe(
      'photos/photo.png',
    );
    expect(
      toInitialStorageUploadDestinationKey(
        'photos',
        source,
        dependencies,
        'photo.webp',
      ),
    ).toBe('photos/photo.webp');
  });

  it('applies overwrite and skip policies when the target already exists', async () => {
    await expect(
      resolveStorageUploadDestinationKey({
        conflictPolicy: 'overwrite',
        dependencies,
        destinationPrefix: 'photos',
        objectExists: async () => true,
        source,
      }),
    ).resolves.toBe('photos/photo.png');

    await expect(
      resolveStorageUploadDestinationKey({
        conflictPolicy: 'skip',
        dependencies,
        destinationPrefix: 'photos',
        objectExists: async () => true,
        source,
      }),
    ).resolves.toBeNull();
  });

  it('allocates the first available renamed destination for rename conflicts', async () => {
    const existingKeys = new Set(['photos/photo.png', 'photos/photo-1.png']);

    await expect(
      resolveStorageUploadDestinationKey({
        conflictPolicy: 'rename',
        dependencies,
        destinationPrefix: 'photos',
        objectExists: async (key) => existingKeys.has(key),
        source,
      }),
    ).resolves.toBe('photos/photo-2.png');
  });

  it('preserves source relative directories while allocating rename conflicts', async () => {
    const relativeSource: UploadSource = {
      path: '/tmp/photo.png',
      relativePath: 'imports/photo.png',
      size: 12_345,
    };
    const existingKeys = new Set([
      'photos/imports/photo.png',
      'photos/imports/photo-1.png',
    ]);

    await expect(
      resolveStorageUploadDestinationKey({
        conflictPolicy: undefined,
        dependencies,
        destinationPrefix: 'photos',
        objectExists: async (key) => existingKeys.has(key),
        source: relativeSource,
      }),
    ).resolves.toBe('photos/imports/photo-2.png');
  });
});
