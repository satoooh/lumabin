# LumaBin Runbook

- 最終更新日: 2026-05-03
- ステータス: M3（UX polish / reliability）
- 対象: `apps/desktop`

## 1. 目的

開発者が LumaBin を再現性高く起動・検証・リリースできる状態を保つ。

## 2. 開発コマンド

```bash
cd apps/desktop
npm install
npm run dev
npm run lint
npm run typecheck
npm run smoke:integration
npm run smoke:ui
npm run e2e:install
npm run e2e
npm run e2e:dense
npm run e2e:headed
npm run smoke:ci
npm run verify:darwin-artifact
npm run verify:mac-signing-readiness
npm run release:launch-smoke
npm run release:preflight
npm run release:preflight:verify-only
npm run package
npm run package:darwin
```

### 2.1 開発実行の安定運用（必須）

1. 開発起動前に残存 `agent-browser` daemon を停止する（FD枯渇回避）
2. `ulimit -n` が低い場合は引き上げる（目安: `4096` 以上）
3. `npm run dev` は one-shot ではなく常駐セッション（TTY）で維持する
4. UI変更時は `npm run smoke:ui` → `npm run e2e` → `npm run smoke:ci` の順で検証する
5. 検証後は不要な常駐プロセスを停止して次作業へ影響を残さない

## 3. 最小スモーク手順

### 3.1 接続

1. Profile から R2 接続情報を保存
2. Test connection 実行
3. Reload で一覧取得

期待結果:
- 接続成功
- 一覧表示可能

### 3.2 アップロード

1. 複数ファイルを DnD
2. フォルダを DnD（ネスト含む）
3. Cancel → Retry failed

期待結果:
- queue に進捗表示
- 未処理分のみ再開できる
- 完了後に一覧自動更新

### 3.3 プレビュー

1. image / video / pdf / csv を開く
2. PDF のページ移動確認
3. 詳細ビューで Copy key / Copy public URL を確認

期待結果:
- 対応形式が表示される
- エラー時に明示メッセージが出る

### 3.4 操作

1. Rename… / Move… / Delete…
2. Select mode で bulk move / bulk delete
3. Undo 窓で delete 取消

期待結果:
- 操作結果が一覧に反映される
- Undo が機能する

### 3.5 キーボード

1. `?` で Keyboard shortcuts を開く
2. `Esc` でモーダルを閉じる
3. `Cmd/Ctrl + K` で検索入力へフォーカス

期待結果:
- キーボード導線で同じ操作が完了できる
- モーダル開閉でフォーカスが破綻しない

### 3.6 E2E 自動検証（Playwright）

初回のみ:

```bash
cd apps/desktop
npm run e2e:install
```

実行:

```bash
npm run e2e
```

macOS 26 で `npm run e2e` が AppKit/HIServices 初期化で落ちる場合:

```bash
npm run e2e:prelaunch
npm run e2e:attach
```

補足:
- `npm run e2e` は `npm run package:darwin` 後、Electron 用 entitlement 付きで ad-hoc 再署名した packaged app を `--remote-debugging-port` 付きで起動し、CDP 経由で検証する
- E2E は毎回 `LUMABIN_E2E_RUN_ID` を付与した隔離 `userData` を使うため、前回実行のローカル状態が混ざらない
- `npm run e2e:headed` は同じ packaged app 導線で Playwright headed mode を有効にしたい場合に使う
- `npm run e2e:dense` は packaged app を dense E2E fixture（既定 1,000 assets）で起動し、dense 専用テストだけを対象に検索・仮想スクロール・preview・Dev metrics 表示の負荷ウォークスルーを自動確認する
- dense E2E は `apps/desktop/test-results/**/dev-metrics-snapshot.txt` に Dev Metrics snapshot を保存する
- `npm run e2e:prelaunch` も `package:darwin` 後の再署名済み packaged app を CLI 引数付きで起動し、fixture と隔離 `userData` を有効にする
- `npm run e2e:attach` は既に起動済みの `9222` CDP へ接続して Playwright を実行する
- 失敗時は `apps/desktop/test-results/` にスクリーンショット/trace が残る

現在の E2E シナリオ:
- app shell の主要コントロール表示
- Workspace Settings の開閉（overlay close 含む）
- Profile menu から Connection Setup を開く初回導線
- 狭幅時 topbar の profile selector クリップ検知
- Quick Preview で `Copy public URL` の操作フィードバック検証
- Delete の `Undo` / `Delete now` 導線検証
- hidden file input 経由の upload 完了とギャラリー反映検証

