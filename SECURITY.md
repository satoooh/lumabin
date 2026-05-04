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

最初の stable release までは、最新の release candidate と main branch のみを
security fix の対象とします。
