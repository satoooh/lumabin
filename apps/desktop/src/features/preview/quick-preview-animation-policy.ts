export interface QuickPreviewRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuickPreviewRectTransition {
  deltaX: number;
  deltaY: number;
  scaleX: number;
  scaleY: number;
}

export const QUICK_PREVIEW_ANIMATION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const QUICK_PREVIEW_FADE_CLOSE_DURATION_MS = 190;
export const QUICK_PREVIEW_TARGET_CLOSE_DURATION_MS = 230;
export const QUICK_PREVIEW_OPEN_DURATION_MS = 260;

export const canAnimateElement = (node: Element | null): node is Element & {
  animate: (
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
  ) => Animation;
} => Boolean(node && typeof (node as Element).animate === 'function');

export const resolveQuickPreviewRectTransition = (
  fromRect: QuickPreviewRect,
  toRect: QuickPreviewRect,
): QuickPreviewRectTransition => {
  const fromCenterX = fromRect.x + fromRect.width / 2;
  const fromCenterY = fromRect.y + fromRect.height / 2;
  const toCenterX = toRect.x + toRect.width / 2;
  const toCenterY = toRect.y + toRect.height / 2;

  return {
    deltaX: toCenterX - fromCenterX,
    deltaY: toCenterY - fromCenterY,
    scaleX: Math.max(0.22, Math.min(1, toRect.width / fromRect.width)),
    scaleY: Math.max(0.22, Math.min(1, toRect.height / fromRect.height)),
  };
};

export const domRectToQuickPreviewRect = (rect: DOMRect): QuickPreviewRect => ({
  x: rect.left,
  y: rect.top,
  width: rect.width,
  height: rect.height,
});

export const animateQuickPreviewFadeClose = (
  overlayNode: Element & { animate: Element['animate'] },
  previewCardNode: Element & { animate: Element['animate'] },
): Animation[] => {
  const overlayFade = overlayNode.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    {
      duration: QUICK_PREVIEW_FADE_CLOSE_DURATION_MS,
      easing: QUICK_PREVIEW_ANIMATION_EASING,
      fill: 'forwards',
    },
  );
  const cardFade = previewCardNode.animate(
    [
      { opacity: 1, transform: 'translateY(0px) scale(1)' },
      { opacity: 0.8, transform: 'translateY(2px) scale(0.994)' },
    ],
    {
      duration: QUICK_PREVIEW_FADE_CLOSE_DURATION_MS,
      easing: QUICK_PREVIEW_ANIMATION_EASING,
      fill: 'forwards',
    },
  );
  return [overlayFade, cardFade];
};

export const animateQuickPreviewTargetClose = (
  overlayNode: Element & { animate: Element['animate'] },
  mediaNode: Element & { animate: Element['animate'] },
  previewCardNode: Element & { animate: Element['animate'] },
  mediaRect: QuickPreviewRect,
  destinationRect: QuickPreviewRect,
): Animation[] => {
  const {
    deltaX,
    deltaY,
    scaleX,
    scaleY,
  } = resolveQuickPreviewRectTransition(mediaRect, destinationRect);

  const overlayFade = overlayNode.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    {
      duration: QUICK_PREVIEW_TARGET_CLOSE_DURATION_MS,
      easing: QUICK_PREVIEW_ANIMATION_EASING,
      fill: 'forwards',
    },
  );
  const mediaZoomOut = mediaNode.animate(
    [
      {
        transform: 'translate(0px, 0px) scale(1, 1)',
        opacity: 1,
      },
      {
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        opacity: 0.8,
      },
    ],
    {
      duration: QUICK_PREVIEW_TARGET_CLOSE_DURATION_MS,
      easing: QUICK_PREVIEW_ANIMATION_EASING,
      fill: 'forwards',
    },
  );
  const cardFade = previewCardNode.animate(
    [
      { opacity: 1, transform: 'translateY(0px) scale(1)' },
      { opacity: 0.86, transform: 'translateY(0px) scale(0.998)' },
    ],
    {
      duration: QUICK_PREVIEW_TARGET_CLOSE_DURATION_MS,
      easing: QUICK_PREVIEW_ANIMATION_EASING,
      fill: 'forwards',
    },
  );
  return [overlayFade, mediaZoomOut, cardFade];
};

export const animateQuickPreviewOpenFromSource = (
  mediaNode: Element & { animate: Element['animate'] },
  targetRect: QuickPreviewRect,
  previewSourceRect: QuickPreviewRect,
): Animation[] => {
  const {
    deltaX,
    deltaY,
    scaleX,
    scaleY,
  } = resolveQuickPreviewRectTransition(targetRect, previewSourceRect);

  const mediaAnimation = mediaNode.animate(
    [
      {
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        opacity: 0.78,
      },
      {
        transform: 'translate(0px, 0px) scale(1, 1)',
        opacity: 1,
      },
    ],
    {
      duration: QUICK_PREVIEW_OPEN_DURATION_MS,
      easing: QUICK_PREVIEW_ANIMATION_EASING,
      fill: 'both',
    },
  );

  const imageNode = mediaNode.querySelector<HTMLImageElement>('.asset-image-lightbox');
  const imageAnimation = canAnimateElement(imageNode)
    ? imageNode.animate(
        [
          {
            transform: 'scale(1.06)',
            opacity: 0.88,
          },
          {
            transform: 'scale(1)',
            opacity: 1,
          },
        ],
        {
          duration: QUICK_PREVIEW_OPEN_DURATION_MS,
          easing: QUICK_PREVIEW_ANIMATION_EASING,
          fill: 'both',
        },
      )
    : undefined;

  return imageAnimation ? [mediaAnimation, imageAnimation] : [mediaAnimation];
};
