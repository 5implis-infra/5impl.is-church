## Agreed Scope

A dedicated OpenSpec schema for architectural documentation sessions. Covers Architecture Concerns (cross-cutting technical patterns: auth, multi-tenancy, observability), Bounded Contexts (business domains: billing, notifications), and Subproject-local architecture decisions. Output is always documentation in `docs/` — not code. The schema is independent of `intent-driven`; no changes to existing schemas.

## Key Constraints

- OpenSpec workflow commands are fixed (`/opsx:continue`, `/opsx:apply`, etc.) — the schema only defines artifacts and their `requires` graph
- No `optional:` field in OpenSpec schema.yaml — optionality is expressed via skip markers and `requires` chain
- Arc42 provides the documentation structure (relevant sections only, not all 12)
- "Where to document" rule must be encoded in artifact instructions, not enforced by the CLI
- `/opsx:explore` is native to OpenSpec (pre-change, no artifact) — schema starts at `scope`, not `explore`

## Alternatives Considered

| Alternative | Rejected because |
|---|---|
| Add "architecture mode" to intent-driven via config.yaml rules | Config applies to all schemas regardless of change type; cannot express different artifact DAGs |
| Single `architecture-doc` artifact (no `scope` pre-step) | Routing logic (cross-cutting vs. subproject vs. bounded-context) is complex enough to warrant its own decision artifact |
| Use C4 level (L1/L2/L3) as the primary taxonomy | C4 describes system structure; Architecture Concerns and Bounded Contexts are orthogonal axes — mixing them adds confusion |
| Domain-based subdirectories only (no concerns/ separation) | Architecture Concerns are cross-cutting and do not map 1:1 to bounded contexts; separate directories prevent misclassification |

## Chosen Direction

4-artifact schema: `scope → architecture-doc → adr → tasks`

- `scope` resolves the change type and target path before any document is written
- `architecture-doc` uses arc42 relevant sections, written to the path resolved by `scope`
- `adr` distills decisions to `docs/adrs/` (global) or `[subproject]/docs/adrs/` (local)
- `tasks` is a doc-update checklist (C4 diagram updates, cross-links, referenced subproject files)
- Apply phase is doc-only: no code, no worktree required

Doc path routing:
- Architecture Concern → `docs/concerns/<name>/ARCHITECTURE.md`
- Bounded Context → `docs/contexts/<name>/domain-model.md`
- Subproject-local → `[subproject]/docs/ARCHITECTURE.md`
- Global ADR → `docs/adrs/<nnn>-<name>.md`
- Local ADR → `[subproject]/docs/adrs/<nnn>-<name>.md`

## Open Questions

None — all scope and routing decisions are resolved.
