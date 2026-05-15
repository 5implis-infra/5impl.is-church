## Why

The OpenSpec `architecture-driven` schema fails CLI validation with "Invalid dependency reference in artifact 'architecture-doc': 'scope' does not exist" — because the artifact that generates `scope.md` is named `proposal`, but `architecture-doc` requires `scope`. Additionally, the skill rules in `openspec/config.yaml` are misaligned: `design` enforces frontend skills for all changes regardless of scope, `adr` mandates C4 for purely textual decisions, and `architecture-doc` has no skill rule at all. These gaps and mismatches reduce the schemas' reliability and cause confusion during artifact generation.

## What Changes

- Rename `id: proposal` to `id: scope` in `architecture-driven/schema.yaml` to fix the broken dependency reference and make the artifact ID match its output file
- Update the path routing table in `architecture-driven/schema.yaml` and `scope.md` template:
  - Architecture Concern: `docs/concerns/<name>.md` (from `docs/concerns/<name>/ARCHITECTURE.md`)
  - Bounded Context: `docs/bounded-contexts/<name>.md` (from `docs/contexts/<name>/domain-model.md`)
- Add `architecture-doc:` rule to `openspec/config.yaml` requiring `arc42-documentation` skill, with `c4-architecture` permitted when diagrams add value
- Refine `design:` rule in `openspec/config.yaml` to keep `c4-architecture` mandatory and make frontend/site/design-system skills conditional on change type
- Remove `c4-architecture` from the mandatory `adr:` rule; keep only `architecture-decision-records`
- Document that `docs/concerns/` and `docs/bounded-contexts/` live in the monorepo root only — subprojects use `<subproject>/docs/ARCHITECTURE.md` and `<subproject>/docs/adrs/`
- Update ADR 010 to add rows for the new `docs/concerns/` and `docs/bounded-contexts/` documentation types
- Adapt the `arc42-documentation` skill to write to schema-resolved paths instead of the hardcoded `docs/architecture/arc42/`

## Capabilities

### New Capabilities

(None — this change modifies infrastructure tooling, not product behavior.)

### Modified Capabilities

(None — no spec-level behavior changes. Schema configuration and documentation structure only.)

## Impact

- `openspec/schemas/architecture-driven/schema.yaml` — artifact ID rename, path routing updates
- `openspec/schemas/architecture-driven/templates/scope.md` — path routing table update
- `openspec/schemas/architecture-driven/README.md` — scope guidance for concerns/contexts location
- `openspec/config.yaml` — new `architecture-doc` rule, refined `design` and `adr` rules
- `docs/adrs/010-documentation-hierarchy-source-of-truth.md` — new documentation type rows
- `.agents/skills/arc42-documentation/SKILL.md` — output path adaptation (or fork if parameterization not feasible)