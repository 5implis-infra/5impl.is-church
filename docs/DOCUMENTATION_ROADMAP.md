# Documentation Change Roadmap

This roadmap recovers the documentation refactor plan discussed during OpenSpec exploration. It exists to keep the sequence visible because the work spans many related changes.

## Status

- Active change: `define-documentation-source-of-truth`
- Schema: `intent-driven`
- Artifact status: proposal, design, specs, ADR, and tasks are complete
- Implementation status: not applied yet

## Guiding Decisions

- `AGENTS.md` is the canonical agent-context filename everywhere.
- `README.md` is the human entry point and quickstart.
- `AGENTS.md` is AI/developer context with boundaries, integrations, and minimal quick commands.
- `openspec/specs/` is the canonical requirements source.
- `docs/CONSTITUTION.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and `docs/DESIGN.md` are the active top-level documentation sources.
- `docs/context/*` is archived into `docs/old/`; active docs take precedence on conflict.
- `docs/DESIGN.md` captures design intent only; implementation lives in `packages/ui`.
- `docs/OPERATIONS.md` is not created at root; complex subprojects may have local `OPERATIONS.md` later.

## Recommended Change Sequence

### 1. `define-documentation-source-of-truth`

**Status:** artifacts complete; pending apply.

**Purpose:** Define documentation hierarchy, source-of-truth rules, ADR placement, and canonical `AGENTS.md` naming.

**Scope:**
- Create the governance rule for each document type.
- Record ADRs for documentation hierarchy and `AGENTS.md` canonical filename.
- Update delta specs for documentation source-of-truth and monorepo agent context.
- Produce implementation tasks.

**Done when:** all artifacts exist and are validated by OpenSpec.

### 2. `create-canonical-docs`

**Purpose:** Create and populate the new active top-level docs.

**Scope:**
- Create `docs/CONSTITUTION.md`.
- Create `docs/PRODUCT.md`.
- Create `docs/DESIGN.md`.
- Keep each file succinct and authoritative for only its own purpose.
- Use `docs/context/product-context.md` as reference only, not as source to copy wholesale.

**Depends on:** `define-documentation-source-of-truth`.

**Done when:** new docs exist, have clear ownership, and do not duplicate `README.md`, `AGENTS.md`, `ARCHITECTURE.md`, or OpenSpec specs.

### 3. `migrate-architecture-adrs`

**Purpose:** Convert inline ADRs in `docs/ARCHITECTURE.md` into standalone immutable ADR files.

**Scope:**
- Create `docs/adrs/001-*.md` through `docs/adrs/009-*.md` from current inline ADRs.
- Keep `docs/adrs/010-documentation-hierarchy-source-of-truth.md` and `docs/adrs/011-agents-md-canonical-filename.md`.
- Refactor `docs/ARCHITECTURE.md` into technical architecture plus ADR index/reference.
- Reference only globally relevant ADRs from `ARCHITECTURE.md`.

**Depends on:** `define-documentation-source-of-truth`.

**Done when:** ADRs are standalone, `ARCHITECTURE.md` no longer owns ADR bodies, and links are valid.

### 4. `archive-legacy-context-docs`

**Purpose:** Move stale context docs out of the active documentation path.

**Scope:**
- Move `docs/context/product-context.md` to `docs/old/product-context.md`.
- Move `docs/context/flow-midia.md` to `docs/old/flow-midia.md`.
- Add an archive banner stating files are historical reference only.
- Remove or leave empty `docs/context/` according to final implementation preference.

**Depends on:** `create-canonical-docs`.

**Done when:** archived files cannot be mistaken for authoritative docs.

### 5. `standardize-agents-md-filename`

**Purpose:** Finish the migration from `AGENTS.md` wording to `AGENTS.md` everywhere.

**Scope:**
- Update root `AGENTS.md` title.
- Update all subproject `AGENTS.md` titles.
- Fix root `README.md` link from `AGENTS.md` to `AGENTS.md`.
- Fix all textual references to `AGENTS.md` in docs and OpenSpec specs.
- Ensure no physical `AGENTS.md` file exists.

**Depends on:** `define-documentation-source-of-truth`.

**Done when:** repository search for `AGENTS.md` returns no active references.

### 6. `refactor-root-readme-and-agents`

**Purpose:** Separate root human onboarding from root AI/developer context.

**Scope:**
- Refactor root `README.md` as concise human quickstart: what this repo is, setup, commands, and links.
- Refactor root `AGENTS.md` as agent/developer context: domain, modules, ownership, stack, TBDs, code patterns, and minimal commands.
- Add links from root `AGENTS.md` to relevant `openspec/specs/`.
- Avoid duplicating the detailed content of `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, or `docs/DESIGN.md`.

**Depends on:** `create-canonical-docs`, `standardize-agents-md-filename`.

**Done when:** root `README.md` and root `AGENTS.md` have distinct purposes and no stale `AGENTS.md` references.

### 7. `standardize-subproject-readmes`

**Purpose:** Make README files consistent across the 22 subprojects while keeping them human-facing.

**Scope:**
- Update READMEs for apps, services, workers, packages, and infra subprojects.
- Keep local context short: what it is, how to run/test if applicable, and key links.
- Avoid repeating global architecture/product/design content.
- Link to local `AGENTS.md` and relevant global docs.

**Depends on:** `refactor-root-readme-and-agents`.

**Done when:** every subproject README has a predictable human-facing shape and avoids global duplication.

### 8. `standardize-subproject-agents`

**Purpose:** Make each subproject `AGENTS.md` useful as local AI context without forcing a rigid template.

**Scope:**
- Update 22 subproject `AGENTS.md` files.
- Ensure minimum sections: `Propósito`, `O que NÃO faz`, `Pontos de integração`, and `Specs relacionados`.
- Link to relevant `openspec/specs/<capability>/spec.md` files.
- Keep subproject-specific boundaries explicit.

**Depends on:** `standardize-agents-md-filename`, `refactor-root-readme-and-agents`.

**Done when:** every subproject `AGENTS.md` has the minimum sections and points to relevant specs instead of restating requirements.

### 9. `reconcile-infra-and-media-workflow-docs`

**Purpose:** Resolve remaining stale terminology and ownership conflicts around infra, n8n, and media workflow.

**Scope:**
- Clarify `infra/` ownership: `infra/n8n`, `infra/docker`, `infra/deploy`, and `infra/postgres`.
- Reconcile `services/media-workflow` docs with the latest decision that it has its own API and DB for jobs/workflows.
- Remove stale `control-plane` terminology unless explicitly retained as an internal architecture term.
- Clarify n8n as workflow executor/orchestrator integration, not the owner of product/media job state.
- Resolve `packages/db` vs `services/media-workflow` documentation conflict about direct DB imports.

**Depends on:** `migrate-architecture-adrs`, `standardize-subproject-agents`.

**Done when:** infra and media-workflow docs agree on ownership, API boundaries, database ownership, and terminology.

## Parking Lot

These may become future changes, but were not part of the recovered core 9-change roadmap.

- `openspec-capability-specs-migration`: create formal OpenSpec specs for product capabilities beyond documentation.
- `documentation-lint-checks`: add CI or scripts to detect stale `AGENTS.md`, broken doc links, missing AGENTS sections, or active docs linking to `docs/old/` as authoritative.
- `subproject-operations-docs`: add local `OPERATIONS.md` only to subprojects with complex independent operations.

## Suggested Execution Rule

Create one OpenSpec change at a time, in the order above. Keep each change small enough to review independently. Do not start implementation for a later change until its proposal/design/spec/tasks are complete.
