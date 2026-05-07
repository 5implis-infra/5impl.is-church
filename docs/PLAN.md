# Plano de Arquitetura — AD Ponte

> Atualizado em: 2026-04-25
> Status geral: 🟡 Em execução — separação de `site` e `saas` em repos independentes

---

## Decisão arquitetural

`site` e `saas` são **repositórios completamente independentes**.
Compartilham apenas contexto de cliente/portfólio, não estrutura de código.

| Item | `site` | `saas` |
|------|--------|--------|
| Stack | Astro Hybrid + Tailwind + Directus | Next.js, Expo, Hono, tRPC, Prisma, Python workers |
| Propósito | Site institucional | SaaS multi-tenant para igrejas |
| Workflow | Build estático/SSR + rebuild via webhook | CI/CD por componente + Docker/GHCR/Coolify |
| Repo Git | `adponte-infra/site` | `adponte-infra/saas` (reaproveitado) |
| Submodules | Não | Sim (22 submodules) |
| Design system | Próprio | `packages/ui` interno |

---

## Layout local de trabalho

```
/home/itbrda/dev/adponte/      # pasta local, sem versionamento
├─ saas/                        # repo: adponte-infra/saas
└─ site/                        # repo: adponte-infra/site
```

A pasta `adponte/` é apenas conveniência local. Não é repo Git.

---

## Decisões de Infra-estrutura (escopo `saas`)

| # | Decisão | Escolha | Notas |
|---|---------|---------|-------|
| 1 | Estratégia Git interna | **Submodules** | Cada componente do SaaS é repo próprio |
| 2 | Estrutura de diretórios | **Turborepo + domínios** | `apps/`, `services/`, `workers/media/`, `workers/system/`, `packages/`, `infra/` |
| 3 | Package manager | **pnpm** | `pnpm-workspace.yaml` |
| 4 | Shared packages | **Sim** | `packages/` com 7 pacotes |
| 5 | CI/CD | **GitHub Actions + GHCR + Coolify webhook** | |
| 6 | CI local | **nektos/act** | `.actrc` na raiz, `.secrets.act` gitignored |
| 7 | Visibilidade | **Privado** | |
| 8 | Turborepo Remote Cache | **Self-hosted na VPS** | `ducktors/turborepo-remote-cache` |
| 9 | Hospedagem | **Hetzner VPS via Coolify** | |
| 10 | Produto | **SaaS multi-tenant** | |
| 11 | Granularidade Git | **1 repo por componente** | 22 submodules |

## Decisões (escopo `site`)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Estratégia Git | Repo único, sem submodules |
| 2 | Stack | Astro Hybrid (`output: 'hybrid'` + `@astrojs/node`) + Tailwind + Directus |
| 3 | Deploy | VPS Hetzner via Coolify, container Node.js |
| 4 | Rebuild | Webhook Directus → `repository_dispatch` → CI rebuild |
| 5 | Visibilidade | Privado |

---

## Estrutura interna do `saas`

```
saas/                                 ← github.com/adponte-infra/saas
├── .github/workflows/
│   ├── ci.yml
│   ├── docker.yml
│   └── deploy.yml
├── .gitignore
├── .gitmodules
├── .actrc
├── package.json                      ← @adponte/saas
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── CLAUDE.md
│
├── apps/
│   ├── admin-web/                    ← submodule: adponte-infra/admin-web (Next.js 15)
│   ├── admin-app/                    ← submodule: adponte-infra/admin-app (Expo)
│   └── member-app/                   ← submodule: adponte-infra/member-app (Expo)
│
├── services/
│   ├── api/                          ← submodule: adponte-infra/api (Hono + tRPC + Prisma)
│   ├── api-local/                    ← submodule: adponte-infra/api-local
│   └── media-workflow/               ← submodule: adponte-infra/media-workflow
│
├── workers/
│   ├── media/
│   │   ├── transcript/               ← submodule: adponte-infra/transcript
│   │   ├── ffmpeg/                   ← submodule: adponte-infra/worker-ffmpeg
│   │   ├── davinci/                  ← submodule: adponte-infra/worker-davinci
│   │   ├── images/                   ← submodule: adponte-infra/worker-images
│   │   └── telegram-bot/             ← submodule: adponte-infra/worker-telegram-bot
│   │
│   └── system/
│       ├── notifications/            ← submodule: adponte-infra/worker-notifications
│       ├── sync/                     ← submodule: adponte-infra/worker-sync
│       └── scheduled-jobs/           ← submodule: adponte-infra/worker-scheduled-jobs
│
├── packages/
│   ├── api-client/                   ← submodule: adponte-infra/api-client
│   ├── auth/                         ← submodule: adponte-infra/auth
│   ├── core/                         ← submodule: adponte-infra/core
│   ├── db/                           ← submodule: adponte-infra/db
│   ├── ui/                           ← submodule: adponte-infra/ui
│   ├── types/                        ← submodule: adponte-infra/types
│   └── config/                       ← submodule: adponte-infra/config
│
├── infra/
│   ├── n8n/                          ← submodule: adponte-infra/n8n
│   ├── docker/                       ← diretório interno
│   ├── postgres/                     ← diretório interno
│   └── deploy/                       ← diretório interno
│
└── docs/
    ├── PLAN.md
    └── ARCHITECTURE.md
    └── app.context.md
```

