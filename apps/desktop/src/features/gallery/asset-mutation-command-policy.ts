import {
  basenameFromKey,
  commonParentPrefixFromKeys,
  parentPrefixFromKey,
} from '../shared/asset-key';
import { formatCount } from '../shared/format-count';

type AssetMutationStatusTone = 'success' | 'error';

export type AssetActionDialogKind = 'delete' | 'move' | 'rename';

export interface AssetActionDialogPlan {
  inputValue: string;
  key: string;
  kind: AssetActionDialogKind;
}

export type AssetRenamePlan =
  | {
      kind: 'rename';
      destinationKey: string;
    }
  | {
      kind: 'no-change';
    };

export type AssetMovePlan =
  | {
      kind: 'move';
      destinationKey: string;
    }
  | {
      kind: 'no-change';
    };

export interface BulkAssetMovePlanItem {
  sourceKey: string;
  destinationKey: string;
}

export interface BulkAssetMoveDialogPlan {
  destinationPrefix: string;
  keys: string[];
}

export type BulkAssetMovePlan =
  | {
      kind: 'ready';
      moves: BulkAssetMovePlanItem[];
      skippedCount: number;
    }
  | {
      kind: 'duplicate-destination';
    };

export interface QueuedAssetDeleteSelectionPlan {
  nextSelectedKey: string;
  selectedKeys: string[];
}

export interface BulkAssetMoveResultSummary {
  inlineFeedback?: string;
  statusLine: string;
  statusTone: AssetMutationStatusTone;
}

export const planAssetActionDialog = (
  kind: AssetActionDialogKind,
  targetKey: string,
): AssetActionDialogPlan => {
  if (kind === 'rename') {
    return {
      kind,
      key: targetKey,
      inputValue: basenameFromKey(targetKey),
    };
  }
  if (kind === 'move') {
    return {
      kind,
      key: targetKey,
      inputValue: targetKey,
    };
  }
  return {
    kind,
    key: targetKey,
    inputValue: '',
  };
};

export const planBulkAssetMoveDialog = ({
  assetsPrefix,
  normalizePrefix,
  selectedAssetKeys,
}: {
  assetsPrefix: string;
  normalizePrefix: (prefix: string) => string;
  selectedAssetKeys: string[];
}): BulkAssetMoveDialogPlan => ({
  keys: [...selectedAssetKeys],
  destinationPrefix:
    commonParentPrefixFromKeys(selectedAssetKeys) ||
    normalizePrefix(assetsPrefix),
});

export const planAssetRename = (
  targetKey: string,
  inputValue: string,
): AssetRenamePlan => {
  const nextName = inputValue.trim();
  if (!nextName) {
    throw new Error('File name is required.');
  }
  if (/[/\\]/.test(nextName)) {
    throw new Error('File name cannot include "/" or "\\".');
  }

  const destinationKey = `${parentPrefixFromKey(targetKey)}${nextName}`;
  if (destinationKey === targetKey) {
    return { kind: 'no-change' };
  }
  return {
    kind: 'rename',
    destinationKey,
  };
};

export const planAssetMove = (
  targetKey: string,
  inputValue: string,
): AssetMovePlan => {
  const destinationKey = inputValue.trim().replace(/^\/+/, '');
  if (!destinationKey) {
    throw new Error('Destination key is required.');
  }
  if (destinationKey === targetKey) {
    return { kind: 'no-change' };
  }
  return {
    kind: 'move',
    destinationKey,
  };
};

export const planBulkAssetMove = (
  sourceKeys: string[],
  destinationPrefix: string,
): BulkAssetMovePlan => {
  const destinationKeySet = new Set<string>();
  const moves: BulkAssetMovePlanItem[] = [];
  let skippedCount = 0;

  for (const sourceKey of sourceKeys) {
    const destinationKey = `${destinationPrefix}${basenameFromKey(sourceKey)}`;
    if (destinationKeySet.has(destinationKey)) {
      return { kind: 'duplicate-destination' };
    }
    destinationKeySet.add(destinationKey);

    if (destinationKey === sourceKey) {
      skippedCount += 1;
      continue;
    }
    moves.push({
      sourceKey,
      destinationKey,
    });
  }

  return {
    kind: 'ready',
    moves,
    skippedCount,
  };
};

export const planQueuedAssetDeleteSelection = (
  targetKey: string,
  visibleKeys: string[],
  selectedKeys: string[],
): QueuedAssetDeleteSelectionPlan => {
  const selectedIndex = visibleKeys.findIndex((key) => key === targetKey);
  const nextVisibleKey =
    visibleKeys[selectedIndex + 1] ?? visibleKeys[selectedIndex - 1] ?? '';

  return {
    nextSelectedKey: nextVisibleKey === targetKey ? '' : nextVisibleKey,
    selectedKeys: selectedKeys.filter((key) => key !== targetKey),
  };
};

export const summarizeBulkAssetMoveResult = ({
  failedCount,
  movedCount,
  skippedCount,
}: {
  failedCount: number;
  movedCount: number;
  skippedCount: number;
}): BulkAssetMoveResultSummary => {
  const movedMessage = `Moved ${formatCount(movedCount, 'asset')}.`;
  const skippedMessage =
    skippedCount > 0 ? ` Skipped ${formatCount(skippedCount, 'asset')}.` : '';
  const failedMessage =
    failedCount > 0 ? ` Failed ${formatCount(failedCount, 'asset')}.` : '';

  return {
    inlineFeedback: movedCount > 0 ? `Moved ${formatCount(movedCount, 'asset')}` : undefined,
    statusLine: `${movedMessage}${skippedMessage}${failedMessage}`,
    statusTone: failedCount > 0 ? 'error' : 'success',
  };
};
