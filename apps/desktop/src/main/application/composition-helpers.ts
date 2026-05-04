import {
  isE2EFixtureProfile as matchesE2EFixtureProfile,
} from '../adapters/e2e-fixture-storage-adapter';
import { isE2EFixtureMode } from '../e2e-runtime';
import { readProfileSecret } from '../profile-secret-store';
import {
  assertWorkspaceProfileExists,
  type StoredProfile,
} from '../repositories/workspace-repository';

export const nowIso = (): string => new Date().toISOString();

export const isE2EFixtureProfile = (profileId: string): boolean =>
  matchesE2EFixtureProfile(isE2EFixtureMode, profileId);

export const assertProfileExists = (profileId: string): StoredProfile => {
  return assertWorkspaceProfileExists(profileId);
};

export const getProfileSecretOrThrow = (
  profileId: string,
): { accessKeyId: string; secretAccessKey: string } => {
  const secret = readProfileSecret(profileId);
  if (!secret) {
    throw new Error('Profile secret is missing');
  }
  return secret;
};
