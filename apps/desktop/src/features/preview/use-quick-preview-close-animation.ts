import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  animateQuickPreviewFadeClose,
  animateQuickPreviewOpenFromSource,
  animateQuickPreviewTargetClose,
  canAnimateElement,
  domRectToQuickPreviewRect,
  type QuickPreviewRect,
} from './quick-preview-animation-policy';

interface UseQuickPreviewCloseAnimationOptions {
  isOpen: boolean;
  onClose: () => void;
  previewSourceRect: QuickPreviewRect | null;
  resolveCloseTargetRect: () => QuickPreviewRect | null;
  selectedAssetKey: string | undefined;
}

export const useQuickPreviewCloseAnimation = ({
  isOpen,
  onClose,
  previewSourceRect,
  resolveCloseTargetRect,
  selectedAssetKey,
}: UseQuickPreviewCloseAnimationOptions) => {
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previewCardRef = useRef<HTMLElement | null>(null);
  const previewMediaRef = useRef<HTMLDivElement | null>(null);
  const closeAnimationRef = useRef<Animation[] | null>(null);
  const closeCommittedRef = useRef(false);

  const commitClose = useCallback(() => {
    if (closeCommittedRef.current) {
      return;
    }
    closeCommittedRef.current = true;
    setIsClosing(false);
    onClose();
  }, [onClose]);

  const stopCloseAnimations = useCallback(() => {
    const animations = closeAnimationRef.current;
    if (!animations || animations.length === 0) {
      return;
    }
    for (const animation of animations) {
      animation.cancel();
    }
    closeAnimationRef.current = null;
  }, []);

  const requestCloseWithAnimation = useCallback(() => {
    if (isClosing) {
      return;
    }

    if (typeof window === 'undefined') {
      commitClose();
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commitClose();
      return;
    }

    const mediaNode = previewMediaRef.current;
    const overlayNode = overlayRef.current;
    const previewCardNode = previewCardRef.current;
    if (!mediaNode || !overlayNode || !previewCardNode) {
      commitClose();
      return;
    }

    const destinationRect = resolveCloseTargetRect() ?? previewSourceRect;
    if (!destinationRect) {
      if (!canAnimateElement(overlayNode) || !canAnimateElement(previewCardNode)) {
        commitClose();
        return;
      }

      const animations = animateQuickPreviewFadeClose(overlayNode, previewCardNode);
      closeAnimationRef.current = animations;
      setIsClosing(true);
      void Promise.allSettled(animations.map((animation) => animation.finished)).finally(() => {
        closeAnimationRef.current = null;
        commitClose();
      });
      return;
    }

    const mediaRect = mediaNode.getBoundingClientRect();
    if (mediaRect.width < 2 || mediaRect.height < 2) {
      commitClose();
      return;
    }

    if (
      !canAnimateElement(overlayNode) ||
      !canAnimateElement(mediaNode) ||
      !canAnimateElement(previewCardNode)
    ) {
      commitClose();
      return;
    }

    const animations = animateQuickPreviewTargetClose(
      overlayNode,
      mediaNode,
      previewCardNode,
      domRectToQuickPreviewRect(mediaRect),
      destinationRect,
    );
    closeAnimationRef.current = animations;
    setIsClosing(true);
    void Promise.allSettled(animations.map((animation) => animation.finished)).finally(() => {
      closeAnimationRef.current = null;
      commitClose();
    });
  }, [commitClose, isClosing, previewSourceRect, resolveCloseTargetRect]);

  useLayoutEffect(() => {
    if (!isOpen || !previewSourceRect || isClosing) {
      return;
    }

    const mediaNode = previewMediaRef.current;
    if (!mediaNode) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!canAnimateElement(mediaNode)) {
      return;
    }

    const targetRect = mediaNode.getBoundingClientRect();
    if (targetRect.width < 2 || targetRect.height < 2) {
      return;
    }

    const animations = animateQuickPreviewOpenFromSource(
      mediaNode,
      domRectToQuickPreviewRect(targetRect),
      previewSourceRect,
    );

    return () => {
      for (const animation of animations) {
        animation.cancel();
      }
    };
  }, [isClosing, isOpen, previewSourceRect, selectedAssetKey]);

  useEffect(() => {
    closeCommittedRef.current = false;
    setIsClosing(false);
    stopCloseAnimations();
    return () => {
      stopCloseAnimations();
    };
  }, [isOpen, selectedAssetKey, stopCloseAnimations]);

  useEffect(() => {
    if (!isOpen || isClosing) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      requestCloseWithAnimation();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isClosing, isOpen, requestCloseWithAnimation]);

  return {
    overlayRef,
    previewCardRef,
    previewMediaRef,
    requestCloseWithAnimation,
  };
};
