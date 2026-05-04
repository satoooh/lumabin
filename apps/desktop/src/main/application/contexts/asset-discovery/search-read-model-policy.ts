import type { AssetItem } from '../../../../shared/ipc';

export const normalizeSearchReadModelLimit = (limit: number): number =>
  Math.max(1, Math.min(limit, 2_000));

export const escapeSearchReadModelLike = (input: string): string =>
  input.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

export const mapSearchReadModelRow = (row: Record<string, unknown>): AssetItem => ({
  key: String(row.key ?? ''),
  size: Number(row.size ?? 0),
  contentType: String(row.content_type ?? 'application/octet-stream'),
  lastModified: String(row.last_modified ?? new Date(0).toISOString()),
  etag: String(row.etag ?? ''),
});

export const toSqliteChangesCount = (result: unknown): number => {
  if (
    result &&
    typeof result === 'object' &&
    'changes' in result &&
    typeof (result as { changes?: unknown }).changes === 'number'
  ) {
    return (result as { changes: number }).changes;
  }
  return 0;
};