## 4. CI / リリース導線

### 4.1 GitHub Actions

Workflow:

- `.github/workflows/desktop-ci.yml`
- `.github/workflows/desktop-e2e.yml`
- `.github/workflows/desktop-release.yml`
- `.github/workflows/repository-hygiene.yml`

`desktop-ci`:

- Trigger:
  - `pull_request`
  - `push`（main）
  - `workflow_dispatch`
- Jobs:
  - `Lint / Typecheck / Audit`（`smoke:integration` を内包）
  - `Packaging smoke (macOS)`（`verify:mac-signing-readiness`、`package:darwin`、`verify:darwin-artifact` で signing readiness と release zip 構造を確認）

`desktop-release`:

- Trigger:
  - `push` tag（`v*`）
  - `workflow_dispatch`（タグ ref を選択）
- Jobs:
  - `Lint / Typecheck / Audit`
  - `Build and Publish macOS Release`
  - package 前に `verify:mac-signing-readiness`、publish 前に `verify:darwin-artifact` と `release:launch-smoke` を必須実行
- 成果物:
  - `LumaBin-darwin-arm64-<version>.zip`（命名は maker 設定に準拠）
  - `SHA256SUMS.txt`
  - `release-evidence.json`（bundle metadata / signing mode / artifact SHA256 / verification checks の機械可読証跡）
  - GitHub Releases に自動アップロード

`desktop-e2e`:

- Trigger:
  - `schedule`（毎日 03:00 JST / `0 18 * * *` UTC）
  - `workflow_dispatch`
- Jobs:
  - `Playwright E2E (macOS)`
  - 通常E2Eに加えて dense fixture E2E（1,000 assets）を実行
- 成功/失敗に関係なく `desktop-e2e-metrics-<run_id>` artifact に dense Dev Metrics snapshot を保存
- 失敗時 artifacts:
  - `apps/desktop/test-results`
  - `apps/desktop/playwright-report`

`repository-hygiene`:

- Trigger:
  - `pull_request` / `push`（OSS文書、issue/PRテンプレート、public readiness audit 変更）
  - `workflow_dispatch`
- Jobs:
  - `Public readiness audit`
  - `audit:public-history` で現在のtracked filesとGit historyを検査する

### 4.2 Branch protection（推奨）

`main` で Required checks を設定:

- `Lint / Typecheck / Audit`
- `Packaging smoke (macOS)`
- `Public readiness audit`

補足:
- `Public readiness audit` は OSS文書やGitHubテンプレートの変更時に履歴を含む public readiness を確認する。
- branch protection が未設定の場合も、`main` 直pushを避け PR マージを既定運用にする。

### 4.3 署名 / notarize（任意有効化）

Forge は以下環境変数を参照する。

- `LUMABIN_ENABLE_MAC_SIGN=1`（既定は `0` / unsigned 配布）
- `LUMABIN_APP_BUNDLE_ID`（既定: `com.satoooh.lumabin`）
- `LUMABIN_APPLE_SIGN_IDENTITY`（任意）
- `LUMABIN_APPLE_ID`
- `LUMABIN_APPLE_ID_PASSWORD`
- `LUMABIN_APPLE_TEAM_ID`

リリース workflow の挙動:

- 既定: unsigned ZIP を生成して GitHub Releases に公開
- `LUMABIN_ENABLE_MAC_SIGN=1` を repo variable に設定した場合のみ署名/notarize を有効化
- `npm run verify:mac-signing-readiness` で Electron 用 entitlements と signing/notarization 環境変数の不足を事前確認できる
- 署名有効時に必要 secret が不足している場合は workflow を失敗させる
- 署名有効時は Forge の Developer ID 署名/notarization 成果物を維持し、後段の ad-hoc 再署名は行わない
- 現時点の運用では notarize は見送り、unsigned ZIP 配布を正式運用とする

### 4.4 Release 実行手順（zip配布）

1. `main` に必要変更を反映し、`desktop-ci` 成功を確認する
2. リリースタグを作成して push する

```bash
git tag v0.1.0
git push origin v0.1.0
```

3. `desktop-release` が完了したら GitHub Releases を確認する
4. 利用者には Releases の zip と `SHA256SUMS.txt` を案内する

補足:
- 手動実行時は Actions の `Desktop Release` で対象のタグ ref を選んで実行する
- 同一タグ再実行時はアセットを `--clobber` で上書きする

### 4.5 Release 前の最終ゲート（推奨）

