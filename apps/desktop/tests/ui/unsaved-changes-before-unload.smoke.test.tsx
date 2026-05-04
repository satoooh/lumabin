import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  shouldBlockBeforeUnloadForUnsavedChanges,
  useUnsavedChangesBeforeUnload,
} from '../../src/features/layout/use-unsaved-changes-before-unload';

const cleanState = {
  isConnectionSetupOpen: false,
  isProfileBusy: false,
  isProfileFormDirty: false,
  isSettingsBusy: false,
  isSettingsDirty: false,
  isWorkspaceSettingsOpen: false,
};

type ProbeProps = typeof cleanState;

const Probe = (props: ProbeProps) => {
  useUnsavedChangesBeforeUnload(props);
  return null;
};

const dispatchBeforeUnload = (): Event => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
};

describe('unsaved changes beforeunload guard', () => {
  afterEach(() => {
    cleanup();
  });

  it('blocks unload for dirty profile edits only when the setup dialog can save', () => {
    expect(
      shouldBlockBeforeUnloadForUnsavedChanges({
        ...cleanState,
        isConnectionSetupOpen: true,
        isProfileFormDirty: true,
      }),
    ).toBe(true);

    expect(
      shouldBlockBeforeUnloadForUnsavedChanges({
        ...cleanState,
        isConnectionSetupOpen: true,
        isProfileBusy: true,
        isProfileFormDirty: true,
      }),
    ).toBe(false);

    expect(
      shouldBlockBeforeUnloadForUnsavedChanges({
        ...cleanState,
        isProfileFormDirty: true,
      }),
    ).toBe(false);
  });

  it('blocks unload for dirty workspace settings only when the settings dialog can save', () => {
    expect(
      shouldBlockBeforeUnloadForUnsavedChanges({
        ...cleanState,
        isWorkspaceSettingsOpen: true,
        isSettingsDirty: true,
      }),
    ).toBe(true);

    expect(
      shouldBlockBeforeUnloadForUnsavedChanges({
        ...cleanState,
        isSettingsBusy: true,
        isSettingsDirty: true,
        isWorkspaceSettingsOpen: true,
      }),
    ).toBe(false);
  });

  it('registers and removes the beforeunload listener with state changes', () => {
    const { rerender } = render(<Probe {...cleanState} />);

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);

    rerender(
      <Probe
        {...cleanState}
        isConnectionSetupOpen={true}
        isProfileFormDirty={true}
      />,
    );
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);

    rerender(<Probe {...cleanState} />);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
