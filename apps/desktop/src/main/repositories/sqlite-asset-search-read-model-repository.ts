import type { AssetItem } from '../../shared/ipc';
import {
  escapeSearchReadModelLike,
  mapSearchReadModelRow,
  normalizeSearchReadModelLimit,
} from '../application/contexts/asset-discovery/search-read-model-policy';
import type {
  AssetSearchReadModelReader,
  AssetSearchReadModelWriter,
  SearchAssetsQuery,
  SearchAssetsResult,
  SearchReadModelScope,
} from '../application/read-models/asset-search-read-model';
import { getSearchIndexDb } from './sqlite-search-index-database';
import { ignoreSearchIndexRepositoryError } from './sqlite-search-index-error';
import {
  forgetSearchIndexPruneState,
  getSearchIndexedCount,
  pruneSearchIndexForProfile,
  refreshSearchIndexedCount,
} from './sqlite-search-index-maintenance';

export const upsertSearchIndexedAssets = (
  input: SearchReadModelScope & { items: AssetItem[] },
): void => {
  if (input.items.length === 0) {
    return;
  }

  const db = getSearchIndexDb();
  if (!db) {
    return;
  }

  try {
    const now = Date.now();
    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    const upsertStatement = db.prepare(
      `
        INSERT INTO assets (
          profile_id,
          bucket,
          key,
          size,
          content_type,
          last_modified,
          etag,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(profile_id, key) DO UPDATE SET
          bucket = excluded.bucket,
          size = excluded.size,
          content_type = excluded.content_type,
          last_modified = excluded.last_modified,
          etag = excluded.etag,
          updated_at = excluded.updated_at
      `,
    );

    for (const item of input.items) {
      upsertStatement.run(
        input.profileId,
        input.bucket,
        item.key,
        item.size,
        item.contentType,
        item.lastModified,
        item.etag || '',
        now,
      );
    }

    db.exec('COMMIT;');
    refreshSearchIndexedCount(input);
    pruneSearchIndexForProfile(input);
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreSearchIndexRepositoryError(rollbackError);
    }
  }
};

export const searchIndexedAssets = (
  input: SearchAssetsQuery,
): SearchAssetsResult => {
  const db = getSearchIndexDb();
  if (!db) {
    return {
      items: [],
      total: 0,
      indexedCount: 0,
    };
  }

  const limit = normalizeSearchReadModelLimit(input.limit);
  const query = input.query.trim().toLowerCase();
  const indexedCount = getSearchIndexedCount(input.profileId);
  if (indexedCount === 0) {
    return {
      items: [],
      total: 0,
      indexedCount: 0,
    };
  }

  try {
    if (!query) {
      const rows = db
        .prepare(
          `
            SELECT key, size, content_type, last_modified, etag
            FROM assets
            WHERE profile_id = ?
            ORDER BY last_modified DESC
            LIMIT ?
          `,
        )
        .all(input.profileId, limit) as Record<string, unknown>[];

      return {
        items: rows.map(mapSearchReadModelRow),
        total: indexedCount,
        indexedCount,
      };
    }

    const escaped = `%${escapeSearchReadModelLike(query)}%`;
    const totalRow = db
      .prepare(
        `
          SELECT COUNT(1) as count
          FROM assets
          WHERE profile_id = ?
            AND lower(key) LIKE ? ESCAPE '\\'
        `,
      )
      .get(input.profileId, escaped) as { count?: number } | undefined;
    const total = Number(totalRow?.count ?? 0);

    const rows = db
      .prepare(
        `
          SELECT key, size, content_type, last_modified, etag
          FROM assets
          WHERE profile_id = ?
            AND lower(key) LIKE ? ESCAPE '\\'
          ORDER BY last_modified DESC
          LIMIT ?
        `,
      )
      .all(input.profileId, escaped, limit) as Record<string, unknown>[];

    return {
      items: rows.map(mapSearchReadModelRow),
      total,
      indexedCount,
    };
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
    return {
      items: [],
      total: 0,
      indexedCount,
    };
  }
};

export const renameSearchIndexedAsset = (
  input: SearchReadModelScope & { fromKey: string; toKey: string },
): void => {
  const db = getSearchIndexDb();
  if (!db) {
    return;
  }

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    db.prepare(
      `
        DELETE FROM assets
        WHERE profile_id = ?
          AND key = ?
      `,
    ).run(input.profileId, input.toKey);

    db.prepare(
      `
        UPDATE assets
        SET key = ?, updated_at = ?, bucket = ?
        WHERE profile_id = ?
          AND key = ?
      `,
    ).run(input.toKey, Date.now(), input.bucket, input.profileId, input.fromKey);
    db.exec('COMMIT;');
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreSearchIndexRepositoryError(rollbackError);
    }
  }
};

export const removeSearchIndexedAssets = (
  input: SearchReadModelScope & { keys: string[] },
): void => {
  if (input.keys.length === 0) {
    return;
  }

  const db = getSearchIndexDb();
  if (!db) {
    return;
  }

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    const deleteStatement = db.prepare(
      `
        DELETE FROM assets
        WHERE profile_id = ?
          AND key = ?
      `,
    );
    for (const key of input.keys) {
      deleteStatement.run(input.profileId, key);
    }
    db.exec('COMMIT;');
    refreshSearchIndexedCount(input);
    pruneSearchIndexForProfile(input);
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreSearchIndexRepositoryError(rollbackError);
    }
  }
};

export const clearSearchIndexedProfile = (profileId: string): void => {
  const db = getSearchIndexDb();
  if (!db) {
    return;
  }

  try {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    db.prepare('DELETE FROM assets WHERE profile_id = ?').run(profileId);
    db.prepare('DELETE FROM profile_state WHERE profile_id = ?').run(profileId);
    db.exec('COMMIT;');
    forgetSearchIndexPruneState(profileId);
  } catch (error) {
    ignoreSearchIndexRepositoryError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreSearchIndexRepositoryError(rollbackError);
    }
  }
};

export const sqliteAssetSearchReadModelRepository: AssetSearchReadModelReader &
  AssetSearchReadModelWriter = {
  clearProfile: clearSearchIndexedProfile,
  removeAssets: removeSearchIndexedAssets,
  renameAsset: renameSearchIndexedAsset,
  searchAssets: searchIndexedAssets,
  upsertAssets: upsertSearchIndexedAssets,
};
