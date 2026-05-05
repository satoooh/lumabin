import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createDesktopWorkbenchTopbarCoordinationProps } from '../../src/features/workbench/desktop-workbench-topbar-coordination';
import { createDesktopWorkbenchTopbarCoordinationInput } from '../../src/features/workbench/desktop-workbench-topbar-handoffs';

type TopbarCoordinationInput = Parameters<typeof createDesktopWorkbenchTopbarCoordinationProps>[0];

describe('desktop workbench topbar handoffs', () => {
  it('maps flat root handoffs to the topbar coordination contract', () => {
    const fileInputRef = createRef<HTMLInputElement>();
    const handleOpenFilePicker = vi.fn();
    const handleProfileMenuSelect = vi.fn();
    const handleSearchSubmit = vi.fn();
    const setSearchInput = vi.fn();
    const profileMenuOptions: TopbarCoordinationInput['profileMenu']['profileMenuOptions'] = [
      { label: 'Production', value: 'profile-1' },
    ];

    const input = createDesktopWorkbenchTopbarCoordinationInput({
      activeSearchQuery: 'sunset',
      closeProfileMenu: vi.fn(),
      fileInputRef,
      handleFilePickerChange: vi.fn(),
      handleOpenFilePicker,
      handleProfileMenuSelect,
      handleSearchClear: vi.fn(),
      handleSearchSubmit,
      handleToggleShortcutHelp: vi.fn(),
      handleToggleWorkspaceSettings: vi.fn(),
      inlineFeedback: 'Copied',
      isDropActive: false,
      isProfileMenuOpen: true,
      isSearchBusy: false,
      isShortcutHelpOpen: false,
      isUploadBusy: false,
      isWorkspaceSettingsOpen: false,
      logoSrc: '/lumabin.svg',
      manageProfileOptionValue: '__manage__',
      moveProfileMenuActiveIndex: vi.fn(),
      newProfileOptionValue: '__new__',
      openProfileMenu: vi.fn(),
      profileMenuActiveIndex: 0,
      profileMenuButtonRef: createRef<HTMLButtonElement>(),
      profileMenuListRef: createRef<HTMLDivElement>(),
      profileMenuOptions,
      searchInput: 'sunset',
      searchInputRef: createRef<HTMLInputElement>(),
      selectedProfileId: 'profile-1',
      selectedProfileLabel: 'Production',
      setProfileMenuActiveIndex: vi.fn(),
      setSearchInput,
      showGuidedStart: false,
    });

    expect(input.assets.logoSrc).toBe('/lumabin.svg');
    expect(input.files.fileInputRef).toBe(fileInputRef);
    expect(input.files.handleOpenFilePicker).toBe(handleOpenFilePicker);
    expect(input.profileMenu.handleProfileMenuSelect).toBe(handleProfileMenuSelect);
    expect(input.profileMenu.profileMenuOptions).toBe(profileMenuOptions);
    expect(input.search.handleSearchSubmit).toBe(handleSearchSubmit);
    expect(input.search.setSearchInput).toBe(setSearchInput);
    expect(input.feedback.inlineFeedback).toBe('Copied');
  });
});
