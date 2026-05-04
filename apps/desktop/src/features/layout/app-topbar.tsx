import type { ChangeEvent, RefObject } from 'react';
import { ProfileSelect, type ProfileMenuOption } from './profile-select';

interface AppTopbarProps {
  logoSrc: string;
  isDropActive: boolean;
  showGuidedStart: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  activeSearchQuery: string;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  isSearchBusy: boolean;
  selectedProfileId: string;
  profileMenuButtonRef: RefObject<HTMLButtonElement | null>;
  profileMenuListRef: RefObject<HTMLDivElement | null>;
  selectedProfileLabel: string;
  isProfileMenuOpen: boolean;
  profileMenuOptions: ProfileMenuOption[];
  profileMenuActiveIndex: number;
  newProfileOptionValue: string;
  manageProfileOptionValue: string;
  onOpenProfileMenu: () => void;
  onCloseProfileMenu: () => void;
  onMoveProfileMenuActiveIndex: (delta: -1 | 1) => void;
  onSetProfileMenuActiveIndex: (index: number) => void;
  onSelectProfileMenuValue: (value: string) => void;
  isUploadBusy: boolean;
  onOpenFilePicker: () => void;
  isWorkspaceSettingsOpen: boolean;
  onToggleWorkspaceSettings: () => void;
  isShortcutHelpOpen: boolean;
  onToggleShortcutHelp: () => void;
  inlineFeedback: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const AppTopbar = ({
  logoSrc,
  isDropActive,
  showGuidedStart,
  searchInputRef,
  searchInput,
  onSearchInputChange,
  activeSearchQuery,
  onSearchSubmit,
  onSearchClear,
  isSearchBusy,
  selectedProfileId,
  profileMenuButtonRef,
  profileMenuListRef,
  selectedProfileLabel,
  isProfileMenuOpen,
  profileMenuOptions,
  profileMenuActiveIndex,
  newProfileOptionValue,
  manageProfileOptionValue,
  onOpenProfileMenu,
  onCloseProfileMenu,
  onMoveProfileMenuActiveIndex,
  onSetProfileMenuActiveIndex,
  onSelectProfileMenuValue,
  isUploadBusy,
  onOpenFilePicker,
  isWorkspaceSettingsOpen,
  onToggleWorkspaceSettings,
  isShortcutHelpOpen,
  onToggleShortcutHelp,
  inlineFeedback,
  fileInputRef,
  onFileInputChange,
}: AppTopbarProps) => {
  const isProfileSelected = Boolean(selectedProfileId);
  const searchTooltip = !isProfileSelected
    ? 'Select a profile first'
    : isSearchBusy
      ? 'Searching…'
      : 'Search';
  const searchAriaLabel = !isProfileSelected
    ? 'Select a profile first to search'
    : isSearchBusy
      ? 'Searching'
      : 'Search';
  const uploadTooltip = !isProfileSelected
    ? 'Select a profile first'
    : isUploadBusy
      ? 'Uploading…'
      : 'Upload files';
  const uploadAriaLabel = !isProfileSelected
    ? 'Select a profile first to upload'
    : isUploadBusy
      ? 'Uploading files'
      : 'Upload files';

  return (
    <header className="topbar" inert={isDropActive}>
      <div className="topbar-brand">
        <img className="topbar-logo" src={logoSrc} alt="" aria-hidden="true" />
        <div className="topbar-brand-copy">
          <h1>LumaBin</h1>
        </div>
      </div>

      {!showGuidedStart ? (
        <div className="topbar-search">
          <input
            ref={searchInputRef}
            type="search"
            name="bucket_search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search in this bucket… (Cmd/Ctrl+K)"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSearchSubmit();
              }
            }}
          />
          {searchInput || activeSearchQuery ? (
            <button
              type="button"
              className="icon-action-button"
              aria-label="Clear search"
              title="Clear search"
              data-tooltip="Clear search"
              onClick={onSearchClear}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 7l10 10" />
                <path d="M17 7L7 17" />
              </svg>
              <span className="sr-only">Clear search</span>
            </button>
          ) : null}
          <button
            type="button"
            className={`icon-action-button ${isSearchBusy ? 'icon-action-button--busy' : ''}`}
            aria-label={searchAriaLabel}
            title={searchTooltip}
            data-tooltip={searchTooltip}
            onClick={onSearchSubmit}
            disabled={!isProfileSelected || isSearchBusy}
          >
            {isSearchBusy ? (
              <span className="button-spinner" aria-hidden="true" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" />
              </svg>
            )}
            <span className="sr-only">{searchAriaLabel}</span>
          </button>
        </div>
      ) : null}

      <div className={`topbar-actions ${showGuidedStart ? 'topbar-actions--compact' : ''}`}>
        <ProfileSelect
          buttonRef={profileMenuButtonRef}
          listRef={profileMenuListRef}
          selectedLabel={selectedProfileLabel}
          isOpen={isProfileMenuOpen}
          options={profileMenuOptions}
          activeIndex={profileMenuActiveIndex}
          selectedProfileId={selectedProfileId}
          newProfileOptionValue={newProfileOptionValue}
          manageProfileOptionValue={manageProfileOptionValue}
          onOpenMenu={onOpenProfileMenu}
          onCloseMenu={onCloseProfileMenu}
          onMoveActiveIndex={onMoveProfileMenuActiveIndex}
          onSetActiveIndex={onSetProfileMenuActiveIndex}
          onSelect={onSelectProfileMenuValue}
        />

        {!showGuidedStart ? (
          <button
            type="button"
            className={`icon-action-button ${isUploadBusy ? 'icon-action-button--busy' : ''}`}
            aria-label={uploadAriaLabel}
            title={uploadTooltip}
            data-tooltip={uploadTooltip}
            onClick={onOpenFilePicker}
            disabled={!isProfileSelected || isUploadBusy}
          >
            {isUploadBusy ? (
              <span className="button-spinner" aria-hidden="true" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 16V6" />
                <path d="M8 10l4-4 4 4" />
                <rect x="4" y="16" width="16" height="4" rx="1.5" />
              </svg>
            )}
            <span className="sr-only">{uploadAriaLabel}</span>
          </button>
        ) : null}

        {!showGuidedStart ? (
          <button
            type="button"
            className={`icon-action-button ${isWorkspaceSettingsOpen ? 'icon-action-button--active' : ''}`}
            aria-label="Open workspace settings"
            title="Workspace settings"
            data-tooltip="Workspace settings"
            aria-pressed={isWorkspaceSettingsOpen}
            onClick={onToggleWorkspaceSettings}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z" />
              <path d="M4.5 13.1v-2.2l2-.6c.1-.4.3-.8.5-1.2L6 7.2l1.6-1.6 1.9 1c.4-.2.8-.4 1.2-.5l.6-2h2.2l.6 2c.4.1.8.3 1.2.5l1.9-1L18 7.2l-1 1.9c.2.4.4.8.5 1.2l2 .6v2.2l-2 .6c-.1.4-.3.8-.5 1.2l1 1.9-1.6 1.6-1.9-1c-.4.2-.8.4-1.2.5l-.6 2h-2.2l-.6-2c-.4-.1-.8-.3-1.2-.5l-1.9 1-1.6-1.6 1-1.9c-.2-.4-.4-.8-.5-1.2l-2-.6Z" />
            </svg>
            <span className="sr-only">Workspace settings</span>
          </button>
        ) : null}

        {!showGuidedStart ? (
          <button
            type="button"
            className={`icon-action-button ${isShortcutHelpOpen ? 'icon-action-button--active' : ''}`}
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts"
            data-tooltip="Shortcuts (?)"
            aria-pressed={isShortcutHelpOpen}
            onClick={onToggleShortcutHelp}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.2 9.2a3 3 0 1 1 5.2 2c-.7.8-1.7 1.2-2.1 2.2V14" />
              <circle cx="12" cy="17.2" r="0.9" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span className="sr-only">Keyboard shortcuts</span>
          </button>
        ) : null}

        {inlineFeedback ? (
          <span className="inline-feedback" role="status" aria-live="polite" aria-atomic="true">
            {inlineFeedback}
          </span>
        ) : null}

        <input
          ref={fileInputRef}
          className="hidden-file-input"
          type="file"
          multiple
          onChange={onFileInputChange}
        />
      </div>
    </header>
  );
};
