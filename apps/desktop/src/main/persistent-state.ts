import { app } from 'electron';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import type { AppSettings, ProfileSummary, SavedView } from '../shared/ipc';

type PersistedProfile = Omit<ProfileSummary, 'hasSecret'>;

interface PersistedState {
  profiles: PersistedProfile[];
  savedViews: SavedView[];
  settings: AppSettings;
  encodedSecrets: Record<string, string>;
}

const CURRENT_STATE_VERSION = 1;
const STATE_FILE_NAME = `state.v${CURRENT_STATE_VERSION}.json`;

const defaultSettings: AppSettings = {
  appearance: 'system',
  defaultConflictPolicy: 'rename',
  presignedUrlTTLSeconds: 900,
  uploadOptimizeImagesBeforeUpload: false,
  publicBaseUrls: {},
};

const defaultState: PersistedState = {
  profiles: [],
  savedViews: [],
  settings: defaultSettings,
  encodedSecrets: {},
};

const getStateFilePath = (): string => {
  const userDataDirectory = app.getPath('userData');
  return join(userDataDirectory, STATE_FILE_NAME);
};

const backupCorruptedStateFile = (filePath: string): void => {
  if (!existsSync(filePath)) {
    return;
  }
  const backupPath = `${filePath}.corrupt.${Date.now()}`;
  try {
    renameSync(filePath, backupPath);
  } catch {
    // Best effort only.
  }
};

export const loadPersistentState = (): PersistedState => {
  const filePath = getStateFilePath();

  try {
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    return {
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      savedViews: Array.isArray(parsed.savedViews) ? parsed.savedViews : [],
      settings: {
        ...defaultSettings,
        ...(parsed.settings ?? {}),
      },
      encodedSecrets:
        parsed.encodedSecrets && typeof parsed.encodedSecrets === 'object'
          ? parsed.encodedSecrets
          : {},
    };
  } catch {
    backupCorruptedStateFile(filePath);
    return defaultState;
  }
};

export const savePersistentState = (state: PersistedState): void => {
  const filePath = getStateFilePath();
  const tempFilePath = `${filePath}.tmp`;
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(tempFilePath, JSON.stringify(state, null, 2), 'utf-8');
  renameSync(tempFilePath, filePath);
  try {
    if (existsSync(tempFilePath)) {
      unlinkSync(tempFilePath);
    }
  } catch {
    // Best effort cleanup only.
  }
};
