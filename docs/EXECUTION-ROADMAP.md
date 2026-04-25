# Roteiro de Execução — Separação `saas` e `site`

> Atualizado em: 2026-04-25
> Status: ⬜ Pendente — aguardando confirmação para iniciar execução

## Decisão arquitetural

- `site` e `saas` são repos **totalmente independentes**
- `adponte-infra/monorepo` será reaproveitado como o repo do `saas`
- `adponte/` é apenas pasta local de trabalho, sem versionamento
- Compartilham contexto de cliente, não estrutura de código

## Layout local alvo

```
/home/itbrda/dev/adponte/
├─ saas/   # repo: adponte-infra/monorepo (reaproveitado como SaaS)
└─ site/   # repo: adponte-infra/site
```

---

## Etapa 0 — Congelamento e decisão final

**Checklist:**
- [ ] Confirmar que `site` e `saas` serão repos totalmente independentes
- [ ] Confirmar que `adponte-infra/monorepo` será reaproveitado como repo do `saas`
- [ ] Confirmar que `adponte/` será apenas pasta local de trabalho
- [ ] Confirmar destino dos diretórios locais não versionados:
  - [ ] `.agent/`
  - [ ] `.claude/`
  - [ ] `.opencode/`
  - [ ] `node_modules/`

**Saída esperada:** Decisão final validada sem ambiguidade

---

## Etapa 1 — Atualização do plano e documentação-base

**Checklist:**
- [ ] Atualizar `docs/PLAN.md`
- [ ] Remover a ideia de "monorepo contendo `site` + `saas`"
- [ ] Renomear seção estrutural para refletir "repositórios independentes"
- [ ] Deixar explícito:
  - [ ] `site/` = repo independente
  - [ ] `saas/` = repo independente
  - [ ] `adponte/` = pasta local não versionada
- [ ] Atualizar `docs/ARCHITECTURE.md`
- [ ] Revisar a seção de repositórios GitHub
- [ ] Revisar instruções de clone/bootstrap

**Saída esperada:** Documentação alinhada com a arquitetura correta antes da movimentação

---

## Etapa 2 — Auditoria do workspace atual

**Checklist:**
- [ ] Registrar `git status` atual
- [ ] Registrar `git submodule status` atual
- [ ] Registrar estrutura atual da raiz
- [ ] Identificar tudo que faz parte do repo do SaaS
- [ ] Identificar tudo que é apenas local/temporário
- [ ] Separar claramente:
  - [ ] conteúdo a mover para `saas/`
  - [ ] conteúdo a manter fora
  - [ ] conteúdo a recriar em `site/`

**Saída esperada:** Inventário confiável do que será realocado

---

## Etapa 3 — Definição do conjunto de arquivos por repo

**Checklist:**
- [ ] Definir o que vai para `saas/`
- [ ] Definir o que vai para `site/`
- [ ] Definir o que será compartilhado por convenção (não cópia literal)

### Grupo A — apenas `saas/`
- `.gitmodules`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `apps/`
- `services/`
- `workers/`
- `packages/`
- `infra/`
- `docs/`

### Grupo B — apenas `site/`
- estrutura Astro
- configs do site
- workflows do site

### Grupo C — avaliar cópia/adaptação para ambos
- `.gitignore`
- `CLAUDE.md`
- `.actrc`
- padrões de CI local
- documentação operacional mínima

**Saída esperada:** Mapa definitivo de cópia/movimentação

---

## Etapa 4 — Reestruturação física do workspace

**Checklist:**
- [ ] Criar layout local alvo:
  - [ ] `adponte/saas`
  - [ ] `adponte/site`
- [ ] Mover o repo atual para `saas/`
- [ ] Garantir que `.git` acompanhe o repo para `saas/`
- [ ] Garantir que o root Git passe a ser `adponte/saas`
- [ ] Verificar que `adponte/` fique sem papel de repo Git
- [ ] Não deixar arquivos do SaaS soltos fora de `saas/`

**Saída esperada:** `saas/` funcionando como root Git do produto SaaS