1. ローカルで preflight を実行する

```bash
cd apps/desktop
npm run release:preflight
```

2. 成功時に以下を確認する
   - `smoke:ci` が全緑
   - `package:darwin` が成功
   - `package:darwin` 後の Electron 用 entitlement 付き ad-hoc 再署名と zip 再生成が成功
   - `out/make/zip/darwin/arm64/*.zip` に `LumaBin.app/Contents/Resources/app.asar` が含まれる
   - bundle metadata（Bundle ID / app name / version）と executable が妥当である
   - SHA256 が表示される
   - `out/make/release-evidence.json` に artifact SHA256 と verification checks が記録される
   - 生成済み zip を一時展開し、LaunchServices 経由の packaged app E2E が通る

3. 生成済みアセットのみ再検証したい場合は verify-only を使う

```bash
npm run release:preflight:verify-only
```

4. 配布物の起動まで自動確認したい場合は launch smoke を実行する

```bash
npm run release:launch-smoke
```

期待結果:
- 生成済み zip が一時展開される
- packaged `LumaBin.app` が E2E fixture mode で起動する
- 起動は `Contents/MacOS/LumaBin` の直接実行ではなく LaunchServices 経由で行う
- `LUMABIN_E2E_CDP_PORT` 未指定時は実行ごとに空き port を選び、残存 packaged app の stale CDP endpoint に接続しない
- Playwright E2E の主要導線（app shell / settings / profile / quick preview / delete undo / upload）が成功する
- 終了時に起動した packaged app が停止される

補足:
- Codex などのサンドボックス環境から `release:launch-smoke` を実行する場合、LaunchServices 経由の GUI 起動は権限付き実行で確認する。サンドボックス越しの `open` が `kLSNoExecutableErr` を返しても、実体として `Contents/MacOS/LumaBin` が存在し、権限付き `open -n LumaBin.app --args ...` と `release:launch-smoke` が通るなら、配布物破損ではなく検証環境側の起動制約として扱う。

## 5. トラブルシュート

### 5.1 接続テスト失敗

- endpoint / bucket / key を確認
- R2 は `region=auto` を確認

### 5.2 preview が表示されない

- content-type と拡張子を確認
- 大容量は段階読み込み完了まで待つ
- 原本を download して破損切り分け

### 5.3 upload 失敗（ENOENT など）

- ローカルファイル存在確認
- バケット権限確認
- `Retry failed` で再送
- cancel 後は `failed` に残ったファイルのみ再試行される

### 5.4 package が `node:sqlite` で失敗する

症状:
- `DatabaseSync is not exported by __vite-browser-external`

対処:
- `vite.main.config.ts` の `build.rollupOptions.external` に `^node:` を含める
- `npm run package` を再実行

### 5.5 `sharp` 読み込み失敗

- 最適化アップロードのみフェイルオープン（アプリは継続可能）
- 必要なら `npm install --os=darwin --cpu=arm64 sharp`

### 5.6 一覧スクロールがガクつく

- `onScroll` 内に重い処理（永続化・再計測・不要なレイアウト計算）が残っていないか確認
- UI state 永続化がデバウンスされているか確認
- CSS の `scroll-behavior: smooth` が常時指定されていないか確認
- dense bucket で高速スクロールし、入力遅延の再現有無を確認

### 5.7 ヘッダー要素が重なる / 干渉する

- 固定要素はトップバーのみとし、一覧ヘッダーはスクロール対象に含める
- filter rail・toolbar の横並び要素は折り返し/省略ルールを確認する
- ウィンドウ端の余白（左右/下）を同一スケールで揃える
- スクロールバーが主要要素に重ならないか最終確認する

### 5.8 配布アプリが「壊れている」と表示されて起動できない

- unsigned 配布では quarantine 属性でブロックされる場合がある
- unsigned mode の `apps/desktop` `package:darwin` は zip 生成後に `build/entitlements.darwin.plist` を使って ad-hoc 再署名して再zip化する
- signed mode は Forge の Developer ID 署名/notarization 成果物を維持し、ad-hoc 再署名で上書きしない
- 再署名時は JIT / unsigned executable memory / library validation の entitlement を維持する。これらを外すと Electron の network service や CDP 起動確認が失敗する場合がある
- それでも初回起動でブロックされる場合は以下を実行して quarantine を外してから起動する

```bash
xattr -dr com.apple.quarantine LumaBin.app
open LumaBin.app
```

## 6. パフォーマンス確認手順（定期）

