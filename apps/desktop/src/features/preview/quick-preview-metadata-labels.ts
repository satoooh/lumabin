import type {
  AssetItem,
  AssetMetadata,
} from '../../shared/ipc';

export interface QuickPreviewMetadataLabels {
  capturedAtLabel: string;
  cameraLabel: string;
  lensLabel: string;
  shootSettingsLabel: string;
}

const findMetadataValue = (
  metadata: Record<string, string> | undefined,
  keys: string[],
): string => {
  if (!metadata) {
    return '';
  }

  const lowered = new Map<string, string>();
  for (const [key, value] of Object.entries(metadata)) {
    lowered.set(key.toLowerCase(), value);
  }

  for (const key of keys) {
    const found = lowered.get(key.toLowerCase());
    if (found && found.trim().length > 0) {
      return found;
    }
  }

  return '';
};

export const buildQuickPreviewMetadataLabels = ({
  formatDate,
  selectedAsset,
  selectedAssetMetadata,
}: {
  formatDate: (isoDate: string) => string;
  selectedAsset: AssetItem | null;
  selectedAssetMetadata: AssetMetadata | null;
}): QuickPreviewMetadataLabels => {
  const metadata = selectedAssetMetadata?.metadata;
  const capturedAtFromMetadata = findMetadataValue(metadata, [
    'exif:datetimeoriginal',
    'datetimeoriginal',
    'date_time_original',
    'captured_at',
    'created_at',
  ]);
  const cameraLabel =
    findMetadataValue(metadata, [
      'exif:model',
      'camera_model',
      'device_model',
      'model',
    ]) || '-';
  const lensLabel =
    findMetadataValue(metadata, [
      'exif:lensmodel',
      'lens_model',
      'lens',
    ]) || '-';
  const iso = findMetadataValue(metadata, ['exif:iso', 'iso']);
  const aperture = findMetadataValue(metadata, [
    'exif:fnumber',
    'f_number',
    'aperture',
  ]);
  const shutter = findMetadataValue(metadata, [
    'exif:exposuretime',
    'exposure_time',
    'shutter_speed',
  ]);
  const shootSettings = [
    iso ? `ISO ${iso}` : '',
    aperture ? `f/${aperture}` : '',
    shutter || '',
  ].filter((value) => value.length > 0);

  return {
    capturedAtLabel:
      capturedAtFromMetadata || (selectedAsset ? formatDate(selectedAsset.lastModified) : '-'),
    cameraLabel,
    lensLabel,
    shootSettingsLabel: shootSettings.join(' • ') || '-',
  };
};
