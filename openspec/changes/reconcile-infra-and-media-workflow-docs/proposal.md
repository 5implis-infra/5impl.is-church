## Why

The `services/media-workflow/docs/ARCHITECTURE.md` uses terminology (Control Plane, Executor Plane, Pipeline Manager, Build Plan) that conflicts with the naming established in `docs/ARCHITECTURE.md` and the ADR-009 decision record. The `services/api` is the system of record, not `media-workflow`. Additionally, the `services/media-workflow/AGENTS.md` has a stale note about a future rename from `services/control-plane` — that rename already happened. These inconsistencies cause confusion for AI agents reading the documentation.

## What Changes

- Update `services/media-workflow/docs/ARCHITECTURE.md` terminology to match ADR-009 (services/api = system of record, media-workflow = event-driven orchestrator)
- Remove the stale rename note from `services/media-workflow/AGENTS.md`
- Ensure `docs/ARCHITECTURE.md` pipeline table correctly shows n8n as executor, not owner of job state
- Remove the `## Contexto` note from `services/api/README.md` (carried over from legacy `control-plane` era)

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none — documentation reconciliation only, no spec-level changes)

## Impact

- `services/media-workflow/docs/ARCHITECTURE.md` (terminology)
- `services/media-workflow/AGENTS.md` (stale note)
- `services/api/README.md` (legacy note)
- `docs/ARCHITECTURE.md` (terminology consistency check)