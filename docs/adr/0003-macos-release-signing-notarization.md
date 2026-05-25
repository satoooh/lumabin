# ADR 0003: macOS Release Signing and Notarization

- Status: Accepted / Implemented
- Date: 2026-05-05

## Context

LumaBin は現在、public preview として macOS ZIP を配布している。unsigned ZIP は Apple Developer Program の資格情報なしに再現できるため OSS の反復には向いているが、一般ユーザー向けには Gatekeeper によるブロックや quarantine 解除の手順が必要になりやすく、初回体験が弱い。

Electron の公式配布ガイドでは、macOS release build を Developer ID code signing と Apple notarization の 2 段階の信頼チェーンとして扱う。Electron Forge は `@electron/osx-sign` と `@electron/notarize` を使い、`packagerConfig.osxSign` と `packagerConfig.osxNotarize` でこの構成を表現できる。

一方で、Apple certificate、app-specific password、Team ID などは repository に commit できない。したがって release workflow は、secrets がなくても再現できる public preview の既定経路を残しつつ、資格情報がある場合だけ signed/notarized 経路へ進める必要がある。

## Decision

LumaBin は signed/notarized ZIP release を一般ユーザー向けの公開配布経路として扱う。Apple credentials が設定されていない環境でも再現可能な fallback として、unsigned ad-hoc ZIP release 経路は維持する。

`LUMABIN_ENABLE_MAC_SIGN=1` が設定された場合、release build は Developer ID signing と notarization を一体の release mode として扱う。GitHub Actions の release job は Developer ID Application certificate を一時 keychain に import し、package 前に signing identity を検証し、Electron Forge によって app を sign / notarize し、生成された ZIP を publish 前に検証する。

signed/notarized 経路では以下の GitHub `release` environment secrets を必須とする。

- `LUMABIN_APPLE_SIGN_IDENTITY`
- `LUMABIN_APPLE_CERTIFICATE_BASE64`
- `LUMABIN_APPLE_CERTIFICATE_PASSWORD`
- `LUMABIN_APPLE_ID`
- `LUMABIN_APPLE_ID_PASSWORD`
- `LUMABIN_APPLE_TEAM_ID`

release verifier は signed mode を unsigned mode より厳しく扱い、Release publish 前に Developer ID authority、hardened runtime、Team ID、Gatekeeper assessment、stapler validation を確認する。

## Consequences

- 一般ユーザー向け release は Developer ID signing / notarization を通し、Gatekeeper assessment と stapler validation を publish 前に検証する。
- Apple credentials がない環境では unsigned ad-hoc ZIP を再現できるが、これは preview / fallback 経路として扱う。
- signing secrets は git の外の `release` environment secrets に置き、GitHub Actions runner の一時 keychain 内でだけ materialize される。
- v1.0.6 release で signed/notarized ZIP の実運用は確認済み。Release evidence では `signing.mode=signed`、Developer ID authority、hardened runtime、Gatekeeper assessment、stapler validation が記録された。
- release documentation では、一般ユーザー向けの signed/notarized release と、signing 無効時の unsigned fallback を明確に区別する。
