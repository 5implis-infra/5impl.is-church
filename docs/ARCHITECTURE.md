# Architecture Decision Records (ADRs)

> Registra as decisões arquiteturais relevantes do monorepo AD Ponte.
> Atualizado em: 2026-04-25 — migração para v2.

---

## ADR-001 — Estratégia Git: Submodules (escopo `saas`)

**Data:** 2026-04-16
**Revisão:** 2026-04-25 — escopo restrito ao `saas`; `site` é repo independente
**Status:** Aceito

### Contexto
O `saas` contém projetos com stacks completamente diferentes (Next.js, Expo, Hono, Python)
que evoluem em ritmos distintos e podem ter colaboradores diferentes.

### Decisão
Usar **Git Submodules** apenas dentro do `saas`. Cada componente é um repositório GitHub
privado independente. O root do `saas` (`adponte-infra/monorepo`) referencia cada
componente como submodule via `.gitmodules`.

O `site` é um repo Git independente, sem submodules. Não compõe o monorepo SaaS.

### Consequências
- Cada projeto mantém seu próprio histórico, issues e CI/CD
- `git clone --recurse-submodules` é necessário para clonar tudo
- Atualizações de submodule requerem commit no root: `git submodule update --remote`
- CI do root usa `actions/checkout` com `submodules: recursive`

---

## ADR-002 — Estrutura de Diretórios

**Data:** 2026-04-16
**Revisão:** 2026-04-25 — Migração para v2
**Status:** Aceito

### Decisão
Estrutura Turborepo com organização por domínio:

| Diretório | Propósito |
|-----------|-----------|
| `apps/` | Aplicações user-facing (admin-web, admin-app, member-app) |
| `services/` | Serviços com estado próprio (api, api-local, control-plane) |
| `workers/media/` | Workers de processamento de mídia (transcript, ffmpeg, etc.) |
| `workers/system/` | Workers de sistema (notifications, sync, scheduled-jobs) |
| `packages/` | Pacotes internos compartilhados (types, db, auth, etc.) |
| `infra/` | Infraestrutura (n8n, docker, postgres, deploy) |

### Mudanças na v2
- Fim do mini-monorepo `apps/gestao`: cada componente promovido a repo próprio
- Workers agrupados por domínio: `media/` e `system/`
- Novos packages: `api-client`, `auth`, `core`, `ui`, `config`
- `services/n8n` migrado para `infra/n8n`
- `services/media-local` renomeado para `services/api-local`
- `apps/site` separado do monorepo SaaS (repo independente)
- Adicionado `tsconfig.base.json` no root

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
**Status:** Planejado (ver BACKLOG.md)

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

## ADR-005 — Site Astro: Repo Totalmente Independente

**Data:** 2026-04-16
**Revisão:** 2026-04-25 — Separação total de `saas` e `site`
**Status:** Aceito

### Contexto
`site` e `saas` têm stack, design, propósito, workflow de delivery e cadência de
deploy completamente diferentes. Compartilham apenas contexto de cliente.

### Decisão
`site` é um repositório Git **totalmente independente** (`adponte-infra/site`).
Não compõe nenhum monorepo, não tem submodules, e não compartilha workspace,
Turbo, pnpm-workspace ou tsconfig com o `saas`.

Localmente, ficam em pastas irmãs (`adponte/site` e `adponte/saas`) apenas por
conveniência operacional.

### Stack do site
- Astro Hybrid (`output: 'hybrid'` + `@astrojs/node` adapter)
- Páginas SSG por padrão; SSR pontual com `export const prerender = false`
- Tailwind CSS
- Directus como CMS

### Deploy
- Container Node.js (`node:22-alpine`), não Nginx
- VPS Hetzner via Coolify
- Directus na mesma VPS — comunicação via rede Docker interna do Coolify
- Rebuild de conteúdo via webhook Directus → `repository_dispatch` → CI

---

## ADR-006 — Produto: SaaS Multi-Tenant

**Data:** 2026-04-16
**Status:** Aceito

### Decisão
O ecossistema nasce como produto SaaS para múltiplas igrejas.
Multi-tenancy via `churchId` / `slug` em todos os modelos.

### Stack do produto
- **Admin Web:** Next.js 15 + Tailwind CSS 4
- **Admin App:** Expo (mobile/PWA)
- **Member App:** Expo (mobile/PWA)
- **API:** Hono + tRPC + Prisma (PostgreSQL)
- **Auth:** TBD (Better Auth? Clerk?)

---

## ADR-007 — Granularidade Git no `saas`: 1 Repo por Componente

**Data:** 2026-04-25
**Status:** Aceito

### Contexto
Na v1, o repo `gestao` era um mini-monorepo interno com múltiplos apps/services/packages.
Isso criava acoplamento entre componentes com ciclos de release diferentes.

### Decisão
Dentro do `saas`, cada app, service, worker e package relevante é um repo Git independente.
O monorepo agregador (`saas/`) referencia todos como submodules.

### Consequências
- 22 submodules no monorepo agregador `saas`
- Cada componente pode evoluir, ser deployado e ter CI/CD independente
- Requer `git submodule update --remote` para sincronizar mudanças
- `pnpm-workspace.yaml` usa globs para cobrir todos os paths

---

## ADR-008 — Separação completa de `site` e `saas`

**Data:** 2026-04-25
**Status:** Aceito

### Contexto
`site` e `saas` são produtos do mesmo cliente, mas têm stack, design, propósito,
workflow de delivery e cadência de deploy completamente diferentes. Não há código
compartilhado nem ciclo de release coordenado.

### Decisão
`site` e `saas` são repositórios Git **completamente independentes**:

- `adponte-infra/site` — repo do site Astro
- `adponte-infra/monorepo` — repo do SaaS (com submodules internos)

Não existe um terceiro repo agregador acima dos dois. A pasta local
`adponte/` é apenas conveniência de workspace, sem versionamento.

### Consequências
- Cada produto tem ciclo de vida 100% independente
- CI/CD, deploys, secrets e ownership separados
- Configs locais (`.agent/`, `.claude/`, `.opencode/`) podem ser duplicadas em cada repo
- O nome do repo `monorepo` é legado; semanticamente representa o SaaS