---

## Repositórios GitHub

### Site
| Repo | Caminho local | Tipo |
|------|--------------|------|
| adponte-infra/site | `site/` | Site institucional Astro |

### SaaS — agregador
| Repo | Caminho local | Tipo |
|------|--------------|------|
| adponte-infra/saas | `saas/` | Monorepo agregador |

### SaaS — submodules (22)
| Repo | Caminho dentro de `saas/` | Tipo |
|------|--------------------------|------|
| adponte-infra/admin-web | `apps/admin-web` | App |
| adponte-infra/admin-app | `apps/admin-app` | App |
| adponte-infra/member-app | `apps/member-app` | App |
| adponte-infra/api | `services/api` | Service |
| adponte-infra/api-local | `services/api-local` | Service |
| adponte-infra/media-workflow | `services/media-workflow` | Service |
| adponte-infra/transcript | `workers/media/transcript` | Worker |
| adponte-infra/worker-ffmpeg | `workers/media/ffmpeg` | Worker |
| adponte-infra/worker-davinci | `workers/media/davinci` | Worker |
| adponte-infra/worker-images | `workers/media/images` | Worker |
| adponte-infra/worker-telegram-bot | `workers/media/telegram-bot` | Worker |
| adponte-infra/worker-notifications | `workers/system/notifications` | Worker |
| adponte-infra/worker-sync | `workers/system/sync` | Worker |
| adponte-infra/worker-scheduled-jobs | `workers/system/scheduled-jobs` | Worker |
| adponte-infra/api-client | `packages/api-client` | Package |
| adponte-infra/auth | `packages/auth` | Package |
| adponte-infra/core | `packages/core` | Package |
| adponte-infra/db | `packages/db` | Package |
| adponte-infra/ui | `packages/ui` | Package |
| adponte-infra/types | `packages/types` | Package |
| adponte-infra/config | `packages/config` | Package |
| adponte-infra/n8n | `infra/n8n` | Infra |

---

## Clone

### Site (independente)
```bash
git clone git@github.com:adponte-infra/site.git
```

### SaaS (com submodules)
```bash
git clone --recurse-submodules git@github.com:adponte-infra/saas.git saas
```

### Workspace local completo
```bash
mkdir -p ~/dev/adponte
cd ~/dev/adponte
git clone git@github.com:adponte-infra/site.git
git clone --recurse-submodules git@github.com:adponte-infra/saas.git saas
```

---

## Princípios de CI/CD (escopo `saas`)

> Cada submodule é um repo Git independente.
> `.github/workflows/` existem em **dois níveis**:
> no root do `saas` (orquestração Turborepo) e em cada submodule (CI/CD específico).

| Nível | `ci.yml` faz o quê |
|---|---|
| Root `saas` | `turbo run lint test` — detecta o que mudou |
| Cada `apps/*` | Lint, typecheck, build, push Docker image |
| Cada `services/*` | Lint, typecheck, push Docker image |
| Cada `workers/**/*` | Lint, typecheck (ruff/mypy para Python), push Docker image |
| Cada `packages/*` | Lint, typecheck, build |

---

## Projetos do `saas`

| Projeto | Caminho | Tech | Deploy |
|---------|---------|------|--------|
| Admin Web | `apps/admin-web/` | Next.js 15 + Tailwind CSS 4 | VPS/Coolify |
| Admin App | `apps/admin-app/` | Expo (mobile/PWA) | — |
| Member App | `apps/member-app/` | Expo (mobile/PWA) | — |
| API SaaS | `services/api/` | Hono + tRPC + Prisma | VPS/Coolify |
| API Local | `services/api-local/` | TBD | Mini PC |
| Media Workflow | `services/media-workflow/` | TBD | VPS/Coolify |
| Transcrição | `workers/media/transcript/` | Python + faster-whisper | RunPod |
| Worker FFmpeg | `workers/media/ffmpeg/` | Python + FFmpeg | VPS/Coolify |
| Worker DaVinci | `workers/media/davinci/` | Python + DaVinci API | VPS dedicado |
| Worker imagens | `workers/media/images/` | Python + OpenCV + PIL | VPS/Coolify |
| Telegram bot | `workers/media/telegram-bot/` | Python ou Node | VPS/Coolify |
| Notifications | `workers/system/notifications/` | TBD | VPS/Coolify |
| Sync | `workers/system/sync/` | TBD | VPS/Coolify |
| Scheduled Jobs | `workers/system/scheduled-jobs/` | TBD | VPS/Coolify |
| n8n workflows | `infra/n8n/` | JSON exports | VPS/Coolify |

---

## Roteiro de execução

Ver `docs/EXECUTION-ROADMAP.md` para o roteiro detalhado por etapas e checklists da migração para a estrutura `saas/` + `site/` independentes.

---

## Legenda de status

| Símbolo | Significado |
|---------|------------|
| ⬜ | Pendente |
| 🟡 | Em andamento |
| ✅ | Concluído |
| ❌ | Bloqueado |
