# LumaBin Performance

- 最終更新日: 2026-08-24
- 目的: public repo で再現できる性能確認手順と判断基準を定義する
- 関連Issue: [#4 Define public performance benchmark routine](https://github.com/satoooh/lumabin/issues/4)

## 基本方針

LumaBin の性能確認は、公開可能な fixture を標準とします。

- 標準: `npm run e2e:dense`
- 対象: packaged app / E2E fixture / 1,000 assets
- 主な観点: search、virtual scroll、quick preview、Dev Metrics 表示
- 実profile計測: 任意。repoへ記録する場合は profile 名、bucket 名、object key、検索語を必ず匿名化する

逐次ログは repo に蓄積しません。性能劣化や調査が必要な場合は GitHub Issue に記録します。

## 標準ベンチ

```bash
cd apps/desktop
npm run e2e:install
npm run e2e:dense
```

期待結果:

- dense fixture E2E が成功する
- Dev Metrics が表示される
- `List calls > 0`
- `Failures = 0`
- 検索、仮想スクロール、preview open / close がtimeoutしない

実行後、必要に応じて以下を確認します。

```bash
find apps/desktop/test-results -name dev-metrics-snapshot.txt -print
npm run verify:dev-metrics-snapshot
```

`desktop-e2e` workflow では dense fixture E2E の直後に `verify:dev-metrics-snapshot` を実行し、snapshot の欠落、`List calls = 0`、`Failures > 0` を release-ready ではない状態として失敗させます。

## 計測ベンチ

実装変更の before / after は、機能確認用の `e2e:dense` とは分けて次のコマンドで測定します。

```bash
cd apps/desktop
npm run perf:benchmark
```

固定条件:

- packaged macOS arm64 app
- E2E fixture 2,000 assets
- viewport 1,440 x 900
- 120 frame の gallery 往復スクロール
- warm-up 1回後に5回測定し、代表値は各指標の中央値

結果は `apps/desktop/test-results/**/performance-benchmark.json` に保存されます。

主な指標:

- `frameMedianMs` / `frameP95Ms` / `frameMaxMs`: `requestAnimationFrame` 間隔
- `overBudgetFrameRate`: 実測frame budgetの1.5倍を超えた割合
- `layoutCount` / `layoutDurationMs`: Chromium rendererのlayout回数と時間
- `recalcStyleDurationMs` / `scriptDurationMs` / `taskDurationMs`: style、script、main-thread taskの時間
- `renderedCardMax`: 仮想化中に同時描画された最大card数
- `scrollHeightDriftPx`: 同一データのスクロール中に変動したscroll height

ベンチマークは、全件描画への退行を防ぐため `renderedCardMax <= 100`、仮想化geometryの不整合を防ぐため `scrollHeightDriftPx <= 1` を検証します。時間指標はhardware、display refresh rate、電源状態の影響を受けるため、同一Mac・同一display・同一電源条件で比較し、逐次JSONはcommitせずPRまたはIssueへ要約を残します。

## 手動スポットチェック

大きなUI変更、gallery layout、preview cache、search index に関わる変更では、必要に応じて手動でも確認します。

```bash
cd apps/desktop
LUMABIN_E2E_FIXTURE_ASSET_COUNT=1000 npm run dev:e2e
```

確認観点:

- 検索を3回以上実行して、入力と結果更新が詰まらない
- gallery を上下に高速スクロールして、カード表示やヘッダーが崩れない
- image / video / PDF / CSV preview を開閉して、フォーカスとスクロール位置が破綻しない
- Workspace Settings > Dev metrics で `Failures` が増えていない

## 実profile計測

実profile計測は公開fixtureでは代替できないネットワーク特性を確認したい場合だけ実施します。

```bash
cd apps/desktop
npx electron-forge start -- --remote-debugging-port=9334
```

別ターミナル:

```bash
cd apps/desktop
npm run perf:real-profile:attach
```

注意:

- upload / delete / rename / move / settings save は実行しない
- `PUT calls = 0` と `Uploaded bytes = 0` を確認する
- repo、issue、PRへ貼る場合は profile 名、bucket 名、object key、検索語を匿名化する

## 劣化時の扱い

以下に該当する場合は、[Performance issue](https://github.com/satoooh/lumabin/issues/new?template=bug_report.yml) として起票します。

- dense fixture E2E が安定して失敗する
- `Failures` が増加する
- gallery scroll で目立つ固まりやレイアウト崩れがある
- preview open / close がtimeoutする
- cache / index 変更後に検索やpreviewが明確に遅くなる
