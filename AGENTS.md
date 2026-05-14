# AGENTS.md — AD Ponte SaaS

Contexto de domínio, arquitetura e decisões do monorepo `adponte-infra/saas`.
Leitura recomendada antes de trabalhar em qualquer parte do sistema.

---

## Produto

**AD Ponte** é um SaaS multi-tenant para gestão de igrejas. Cada cliente é uma **church** (organização religiosa independente), que pode ter uma sede e múltiplas **filiais**. O sistema oferece módulos de gestão administrativa, comunicação com membros e produção automatizada de conteúdo de mídia.

O produto é acessado em três superfícies: web admin (`admin-web`), app nativo para liderança (`admin-app`) e app nativo para membros (`member-app`). Todas consomem exclusivamente o `services/api`.

---

## Conceitos de Domínio

| Conceito | Definição |
|---|---|
| **church** | Unidade tenant do sistema. Cada igreja é um cliente independente com dados isolados. Identificada por `churchId` / `slug` em todos os modelos. |
| **filial** | Sub-unidade de uma church. Um usuário pode ter acesso a múltiplas filiais com perfis diferentes em cada uma. |
| **plano de assinatura** | Define módulos disponíveis, limites de usuários, filiais, armazenamento e funcionalidades por tenant. |
| **operador** | Usuário do tipo gerencial (liderança, staff). Acessa o sistema em Modo Administrativo e pode receber perfis de acesso a filiais. |
| **membro** | Usuário do tipo não-gerencial. Acessa o sistema em Modo Membro via `member-app`. Não recebe perfis de acesso. |
| **perfil de acesso** | Conjunto de permissões granulares vinculado a um operador em uma filial específica. Pode ser predefinido ou personalizado. |

### Modos de operação

| Modo | Audiência | Apps |
|---|---|---|
| **Administrativo** | Operadores com perfil configurado | `admin-web`, `admin-app` |
| **Membro** | Membros autenticados | `member-app` |
| **Anônimo** | Visitantes não autenticados | `member-app` (público) |

---

## Módulos do Produto

| Módulo | Descrição |
|---|---|
| **Pessoas** | Membros, visitantes, liderança, células e funções ministeriais |
| **Eventos e Cultos** | Eventos únicos, recorrentes e em série; cultos como tipo especial de evento |
| **Financeiro** | Contas, categorias, centros de custo, receitas/despesas, PIX, boleto, cartão |
| **Cursos** | Grades curriculares, turmas, inscrições, material didático, cronograma vinculado a agenda |
| **Pastoral** | Atendimentos, prontuários, histórico de visitas pastorais |
| **Teologia** | Publicações, artigos em série, credos, sistema de comentários |
| **Agendas** | Múltiplas agendas, integração Google Calendar, agenda geral e pública virtuais |
| **Notificações** | Eventos sistêmicos com pub/subscriber, templates, automações, canais configuráveis por usuário |
| **Mídia** | Captura, ingestão, processamento automatizado de vídeo e imagens, publicação social |
| **Plataforma** | Multi-tenancy, billing, onboarding de igrejas, domínios personalizados |

---

## Arquitetura — Mapa de Ownership

```
┌──────────────┐  ┌──────────────┐  ┌────────────────┐
│  admin-web   │  │  admin-app   │  │   member-app   │
│  (Next.js)   │  │    (Expo)    │  │     (Expo)     │
│  tudo gerenc.│  │  gerencial   │  │    membro +    │
│  + admin     │  │  (subset web)│  │    anônimo     │
└──────┬───────┘  └──────┬───────┘  └───────┬────────┘
       └─────────────────┼──────────────────┘
                         ▼
               ┌──────────────────┐
               │  services/api    │  ← ÚNICO ponto de entrada
               │  Hono + tRPC     │    para todos os apps
               │  + Prisma        │
               └──────┬───────────┘
                      │
         ┌────────────┼────────────────────┐
         ▼            ▼                    ▼
    PostgreSQL   services/               infra/n8n
    (Prisma)     media-workflow          (orquestração
                 (event-driven,           de workflows)
                  nunca chamado
                  diretamente)
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
   workers/media:  Cloudflare   Postiz
   transcript,     R2 / S3      (publicação
   ffmpeg,         (storage)     social)
   images,
   davinci,
   telegram-bot
```

**`services/api-local`** roda no mini-PC da igreja (sem internet dedicada), recebe mídia via Wi-Fi local e envia eventos para `services/media-workflow`.

