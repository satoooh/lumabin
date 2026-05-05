import type { createDesktopWorkbenchTopbarCoordinationProps } from './desktop-workbench-topbar-coordination';

type TopbarCoordinationInput = Parameters<typeof createDesktopWorkbenchTopbarCoordinationProps>[0];
type TopbarAssets = TopbarCoordinationInput['assets'];
type TopbarFeedback = TopbarCoordinationInput['feedback'];
type TopbarFiles = TopbarCoordinationInput['files'];
type TopbarProfileMenu = TopbarCoordinationInput['profileMenu'];
type TopbarSearch = TopbarCoordinationInput['search'];
type TopbarState = TopbarCoordinationInput['state'];
type TopbarWorkspaceActions = TopbarCoordinationInput['workspaceActions'];

interface DesktopWorkbenchTopbarHandoffInput {
  activeSearchQuery: TopbarSearch['activeSearchQuery'];
  closeProfileMenu: TopbarProfileMenu['closeProfileMenu'];
  fileInputRef: TopbarFiles['fileInputRef'];
  handleFilePickerChange: TopbarFiles['handleFilePickerChange'];
  handleOpenFilePicker: TopbarFiles['handleOpenFilePicker'];
  handleProfileMenuSelect: TopbarProfileMenu['handleProfileMenuSelect'];
  handleSearchClear: TopbarSearch['handleSearchClear'];
  handleSearchSubmit: TopbarSearch['handleSearchSubmit'];
  handleToggleShortcutHelp: TopbarWorkspaceActions['handleToggleShortcutHelp'];
  handleToggleWorkspaceSettings: TopbarWorkspaceActions['handleToggleWorkspaceSettings'];
  inlineFeedback: TopbarFeedback['inlineFeedback'];
  isDropActive: TopbarState['isDropActive'];
  isProfileMenuOpen: TopbarProfileMenu['isProfileMenuOpen'];
  isSearchBusy: TopbarSearch['isSearchBusy'];
  isShortcutHelpOpen: TopbarWorkspaceActions['isShortcutHelpOpen'];
  isUploadBusy: TopbarFiles['isUploadBusy'];
  isWorkspaceSettingsOpen: TopbarWorkspaceActions['isWorkspaceSettingsOpen'];
  logoSrc: TopbarAssets['logoSrc'];
  manageProfileOptionValue: TopbarProfileMenu['manageProfileOptionValue'];
  moveProfileMenuActiveIndex: TopbarProfileMenu['moveProfileMenuActiveIndex'];
  newProfileOptionValue: TopbarProfileMenu['newProfileOptionValue'];
  openProfileMenu: TopbarProfileMenu['openProfileMenu'];
  profileMenuActiveIndex: TopbarProfileMenu['profileMenuActiveIndex'];
  profileMenuButtonRef: TopbarProfileMenu['profileMenuButtonRef'];
  profileMenuListRef: TopbarProfileMenu['profileMenuListRef'];
  profileMenuOptions: TopbarProfileMenu['profileMenuOptions'];
  searchInput: TopbarSearch['searchInput'];
  searchInputRef: TopbarSearch['searchInputRef'];
  selectedProfileId: TopbarProfileMenu['selectedProfileId'];
  selectedProfileLabel: TopbarProfileMenu['selectedProfileLabel'];
  setProfileMenuActiveIndex: TopbarProfileMenu['setProfileMenuActiveIndex'];
  setSearchInput: TopbarSearch['setSearchInput'];
  showGuidedStart: TopbarState['showGuidedStart'];
}

export const createDesktopWorkbenchTopbarCoordinationInput = ({
  activeSearchQuery,
  closeProfileMenu,
  fileInputRef,
  handleFilePickerChange,
  handleOpenFilePicker,
  handleProfileMenuSelect,
  handleSearchClear,
  handleSearchSubmit,
  handleToggleShortcutHelp,
  handleToggleWorkspaceSettings,
  inlineFeedback,
  isDropActive,
  isProfileMenuOpen,
  isSearchBusy,
  isShortcutHelpOpen,
  isUploadBusy,
  isWorkspaceSettingsOpen,
  logoSrc,
  manageProfileOptionValue,
  moveProfileMenuActiveIndex,
  newProfileOptionValue,
  openProfileMenu,
  profileMenuActiveIndex,
  profileMenuButtonRef,
  profileMenuListRef,
  profileMenuOptions,
  searchInput,
  searchInputRef,
  selectedProfileId,
  selectedProfileLabel,
  setProfileMenuActiveIndex,
  setSearchInput,
  showGuidedStart,
}: DesktopWorkbenchTopbarHandoffInput): TopbarCoordinationInput => ({
  assets: {
    logoSrc,
  },
  feedback: {
    inlineFeedback,
  },
  files: {
    fileInputRef,
    handleFilePickerChange,
    handleOpenFilePicker,
    isUploadBusy,
  },
  profileMenu: {
    closeProfileMenu,
    handleProfileMenuSelect,
    isProfileMenuOpen,
    manageProfileOptionValue,
    moveProfileMenuActiveIndex,
    newProfileOptionValue,
    openProfileMenu,
    profileMenuActiveIndex,
    profileMenuButtonRef,
    profileMenuListRef,
    profileMenuOptions,
    selectedProfileId,
    selectedProfileLabel,
    setProfileMenuActiveIndex,
  },
  search: {
    activeSearchQuery,
    handleSearchClear,
    handleSearchSubmit,
    isSearchBusy,
    searchInput,
    searchInputRef,
    setSearchInput,
  },
  state: {
    isDropActive,
    showGuidedStart,
  },
  workspaceActions: {
    handleToggleShortcutHelp,
    handleToggleWorkspaceSettings,
    isShortcutHelpOpen,
    isWorkspaceSettingsOpen,
  },
});
