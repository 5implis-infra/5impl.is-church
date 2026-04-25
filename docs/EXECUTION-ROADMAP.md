# Roteiro de Execução — Separação `saas` e `site`

> Atualizado em: 2026-04-25
> Status: ✅ Concluído — `saas` e `site` separados em repos independentes

## Decisão arquitetural

- `site` e `saas` são repos **totalmente independentes**
- `adponte-infra/monorepo` foi reaproveitado como o repo do `saas`
- `adponte/` é apenas pasta local de trabalho, sem versionamento
- Compartilham contexto de cliente, não estrutura de código

## Layout local final

```
/home/itbrda/dev/adponte/
├─ saas/   # repo: adponte-infra/monorepo (reaproveitado como SaaS)
└─ site/   # repo: adponte-infra/site
```

---

## Etapa 0 — Congelamento e decisão final ✅

- [x] Confirmar que `site` e `saas` serão repos totalmente independentes
- [x] Confirmar que `adponte-infra/monorepo` será reaproveitado como repo do `saas`
- [x] Confirmar que `adponte/` será apenas pasta local de trabalho
- [x] Confirmar destino dos diretórios locais não versionados:
  - [x] `.agent/` — copiar para ambos
  - [x] `.claude/` — copiar para ambos (saas usa o do monorepo; site mantém o próprio)
  - [x] `.opencode/` — copiar para ambos
  - [x] `node_modules/` — não move (regenera)

---

## Etapa 1 — Atualização do plano e documentação-base ✅

- [x] Atualizar `docs/PLAN.md`
- [x] Remover a ideia de "monorepo contendo `site` + `saas`"
- [x] Renomear seção estrutural para refletir "repositórios independentes"
- [x] Deixar explícito:
  - [x] `site/` = repo independente
  - [x] `saas/` = repo independente
  - [x] `adponte/` = pasta local não versionada
- [x] Atualizar `docs/ARCHITECTURE.md` (ADR-001, ADR-005, ADR-008 novo)
- [x] Revisar a seção de repositórios GitHub
- [x] Revisar instruções de clone/bootstrap

---

## Etapa 2 — Auditoria e commit do estado atual ✅

- [x] Registrar `git status` atual
- [x] Registrar `git submodule status` atual (22 submodules)
- [x] Commit do estado v2 atual antes da movimentação
- [x] Commit hash: `1497ded chore(saas): migrate to v2 structure with separated submodules`

---

## Etapa 3 — Mapeamento de arquivos por repo ✅

### Grupo A — apenas `saas/`
- [x] `.gitmodules`
- [x] `pnpm-workspace.yaml`
- [x] `turbo.json`
- [x] `tsconfig.base.json`
- [x] `apps/`, `services/`, `workers/`, `packages/`, `infra/`, `docs/`

### Grupo B — apenas `site/`
- [x] estrutura Astro (`src/`, `public/`, `lib/`, etc.)
- [x] configs próprias (`astro.config.mjs`, `tsconfig.json`, `eslint.config.js`)
- [x] workflows próprios em `.github/workflows/`

### Grupo C — copiados para ambos
- [x] `.agent/` — workflows OpenSpec
- [x] `.opencode/` — comandos e skills OpenCode
- `.claude/` — site mantém o próprio (`nazareth/`, `prompts/`); saas mantém o do monorepo (`commands/opsx/`, `skills/`)

---

## Etapa 4 — Reestruturação física do workspace ✅

