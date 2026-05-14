## 1. Update services/media-workflow/docs/ARCHITECTURE.md

- [x] 1.1 Replace "Control Plane" references → `services/media-workflow`
- [x] 1.2 Replace "System of Record" attribution → `services/api`
- [x] 1.3 Replace "Executor Plane (n8n)" → `infra/n8n`
- [x] 1.4 Replace "Build Plan JSON" → "EDL" (established term)
- [x] 1.5 Replace "Pipeline Manager / Planner" → `services/media-workflow`
- [x] 1.6 Replace "App do Filmmaker" → `apps/admin-app` / `apps/member-app`
- [x] 1.7 Remove stale ADR note referencing legacy split

## 2. Update services/media-workflow/AGENTS.md

- [x] 2.1 Remove note about future rename from `control-plane` → `media-workflow` (already done)

## 3. Update services/api/README.md

- [x] 3.1 Remove legacy `## Contexto` note about pre-organization founding (not present in current version)

## 4. Verify docs/ARCHITECTURE.md

- [x] 4.1 Verify pipeline table step 3 correctly shows `services/media-workflow` + `infra/n8n`
- [x] 4.2 Verify no remaining "control-plane" terminology in root docs (only in this change's own roadmap entry)

## 5. Commit

- [ ] 5.1 Commit each submodule's changes
- [ ] 5.2 Update parent submodule pointers