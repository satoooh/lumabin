# LumaBin Requirements

- 最終更新日: 2026-05-05
- ステータス: Public preview
- 参照: [PRD.md](PRD.md), [ARCHITECTURE.md](ARCHITECTURE.md)

## 1. 目的

Cloudflare R2 を第一対象としつつ、generic S3 互換 bucket 上の画像・動画・PDF・CSV を macOS デスクトップで高速かつ直感的に管理する。

## 2. スコープ

### 2.1 v1 で提供する

- プロファイル管理（R2 / generic S3）
- 一覧表示（Gallery/List）
- 検索・ソート・kind filter・Smart Collections
- drag & drop / file picker upload
- preview（image/video/pdf/csv）
- Saved Views
- 基本操作（rename/move/delete/download）
- presigned URL / public URL copy

### 2.2 v1 で提供しない

- マルチユーザー機能
- Web ポータル
- AI 自動タグ付け
- Finder 拡張 / ドライブマウント
- ACL/Policy 編集 UI
- タグ運用（local tags）は将来対応

## 3. 固定前提

- macOS first
- TypeScript 統一
- 初期ビュー: Gallery
- 競合時既定: `Rename`
- 競合ポリシー: `Overwrite / Rename / Skip`
- R2 first, S3 ready

## 4. 機能要件

### 4.1 接続

- `FR-CONN-001`: profile 作成/編集/削除ができる
- `FR-CONN-002`: R2 では `region=auto` を既定値にする
- `FR-CONN-003`: 接続テストを実行できる
- `FR-CONN-004`: secret は安全に保存される（平文保存しない）

### 4.2 ブラウズ

- `FR-BROWSE-001`: Gallery/List を切り替えられる
- `FR-BROWSE-002`: prefix を指定して一覧を絞り込める
- `FR-BROWSE-003`: continuation token でページ継続できる
- `FR-BROWSE-004`: 1,000件超でも仮想化でスクロールが破綻しない

### 4.3 検索・フィルタ

- `FR-QUERY-001`: key 部分一致で検索できる
- `FR-QUERY-002`: sort（name/modified/size/type）を切り替えられる
- `FR-QUERY-003`: kind filter（all/image/video/pdf/csv/other）を適用できる
- `FR-QUERY-004`: Smart Collections を適用できる
  - `all`
  - `recent-uploads`（直近14日）
  - `recent-views`（直近30日）
  - `large-files`（10MB以上）
  - `no-preview`（image/video/pdf/csv 以外）
- `FR-QUERY-005`: Saved Views を保存・再適用・削除できる

### 4.4 アップロード

- `FR-UPLOAD-001`: DnD と file picker の両方に対応する
- `FR-UPLOAD-002`: フォルダ投入時に再帰展開し相対パスを保持する
- `FR-UPLOAD-003`: queue / progress / cancel / retry failed を提供する
- `FR-UPLOAD-004`: 競合時にポリシー選択を適用できる
- `FR-UPLOAD-005`: 閾値超えは multipart upload を利用する

### 4.5 プレビュー

- `FR-PREVIEW-001`: image/video/pdf/csv を詳細表示できる
- `FR-PREVIEW-002`: PDF はページ移動できる
- `FR-PREVIEW-003`: 対応外形式は metadata ベースの表示にフォールバック
- `FR-PREVIEW-004`: preview 取得の競合応答は破棄される（race guard）

### 4.6 基本操作

- `FR-ACTION-001`: rename/move/delete/download を提供する
- `FR-ACTION-002`: 単体・複数選択の操作を提供する
- `FR-ACTION-003`: delete は Undo 窓（5秒）を提供する
- `FR-ACTION-004`: key/public URL/presigned URL をコピーできる

### 4.7 Provider サポートマトリクス（Beta）

