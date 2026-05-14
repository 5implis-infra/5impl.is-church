## 1. Create docs/draft/product-backlog.md

- [x] 1.1 Create `docs/draft/` directory (if not exists)
- [x] 1.2 Write `docs/draft/product-backlog.md` with selected topics from `docs/old/product-context.md`:

- [x] 2.1 Add "See also" section at end of `docs/PRODUCT.md` with links to:

- [x] 3.1 Add "See also" section at end of `docs/CONSTITUTION.md` with links to:

- [x] 4.1 Add "See also" section at end of `docs/DESIGN.md` with links to:

- [x] 5.1 Add "Specs relacionados" section to root `AGENTS.md` after the "Conceitos de Domínio" or at end
- [x] 5.2 Link to relevant `openspec/specs/<capability>/spec.md` files:

## 6. Validation

- [x] 6.1 Verify no phrase/paragraph appears in more than one of: `docs/PRODUCT.md`, `docs/CONSTITUTION.md`, `docs/DESIGN.md`
- [x] 6.2 Verify all links in "See also" sections resolve to existing files
- [x] 6.3 Verify no circular references (A→B→C→A) in the cross-link network
- [x] 6.4 Run `openspec validate create-canonical-docs --type change --strict` before archiving