## Context

The 22 subprojects currently have highly variable README formats. Two subprojects (`apps/admin-web`, `services/api`) have detailed multi-section READMEs with module lists, responsibilities, and integration tables. Most others have minimal one-liners or just a title block. There's no documented standard for what a subproject README should contain.

## Goals / Non-Goals

**Goals:**
- Define a minimal consistent structure for all subproject READMEs
- Update READMEs that deviate significantly from the pattern
- Ensure every README has: title line, one-liner, what it does, and key links

**Non-Goals:**
- No requirement to make all READMEs identical in length
- No addition of content not already present — this is structural standardization only
- No changes to submodule `AGENTS.md` files (covered by change #8)
- No changes to root `README.md` or `AGENTS.md`

## Decisions

**1. Required sections (in order)**

Every subproject README gets:

```markdown
# <subproject-path>

> One-liner describing what this component does.

## O que é

1-2 sentences on what this component does and its role in the system.

## Onde roda

One line on deployment/runtime environment.

## Veja também

- [AGENTS.md](./AGENTS.md) — local AI context
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — architecture reference
```

**2. Optional sections by subproject type**

For apps and services (runnable components):
```markdown
## Como executar

```bash
# local dev
pnpm dev
```

For packages (libraries):
```markdown
## Como usar

```bash
pnpm add @adponte/<name>
```
```

For workers:
```markdown
## Como executar

```bash
# local dev
pnpm dev

# production
docker compose up -d
```
```

**3. Sections that MUST NOT appear in subproject READMEs**

- Product module lists (duplicates root docs)
- Global architecture diagrams (belongs in `docs/ARCHITECTURE.md`)
- Duplicate content from root `README.md` or `AGENTS.md`
- "Módulos do produto" sections

**4. Which subprojects need updates**

Minimal one-liner READMEs need the `## O que é` and `## Veja também` sections added:
- `packages/db`, `packages/ui`, `packages/auth`, `packages/core`, `packages/types`, `packages/config`, `packages/api-client`
- `workers/media/transcript`, `workers/media/ffmpeg`, `workers/media/davinci`, `workers/media/images`, `workers/media/telegram-bot`
- `workers/system/notifications`, `workers/system/sync`, `workers/system/scheduled-jobs`
- `services/api-local`, `services/media-workflow`
- `infra/n8n`

Rich READMEs that need content trimmed:
- `apps/admin-web` — remove "Módulos do produto" section, keep "O que é" and integrations
- `services/api` — remove "Módulos do produto" section, keep "O que é" and integrations

Apps with minimal READMEs that get full treatment:
- `apps/admin-app`, `apps/member-app`

## Risks / Trade-offs

- [Risk] Over-standardizing removes character → Mitigation: optional sections allow per-project personality
- [Risk] Some READMEs already have good content we don't want to lose → Mitigation: only trim sections that clearly duplicate root docs

## Migration Plan

1. Apply structure to all 22 subproject READMEs
2. For minimal READMEs: add missing sections
3. For rich READMEs: remove duplicate sections only
4. Validate no duplication with root docs
5. Commit

## Open Questions

(none)