import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchTopbarCoordinationProps } from '../../src/features/workbench/desktop-workbench-topbar-coordination';

describe('desktop workbench topbar coordination', () => {
  it('builds layout topbar props from named workbench handoffs', () => {
    const handleOpenFilePicker = vi.fn();
    const handleProfileMenuSelect = vi.fn();
    const handleSearchSubmit = vi.fn();
    const setSearchInput = vi.fn();

    const props = createDesktopWorkbenchTopbarCoordinationProps({
      assets: {
        logoSrc: '/lumabin.svg',
      },
      feedback: {
        inlineFeedback: 'Copied',
      },
      files: {
        fileInputRef: createRef<HTMLInputElement>(),
        handleFilePickerChange: vi.fn(),
        handleOpenFilePicker,
        isUploadBusy: false,
      },
      profileMenu: {
        closeProfileMenu: vi.fn(),
        handleProfileMenuSelect,
        isProfileMenuOpen: true,
        manageProfileOptionValue: '__manage__',
        moveProfileMenuActiveIndex: vi.fn(),
        newProfileOptionValue: '__new__',
        openProfileMenu: vi.fn(),
        profileMenuActiveIndex: 0,
        profileMenuButtonRef: createRef<HTMLButtonElement>(),
        profileMenuListRef: createRef<HTMLDivElement>(),
        profileMenuOptions: [{ label: 'Production', value: 'profile-1' }],
        selectedProfileId: 'profile-1',
        selectedProfileLabel: 'Production',
        setProfileMenuActiveIndex: vi.fn(),
      },
      search: {
        activeSearchQuery: 'sunset',
        handleSearchClear: vi.fn(),
        handleSearchSubmit,
        isSearchBusy: false,
        searchInput: 'sunset',
        searchInputRef: createRef<HTMLInputElement>(),
        setSearchInput,
      },
      state: {
        isDropActive: false,
        showGuidedStart: false,
      },
      workspaceActions: {
        handleToggleShortcutHelp: vi.fn(),
        handleToggleWorkspaceSettings: vi.fn(),
        isShortcutHelpOpen: false,
        isWorkspaceSettingsOpen: false,
      },
    });

    props.onOpenFilePicker();
    props.onSearchInputChange('beach');
    props.onSearchSubmit();
    props.onSelectProfileMenuValue('profile-1');

    expect(props.logoSrc).toBe('/lumabin.svg');
    expect(props.inlineFeedback).toBe('Copied');
    expect(props.profileMenuOptions).toEqual([{ label: 'Production', value: 'profile-1' }]);
    expect(handleOpenFilePicker).toHaveBeenCalledTimes(1);
    expect(setSearchInput).toHaveBeenCalledWith('beach');
    expect(handleSearchSubmit).toHaveBeenCalledTimes(1);
    expect(handleProfileMenuSelect).toHaveBeenCalledWith('profile-1');
  });
});
