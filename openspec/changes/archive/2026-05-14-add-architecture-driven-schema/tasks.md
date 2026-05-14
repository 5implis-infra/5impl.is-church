## 1. Schema Directory and schema.yaml

- [x] 1.1 Create directory `openspec/schemas/architecture-driven/` and `openspec/schemas/architecture-driven/templates/`
- [x] 1.2 Create `schema.yaml` with metadata: `name: architecture-driven`, `version: 1`, `description`
- [x] 1.3 Add `scope` artifact: `requires: []`, `generates: scope.md`; instruction asks the 3 routing questions (change type, target path, affected subprojects/contexts) and writes scope.md with resolved path
- [x] 1.4 Add `architecture-doc` artifact: `requires: [scope]`, `generates: architecture-doc.md`; instruction reads scope.md → selects arc42 sections for the type → writes to `architecture-doc.md` (change dir draft) AND to the resolved target path from scope.md
- [x] 1.5 Add `adr` artifact: `requires: [architecture-doc]`, `generates: ../../../docs/adrs/*.md`; instruction reads architecture-doc.md → extracts durable decisions → reads existing ADRs in target directory for next sequence number → writes to global (`docs/adrs/`) or subproject-local (`[subproject]/docs/adrs/`) per scope.md; skip if no durable decisions (write `Skipped: no architectural decisions to record`)
- [x] 1.6 Add `tasks` artifact: `requires: [adr]`, `generates: tasks.md`; instruction produces a doc-update checklist (C4 diagram updates, cross-links in other ARCHITECTURE.md files, subproject docs that reference this concern/context)
- [x] 1.7 Add `apply` block: `requires: [tasks]`, `tracks: tasks.md`; instruction is doc-only (write files to target paths, no worktree, no Superpowers skills required)

## 2. Templates

- [x] 2.1 Create `templates/scope.md` — sections: Change Type (Architecture Concern / Bounded Context / Subproject-local), Target Path (resolved per routing rule), Affected Subprojects or Contexts, Acceptance Criteria
- [x] 2.2 Create `templates/architecture-doc.md` — three-section conditional structure with arc42 sections per type:
  - Concern: §Scope, §Current State, §Decision, §Consequences, §Per-subproject implications
  - Bounded Context: §Ubiquitous Language, §Aggregates, §Context Map, §Integration points
  - Subproject-local: §Context, §Decisions, §Components affected
- [x] 2.3 Create `templates/adr.md` — MADR-short format (same structure as `intent-driven`'s adr.md template: Title, Date, Status, Context, Decision, Consequences, Supersedes)
- [x] 2.4 Create `templates/tasks.md` — doc-update focused: sections for C4 diagram updates, cross-links in other architecture docs, subproject files to update, validation steps

## 3. README

- [x] 3.1 Create `README.md` covering: schema purpose, when to use vs `intent-driven`, artifact sequence (`scope → architecture-doc → adr → tasks`), path routing table (concern/context/subproject-local), arc42 section map per type, CLI usage examples (`openspec new change "auth-strategy" --schema architecture-driven`)

## 4. Validation

- [x] 4.1 Run `openspec schema validate architecture-driven` — confirm no validation errors
- [x] 4.2 Smoke test: `openspec new change "smoke-arch-test" --schema architecture-driven`; confirm `openspec status` shows `scope` as first READY artifact with correct DAG
- [x] 4.3 Delete smoke test change directory `openspec/changes/smoke-arch-test/`
- [x] 4.4 Run `openspec schemas` — confirm `architecture-driven` appears in the list alongside `intent-driven`
