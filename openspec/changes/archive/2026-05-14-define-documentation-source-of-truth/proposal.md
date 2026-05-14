## Why

Documentation across the AD Ponte SaaS monorepo lacks clear ownership, consistent naming, and defined boundaries. Root `AGENTS.md` is titled "AGENTE.md" but lives as `AGENTS.md`. `docs/context/` files are stale drafts that conflict with current architecture. There's no clear rule for which document is authoritative for what, and subproject docs duplicate global content instead of pointing to canonical sources. This fragmentation causes confusion for AI agents and developers, drift between documents, and impediment to onboarding.

## What Changes

- Create `docs/CONSTITUTION.md` — identity, values, principles (stable reference)
- Create `docs/PRODUCT.md` — products, modules, domain concepts, principal features (succinct)
- Create `docs/DESIGN.md` — visual/UX constitution: principles, global token semantics, composition patterns, cross-cutting UX rules (implementation lives in `packages/ui`)
- Create `docs/ARCHITECTURE.md` — reference only ADRs relevant to global architecture
- Create `docs/adrs/` directory — move existing inline ADRs (ADR-001 to ADR-009) to separate immutable files; keep only globally-significant ADR references in `ARCHITECTURE.md`
- Archive `docs/context/product-context.md` and `docs/context/flow-midia.md` to `docs/old/` — new structure takes precedence on conflicts
- Standardize all agent-context files as `AGENTS.md` (not `AGENTE.md`); update all titles, links, and OpenSpec spec references accordingly
- Root `README.md` = human entry point (clone, quickstart, links); Root `AGENTS.md` = AI context (architecture, domain, boundaries) + minimal quick commands
- Subproject `README.md` = human ops (setup, run, test) + light context; Subproject `AGENTS.md` = loose structure (purpose, non-responsibilities, integration points) pointing to `openspec/specs/`
- `openspec/specs/<capability>.md` = canonical requirements; `AGENTS.md` files point to relevant specs
- `docs/OPERATIONS.md` only for subprojects with complex/independent operation (not at root)

## Capabilities

### New Capabilities

- `documentation-source-of-truth`: Formalizes which document is authoritative for what across the monorepo, establishing rules for document hierarchy, conflict resolution, and cross-referencing between `docs/`, `AGENTS.md`, `README.md`, and `openspec/specs/`

### Modified Capabilities

- `monorepo-agent-context`: Updated to reference `AGENTS.md` as canonical filename, new documentation hierarchy, and OpenSpec spec linking pattern

## Impact

- **New files created**: `docs/CONSTITUTION.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/adrs/*.md`
- **Files moved/archived**: `docs/context/*` → `docs/old/`
- **Files updated**: All `AGENTS.md` files (title, links), `README.md` files (links, scope), `openspec/specs/monorepo-agent-context/spec.md`
- **No implementation code affected** — purely documentation restructuring
- **OpenSpec specs**: `monorepo-agent-context` spec needs update to reflect `AGENTS.md` canonical name and spec-linking pattern