# ADR 0001: Use Issues for Tasks and Docs for Stable Decisions

- Status: Accepted
- Date: 2026-05-04

## Context

LumaBin was moved to a public OSS repository. During private development, planning notes, status logs, MVP issue breakdowns, performance logs, and release readiness notes were useful, but those documents became noisy once the project needed a concise public documentation set.

Public contributors need stable product intent, requirements, architecture, operation, and performance guidance. They do not need completed work logs in the repository.

## Decision

Use GitHub Issues for implementation tasks, open questions, investigation notes, and ongoing follow-up work.

Use repository documents for durable information:

- Product intent: `docs/PRD.md`
- Current requirements and acceptance criteria: `docs/REQUIREMENTS.md`
- Architecture boundaries: `docs/ARCHITECTURE.md`
- Operation and release procedures: `docs/RUNBOOK.md`
- Roadmap themes: `docs/ROADMAP.md`
- Performance benchmark procedure: `docs/PERFORMANCE.md`
- Accepted architecture decisions: `docs/adr/`

Completed work logs are not kept as permanent repository documents. Important outcomes should be folded into the durable documents above, GitHub Releases, PRs, commits, or closed Issues.

## Consequences

- The documentation set stays small enough for contributors to read before making changes.
- Historical work details remain discoverable through Issues, PRs, commits, and Releases.
- Large design choices can be preserved as ADRs without turning Issues into permanent architecture documentation.
