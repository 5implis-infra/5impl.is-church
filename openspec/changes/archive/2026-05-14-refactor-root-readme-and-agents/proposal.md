## Why

The root `README.md` and `AGENTS.md` both suffer from content that belongs in other canonical docs. `README.md` line 1 ("SaaS multi-tenant para gestão de igrejas") is nearly verbatim duplicate of `docs/PRODUCT.md` line 3. `AGENTS.md` "Stack por Camada" duplicates `docs/ARCHITECTURE.md`. This violates the non-duplication principle established by `documentation-source-of-truth` and `documentation-validation`.

## What Changes

- **README.md**: Replace product description one-liner with a single sentence positioning statement; keep only navigation content (component table, quickstart, command reference, links)
- **AGENTS.md**: Remove "Stack por Camada" section — it duplicates `docs/ARCHITECTURE.md`; replace with a pointer to that doc; keep "Specs Relacionados" section as-is since it serves a different purpose

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `monorepo-root-readme`: Updated to clarify navigation-only scope — no product description content
- `monorepo-agent-context`: Remove stack table duplication

## Impact

- `README.md` — revised one-liner
- `AGENTS.md` — reduced by ~25 lines (stack table removed)
- No code, APIs, or dependencies affected