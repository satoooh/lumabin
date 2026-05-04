# LumaBin Roadmap

- 最終更新日: 2026-05-04
- 対象: public OSS project としての今後の改善方針
- 詳細な進行管理: [GitHub Issues](https://github.com/satoooh/lumabin/issues)

## 現在の安定度

LumaBin は public preview として利用可能な状態です。

- 最新Release: [GitHub Releases](https://github.com/satoooh/lumabin/releases/latest)
- 配布形式: unsigned macOS ZIP
- サポート対象: 最新Release と `main`
- 品質ゲート: `Desktop CI`, `Repository Hygiene`, tag release 時の `Desktop Release`

主要導線は実装済みです。

- R2 / generic S3 profile
- Gallery/List browse
- Search / sort / kind filter / Smart Collections / Saved Views
- Drag & drop / file picker / clipboard upload
- Image / video / PDF / CSV preview
- Rename / move / delete / bulk operation
- Public URL / presigned URL copy

## 今後の重点テーマ

### 1. Renderer境界の継続整理

- Issue: [#1 Refine renderer workbench boundaries](https://github.com/satoooh/lumabin/issues/1)
- 目的: Renderer 側の root composition を context 間の接続に集中させ、変更影響範囲をさらに狭める
- 完了条件: `npm run smoke:ci` が通り、残す orchestration と切り出す presenter / workbench の判断が追える

### 2. CI/E2E/Release workflow の安定運用

- Issue: [#2 Track E2E and release workflow stability](https://github.com/satoooh/lumabin/issues/2)
- 目的: nightly E2E や macOS packaging smoke の失敗を作業ログではなく issue で追跡する
- 完了条件: 恒常フレークがあれば再現条件と修正方針が整理されている

### 3. Developer ID signing / notarization の判断

- Issue: [#3 Evaluate Developer ID signing and notarization](https://github.com/satoooh/lumabin/issues/3)
- 目的: unsigned ZIP 継続か、signed / notarized 配布へ移行するかを判断する
- 完了条件: 選択した配布方針、必要secret、検証手順が `docs/RUNBOOK.md` とRelease workflowに一致している

### 4. Public performance benchmark

- Issue: [#4 Define public performance benchmark routine](https://github.com/satoooh/lumabin/issues/4)
- 目的: private profile の逐次ログではなく、公開可能な fixture benchmark で性能回帰を検出する
- 完了条件: `npm run e2e:dense` と Dev Metrics snapshot の確認観点が明確になっている

### 5. Provider互換性の明確化

- Issue: [#5 Clarify R2 and generic S3 compatibility boundaries](https://github.com/satoooh/lumabin/issues/5)
- 目的: R2 first / S3 ready の対応範囲を、仕様・サポート・回復導線として明確にする
- 完了条件: `docs/REQUIREMENTS.md` と `docs/RUNBOOK.md` のprovider境界が現行実装と一致している

## 完了済みマイルストーン

完了済みの詳細な作業ログは repo 内の常設ドキュメントでは管理しません。出荷済みの変更は Git commit、Pull Request、GitHub Releases を正とします。

- MVP: browse / upload / preview / search / share
- Beta hardening: CI / packaging / release workflow / preview-upload recovery / cache-index limits
- OSS公開: sanitized public history、Release asset、contribution docs、issue/PR templates、repository hygiene workflow

## 運用ルール

- 細かいタスクは GitHub Issues に起こす
- 完了済み作業ログは長期保存せず、必要な要点だけ README / RUNBOOK / ARCHITECTURE / REQUIREMENTS / ADR に統合する
- ロードマップは「外部コントリビューターが判断に使える粒度」に保つ