目的:
- 大きなバケットや長時間セッションで体感劣化が起きていないことを確認する

手順（手動、月次または大きなUI変更後）:
1. 開発ビルドを起動し、対象 profile で一覧を開く
2. 設定パネルの `Dev metrics (R2)` を `Reset` して計測を初期化
3. 次を順に実行する
   - 検索（3回以上）
   - スクロール（dense state で高速スクロール）
   - image/video/pdf の preview を各2回以上
4. `Dev metrics (R2)` の `Refresh` を実行する
5. `Dev metrics (R2)` の `Copy snapshot` を実行し、記録本文をコピーする
6. 異常や継続調査が必要な場合は GitHub Issue に記録する

ローカルで dense bucket を再現する場合:

```bash
cd apps/desktop
LUMABIN_E2E_FIXTURE_ASSET_COUNT=1000 npm run dev:e2e
```

実 profile を読み取り専用で自動計測する場合:

1. 通常の開発アプリを CDP 付きで起動する

```bash
cd apps/desktop
npx electron-forge start -- --remote-debugging-port=9334
```

2. 別ターミナルで attach 計測を実行する

```bash
cd apps/desktop
npm run perf:real-profile:attach
```

3. `apps/desktop/test-results/real-profile-dev-metrics-snapshot.txt` を確認する

補足:
- `LUMABIN_E2E_FIXTURE_ASSET_COUNT` は E2E fixture profile の初期 asset 件数を増やすための開発用入力。未指定時は通常 E2E と同じ最小 fixture（3件）を使う
- dense fixture は実R2のネットワーク特性を代替しない。UIスクロール・検索・preview cache の回帰確認に使い、リリース前の最終判定は実 profile でも確認する
- `perf:real-profile:attach` は既存のローカル profile を使い、検索・スクロール・preview と少数の preview read probe だけを実行する。preview read probe はユーザーの preview cache を削除せず、実行ごとに `maxBytes` を調整して実R2のGET経路も確認する。upload / delete / rename / move / settings save は実行せず、`PUT calls` と `Uploaded bytes` が 0 であることを guard する

確認観点:
- `Failures` が増えていない
- `Preview cache hit` が 2回目以降で上昇する
- `Search cache hit` が連続検索で上昇する
- 操作中にフリーズや著しいスクロール破綻がない
- スクロール中にヘッダーや操作UIが重ならない

記録先:
- 通常は repo に逐次ログを残さない
- 異常時や継続調査が必要な場合は GitHub Issue に再現条件、実行コマンド、匿名化済み snapshot を記録する
- 公開リポジトリ向けの記録では、profile 名・bucket 名・object key に由来する検索語は必ず匿名化する
- 公開fixture中心の標準手順は [PERFORMANCE.md](PERFORMANCE.md) を正とする

## 7. リリースチェック（最終確認）

目的:
- 公開済み Release アセットが「入手可能・整合性確認可能・起動可能」であることを確認する
- public repository 化を検討する場合、tracked file に private profile / bucket / object key hint や典型的な secret 形式が残っていないことを確認する

公開前 hygiene:

```bash
cd apps/desktop
npm run audit:public-readiness
npm run audit:public-history
npm run audit:github-public-readiness
```

期待結果:
- tracked file に `.env`、秘密鍵、証明書、ローカルDB、packaged artifact が含まれていない
- public-facing docs / metadata に private profile 名、bucket 名、object key hint、個人ドメイン画像URL、個人メールが残っていない
- full history をそのまま公開する場合、`audit:public-history` も通る。既存履歴に違反が残る場合は、値を露出せず commit / file / rule だけが報告される
- existing GitHub repository を public にする場合、`audit:github-public-readiness` で active Actions artifacts と公開対象 Releases の残りを確認する

補足:
- `audit:public-readiness` は tracked file の軽量チェックで、通常の `smoke:ci` に含まれる
- `audit:public-history` は full history public 化前の明示確認用。既存履歴に違反がある間は失敗するため、通常の `smoke:ci` には含めない
- GitHub Actions artifacts、GitHub Releases、git author email の履歴 rewrite 要否は別途確認する
- `audit:github-public-readiness` は read-only 監査で、削除・公開設定変更・workflow再実行は行わない

public 化の判断:
- `audit:public-readiness` が通り、`audit:public-history` が失敗する場合、current tree は公開可能でも full history の公開は不可として扱う
- 推奨は、sanitized current tree を新しい公開用履歴として作ること。既存 private repository を full history のまま public に切り替えない
- 既存 repository を public に切り替える必要がある場合は、事前に履歴 rewrite を実施し、`audit:public-history` が通ることを確認する。履歴 rewrite は破壊的なため、実施前に対象branch、tag、remote、復旧手順を確認する

