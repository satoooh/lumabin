const argvHasFlag = (flag: string): boolean => process.argv.includes(flag);

const argvValue = (prefix: string): string | undefined => {
  const matched = process.argv.find((value) => value.startsWith(prefix));
  if (!matched) {
    return undefined;
  }
  return matched.slice(prefix.length);
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
