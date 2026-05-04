import type { SavedView } from '../../shared/ipc';

const savedViews = new Map<string, SavedView>();

export const hydrateSavedViews = (views: SavedView[]): void => {
  savedViews.clear();
  for (const savedView of views) {
    savedViews.set(savedView.id, savedView);
  }
};

export const listSavedViews = (): SavedView[] => [...savedViews.values()];

export const saveSavedView = (view: SavedView): void => {
  savedViews.set(view.id, view);
};

export const deleteSavedView = (viewId: string): void => {
  savedViews.delete(viewId);
};
