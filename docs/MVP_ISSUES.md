# LumaBin Issue 分解（M3 / v1候補）

- 最終更新日: 2026-05-03
- 参照: [PLAN.md](PLAN.md), [STATUS.md](STATUS.md), [SPEC.md](SPEC.md)
- 目的: v1候補リリースまでの実行単位を明確化する

## 1. 現在地

- MVP 実装は完了
- Beta hardening は repo scope で完了
- M3（UX polish / reliability / maintainability）を進行中

## 2. 優先度

- `P0`（v1前に完了したい）: #M3-1, #M3-2, #M3-3
- `P1`（v1候補で推奨）: #M3-4, #M3-5
- `P2`（v1後でも可）: #M3-6

## 3. 状態サマリ（2026-03-04）

- ✅ 完了: #M3-1, #M3-2, #M3-3, #M3-4, #M3-5
- ✅ 完了: #M3-6

## 4. M3 backlog

### #M3-1 `perf(desktop-ui): stabilize gallery scroll under dense state`

- 目的: dense bucket でもスクロール中の引っ掛かりを抑える
- 完了条件:
  - scroll state 更新をフレーム単位へ制御
  - スクロール中の重処理を抑制
  - `smoke:ui` 通過
- 状態: ✅ 完了

### #M3-2 `fix(desktop-reliability): add recovery paths for preview/upload failures`

- 目的: 失敗時に UI から復帰できる導線を保証する
- 完了条件:
  - preview / metadata retry を UI に提供
  - upload 失敗メッセージを回復手順付きに正規化
  - `smoke:ui` 通過
- 状態: ✅ 完了

### #M3-3 `test(desktop-ui): expand smoke coverage for recovery interactions`

- 目的: 新しい回復導線の回帰を防止する
- 完了条件:
  - `retry preview` の smoke 追加
  - `retry metadata` の smoke 追加
  - upload 失敗時フィードバックの smoke 追加
- 状態: ✅ 完了

### #M3-4 `refactor(renderer): continue splitting App.tsx by feature boundary`

- 目的: 変更時の影響範囲を縮小し保守性を上げる
- 完了条件:
  - gallery 主要描画塊の切り出し
  - 既存挙動の回帰なし
- 状態: ✅ 進行分完了（`gallery-pane` 分離）

### #M3-5 `refactor(desktop-settings): reduce initial settings density`

- 目的: 設定画面の初見負荷を減らす
- 完了条件:
  - 高頻度導線を優先表示
  - 低頻度導線を段階表示化
- 状態: ✅ 完了（Saved Views を折りたたみ統合）

### #M3-6 `ops(release): run v1 candidate dry-run and capture checklist`

- 目的: v1候補の配布導線を実地で検証する
- 完了条件:
  - v1候補タグで `desktop-release` 実行
  - 生成 zip の起動確認
  - チェック結果を `STATUS` に記録
- 状態: ✅ 完了（tag `v0.1.0-rc.4` の `desktop-release` が成功。公開済み GitHub Release の zip / checksum を取得・照合し、公開 zip に対する `release:launch-smoke` も packaged app E2E 7シナリオ通過まで確認済み）

## 5. 完了済み（MVP/Beta）

- 基盤構築（Electron + typed IPC + secret 保護）
- 一覧/検索/Saved Views/Smart Collections
- upload queue（競合解決・retry・multipart）
- preview（image/video/pdf/csv）
- rename/move/delete/bulk + Undo
- presigned/public URL 導線
- CI / release 初期導線（desktop-ci / desktop-release）
