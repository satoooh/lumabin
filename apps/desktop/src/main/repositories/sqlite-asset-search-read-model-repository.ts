import { app } from 'electron';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { AssetItem } from '../../shared/ipc';
import {
  escapeSearchReadModelLike,
  mapSearchReadModelRow,
  normalizeSearchReadModelLimit,
  toSqliteChangesCount,
} from '../application/contexts/asset-discovery/search-read-model-policy';
import type {
  AssetSearchReadModelReader,
  AssetSearchReadModelWriter,
  SearchAssetsQuery,
  SearchAssetsResult,
  SearchReadModelScope,
} from '../application/read-models/asset-search-read-model';

const SEARCH_INDEX_DB_NAME = 'search-index.v1.sqlite';
const SEARCH_INDEX_SCHEMA_VERSION = 1;
const SEARCH_INDEX_MAX_ENTRY_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SEARCH_INDEX_MAX_ROWS_PER_PROFILE = 75_000;
const SEARCH_INDEX_TRIM_TARGET_ROWS_PER_PROFILE = 60_000;
const SEARCH_INDEX_PRUNE_INTERVAL_MS = 10 * 60 * 1000;
const SEARCH_INDEX_CHECKPOINT_DELETE_THRESHOLD = 5_000;

let searchIndexDb: DatabaseSync | null = null;
let isSearchIndexInitialized = false;
const profilePruneTimestamps = new Map<string, number>();

const ignoreError = (error: unknown): void => {
  void error;
};

const getSearchIndexDbPath = (): string =>
  join(app.getPath('userData'), SEARCH_INDEX_DB_NAME);

const ensureSearchIndexSchema = (db: DatabaseSync): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      profile_id TEXT NOT NULL,
      bucket TEXT NOT NULL,
      key TEXT NOT NULL,
      size INTEGER NOT NULL,
      content_type TEXT NOT NULL,
      last_modified TEXT NOT NULL,
      etag TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (profile_id, key)
    );
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_assets_profile_key
    ON assets (profile_id, key);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_assets_profile_modified
    ON assets (profile_id, last_modified DESC);
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_assets_profile_updated
    ON assets (profile_id, updated_at ASC);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_state (
      profile_id TEXT PRIMARY KEY,
      bucket TEXT NOT NULL,
      indexed_count INTEGER NOT NULL DEFAULT 0,
      last_indexed_at INTEGER NOT NULL
    );
  `);
};

const migrateSearchIndexSchema = (db: DatabaseSync): void => {
  const userVersionRow = db.prepare('PRAGMA user_version').get() as
    | { user_version?: number }
    | undefined;
  const currentVersion = Number(userVersionRow?.user_version ?? 0);

  if (currentVersion <= 0) {
    ensureSearchIndexSchema(db);
    db.exec(`PRAGMA user_version = ${SEARCH_INDEX_SCHEMA_VERSION};`);
    return;
  }

  // Current schema and future compatible guard.
  ensureSearchIndexSchema(db);
  if (currentVersion < SEARCH_INDEX_SCHEMA_VERSION) {
    db.exec(`PRAGMA user_version = ${SEARCH_INDEX_SCHEMA_VERSION};`);
  }
};

const getSearchIndexDb = (): DatabaseSync | null => {
  if (isSearchIndexInitialized) {
    return searchIndexDb;
  }

  isSearchIndexInitialized = true;
  try {
    const dbPath = getSearchIndexDbPath();
    mkdirSync(dirname(dbPath), { recursive: true });

    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
    db.exec('PRAGMA wal_autocheckpoint = 1000;');
    db.exec('PRAGMA journal_size_limit = 33554432;');
    migrateSearchIndexSchema(db);
    searchIndexDb = db;
  } catch (error) {
    ignoreError(error);
    searchIndexDb = null;
  }

  return searchIndexDb;
};

const getIndexedCount = (profileId: string): number => {
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
    ignoreError(error);
    return 0;
  }
};

const refreshProfileIndexedCount = (input: SearchReadModelScope): void => {
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
    ignoreError(error);
  }
};

const pruneSearchIndexForProfile = (input: SearchReadModelScope): void => {
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
    ignoreError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreError(rollbackError);
    }
    return;
  }

  if (deletedCount > 0) {
    refreshProfileIndexedCount(input);
  }
  if (deletedCount >= SEARCH_INDEX_CHECKPOINT_DELETE_THRESHOLD) {
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch (error) {
      ignoreError(error);
    }
  }
};

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
    refreshProfileIndexedCount(input);
    pruneSearchIndexForProfile(input);
  } catch (error) {
    ignoreError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreError(rollbackError);
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
  const indexedCount = getIndexedCount(input.profileId);
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
    ignoreError(error);
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
    ignoreError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreError(rollbackError);
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
    refreshProfileIndexedCount(input);
    pruneSearchIndexForProfile(input);
  } catch (error) {
    ignoreError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreError(rollbackError);
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
    profilePruneTimestamps.delete(profileId);
  } catch (error) {
    ignoreError(error);
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackError) {
      ignoreError(rollbackError);
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
