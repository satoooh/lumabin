export type UploadJobStatusChangedPayload = {
  profileId: string;
  jobId: string;
  previousStatus: string;
  nextStatus: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
};

export type AssetIngestionEvent = {
  type: 'asset-ingestion.upload-job.status-changed';
  occurredAt: string;
  payload: UploadJobStatusChangedPayload;
};
