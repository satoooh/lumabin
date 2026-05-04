# docs ガイド

このディレクトリは「何を作るか」「どう作るか」「どう進めるか」「現時点でどうなっているか」を定義する一次ドキュメントを管理する。

## 読む順序

1. [PRD.md](PRD.md): プロダクト意図（狙い、差別化、固定判断）
2. [REQUIREMENTS.md](REQUIREMENTS.md): 要件（機能要件・非機能要件・受け入れ基準）
3. [ARCHITECTURE.md](ARCHITECTURE.md): 実装構成（責務分割、IPC、データモデル）
4. [ROADMAP.md](ROADMAP.md): public preview の現在地と今後の重点テーマ
5. [RUNBOOK.md](RUNBOOK.md): 実行運用手順（起動・障害対応・デバッグ）
6. [PERFORMANCE.md](PERFORMANCE.md): 公開fixture中心の性能確認手順
7. [adr/](adr/): 決定済みの長期的な設計判断

## 更新ルール

- プロダクト意図の変更時は `PRD.md`、合意済み要件や受け入れ基準の変更時は `REQUIREMENTS.md` を更新する。
- 後戻りしにくい設計判断を確定した場合は、必要に応じて `adr/` に ADR を追加する。
- 実装タスクや未決事項は GitHub Issues で管理する。
- 実装で得た運用知見は `RUNBOOK.md` に追記する。
- パフォーマンス確認手順や判断基準は `PERFORMANCE.md` に追記し、逐次ログは必要に応じて GitHub Issues へ残す。
- 完了済み作業ログは長期保存せず、必要な要点だけ README / RUNBOOK / ARCHITECTURE / REQUIREMENTS / ADR に統合する。
