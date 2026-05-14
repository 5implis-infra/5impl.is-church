## Context

Several documentation inconsistencies exist between `services/media-workflow/docs/ARCHITECTURE.md`, the root `docs/ARCHITECTURE.md`, and ADR-009. The terminology used in the subproject doc (Control Plane, Executor Plane, Build Plan) doesn't match the established naming from ADR-009 and the root architecture doc.

## Goals / Non-Goals

**Goals:**
- Align `services/media-workflow/docs/ARCHITECTURE.md` terminology with ADR-009
- Remove stale `control-plane` rename note from `AGENTS.md`
- Remove legacy `## Contexto` note from `services/api/README.md`
- Ensure root `docs/ARCHITECTURE.md` correctly reflects ownership

**Non-Goals:**
- No changes to actual architecture or code
- No rewriting of `services/media-workflow/docs/ARCHITECTURE.md` — only terminology fixes
- No changes to n8n workflow JSON files

## Decisions

**1. services/media-workflow/docs/ARCHITECTURE.md — terminology mapping**

Replace old terminology with established terms (per ADR-009):

| Old term in subproject doc | Replace with |
|---|---|
| Control Plane | `services/media-workflow` |
| System of Record (attributed to Control Plane) | `services/api` (per ADR-009) |
| Executor Plane (n8n) | `infra/n8n` |
| Build Plan JSON | EDL (Edit Decision List) — the established term in root docs |
| Pipeline Manager / Planner | `services/media-workflow` (state machine owner) |
| App do Filmmaker | `apps/admin-app` or `apps/member-app` |

The document's domain model (MediaProduction, TargetAsset, Artifact, ProductionTask) is fine to keep — it's the internal domain model. Only the architectural layer terminology needs alignment.

**2. services/media-workflow/AGENTS.md — remove stale note**

Remove the note about future rename from `control-plane` to `media-workflow` — this happened already.

**3. services/api/README.md — remove legacy note**

The `## Contexto` section at the top of `services/api/README.md` says the API was created before some organizational decisions and carries over legacy context. This should be removed since ADR-009 now formally establishes the separation.

**4. docs/ARCHITECTURE.md — verify consistency**

The root ARCHITECTURE.md already correctly shows `services/media-workflow` + `infra/n8n` for orchestration step (step 3). No changes needed there, but verify the terminology is consistent with ADR-009.

## Risks / Trade-offs

- [Risk] Editing `services/media-workflow/docs/ARCHITECTURE.md` may lose useful architectural detail → Mitigation: only change terminology, preserve all domain model content

## Migration Plan

1. Edit terminology in `services/media-workflow/docs/ARCHITECTURE.md`
2. Remove stale note from `services/media-workflow/AGENTS.md`
3. Remove legacy `## Contexto` note from `services/api/README.md`
4. Verify `docs/ARCHITECTURE.md` consistency
5. Commit per submodule, then update parent pointers

## Open Questions

(none)