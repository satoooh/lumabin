# docs ガイド

このディレクトリは「何を作るか」「どう作るか」「どう進めるか」「現時点でどうなっているか」を定義する一次ドキュメントを管理する。

## 読む順序

1. [PRD.md](PRD.md): プロダクト要求定義（狙い、差別化、成功条件）
2. [SPEC.md](SPEC.md): 要件仕様（機能要件・非機能要件・受け入れ基準）
3. [ARCHITECTURE.md](ARCHITECTURE.md): 実装構成（責務分割、IPC、データモデル）
4. [PLAN.md](PLAN.md): 実行計画（マイルストーン、リスク、検証計画）
5. [MVP_ISSUES.md](MVP_ISSUES.md): MVP の Issue 分解（起票単位）
6. [RUNBOOK.md](RUNBOOK.md): 実行運用手順（起動・障害対応・デバッグ）
7. [PERF_LOG.md](PERF_LOG.md): 定例パフォーマンス計測ログ
8. [STATUS.md](STATUS.md): 現在地と未決事項
9. [RELEASE_READINESS_AUDIT.md](RELEASE_READINESS_AUDIT.md): macOS release readiness の監査ログ

## 更新ルール

- 仕様変更時は `PRD.md` と `SPEC.md` を先に更新し、必要に応じて `ARCHITECTURE.md` と `PLAN.md` を追従させる。
- 実装に着手する前に、`MVP_ISSUES.md` を更新して実行単位を明確にする。
- 実装で得た運用知見は `RUNBOOK.md` に追記する。
- パフォーマンス計測結果は `PERF_LOG.md` に追記する。
- 進捗や未決事項は `STATUS.md` を単一の真実源として更新する。
- release readiness の証跡と未完了事項は `RELEASE_READINESS_AUDIT.md` に整理する。
