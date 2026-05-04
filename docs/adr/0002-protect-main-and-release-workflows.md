# ADR 0002: Protect Main and Release Workflows

- Status: Accepted
- Date: 2026-05-04

## Context

LumaBin is a public repository that builds a downloadable macOS application. Public repositories need stronger protection around the default branch, dependency updates, GitHub Actions permissions, and release publishing because workflow changes and release assets affect the software supply chain.

## Decision

Protect `main` with pull-request based changes, required CI, no force pushes, and no branch deletion.

Keep workflow `GITHUB_TOKEN` permissions read-only by default. Grant `contents: write` only to the release publishing job.

Run the primary CI and repository hygiene workflows on every pull request and `main` push so required checks are always created. This avoids required-check deadlocks caused by path-filtered workflows.

Use Dependabot for npm and GitHub Actions updates. Use CODEOWNERS for high-risk paths such as workflows, dependency lockfiles, release scripts, and ADRs.

Publish releases through a protected `release` environment and protect `v*` tags with repository rules.

## Consequences

- Pull requests may consume more GitHub Actions minutes because core checks always run.
- The release workflow has an explicit approval boundary before publishing assets.
- Supply-chain sensitive changes are easier to detect and review before they reach `main`.
