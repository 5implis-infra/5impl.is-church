# Arquitetura — AD Ponte SaaS

> Documento de referência técnica: ADRs, diagrama de sistema, stack por componente, topologia de deploy e pipeline de mídia.
> Atualizado em: 2026-05-07

---

## Diagrama de Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENTES                                │
├───────────────────┬──────────────────┬───────────────────────────┤
│    admin-web      │    admin-app     │       member-app          │
│   (Next.js 15)    │    (Expo nativo) │      (Expo nativo)        │
│   web browser     │  iOS / Android   │      iOS / Android        │
│  tudo gerencial   │ gerencial subset │  membro + anônimo         │
└────────┬──────────┴────────┬─────────┴──────────┬────────────────┘
         └──────────────────┼──────────────────────┘
                            ▼
              ┌─────────────────────────┐
              │      services/api       │  ← ÚNICO entry point para apps
              │   Hono + tRPC + Prisma  │
              │   Node.js / VPS         │
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
                              ┌─────────────────┤
                              ▼                 ▼
                       telegram-bot           Postiz
                       (aprovação)       (publicação social)
                              │
                              ▼
                    Instagram · YouTube · Feed · Stories

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
┌─────────────────────────────────────────────────────┐
│              Hetzner VPS (principal)                │
│   Gerenciado via Coolify                            │
│                                                     │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │  services/   │  │  workers/system/*            │ │
│  │  api         │  │  notifications, sync,        │ │
│  │  media-      │  │  scheduled-jobs              │ │
│  │  workflow    │  └──────────────────────────────┘ │
│  └──────────────┘                                   │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  apps/       │  │  infra/n8n   │                 │
│  │  admin-web   │  │  Postiz      │                 │
│  └──────────────┘  └──────────────┘                 │
│  ┌──────────────┐                                   │
│  │  Turborepo   │  ← ducktors/turborepo-remote-cache│
│  │  Remote Cache│                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘

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

## TBDs Arquiteturais

| Área | Questão em aberto | Abordagem sugerida |
|---|---|---|
| **Isolamento multi-tenancy no banco** | Schema único com `church_id` vs schemas separados por tenant | Schema único + RLS (Row-Level Security) no PostgreSQL — menor custo operacional para o estágio atual |
| **Biblioteca de autenticação** | Qual lib gerencia sessões, 2FA, login social, tokens por filial | Better Auth (mais completo e TypeScript-first) ou solução própria com Hono middleware |
| **Gateway de pagamentos** | PIX, boleto, cartão, parcelamento | Asaas (melhor cobertura BR + PIX nativo) ou Pagar.me |
| **Stack de notificações** | Push, email, WhatsApp, Telegram — quais providers | Resend (email), FCM (push), Evolution API (WhatsApp self-hosted) |
| **api-local (stack)** | Framework para mini-PC com recursos limitados | Hono leve (consistente com o restante da stack TypeScript) |

---

## ADR-001 — Estratégia Git: Submodules

**Data:** 2026-04-16 | **Status:** Aceito

**Contexto:** O `saas` contém projetos com stacks diferentes (Next.js, Expo, Hono, Python) que evoluem em ritmos distintos.

**Decisão:** Usar Git Submodules dentro do `saas`. Cada componente é um repositório GitHub privado independente. O root do `saas` referencia cada componente via `.gitmodules`.

**Consequências:**
- Cada projeto mantém histórico, issues e CI/CD próprios
- `git clone --recurse-submodules` obrigatório
- Atualizações de submodule requerem commit no root

---

## ADR-002 — Estrutura de Diretórios

**Data:** 2026-04-16 | **Revisão:** 2026-04-25 | **Status:** Aceito

**Decisão:** Turborepo com organização por domínio: `apps/`, `services/`, `workers/media/`, `workers/system/`, `packages/`, `infra/`.

**Mudanças v2:**
- Fim do mini-monorepo `apps/gestao`: cada componente promovido a repo próprio
- Workers agrupados por domínio: `media/` e `system/`
- `services/n8n` migrado para `infra/n8n`
- `apps/site` separado como repo independente

---

## ADR-003 — CI/CD: GitHub Actions + GHCR + Coolify

**Data:** 2026-04-16 | **Status:** Aceito

**Decisão:** `push → GitHub Actions (build + push → GHCR) → webhook → Coolify (pull + deploy)`

- Build fora da VPS (não consome recursos do servidor)
- GHCR gratuito para repos privados
- Coolify: zero-downtime restart via webhook

**GitHub Secrets necessários por projeto:**

| Secret | Propósito |
|---|---|
| `TURBO_API` | URL do Turborepo Remote Cache |
| `TURBO_TOKEN` | Token de autenticação do cache |
| `TURBO_TEAM` | Team ID do Turborepo |
| `COOLIFY_TOKEN` | Token do Coolify |
| `COOLIFY_WEBHOOK_*` | URL de webhook por serviço |

---

## ADR-004 — Turborepo Remote Cache: Self-Hosted

**Data:** 2026-04-16 | **Status:** Planejado

**Decisão:** `ducktors/turborepo-remote-cache` na própria VPS Hetzner. Evita rebuilds desnecessários entre máquinas locais e CI.

---

## ADR-005 — Site Astro: Repo Independente

**Data:** 2026-04-16 | **Revisão:** 2026-04-25 | **Status:** Aceito

**Decisão:** `adponte-infra/site` é um repo Git completamente independente. Não compartilha workspace, Turbo, pnpm-workspace ou tsconfig com o `saas`. Stack: Astro Hybrid + Tailwind + Directus.

---

## ADR-006 — Produto: SaaS Multi-Tenant para Igrejas

**Data:** 2026-04-16 | **Status:** Aceito

**Decisão:** Plataforma SaaS multi-tenant para gestão de igrejas. Multi-tenancy via `churchId`/`slug` em todos os modelos de domínio. Habilitação de módulos por feature flags + planos de assinatura.

---

## ADR-007 — Granularidade Git: 1 Repo por Componente

**Data:** 2026-04-25 | **Status:** Aceito

**Contexto:** Na v1, `gestao` era um mini-monorepo interno com múltiplos apps/services/packages, gerando acoplamento entre componentes com ciclos de release diferentes.

**Decisão:** Dentro do `saas`, cada app, service, worker e package é um repo Git independente. O monorepo agregador referencia todos como submodules.

**Consequências:** 22 submodules; cada componente pode evoluir, ser deployado e ter CI/CD independentemente.

---

## ADR-008 — Separação Completa de `site` e `saas`

**Data:** 2026-04-25 | **Status:** Aceito

**Decisão:** `site` e `saas` são repositórios Git completamente independentes. Não existe terceiro repo agregador acima dos dois.

---

## ADR-009 — Separação de `services/api` e `services/media-workflow`

**Data:** 2026-05-07 | **Status:** Aceito

**Contexto:** O produto tem dois tipos de operação sistêmica distintos: CRUD/regras de negócio (request/response) e orquestração de workflow de mídia (event-driven, longa duração).

**Decisão:**
- `services/api` concentra toda a lógica de produto (todos os módulos + billing + tenants). É a API request/response consumida por apps e workers.
- `services/media-workflow` é exclusivo para o Módulo Mídia: recebe eventos do `api-local`, mantém state machine dos jobs, dispara e recebe callbacks do `infra/n8n`.

**Consequências:**
- `services/api` é o único serviço chamado diretamente por apps
- `services/media-workflow` nunca é chamado por apps — apenas reage a eventos
- Billing, planos e tenants são domínio interno do `services/api`
- Ciclos de deploy independentes entre os dois serviços
