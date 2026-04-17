# Plano de Migração para Monorepo — AD Ponte

> Atualizado em: 2026-04-17
> Status geral: ✅ Monorepo completo — estrutura final, submodules no GitHub, caminhos migrados

---

## Decisões de Infra-estrutura

| # | Decisão | Escolha | Notas |
|---|---------|---------|-------|
| 1 | Estratégia Git | **Submodules** | Cada projeto mantém seu próprio repo Git |
| 2 | Estrutura de diretórios | **Turborepo convencional + `services/`** | `apps/`, `services/`, `workers/`, `packages/` |
| 3 | Package manager (root) | **pnpm** | `pnpm-workspace.yaml` define workspaces JS/TS |
| 4 | Shared packages | **Sim** | `packages/` desde o início |
| 5 | CI/CD | **GitHub Actions + GHCR + Coolify webhook** | Build no CI, push para GHCR, deploy via webhook |
| 6 | CI local | **nektos/act** | `.actrc` na raiz, `.secrets.act` gitignored |
| 7 | Visibilidade do repo | **Privado** | GitHub repo privado |
| 8 | Turborepo Remote Cache | **Self-hosted na VPS** | `ducktors/turborepo-remote-cache` via Docker |
| 9 | Deploy site Astro | **Node container** | Astro Hybrid (`output: 'hybrid'` + `@astrojs/node`) |
| 10 | Hospedagem | **Hetzner VPS via Coolify** | Deploy via imagem Docker (GHCR) + webhook |
| 11 | Produto | **SaaS multi-tenant** | Nasce como produto para múltiplas igrejas |

---

## Princípios de CI/CD por nível

> Cada submodule é um repo Git independente.
> `.gitignore` e `.github/workflows/` existem em **dois níveis**:
> no root (orquestração Turborepo) e em cada projeto (CI/CD específico).

| Nível | `ci.yml` faz o quê |
|---|---|
| Root monorepo | `turbo run lint test` — detecta o que mudou em todos os projetos |
| Cada `apps/*` | Lint, typecheck, build, push Docker image |
| Cada `services/*` | Lint, typecheck, push Docker image |
| Cada `workers/*` | Lint, typecheck (ruff/mypy para Python), push Docker image |

---

## Estrutura alvo do Monorepo

```
adponte/                              ← github.com/adponte-infra/monorepo ✅
├── .github/workflows/
│   ├── ci.yml                        ← turbo run lint test ✅
│   ├── docker.yml                    ← turbo run docker:build docker:push ✅
│   └── deploy.yml                    ← webhooks Coolify (skip no act) ✅
├── .gitignore ✅
├── .gitmodules ✅
├── .actrc ✅
├── package.json ✅
├── pnpm-workspace.yaml ✅
├── turbo.json ✅
├── CLAUDE.md ✅
│
├── apps/
│   ├── site/                         ← submodule: adponte-infra/site (Astro Hybrid) ✅
│   ├── gestao/                       ← submodule: adponte-infra/gestao ✅
│   │   ├── apps/web/                 ← Next.js 15 + Tailwind CSS 4 ✅
│   │   ├── apps/app/                 ← PWA/Mobile (stack TBD) ✅
│   │   ├── services/api/             ← Hono + tRPC + Prisma ✅
│   │   ├── packages/types/ ✅
│   │   └── packages/db/ ✅
│   └── midia-captura/                ← submodule: adponte-infra/midia-captura ✅
│
├── services/
│   ├── n8n/                          ← submodule: adponte-infra/n8n ✅
│   ├── control-plane/                ← submodule: adponte-infra/control-plane ✅
│   └── media-local/                  ← submodule: adponte-infra/media-local ✅
│
├── workers/
│   ├── transcript/                   ← submodule: adponte-infra/transcript ✅
│   ├── ffmpeg/                       ← submodule: adponte-infra/worker-ffmpeg ✅
│   ├── davinci/                      ← submodule: adponte-infra/worker-davinci ✅
│   ├── images/                       ← submodule: adponte-infra/worker-images ✅
│   └── telegram-bot/                 ← submodule: adponte-infra/worker-telegram-bot ✅
│
├── packages/types/ ✅
│
└── docs/
    ├── PLAN.md ✅
    ├── BACKLOG.md ✅
    ├── ARCHITECTURE.md ✅
    ├── flow.md ✅
    └── mapa-mental.md ✅
```

