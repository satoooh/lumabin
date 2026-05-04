import { useMemo } from 'react';
import type {
  AssetItem,
  AssetMetadata,
} from '../../shared/ipc';
import { buildPublicAssetUrl } from '../shared/public-url';
import {
  buildQuickPreviewMetadataLabels,
  type QuickPreviewMetadataLabels,
} from './quick-preview-metadata-labels';

export interface QuickPreviewReadModel extends QuickPreviewMetadataLabels {
  publicUrlForSelectedAsset: string;
}

export interface QuickPreviewReadModelInput {
  formatDate: (isoDate: string) => string;
  selectedAsset: AssetItem | null;
  selectedAssetMetadata: AssetMetadata | null;
  selectedPublicBaseUrl: string;
}

export const buildQuickPreviewReadModel = ({
  formatDate,
  selectedAsset,
  selectedAssetMetadata,
  selectedPublicBaseUrl,
}: QuickPreviewReadModelInput): QuickPreviewReadModel => ({
  ...buildQuickPreviewMetadataLabels({
    formatDate,
    selectedAsset,
    selectedAssetMetadata,
  }),
  publicUrlForSelectedAsset:
    selectedAsset && selectedPublicBaseUrl
      ? buildPublicAssetUrl(selectedPublicBaseUrl, selectedAsset.key)
      : '',
});

export const useQuickPreviewReadModel = ({
  formatDate,
  selectedAsset,
  selectedAssetMetadata,
  selectedPublicBaseUrl,
}: QuickPreviewReadModelInput): QuickPreviewReadModel =>
  useMemo(
    () =>
      buildQuickPreviewReadModel({
        formatDate,
        selectedAsset,
        selectedAssetMetadata,
        selectedPublicBaseUrl,
      }),
    [formatDate, selectedAsset, selectedAssetMetadata, selectedPublicBaseUrl],
  );
