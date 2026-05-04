import { createRequire } from 'node:module';
import { isE2EMode } from './e2e-runtime';

interface ProfileSecretPayload {
  accessKeyId: string;
  secretAccessKey: string;
}

const secretStore = new Map<string, string>();
const allowPlaintextSecretsForE2E = isE2EMode;
const require = createRequire(import.meta.url);

type SafeStorage = typeof import('electron').safeStorage;

let safeStorage: SafeStorage | undefined;

const getSafeStorage = (): SafeStorage => {
  safeStorage ??= (require('electron') as typeof import('electron')).safeStorage;
  return safeStorage;
};

const ensureSafeStorage = (): void => {
  if (!getSafeStorage().isEncryptionAvailable()) {
    throw new Error('safeStorage is not available on this machine');
  }
};

const encode = (payload: ProfileSecretPayload): string => {
  if (allowPlaintextSecretsForE2E) {
    return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
  }
  ensureSafeStorage();
  const encrypted = getSafeStorage().encryptString(JSON.stringify(payload));
  return encrypted.toString('base64');
};

const decode = (encoded: string): ProfileSecretPayload => {
  if (allowPlaintextSecretsForE2E) {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8')) as ProfileSecretPayload;
  }
  ensureSafeStorage();
  const buffer = Buffer.from(encoded, 'base64');
  const decrypted = getSafeStorage().decryptString(buffer);
  return JSON.parse(decrypted) as ProfileSecretPayload;
};

const setEncodedSecret = (profileId: string, encodedSecret: string): void => {
  secretStore.set(profileId, encodedSecret);
};

export const saveProfileSecret = (
  profileId: string,
  payload: ProfileSecretPayload,
): void => {
  secretStore.set(profileId, encode(payload));
};

export const readProfileSecret = (
  profileId: string,
): ProfileSecretPayload | undefined => {
  const encoded = secretStore.get(profileId);
  if (!encoded) {
    return undefined;
  }
  return decode(encoded);
};

export const removeProfileSecret = (profileId: string): void => {
  secretStore.delete(profileId);
};

export const hasProfileSecret = (profileId: string): boolean => {
  return secretStore.has(profileId);
};

export const exportEncodedSecrets = (): Record<string, string> => {
  return Object.fromEntries(secretStore.entries());
};

export const replaceEncodedSecrets = (secrets: Record<string, string>): void => {
  secretStore.clear();
  Object.entries(secrets).forEach(([profileId, encodedSecret]) => {
    setEncodedSecret(profileId, encodedSecret);
  });
};
