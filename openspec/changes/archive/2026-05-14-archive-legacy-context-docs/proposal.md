## Why

`docs/old/` contains 9 files moved from `docs/context/` during earlier refactoring, but only 2 have archive banners. The rest lack the banner making them appear as valid references. This creates confusion about which docs are authoritative and which are stale. We need a clean, unambiguous archive — files either have banners or are removed.

## What Changes

- Add archive banners to all remaining `docs/old/` files that lack them
- Remove `docs/old/` directory entirely (keeping only `docs/draft/` as the holding area per ADR-012)
- Merge `product-context.md` (still-relevant historical content) into `docs/draft/product-backlog.md`
- Remove `flow-midia.md` from `docs/old/` (superseded by `docs/adrs/009-n8n-ownership.md`)
- Keep no files in `docs/old/` — directory becomes empty or removed
- Verify `docs/context/` remains empty

## Capabilities

### New Capabilities
- `legacy-doc-archive-format`: Standardized format for archived docs (banner + redirect to authoritative source)

### Modified Capabilities
- (none)

## Impact

- Removes 9 files from `docs/old/`
- Updates `docs/draft/product-backlog.md` with merged `product-context.md` content
- No code or API changes