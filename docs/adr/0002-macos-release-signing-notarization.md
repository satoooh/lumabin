# ADR 0002: macOS Release Signing and Notarization

- Status: Accepted
- Date: 2026-05-05

## Context

LumaBin は現在、public preview として macOS ZIP を配布している。unsigned ZIP は Apple Developer Program の資格情報なしに再現できるため OSS の反復には向いているが、一般ユーザー向けには Gatekeeper によるブロックや quarantine 解除の手順が必要になりやすく、初回体験が弱い。

Electron の公式配布ガイドでは、macOS release build を Developer ID code signing と Apple notarization の 2 段階の信頼チェーンとして扱う。Electron Forge は `@electron/osx-sign` と `@electron/notarize` を使い、`packagerConfig.osxSign` と `packagerConfig.osxNotarize` でこの構成を表現できる。

一方で、Apple certificate、app-specific password、Team ID などは repository に commit できない。したがって release workflow は、secrets がなくても再現できる public preview の既定経路を残しつつ、資格情報がある場合だけ signed/notarized 経路へ進める必要がある。

## Decision

LumaBin は unsigned ad-hoc ZIP release を既定の public preview 経路として維持する。

`LUMABIN_ENABLE_MAC_SIGN=1` が設定された場合、release build は Developer ID signing と notarization を一体の release mode として扱う。GitHub Actions の release job は Developer ID Application certificate を一時 keychain に import し、package 前に signing identity を検証し、Electron Forge によって app を sign / notarize し、生成された ZIP を publish 前に検証する。

signed/notarized 経路では以下の GitHub secrets を必須とする。

- `LUMABIN_APPLE_SIGN_IDENTITY`
- `LUMABIN_APPLE_CERTIFICATE_BASE64`
- `LUMABIN_APPLE_CERTIFICATE_PASSWORD`
- `LUMABIN_APPLE_ID`
- `LUMABIN_APPLE_ID_PASSWORD`
- `LUMABIN_APPLE_TEAM_ID`

release verifier は signed mode を unsigned mode より厳しく扱い、Release publish 前に Developer ID authority、Team ID、Gatekeeper assessment、stapler validation を確認する。

## Consequences

- 既定の preview release は secrets なしで再現できる。
- Apple credentials を設定すれば、コード変更なしで一般ユーザー向けの signed/notarized release に移行できる。
- signing secrets は git の外に置き、GitHub Actions runner の一時 keychain 内でだけ materialize される。
- 必要な Apple secrets を設定して signed release run を実行するまでは、signed/notarized 経路は実アセットで未検証の状態として扱う。
- release documentation では、既定の unsigned preview release と、一般ユーザー向けの signed/notarized release を明確に区別する。
