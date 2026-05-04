import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';
import type { AssetItem } from '../../shared/ipc';
import { ActiveQuerySummary } from './active-query-summary';
import { UnifiedFilterBar } from './filter-bars';

type AssetKind = 'image' | 'video' | 'pdf' | 'csv' | 'other';

interface AssetListPaneProps {
  unifiedFilterOptions: Array<{
    id: string;
    label: string;
    count: number;
    tone?: 'default' | 'kind' | 'smart';
  }>;
  activeUnifiedFilterId: string;
  onSelectUnifiedFilter: (id: string) => void;
  activeKindLabel: string;
  activeSmartCollectionLabel: string;
  activeSearchQuery: string;
  onClearSearch: () => void;
  onResetFilters: () => void;
  listContainerRef: RefObject<HTMLDivElement | null>;
  onListScroll: (scrollTop: number, viewportHeight: number) => void;
  listTopSpacerHeight: number;
  listBottomSpacerHeight: number;
  listVirtualItems: AssetItem[];
  inferAssetKind: (item: AssetItem) => AssetKind;
  isSelectionMode: boolean;
  selectedAssetKeySet: Set<string>;
  selectedAssetKey: string;
  setAssetItemRef: (key: string, node: HTMLButtonElement | null) => void;
  listRovingAssetKey: string;
  onAssetFocus: (key: string) => void;
  onAssetClick: (event: ReactMouseEvent<HTMLButtonElement>, item: AssetItem) => void;
  onAssetDoubleClick: (item: AssetItem, kind: AssetKind) => void;
  formatBytes: (value: number) => string;
  formatDate: (value: string) => string;
}

export const AssetListPane = ({
  unifiedFilterOptions,
  activeUnifiedFilterId,
  onSelectUnifiedFilter,
  activeKindLabel,
  activeSmartCollectionLabel,
  activeSearchQuery,
  onClearSearch,
  onResetFilters,
  listContainerRef,
  onListScroll,
  listTopSpacerHeight,
  listBottomSpacerHeight,
  listVirtualItems,
  inferAssetKind,
  isSelectionMode,
  selectedAssetKeySet,
  selectedAssetKey,
  setAssetItemRef,
  listRovingAssetKey,
  onAssetFocus,
  onAssetClick,
  onAssetDoubleClick,
  formatBytes,
  formatDate,
}: AssetListPaneProps) => {
  return (
    <div className="list-content">
      <UnifiedFilterBar
        options={unifiedFilterOptions}
        activeId={activeUnifiedFilterId}
        onSelect={onSelectUnifiedFilter}
      />
      <ActiveQuerySummary
        searchQuery={activeSearchQuery}
        activeKindLabel={activeKindLabel}
        activeSmartCollectionLabel={activeSmartCollectionLabel}
        onClearSearch={onClearSearch}
        onResetFilters={onResetFilters}
      />
      <div
        className="list-wrap"
        ref={listContainerRef}
        onScroll={(event) => {
          onListScroll(event.currentTarget.scrollTop, event.currentTarget.clientHeight);
        }}
      >
        <div className="asset-list-header">
          <span>Name</span>
          <span>Kind</span>
          <span>Size</span>
          <span>Modified</span>
        </div>

        <div style={{ height: listTopSpacerHeight }} />
        {listVirtualItems.map((item) => {
          const kind = inferAssetKind(item);
          const isSelected = isSelectionMode
            ? selectedAssetKeySet.has(item.key)
            : item.key === selectedAssetKey;
          return (
            <button
              type="button"
              key={item.key}
              ref={(node) => setAssetItemRef(item.key, node)}
              className={`asset-list-row ${isSelected ? 'asset-list-row--selected' : ''}`}
              tabIndex={item.key === listRovingAssetKey ? 0 : -1}
              onFocus={() => {
                if (isSelectionMode) {
                  onAssetFocus(item.key);
                }
              }}
              onClick={(event) => onAssetClick(event, item)}
              onDoubleClick={() => {
                if (isSelectionMode) {
                  return;
                }
                onAssetDoubleClick(item, kind);
              }}
            >
              <span className="asset-list-name-cell" title={item.key}>
                {isSelected ? (
                  <span className="asset-list-selection-indicator" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
                <span className="asset-list-name-text">{item.key}</span>
              </span>
              <span>{kind}</span>
              <span>{formatBytes(item.size)}</span>
              <span>{formatDate(item.lastModified)}</span>
            </button>
          );
        })}
        <div style={{ height: listBottomSpacerHeight }} />
      </div>
    </div>
  );
};
