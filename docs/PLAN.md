# LumaBin 開発計画（PLAN）

- 最終更新日: 2026-05-03
- ステータス: In progress（MVP完了 / Beta hardening完了 / M3進行中）
- 参照: [SPEC.md](SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md), [STATUS.md](STATUS.md)

## 1. 計画方針

- 小さく可逆な差分で進める
- 仕様変更時は `PRD.md` → `SPEC.md` → 実装の順で更新する
- 体験品質（美しいこと / 最小限 / 最高のデフォルト）を優先する
- R2 first を維持しつつ、generic S3 は「対応範囲を明文化して運用」する

## 2. マイルストーン

### M1: MVP 完了（達成済み）

- browse / upload / preview / search / share が成立
- Saved Views / Smart Collections を実装
- 基本操作（rename/move/delete/bulk）が成立

### M2: Beta hardening（達成済み / repo scope）

- CI と packaging の安定化
- tag release（zip配布）自動化
- preview / upload の失敗率低減
- リリース運用（署名/notarize/rollback）の固定化
- integration smoke（storage critical flow）追加
- cache / index の上限と eviction を固定
- generic S3 対応範囲の仕様化

### M3: 継続改善（進行中）

- UX polish（modeless遷移/情報密度/不要導線の削減）
- reliability強化（preview/upload失敗系の回復導線）
- maintainability強化（`App.tsx` 分割とテスト追従）

## 3. 直近で完了した項目（2026-03-04）

- Smart Collections と recent views 永続化
- `desktop-ci` の整備（PR/main push/manual + concurrency + mac packaging smoke）
- `desktop-release` の整備（tag push/manual + GitHub Releases への zip/checksum 公開）
- package build 失敗（`node:sqlite` 解決）への対処
- preview / upload hardening（abort, fail-open, 416 fallback, source skip）
- preview/search cache hardening（max entry/files/TTL/row cap prune）
- `smoke:integration` 追加（接続/一覧/upload/preview/copy/delete/abort）
- `App.tsx` から upload/preview utility を feature module へ分離
- `App.tsx` から profile menu state を `features/settings/use-profile-menu-state.ts` へ分離
- `App.tsx` から workspace 派生値/state flag を layout hook 群へ分離
- `App.tsx` から workspace dialog actions を `features/settings/use-workspace-dialog-actions.ts` へ分離
- `App.tsx` から profile selection actions を `features/settings/use-profile-selection-actions.ts` へ分離
- Dev metrics に `Copy snapshot` を追加し、`docs/PERF_LOG.md` を計測記録先として導入
- 一覧⇄詳細の遷移アニメーションを追加し、モードレス体験を強化
- フィルタ導線を単一レール化し、重複表示を削減
- スクロール時の処理を軽量化し、引っ掛かりを低減
- gallery/list スクロール state 更新を rAF 制御に変更
- gallery スクロール中のサムネイル取得を抑制
- preview / metadata 失敗時の in-modal retry 導線を追加
- upload 失敗メッセージを回復手順付きに正規化
- 回復導線（retry preview / retry metadata / upload ENOENT feedback）の UI smoke を追加
- main process の未捕捉エラー監視（`unhandledRejection` / `uncaughtExceptionMonitor`）を追加
- gallery 描画を `features/gallery/gallery-pane.tsx` に分割
- モーダルフォーカストラップを `features/layout/use-modal-focus-trap.ts` へ分離
- ダイアログの `Esc` クローズ処理を `features/layout/use-dialog-escape.ts` へ分離
- Settings の `Public URL base` を advanced セクションへ移し初期表示を簡素化
- ロゴPNGの extraResource 同梱 + runtime icon 適用を追加
- macOS バンドルアイコンをロゴベース `icon.icns` に更新
- `package:darwin` 後に ad-hoc 再署名 + zip 再生成を自動化
- `verify:darwin-artifact` を追加し、release publish 前の検証を必須化
- Workspace Settings の初期情報量を削減（Saved Views 折りたたみ）
- Workspace Settings を目的別タブへ再構成し、Connection profile / Workspace defaults / Browser session / Saved views / Dev metrics のタスク単位で操作できるようにした
- `smoke:integration` / `smoke:ci` の直近ローカル実行を確認（全緑）
- `npm run package` / `npm run package:darwin` のローカル dry-run を確認
- `release:preflight` / `release:preflight:verify-only` 導線を追加
- `npm run release:preflight` のローカル実行を確認（artifact + SHA256 出力）
- tag `v0.1.0-rc.2` で `desktop-release` を実行し、zip + checksum の公開を確認
- tag `v0.1.0-rc.4` で `desktop-release` を実行し、Release workflow / 公開 zip の SHA256 照合 / 公開 zip の `release:launch-smoke` 通過を確認

## 4. 現在の作業項目（優先順）

1. long session / dense bucket 計測の初回ベースライン記録
2. Renderer application workbench を bounded context ごとに分割し、root orchestration の影響範囲をさらに狭める
3. settings の所有境界整理を継続し、Browser session / Saved Views を設定ではなく browsing context として扱える構造に寄せる
4. context ごとの application service 抽出と read model 更新の application event subscriber 化を進める（`asset-sharing` Query Service / `workspace`・`asset-ingestion`・`asset-discovery` Application Service / `asset-library` Command・Query Service + projection subscriber から着手済み）

## 5. 直近2サイクルの実行計画

### Cycle A（短期）

- 回復導線の UI smoke 拡張（完了）
- `App.tsx` 分割の継続（settings/profile action 周辺、完了）
- v1 Exit Criteria の未達項目を 1件以上クローズ

完了条件:
- `npm run lint`
- `npm run typecheck`
- `npm run smoke:ui`

### Cycle B（続き）

- `App.tsx` 分割継続（残存する state/callback の責務ごと移管）
- Main Process の application service 分割継続（workspace / asset-library / asset-ingestion / asset-discovery）
- long session 向け手動計測の記録を STATUS に反映
- v1 候補タグで release dry-run と配布物起動確認（完了）

完了条件:
- `npm run smoke:integration`
- `npm run smoke:ci`

## 6. 検証計画

### 6.1 自動

- `npm run lint`
- `npm run typecheck`
- `npm run smoke:integration`
- `npm run smoke:ci`
- `npm run package`（macOS）

### 6.2 手動スモーク

- 接続（新規/既存 profile）
- 一覧（prefix, filter, search, scroll）
- upload（単体/複数/フォルダ、競合、cancel/retry）
- preview（image/video/pdf/csv）
- delete（Undo 付き）

## 7. リスクと対策

| リスク | 影響 | 対策 |
| --- | --- | --- |
| R2/S3 互換差分 | 一部操作失敗 | providerごとの差分を仕様化し、非対象を明示 |
| preview の部分取得失敗 | UX低下 | 段階読み込み + retry + 明示的フィードバック |
| packaging の環境差異 | CI失敗/配布遅延 | package-smoke 継続 + external依存の明示 |
| branch protection 未適用 | main直push時の品質揺れ | PR運用を既定化し、merge前に `desktop-ci` 成功を確認 |
| 設定増加による複雑化 | 初見体験の悪化 | 設定を増やす前に既定値見直しを優先 |

## 8. ドキュメント運用

- 進捗・未決事項は `STATUS.md` を単一の真実源とする
- 実行手順や障害対応は `RUNBOOK.md` に集約する
- README は「導入と導線」に限定し、詳細は docs へ寄せる
