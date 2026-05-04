import { useEffect, useRef, useState } from 'react';

const TOOLTIP_WARM_DELAY_MS = 420;
const TOOLTIP_TRIGGER_SELECTOR = '.icon-action-button[data-tooltip]';

export const isTooltipWarmTrigger = (target: EventTarget | null): boolean =>
  target instanceof Element && Boolean(target.closest(TOOLTIP_TRIGGER_SELECTOR));

export const useTooltipWarmState = (): boolean => {
  const [isTooltipWarm, setIsTooltipWarm] = useState<boolean>(false);
  const tooltipWarmTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipWarmTimerRef.current !== null) {
        window.clearTimeout(tooltipWarmTimerRef.current);
        tooltipWarmTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isTooltipWarm) {
      return;
    }

    const onTooltipPointerEnter = (event: PointerEvent) => {
      if (!isTooltipWarmTrigger(event.target)) {
        return;
      }
      if (tooltipWarmTimerRef.current !== null) {
        return;
      }

      tooltipWarmTimerRef.current = window.setTimeout(() => {
        setIsTooltipWarm(true);
        tooltipWarmTimerRef.current = null;
      }, TOOLTIP_WARM_DELAY_MS);
    };

    document.addEventListener('pointerenter', onTooltipPointerEnter, true);
    return () => {
      document.removeEventListener('pointerenter', onTooltipPointerEnter, true);
    };
  }, [isTooltipWarm]);

  return isTooltipWarm;
};
