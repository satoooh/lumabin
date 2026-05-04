export type AssetDiscoveryEvent =
  | {
      type: 'asset-discovery.saved-view.saved';
      occurredAt: string;
      payload: { viewId: string; pinned: boolean };
    }
  | {
      type: 'asset-discovery.saved-view.deleted';
      occurredAt: string;
      payload: { viewId: string };
    };