---

## Etapa 5 — Materialização do repo `site/`

**Checklist:**
- [ ] Clonar `adponte-infra/site` em `adponte/site`
- [ ] Confirmar que `site/` está fora do Git do `saas`
- [ ] Verificar estrutura e configs próprias do site
- [ ] Aplicar apenas os arquivos compartilháveis aprovados na Etapa 3
- [ ] Não copiar configs de monorepo para o site

**Saída esperada:** `site/` funcional como repo independente

---

## Etapa 6 — Validação do repo `saas/` após realocação

**Checklist:**
- [ ] Rodar `git status` dentro de `saas/`
- [ ] Rodar `git submodule status` dentro de `saas/`
- [ ] Verificar `.gitmodules`
- [ ] Verificar `package.json`
- [ ] Verificar `pnpm-workspace.yaml`
- [ ] Verificar `turbo.json`
- [ ] Verificar `tsconfig.base.json`
- [ ] Confirmar que todos os paths relativos continuam válidos

**Saída esperada:** `saas/` íntegro após a mudança de root

---

## Etapa 7 — Adequação de configs compartilhadas

**Checklist:**
- [ ] Revisar `.gitignore` de `saas/`
- [ ] Revisar `.gitignore` de `site/`
- [ ] Revisar `CLAUDE.md` ou equivalente em ambos
- [ ] Revisar `.actrc` em ambos, se aplicável
- [ ] Revisar workflows GitHub de cada repo
- [ ] Garantir que cada repo tenha somente as configs coerentes com seu stack/workflow

**Saída esperada:** Dois repos com configs consistentes e não contaminadas entre si

---

## Etapa 8 — Validação funcional independente

### `saas/`
- [ ] Instalação funciona (`pnpm install`)
- [ ] `pnpm-workspace` resolve corretamente
- [ ] `turbo` roda a partir do root correto
- [ ] Submodules permanecem íntegros

### `site/`
- [ ] Instalação funciona
- [ ] Build/dev do site funciona com seu próprio stack
- [ ] Workflows e docs do site estão coerentes

**Saída esperada:** `saas/` e `site/` funcionam isoladamente

---

## Etapa 9 — Revisão final de documentação

**Checklist:**
- [ ] Revisar `docs/PLAN.md`
- [ ] Revisar `docs/ARCHITECTURE.md`
- [ ] Revisar instruções de clone local
- [ ] Revisar README do `saas`
- [ ] Revisar README do `site`, se necessário
- [ ] Deixar explícito que a relação entre os dois é de portfólio, não de monorepo

**Saída esperada:** Documentação final consistente com a estrutura real

---

## Etapa 10 — Fechamento e verificação final

**Checklist:**
- [ ] Confirmar estrutura final:
  - [ ] `adponte/site`
  - [ ] `adponte/saas`
- [ ] Confirmar que `adponte/` não é repo Git
- [ ] Confirmar que `saas/` é repo Git
- [ ] Confirmar que `site/` é repo Git
- [ ] Confirmar que nenhum arquivo do SaaS ficou fora de `saas/`
- [ ] Confirmar que o site não herdou config indevida do SaaS

**Saída esperada:** Estrutura final pronta para operação normal

---

## Resumo do fluxo

1. Ajustar docs
2. Auditar o estado atual
3. Definir exatamente o que vai para cada repo
4. Mover o repo atual para `saas/`
5. Clonar e preparar `site/`
6. Validar `saas/`
7. Validar `site/`
8. Revisar configs compartilhadas
9. Revisar docs finais
10. Fechar a migração

---

## Riscos conhecidos

- Mover `.git` exige cuidado para não perder o estado staged atual
- Submodules podem exigir re-sincronização após a realocação
- Ferramentas locais (`.opencode/`, `.agent/`, `.claude/`) podem ter comportamento diferente dependendo de onde ficarem
- `pnpm-lock.yaml` e `node_modules/` podem precisar ser regenerados após a mudança
- O nome remoto `monorepo` ficará semanticamente estranho mas funcionalmente serve
