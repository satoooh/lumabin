export {
  setStorageClientFactoryForTest,
} from './adapters/storage/s3-client-factory';

export {
  getStorageObjectPreview,
  headStorageObject,
  listStorageObjects,
  storageObjectExists,
  testStorageConnection,
} from './adapters/storage/storage-query-adapter';

export {
  copyStorageObject,
  deleteStorageObjects,
  uploadStorageObject,
} from './adapters/storage/storage-mutation-adapter';

export {
  createStoragePresignedUrl,
} from './adapters/storage/storage-presign-adapter';

export type {
  StorageConnectionResult,
  StorageDeleteResult,
  StorageListInput,
  StorageProfile,
  StorageSecret,
} from './adapters/storage/storage-contracts';
