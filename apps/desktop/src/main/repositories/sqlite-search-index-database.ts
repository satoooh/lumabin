import { app } from 'electron';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ignoreSearchIndexRepositoryError } from './sqlite-search-index-error';

const SEARCH_INDEX_DB_NAME = 'search-index.v1.sqlite';
const SEARCH_INDEX_SCHEMA_VERSION = 1;

let searchIndexDb: DatabaseSync | null = null;
let isSearchIndexInitialized = false;

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

  ensureSearchIndexSchema(db);
  if (currentVersion < SEARCH_INDEX_SCHEMA_VERSION) {
    db.exec(`PRAGMA user_version = ${SEARCH_INDEX_SCHEMA_VERSION};`);
  }
};

export const getSearchIndexDb = (): DatabaseSync | null => {
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
    ignoreSearchIndexRepositoryError(error);
    searchIndexDb = null;
  }

  return searchIndexDb;
};
