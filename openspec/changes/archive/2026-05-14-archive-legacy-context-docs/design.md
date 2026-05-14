## Context

`docs/old/` holds 9 files moved from `docs/context/` in earlier refactoring. Two files (`flow-midia.md`, `product-context.md`) have archive banners from that migration. The other 7 lack banners, creating the false impression they are active references. ADR-012 established `docs/draft/` as the holding area for pre-formalization docs; `docs/old/` is not referenced by any ADR.

## Goals / Non-Goals

**Goals:**
- Add archive banners to all remaining `docs/old/` files lacking them (completing the work started by earlier migration)
- Empty `docs/old/` entirely since it has no ADR mandate
- Preserve valuable historical content from `product-context.md` by merging it into `docs/draft/product-backlog.md`

**Non-Goals:**
- No changes to `docs/draft/` structure beyond adding merged files
- No changes to any active documentation (`docs/adrs/`, `docs/ARCHITECTURE.md`, canonical docs)
- No code changes

## Decisions

**1. Archive-banner format for remaining files**

All 7 bannerless files in `docs/old/` get this banner at line 1:

```markdown
# Archived — historical reference only
> **Este documento foi movido para `docs/old/`. O conteúdo aqui está desatualizado e não deve ser usado como referência autoritativa. Para informação atual, consulte `docs/ARCHITECTURE.md` e `docs/adrs/*.md`.**
```

**2. Merge `product-context.md` content into `docs/draft/product-backlog.md`**

`product-context.md` (256 lines) contains valid historical product context. Content not already covered in `docs/PRODUCT.md` or `openspec/specs/` gets merged as a new section in `docs/draft/product-backlog.md` — specifically sections about multi-church structure, domain management, and access control patterns that are still conceptually relevant.

**3. Remove `flow-midia.md` from `docs/old/`**

`flow-midia.md` (129 lines) is superseded by `docs/adrs/009-n8n-ownership.md` which covers the same media pipeline with updated terminology. It will be deleted without merging.

**4. Remove `docs/old/` entirely**

With banners added and content redistributed, the directory becomes empty and should be removed from the filesystem. ADR-012 already designated `docs/draft/` as the holding area.

**5. Delete 7 files and the directory**

Files to delete after archiving:
- `docs/old/ai-flow.md` (superseded — workflow notation only, now in ARCHITECTURE.md)
- `docs/old/ARCHITECTURE-v1.md` (superseded by ARCHITECTURE_v2.md, then by current ARCHITECTURE.md)
- `docs/old/ARCHITECTURE_v2.md` (superseded by ARCHITECTURE.md)
- `docs/old/BACKLOG.md` (superseded by OpenSpec specs)
- `docs/old/EXECUTION-ROADMAP.md` (superseded by DOCUMENTATION_ROADMAP.md)
- `docs/old/mapa-mental.md` (superseded by ARCHITECTURE.md media pipeline section)
- `docs/old/PLAN.md` (superseded by CONSTITUTION.md + ARCHITECTURE.md)

## Risks / Trade-offs

- [Risk] Someone has local links to `docs/old/` files → Mitigation: links will 404 after removal; banner was the only value added anyway
- [Risk] `product-context.md` content overlaps with existing `product-backlog.md` → Mitigation: merge only non-duplicating sections

## Migration Plan

1. Add banners to 7 bannerless files in `docs/old/`
2. Merge `product-context.md` into `docs/draft/product-backlog.md`
3. Delete `docs/old/` directory and all 9 files
4. Verify `docs/context/` remains empty and `docs/old/` no longer exists
5. Commit with message referencing the change name

## Open Questions

(none)