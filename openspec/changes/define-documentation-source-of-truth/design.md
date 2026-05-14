## Context

The AD Ponte SaaS monorepo contains 22 subprojects across apps, services, workers, and packages. Documentation currently suffers from:

- **Naming inconsistency**: `AGENTS.md` files titled "AGENTE.md"
- **No clear source-of-truth**: no defined hierarchy for which doc is authoritative for what
- **Conflicting content**: `docs/context/product-context.md` and `docs/context/flow-midia.md` contradict current architecture on n8n ownership and `control-plane` terminology
- **Duplication**: subproject READMEs and AGENTS files repeat global architecture content instead of referencing canonical sources
- **Stale artifacts**: `docs/context/` files labeled as drafts from 2026-04
- **No ADR separation**: 9 ADRs inline in `docs/ARCHITECTURE.md` with no migration path to `docs/adrs/`

All 9 ADRs in `docs/ARCHITECTURE.md` are **globally significant** (git submodules, directory structure, CI/CD, product decision, API/media-workflow split). The "global vs local" filter applies to future ADRs, not these — all 9 should move to `docs/adrs/` with the global ones referenced in `ARCHITECTURE.md`.

## Goals / Non-Goals

**Goals:**

- Establish a clear, enforceable documentation hierarchy where each document has exactly one purpose
- Eliminate naming inconsistencies (`AGENTE.md` → `AGENTS.md` everywhere)
- Remove stale conflicting content from active documentation
- Define a sustainable model where docs are authoritative, non-redundant, and point to each other appropriately
- Enable OpenSpec specs as canonical requirements that AGENTS.md files reference, not repeat

**Non-Goals:**

- Not rewriting all documentation content from scratch — only restructuring ownership
- Not enforcing overly rigid templates — loose structure with minimum bars where appropriate
- Not creating a design system implementation in `docs/DESIGN.md` — that lives in `packages/ui`
- Not moving `docs/context/*` content into new docs — archive as-is, write new docs from product understanding

## Decisions

### Decision 1: Document Hierarchy and Ownership

Each document has a single, unambiguous purpose:

| File/Dir | Purpose | Is Source of Truth For |
|---|---|---|
| `docs/CONSTITUTION.md` | Identity, values, principles, why we exist | Product identity and non-negotiable principles |
| `docs/PRODUCT.md` | What we build: surfaces, modules, features, domain concepts | Product functionality at macro level |
| `docs/ARCHITECTURE.md` | Technical architecture, system diagram, stack, deployment, global ADR references | Technical structure — but ADRs themselves live in `docs/adrs/` |
| `docs/DESIGN.md` | Visual/UX constitution: principles, token semantics, composition patterns, cross-cutting UX rules | Design intent — implementation in `packages/ui` |
| `docs/adrs/*.md` | Immutable architectural decisions, one per file | Any architectural decision that warrants a record |
| `docs/old/` | Archived legacy docs | Historical reference only — never authoritative |
| `AGENTS.md` | AI/developer context: purpose, boundaries, integration points, minimal quick commands | How to understand and work with this component |
| `README.md` | Human entry point: what this thing is, how to run it, links to AGENTS | Getting started for humans |
| `openspec/specs/*.md` | Capability requirements and behavior | What each feature must do |

**Rule:** No document may claim to be authoritative for content that lives elsewhere. Docs point to each other, they don't duplicate.

### Decision 2: `docs/context/*` → `docs/old/`

- `docs/context/product-context.md` → `docs/old/product-context.md`
- `docs/context/flow-midia.md` → `docs/old/flow-midia.md`
- Both marked as archived/stale in their file headers
- On any conflict with new docs, **new docs take precedence**
- New `docs/PRODUCT.md` written fresh, informed by (not derived from) the archived content

### Decision 3: ADR Migration

- Create `docs/adrs/` directory
- Move ADR-001 through ADR-009 (all currently inline in `ARCHITECTURE.md`) to separate files: `docs/adrs/001-git-submodules.md` through `docs/adrs/009-api-media-workflow-split.md`
- Each ADR file: title, date, status, context, decision, consequences (self-contained)
- `docs/ARCHITECTURE.md` becomes an **index/summary** — it references only the ADRs that matter for understanding global architecture (ADR-001, 002, 003, 006, 007, 009) with links to `docs/adrs/`
- Non-global ADRs (e.g., ADR-004 Turborepo cache, ADR-005 Site separation) also move to `docs/adrs/` but are **not referenced** from `ARCHITECTURE.md` — they're available but not part of the architecture overview

### Decision 4: `AGENTS.md` Canonical Filename

- All agent-context files standardized as `AGENTS.md` (not `AGENTE.md`)
- Update every file's `# AGENTE.md` title to `# AGENTS.md`
- Fix every link pointing to `AGENTE.md`
- Update `openspec/specs/monorepo-agent-context/spec.md` to reflect `AGENTS.md` as the required filename

### Decision 5: Root `README.md` vs `AGENTS.md`

