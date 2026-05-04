import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { AppSettings } from '../../shared/ipc';
import {
  areStringRecordEqual,
  sanitizePublicBaseUrlInput,
} from './workspace-settings-state';

export const LEGACY_PUBLIC_BASE_URL_STORAGE_KEY = 'lumabin.publicBaseUrls.v1';

export const extractLegacyPublicBaseUrls = (input: unknown): Record<string, string> => {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const migrated: Record<string, string> = {};
  for (const [profileId, value] of Object.entries(input)) {
    if (!profileId || typeof value !== 'string') {
      continue;
    }
    const normalized = sanitizePublicBaseUrlInput(value);
    if (!normalized) {
      continue;
    }
    migrated[profileId] = normalized;
  }
  return migrated;
};

interface UseLegacyPublicBaseUrlMigrationOptions {
  hasInitialized: boolean;
  publicBaseUrls: Record<string, string>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  setSavedSettingsSnapshot: Dispatch<SetStateAction<AppSettings>>;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
}

export const useLegacyPublicBaseUrlMigration = ({
  hasInitialized,
  publicBaseUrls,
  saveSettings,
  setSavedSettingsSnapshot,
  setSettings,
}: UseLegacyPublicBaseUrlMigrationOptions): void => {
  const hasMigratedRef = useRef<boolean>(false);
  const saveSequenceRef = useRef<number>(0);

  useEffect(() => {
    if (!hasInitialized || hasMigratedRef.current) {
      return;
    }
    hasMigratedRef.current = true;

    try {
      const raw = window.localStorage.getItem(LEGACY_PUBLIC_BASE_URL_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const migratedFromLegacy = extractLegacyPublicBaseUrls(JSON.parse(raw) as unknown);
      if (Object.keys(migratedFromLegacy).length === 0) {
        window.localStorage.removeItem(LEGACY_PUBLIC_BASE_URL_STORAGE_KEY);
        return;
      }

      const mergedPublicBaseUrls = {
        ...migratedFromLegacy,
        ...publicBaseUrls,
      };

      if (areStringRecordEqual(mergedPublicBaseUrls, publicBaseUrls)) {
        window.localStorage.removeItem(LEGACY_PUBLIC_BASE_URL_STORAGE_KEY);
        return;
      }

      saveSequenceRef.current += 1;
      const sequence = saveSequenceRef.current;
      setSettings((current) => ({
        ...current,
        publicBaseUrls: mergedPublicBaseUrls,
      }));

      void saveSettings({ publicBaseUrls: mergedPublicBaseUrls })
        .then((saved) => {
          if (saveSequenceRef.current !== sequence) {
            return;
          }
          setSettings((current) => ({
            ...current,
            publicBaseUrls: saved.publicBaseUrls,
          }));
          setSavedSettingsSnapshot((current) => ({
            ...current,
            publicBaseUrls: saved.publicBaseUrls,
          }));
          window.localStorage.removeItem(LEGACY_PUBLIC_BASE_URL_STORAGE_KEY);
        })
        .catch(() => {
          // Keep legacy value for next launch if migration save fails.
        });
    } catch {
      // Ignore malformed legacy data.
    }
  }, [
    hasInitialized,
    publicBaseUrls,
    saveSettings,
    setSavedSettingsSnapshot,
    setSettings,
  ]);
};
