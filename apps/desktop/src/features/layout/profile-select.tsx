import type { RefObject } from 'react';
import type { ProfileMenuOption } from '../shared/profile-menu-option';

export type { ProfileMenuOption } from '../shared/profile-menu-option';

interface ProfileSelectProps {
  buttonRef: RefObject<HTMLButtonElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  selectedLabel: string;
  isOpen: boolean;
  options: ProfileMenuOption[];
  activeIndex: number;
  selectedProfileId: string;
  newProfileOptionValue: string;
  manageProfileOptionValue: string;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onMoveActiveIndex: (delta: -1 | 1) => void;
  onSetActiveIndex: (index: number) => void;
  onSelect: (value: string) => void;
}

export const ProfileSelect = ({
  buttonRef,
  listRef,
  selectedLabel,
  isOpen,
  options,
  activeIndex,
  selectedProfileId,
  newProfileOptionValue,
  manageProfileOptionValue,
  onOpenMenu,
  onCloseMenu,
  onMoveActiveIndex,
  onSetActiveIndex,
  onSelect,
}: ProfileSelectProps) => {
  return (
    <div className="topbar-profile-select">
      <button
        ref={buttonRef}
        type="button"
        className="profile-select-trigger"
        aria-label="Select profile"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="profile-menu-listbox"
        onClick={() => {
          if (isOpen) {
            onCloseMenu();
            return;
          }
          onOpenMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isOpen) {
              onOpenMenu();
              return;
            }
            onMoveActiveIndex(1);
            return;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!isOpen) {
              onOpenMenu();
              return;
            }
            onMoveActiveIndex(-1);
          }
        }}
      >
        <span className="profile-select-trigger__label">{selectedLabel}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8 10 4 4 4-4" />
        </svg>
      </button>
      {isOpen ? (
        <div
          ref={listRef}
          id="profile-menu-listbox"
          className="profile-select-menu"
          role="listbox"
          tabIndex={-1}
          aria-label="Connection profile options"
          aria-activedescendant={
            options[activeIndex] ? `profile-menu-option-${activeIndex}` : undefined
          }
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              onMoveActiveIndex(1);
              return;
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              onMoveActiveIndex(-1);
              return;
            }
            if (event.key === 'Home') {
              event.preventDefault();
              const firstEnabledIndex = options.findIndex((option) => !option.disabled);
              if (firstEnabledIndex >= 0) {
                onSetActiveIndex(firstEnabledIndex);
              }
              return;
            }
            if (event.key === 'End') {
              event.preventDefault();
              const enabled = options
                .map((option, index) => ({ option, index }))
                .filter(({ option }) => !option.disabled);
              const lastEnabled = enabled.at(-1);
              if (lastEnabled) {
                onSetActiveIndex(lastEnabled.index);
              }
              return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              const activeOption = options[activeIndex];
              if (!activeOption || activeOption.disabled) {
                return;
              }
              onSelect(activeOption.value);
            }
          }}
        >
          {options.map((option, index) => {
            const isActive = activeIndex === index;
            const isSelectedOption =
              !option.disabled &&
              option.value !== newProfileOptionValue &&
              option.value !== manageProfileOptionValue &&
              option.value === selectedProfileId;
            return (
              <button
                key={`${option.value}-${index}`}
                id={`profile-menu-option-${index}`}
                type="button"
                role="option"
                className={`profile-select-option ${
                  isActive ? 'profile-select-option--active' : ''
                } ${option.disabled ? 'profile-select-option--disabled' : ''}`.trim()}
                aria-selected={isSelectedOption}
                disabled={option.disabled}
                onMouseEnter={() => {
                  if (option.disabled) {
                    return;
                  }
                  onSetActiveIndex(index);
                }}
                onClick={() => {
                  if (option.disabled) {
                    return;
                  }
                  onSelect(option.value);
                }}
              >
                <span className="profile-select-option__label">{option.label}</span>
                {isSelectedOption ? (
                  <span className="profile-select-option__check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
