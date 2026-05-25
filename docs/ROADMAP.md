# LumaBin Roadmap

- 最終更新日: 2026-05-26
- 対象: public OSS project としての今後の改善方針
- 詳細な進行管理: [GitHub Issues](https://github.com/satoooh/lumabin/issues)

## 現在の安定度

LumaBin は public preview として利用可能な状態です。

- 最新Release: [GitHub Releases](https://github.com/satoooh/lumabin/releases/latest)
- 配布形式: Developer ID signed + notarized macOS ZIP（現在の公開リリース） / unsigned ad-hoc ZIP（signing 無効時の fallback）
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

### 1. Desktop toolchain major upgrade の計画移行

- Issue: [#60 Plan desktop toolchain major upgrades](https://github.com/satoooh/lumabin/issues/60)
- 目的: Dependabot の通常PRでは解けない major toolchain 更新を、互換性のある単位で計画的に移行する
- 完了条件: 対象package familyごとの dedicated PR で `npm ci`、`npm run smoke:ci`、`Desktop CI` packaging smoke が通り、移行済みfamilyだけ Dependabot ignore を解除できる
- 現在地: Electron 42 と ESLint 9 flat config までの移行は完了済み。残る major は `eslint` 10 と `@electron/fuses` 2 で、いずれも upstream peer dependency 互換性が整うまで defer する

### 2. Release trust chain の維持

- 目的: signed/notarized ZIP の release evidence を継続的に確認し、Apple 証明書・notarization 資格情報・GitHub `release` environment の期限切れや設定 drift を早期に検知する
- 完了条件: 各 tag release で `release-evidence.json` の `signing.mode=signed`、Developer ID authority、hardened runtime、`spctlAssess=true`、`staplerValidate=true` が確認できる

## 完了済みマイルストーン

完了済みの詳細な作業ログは repo 内の常設ドキュメントでは管理しません。出荷済みの変更は Git commit、Pull Request、GitHub Releases を正とします。

- MVP: browse / upload / preview / search / share
- Beta hardening: CI / packaging / release workflow / preview-upload recovery / cache-index limits
- OSS公開: sanitized public history、Release asset、contribution docs、issue/PR templates、repository hygiene workflow
- Renderer境界整理: root workbench を context handoff に寄せ、presenter / surface hook へ分離
- CI/E2E/Release安定化: release artifact / launch smoke / dense E2E / Dev Metrics snapshot / release evidence の検証ゲートを整備
- Developer ID signing / notarization 実運用化: v1.0.6 release で signed/notarized ZIP を公開し、`release-evidence.json` で Developer ID authority / hardened runtime / Gatekeeper assessment / stapler validation を確認済み
- Public performance benchmark: `npm run e2e:dense` と Dev Metrics snapshot の公開fixture手順を定義
- Provider互換性: R2 / generic S3 の Beta 対応範囲と非対応境界を `REQUIREMENTS.md` / `RUNBOOK.md` に統合

## 運用ルール

- 細かいタスクは GitHub Issues に起こす
- 完了済み作業ログは長期保存せず、必要な要点だけ README / RUNBOOK / ARCHITECTURE / REQUIREMENTS / ADR に統合する
- ロードマップは「外部コントリビューターが判断に使える粒度」に保つ
