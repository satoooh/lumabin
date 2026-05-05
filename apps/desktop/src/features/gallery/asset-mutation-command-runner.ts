import type { AssetMutationApi } from '../shared/desktop-api-gateway';
import type {
  AssetMovePlan,
  AssetRenamePlan,
  BulkAssetMovePlanItem,
} from './asset-mutation-command-policy';

interface ExecuteAssetRenamePlanOptions {
  fromKey: string;
  plan: Extract<AssetRenamePlan, { kind: 'rename' }>;
  profileId: string;
  renameAsset: AssetMutationApi['renameAsset'];
}

interface ExecuteAssetMovePlanOptions {
  fromKey: string;
  moveAsset: AssetMutationApi['moveAsset'];
  plan: Extract<AssetMovePlan, { kind: 'move' }>;
  profileId: string;
}

interface ExecuteBulkAssetMovePlanOptions {
  moveAsset: AssetMutationApi['moveAsset'];
  moves: BulkAssetMovePlanItem[];
  profileId: string;
}

export interface BulkAssetMoveExecutionResult {
  failedKeys: string[];
  movedCount: number;
}

export const executeAssetRenamePlan = ({
  fromKey,
  plan,
  profileId,
  renameAsset,
}: ExecuteAssetRenamePlanOptions): ReturnType<AssetMutationApi['renameAsset']> =>
  renameAsset({
    profileId,
    fromKey,
    toKey: plan.destinationKey,
  });

export const executeAssetMovePlan = ({
  fromKey,
  moveAsset,
  plan,
  profileId,
}: ExecuteAssetMovePlanOptions): ReturnType<AssetMutationApi['moveAsset']> =>
  moveAsset({
    profileId,
    fromKey,
    toKey: plan.destinationKey,
  });

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
