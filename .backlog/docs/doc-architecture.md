---
id: doc-architecture
title: "Arquitetura — AD Ponte SaaS"
type: documentation
created_date: "2026-05-15"
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical: [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)

# Arquitetura — AD Ponte SaaS

> Documento de referência técnica: visão geral do sistema, diagrama, stack por componente, topologia de deploy e pipeline de mídia. Decisões arquiteturais formais (ADRs) vivem em `docs/adrs/*.md`.
> Atualizado em: 2026-05-14

---

## Diagrama de Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENTES                                │
├───────────────────┬──────────────────┬───────────────────────────┤
│    admin-web      │    admin-app     │       member-app           │
│   (Next.js 15)    │    (Expo nativo) │      (Expo nativo)        │
│   web browser     │  iOS / Android   │      iOS / Android        │
│  tudo gerencial   │ gerencial subset │  membro + anônimo         │
└────────┬──────────┴────────┬─────────┴──────────┬────────────────┘
         └──────────────────┼──────────────────────┘
                            ▼
              ┌─────────────────────────┐
              │      services/api       │  ← ÚNICO entry point para apps
              │   Hono + tRPC + Prisma  │
              │   Node.js / VPS          │
              └─────┬──────────┬────────┘
                    │          │
          ┌─────────┘          └────────────────────────┐
          ▼                                             ▼
     PostgreSQL                          services/media-workflow
     (Prisma)                            Hono + tRPC / VPS
     VPS Hetzner                         event-driven, async
                                          (nunca chamado por apps)
                                                 │
                              ┌─────────────────┼──────────────────┐
                              ▼                 ▼                  ▼
                         infra/n8n         workers/media/*    Cloudflare R2
                         (self-hosted)     (transcript,        (storage)
                         VPS Coolify       ffmpeg, images,
                                           davinci)
                              │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
    telegram-bot           Postiz              Instagram · YouTube
    (aprovação)       (publicação social)         Feed · Stories

────────────────────────────────────────────────────────────────
EDGE (mini-PC da Igreja)
  services/api-local
  Recebe mídia via Wi-Fi → relay para services/media-workflow
────────────────────────────────────────────────────────────────

CI/CD (build out-of-VPS):
  push → GitHub Actions → build + push Docker → GHCR
           → webhook → Coolify → pull imagem → deploy
```

---

## Stack por Componente

| Componente | Caminho | Linguagem | Framework | Runtime | Status |
|---|---|---|---|---|---|
| Admin Web | `apps/admin-web` | TypeScript | Next.js 15 + React 19 | VPS / Coolify | ativo |
| Admin App | `apps/admin-app` | TypeScript | Expo (nativo) | iOS / Android | em desenvolvimento |
| Member App | `apps/member-app` | TypeScript | Expo (nativo) | iOS / Android | em desenvolvimento |
| API SaaS | `services/api` | TypeScript | Hono + tRPC + Prisma | VPS / Coolify | ativo |
| API Local | `services/api-local` | TBD | TBD | Mini-PC (edge) | planejado |
| Media Workflow | `services/media-workflow` | TypeScript | Hono + tRPC | VPS / Coolify | ativo |
| Worker Transcrição | `workers/media/transcript` | Python 3.10+ | faster-whisper + RunPod SDK | RunPod (GPU) | ativo |
| Worker FFmpeg | `workers/media/ffmpeg` | Python 3.10+ | FFmpeg + RunPod SDK | VPS / RunPod | ativo |
| Worker DaVinci | `workers/media/davinci` | Python 3.10+ | DaVinci Resolve API | VPS dedicado | planejado |
| Worker Imagens | `workers/media/images` | Python 3.10+ | OpenCV + PIL | VPS / Coolify | em desenvolvimento |
| Telegram Bot | `workers/media/telegram-bot` | TBD | TBD | VPS / Coolify | planejado |
| Notificações | `workers/system/notifications` | TBD | TBD | VPS / Coolify | planejado |
| Sync | `workers/system/sync` | TBD | TBD | VPS / Coolify | planejado |
| Scheduled Jobs | `workers/system/scheduled-jobs` | TBD | TBD | VPS / Coolify | planejado |

---

## Topologia de Deploy

```
┌─────────────────────────────────────────────────────────────┐
│              Hetzner VPS (principal)                        │
│   Gerenciado via Coolify                                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────────────────────┐         │
│  │  services/   │  │  workers/system/*            │         │
│  │  api         │  │  notifications, sync,        │         │
│  │  media-      │  │  scheduled-jobs              │         │
│  │  workflow    │  └──────────────────────────────┘         │
│  └──────────────┘                                           │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  apps/       │  │  infra/n8n   │                         │
│  │  admin-web   │  │  Postiz      │                         │
│  └──────────────┘  └──────────────┘                         │
│  ┌──────────────┐                                           │
│  │  Turborepo   │  ← ducktors/turborepo-remote-cache        │
│  │  Remote Cache│                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│  RunPod (serverless GPU)    │
│  workers/media/transcript   │
│  workers/media/ffmpeg       │
└─────────────────────────────┘

┌─────────────────────────────┐
│  VPS dedicado (DaVinci)     │
│  workers/media/davinci      │
│  DaVinci Resolve headless   │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Mini-PC (Igreja)           │
│  services/api-local         │
│  Recepção de mídia Wi-Fi    │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Cloudflare R2              │
│  Storage de mídia (S3-compat│
└─────────────────────────────┘
```

**Fluxo de CI/CD:**

```
git push (submodule)
  → GitHub Actions (build + push Docker image)
    → GHCR (GitHub Container Registry)
      → Coolify webhook
        → pull nova imagem
          → zero-downtime restart
```

CI local com nektos/act: `.actrc` na raiz, `.secrets.act` gitignored.
Steps de deploy usam `if: ${{ !env.ACT }}` para não executar localmente.

---

## Pipeline de Mídia

| Etapa | Nome | Componente responsável |
|---|---|---|
| 1 | **Captura** | iPhone/Android, YouTube Live, Stream Deck (timestamps JSON) |
| 2 | **Ingestão** | `apps/admin-app` → `services/api-local` → Cloudflare R2 |
| 3 | **Orquestração** | `services/media-workflow` + `infra/n8n` |
| 4 | **Análise IA** | `workers/media/transcript` (Whisper), detecção de silêncio/aplausos, LLM → EDL |
| 5A | **Processamento vídeo (Shorts)** | `workers/media/ffmpeg` (trim, 9:16, SRT burn-in) |
| 5B | **Processamento vídeo (Reels)** | `workers/media/davinci` (DaVinci Resolve headless, Fusion) |
| 6 | **Processamento imagens** | `workers/media/images` (OpenCV, crop inteligente, ajuste de cor) |
| 7 | **Pós-produção** | LLM (título, descrição, hashtags, thumbnail via FFmpeg) |
| 8 | **Aprovação humana** | `workers/media/telegram-bot` (preview + botões) |
| 9 | **Publicação** | Postiz (self-hosted) → Instagram, YouTube Shorts, Feed, Stories |

---

## ADRs Globais

Decisões arquiteturais formais para itens de escopo global do monorepo.

| ADR | Título | Status |
|---|---|---|
| [000](adrs/000-documentation-standards.md) | Documentation Standards | Aceito |
| [001](adrs/001-git-submodules.md) | Git Submodules Strategy | Aceito |
| [002](adrs/002-directory-structure.md) | Directory Structure | Aceito |
| [003](adrs/003-ci-cd.md) | CI/CD: GitHub Actions + GHCR + Coolify | Aceito |
| [004](adrs/004-remote-cache.md) | Turborepo Remote Cache: Self-Hosted | Aceito |
| [005](adrs/005-site-saas-separation.md) | Site Astro: Independent Repo | Aceito |
| [006](adrs/006-product-multi-tenancy.md) | Product: Multi-Tenant SaaS for Churches | Aceito |
| [007](adrs/007-one-repo-per-component.md) | Git Granularity: 1 Repo per Component | Aceito |
| [008](adrs/008-api-media-workflow-split.md) | Complete Separation of `site` and `saas` | Aceito |
| [009](adrs/009-n8n-ownership.md) | Separation of `services/api` and `services/media-workflow` | Aceito |

## ADRs Pendentes de Decisão / TBDs

| ADR | Título | Resolved |
|---|---|---|
| [013](adrs/013-multi-tenancy-database-isolation.md) | Multi-Tenancy Database Isolation | 2026-05-14 |
| [014](adrs/014-authentication-library.md) | Authentication Library: Better Auth | 2026-05-14 |
| [015](adrs/015-payment-gateway.md) | Payment Gateway: Asaas | 2026-05-14 |
| [016](adrs/016-notifications-stack.md) | Notifications Stack | 2026-05-14 |
| [017](adrs/017-api-local-stack.md) | API-Local Stack: Hono Lite | 2026-05-14 |
| [018](adrs/018-telegram-bot-language.md) | Telegram Bot Language: Python | 2026-05-14 |

## ADRs Locais

Decisões de escopo específico por componente ou domínio.

| ADR | Título | Escopo |
|---|---|---|
| [004](adrs/004-remote-cache.md) | Turborepo Remote Cache: Self-Hosted | Infra/VPS |
| [005](adrs/005-site-saas-separation.md) | Site Astro: Independent Repo | `adponte-infra/site` |
| [008](adrs/008-api-media-workflow-split.md) | Complete Separation of `site` and `saas` | `saas` vs `site` |

---

<!-- TBDs resolved — see ADRs 013–018 above -->
