## Why

Architectural sessions — decisions about authentication strategy, multi-tenancy models, bounded context boundaries — need a dedicated workflow. The existing `intent-driven` schema is optimized for implementation changes: it produces specs, tasks, and code. Architectural sessions produce documents (arc42-structured ARCHITECTURE.md files, ADRs, C4 diagrams) with little to no code output. Using `intent-driven` for these sessions misroutes output and forces irrelevant artifacts. A dedicated `architecture-driven` schema encodes the correct artifact sequence, doc routing rules, and reasoning discipline for architectural work.

## What Changes

- Add new schema `openspec/schemas/architecture-driven/` with 4 artifacts:
  - `scope` — determines change type (Architecture Concern / Bounded Context / Subproject-local) and resolves the target doc path before any writing begins
  - `architecture-doc` — main document using arc42 relevant sections, written to the resolved path in `docs/`
  - `adr` — decisions distilled from architecture-doc, written to the correct `adrs/` path (global or subproject-local)
  - `tasks` — checklist for updating related docs (C4 diagrams, referenced subproject files, cross-links)
- Add templates: `scope.md`, `architecture-doc.md`, `adr.md`, `tasks.md`
- Add `README.md` documenting the schema, path routing rules, and usage

## Capabilities

### New Capabilities

None — this change adds a new OpenSpec schema (tooling). No product behavior modifications; no delta specs in `openspec/specs/` required.

### Modified Capabilities

None.

## Impact

- `openspec/schemas/architecture-driven/` — new directory (schema.yaml + README.md + 4 templates)
- Doc output paths (written by the schema at runtime, not created now):
  - Architecture Concern → `docs/concerns/<name>/ARCHITECTURE.md`
  - Bounded Context → `docs/contexts/<name>/domain-model.md`
  - Subproject-local → `[subproject]/docs/ARCHITECTURE.md`
  - Global ADR → `docs/adrs/<nnn>-<name>.md`
  - Local ADR → `[subproject]/docs/adrs/<nnn>-<name>.md`
- No application code affected
- No changes to `intent-driven` schema or `config.yaml`
