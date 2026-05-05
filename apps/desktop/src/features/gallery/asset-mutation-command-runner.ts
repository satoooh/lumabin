import type { AssetMutationApi } from '../shared/desktop-api-gateway';
import type { BulkAssetMovePlanItem } from './asset-mutation-command-policy';

interface ExecuteBulkAssetMovePlanOptions {
  moveAsset: AssetMutationApi['moveAsset'];
  moves: BulkAssetMovePlanItem[];
  profileId: string;
}

export interface BulkAssetMoveExecutionResult {
  failedKeys: string[];
  movedCount: number;
}

export const executeBulkAssetMovePlan = async ({
  moveAsset,
  moves,
  profileId,
}: ExecuteBulkAssetMovePlanOptions): Promise<BulkAssetMoveExecutionResult> => {
  let movedCount = 0;
  const failedKeys: string[] = [];

  for (const item of moves) {
    try {
      await moveAsset({
        profileId,
        fromKey: item.sourceKey,
        toKey: item.destinationKey,
      });
      movedCount += 1;
    } catch {
      failedKeys.push(item.sourceKey);
    }
  }

  return {
    failedKeys,
    movedCount,
  };
};
