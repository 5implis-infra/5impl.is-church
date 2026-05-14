## Context

The root `AGENTS.md` has a "Specs Relacionados" section (created by an earlier change). The subproject `AGENTS.md` files don't have this section yet. We need to add it for consistency and to help AI agents understand which OpenSpec specs govern each subproject's behaviour.

## Goals / Non-Goals

**Goals:**
- Add "Specs Relacionados" section to all 22 subproject `AGENTS.md` files
- Follow the same format used in the root `AGENTS.md`

**Non-Goals:**
- No changes to `AGENTS.md` structure beyond adding the new section
- No content changes to existing sections (Propósito, O que este projeto NÃO faz, Pontos de integração)
- No addition of Specs Relacionados to packages that don't have AGENTS.md

## Decisions

**1. Section placement**

"Specs Relacionados" goes at the end of each `AGENTS.md`, after "Pontos de integração".

**2. Format**

```markdown
## Specs Relacionados

- [monorepo-agent-context](../../openspec/specs/monorepo-agent-context/spec.md) — AGENTS.md structure standard
- [documentation-validation](../../openspec/specs/documentation-validation/spec.md) — doc cross-linking requirements
```

**3. Which subprojects get the section**

All 22 subprojects that have `AGENTS.md`:
- `apps/admin-web`, `apps/admin-app`, `apps/member-app`
- `services/api`, `services/api-local`, `services/media-workflow`
- `workers/media/transcript`, `workers/media/ffmpeg`, `workers/media/davinci`, `workers/media/images`, `workers/media/telegram-bot`
- `workers/system/notifications`, `workers/system/sync`, `workers/system/scheduled-jobs`
- `packages/db`, `packages/ui`, `packages/auth`, `packages/core`, `packages/types`, `packages/config`, `packages/api-client`
- `infra/n8n`

## Risks / Trade-offs

- [Risk] Specs list may grow as more specs are created → Mitigation: include only the most directly relevant specs per subproject

## Migration Plan

1. Add "Specs Relacionados" section to each of the 22 `AGENTS.md` files
2. Commit per submodule
3. Update parent pointer commits

## Open Questions

(none)