### Responsabilidades por serviço

| Serviço | Dono de quê |
|---|---|
| `services/api` | Toda a lógica de produto: todos os módulos, billing, tenants, auth, perfis |
| `services/media-workflow` | State machine de jobs de mídia; orquestra workers via n8n; nunca chamado por apps |
| `services/api-local` | Recebimento de mídia no local da igreja (Wi-Fi); relay para media-workflow |
| `workers/media/*` | Execução de etapas da pipeline (transcrição, corte, renderização, imagens) |
| `workers/system/*` | Notificações, sincronizações externas, jobs agendados |
| `infra/n8n` | Orquestração visual de workflows; disparado e controlado pelo media-workflow |
| `packages/db` | Schema Prisma, migrations, queries compartilhadas |
| `packages/auth` | Roles, permissões, sessões — consumido pelo services/api |
| `packages/api-client` | Cliente HTTP/RPC para apps consumirem o services/api |

---

## Fluxo de Dados — Pipeline de Mídia (resumo)

```
Igreja (culto/evento)
  │
  ▼
1. Captura: iPhone/Android, YouTube Live, Stream Deck (timestamps JSON)
  │
  ▼
2. Ingestão: upload via app (Wi-Fi local → api-local → R2)
  │
  ▼
3. Orquestração: services/media-workflow detecta upload → cria job → aciona n8n
  │
  ▼
4. Análise IA: transcript (Whisper) + detecção de silêncio/aplausos + sugestão LLM → EDL
  │
  ├─── 5A. Shorts: worker-ffmpeg (cortes, 9:16, SRT burn-in)
  └─── 5B. Reels/Aftermovie: worker-davinci (DaVinci Resolve headless)
  │
  ▼
6. Imagens: worker-images (seleção automática, crop, ajuste de cor)
  │
  ▼
7. Pós: thumbnail + título/descrição/hashtags via LLM
  │
  ▼
8. Aprovação: Telegram Bot (preview + botões Aprovar/Reprocessar)
  │
  ▼
9. Publicação: Postiz self-hosted → Instagram, YouTube Shorts, Feed, Stories
```

Diagrama completo: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Stack por Camada

| Camada | Tecnologia | Onde se aplica |
|---|---|---|
| Linguagem (apps/services) | TypeScript 5.x, ESM (`"type": "module"`) | Todos os apps, services e packages |
| Linguagem (workers mídia) | Python 3.10+ | `workers/media/*` |
| Linguagem (workers sistema) | TBD (TypeScript ou Python) | `workers/system/*` |
| Runtime JS | Node.js (LTS) | services, packages |
| Framework web (admin) | Next.js 15 + React 19 | `apps/admin-web` |
| Framework mobile | Expo (nativo) | `apps/admin-app`, `apps/member-app` |
| API framework | Hono + tRPC v11 | `services/api`, `services/media-workflow` |
| ORM | Prisma v6 | `services/api`, `packages/db` |
| Banco de dados | PostgreSQL | Produção VPS |
| Estilização | Tailwind CSS v4 | `apps/admin-web`, `packages/ui` |
| Validação | Zod v3 | Todos os serviços TS |
| Orquestração workflows | n8n (self-hosted) | `infra/n8n` |
| Storage de mídia | Cloudflare R2 (S3-compatible) | workers de mídia |
| Package manager | pnpm + pnpm-workspace | Monorepo root |
| Build orchestration | Turborepo | Monorepo root |
| Containers | Docker + docker-compose | Todos os componentes deployáveis |
| Registry | GHCR (GitHub Container Registry) | Todas as imagens Docker |
| CI/CD | GitHub Actions → GHCR → Coolify webhook | Todos os submodules |
| CI local | nektos/act (`.actrc` + `.secrets.act`) | Monorepo root |
| Hosting | Hetzner VPS via Coolify | Todos os serviços VPS |
| Hosting GPU | RunPod (serverless) | `workers/media/transcript`, `workers/media/ffmpeg` |
| Turbo cache | ducktors/turborepo-remote-cache (self-hosted) | CI e builds locais |
| Linter Python | ruff + mypy | `workers/media/*` |

---

## TBDs

Decisões ainda não tomadas. Não assuma uma implementação sem confirmar.

