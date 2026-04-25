# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **AD Ponte SaaS monorepo** — a multi-tenant SaaS for churches.
The site (`adponte-infra/site`) is a **separate, independent repo** and is **not** part of this monorepo.

This repo (`adponte-infra/saas`) is the SaaS aggregator and uses Git submodules:
each app, service, worker, and shared package is its own GitHub repo, referenced
via `.gitmodules`.

## Layout

```
saas/                                 ← this repo (adponte-infra/saas)
├── apps/
│   ├── admin-web/         (Next.js 15 — internal admin web)
│   ├── admin-app/         (Expo — internal admin mobile/PWA)
│   └── member-app/        (Expo — member-facing mobile/PWA)
├── services/
│   ├── api/               (Hono + tRPC + Prisma — main SaaS API)
│   ├── api-local/         (local API on church mini-PC)
│   └── control-plane/     (provisioning, tenants, billing)
├── workers/
│   ├── media/
│   │   ├── transcript/    (Python + faster-whisper, RunPod)
│   │   ├── ffmpeg/        (Python + FFmpeg)
│   │   ├── davinci/       (Python + DaVinci API)
│   │   ├── images/        (Python + OpenCV + PIL)
│   │   └── telegram-bot/  (Python or Node)
│   └── system/
│       ├── notifications/ (push, email, WhatsApp, Telegram)
│       ├── sync/          (external sync jobs)
│       └── scheduled-jobs/(cron jobs)
├── packages/
│   ├── api-client/        (HTTP/RPC client for apps)
│   ├── auth/              (roles, permissions, sessions)
│   ├── core/              (shared business rules)
│   ├── db/                (Prisma schema, migrations, queries)
│   ├── ui/                (design system)
│   ├── types/             (shared TypeScript types)
│   └── config/            (ESLint, TSConfig, Prettier presets)
├── infra/
│   ├── n8n/               (n8n workflow JSON exports — submodule)
│   ├── docker/            (internal — shared Docker configs)
│   ├── postgres/          (internal — Postgres init/migrations)
│   └── deploy/            (internal — Coolify webhook helpers)
└── docs/
    ├── PLAN.md
    ├── ARCHITECTURE.md
    ├── EXECUTION-ROADMAP.md
    └── ...
```

Each `apps/*`, `services/*`, `workers/**/*`, `packages/*`, and `infra/n8n` is a Git submodule.
`infra/docker`, `infra/postgres`, `infra/deploy` are regular directories versioned in this repo.

## Tooling

- **Package manager:** pnpm (`pnpm-workspace.yaml`)
- **Build orchestration:** Turborepo (`turbo.json`)
- **TypeScript base config:** `tsconfig.base.json`
- **Local CI:** `nektos/act` (`.actrc` configured; `.secrets.act` is gitignored)
- **CI/CD:** GitHub Actions → GHCR → Coolify webhook
- **Hosting:** Hetzner VPS via Coolify

## Common commands (run from this repo root)

```bash
pnpm install              # Install all workspace deps
pnpm dev                  # turbo run dev
pnpm build                # turbo run build
pnpm lint                 # turbo run lint
pnpm typecheck            # turbo run typecheck
pnpm test                 # turbo run test
pnpm clean                # turbo run clean

# Submodule management
git submodule update --init --recursive
git submodule update --remote
```

## Cloning

```bash
git clone --recurse-submodules git@github.com:adponte-infra/saas.git saas
```

For the full local workspace alongside the site:

```bash
mkdir -p ~/dev/adponte
cd ~/dev/adponte
git clone git@github.com:adponte-infra/site.git
git clone --recurse-submodules git@github.com:adponte-infra/saas.git saas
```

## Key Documents

- `docs/PLAN.md` — Architecture plan and decisions
- `docs/ARCHITECTURE.md` — ADRs (Architecture Decision Records)
- `docs/EXECUTION-ROADMAP.md` — Migration roadmap (saas/site separation)
- `docs/flow.md` — Media production pipeline diagram
- `docs/mapa-mental.md` — Product mental map

## Important reminders

- The `site` is a **separate repo**, not a submodule of this monorepo.
- Always run `git submodule update --init --recursive` after cloning.
- When updating a submodule, commit the new submodule pointer in this repo.
- The `monorepo` repo name is legacy; this is conceptually the `saas` aggregator.
