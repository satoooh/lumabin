# LumaBin Performance Log

- 最終更新日: 2026-05-04
- 目的: long session / dense bucket の体感品質を定点観測し、劣化の早期検知を行う
- 手順参照: [RUNBOOK.md](RUNBOOK.md) 「6. パフォーマンス確認手順（定期）」

## 1. 記録ルール

- 記録タイミング:
  - 月次 1 回
  - ギャラリー・スクロール・プレビュー周辺に影響する変更後
- 記録単位:
  - 1 セッション = 1 レコード
- 記録方法:
  - Workspace Settings > Dev metrics (R2) で `Copy snapshot` を実行し、本文へ貼り付ける
  - ローカル dense fixture で予備計測する場合は `LUMABIN_E2E_FIXTURE_ASSET_COUNT=1000 npm run dev:e2e` で起動し、対象 profile に `E2E fixture / 1000 assets` のように明記する
  - packaged app の dense 自動確認は `npm run e2e:dense` を実行し、検索・仮想スクロール・preview・Dev metrics 表示が通ることを記録する。実行後は `apps/desktop/test-results/**/dev-metrics-snapshot.txt` の snapshot を確認する
  - 実 profile の読み取り専用自動計測は、通常開発アプリを CDP 付きで起動してから `npm run perf:real-profile:attach` を実行し、`apps/desktop/test-results/real-profile-dev-metrics-snapshot.txt` の snapshot を転記する。公開リポジトリ向けの記録では、profile 名・bucket 名・object key に由来する検索語は匿名化する
- 判定基準:
  - `Failures` が増加していない
  - `Preview cache hit` / `Search cache hit` が反復操作で上昇する
  - スクロール中の体感劣化（ガタつき・固まり）がない

## 2. 計測レコード

### 2026-05-03 / Record 001 (local dense fixture E2E)

- 実施者: Codex
- 対象 profile: E2E fixture / packaged app
- 対象 bucket 規模: 1,000 assets
- シナリオ:
  - `npm run e2e:dense`
  - dense fixture の検索
  - gallery 仮想スクロール
  - quick preview open / close walkthrough
- 体感結果: 自動E2E上は待機timeoutや表示崩れなし
- 判定: pass
- 実行結果: `1 passed (2.3s)`、dense walkthrough test body `1.5s`
- 補足: packaged dense E2E で Dev metrics 表示、`List calls > 0`、`Failures = 0`、`Copy snapshot` 有効化まで自動確認済み。実行時 snapshot は `apps/desktop/test-results/**/dev-metrics-snapshot.txt` に添付される。private profile の long session 計測で別レコードを追加する

```text
# LumaBin Dev Metrics Snapshot
Generated at: 2026-05-03T13:04:57.173Z
Profile: E2E fixture / 1000 assets
Collected at: 2026-05-03T13:04:57.169Z
Preview cache hit rate: 0%
HEAD cache hit rate: 0%
Search cache hit rate: 0%
List calls: 1
HEAD calls: 0
GET calls: 184
PUT calls: 0
Exists checks: 0
Downloaded bytes: 12328
Uploaded bytes: 0
Failures: 0
```

### 2026-05-03 / Record 002 (private profile read-only walkthrough)

- 実施者: Codex
- 対象 profile: private R2 profile
- 対象 bucket 規模: 80 keys sampled
- シナリオ:
  - `npx electron-forge start -- --remote-debugging-port=9334`
  - `npm run perf:real-profile:attach`
  - 検索 3 回（sampled keys から生成）
  - gallery scroll bottom / top walkthrough
  - quick preview open / close walkthrough
  - preview API read probes 3 回（cache miss 確認のため実行ごとに `maxBytes` を調整）
- 体感結果: 自動ウォークスルー上は待機timeoutや表示崩れなし。読み取り専用 guard により upload 活動がないことを確認。
- 判定: pass

```text
# LumaBin Dev Metrics Snapshot
Generated at: 2026-05-03T14:25:07.285Z
Profile: private R2 profile
Scenario: private profile read-only walkthrough via development app CDP
Candidate keys sampled: 80
Search queries: anonymized sample queries
Preview API probes: 3
Preview probe max bytes: 288405
Collected at: 2026-05-03T14:25:07.284Z
Preview cache hit rate: 57%
HEAD cache hit rate: 100%
Search cache hit rate: 0%
List calls: 1
HEAD calls: 0
GET calls: 3
PUT calls: 0
Exists checks: 0
Test connection calls: 0
Downloaded bytes: 374615
Uploaded bytes: 0
Failures: 0
```
