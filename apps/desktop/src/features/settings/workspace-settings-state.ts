import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import type { AppSettings } from '../../shared/ipc';
import { sanitizePublicBaseUrlInput } from '../shared/public-url';

export {
  buildPublicAssetUrl,
  normalizePublicBaseUrl,
  sanitizePublicBaseUrlInput,
} from '../shared/public-url';

interface UseWorkspaceSettingsStateOptions {
  savedSettingsSnapshot: AppSettings;
  selectedProfileId: string;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  settings: AppSettings;
}

export const initialSettings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  uploadOptimizeImagesBeforeUpload: false,
  publicBaseUrls: {},
};

export const areStringRecordEqual = (
  left: Record<string, string>,
  right: Record<string, string>,
): boolean => {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);
  if (leftEntries.length !== rightEntries.length) {
    return false;
  }

  for (const [key, value] of leftEntries) {
    if (right[key] !== value) {
      return false;
    }
  }
  return true;
};

export const useWorkspaceSettingsState = ({
  savedSettingsSnapshot,
  selectedProfileId,
  setSettings,
  settings,
}: UseWorkspaceSettingsStateOptions) => {
  const selectedPublicBaseUrl = useMemo(
    () => (selectedProfileId ? settings.publicBaseUrls[selectedProfileId] ?? '' : ''),
    [selectedProfileId, settings.publicBaseUrls],
  );

  const handleSelectedPublicBaseUrlChange = useCallback(
    (nextValue: string) => {
      if (!selectedProfileId) {
        return;
      }

      const normalized = sanitizePublicBaseUrlInput(nextValue);
      setSettings((current) => {
        const nextPublicBaseUrls = { ...current.publicBaseUrls };
        if (!normalized) {
          delete nextPublicBaseUrls[selectedProfileId];
        } else {
          nextPublicBaseUrls[selectedProfileId] = normalized;
        }

        return {
          ...current,
          publicBaseUrls: nextPublicBaseUrls,
        };
      });
    },
    [selectedProfileId, setSettings],
  );

  const handleAppearanceChange = useCallback(
    (appearance: AppSettings['appearance']) => {
      setSettings((current) => ({
        ...current,
        appearance,
      }));
    },
    [setSettings],
  );

  const handleDefaultConflictPolicyChange = useCallback(
    (defaultConflictPolicy: AppSettings['defaultConflictPolicy']) => {
      setSettings((current) => ({
        ...current,
        defaultConflictPolicy,
      }));
    },
    [setSettings],
  );

  const handlePresignedUrlTTLSecondsChange = useCallback(
    (presignedUrlTTLSeconds: number) => {
      setSettings((current) => ({
        ...current,
        presignedUrlTTLSeconds,
      }));
    },
    [setSettings],
  );

  const handleUploadOptimizeImagesBeforeUploadChange = useCallback(
    (uploadOptimizeImagesBeforeUpload: boolean) => {
      setSettings((current) => ({
        ...current,
        uploadOptimizeImagesBeforeUpload,
      }));
    },
    [setSettings],
  );

  const isSettingsDirty = useMemo(
    () =>
      settings.appearance !== savedSettingsSnapshot.appearance ||
      settings.defaultConflictPolicy !== savedSettingsSnapshot.defaultConflictPolicy ||
      settings.presignedUrlTTLSeconds !== savedSettingsSnapshot.presignedUrlTTLSeconds ||
      settings.uploadOptimizeImagesBeforeUpload !== savedSettingsSnapshot.uploadOptimizeImagesBeforeUpload ||
      !areStringRecordEqual(
        settings.publicBaseUrls,
        savedSettingsSnapshot.publicBaseUrls,
      ),
    [savedSettingsSnapshot, settings],
  );

  return {
    handleAppearanceChange,
    handleDefaultConflictPolicyChange,
    handlePresignedUrlTTLSecondsChange,
    handleSelectedPublicBaseUrlChange,
    handleUploadOptimizeImagesBeforeUploadChange,
    isSettingsDirty,
    selectedPublicBaseUrl,
  };
};
