import { basename } from 'node:path';
import type {
  CheckUploadConflictsInput,
  CheckUploadConflictsResult,
  PersistClipboardFileInput,
  PersistSystemClipboardImageResult,
  ProfileSummary,
  StartUploadInput,
  UploadJobStatus,
  UploadSource,
} from '../../../../shared/ipc';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

export interface AssetIngestionApplicationService {
  cancelUpload(jobId: string): Promise<void> | void;
  checkUploadConflicts(
    input: CheckUploadConflictsInput,
  ): Promise<CheckUploadConflictsResult>;
  getUploadJob(jobId: string): Promise<UploadJobStatus> | UploadJobStatus;
  persistClipboardFile(input: PersistClipboardFileInput): Promise<string>;
  persistClipboardImageFromSystem(): Promise<PersistSystemClipboardImageResult | null>;
  startUpload(input: StartUploadInput): Promise<string>;
}

export interface AssetIngestionApplicationServiceDependencies {
  abortUploadJob(jobId: string): void;
  assertProfileExists(profileId: string): StoredProfile;
  checkStorageUploadConflicts(
    profile: StoredProfile,
    secret: ProfileSecret,
    input: CheckUploadConflictsInput,
  ): Promise<CheckUploadConflictsResult>;
  createUploadJob(input: StartUploadInput): UploadJobStatus;
  dedupeUploadSources(sources: UploadSource[]): UploadSource[];
  expandUploadSources(sources: UploadSource[]): Promise<UploadSource[]>;
  fixtureAssetExists(key: string): boolean;
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  getUploadJob(jobId: string): UploadJobStatus | undefined;
  isE2EFixtureProfile(profileId: string): boolean;
  markUploadJobFailed(jobId: string, input: StartUploadInput, error: unknown): void;
  normalizeClipboardFileName(fileName: string | undefined, mimeType: string | undefined): string;
  normalizeDestinationPrefix(destinationPrefix: string): string;
  persistClipboardBytes(fileName: string, bytes: Buffer): Promise<string>;
  readSystemClipboardPng(): Buffer | null;
  runE2EFixtureUploadJob(jobId: string, input: StartUploadInput): Promise<void>;
  runUploadJob(jobId: string, input: StartUploadInput): Promise<void>;
  saveUploadJob(job: UploadJobStatus): void;
  saveUploadJobStatus(jobId: string, job: UploadJobStatus): void;
  sourceRelativePathOrFileName(source: UploadSource): string;
  toClipboardBytes(input: Uint8Array | undefined): Uint8Array | null;
  uploadConflictPreviewDefaultLimit: number;
}

const normalizeConflictPreviewLimit = (limit: number | undefined): number =>
  Math.max(1, Math.min(100, limit ?? 8));

export const createAssetIngestionApplicationService = (
  dependencies: AssetIngestionApplicationServiceDependencies,
): AssetIngestionApplicationService => ({
  persistClipboardFile: async (input) => {
    const bytes = dependencies.toClipboardBytes(input?.bytes);
    if (!bytes || bytes.byteLength === 0) {
      throw new Error('Clipboard payload is empty');
    }

    const normalizedFileName = dependencies.normalizeClipboardFileName(
      input.fileName,
      input.mimeType,
    );
    return dependencies.persistClipboardBytes(normalizedFileName, Buffer.from(bytes));
  },

  persistClipboardImageFromSystem: async () => {
    const pngBytes = dependencies.readSystemClipboardPng();
    if (!pngBytes || pngBytes.byteLength === 0) {
      return null;
    }

    const fileName = 'clipboard.png';
    const outputPath = await dependencies.persistClipboardBytes(fileName, pngBytes);
    return {
      path: outputPath,
      size: pngBytes.byteLength,
      fileName,
      mimeType: 'image/png',
    };
  },

  checkUploadConflicts: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      const limit = normalizeConflictPreviewLimit(
        input.limit ?? dependencies.uploadConflictPreviewDefaultLimit,
      );
      const conflicts: CheckUploadConflictsResult['conflicts'] = [];
      let totalConflicts = 0;
      const seen = new Set<string>();
      const normalizedPrefix = dependencies.normalizeDestinationPrefix(
        input.destinationPrefix,
      );
      for (const source of input.sources) {
        const relativePath = dependencies.sourceRelativePathOrFileName(source);
        const key = `${normalizedPrefix}${relativePath}`;
        const hasConflict = seen.has(key) || dependencies.fixtureAssetExists(key);
        seen.add(key);
        if (!hasConflict) {
          continue;
        }
        totalConflicts += 1;
        if (conflicts.length < limit) {
          conflicts.push({
            sourcePath: source.path,
            fileName: basename(relativePath),
            key,
          });
        }
      }
      return { conflicts, totalConflicts };
    }

    const profile = dependencies.assertProfileExists(input.profileId);
    const secret = dependencies.getProfileSecretOrThrow(profile.id);
    const expandedSources = await dependencies.expandUploadSources(input.sources);
    if (expandedSources.length === 0) {
      return {
        conflicts: [],
        totalConflicts: 0,
      };
    }
    return dependencies.checkStorageUploadConflicts(profile, secret, {
      ...input,
      sources: expandedSources,
    });
  },

  startUpload: async (input) => {
    if (dependencies.isE2EFixtureProfile(input.profileId)) {
      if (input.sources.length === 0) {
        throw new Error('At least one source file is required');
      }
      const normalizedInput: StartUploadInput = {
        ...input,
        sources: dependencies.dedupeUploadSources(input.sources),
      };
      const job = dependencies.createUploadJob(normalizedInput);
      dependencies.saveUploadJob(job);
      void dependencies.runE2EFixtureUploadJob(job.id, normalizedInput).catch((error) => {
        dependencies.markUploadJobFailed(job.id, normalizedInput, error);
      });
      return job.id;
    }

    dependencies.assertProfileExists(input.profileId);
    if (input.sources.length === 0) {
      throw new Error('At least one source file is required');
    }
    const expandedSources = await dependencies.expandUploadSources(input.sources);
    if (expandedSources.length === 0) {
      throw new Error('No uploadable files found in selected source(s)');
    }
    const normalizedInput: StartUploadInput = {
      ...input,
      sources: expandedSources,
    };
    const job = dependencies.createUploadJob(normalizedInput);
    dependencies.saveUploadJob(job);
    void dependencies.runUploadJob(job.id, normalizedInput).catch((error) => {
      dependencies.markUploadJobFailed(job.id, normalizedInput, error);
    });
    return job.id;
  },

  getUploadJob: (jobId) => {
    const job = dependencies.getUploadJob(jobId);
    if (!job) {
      throw new Error(`Upload job not found: ${jobId}`);
    }
    return job;
  },

  cancelUpload: (jobId) => {
    const job = dependencies.getUploadJob(jobId);
    if (!job) {
      throw new Error(`Upload job not found: ${jobId}`);
    }

    if (job.status === 'done' || job.status === 'failed') {
      return;
    }
    dependencies.saveUploadJobStatus(jobId, {
      ...job,
      status: 'canceled',
      updatedAt: new Date().toISOString(),
    });
    dependencies.abortUploadJob(jobId);
  },
});
