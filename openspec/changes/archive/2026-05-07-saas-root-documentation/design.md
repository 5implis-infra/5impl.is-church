## Context

O monorepo `adponte-infra/saas` possui 22 submodules com stacks heterogêneas (TypeScript, Python, Expo, Next.js) e nenhum ponto de entrada documental coerente. O `CLAUDE.md` existente é funcional mas acoplado a uma ferramenta específica (Claude Code), não serve como documentação agnóstica, e mistura instruções de tooling com contexto de produto — preocupações distintas.

A documentação a ser criada cobre apenas o root do monorepo agregador. Documentação dos submodules individuais é escopo de mudança futura (`project-initial-documentation`).

## Goals / Non-Goals

**Goals:**
- Criar `README.md` conciso e navegável como porta de entrada do repositório
- Criar `AGENTE.md` unificado e agnóstico de IA com contexto de domínio + decisões técnicas + TBDs
- Criar `docs/ARCHITECTURE.md` com ADRs consolidados e diagrama de sistema macro
- Remover `CLAUDE.md` — evitar duplicidade e acoplamento com tooling específico
- Estabelecer o template de `AGENTE.md` que será replicado nos 22 submodules

**Non-Goals:**
- Documentação dos 22 submodules individuais (mudança futura)
- Documentação de módulos de produto (domínio de negócio aprofundado)
- Tutoriais, guias de onboarding passo a passo ou runbooks
- Decisões técnicas ainda não tomadas (auth, pagamentos, multi-tenancy, notificações) — serão mencionadas como TBD

## Decisions

### D1: Unificação em `AGENTE.md` (agnóstico de IA)

**Decisão:** Substituir `CLAUDE.md` por `AGENTE.md`, consolidando contexto de tooling + domínio em um único arquivo agnóstico.

**Alternativas consideradas:**
- Manter `CLAUDE.md` + criar `AGENTE.md` separado → duplicidade, risco de divergência
- Renomear `CLAUDE.md` para `CURSOR.md` ou `AI.md` → ainda acoplado a uma ferramenta ou genérico demais

**Rationale:** `AGENTE.md` é um nome semanticamente correto (qualquer agente — humano ou IA), não referencia tooling, e consolida tudo que um novo colaborador ou ferramenta precisa entender ao entrar no repositório.

---

### D2: Separação de responsabilidades entre os três documentos

```
README.md          ← O que é + como clonar + comandos (máx. 1 página)
AGENTE.md          ← Domínio + arquitetura mental + decisões + TBDs (documento principal)
docs/ARCHITECTURE.md ← ADRs formais + diagramas + topologia (referência técnica)
```

**Rationale:** `README.md` é o que o GitHub renderiza por padrão — deve ser curto. `AGENTE.md` é o documento de trabalho para agentes e devs. `ARCHITECTURE.md` é a fonte de verdade das decisões técnicas.

---

### D3: TBDs explícitos no `AGENTE.md`

Decisões ainda abertas (auth, pagamentos, multi-tenancy, notificações) aparecem em uma seção `## TBDs` no `AGENTE.md` com uma frase de contexto e eventual abordagem sugerida.

**Rationale:** TBDs invisíveis geram decisões acidentais. Torná-los explícitos reduz risco de um agente ou dev assumir algo errado.

---

### D4: Estrutura do `AGENTE.md`

```
## Produto
## Módulos
## Arquitetura
## Stack por camada
## Fluxo de dados macro
## Pipeline de mídia (resumo)
## Decisões
## TBDs
## Padrões de código
## Comandos essenciais
## Repositórios e submodules
```

---

### D5: `docs/ARCHITECTURE.md` consolida ADRs existentes

Os ADRs em `docs/ARCHITECTURE.md` (ADR-001 a ADR-009) são válidos e consolidados na nova versão do documento. Não serão reescritos — apenas reformatados e complementados com diagrama de sistema e topologia de deploy.

## Risks / Trade-offs

- **Risco: ferramentas que leem `CLAUDE.md` por convenção (ex: Claude Code `--context`)**
  → Mitigação: `CLAUDE.md` novo e mínimo que apenas aponta para `AGENTE.md`, ou configurar a ferramenta para ler `AGENTE.md`. A remoção é breaking change intencional.

- **Trade-off: `AGENTE.md` pode crescer e se tornar difícil de manter**
  → Mitigação: seções claras com fronteiras definidas; TBDs removidos quando resolvidos e movidos para ADRs.

- **Risco: `docs/ARCHITECTURE.md` ficar desatualizado**
  → Aceitável como documento de decisões (ADRs são imutáveis por design); diagrama de sistema deve ser atualizado a cada novo componente adicionado.

## Migration Plan

1. Criar os três documentos (`README.md`, `AGENTE.md`, `docs/ARCHITECTURE.md`)
2. Remover `CLAUDE.md`
3. Verificar se `openspec/config.yaml` ou qualquer workflow faz referência a `CLAUDE.md` — atualizar se necessário

Rollback: `CLAUDE.md` pode ser restaurado via git history se necessário.

## Open Questions

- Ferramentas de IA (Claude Code, Cursor, Windsurf) usam `CLAUDE.md` por convenção de nome — checar se precisa de arquivo de compatibilidade ou se basta reconfigurar