| Área | Status | Possíveis abordagens |
|---|---|---|
| **Autenticação (biblioteca)** | TBD | Better Auth, Lucia, Auth.js v5, solução própria com JWT + Hono middleware |
| **Gateway de pagamentos** | TBD | Asaas (foco BR), Pagar.me, Stripe + Pagar.me para PIX |
| **Isolamento multi-tenancy no banco** | TBD | Schema único + `church_id` em todas as tabelas (mais simples), ou schemas separados por tenant (mais isolado) |
| **Stack de notificações** | TBD | Workers sistema com Node.js/TS; canais: Resend (email), FCM (push), Evolution API ou Twilio (WhatsApp) |
| **Telegram bot (linguagem)** | TBD | Python (consistente com workers de mídia) ou Node.js (consistente com API) |
| **api-local (stack)** | TBD | Hono leve (consistente com services/api) ou framework minimalista para edge/low-resource |

---

## Padrões de Código

### TypeScript (apps, services, packages)

- Todos os packages usam `"type": "module"` (ESM puro)
- `tsconfig.base.json` na raiz define configuração base; cada projeto estende
- `tsx` para desenvolvimento local (watch mode)
- Sem comentários óbvios; use nomes descritivos
- Validação de input com Zod nos boundaries (APIs, formulários)

### Python (workers de mídia)

- Python 3.10+ obrigatório
- Linter: `ruff` (line-length 100, rules: E, F, I, UP)
- Tipagem: `mypy` com `ignore_missing_imports = true`
- `pyproject.toml` como manifesto (não `setup.py`)
- uv ou pip para gerenciar dependências

### Containers (todos os workers e services)

- Cada worker/service deployável tem `Dockerfile` e `docker-compose.yml` próprios
- Imagens publicadas no GHCR via GitHub Actions
- Deploy via Coolify webhook (pull nova imagem + restart)

---

## Comandos Essenciais

```bash
# Workspace
pnpm install              # instalar dependências
pnpm dev                  # turbo run dev (todos os projetos)
pnpm build                # turbo run build
pnpm lint                 # turbo run lint
pnpm typecheck            # turbo run typecheck
pnpm test                 # turbo run test
pnpm clean                # turbo run clean

# Submodules
git submodule update --init --recursive   # inicializar após clone
git submodule update --remote             # atualizar ponteiros

# Clone completo
git clone --recurse-submodules git@github.com:adponte-infra/saas.git saas
```

---

## Repositórios e Submodules

O `saas` é o monorepo agregador. Cada componente é um repo GitHub independente.

**Agregador:** `adponte-infra/saas` → `saas/`

**Apps (3):** `admin-web` · `admin-app` · `member-app`

**Services (3):** `api` · `api-local` · `media-workflow`

**Workers mídia (5):** `transcript` · `worker-ffmpeg` · `worker-davinci` · `worker-images` · `worker-telegram-bot`

**Workers sistema (3):** `worker-notifications` · `worker-sync` · `worker-scheduled-jobs`

**Packages (7):** `api-client` · `auth` · `core` · `db` · `ui` · `types` · `config`

**Infra (1):** `n8n`

Total: 22 submodules. Ver `.gitmodules` para URLs completas.

---

## Specs Relacionados

| Spec | Descrição |
|---|---|
| [monorepo-agent-context](../openspec/specs/monorepo-agent-context/spec.md) | Contexto de agente, domínio, TBDs, padrões de código |
| [monorepo-root-readme](../openspec/specs/monorepo-root-readme/spec.md) | Porta de entrada, quickstart, tabela de componentes |
| [monorepo-architecture-doc](../openspec/specs/monorepo-architecture-doc/spec.md) | Documentação arquitetural formal |
| [project-initial-documentation](../openspec/specs/project-initial-documentation/spec.md) | Requisitos de documentação para novos projetos |
| [documentation-source-of-truth](../openspec/specs/documentation-source-of-truth/spec.md) | Hierarquia de documentação e regras de ownership |

---

## Notas Importantes

- O `site` institucional (`adponte-infra/site`) é um repo Git **completamente independente** — não é submodule, não compartilha workspace com o `saas`.
- Ao atualizar um submodule, commitar o novo ponteiro no root do `saas`.
- `infra/docker`, `infra/postgres`, `infra/deploy` são diretórios regulares versionados no root (não submodules).
- O nome "monorepo" é legacy; este repo é conceitualmente o "saas aggregator".
- O prefixo de pacote `@gestao/*` em alguns submodules é legacy — o padrão atual é `@adponte/*`.
