export type BoundedContextName =
  | 'workspace'
  | 'asset-library'
  | 'asset-ingestion'
  | 'asset-discovery'
  | 'asset-sharing'
  | 'diagnostics';

export type IpcMessageKind = 'command' | 'query';

export interface IpcContractCatalogEntry {
  channel: string;
  boundedContext: BoundedContextName;
  kind: IpcMessageKind;
  intent: string;
}
