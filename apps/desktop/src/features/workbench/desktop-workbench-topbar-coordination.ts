import {
  createDesktopWorkbenchTopbarAssets,
  createDesktopWorkbenchTopbarFeedback,
  createDesktopWorkbenchTopbarFiles,
  createDesktopWorkbenchTopbarProfileMenu,
  createDesktopWorkbenchTopbarProps,
  createDesktopWorkbenchTopbarSearch,
  createDesktopWorkbenchTopbarState,
  createDesktopWorkbenchTopbarWorkspaceActions,
} from './desktop-workbench-main-presenters';

type TopbarAssets = Parameters<typeof createDesktopWorkbenchTopbarAssets>[0]['assets'];
type TopbarFeedback = Parameters<typeof createDesktopWorkbenchTopbarFeedback>[0]['feedback'];
type TopbarFiles = Parameters<typeof createDesktopWorkbenchTopbarFiles>[0]['files'];
type TopbarProfileMenu = Parameters<
  typeof createDesktopWorkbenchTopbarProfileMenu
>[0]['profileMenu'];
type TopbarSearch = Parameters<typeof createDesktopWorkbenchTopbarSearch>[0]['search'];
type TopbarState = Parameters<typeof createDesktopWorkbenchTopbarState>[0]['state'];
type TopbarWorkspaceActions = Parameters<
  typeof createDesktopWorkbenchTopbarWorkspaceActions
>[0]['workspaceActions'];

interface CreateDesktopWorkbenchTopbarCoordinationPropsInput {
  assets: TopbarAssets;
  feedback: TopbarFeedback;
  files: TopbarFiles;
  profileMenu: TopbarProfileMenu;
  search: TopbarSearch;
  state: TopbarState;
  workspaceActions: TopbarWorkspaceActions;
}

export const createDesktopWorkbenchTopbarCoordinationProps = ({
  assets,
  feedback,
  files,
  profileMenu,
  search,
  state,
  workspaceActions,
}: CreateDesktopWorkbenchTopbarCoordinationPropsInput) =>
  createDesktopWorkbenchTopbarProps({
    assets: createDesktopWorkbenchTopbarAssets({
      assets,
    }),
    feedback: createDesktopWorkbenchTopbarFeedback({
      feedback,
    }),
    files: createDesktopWorkbenchTopbarFiles({
      files,
    }),
    profileMenu: createDesktopWorkbenchTopbarProfileMenu({
      profileMenu,
    }),
    search: createDesktopWorkbenchTopbarSearch({
      search,
    }),
    state: createDesktopWorkbenchTopbarState({
      state,
    }),
    workspaceActions: createDesktopWorkbenchTopbarWorkspaceActions({
      workspaceActions,
    }),
  });
