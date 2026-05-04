import { useAppDomRefs } from '../layout/use-app-dom-refs';
import { useTooltipWarmState } from '../layout/use-tooltip-warm-state';
import { useDesktopWorkbenchFeedback } from './use-desktop-workbench-feedback';

export const useDesktopWorkbenchShellResources = () => ({
  domRefs: useAppDomRefs(),
  feedback: useDesktopWorkbenchFeedback(),
  isTooltipWarm: useTooltipWarmState(),
});
