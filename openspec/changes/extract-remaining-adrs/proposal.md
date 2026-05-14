## Why

`docs/ARCHITECTURE.md` contains inline ADR content (architecture decisions embedded in prose) that should be extracted into standalone ADR files under `docs/adrs/`. This enables version-controlled, single-responsibility ADR files that can be reviewed, cross-linked, and maintained independently.

## What Changes

- Extract inline ADR content from `docs/ARCHITECTURE.md` into standalone `docs/adrs/00N-*.md` files
- Map remaining unnumbered architecture decisions in `ARCHITECTURE.md` to new sequential ADR numbers (013+)
- Remove extracted inline content from `ARCHITECTURE.md`, leaving only a reference index
- Preserve all cross-links, dates, and decision rationale during extraction

## Actual Outcome

Extracted **6 new ADRs** (013–018) from the TBDs section of `docs/ARCHITECTURE.md`:
- ADR-013: Multi-Tenancy Database Isolation (schema-per-tenant)
- ADR-014: Authentication Library (Better Auth)
- ADR-015: Payment Gateway (Asaas)
- ADR-016: Notifications Stack (Resend + FCM + Evolution API)
- ADR-017: API-Local Stack (Hono Lite)
- ADR-018: Telegram Bot Language (Python)

## Capabilities

### New Capabilities
- `adr-extraction-tooling`: A script or convention (documented in ADR-012 appendix) for extracting inline ADR content from prose documents into standalone files

### Modified Capabilities
- (none — this is a documentation restructure, not a behaviour change)

## Impact

- `docs/ARCHITECTURE.md` becomes an index with references to standalone ADRs
- `docs/adrs/` grows from 12 to ~N files (exact count determined by content audit of `ARCHITECTURE.md`)
- No code, API, or runtime behaviour affected