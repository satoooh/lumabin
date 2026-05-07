# LumaBin Roadmap

- 最終更新日: 2026-05-07
- 対象: public OSS project としての今後の改善方針
- 詳細な進行管理: [GitHub Issues](https://github.com/satoooh/lumabin/issues)

## 現在の安定度

LumaBin は public preview として利用可能な状態です。

- 最新Release: [GitHub Releases](https://github.com/satoooh/lumabin/releases/latest)
- 配布形式: unsigned macOS ZIP（既定） / Developer ID signed + notarized ZIP（secrets 設定時）
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

### 1. Developer ID signing / notarization の実運用化

- Issue: [#3 Evaluate Developer ID signing and notarization](https://github.com/satoooh/lumabin/issues/3)
- 目的: signed / notarized 配布に必要な Apple credentials を設定し、実リリースで検証する
- 完了条件: `LUMABIN_ENABLE_MAC_SIGN=1` の release run が成功し、Release evidence で Developer ID authority / hardened runtime / stapler validation が確認できる

### 2. Desktop toolchain major upgrade の計画移行

- Issue: [#60 Plan desktop toolchain major upgrades](https://github.com/satoooh/lumabin/issues/60)
- 目的: Dependabot の通常PRでは解けない major toolchain 更新を、互換性のある単位で計画的に移行する
- 完了条件: 対象package familyごとの dedicated PR で `npm ci`、`npm run smoke:ci`、`Desktop CI` packaging smoke が通り、移行済みfamilyだけ Dependabot ignore を解除できる
- 現在地: Electron 42 までの移行は v1.0.5 に反映済み。残る major は `eslint` 10 と `@electron/fuses` 2 で、いずれも upstream peer dependency 互換性が整うまで defer する

## 完了済みマイルストーン

完了済みの詳細な作業ログは repo 内の常設ドキュメントでは管理しません。出荷済みの変更は Git commit、Pull Request、GitHub Releases を正とします。

- MVP: browse / upload / preview / search / share
- Beta hardening: CI / packaging / release workflow / preview-upload recovery / cache-index limits
- OSS公開: sanitized public history、Release asset、contribution docs、issue/PR templates、repository hygiene workflow
- Renderer境界整理: root workbench を context handoff に寄せ、presenter / surface hook へ分離
- CI/E2E/Release安定化: release artifact / launch smoke / dense E2E / Dev Metrics snapshot / release evidence の検証ゲートを整備
- Public performance benchmark: `npm run e2e:dense` と Dev Metrics snapshot の公開fixture手順を定義
- Provider互換性: R2 / generic S3 の Beta 対応範囲と非対応境界を `REQUIREMENTS.md` / `RUNBOOK.md` に統合

## 運用ルール

- 細かいタスクは GitHub Issues に起こす
- 完了済み作業ログは長期保存せず、必要な要点だけ README / RUNBOOK / ARCHITECTURE / REQUIREMENTS / ADR に統合する
- ロードマップは「外部コントリビューターが判断に使える粒度」に保つ
