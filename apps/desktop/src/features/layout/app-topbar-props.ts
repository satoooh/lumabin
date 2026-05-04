import type { ComponentProps } from 'react';
import type { AppTopbar } from './app-topbar';

type AppTopbarProps = ComponentProps<typeof AppTopbar>;

interface AppTopbarPropsInput {
  assets: {
    logoSrc: AppTopbarProps['logoSrc'];
  };
  feedback: {
    inlineFeedback: AppTopbarProps['inlineFeedback'];
  };
  files: {
    fileInputRef: AppTopbarProps['fileInputRef'];
    handleFilePickerChange: AppTopbarProps['onFileInputChange'];
    handleOpenFilePicker: AppTopbarProps['onOpenFilePicker'];
    isUploadBusy: AppTopbarProps['isUploadBusy'];
  };
  profileMenu: {
    closeProfileMenu: AppTopbarProps['onCloseProfileMenu'];
    handleProfileMenuSelect: AppTopbarProps['onSelectProfileMenuValue'];
    isProfileMenuOpen: AppTopbarProps['isProfileMenuOpen'];
    manageProfileOptionValue: AppTopbarProps['manageProfileOptionValue'];
    moveProfileMenuActiveIndex: AppTopbarProps['onMoveProfileMenuActiveIndex'];
    newProfileOptionValue: AppTopbarProps['newProfileOptionValue'];
    openProfileMenu: AppTopbarProps['onOpenProfileMenu'];
    profileMenuActiveIndex: AppTopbarProps['profileMenuActiveIndex'];
    profileMenuButtonRef: AppTopbarProps['profileMenuButtonRef'];
    profileMenuListRef: AppTopbarProps['profileMenuListRef'];
    profileMenuOptions: AppTopbarProps['profileMenuOptions'];
    selectedProfileId: AppTopbarProps['selectedProfileId'];
    selectedProfileLabel: AppTopbarProps['selectedProfileLabel'];
    setProfileMenuActiveIndex: AppTopbarProps['onSetProfileMenuActiveIndex'];
  };
  search: {
    activeSearchQuery: AppTopbarProps['activeSearchQuery'];
    handleSearchClear: AppTopbarProps['onSearchClear'];
    handleSearchSubmit: () => Promise<void> | void;
    isSearchBusy: AppTopbarProps['isSearchBusy'];
    searchInput: AppTopbarProps['searchInput'];
    searchInputRef: AppTopbarProps['searchInputRef'];
    setSearchInput: AppTopbarProps['onSearchInputChange'];
  };
  state: {
    isDropActive: AppTopbarProps['isDropActive'];
    showGuidedStart: AppTopbarProps['showGuidedStart'];
  };
  workspaceActions: {
    handleToggleShortcutHelp: AppTopbarProps['onToggleShortcutHelp'];
    handleToggleWorkspaceSettings: AppTopbarProps['onToggleWorkspaceSettings'];
    isShortcutHelpOpen: AppTopbarProps['isShortcutHelpOpen'];
    isWorkspaceSettingsOpen: AppTopbarProps['isWorkspaceSettingsOpen'];
  };
}

export const createAppTopbarProps = ({
  assets,
  feedback,
  files,
  profileMenu,
  search,
  state,
  workspaceActions,
}: AppTopbarPropsInput): AppTopbarProps => ({
  logoSrc: assets.logoSrc,
  isDropActive: state.isDropActive,
  showGuidedStart: state.showGuidedStart,
  searchInputRef: search.searchInputRef,
  searchInput: search.searchInput,
  onSearchInputChange: search.setSearchInput,
  activeSearchQuery: search.activeSearchQuery,
  onSearchSubmit: () => {
    void search.handleSearchSubmit();
  },
  onSearchClear: search.handleSearchClear,
  isSearchBusy: search.isSearchBusy,
  selectedProfileId: profileMenu.selectedProfileId,
  profileMenuButtonRef: profileMenu.profileMenuButtonRef,
  profileMenuListRef: profileMenu.profileMenuListRef,
  selectedProfileLabel: profileMenu.selectedProfileLabel,
  isProfileMenuOpen: profileMenu.isProfileMenuOpen,
  profileMenuOptions: profileMenu.profileMenuOptions,
  profileMenuActiveIndex: profileMenu.profileMenuActiveIndex,
  newProfileOptionValue: profileMenu.newProfileOptionValue,
  manageProfileOptionValue: profileMenu.manageProfileOptionValue,
  onOpenProfileMenu: profileMenu.openProfileMenu,
  onCloseProfileMenu: profileMenu.closeProfileMenu,
  onMoveProfileMenuActiveIndex: profileMenu.moveProfileMenuActiveIndex,
  onSetProfileMenuActiveIndex: profileMenu.setProfileMenuActiveIndex,
  onSelectProfileMenuValue: profileMenu.handleProfileMenuSelect,
  isUploadBusy: files.isUploadBusy,
  onOpenFilePicker: files.handleOpenFilePicker,
  isWorkspaceSettingsOpen: workspaceActions.isWorkspaceSettingsOpen,
  onToggleWorkspaceSettings: workspaceActions.handleToggleWorkspaceSettings,
  isShortcutHelpOpen: workspaceActions.isShortcutHelpOpen,
  onToggleShortcutHelp: workspaceActions.handleToggleShortcutHelp,
  inlineFeedback: feedback.inlineFeedback,
  fileInputRef: files.fileInputRef,
  onFileInputChange: files.handleFilePickerChange,
});
