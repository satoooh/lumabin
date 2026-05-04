# docs ガイド

このディレクトリは「何を作るか」「どう作るか」「どう進めるか」「現時点でどうなっているか」を定義する一次ドキュメントを管理する。

## 読む順序

1. [PRD.md](PRD.md): プロダクト要求定義（狙い、差別化、成功条件）
2. [SPEC.md](SPEC.md): 要件仕様（機能要件・非機能要件・受け入れ基準）
3. [ARCHITECTURE.md](ARCHITECTURE.md): 実装構成（責務分割、IPC、データモデル）
4. [ROADMAP.md](ROADMAP.md): public preview の現在地と今後の重点テーマ
5. [RUNBOOK.md](RUNBOOK.md): 実行運用手順（起動・障害対応・デバッグ）
6. [PERFORMANCE.md](PERFORMANCE.md): 公開fixture中心の性能確認手順

## 更新ルール

- 仕様変更時は `PRD.md` と `SPEC.md` を先に更新し、必要に応じて `ARCHITECTURE.md` と `ROADMAP.md` を追従させる。
- 実装タスクや未決事項は GitHub Issues で管理する。
- 実装で得た運用知見は `RUNBOOK.md` に追記する。
- パフォーマンス確認手順や判断基準は `PERFORMANCE.md` に追記し、逐次ログは必要に応じて GitHub Issues へ残す。
- 完了済み作業ログは長期保存せず、必要な要点だけ README / RUNBOOK / ARCHITECTURE / SPEC に統合する。