| 機能 | Cloudflare R2 | generic S3 |
| --- | --- | --- |
| 接続テスト / 一覧 / metadata / preview | 対応 | 対応 |
| upload（single / multipart） | 対応 | 対応 |
| rename / move（copy + delete） | 対応 | 対応 |
| delete（single / bulk） | 対応 | 対応 |
| presigned GET / PUT | 対応 | 対応 |
| `Public URL base` コピー | 対応（設定依存） | 対応（設定依存） |
| object tagging 連携 | 非対応（R2 API制約） | Beta対象外 |
| ACL / policy / bucket管理UI | Beta対象外 | Beta対象外 |

補足:
- generic S3 は「S3互換 API の core operation」を対象とし、path-style access を既定とする。
- R2 は `region=auto` と account endpoint を前提にし、Generic S3 は provider が要求する実 region と HTTPS endpoint をユーザーが指定する。
- provider固有機能（tagging、ACL、policy、bucket管理、accelerate/dualstack、object lock、versioning 操作）は Beta の保証範囲外とし、互換差分は RUNBOOK のトラブルシュートで吸収する。

## 5. 非機能要件

### 5.1 性能

- `NFR-PERF-001`: 初回一覧表示 3 秒以内を目標
- `NFR-PERF-002`: warm cache 検索 150ms 以内を目標
- `NFR-PERF-003`: queue 更新反映 200ms 以内を目標
- `NFR-PERF-004`: preview cache を以下上限で自動evictする
  - 1 entry: 24MB
  - total: 256MB
  - files: 1,200（trim target 900）
  - TTL: 7日
- `NFR-PERF-005`: search index は profile単位で自動pruneする
  - TTL: 30日
  - hard limit: 75,000 rows / profile（trim target 60,000）

### 5.2 セキュリティ

- `NFR-SEC-001`: secret を Renderer へ渡さない
- `NFR-SEC-002`: secret は safeStorage で保護する
- `NFR-SEC-003`: signed URL/secret をログ出力しない

### 5.3 UX

- `NFR-UX-001`: 初見で主要導線（接続/一覧/upload/preview）に到達できる
- `NFR-UX-002`: 冗長な導線を避け、同一目的の操作を集約する
- `NFR-UX-003`: 既定値のままで主要シナリオを完走できる
- `NFR-UX-004`: 一覧⇄詳細の遷移はモードレス体験を優先し、開閉アニメーションは文脈を保持する

### 5.4 品質運用

- `NFR-OPS-001`: CI で `lint/typecheck/audit/package` を継続実行
- `NFR-OPS-001a`: CI 向け integration smoke（storage critical flow）を継続実行
- `NFR-OPS-001b`: CI 向け UI smoke（renderer critical flow）を継続実行
- `NFR-OPS-002`: `main` 反映前に `desktop-ci` 成功を運用上必須とする

## 6. 受け入れ基準（Beta）

### A. 接続と一覧

- 新規 profile 作成→接続テスト→一覧取得が成功する

### B. アップロード

- 複数ファイル・フォルダ投入が成功する
- cancel 後に failed-only retry が可能

### C. 検索と再利用

- 検索と Smart Collections が動作する
- Saved Views の再適用が可能

### D. プレビューと共有

- image/video/pdf/csv preview が成立する
- public URL / presigned URL のコピーが成功する

### E. 安全操作

- delete 操作で Undo が機能する

### F. 品質ゲート

- `npm run smoke:ci` が成功
- `npm run smoke:integration` が成功
- `npm run smoke:ui` が成功
- `npm run package` が成功

### G. パフォーマンススポットチェック

- dense state（1,000+ objects）でスクロール破綻がない
- 連続検索で `search cache hit` が上昇する
- preview の再表示で `preview cache hit` が上昇する
- 手動チェック中に `Failures` が増加しない

## 7. 変更要求と未決事項

実装タスク、未決事項、改善要求は GitHub Issues で管理します。この文書には合意済みの要件と受け入れ基準だけを残します。
