import type {
  ProfileSummary,
  TestConnectionResult,
} from '../../../../shared/ipc';

type StoredProfile = Omit<ProfileSummary, 'hasSecret'>;

type ProfileSecret = {
  accessKeyId: string;
  secretAccessKey: string;
};

type EndpointReachabilityResult = {
  ok: boolean;
  message: string;
};

export interface WorkspaceConnectionTesterDependencies {
  checkEndpointReachability(endpoint: string): Promise<EndpointReachabilityResult>;
  getProfile(profileId: string): StoredProfile | undefined;
  getProfileSecretOrThrow(profileId: string): ProfileSecret;
  hasProfileSecret(profileId: string): boolean;
  nowIso(): string;
  testStorageConnection(
    profile: StoredProfile,
    secret: ProfileSecret,
  ): Promise<{ ok: boolean; message: string }>;
}

export const checkEndpointReachability = async (
  endpoint: string,
): Promise<EndpointReachabilityResult> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4_000);

  try {
    const response = await fetch(endpoint, {
      method: 'HEAD',
      signal: controller.signal,
    });
    return {
      ok: true,
      message: `Endpoint reachable (status ${response.status})`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      message: `Endpoint unreachable: ${message}`,
    };
  } finally {
    clearTimeout(timer);
  }
};

export const createWorkspaceConnectionTester =
  (dependencies: WorkspaceConnectionTesterDependencies) =>
  async (profileId: string): Promise<TestConnectionResult> => {
    const profile = dependencies.getProfile(profileId);

    if (!profile) {
      return {
        ok: false,
        message: 'Profile not found',
        checkedAt: dependencies.nowIso(),
      };
    }

    if (!dependencies.hasProfileSecret(profileId)) {
      return {
        ok: false,
        message: 'Profile secret is missing',
        checkedAt: dependencies.nowIso(),
      };
    }

    const endpointCheck = await dependencies.checkEndpointReachability(profile.endpoint);

    if (!endpointCheck.ok) {
      return {
        ok: false,
        message: endpointCheck.message,
        checkedAt: dependencies.nowIso(),
      };
    }

    const secret = dependencies.getProfileSecretOrThrow(profile.id);
    const storageCheck = await dependencies.testStorageConnection(profile, secret);

    return {
      ok: storageCheck.ok,
      message: storageCheck.ok
        ? `${endpointCheck.message}; ${storageCheck.message}`
        : storageCheck.message,
      checkedAt: dependencies.nowIso(),
    };
  };
