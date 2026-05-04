import { describe, expect, it } from 'vitest';
import { shouldOpenConnectionSetupForEmptyWorkspace } from '../../src/features/settings/use-empty-workspace-onboarding';

describe('empty workspace onboarding', () => {
  it('opens connection setup only after initialization when no profiles exist', () => {
    expect(shouldOpenConnectionSetupForEmptyWorkspace(false, 0)).toBe(false);
    expect(shouldOpenConnectionSetupForEmptyWorkspace(true, 1)).toBe(false);
    expect(shouldOpenConnectionSetupForEmptyWorkspace(true, 0)).toBe(true);
  });
});
