# Architecture Decision Records

このディレクトリは、LumaBin の長期的な設計判断を短く記録します。

## 使い分け

- GitHub Issues: 検討、議論、作業管理、未決事項
- ADR: 決定済みで、後から「なぜそうしたか」を参照したい設計判断
- Pull Requests / commits: 実装差分と変更履歴

## ADR に残す判断

- macOS 配布方式、署名、notarization などの配布方針
- R2 first / generic S3 ready の互換性境界
- Renderer / Preload / Main Process の責務分離
- DDD / Bounded Context / CQRS / Event-Driven Architecture の境界
- 永続化、cache、event bus、IPC contract など後戻りしにくい構成判断

## ADR にしないもの

- 実装タスク
- バグ修正
- UI の細かな改善
- flaky test や performance regression の調査
- 結論が出ていない検討

## 形式

ADR は必要になった時点で追加します。ファイル名は `0001-short-title.md` のように連番と短い英語タイトルを使います。

推奨構成:

```markdown
# ADR 0001: Short Title

- Status: Accepted
- Date: YYYY-MM-DD

## Context

## Decision

## Consequences
```
