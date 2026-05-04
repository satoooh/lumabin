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
  expandUploadSources(sources: UploadSource[]): Promise<UploadSource[]>;
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  getUploadJob(jobId: string): UploadJobStatus | undefined;
  checkUploadConflictsOverride(
    input: CheckUploadConflictsInput,
  ): Promise<CheckUploadConflictsResult | undefined> | CheckUploadConflictsResult | undefined;
  markUploadJobFailed(jobId: string, input: StartUploadInput, error: unknown): void;
  normalizeClipboardFileName(fileName: string | undefined, mimeType: string | undefined): string;
  persistClipboardBytes(fileName: string, bytes: Buffer): Promise<string>;
  readSystemClipboardPng(): Buffer | null;
  startUploadOverride(input: StartUploadInput): Promise<string | undefined> | string | undefined;
  runUploadJob(jobId: string, input: StartUploadInput): Promise<void>;
  saveUploadJob(job: UploadJobStatus): void;
  saveUploadJobStatus(jobId: string, job: UploadJobStatus): void;
  toClipboardBytes(input: Uint8Array | undefined): Uint8Array | null;
}

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
    const overrideResult = await dependencies.checkUploadConflictsOverride(input);
    if (overrideResult !== undefined) {
      return overrideResult;
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
    const overrideJobId = await dependencies.startUploadOverride(input);
    if (overrideJobId !== undefined) {
      return overrideJobId;
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