- [x] Criar `saas/` em `/home/itbrda/dev/adponte/saas`
- [x] Mover repo atual para `saas/`:
  - [x] `.git`, `.github`, `.gitignore`, `.gitmodules`, `.actrc`
  - [x] `apps/`, `services/`, `workers/`, `packages/`, `infra/`, `docs/`, `openspec/`
  - [x] `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, `tsconfig.base.json`, `CLAUDE.md`
- [x] Garantir que `.git` acompanhou para `saas/`
- [x] Confirmar que root Git agora é `adponte/saas`
- [x] `adponte/` ficou sem ser repo Git
- [x] `node_modules/` antigo removido
- [x] Dotfolders `.agent/`, `.claude/`, `.opencode/` copiados para `saas/`

---

## Etapa 5 — Materialização do repo `site/` ✅

- [x] Clone: `git clone git@github.com:adponte-infra/site.git site`
- [x] `site/` está fora do Git do `saas`
- [x] Configs próprias do site preservadas
- [x] Copiar `.agent/` e `.opencode/` para `site/`
- [x] `.claude/` próprio do site preservado (não sobrescrito)
- [x] Commit no site: `5cad5fd chore: add .agent and .opencode workspace configs`

---

## Etapa 6 — Validação do `saas/` após realocação ✅

- [x] `git status` em `saas/`: working tree clean
- [x] `git submodule status` em `saas/`: 22 submodules íntegros
- [x] `.gitmodules`: 22 entradas
- [x] `package.json`: `@adponte/saas`
- [x] `pnpm-workspace.yaml`: globs corretos
- [x] `turbo.json`: tasks corretas
- [x] `tsconfig.base.json`: presente
- [x] Paths relativos válidos após mudança de root

---

## Etapa 7 — Adequação de configs compartilhadas ✅

- [x] `.gitignore` de `saas/` revisado (Turborepo, Python, Node)
- [x] `.gitignore` de `site/` revisado (Astro, Node)
- [x] `CLAUDE.md` de `saas/` reescrito para escopo SaaS-only
- [x] `CLAUDE.md` de `saas/` commitado: `558a8b5 docs: rewrite CLAUDE.md to reflect saas-only scope`
- [x] Workflows GitHub revisados — cada repo tem os próprios
- [x] Sem contaminação cruzada de configs

---

## Etapa 8 — Validação funcional independente ✅

### `saas/`
- [x] `pnpm install` funciona (resolved 173, 96 packages)
- [x] `pnpm-workspace` resolve corretamente:
  - `@adponte/saas` (root)
  - `@gestao/web` (apps/admin-web)
  - `@gestao/db` (packages/db)
  - `@gestao/types` (packages/types)
  - `@gestao/api` (services/api)
- [x] Submodules íntegros
- [x] Remote: `git@github.com:adponte-infra/monorepo.git`

### `site/`
- [x] Clone limpo de `adponte-infra/site`
- [x] Stack Astro independente preservada
- [x] `package.json` próprio (`adponte.com`)
- [x] Working tree clean
- [x] Remote: `git@github.com:adponte-infra/site.git`

---

## Etapa 9 — Revisão final de documentação ✅

- [x] `docs/PLAN.md` — reescrito para `saas` + `site` independentes
- [x] `docs/ARCHITECTURE.md` — ADR-001 revisado, ADR-005 revisado, ADR-008 adicionado
- [x] `docs/EXECUTION-ROADMAP.md` — este documento, atualizado com status final
- [x] Instruções de clone separadas em PLAN.md
- [x] `CLAUDE.md` do `saas` reescrito

---

## Etapa 10 — Fechamento e verificação final ✅

- [x] Estrutura final confirmada:
  - [x] `/home/itbrda/dev/adponte/saas` ← repo Git
  - [x] `/home/itbrda/dev/adponte/site` ← repo Git
- [x] `/home/itbrda/dev/adponte` — não é repo Git
- [x] 22 submodules em `saas/.gitmodules`
- [x] Nenhum arquivo do SaaS fora de `saas/`
- [x] `site/` sem configs indevidas do SaaS

---

## Resumo de commits criados

### `saas/`
```
558a8b5 docs: rewrite CLAUDE.md to reflect saas-only scope
1497ded chore(saas): migrate to v2 structure with separated submodules
```

### `site/`
```
5cad5fd chore: add .agent and .opencode workspace configs
```

---

## Próximos passos opcionais

- [ ] Push do `saas/` para origem (`git push origin main`)
- [ ] Push do `site/` para origem (`git push origin main`)
- [ ] Atualizar webhooks Coolify se houve renomeação de paths
- [ ] Considerar renomear `adponte-infra/monorepo` para `adponte-infra/saas` (semantica)