- `README.md` = human entry point: what is this repo, how to clone/setup, key links (to `AGENTS.md`, `docs/`, `openspec/specs/`)
- `AGENTS.md` = AI context: architecture summary, domain concepts, module list, ownership map, TBDs, **minimal quick commands section**
- Keep them clearly separated — README never tries to be comprehensive, AGENTS never duplicates README's quickstart

### Decision 6: Subproject `AGENTS.md` — Loose Structure

Minimum required sections:

1. **Propósito** — what this component does
2. **O que NÃO faz** — clear non-responsibilities (critical for boundaries)
3. **Pontos de integração** — what it talks to (services, packages, external systems)

Beyond these three, free-form. Each subproject AGENTS may include: local commands, environment variables, specific patterns, caveats. Template is a minimum bar, not a cage.

Each subproject `AGENTS.md` should include a **"Specs relacionados"** section linking to `openspec/specs/` for relevant capabilities.

### Decision 7: Subproject `README.md` — Light Context + Ops

- 2-3 sentence description of what this project is
- Setup, run, test commands
- Links to: `AGENTS.md` (deeper context), `openspec/specs/` (requirements), relevant `docs/` files

### Decision 8: `docs/DESIGN.md` — Strategy, Not Implementation

`docs/DESIGN.md` at root covers:

- **Visual principles**: brand personality, color philosophy, typography voice
- **Global token semantics**: what design tokens mean conceptually (not hex values)
- **Composition patterns**: how components combine, spacing philosophy
- **Cross-cutting UX rules**: interaction patterns that apply across all surfaces

**Does NOT include**: code snippets, component APIs, token values — those live in `packages/ui` as the implementation.

### Decision 9: `docs/OPERATIONS.md` — Only Where Needed

- **No root `docs/OPERATIONS.md`**
- Only subprojects with genuinely complex or independent operations get their own `OPERATIONS.md` (e.g., `services/api`, `services/media-workflow`)
- Most subprojects: `README.md` (ops) + `AGENTS.md` (context) is sufficient

### Decision 10: `openspec/specs/` as Canonical Requirements

- `openspec/specs/<capability>.md` is the authoritative spec for each capability
- Subproject `AGENTS.md` files **point to relevant specs** via inline links under a "Specs relacionados" section
- Specs answer "what must this feature do?"; AGENTS.md answers "what does this component do and how does it relate?"

## Risks / Trade-offs

- **[Risk]** `docs/old/` may accumulate if teams archive docs but never clean up → **Mitigation:** Review `docs/old/` quarterly; content that becomes relevant again should be promoted, not left archived
- **[Risk]** Without enforcement, docs may drift back into duplication patterns → **Mitigation:** This change establishes the rule; a linter or CI check could enforce no-duplication in a later change
- **[Risk]** Subproject AGENTS.md may become stale if teams don't update when adding integrations → **Mitigation:** Loose structure reduces friction to update; "O que NÃO faz" is the most critical section for AI correctness
- **[Trade-off]** `docs/PRODUCT.md` written fresh means institutional knowledge in `docs/context/product-context.md` may be lost if not explicitly captured → **Mitigation:** `docs/old/product-context.md` preserved for reference; writer of `PRODUCT.md` should consult it

## Migration Plan

1. **Phase 1 — Create new structure** (no content yet):
   - Create `docs/adrs/` directory
   - Create empty `docs/old/` directory
   - Create placeholder `docs/CONSTITUTION.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`

2. **Phase 2 — Populate content**:
   - Extract ADRs from `docs/ARCHITECTURE.md` into `docs/adrs/*.md`
   - Write `docs/PRODUCT.md` (informed by `docs/old/product-context.md`)
   - Write `docs/CONSTITUTION.md` (product identity, values, principles)
   - Write `docs/DESIGN.md` (strategic design constitution)

3. **Phase 3 — Cleanup**:
   - Move `docs/context/product-context.md` and `docs/context/flow-midia.md` to `docs/old/`
   - Update `docs/ARCHITECTURE.md` to be an index referencing `docs/adrs/`
   - Update all `AGENTS.md` filenames and titles
   - Fix all links (`AGENTE.md` → `AGENTS.md`, broken links)
   - Update `openspec/specs/monorepo-agent-context/spec.md`
   - Update subproject `README.md` and `AGENTS.md` to reference canonical sources

4. **Phase 4 — Validation**:
   - Verify no broken links remain
   - Verify no document duplicates content it should reference
   - Verify all `AGENTS.md` files are accessible and correctly titled

**Rollback:** If something goes wrong, `docs/old/` preserves the previous state. Git history provides additional safety net.

## Open Questions

- **Should we add a CI check that enforces no duplicate content between `docs/` and subproject `AGENTS.md`?** — Not in scope for this change, but worth a future linter rule.
- **Should `docs/context/` be deleted after archiving to `docs/old/`?** — Decision: keep `docs/context/` as empty directory (or delete entirely) after moving files. Presence of `docs/context/` may cause confusion if people assume it's still active.
- **Do we need a `docs/OPERATIONS.md` at root for monorepo-level ops (pnpm commands, turborepo, submodule workflow)?** — Current decision: no. If ops docs become complex at root level, revisit.