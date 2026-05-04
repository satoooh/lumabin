import type { AssetDiscoveryEvent } from '../contexts/asset-discovery/events';
import type { AssetIngestionEvent } from '../contexts/asset-ingestion/events';
import type { AssetLibraryEvent } from '../contexts/asset-library/events';
import type { WorkspaceEvent } from '../contexts/workspace/events';

export type ApplicationEvent =
  | WorkspaceEvent
  | AssetIngestionEvent
  | AssetLibraryEvent
  | AssetDiscoveryEvent;

export type ApplicationEventHandler = (event: ApplicationEvent) => void;
