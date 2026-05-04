import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseModalFocusTrapOptions {
  isEnabled: boolean;
  modalSelector?: string;
}

export const useModalFocusTrap = ({
  isEnabled,
  modalSelector = '.modal-card',
}: UseModalFocusTrapOptions): void => {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const modalCards = Array.from(document.querySelectorAll<HTMLElement>(modalSelector));
    const activeModal = modalCards.at(-1);
    if (!activeModal) {
      return;
    }

    const previousFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableTargets = Array.from(
      activeModal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);
    const firstFocusable = focusableTargets[0] ?? activeModal;

    if (!activeModal.contains(document.activeElement)) {
      window.setTimeout(() => {
        if (firstFocusable === activeModal) {
          activeModal.tabIndex = -1;
        }
        firstFocusable.focus();
      }, 0);
    }

    const handleModalTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusTargets = Array.from(
        activeModal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null || element === document.activeElement);
      if (focusTargets.length === 0) {
        event.preventDefault();
        activeModal.focus();
        return;
      }

      const first = focusTargets[0];
      const last = focusTargets[focusTargets.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleModalTab);
    return () => {
      document.removeEventListener('keydown', handleModalTab);
      if (previousFocused?.isConnected) {
        previousFocused.focus();
      }
    };
  }, [isEnabled, modalSelector]);
};
