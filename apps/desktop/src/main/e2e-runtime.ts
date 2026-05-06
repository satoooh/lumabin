const argvHasFlag = (flag: string): boolean => process.argv.includes(flag);

const argvValue = (prefix: string): string | undefined => {
  const matched = process.argv.find((value) => value.startsWith(prefix));
  if (!matched) {
    return undefined;
  }
  return matched.slice(prefix.length);
};

const isValidPort = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535;
};

const resolveE2ERemoteDebuggingPort = (): string | undefined => {
  const candidates = [
    process.env.LUMABIN_E2E_CDP_PORT?.trim(),
    argvValue('--remote-debugging-port=')?.trim(),
  ];
  return candidates.find(isValidPort);
};

export const isE2EMode =
  process.env.LUMABIN_E2E === '1' ||
  argvHasFlag('--lumabin-e2e');

export const isE2EFixtureMode =
  process.env.LUMABIN_E2E_FIXTURE === '1' ||
  argvHasFlag('--lumabin-e2e-fixture');

export const e2eRunId =
  process.env.LUMABIN_E2E_RUN_ID?.trim() ||
  argvValue('--lumabin-e2e-run-id=') ||
  'default';

export const e2eRemoteDebuggingPort = resolveE2ERemoteDebuggingPort();

export const e2eStartupLogPath = process.env.LUMABIN_E2E_STARTUP_LOG?.trim();
