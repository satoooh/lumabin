import {
  createDesktopWorkbenchCenterPaneAssetList,
  createDesktopWorkbenchCenterPaneEmptyState,
  createDesktopWorkbenchCenterPaneFilters,
  createDesktopWorkbenchCenterPaneGallery,
  createDesktopWorkbenchCenterPaneGuidedStart,
  createDesktopWorkbenchCenterPaneInteraction,
  createDesktopWorkbenchCenterPaneProps,
  createDesktopWorkbenchCenterPaneSelection,
  createDesktopWorkbenchCenterPaneSizing,
  createDesktopWorkbenchCenterPaneState,
  createDesktopWorkbenchCenterPaneViewModeCommands,
} from './desktop-workbench-main-presenters';

type CenterPaneAssetList = Parameters<
  typeof createDesktopWorkbenchCenterPaneAssetList
>[0]['assetList'];
type CenterPaneEmptyState = Parameters<
  typeof createDesktopWorkbenchCenterPaneEmptyState
>[0]['emptyState'];
type CenterPaneFilters = Parameters<typeof createDesktopWorkbenchCenterPaneFilters>[0]['filters'];
type CenterPaneGallery = Parameters<typeof createDesktopWorkbenchCenterPaneGallery>[0]['gallery'];
type CenterPaneGuidedStart = Parameters<
  typeof createDesktopWorkbenchCenterPaneGuidedStart
>[0]['guidedStart'];
type CenterPaneInteraction = Parameters<
  typeof createDesktopWorkbenchCenterPaneInteraction
>[0]['interaction'];
type CenterPaneSelection = Parameters<
  typeof createDesktopWorkbenchCenterPaneSelection
>[0]['selection'];
type CenterPaneSizing = Parameters<typeof createDesktopWorkbenchCenterPaneSizing>[0]['sizing'];
type CenterPaneState = Parameters<typeof createDesktopWorkbenchCenterPaneState>[0]['state'];
type CenterPaneViewModeCommands = Parameters<
  typeof createDesktopWorkbenchCenterPaneViewModeCommands
>[0]['viewModeCommands'];

interface CreateDesktopWorkbenchCenterPaneCoordinationPropsInput {
  assetList: CenterPaneAssetList;
  emptyState: CenterPaneEmptyState;
  filters: CenterPaneFilters;
  gallery: CenterPaneGallery;
  guidedStart: CenterPaneGuidedStart;
  interaction: CenterPaneInteraction;
  selection: CenterPaneSelection;
  sizing: CenterPaneSizing;
  state: CenterPaneState;
  viewModeCommands: CenterPaneViewModeCommands;
}

export const createDesktopWorkbenchCenterPaneCoordinationProps = ({
  assetList,
  emptyState,
  filters,
  gallery,
  guidedStart,
  interaction,
  selection,
  sizing,
  state,
  viewModeCommands,
}: CreateDesktopWorkbenchCenterPaneCoordinationPropsInput) =>
  createDesktopWorkbenchCenterPaneProps({
    assetList: createDesktopWorkbenchCenterPaneAssetList({
      assetList,
    }),
    emptyState: createDesktopWorkbenchCenterPaneEmptyState({
      emptyState,
    }),
    filters: createDesktopWorkbenchCenterPaneFilters({
      filters,
    }),
    gallery: createDesktopWorkbenchCenterPaneGallery({
      gallery,
    }),
    guidedStart: createDesktopWorkbenchCenterPaneGuidedStart({
      guidedStart,
    }),
    interaction: createDesktopWorkbenchCenterPaneInteraction({
      interaction,
    }),
    selection: createDesktopWorkbenchCenterPaneSelection({
      selection,
    }),
    sizing: createDesktopWorkbenchCenterPaneSizing({
      sizing,
    }),
    state: createDesktopWorkbenchCenterPaneState({
      state,
    }),
    viewModeCommands: createDesktopWorkbenchCenterPaneViewModeCommands({
      viewModeCommands,
    }),
  });