### Clone completo

```bash
git clone --recurse-submodules git@github.com:adponte-infra/monorepo.git
```

---

## Projetos do Monorepo

| Projeto | Caminho | Tech | Status sessão | Deploy |
|---------|---------|------|--------------|--------|
| Site institucional | `apps/site/` | Astro Hybrid + Tailwind + Directus | ✅ No GitHub | VPS/Coolify |
| Gestão de igrejas | `apps/gestao/` | Next.js + Hono + tRPC + Prisma | ✅ No GitHub | VPS/Coolify |
| App de captura | `apps/midia-captura/` | PWA (TBD) | ✅ No GitHub | — |
| n8n workflows | `services/n8n/` | JSON exports | ✅ No GitHub | VPS/Coolify |
| Control plane mídia | `services/control-plane/` | Hono + tRPC + Prisma | ✅ No GitHub | VPS/Coolify |
| API local (mini PC) | `services/media-local/` | TBD | ✅ No GitHub | Mini PC |
| Transcrição | `workers/transcript/` | Python + faster-whisper | ✅ No GitHub | RunPod |
| Worker FFmpeg | `workers/ffmpeg/` | Python + FFmpeg | ✅ No GitHub | VPS/Coolify |
| Worker DaVinci | `workers/davinci/` | Python + DaVinci API | ✅ No GitHub | VPS dedicado |
| Worker imagens | `workers/images/` | Python + OpenCV + PIL | ✅ No GitHub | VPS/Coolify |
| Telegram bot | `workers/telegram-bot/` | Python ou Node (TBD) | ✅ No GitHub | VPS/Coolify |

---

## Tarefas — Escopo desta sessão

> Serão executadas após validação do plano completo.
> Projetos em ideação recebem **scaffolding mínimo** (README, .gitignore, package.json).
> Projetos mapeados em detalhe recebem scaffolding completo.

---

### Fase 0 — Root do Monorepo

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 0.1 | Criar `package.json` root | `package.json` | ✅ |
| 0.2 | Criar `pnpm-workspace.yaml` | `pnpm-workspace.yaml` | ✅ |
| 0.3 | Criar `turbo.json` | `turbo.json` | ✅ |
| 0.4 | Criar `.gitignore` root | `.gitignore` | ✅ |
| 0.5 | Criar `.actrc` | `.actrc` | ✅ |
| 0.6 | Criar GitHub Actions — CI | `.github/workflows/ci.yml` | ✅ |
| 0.7 | Criar GitHub Actions — Docker | `.github/workflows/docker.yml` | ✅ |
| 0.8 | Criar GitHub Actions — Deploy | `.github/workflows/deploy.yml` | ✅ |
| 0.9 | Criar `docs/ARCHITECTURE.md` | `docs/ARCHITECTURE.md` | ✅ |
| 0.10 | Criar `packages/types/` scaffold | `packages/types/package.json`, `src/index.ts` | ✅ |

---

### Fase 1 — `apps/site` (adponte.com)

**Stack:** Astro Hybrid (`output: 'hybrid'` + `@astrojs/node`) · Tailwind CSS · Directus
**Deploy:** VPS Hetzner via Coolify · Directus na mesma VPS (rede Docker interna)
**Rebuild:** Webhook Directus → `repository_dispatch` → CI rebuild

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 1.1 | Adaptar `package.json` (adicionar `@astrojs/node`) | `apps/site/package.json` | ✅ |
| 1.2 | Criar `Dockerfile` multi-stage (node:22-alpine) | `apps/site/Dockerfile` | ✅ |
| 1.3 | Criar `.dockerignore` | `apps/site/.dockerignore` | ✅ |
| 1.4 | Atualizar `README.md` | `apps/site/README.md` | ✅ |
| 1.5 | `.gitignore` existente OK | `apps/site/.gitignore` | ✅ |
| 1.6 | Criar GitHub Actions — CI (lint, format, knip) | `apps/site/.github/workflows/ci.yml` | ✅ |
| 1.7 | Criar GitHub Actions — Docker build/push + webhook | `apps/site/.github/workflows/docker.yml` | ✅ |

