import { useEffect, type RefObject } from 'react';

interface UseProfileMenuEffectsOptions {
  closeProfileMenu: () => void;
  hasInitialized: boolean;
  isProfileMenuOpen: boolean;
  profileMenuButtonRef: RefObject<HTMLButtonElement | null>;
  profileMenuListRef: RefObject<HTMLDivElement | null>;
  selectedProfileId: string;
}

export const useProfileMenuEffects = ({
  closeProfileMenu,
  hasInitialized,
  isProfileMenuOpen,
  profileMenuButtonRef,
  profileMenuListRef,
  selectedProfileId,
}: UseProfileMenuEffectsOptions): void => {
  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      const isInsideMenu = profileMenuListRef.current?.contains(target);
      const isInsideButton = profileMenuButtonRef.current?.contains(target);
      if (isInsideMenu || isInsideButton) {
        return;
      }

      closeProfileMenu();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      closeProfileMenu();
      profileMenuButtonRef.current?.focus();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [closeProfileMenu, isProfileMenuOpen, profileMenuButtonRef, profileMenuListRef]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }
    window.requestAnimationFrame(() => {
      profileMenuListRef.current?.focus();
    });
  }, [isProfileMenuOpen, profileMenuListRef]);

  useEffect(() => {
    const shouldShowGuidedStart = hasInitialized && !selectedProfileId;
    if (shouldShowGuidedStart && isProfileMenuOpen) {
      closeProfileMenu();
    }
  }, [closeProfileMenu, hasInitialized, isProfileMenuOpen, selectedProfileId]);
};
