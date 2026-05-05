import {
  basenameFromKey,
  parentPrefixFromKey,
} from '../shared/asset-key';

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

export type BulkAssetMovePlan =
  | {
      kind: 'ready';
      moves: BulkAssetMovePlanItem[];
      skippedCount: number;
    }
  | {
      kind: 'duplicate-destination';
    };

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
