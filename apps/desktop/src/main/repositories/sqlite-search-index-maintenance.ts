import { toSqliteChangesCount } from '../application/contexts/asset-discovery/search-read-model-policy';
import type { SearchReadModelScope } from '../application/read-models/asset-search-read-model';
import { getSearchIndexDb } from './sqlite-search-index-database';
import { ignoreSearchIndexRepositoryError } from './sqlite-search-index-error';

const SEARCH_INDEX_MAX_ENTRY_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SEARCH_INDEX_MAX_ROWS_PER_PROFILE = 75_000;
const SEARCH_INDEX_TRIM_TARGET_ROWS_PER_PROFILE = 60_000;
const SEARCH_INDEX_PRUNE_INTERVAL_MS = 10 * 60 * 1000;
const SEARCH_INDEX_CHECKPOINT_DELETE_THRESHOLD = 5_000;

const profilePruneTimestamps = new Map<string, number>();

export const getSearchIndexedCount = (profileId: string): number => {
  const db = getSearchIndexDb();
  if (!db) {
    return 0;
  }

  try {
    const row = db
      .prepare(
        `
          SELECT indexed_count
          FROM profile_state
          WHERE profile_id = ?
        `,
      )
      .get(profileId) as { indexed_count?: number } | undefined;
    return Number(row?.indexed_count ?? 0);
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
    return 0;
  }
};

export const refreshSearchIndexedCount = (
  input: SearchReadModelScope,
): void => {
  const db = getSearchIndexDb();
  if (!db) {
    return;
  }

  try {
    const row = db
      .prepare(
        `
          SELECT COUNT(1) as count
          FROM assets
          WHERE profile_id = ?
        `,
      )
      .get(input.profileId) as { count?: number } | undefined;
    const count = Number(row?.count ?? 0);

    db.prepare(
      `
        INSERT INTO profile_state (profile_id, bucket, indexed_count, last_indexed_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(profile_id) DO UPDATE SET
          bucket = excluded.bucket,
          indexed_count = excluded.indexed_count,
          last_indexed_at = excluded.last_indexed_at
      `,
    ).run(input.profileId, input.bucket, count, Date.now());
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
  }
};

export const pruneSearchIndexForProfile = (
  input: SearchReadModelScope,
): void => {
  const db = getSearchIndexDb();
  if (!db) {
    return;
  }

  const now = Date.now();
  const lastPrunedAt = profilePruneTimestamps.get(input.profileId) ?? 0;
  if (now - lastPrunedAt < SEARCH_INDEX_PRUNE_INTERVAL_MS) {
    return;
  }
  profilePruneTimestamps.set(input.profileId, now);

  let deletedCount = 0;

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');

    const expiredDeleteResult = db
      .prepare(
        `
          DELETE FROM assets
          WHERE profile_id = ?
            AND updated_at < ?
        `,
      )
      .run(input.profileId, now - SEARCH_INDEX_MAX_ENTRY_AGE_MS);
    deletedCount += toSqliteChangesCount(expiredDeleteResult);

    const countRow = db
      .prepare(
        `
          SELECT COUNT(1) as count
          FROM assets
          WHERE profile_id = ?
        `,
      )
      .get(input.profileId) as { count?: number } | undefined;
    const profileRowCount = Number(countRow?.count ?? 0);
    if (profileRowCount > SEARCH_INDEX_MAX_ROWS_PER_PROFILE) {
      const rowsToDelete = Math.max(
        0,
        profileRowCount - SEARCH_INDEX_TRIM_TARGET_ROWS_PER_PROFILE,
      );
      if (rowsToDelete > 0) {
        const trimResult = db
          .prepare(
            `
              DELETE FROM assets
              WHERE profile_id = ?
                AND key IN (
                  SELECT key
                  FROM assets
                  WHERE profile_id = ?
                  ORDER BY updated_at ASC
                  LIMIT ?
                )
            `,
          )
          .run(input.profileId, input.profileId, rowsToDelete);
        deletedCount += toSqliteChangesCount(trimResult);
      }
    }

    db.exec('COMMIT;');
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreSearchIndexRepositoryError(rollbackError);
    }
    return;
  }

  if (deletedCount > 0) {
    refreshSearchIndexedCount(input);
  }
  if (deletedCount >= SEARCH_INDEX_CHECKPOINT_DELETE_THRESHOLD) {
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch (error) {
      ignoreSearchIndexRepositoryError(error);
    }
  }
};

export const forgetSearchIndexPruneState = (profileId: string): void => {
  profilePruneTimestamps.delete(profileId);
};