---

### Fase 2 — `workers/transcript`

**Stack:** Python 3.10 · faster-whisper · RunPod serverless · CUDA 12.1
**Deploy:** RunPod (GPU obrigatório) · atualização do endpoint manual por ora

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 2.1 | Criar `package.json` stub com scripts Python | `workers/transcript/package.json` | ✅ |
| 2.2 | `Dockerfile` existente OK | `workers/transcript/Dockerfile` | ✅ |
| 2.3 | Criar `.dockerignore` | `workers/transcript/.dockerignore` | ✅ |
| 2.4 | Atualizar `README.md` | `workers/transcript/README.md` | ✅ |
| 2.5 | `.gitignore` existente OK | `workers/transcript/.gitignore` | ✅ |
| 2.6 | Criar GitHub Actions — CI (ruff + mypy) | `workers/transcript/.github/workflows/ci.yml` | ✅ |
| 2.7 | Criar GitHub Actions — Docker build/push GHCR | `workers/transcript/.github/workflows/docker.yml` | ✅ |

---

### Fase 3 — `services/n8n`

**Stack:** n8n self-hosted (VPS/Coolify) · workflow JSONs exportados
**Deploy:** Já rodando na VPS · sync manual por ora

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 3.1 | Criar `workflows/` com `.gitkeep` | `services/n8n/workflows/.gitkeep` | ✅ |
| 3.2 | Criar `package.json` com script de validação JSON | `services/n8n/package.json` | ✅ |
| 3.3 | Criar `.gitignore` | `services/n8n/.gitignore` | ✅ |
| 3.4 | Criar `README.md` (convenção de nomes, export/import) | `services/n8n/README.md` | ✅ |
| 3.5 | Criar GitHub Actions — CI (validação JSON) | `services/n8n/.github/workflows/ci.yml` | ✅ |

---

### Fase 4 — `apps/gestao` (mini-monorepo)

**Stack:** Next.js 15 + Tailwind CSS (web) · PWA TBD (app) · Hono + tRPC + Prisma (api)
**Deploy:** VPS/Coolify · multi-tenant SaaS

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 4.1 | Criar root do mini-monorepo | `apps/gestao/package.json`, `turbo.json`, `pnpm-workspace.yaml` | ✅ |
| 4.2 | Criar `.gitignore` root | `apps/gestao/.gitignore` | ✅ |
| 4.3 | Criar `README.md` | `apps/gestao/README.md` | ✅ |
| 4.4 | Criar GitHub Actions — CI | `apps/gestao/.github/workflows/ci.yml` | ✅ |
| 4.5 | Scaffold `apps/web/` (Next.js) | `apps/gestao/apps/web/package.json`, `tsconfig.json`, `next.config.ts` | ✅ |
| 4.6 | Scaffold `apps/app/` (placeholder PWA) | `apps/gestao/apps/app/package.json`, `README.md` | ✅ |
| 4.7 | Scaffold `services/api/` (Hono + tRPC + Prisma) | `apps/gestao/services/api/package.json`, `src/index.ts`, `prisma/schema.prisma` | ✅ |
| 4.8 | Scaffold `packages/db/` (Prisma client compartilhado) | `apps/gestao/packages/db/package.json`, `prisma/schema.prisma` | ✅ |
| 4.9 | Scaffold `packages/types/` interno | `apps/gestao/packages/types/package.json`, `src/index.ts` | ✅ |

---

### Fase 5 — `services/control-plane`

