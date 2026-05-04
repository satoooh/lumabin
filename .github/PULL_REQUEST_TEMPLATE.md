## Summary

- 

## Why

- 

## Validation

- [ ] `npm run smoke:ci`
- [ ] UI変更の場合: `npm run e2e`
- [ ] macOS配布物変更の場合: `npm run package:darwin` / `npm run verify:darwin-artifact`
- [ ] 未実行の検証があれば理由を書く

## Screenshots / Walkthrough

UI変更の場合は、機密情報を含まないfixtureで撮影した画像または動画を添付してください。

## Safety

- [ ] secret、private bucket 名、private object key、署名済みURL、個人データを含んでいない
- [ ] 永続データ形式、公開API、UX互換性に影響する変更はissueで合意済み
- [ ] 依存関係を追加・削除していない、またはissueで合意済み
