export type Provider = 'r2' | 's3';
export type ConflictPolicy = 'overwrite' | 'rename' | 'skip';
export type Appearance = 'system' | 'light' | 'dark';

export interface ProfileSummary {
  id: string;
  name: string;
  provider: Provider;
  endpoint: string;
  region: string;
  bucket: string;
  hasSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveProfileInput {
  id?: string;
  name: string;
  provider: Provider;
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface TestConnectionResult {
  ok: boolean;
  message: string;
  checkedAt: string;
}

export interface ListAssetsInput {
  profileId: string;
  prefix?: string;
  continuationToken?: string;
  limit?: number;
}

export interface AssetItem {
  key: string;
  size: number;
  contentType: string;
  lastModified: string;
  etag: string;
}

export interface ListAssetsResult {
  items: AssetItem[];
  prefixes: string[];
  nextContinuationToken?: string;
}

export interface HeadAssetInput {
  profileId: string;
  key: string;
}

export interface AssetMetadata {
  key: string;
  size: number;
  contentType: string;
  lastModified: string;
  etag: string;
  metadata: Record<string, string>;
}

export interface PreviewAssetInput {
  profileId: string;
  key: string;
  etag?: string;
  maxBytes?: number;
}

export interface AssetPreview {
  key: string;
  kind: 'image' | 'video' | 'pdf' | 'csv' | 'other';
  contentType: string;
  byteLength: number;
  totalBytes?: number;
  truncated: boolean;
  dataBase64?: string;
  textPreview?: string;
}

export interface UploadSource {
  path: string;
  size: number;
  relativePath?: string;
}

export interface PersistClipboardFileInput {
  fileName?: string;
  mimeType?: string;
  bytes: Uint8Array;
}

export interface PersistSystemClipboardImageResult {
  path: string;
  size: number;
  fileName: string;
  mimeType: string;
}

export interface StartUploadInput {
  profileId: string;
  destinationPrefix: string;
  conflictPolicy?: ConflictPolicy;
  sources: UploadSource[];
}

export interface CheckUploadConflictsInput {
  profileId: string;
  destinationPrefix: string;
  sources: UploadSource[];
  limit?: number;
}

export interface UploadConflictItem {
  sourcePath: string;
  fileName: string;
  key: string;
}

export interface CheckUploadConflictsResult {
  conflicts: UploadConflictItem[];
  totalConflicts: number;
}

export interface UploadJobStatus {
  id: string;
  profileId: string;
  status: 'queued' | 'running' | 'done' | 'failed' | 'canceled';
  destinationPrefix?: string;
  conflictPolicy?: ConflictPolicy;
  createdAt?: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  failedSources: UploadSource[];
  lastError?: string;
  updatedAt: string;
}

export interface RenameAssetInput {
  profileId: string;
  fromKey: string;
  toKey: string;
}

export interface RenameResult {
  ok: boolean;
  fromKey: string;
  toKey: string;
}

export interface MoveAssetInput {
  profileId: string;
  fromKey: string;
  toKey: string;
}

export interface MoveResult {
  ok: boolean;
  fromKey: string;
  toKey: string;
}

export interface DeleteAssetsInput {
  profileId: string;
  keys: string[];
}

export interface DeleteResult {
  deleted: string[];
  skipped: string[];
}

export interface SearchInput {
  profileId: string;
  query: string;
  limit?: number;
}

export interface SearchResult {
  items: AssetItem[];
  total: number;
}

export interface SaveViewInput {
  id?: string;
  name: string;
  query: string;
  pinned?: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  query: string;
  pinned: boolean;
  updatedAt: string;
}

export interface PresignInput {
  profileId: string;
  key: string;
  expiresInSeconds?: number;
}

export interface PresignResult {
  url: string;
  expiresAt: string;
}

export interface AppSettings {
  appearance: Appearance;
  defaultConflictPolicy: ConflictPolicy;
  presignedUrlTTLSeconds: number;
  uploadOptimizeImagesBeforeUpload: boolean;
  publicBaseUrls: Record<string, string>;
}

export interface SaveSettingsInput {
  appearance?: Appearance;
  defaultConflictPolicy?: ConflictPolicy;
  presignedUrlTTLSeconds?: number;
  uploadOptimizeImagesBeforeUpload?: boolean;
  publicBaseUrls?: Record<string, string>;
}

export interface DevMetricsSnapshot {
  collectedAt: string;
  cache: {
    previewHit: number;
    previewMiss: number;
    previewInFlightHit: number;
    headHit: number;
    headMiss: number;
    headInFlightHit: number;
    searchSnapshotHit: number;
    searchSnapshotMiss: number;
  };
  storage: {
    listCalls: number;
    headCalls: number;
    getCalls: number;
    putCalls: number;
    existsChecks: number;
    testConnectionCalls: number;
    failures: number;
    bytesDownloaded: number;
    bytesUploaded: number;
  };
}

export interface RuntimeInfo {
  isE2E: boolean;
}

export interface LumabinAPI {
  runtime: {
    getInfo(): Promise<RuntimeInfo>;
  };
  files: {
    getPathForFile(file: File): string;
    persistClipboardFile(input: PersistClipboardFileInput): Promise<string>;
    persistClipboardImageFromSystem(): Promise<PersistSystemClipboardImageResult | null>;
  };
  profiles: {
    list(): Promise<ProfileSummary[]>;
    save(input: SaveProfileInput): Promise<ProfileSummary>;
    testConnection(profileId: string): Promise<TestConnectionResult>;
    delete(profileId: string): Promise<void>;
  };
  assets: {
    list(input: ListAssetsInput): Promise<ListAssetsResult>;
    head(input: HeadAssetInput): Promise<AssetMetadata>;
    preview(input: PreviewAssetInput): Promise<AssetPreview>;
    checkUploadConflicts(input: CheckUploadConflictsInput): Promise<CheckUploadConflictsResult>;
    upload(input: StartUploadInput): Promise<string>;
    getUploadJob(jobId: string): Promise<UploadJobStatus>;
    cancelUpload(jobId: string): Promise<void>;
    rename(input: RenameAssetInput): Promise<RenameResult>;
    move(input: MoveAssetInput): Promise<MoveResult>;
    remove(input: DeleteAssetsInput): Promise<DeleteResult>;
  };
  search: {
    query(input: SearchInput): Promise<SearchResult>;
    saveView(input: SaveViewInput): Promise<SavedView>;
    listViews(): Promise<SavedView[]>;
    deleteView(viewId: string): Promise<void>;
  };
  sharing: {
    createPresignedGet(input: PresignInput): Promise<PresignResult>;
    createPresignedPut(input: PresignInput): Promise<PresignResult>;
  };
  settings: {
    get(): Promise<AppSettings>;
    save(input: SaveSettingsInput): Promise<AppSettings>;
  };
  dev: {
    getMetrics(): Promise<DevMetricsSnapshot>;
    resetMetrics(): Promise<DevMetricsSnapshot>;
  };
}

export const ipcChannels = {
  files: {
    persistClipboardFile: 'lumabin:files:persistClipboardFile',
    persistClipboardImageFromSystem: 'lumabin:files:persistClipboardImageFromSystem',
  },
  profiles: {
    list: 'lumabin:profiles:list',
    save: 'lumabin:profiles:save',
    testConnection: 'lumabin:profiles:testConnection',
    remove: 'lumabin:profiles:remove',
  },
  assets: {
    list: 'lumabin:assets:list',
    head: 'lumabin:assets:head',
    preview: 'lumabin:assets:preview',
    checkUploadConflicts: 'lumabin:assets:checkUploadConflicts',
    upload: 'lumabin:assets:upload',
    getUploadJob: 'lumabin:assets:getUploadJob',
    cancelUpload: 'lumabin:assets:cancelUpload',
    rename: 'lumabin:assets:rename',
    move: 'lumabin:assets:move',
    remove: 'lumabin:assets:remove',
  },
  search: {
    query: 'lumabin:search:query',
    saveView: 'lumabin:search:saveView',
    listViews: 'lumabin:search:listViews',
    removeView: 'lumabin:search:removeView',
  },
  sharing: {
    createPresignedGet: 'lumabin:sharing:createPresignedGet',
    createPresignedPut: 'lumabin:sharing:createPresignedPut',
  },
  settings: {
    get: 'lumabin:settings:get',
    save: 'lumabin:settings:save',
  },
  dev: {
    getMetrics: 'lumabin:dev:getMetrics',
    resetMetrics: 'lumabin:dev:resetMetrics',
  },
  runtime: {
    getInfo: 'lumabin:runtime:getInfo',
  },
} as const;

export type IpcChannels = typeof ipcChannels;
