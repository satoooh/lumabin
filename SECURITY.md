# Security Policy

## 脆弱性の報告

脆弱性が疑われる場合は、GitHub の private vulnerability reporting がこの
リポジトリで利用できるときは、その導線から非公開で報告してください。

private vulnerability reporting が利用できない場合は、悪用手順、資格情報、
token、private bucket 名、object key、ユーザーデータを含めず、影響範囲だけを
最小限に記載した GitHub issue を作成してください。

## 機密情報の扱い

public issue、pull request、ログ、artifact には、access key、secret key、
API token、Apple 署名資格情報、Cloudflare R2 の private bucket 名、
private object key、private content を含むスクリーンショット、ローカル
profile data を含めないでください。

## サポート対象

security fix は、最新の GitHub Release と `main` branch を対象にします。
古いRelease、fork固有変更、private bucket や実ユーザーデータを必要とする調査は
原則として対象外です。

## maintainer の対応方針

- 報告内容を確認し、影響範囲と再現性を整理します。
- 修正が必要な場合は、公開issueに詳細な悪用手順やsecretを出さずに修正します。
- Release が必要な場合は、GitHub Releases に修正版を公開し、`SHA256SUMS.txt` と
  `release-evidence.json` を添付します。
