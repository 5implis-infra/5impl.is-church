## Context

ADR-011 established `AGENTS.md` as the canonical filename. The root `AGENTS.md` title was updated. Most active references are already fixed. `docs/DOCUMENTATION_ROADMAP.md` is a live roadmap document still referencing the old name.

## Goals / Non-Goals

**Goals:**
- Replace all `AGENTE.md` text references with `AGENTS.md` in `docs/DOCUMENTATION_ROADMAP.md`

**Non-Goals:**
- No file renaming — the physical file is already correctly named `AGENTS.md`
- No changes to archived artifacts in `openspec/changes/archive/`
- No spec-level changes

## Decisions

**Simple text replacement only**

Replace every occurrence of `AGENTE.md` with `AGENTS.md` in `docs/DOCUMENTATION_ROADMAP.md`. This is purely editorial — the meaning stays identical.

## Risks / Trade-offs

None — trivial change with no side effects.

## Migration Plan

1. Replace all `AGENTE.md` → `AGENTS.md` in `docs/DOCUMENTATION_ROADMAP.md`
2. Verify no other active files need updates
3. Commit

## Open Questions

(none)