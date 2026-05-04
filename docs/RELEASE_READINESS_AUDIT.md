# LumaBin macOS Release Readiness Audit

- 最終更新日: 2026-05-04
- 対象: `apps/desktop`
- ブランチ: `feature-desktop-ddd-refactor`
- PR: #2 `[refactor] macOS desktop release hardening and DDD cleanup`

## 1. 目的

macOS版 LumaBin をリリース可能な完成度へ近づけるため、次の要求を実コード・実行結果・CI状態に対応付けて監査する。

1. DDD ベストプラクティスに基づくリファクタリング
2. 十分で実用的なテストケースの網羅
3. UI/UX 改善
4. CI/CD 通過確認
5. macOS 配布物としての release readiness

本ドキュメントは完了宣言ではなく、現時点の証跡と残タスクを固定するための監査ログとする。

## 2. Prompt-to-Artifact Checklist

| 要求 | 現在の artifact / evidence | 判定 | 残り |
| --- | --- | --- | --- |
| DDD / Bounded Context | Main Process は `application/contexts/<context>` 配下で `workspace` / `asset-library` / `asset-ingestion` / `asset-discovery` / `asset-sharing` / `diagnostics` に分割済み。IPC contract / application events / repositories / projection subscriber も分離済み | 概ね達成 | Utility Process 分離は要件次第で再検討 |
| CQRS | `asset-library` は Command Service / Query Service を分離し、`asset-sharing` は Query Service、各 context は IPC handler を transport 境界へ寄せている | 概ね達成 | Renderer 側 read model / command handoff の追加整理余地あり |
| Event-Driven Architecture | Application Event Bus と context events を導入し、asset mutation 後の projection invalidation / subscriber wiring を分離済み | 概ね達成 | event coverage は主要 mutation 中心。全操作 event 化は目的外 |
| Renderer workbench 分割 | `App.tsx` は 43 LOC の render shell。`use-desktop-workbench.ts` は 884 LOC で、preview / upload / asset action / diagnostics / workspace / gallery / shell / overlay / topbar / center pane の workbench / coordination へ分割済み。dialog close policy は各 feature workbench の command へ寄せ、root の setter 直書きを削減済み | 進行中 | root composition の残る destructuring / cross-context handoff はまだ監査対象 |
| feature 単位テスト | UI smoke は 120 files / 287 tests。shell resource boundary smoke と public readiness audit smoke を追加し、DOM refs / feedback timer / tooltip warm-up / 公開前監査ルールを局所検証 | 進行中 | `ARCHITECTURE.md` の既知負債どおり、feature 単位テストはまだ増やせる |
| 横断 UI smoke | `app.smoke.test.tsx` が gallery preview / upload / recovery / settings / selection / keyboard / delete undo を検証 | 達成 | 実機ウォークスルーは release 前に再実施 |
| E2E | head `71f2ed2` で `npm run e2e` と `npm run e2e:dense` を再実行済み。どちらも `package:darwin` 後の ad-hoc 再署名済み packaged app を LaunchServices 経由で起動し、通常E2E 7 passed / dense E2E 1 passed を確認 | 達成 | release candidate 直前に必要なら再実行 |
| Performance / long session | real profile read-only Dev Metrics snapshot と dense fixture snapshot を `STATUS.md` / `PERF_LOG.md` に記録済み | 概ね達成 | release candidate 直前の再計測は任意 |
| macOS packaging | head `71f2ed2` で `npm run release:preflight` を再実行済み。`verify:mac-signing-readiness` / `package:darwin` / `verify:darwin-artifact` / `release:launch-smoke` を通過し、artifact SHA256 `26c5552cd1d08feea58d55d664285e63e26422b09eb060e0992962b2226e5d37` を確認 | 達成 | release candidate tag 作成時に再確認 |
| CI/CD | PR #2 の `Desktop CI` は必須ゲートとして稼働中。PR checks を最新状態の一次情報とし、確認済み成功例では `Lint / Typecheck / Audit` と `Packaging smoke (macOS)` がどちらも通過済み | 達成 | ready 化前に PR checks の最新 head 成功を再確認 |
| Release workflow | `desktop-release` は tag / manual 起動で zip / checksum / release evidence を公開する導線がある。`v0.1.0-rc.4` の公開 zip 検証済み | 概ね達成 | 最新 HEAD からの release candidate tag は未作成 |
| Signing / notarization | RUNBOOK で unsigned ZIP を正式運用、`LUMABIN_ENABLE_MAC_SIGN=1` の任意署名モードと readiness gate を明文化済み | 達成 | 一般配布で Developer ID notarization を必須にするなら追加 secret / workflow 実行が必要 |
| Branch protection | RUNBOOK で現時点は未適用、`desktop-ci` 成功確認を代替ゲートにする運用を明文化済み | 運用判断済み | GitHub 側 ruleset 適用は未実施 |
| Public repository readiness | README の外部個人ドメイン画像、package author email、実 profile の bucket / object key hint を公開向けに匿名化済み。root `.gitignore` / `LICENSE` / `SECURITY.md` を追加し、`npm run smoke:ci` 内の `audit:public-readiness` でtracked fileの露出回帰を検出できる。`npm run audit:public-history` は既存履歴の露出を検出する。`npm run release:public-snapshot` で `.git` を含まない sanitized snapshot archive を生成できる。公開repo名が private codename と異なる場合は `npm run release:public-snapshot -- --slug <public-repo-slug>` で archive 名 / 展開root / manifest を公開名に寄せられる | 進行中 | full history を公開する場合は履歴 rewrite / squash が必要。既存 GitHub Actions artifacts と古い test / rc release の削除・整理も destructive 操作のため未実施 |

