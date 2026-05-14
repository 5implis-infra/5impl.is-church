## Context

Architectural sessions — defining auth strategy, multi-tenancy isolation model, bounded context boundaries — currently have no dedicated OpenSpec workflow. The `intent-driven` schema is designed for implementation changes: it produces delta specs, code tasks, and expects an `apply` phase that writes code. When used for architecture sessions it forces irrelevant artifacts and misroutes output to `openspec/changes/` instead of `docs/`.

This design specifies the `architecture-driven` schema: a 4-artifact workflow that routes documentation output to the correct locations in `docs/` based on the change type, and uses arc42 as the structural framework for each document.

Existing ADRs are all product-scoped. None constrain this schema design.

## Goals / Non-Goals

**Goals:**
- Schema with correct artifact DAG for architectural documentation sessions
- Explicit routing: one artifact (`scope`) resolves the change type and target path before any document is written
- arc42-structured documentation per type (relevant sections only)
- Dual ADR path: global (`docs/adrs/`) or subproject-local (`[subproject]/docs/adrs/`)
- Doc-only apply phase — no code, no worktree required

**Non-Goals:**
- Replacing `/opsx:explore` (native pre-change exploration remains unchanged)
- Enforcing doc path via CLI (routing is instruction-level, not OpenSpec-engine-level)
- Changes to `intent-driven` or `config.yaml`

## Decisions

### D1 — 4-artifact DAG: `scope → architecture-doc → adr → tasks`

```
scope ──→ architecture-doc ──→ adr ──→ tasks ──→ [apply]
```

**Why 4, not fewer:** Each artifact has a distinct responsibility that cannot be collapsed without losing traceability. `scope` decides WHERE to write before any writing begins. `architecture-doc` writes the document. `adr` extracts decisions into immutable records. `tasks` handles dependent doc updates (C4 diagrams, cross-links, subproject files).

**No `explore` artifact:** `/opsx:explore` is native to OpenSpec — a pre-change mode, not a schema artifact. The schema starts at `scope`.

---

### D2 — `scope` as an explicit routing artifact

**Decision:** First artifact produces `scope.md` — a short decision document that answers three questions: (1) What type is this change? (2) What is the target path? (3) Who is affected?

**Why separate artifact:** The routing logic has three branches with different path and section conventions. Encoding it inside `architecture-doc`'s instruction creates a hidden decision point — the user cannot review or correct it before the document is written. As an artifact, `scope.md` is reviewable, correctable, and traceable in `openspec status`.

**Three change types and their target paths:**

| Type | Example | Target path |
|---|---|---|
| Architecture Concern | auth strategy, multi-tenancy | `docs/concerns/<name>/ARCHITECTURE.md` |
| Bounded Context | billing, notifications | `docs/contexts/<name>/domain-model.md` |
| Subproject-local | api request lifecycle | `[subproject]/docs/ARCHITECTURE.md` |

---

### D3 — arc42 relevant sections per change type

**Decision:** Do not require all 12 arc42 sections. Each change type uses the subset that fits.

| Type | Sections |
|---|---|
| Architecture Concern | §Scope, §Current State, §Decision, §Consequences, §Per-subproject implications |
| Bounded Context | §Ubiquitous Language, §Aggregates, §Context Map, §Integration points |
| Subproject-local | §Context, §Decisions, §Components affected |

**Why not all 12:** arc42 full form is designed for entire system documentation. Individual concern or context documents need only the sections that answer the relevant architectural questions.

---

### D4 — Two ADR destination paths

**Decision:** The `adr` artifact writes to `docs/adrs/` for global decisions and to `[subproject]/docs/adrs/` for decisions local to one subproject. The target is resolved from `scope.md`.

**Global ADR** (Architecture Concern or cross-subproject Bounded Context): `docs/adrs/<nnn>-<name>.md`
**Local ADR** (Subproject-local or bounded-context whose decisions are entirely within one subproject): `[subproject]/docs/adrs/<nnn>-<name>.md`

**Sequence number:** monotonic within its ADR directory, independent of the other directory.

---

### D5 — Doc-only apply phase

**Decision:** `apply` requires `[tasks]`, tracks `tasks.md`. The apply instruction writes documents to `docs/` target paths — no worktree, no Superpowers skills, no subagent-driven-development.

**Why no worktree:** Architectural documentation is not code. Merge conflicts on ARCHITECTURE.md are textual and can be resolved without an isolated branch. Worktrees add setup overhead disproportionate to the risk.

`plan` artifact from `intent-driven` is not included in `architecture-driven`. There are no TDD micro-steps for documentation.

## Risks / Trade-offs

- [Path routing is instruction-level only] → OpenSpec CLI cannot enforce it. Mitigation: `scope.md` makes the routing decision explicit and reviewable before `architecture-doc` is written. The `verify` step (if added later) can check that files landed in the expected path.
- [arc42 sections are prescriptive but might not fit every case] → Mitigation: instructions mark sections as "include if relevant" — authors can omit empty sections without breaking the schema.
- [ADR sequence number conflict between global and local directories] → Mitigation: sequence is per-directory; each directory maintains its own monotonic counter.

## Migration Plan

New schema directory — no migration required. Existing changes using `intent-driven` are unaffected. To use the new schema:
```bash
openspec new change "auth-strategy" --schema architecture-driven
```

## Open Questions

None.
