# AD Ponte SaaS

SaaS multi-tenant para gestão de igrejas — administração, comunicação e produção de mídia para igrejas com múltiplas filiais.

> Documentação completa: [AGENTS.md](AGENTS.md) · [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Componentes

| Componente | Caminho | Tech | Runtime |
|---|---|---|---|
| Admin Web | `apps/admin-web` | Next.js 15 + Tailwind v4 | VPS / Coolify |
| Admin App | `apps/admin-app` | Expo (nativo) | iOS / Android |
| Member App | `apps/member-app` | Expo (nativo) | iOS / Android |
| API SaaS | `services/api` | Hono + tRPC + Prisma | VPS / Coolify |
| API Local | `services/api-local` | TBD | Mini-PC da igreja |
| Media Workflow | `services/media-workflow` | Hono + tRPC | VPS / Coolify |
| Worker Transcrição | `workers/media/transcript` | Python + faster-whisper | RunPod (GPU) |
| Worker FFmpeg | `workers/media/ffmpeg` | Python + FFmpeg | VPS / RunPod |
| Worker DaVinci | `workers/media/davinci` | Python + DaVinci API | VPS dedicado |
| Worker Imagens | `workers/media/images` | Python + OpenCV + PIL | VPS / Coolify |
| Telegram Bot | `workers/media/telegram-bot` | TBD | VPS / Coolify |
| Notificações | `workers/system/notifications` | TBD | VPS / Coolify |
| Sync | `workers/system/sync` | TBD | VPS / Coolify |
| Scheduled Jobs | `workers/system/scheduled-jobs` | TBD | VPS / Coolify |
| **Packages** | | | |
| api-client | `packages/api-client` | TypeScript | — (biblioteca) |
| auth | `packages/auth` | TypeScript | — (biblioteca) |
| core | `packages/core` | TypeScript | — (biblioteca) |
| db | `packages/db` | Prisma + TypeScript | — (biblioteca) |
| ui | `packages/ui` | TypeScript + Tailwind | — (biblioteca) |
| types | `packages/types` | TypeScript | — (biblioteca) |
| config | `packages/config` | TypeScript | — (biblioteca) |
| **Infra** | | | |
| n8n workflows | `infra/n8n` | JSON exports | VPS / Coolify |

---

## Quickstart

```bash
# Clonar com todos os submodules
git clone --recurse-submodules git@github.com:adponte-infra/saas.git saas
cd saas

# Instalar dependências
pnpm install

# Iniciar ambiente de desenvolvimento
pnpm dev
```

Workspace local completo (saas + site):

```bash
mkdir -p ~/dev/adponte && cd ~/dev/adponte
git clone git@github.com:adponte-infra/site.git
git clone --recurse-submodules git@github.com:adponte-infra/saas.git saas
```

---

## Comandos úteis

```bash
pnpm build        # turbo run build
pnpm lint         # turbo run lint
pnpm typecheck    # turbo run typecheck
pnpm test         # turbo run test
pnpm clean        # turbo run clean

git submodule update --init --recursive   # inicializar submodules
git submodule update --remote             # atualizar submodules
```