sanitized snapshot 公開の安全手順（推奨）:
1. 現在の作業branchで `npm run smoke:ci` と `npm run audit:public-readiness` が通ることを確認する
2. `npm run audit:public-history` が失敗する場合、履歴付き公開を中止し、squash merge または新規公開repositoryへの snapshot import を選ぶ
3. 公開対象の履歴には、sanitized commit 以降の内容だけを含める
4. GitHub Actions artifacts と古い test / rc release を削除・整理してから repository visibility を変更する
5. visibility 変更後、branch protection、tag protection、fork pull request workflow approval、Actions permissions を再確認する

sanitized snapshot archive を作る場合:

```bash
cd apps/desktop
npm run release:public-snapshot
npm run verify:public-snapshot-import
```

期待結果:
- `out/public-snapshot/lumabin-public-snapshot-<commit>.tar.gz` が生成される
- 同じディレクトリに manifest JSON が生成され、SHA256 と source commit が記録される
- 生成物は `git archive` ベースのため `.git` と履歴を含まない
- 最新 manifest の snapshot を一時ディレクトリへ展開し、`main` branch の初回 commit として import できる

公開repository名が private codename と異なる場合:

```bash
cd apps/desktop
npm run release:public-snapshot -- --slug <public-repo-slug>
```

期待結果:
- `out/public-snapshot/<public-repo-slug>-public-snapshot-<commit>.tar.gz` が生成される
- archive 展開root は `<public-repo-slug>-<commit>` になり、新規 public repository への初回 import に使える
- manifest の `snapshot.slug` / `snapshot.rootDirectory` が公開repo名に対応する

補足:
- 既定では dirty worktree で失敗する。公開用snapshotはcommit済みのsanitized treeから作る
- 生成前に `audit:public-readiness` を自動実行する
- `--slug` は archive 名と展開rootだけを変える。アプリ表示名や package metadata の rename は別差分として扱う
- `verify:public-snapshot-import` は一時checkoutを作って削除する。調査用に残す場合のみ `npm run verify:public-snapshot-import -- --keep` を使う

手順:
1. Release の対象タグを確認する（例: `v1.0.2`）
2. GitHub Release ページで次を確認する
   - zip アセットがある
   - `SHA256SUMS.txt` がある
3. zip をダウンロードし、SHA256 を照合する

```bash
shasum -a 256 LumaBin-darwin-arm64-<version>.zip
cat SHA256SUMS.txt
```

4. zip を展開して `LumaBin.app` を起動する
5. 初回起動後、以下をスモーク確認する
   - profile 選択/接続
   - gallery 表示
   - preview を開いて閉じる
   - 小さな upload 1件
- `release:launch-smoke` を使う場合は、fixture profile で app shell / settings / quick preview / delete undo / upload の自動確認まで完了していること
- `npm run e2e:dense` を使う場合は、fixture profile で Dev metrics が表示され、`List calls > 0` と `Failures = 0` が自動確認されていること
- dense E2E の Dev Metrics snapshot は `apps/desktop/test-results/**/dev-metrics-snapshot.txt` に保存される
6. 異常や継続調査が必要な場合は GitHub Issue に記録する

期待結果:
- チェックサム一致
- アプリ起動できる
- 主要導線（接続/一覧/preview/upload）に致命的エラーがない

補足:
- `release:launch-smoke` が `No assets yet.` で quick preview 導線に到達できない場合、公開アセットが現在の E2E fixture 前提より古い可能性がある。対象タグとアプリ画面の profile 名を確認し、現行コードで新しい候補タグを作成して再検証する。
- Codex などのサンドボックス環境では、GUI app の LaunchServices 起動確認は権限付き実行で行う。権限なしで `kLSNoExecutableErr` が出た場合は、zip内の実行ファイル、`Info.plist` の `CFBundleExecutable`、codesign、権限付き `release:launch-smoke` の結果を突き合わせて配布物起因か検証環境起因かを切り分ける。

## 8. ロールバック方針

- 問題ある配布物は即時取り下げ
- 直前の成功ビルドに戻す
- 原因確定まで `main` への追加機能投入を停止

## 9. ログ運用

- secret / signed URL をログ出力しない
- 失敗ログは要約 + 原因特定に必要な最小情報に限定
- 一時デバッグログは同一作業内で削除する
