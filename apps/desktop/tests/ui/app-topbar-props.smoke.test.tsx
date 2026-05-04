import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createAppTopbarProps } from '../../src/features/layout/app-topbar-props';

describe('app topbar props', () => {
  it('maps search, profile, upload, and workspace commands into the topbar contract', () => {
    const handleFilePickerChange = vi.fn();
    const handleOpenFilePicker = vi.fn();
    const closeProfileMenu = vi.fn();
    const handleProfileMenuSelect = vi.fn();
    const moveProfileMenuActiveIndex = vi.fn();
    const openProfileMenu = vi.fn();
    const setProfileMenuActiveIndex = vi.fn();
    const handleSearchClear = vi.fn();
    const handleSearchSubmit = vi.fn();
    const setSearchInput = vi.fn();
    const handleToggleShortcutHelp = vi.fn();
    const handleToggleWorkspaceSettings = vi.fn();
    const fileInputRef = createRef<HTMLInputElement>();
    const profileMenuButtonRef = createRef<HTMLButtonElement>();
    const profileMenuListRef = createRef<HTMLDivElement>();
    const searchInputRef = createRef<HTMLInputElement>();

    const props = createAppTopbarProps({
      assets: {
        logoSrc: '/lumabin.svg',
      },
      feedback: {
        inlineFeedback: 'Copied',
      },
      files: {
        fileInputRef,
        handleFilePickerChange,
        handleOpenFilePicker,
        isUploadBusy: false,
      },
      profileMenu: {
        closeProfileMenu,
        handleProfileMenuSelect,
        isProfileMenuOpen: true,
        manageProfileOptionValue: '__manage__',
        moveProfileMenuActiveIndex,
        newProfileOptionValue: '__new__',
        openProfileMenu,
        profileMenuActiveIndex: 1,
        profileMenuButtonRef,
        profileMenuListRef,
        profileMenuOptions: [
          {
            label: 'Production',
            value: 'profile-1',
          },
        ],
        selectedProfileId: 'profile-1',
        selectedProfileLabel: 'Production',
        setProfileMenuActiveIndex,
      },
      search: {
        activeSearchQuery: 'sunset',
        handleSearchClear,
        handleSearchSubmit,
        isSearchBusy: false,
        searchInput: 'sunset',
        searchInputRef,
        setSearchInput,
      },
      state: {
        isDropActive: false,
        showGuidedStart: false,
      },
      workspaceActions: {
        handleToggleShortcutHelp,
        handleToggleWorkspaceSettings,
        isShortcutHelpOpen: false,
        isWorkspaceSettingsOpen: true,
      },
    });

    props.onSearchInputChange('beach');
    props.onSearchSubmit();
    props.onSearchClear();
    props.onOpenProfileMenu();
    props.onCloseProfileMenu();
    props.onMoveProfileMenuActiveIndex(1);
    props.onSetProfileMenuActiveIndex(0);
    props.onSelectProfileMenuValue('profile-1');
    props.onOpenFilePicker();
    props.onToggleWorkspaceSettings();
    props.onToggleShortcutHelp();

    expect(props.logoSrc).toBe('/lumabin.svg');
    expect(props.searchInputRef).toBe(searchInputRef);
    expect(props.profileMenuButtonRef).toBe(profileMenuButtonRef);
    expect(props.fileInputRef).toBe(fileInputRef);
    expect(props.profileMenuOptions).toHaveLength(1);
    expect(props.inlineFeedback).toBe('Copied');
    expect(setSearchInput).toHaveBeenCalledWith('beach');
    expect(handleSearchSubmit).toHaveBeenCalledTimes(1);
    expect(handleSearchClear).toHaveBeenCalledTimes(1);
    expect(openProfileMenu).toHaveBeenCalledTimes(1);
    expect(closeProfileMenu).toHaveBeenCalledTimes(1);
    expect(moveProfileMenuActiveIndex).toHaveBeenCalledWith(1);
    expect(setProfileMenuActiveIndex).toHaveBeenCalledWith(0);
    expect(handleProfileMenuSelect).toHaveBeenCalledWith('profile-1');
    expect(handleOpenFilePicker).toHaveBeenCalledTimes(1);
    expect(handleToggleWorkspaceSettings).toHaveBeenCalledTimes(1);
    expect(handleToggleShortcutHelp).toHaveBeenCalledTimes(1);
  });
});
