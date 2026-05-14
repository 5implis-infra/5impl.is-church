## 1. Create Structure

- [x] 1.1 Create `docs/adrs/` directory
- [x] 1.2 Create `docs/old/` directory
- [x] 1.3 Create empty `docs/CONSTITUTION.md` placeholder
- [x] 1.4 Create empty `docs/PRODUCT.md` placeholder
- [x] 1.5 Create empty `docs/DESIGN.md` placeholder

## 2. Populate ADRs from ARCHITECTURE.md

- [x] 2.1 Extract ADR-001 (Git submodules) from `docs/ARCHITECTURE.md` → `docs/adrs/001-git-submodules.md`
- [x] 2.2 Extract ADR-002 (Directory structure) → `docs/adrs/002-directory-structure.md`
- [x] 2.3 Extract ADR-003 (CI/CD) → `docs/adrs/003-ci-cd.md`
- [x] 2.4 Extract ADR-004 (Remote cache) → `docs/adrs/004-remote-cache.md`
- [x] 2.5 Extract ADR-005 (Site/saas separation) → `docs/adrs/005-site-saas-separation.md`
- [x] 2.6 Extract ADR-006 (Product multi-tenancy) → `docs/adrs/006-product-multi-tenancy.md`
- [x] 2.7 Extract ADR-007 (1 repo per component) → `docs/adrs/007-one-repo-per-component.md`
- [x] 2.8 Extract ADR-008 (API/media-workflow split) → `docs/adrs/008-api-media-workflow-split.md`
- [x] 2.9 Extract ADR-009 (n8n ownership) → `docs/adrs/009-n8n-ownership.md`
- [x] 2.10 Update `docs/ARCHITECTURE.md` to become an ADR index (remove inline ADRs, keep overview + references to `docs/adrs/*.md` for global ADRs: 001, 002, 003, 006, 007, 009)

## 3. Write New Canonical Docs

- [x] 3.1 Write `docs/CONSTITUTION.md`: identity, values, principles (informed by `AGENTS.md` context section)
- [x] 3.2 Write `docs/PRODUCT.md`: surfaces, modules, domain concepts — written from scratch using `docs/old/product-context.md` as reference only
- [x] 3.3 Write `docs/DESIGN.md`: visual/UX constitution — principles, token semantics, composition patterns, cross-cutting UX rules (no code, no token values)

## 4. Archive Legacy Docs

- [x] 4.1 Move `docs/context/product-context.md` → `docs/old/product-context.md`
- [x] 4.2 Move `docs/context/flow-midia.md` → `docs/old/flow-midia.md`
- [x] 4.3 Add "Archived — historical reference only" banner to each file in `docs/old/`
- [x] 4.4 Remove or leave empty `docs/context/` directory

## 5. Fix AGENTS.md Filename Inconsistencies

- [x] 5.1 Update root `AGENTS.md` title from `# AGENTE.md` to `# AGENTS.md`
- [x] 5.2 Fix root `README.md` link `[AGENTE.md](AGENTE.md)` → `[AGENTS.md](AGENTS.md)`
- [x] 5.3 Update all subproject `AGENTS.md` titles from `# AGENTE.md` to `# AGENTS.md`
- [x] 5.4 Fix any other references to `AGENTE.md` across the monorepo (grep for `AGENTE.md`)
- [x] 5.5 Update `openspec/specs/monorepo-agent-context/spec.md` to reference `AGENTS.md` instead of `AGENTE.md`

## 6. Add Specs Relacionados to Subproject AGENTS.md

- [x] 6.1 Add "Specs relacionados" section to root `AGENTS.md` linking relevant `openspec/specs/*.md`
- [x] 6.2 Add "Specs relacionados" section to each subproject `AGENTS.md` (22 submodules) linking relevant `openspec/specs/<capability>/spec.md`

## 7. Update OpenSpec Specs

- [x] 7.1 Update `openspec/specs/monorepo-agent-context/spec.md` to reference `AGENTS.md` canonical filename and reflect current doc structure
- [x] 7.2 Update `openspec/specs/project-initial-documentation/spec.md` if it still references `AGENTE.md`

## 8. Validation

- [x] 8.1 Run `openspec validate define-documentation-source-of-truth --type change --strict` before archiving
- [x] 8.2 Verify no broken links: check all `[AGENTS.md](AGENTS.md)` references resolve
- [x] 8.3 Verify no remaining `AGENTE.md` references anywhere in the monorepo (remaining: archived change artifacts, change's own artifacts referencing old name — expected)
- [x] 8.4 Verify each subproject `AGENTS.md` has: Propósito, O que NÃO faz, Pontos de integração, and Specs relacionados
- [x] 8.5 Verify `docs/old/` files are marked as archived and are not referenced as authoritative