**Stack:** Hono + tRPC + Prisma · dashboard de monitoramento · Postgres + Redis
**Deploy:** VPS/Coolify · scaffolding mínimo (ideação)

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 5.1 | Criar `package.json` | `services/control-plane/package.json` | ✅ |
| 5.2 | Criar estrutura `src/` | `services/control-plane/src/index.ts` | ✅ |
| 5.3 | Criar `Dockerfile` placeholder | `services/control-plane/Dockerfile` | ✅ |
| 5.4 | Criar `.gitignore` | `services/control-plane/.gitignore` | ✅ |
| 5.5 | Criar `README.md` | `services/control-plane/README.md` | ✅ |
| 5.6 | Criar GitHub Actions — CI | `services/control-plane/.github/workflows/ci.yml` | ✅ |

---

### Fase 6 — `apps/midia-captura`

**Stack:** PWA (TBD) · scaffolding mínimo (ideação)

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 6.1 | Criar `package.json` placeholder | `apps/midia-captura/package.json` | ✅ |
| 6.2 | Criar `.gitignore` | `apps/midia-captura/.gitignore` | ✅ |
| 6.3 | Criar `README.md` | `apps/midia-captura/README.md` | ✅ |

---

### Fase 7 — `services/media-local`

**Stack:** TBD · API no mini PC da igreja · scaffolding mínimo (ideação)

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 7.1 | Criar `package.json` placeholder | `services/media-local/package.json` | ✅ |
| 7.2 | Criar `.gitignore` | `services/media-local/.gitignore` | ✅ |
| 7.3 | Criar `README.md` | `services/media-local/README.md` | ✅ |

---

### Fase 8 — `workers/ffmpeg`

**Stack:** Python + FFmpeg · Docker · VPS/Coolify · scaffolding mínimo (ideação)

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 8.1 | Criar `pyproject.toml` | `workers/ffmpeg/pyproject.toml` | ✅ |
| 8.2 | Criar `Dockerfile` placeholder | `workers/ffmpeg/Dockerfile` | ✅ |
| 8.3 | Criar `.gitignore` (Python) | `workers/ffmpeg/.gitignore` | ✅ |
| 8.4 | Criar `README.md` | `workers/ffmpeg/README.md` | ✅ |
| 8.5 | Criar `package.json` stub (Turborepo) | `workers/ffmpeg/package.json` | ✅ |

---

### Fase 9 — `workers/davinci`

**Stack:** Python + DaVinci Resolve API headless · scaffolding mínimo (ideação)

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 9.1 | Criar `pyproject.toml` | `workers/davinci/pyproject.toml` | ✅ |
| 9.2 | Criar `Dockerfile` placeholder | `workers/davinci/Dockerfile` | ✅ |
| 9.3 | Criar `.gitignore` (Python) | `workers/davinci/.gitignore` | ✅ |
| 9.4 | Criar `README.md` | `workers/davinci/README.md` | ✅ |
| 9.5 | Criar `package.json` stub (Turborepo) | `workers/davinci/package.json` | ✅ |

---

### Fase 10 — `workers/images`

**Stack:** Python + OpenCV + PIL · Docker · scaffolding mínimo (ideação)

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 10.1 | Criar `pyproject.toml` | `workers/images/pyproject.toml` | ✅ |
| 10.2 | Criar `Dockerfile` placeholder | `workers/images/Dockerfile` | ✅ |
| 10.3 | Criar `.gitignore` (Python) | `workers/images/.gitignore` | ✅ |
| 10.4 | Criar `README.md` | `workers/images/README.md` | ✅ |
| 10.5 | Criar `package.json` stub (Turborepo) | `workers/images/package.json` | ✅ |

---

### Fase 11 — `workers/telegram-bot`

**Stack:** Python ou Node (TBD) · scaffolding mínimo (ideação)

| # | Tarefa | Arquivo(s) | Status |
|---|--------|-----------|--------|
| 11.1 | Criar `package.json` placeholder | `workers/telegram-bot/package.json` | ✅ |
| 11.2 | Criar `.gitignore` | `workers/telegram-bot/.gitignore` | ✅ |
| 11.3 | Criar `README.md` | `workers/telegram-bot/README.md` | ✅ |

---

## Legenda de status

| Símbolo | Significado |
|---------|------------|
| ⬜ | Pendente |
| 🟡 | Em andamento |
| ✅ | Concluído |
| ❌ | Bloqueado |
