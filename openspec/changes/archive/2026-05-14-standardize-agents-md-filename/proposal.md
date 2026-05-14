## Why

ADR-011 established `AGENTS.md` as the canonical filename for agent-context files. The root `AGENTS.md` title was updated to `# AGENTS.md`, and most active references were fixed. However, `docs/DOCUMENTATION_ROADMAP.md` (a live document, not an archived change) still contains `AGENTE.md` references that need to be updated to maintain consistency. No physical `AGENTE.md` file exists anywhere in the repository.

## What Changes

- Update `docs/DOCUMENTATION_ROADMAP.md` to replace all `AGENTE.md` references with `AGENTS.md`
- Verify no active files (outside `openspec/changes/archive/`) contain `AGENTE.md` references

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none — no spec-level behaviour changes, only textual references updated)

## Impact

- `docs/DOCUMENTATION_ROADMAP.md` — sole active file needing updates
- No code, APIs, or dependencies affected