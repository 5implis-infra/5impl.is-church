# Architecture Decision Records (ADRs)

> Registra as decisões arquiteturais relevantes do monorepo AD Ponte.

---

## ADR-001 — Estratégia Git: Submodules

**Data:** 2026-04-16
**Status:** Aceito

### Contexto
O repositório contém projetos com stacks completamente diferentes (Astro, Next.js, Python, n8n)
que evoluem em ritmos distintos e podem ter colaboradores diferentes.

### Decisão
Usar **Git Submodules**. Cada projeto é um repositório GitHub privado independente.
O root do monorepo (`adponte`) referencia cada projeto como submodule via `.gitmodules`.

### Consequências
- Cada projeto mantém seu próprio histórico, issues e CI/CD
- `git clone --recurse-submodules` é necessário para clonar tudo
- Atualizações de submodule requerem commit no root: `git submodule update --remote`
- CI do root usa `actions/checkout` com `submodules: recursive`

---

## ADR-002 — Estrutura de Diretórios

**Data:** 2026-04-16
**Status:** Aceito

### Decisão
Estrutura Turborepo convencional com adição de `services/`:

| Diretório | Propósito |
|-----------|-----------|
| `apps/` | Aplicações user-facing (site, gestão, captura) |
| `services/` | Serviços com estado próprio (n8n, control-plane, API local) |
| `workers/` | Workers stateless de processamento (transcript, ffmpeg, etc.) |
| `packages/` | Pacotes internos compartilhados (types, etc.) |

### Nota de migração
Projetos existentes ainda estão em `site/` e `appmidia/`. A migração para a estrutura
final acontece durante o setup de submodules (ver `BACKLOG.md` Épico 1).

---

## ADR-003 — CI/CD: GitHub Actions + GHCR + Coolify

**Data:** 2026-04-16
**Status:** Aceito

### Decisão
```
push → GitHub Actions (build + push imagem → GHCR) → webhook → Coolify pull + deploy
```

- **Build:** fora da VPS (GitHub Actions runners) — não consome recursos do servidor
- **Registry:** GHCR (GitHub Container Registry) — gratuito para repos privados
- **Deploy:** Coolify recebe webhook → pull nova imagem → zero-downtime restart
- **CI local:** nektos/act com `.actrc` e `.secrets.act` (gitignored)
- **Steps de deploy** usam `if: ${{ !env.ACT }}` para não rodar localmente

### GitHub Secrets necessários por projeto
| Secret | Propósito |
|--------|-----------|
| `TURBO_API` | URL do Turborepo Remote Cache |
| `TURBO_TOKEN` | Token de autenticação do cache |
| `TURBO_TEAM` | Team ID do Turborepo |
| `COOLIFY_TOKEN` | Token de autenticação do Coolify |
| `COOLIFY_WEBHOOK_*` | URL de webhook por serviço |

---

## ADR-004 — Turborepo Remote Cache: Self-Hosted

**Data:** 2026-04-16
**Status:** Planejado (ver BACKLOG.md Épico 4)

### Decisão
Usar `ducktors/turborepo-remote-cache` na própria VPS Hetzner.
Evita rebuilds desnecessários entre máquinas locais e CI.

### Configuração (quando provisionado)
```bash
TURBO_API=https://turbo-cache.seudominio.com
TURBO_TOKEN=<token>
TURBO_TEAM=adponte
```

---

## ADR-005 — Site Astro: Modo Hybrid

**Data:** 2026-04-16
**Status:** Aceito

### Decisão
`output: 'hybrid'` com `@astrojs/node` adapter.
- Páginas são SSG por padrão
- Páginas com `export const prerender = false` viram SSR pontualmente
- Rebuild de conteúdo via webhook Directus → `repository_dispatch` → CI

### Deploy
Container Node.js (`node:22-alpine`), não Nginx.
Directus na mesma VPS — comunicação via rede Docker interna do Coolify.

---

## ADR-006 — Produto: SaaS Multi-Tenant

**Data:** 2026-04-16
**Status:** Aceito

### Decisão
O ecossistema nasce como produto SaaS para múltiplas igrejas.
Multi-tenancy via `churchId` / `slug` em todos os modelos.

### Stack do produto Gestão
- **Web:** Next.js 15 + Tailwind CSS 4
- **App/PWA:** TBD
- **API:** Hono + tRPC + Prisma (PostgreSQL)
- **Estrutura:** mini-monorepo interno em `apps/gestao/`
