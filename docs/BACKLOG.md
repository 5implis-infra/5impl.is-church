# Backlog — Itens para Spec Driven Development

> Estes itens requerem recursos externos, acessos ou decisões adicionais que
> impedem sua execução na sessão de planejamento atual.
> Cada item deve gerar uma **Spec** e/ou **PRD** antes de ser implementado.

---

## Como usar este documento

1. Cada seção é um **épico** que agrupa itens relacionados
2. Cada item indica: contexto, dependências, decisões abertas e sugestão de spec
3. Processar via framework Spec Driven para gerar PRDs antes de implementar

---

## ÉPICO 1 — Git Submodules & Repositórios GitHub

**Contexto:** O monorepo root precisará referenciar cada projeto como submodule.
Hoje `site/adponte.com` e `appmidia/transcript` têm repos locais com `.git` próprios,
mas não está confirmado se estão no GitHub. O repo root do monorepo ainda não existe.

**Dependências:**
- Organização ou conta GitHub definida (ex: `github.com/adponte/`)
- Decisão de naming dos repos (ex: `adponte/site`, `adponte/transcript`, `adponte/n8n`)
- Migração do histórico local para o GitHub

**Ações necessárias (gerar Spec):**
- [ ] Criar org/conta GitHub para o projeto
- [ ] Criar repo `adponte/monorepo` (root) como privado
- [ ] Criar repo `adponte/site` e fazer push do histórico existente
- [ ] Criar repo `adponte/transcript` e fazer push do histórico existente
- [ ] Criar repo `adponte/n8n` (novo, vazio inicialmente)
- [ ] Executar `git submodule add` para cada projeto no root
- [ ] Definir política de branches (main, develop, feature/*)
- [ ] Definir proteções de branch (PR obrigatório? reviews?)

**Decisões abertas:**
- Naming convention dos repos GitHub
- Estratégia de migração do histórico local (rebase, merge, --allow-unrelated-histories)
- Política de branch protection rules

---

## ÉPICO 2 — GHCR (GitHub Container Registry)

**Contexto:** O CI/CD fará build das imagens Docker e fará push para o GHCR.
O GHCR é gratuito para repos privados com limite de storage do plano GitHub.

**Dependências:**
- Repos GitHub criados (Épico 1)
- GitHub Actions configurado
- Secrets de autenticação no GHCR

**Ações necessárias (gerar Spec):**
- [ ] Definir naming convention das imagens (`ghcr.io/adponte/site:latest`)
- [ ] Definir estratégia de tagging (latest, sha, semver)
- [ ] Configurar `GITHUB_TOKEN` permissions para push ao GHCR
- [ ] Definir política de retenção de imagens (quantas versões manter)
- [ ] Configurar `packages` como privados na org GitHub

**Decisões abertas:**
- Tagging strategy: `latest` apenas, ou `sha` + `latest`?
- Multi-platform builds (linux/amd64 apenas, ou também arm64 para dev em Mac M-series)?

---

## ÉPICO 2B — RunPod: Deploy Automatizado via API

**Contexto:** O worker `transcript` roda no RunPod serverless. Após push da imagem para o GHCR,
o endpoint do RunPod precisa ser atualizado para usar a nova imagem. Hoje isso é feito manualmente
no dashboard do RunPod. A API do RunPod permite automatizar isso.

**Dependências:**
- GHCR configurado (Épico 2)
- RunPod API key disponível
- Endpoint RunPod do transcript identificado

**Ações necessárias (gerar Spec):**
- [ ] Obter RunPod API key e adicionar como GitHub Secret (`RUNPOD_API_KEY`)
- [ ] Identificar o Endpoint ID do worker transcript no RunPod
- [ ] Adicionar step no `docker.yml` do transcript para chamar RunPod API após push
- [ ] Testar rollback (trocar imagem para versão anterior via API)

---

## ÉPICO 3 — Coolify: Deploy via Docker + Webhooks

**Contexto:** O Coolify está rodando na VPS Hetzner. Precisamos migrar de
"deploy via integração GitHub direta" para "deploy via imagem Docker do GHCR + webhook".

**Dependências:**
- GHCR configurado (Épico 2)
- Acesso admin ao Coolify
- Imagens Docker funcionando

**Ações necessárias (gerar Spec):**
- [ ] Mapear serviços que já existem no Coolify (site, outros)
- [ ] Reconfigurar cada serviço para usar imagem GHCR em vez de build direto
- [ ] Configurar webhook URL do Coolify para cada serviço
- [ ] Adicionar webhook secret como GitHub Secret (`COOLIFY_WEBHOOK_SITE`, etc.)
- [ ] Definir variáveis de ambiente por serviço no Coolify
- [ ] Configurar zero-downtime restart policy
- [ ] Testar rollback via troca de tag de imagem

**Decisões abertas:**
- O site Astro tem variáveis de build-time (ex: `DIRECTUS_URL`) — como injetar no build do CI?
- Usar `DIRECTUS_URL` como build arg no Dockerfile ou como env var em runtime?

---

## ÉPICO 4 — Turborepo Remote Cache (Self-Hosted)

**Contexto:** `ducktors/turborepo-remote-cache` é um servidor open source compatível
com a API de cache do Turborepo. Será hospedado na VPS via Docker.

**Dependências:**
- VPS Hetzner acessível
- Domínio ou subdomínio configurado (ex: `turbo-cache.adponte.com.br`)
- Docker/Coolify na VPS

**Ações necessárias (gerar Spec):**
- [ ] Deploy do `ducktors/turborepo-remote-cache` via Docker na VPS
- [ ] Configurar storage (disco local ou Cloudflare R2 como backend)
- [ ] Configurar domínio + SSL (via Coolify/Traefik)
- [ ] Gerar token de autenticação
- [ ] Adicionar variáveis ao GitHub Secrets: `TURBO_API`, `TURBO_TOKEN`, `TURBO_TEAM`
- [ ] Configurar `.env.turbo` local para devs (gitignored)
- [ ] Documentar setup para onboarding de novos devs

**Decisões abertas:**
- Backend de storage: disco local vs Cloudflare R2 (R2 tem vantagens de redundância)
- Política de expiração do cache (TTL padrão é 7 dias)

---

## ÉPICO 5 — nektos/act: CI Local End-to-End

**Contexto:** O `act` permite rodar GitHub Actions localmente. Alguns steps
precisam de adaptação para funcionar corretamente no ambiente local.

**Dependências:**
- `act` instalado na máquina do desenvolvedor
- Docker disponível localmente
- `.secrets.act` com tokens de teste

**Ações necessárias (gerar Spec):**
- [ ] Documentar instalação do `act` (brew, apt, etc.)
- [ ] Criar `.secrets.act.example` com lista de secrets necessários (sem valores)
- [ ] Testar cada workflow com `act` e documentar limitações conhecidas
- [ ] Configurar registry local (ou usar Docker Hub) para testar push de imagem no `act`
- [ ] Definir quais jobs têm `if: ${{ !env.ACT }}` (deploy, etc.)
- [ ] Adicionar `act` ao onboarding docs

**Decisões abertas:**
- Usar imagem `catthehacker/ubuntu:act-latest` ou imagem customizada?
- Registry local para testes de push: Docker Hub pessoal, registry local (registry:2), ou pular?

---

## ÉPICO 5B — n8n: Exportar Workflows Existentes

**Contexto:** O n8n já está rodando na VPS com workflows criados. Esses workflows precisam
ser exportados e versionados no repositório `workers/n8n/workflows/`.

**Dependências:**
- Repo `workers/n8n` criado (Épico 1)
- Acesso admin ao n8n na VPS

**Ações necessárias:**
- [ ] Acessar n8n na VPS e listar todos os workflows existentes
- [ ] Exportar cada workflow como JSON (Settings → Download)
- [ ] Nomear os arquivos seguindo a convenção definida no README
- [ ] Commitar os JSONs no repo `workers/n8n`
- [ ] Verificar se algum workflow contém credenciais hardcoded (sanitizar antes de commitar)

**Convenção de nomes sugerida:** `{etapa}-{descricao-kebab-case}.json`
Ex: `03-orquestracao-upload.json`, `07-pos-processamento-telegram.json`

---

## ÉPICO 5C — n8n: Sync Automático via API

**Contexto:** Atualmente o versionamento é manual (exportar JSON → commitar).
O n8n tem API REST que permite importar/exportar workflows programaticamente.
Isso pode ser automatizado via GitHub Actions.

**Dependências:**
- Épico 5B concluído
- n8n API key configurada

**Ações necessárias (gerar Spec):**
- [ ] Gerar API key no n8n self-hosted
- [ ] Adicionar como GitHub Secret (`N8N_API_KEY`, `N8N_BASE_URL`)
- [ ] Criar script de import (`scripts/import-workflows.sh`) — push do repo para o n8n
- [ ] Criar script de export (`scripts/export-workflows.sh`) — pull do n8n para o repo
- [ ] Adicionar GitHub Actions workflow para auto-deploy ao n8n após merge na main
- [ ] Avaliar: usar `n8n export:workflow` CLI ou API REST diretamente?

---

## ÉPICO 6 — Projetos futuros do pipeline (flow.md)

**Contexto:** O pipeline de mídia em `appmidia/flow.md` descreve etapas que
ainda não têm projetos criados. Cada um precisará de uma sessão de planejamento
e um PRD antes do scaffolding.

| Etapa | Projeto | Caminho | Notas |
|-------|---------|---------|-------|
| 2 — Ingestão | App de upload (PWA) | `apps/ingest/` | Tech stack indefinida (React? Expo?) |
| 5A — Cortes | Worker FFmpeg | `workers/ffmpeg/` | Python ou Go + FFmpeg |
| 5B — Composition | Worker DaVinci | `workers/davinci/` | Python + DaVinci API |
| 6 — Imagens | Worker de imagens | `workers/images/` | Python + OpenCV + PIL |
| 7/8 — Aprovação | Telegram Bot | `workers/telegram-bot/` | Python (python-telegram-bot) ou JS |

**Ações necessárias (gerar PRD para cada):**
- [ ] Definir tech stack de cada worker
- [ ] Definir contratos de API entre workers (inputs/outputs)
- [ ] Definir schema de Jobs/Events no `packages/types`
- [ ] Definir comunicação: fila de mensagens? webhooks? polling?
- [ ] Definir onde cada worker roda (VPS, RunPod, local)

---

## ÉPICO 7 — Domínios, DNS e SSL

**Contexto:** O monorepo introduz novos serviços (cache server, ingest app, etc.)
que precisarão de subdomínios e certificados SSL.

**Ações necessárias (gerar Spec):**
- [ ] Mapear todos os subdomínios necessários
- [ ] Configurar DNS (Cloudflare?)
- [ ] Confirmar que Coolify/Traefik está gerenciando SSL via Let's Encrypt
- [ ] Definir domínio base (adponte.com.br? adponte.com?)

---

## Legenda de prioridade (sugerida para PRDs)

| Prioridade | Épicos |
|-----------|--------|
| P0 — Bloqueante | Épico 1 (Git/GitHub), Épico 2 (GHCR) |
| P1 — Necessário para CI | Épico 3 (Coolify), Épico 4 (Cache) |
| P2 — Qualidade de vida | Épico 5 (act local) |
| P3 — Futuro | Épico 6 (novos projetos), Épico 7 (DNS) |
