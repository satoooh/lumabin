import type {
  CheckUploadConflictsResult,
  ConflictPolicy,
  StartUploadInput,
  UploadJobStatus,
  UploadSource,
} from '../../shared/ipc';
import { normalizeAssetPrefix } from '../shared/asset-prefix';
import { formatCount } from '../shared/format-count';

export interface UploadConflictDialogState {
  sources: UploadSource[];
  destinationPrefix: string;
  conflicts: CheckUploadConflictsResult['conflicts'];
  totalConflicts: number;
}

export interface StartUploadFromSourcesOptions {
  destinationPrefix?: string;
  conflictPolicy?: ConflictPolicy;
  label?: string;
  skipConflictCheck?: boolean;
}

export interface UploadQueueCommandRunnerApi {
  checkUploadConflicts(input: {
    profileId: string;
    destinationPrefix: string;
    sources: UploadSource[];
  }): Promise<CheckUploadConflictsResult>;
  getUploadJob(jobId: string): Promise<UploadJobStatus>;
  upload(input: StartUploadInput): Promise<string>;
}

interface RunUploadQueueStartCommandInput {
  assetsPrefix: string;
  defaultConflictPolicy: ConflictPolicy;
  options?: StartUploadFromSourcesOptions;
  selectedProfileId: string;
  sources: UploadSource[];
  uploadApi: UploadQueueCommandRunnerApi;
}

export type UploadQueueStartCommandResult =
  | {
      kind: 'validation-error';
      message: string;
    }
  | {
      kind: 'conflicts-detected';
      dialog: UploadConflictDialogState;
    }
  | {
      kind: 'started';
      conflictPolicy: ConflictPolicy;
      destinationPrefix: string;
      inlineFeedback: string;
      job: UploadJobStatus;
      statusLine: string;
      warnings: string[];
    }
  | {
      kind: 'failed';
      message: string;
      warnings: string[];
    };

export const runUploadQueueStartCommand = async ({
  assetsPrefix,
  defaultConflictPolicy,
  options,
  selectedProfileId,
  sources,
  uploadApi,
}: RunUploadQueueStartCommandInput): Promise<UploadQueueStartCommandResult> => {
  if (!selectedProfileId) {
    return {
      kind: 'validation-error',
      message: 'Select a profile first.',
    };
  }

  if (sources.length === 0) {
    return {
      kind: 'validation-error',
      message: 'No files found.',
    };
  }

  const destinationPrefix = normalizeAssetPrefix(options?.destinationPrefix ?? assetsPrefix);
  const conflictPolicy = options?.conflictPolicy ?? defaultConflictPolicy;
  const warnings: string[] = [];

  if (!options?.skipConflictCheck) {
    try {
      const conflictCheck = await uploadApi.checkUploadConflicts({
        profileId: selectedProfileId,
        destinationPrefix,
        sources,
      });

      if (conflictCheck.totalConflicts > 0) {
        return {
          kind: 'conflicts-detected',
          dialog: {
            sources,
            destinationPrefix,
            conflicts: conflictCheck.conflicts,
            totalConflicts: conflictCheck.totalConflicts,
          },
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      warnings.push(`Conflict check failed: ${message}. Continuing upload...`);
    }
  }

  try {
    const jobId = await uploadApi.upload({
      profileId: selectedProfileId,
      destinationPrefix,
      conflictPolicy,
      sources,
    });
    const job = await uploadApi.getUploadJob(jobId);

    return {
      kind: 'started',
      conflictPolicy,
      destinationPrefix,
      inlineFeedback: `Uploading ${formatCount(sources.length, 'file')}`,
      job,
      statusLine:
        options?.label ??
        `Upload started: ${formatCount(sources.length, 'file')} to ${destinationPrefix || '(bucket root)'}`,
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      kind: 'failed',
      message: `Failed to start upload: ${message}`,
      warnings,
    };
  }
};
