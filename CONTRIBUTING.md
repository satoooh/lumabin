# Contributing to LumaBin

LumaBin への貢献を歓迎します。バグ報告、再現手順の追加、ドキュメント改善、小さなUX改善、テスト追加は特に助かります。

## まず確認すること

- 大きな仕様変更や依存追加は、実装前に issue で提案してください。
- セキュリティ問題は公開issueに書かず、[SECURITY.md](SECURITY.md) の手順に従ってください。
- access key、secret key、private bucket 名、object key、署名済みURL、個人データを含む画像やログは投稿しないでください。
- ドキュメントとユーザー向け説明は日本語を基本にします。コード、ログ、コメント、commit message は英語で書きます。

## 開発環境

必要環境:

- macOS
- Node.js 22.12+
- npm 10+

セットアップ:

```bash
git clone https://github.com/satoooh/lumabin.git
cd lumabin/apps/desktop
npm install
```

起動:

```bash
npm run dev
```

## 変更前に読むもの

変更内容に応じて、以下を確認してください。

- プロダクト意図: [docs/PRD.md](docs/PRD.md)
- 要件と受け入れ基準: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- アーキテクチャ: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 開発/検証/リリース手順: [docs/RUNBOOK.md](docs/RUNBOOK.md)
- 現在地と今後の重点テーマ: [docs/ROADMAP.md](docs/ROADMAP.md)
- 性能確認手順: [docs/PERFORMANCE.md](docs/PERFORMANCE.md)
- 決定済みの設計判断: [docs/adr/](docs/adr/)

## 変更の考え方

- 小さく、レビューしやすく、元に戻しやすい差分を優先してください。
- 既存の構造、命名、テスト方針に合わせてください。
- UI文言やアクセシブル名はテスト契約になっている箇所があります。変更する場合は関連テストも更新してください。
- 非自明なロジックにはテストを追加してください。
- 依存関係の追加・削除、永続データ形式の変更、公開API/UX互換性に影響する変更は、事前にissueで合意してください。

## テスト

通常のPRでは、少なくとも次を実行してください。

```bash
cd apps/desktop
npm run smoke:ci
```

UI、レイアウト、モーダル、フォーカス、スクロールに関わる変更では、可能ならE2Eも実行してください。

```bash
npm run e2e:install
npm run e2e
```

配布物やmacOS bundleに関わる変更では、Darwin artifact の検証も実行してください。

```bash
npm run package:darwin
npm run verify:darwin-artifact
```

## Pull Request

PRには以下を含めてください。

- 何を変えたか
- なぜ変えたか
- 実行した検証
- スクリーンショットや動画が必要なUI変更では、機密情報を含まないfixtureで撮影したもの
- 未検証のこと、既知のリスク

commit message は Conventional Commits を推奨します。

```text
fix(desktop): keep preview focus after close
docs(oss): add contribution guide
test(public): cover repository hygiene audit
```

## リリース

リリースは maintainer が行います。通常の流れは以下です。

1. `main` の `Desktop CI` が成功していることを確認する
2. `v*` タグをpushする
3. `Desktop Release` が zip、`SHA256SUMS.txt`、`release-evidence.json` を公開する
4. Release asset の checksum を確認する

詳細は [docs/RUNBOOK.md](docs/RUNBOOK.md) を参照してください。
