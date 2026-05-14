# 012. Draft Documentation Lives Under docs/draft/

- Status: accepted
- Date: 2026-05-14

## Context

The `define-documentation-source-of-truth` change established `docs/CONSTITUTION.md`, `docs/PRODUCT.md`, and `docs/DESIGN.md` as the canonical active docs, with `docs/old/` as an archive. We identified pre-formalization content (product backlogs, exploratory drafts) that does not belong in active docs but needs a home before `docs/old/` is removed.

## Decision

`docs/draft/` is the holding area for pre-formalization documentation:

- **Scope:** drafts, backlogs, exploratory specs, deferred decisions
- **Authority:** not authoritative. Not linked as source of truth from active docs
- **Lifetime:** items here are promoted to `openspec/specs/` or deleted — they should not accumulate indefinitely
- **Naming:** files are human-readable, descriptive kebab-case names (`product-backlog.md`, `auth-exploration.md`)

Files in `docs/draft/` MAY be referenced from:
- `AGENTS.md` subproject docs (as "future work" or "deferred")
- OpenSpec change artifacts
- Code comments (occasionally)

Files in `docs/draft/` MUST NOT be referenced as authoritative from:
- `docs/PRODUCT.md`, `docs/CONSTITUTION.md`, `docs/DESIGN.md`
- Root `AGENTS.md`
- `README.md`

**Selection criteria for content to enter `docs/draft/`:**
1. Specific enough to guide future implementation (not vague ideas)
2. Not yet formalized in an OpenSpec capability spec
3. Not contradicted by current architecture or ADRs
4. At least 2-3 sentences of useful context

## Consequences

- Pre-formalization content has a clear home distinct from active docs and archived stale docs
- Backlog grows in `docs/draft/` without polluting canonical docs
- Quarterly review of `docs/draft/` is needed to promote or prune items
- `docs/old/` removal (planned) does not lose valuable draft content — it moves to `docs/draft/` first

## Related

- ADR-010: Documentation Hierarchy and Source-of-Truth
- `docs/DOCUMENTATION_ROADMAP.md` — tracks which deferred items exist