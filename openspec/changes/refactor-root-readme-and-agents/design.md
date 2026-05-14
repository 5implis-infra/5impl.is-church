## Context

`documentation-source-of-truth` and `documentation-validation` established that each canonical doc must own only its purpose and not duplicate content from other docs. `README.md` line 3 ("SaaS multi-tenant para gestão de igrejas — administração, comunicação e produção de mídia para igrejas com múltiplas filiais") is essentially the same as `docs/PRODUCT.md` line 3. `AGENTS.md` "Stack por Camada" table duplicates the same information in `docs/ARCHITECTURE.md`. Both files need to be tightened to their distinct purposes.

## Goals / Non-Goals

**Goals:**
- `README.md` becomes pure navigation: what it is, where to find components, quickstart, commands
- `AGENTS.md` becomes pure AI/developer context: domain, ownership, TBDs, patterns, specs links
- No duplication across any canonical doc pair

**Non-Goals:**
- No changes to component descriptions in `docs/ARCHITECTURE.md`
- No structural reorganization beyond removing duplicated content
- No changes to submodule `AGENTS.md` or `README.md` files

## Decisions

**1. README.md: replace one-liner with positioning statement**

Current line 3: "SaaS multi-tenant para gestão de igrejas — administração, comunicação e produção de mídia para igrejas com múltiplas filiais."

This is nearly verbatim `docs/PRODUCT.md` line 3: "SaaS multi-tenant para gestão de igrejas..."

Replace with something like: "Plataforma de gestão para igrejas com múltiplas filiais — admin, comunicação e mídia."

Minimal rewording to avoid duplication. The README keeps its navigation role; the PRODUCT doc owns the detailed product vision.

**2. AGENTS.md: remove "Stack por Camada" section**

The stack table (lines 144–169) duplicates `docs/ARCHITECTURE.md` "Stack por Camada" section. Remove it and replace with a pointer:

> "Stack tecnológica detalhada: ver [docs/ARCHITECTURE.md — Stack por Camada](docs/ARCHITECTURE.md#stack-por-camada)."

**3. Keep "Specs Relacionados" and "Comandos Essenciais" in AGENTS.md**

These serve purposes unique to AGENTS.md (spec discovery for AI agents, essential commands reference) and do not duplicate other canonical docs.

## Risks / Trade-offs

- [Risk] AI agents习惯了 AGENTS.md having full context in one place → Mitigation: AGENTS.md still has domain, ownership, TBDs, patterns, and specs. Stack table is the only removal.
- [Risk] Readers who relied on README for product description may miss PRODUCT.md → Mitigation: README already links to AGENTS.md; add explicit link to PRODUCT.md in README navigation section.

## Migration Plan

1. Update `README.md` one-liner (rewrite as positioning statement, add PRODUCT.md link)
2. Remove "Stack por Camada" from `AGENTS.md`, replace with pointer to ARCHITECTURE.md
3. Verify no duplication remains
4. Validate
5. Commit

## Open Questions

(none)