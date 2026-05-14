## Why

The `define-documentation-source-of-truth` change created three new canonical docs (`docs/CONSTITUTION.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`) and archived stale context docs. During validation against `docs/old/product-context.md`, we found that `PRODUCT.md` omits details present in the draft that are worth preserving as a reference. The three new docs also lack cross-links, and no file tracks the gap between current `PRODUCT.md` scope and the fuller product vision. This change addresses those gaps.

## What Changes

- Create `docs/draft/product-backlog.md` capturing omitted draft content not yet in `PRODUCT.md` or OpenSpec specs
- Add cross-links from `PRODUCT.md` to `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `AGENTS.md`
- Add cross-links from `CONSTITUTION.md` to `docs/PRODUCT.md` and `docs/DESIGN.md`
- Add cross-links from `DESIGN.md` to `docs/PRODUCT.md` and `packages/ui`
- Verify that `PRODUCT.md`, `CONSTITUTION.md`, and `DESIGN.md` do not duplicate each other's content
- Add "Specs relacionados" section to root `AGENTS.md` linking to `openspec/specs/`

## Capabilities

### New Capabilities

- `documentation-validation`: Documents the process of validating new canonical docs for consistency, completeness, and cross-referencing. Ensures each doc stays within its own purpose and does not duplicate content.

### Modified Capabilities

- (none)

## Impact

- New file: `docs/draft/product-backlog.md`
- Updated files: `docs/PRODUCT.md`, `docs/CONSTITUTION.md`, `docs/DESIGN.md`, `AGENTS.md`
- No code or API changes
- No breaking changes