## 3. 最新確認済みコマンド

ローカル:

```bash
npm run smoke:ui -- desktop-workbench-shell-resources desktop-workbench-boundary
npm run smoke:ci
npm run e2e
npm run e2e:dense
npm run release:preflight
npm run audit:public-readiness
npm run audit:public-history
npm run audit:github-public-readiness
npm run release:public-snapshot
```

結果:

- `smoke:ui`: 120 files / 287 tests
- `smoke:ci`: lint / typecheck / integration smoke / UI smoke / runtime audit / public readiness audit 通過
- `npm audit --omit=dev --audit-level=high`: `found 0 vulnerabilities`
- `npm run e2e`: 7 passed / 1 skipped
- `npm run e2e:dense`: 1 passed
- `npm run release:preflight`: artifact SHA256 `26c5552cd1d08feea58d55d664285e63e26422b09eb060e0992962b2226e5d37`
- `npm run audit:public-readiness`: tracked files の公開前hygiene確認
- `npm run audit:public-history`: 既存履歴に公開前hygiene違反が残っているため fail（値は出さず file / rule / commit count / sample commit のみ報告）。現時点では `README.md` の private image host、`apps/desktop/package.json` の private email、`docs/PERF_LOG.md` / `docs/STATUS.md` の private profile / object key hint が履歴に残る
- `npm run audit:github-public-readiness`: GitHub 側に active Actions artifacts 8件と non-draft Releases 5件が残っているため blocked。repo secrets / variables は 0 件
- `npm run release:public-snapshot`: `.git` を含まない sanitized snapshot archive を生成し、manifest で `dirty: false` / `snapshot.slug: lumabin` / `publicReadiness: passed` / `archiveAudit: passed` / `includesGitHistory: false` / `includesGitDirectory: false` を確認できる。公開 import 直前は最終 commit 後に再実行し、`out/public-snapshot/lumabin-public-snapshot-<commit>.json` を正とする
- `npm run verify:public-snapshot-import`: 最新 manifest の snapshot を一時ディレクトリに展開し、`main` branch の初回 commit として import できることを確認する
- `npm run release:public-snapshot -- --slug <public-repo-slug>`: 公開repo名を決定した後、archive 名 / 展開root / manifest の `snapshot.slug` を公開名に合わせた sanitized snapshot を生成できる

GitHub Actions:

- Workflow: `Desktop CI`
- 最新状態の一次情報: PR #2 の checks
- 確認済み成功例: run `25309015360`
- Head: `6fc0778789ecc122c597686aeda8ec3e3624b070`
- `Lint / Typecheck / Audit`: success
- `Packaging smoke (macOS)`: success

## 4. 現時点の未完了事項

1. PR #2 は draft のまま
2. `use-desktop-workbench.ts` は root composition としてまだ大きく、dialog close command 以外の残る destructuring / cross-context handoff の分類が必要
3. feature 単位テストは増加中だが、upload / search / preview の追加局所テスト余地がある
4. branch protection は運用判断として未適用
5. full history を public 化する場合、既存履歴の公開前hygiene違反に対して履歴 rewrite / squash 方針の決定が必要
6. public 化する場合、GitHub 側に残る active Actions artifacts 8件と non-draft Releases 5件の削除・整理が必要

## 5. 次の推奨順序

1. public 化する場合は、full history 公開を避け、squash merge / snapshot import / 履歴 rewrite のどれで sanitized history を作るか決める
2. GitHub Actions artifacts と古い test / rc release の削除・整理方針を決める
3. Renderer root composition audit を実施し、残す配線と切る責務を分類する
4. 必要な追加 feature smoke を 1-2 件だけ増やす
5. PR #2 を ready 化するか、release candidate tag を切る前の最終差分を確定する
