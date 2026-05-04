# LumaBin
[![Desktop CI](https://github.com/satoooh/lumabin/actions/workflows/desktop-ci.yml/badge.svg)](https://github.com/satoooh/lumabin/actions/workflows/desktop-ci.yml)
[![Desktop E2E](https://github.com/satoooh/lumabin/actions/workflows/desktop-e2e.yml/badge.svg)](https://github.com/satoooh/lumabin/actions/workflows/desktop-e2e.yml)
[![Desktop Release](https://github.com/satoooh/lumabin/actions/workflows/desktop-release.yml/badge.svg)](https://github.com/satoooh/lumabin/actions/workflows/desktop-release.yml)
[![Repository Hygiene](https://github.com/satoooh/lumabin/actions/workflows/repository-hygiene.yml/badge.svg)](https://github.com/satoooh/lumabin/actions/workflows/repository-hygiene.yml)

LumaBin は、Cloudflare R2 上の画像・動画・PDF・CSV を gallery-first で扱う macOS 向けデスクトップアプリです。

- 形態: Electron デスクトップアプリ
- 技術方針: TypeScript 統一（Renderer / Main / Preload）
- ストレージ方針: Cloudflare R2 first, S3 ready
- ライセンス: MIT

LumaBin は OSS として公開されています。バグ報告、再現手順、ドキュメント改善、小さなUX改善の提案を歓迎します。参加方法は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 製品画像

![LumaBin Product Screenshot](docs/assets/lumabin-sanitized-screenshot.png)

## 最新版を試す

macOS 向けの配布 zip は GitHub Releases で公開しています。

- 最新リリース: [LumaBin Releases](https://github.com/satoooh/lumabin/releases/latest)
- 配布形式: unsigned macOS ZIP
- 検証ファイル: `SHA256SUMS.txt` と `release-evidence.json`

初回起動時に Gatekeeper の警告が出る場合があります。現時点では notarize 済みアプリではなく、OSS preview として unsigned ZIP を配布しています。

## 現在地

- 現在フェーズ: **Public preview**
- ロードマップと未決事項: [docs/ROADMAP.md](docs/ROADMAP.md)
- 仕様: [docs/SPEC.md](docs/SPEC.md)
- 実装構成: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## クイックスタート

### 必要環境

- macOS
- Node.js 22.12+
- npm 10+

### セットアップ

```bash
git clone https://github.com/satoooh/lumabin.git
cd lumabin/apps/desktop
npm install
```

### 起動

```bash
npm run dev
```

### 使い方メモ

- ギャラリー画面で `Cmd+V` / `Ctrl+V` すると、クリップボード画像をそのままアップロードできます。

### 最低チェック

```bash
npm run smoke:ci
```

### E2E（実機操作）

```bash
# 初回のみ
npm run e2e:install

# packaged app を生成して E2E 実行
npm run e2e
```

補足:
- E2E は packaged app を `LUMABIN_E2E_FIXTURE=1` で起動し、固定 profile / assets のフィクスチャを使って再現性を担保します。

## 開発コマンド（apps/desktop）

```bash
npm run lint
npm run typecheck
npm run smoke:integration
npm run smoke:ci
npm run e2e
npm run e2e:headed
npm run verify:darwin-artifact
npm run release:launch-smoke
npm run package
npm run package:darwin
npm run audit:runtime
```

## CI / Release

GitHub Actions:

- `.github/workflows/desktop-ci.yml`
- `.github/workflows/desktop-e2e.yml`
- `.github/workflows/desktop-release.yml`

- Trigger: `pull_request`, `push`（main）, `workflow_dispatch`
- Jobs:
  - `Lint / Typecheck / Audit`（`smoke:integration` を内包）
  - `Packaging smoke (macOS)`
- Trigger（E2E）:
  - `schedule`（毎日 03:00 JST / `0 18 * * *` UTC）
  - `workflow_dispatch`
- Jobs（E2E）:
  - `Playwright E2E (macOS)`（失敗時に `test-results` / `playwright-report` を artifact 保存）
- Trigger（Release）:
  - `push tag` (`v*`)
  - `workflow_dispatch`（タグ ref を選択して実行）
- Jobs（Release）:
  - `Lint / Typecheck / Audit`
  - `Build and Publish macOS Release`（GitHub Release に zip + `SHA256SUMS.txt` を公開）
  - 既定は unsigned ZIP。`LUMABIN_ENABLE_MAC_SIGN=1` のときのみ署名/notarize を実施

ローカルで配布物の最終確認まで行う場合:

```bash
npm run release:preflight
npm run release:launch-smoke
```

`release:launch-smoke` は生成済み macOS zip を一時展開し、packaged app を E2E fixture mode で起動して主要導線を自動確認します。
`package:darwin` は zip 生成後に Electron 用 entitlement 付きで ad-hoc 再署名し、配布 zip を再生成します。

branch protection の推奨設定は [docs/RUNBOOK.md](docs/RUNBOOK.md) を参照してください。

## OSSとして参加する

- バグ報告: [Bug report](https://github.com/satoooh/lumabin/issues/new?template=bug_report.yml)
- 機能提案: [Feature request](https://github.com/satoooh/lumabin/issues/new?template=feature_request.yml)
- 貢献ガイド: [CONTRIBUTING.md](CONTRIBUTING.md)
- 行動規範: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- サポート範囲: [SUPPORT.md](SUPPORT.md)
- セキュリティ報告: [SECURITY.md](SECURITY.md)

公開issueやPRには、access key、secret key、private bucket 名、object key、署名済みURL、個人データを含むスクリーンショットを貼らないでください。

## ドキュメント

- [docs/PRD.md](docs/PRD.md): プロダクト要求と固定判断
- [docs/SPEC.md](docs/SPEC.md): 機能/非機能要件と受け入れ基準
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): 現行アーキテクチャと責務分離
- [docs/ROADMAP.md](docs/ROADMAP.md): public preview の現在地と今後の重点テーマ
- [docs/RUNBOOK.md](docs/RUNBOOK.md): 開発・検証・運用手順
- [docs/PERFORMANCE.md](docs/PERFORMANCE.md): 公開fixture中心の性能確認手順

更新ルールは [docs/AGENTS.md](docs/AGENTS.md) を参照してください。
