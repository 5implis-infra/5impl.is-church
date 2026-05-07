## Context

O monorepo `adponte-infra/saas` é um agregador de 22 submodules Git, cada um sendo um repositório GitHub privado independente. A estrutura atual inclui um submodule `services/control-plane` cujo nome conflita com a semântica padrão de SaaS (gestão de plataforma/tenants), quando na verdade sua responsabilidade é orquestrar o workflow de produção de mídia.

Adicionalmente, todos os 22 projetos existem como diretórios de submodule sem nenhuma documentação inicial — nem README explicando o propósito do projeto, nem contexto para agentes de IA que trabalharão em cada submodule.

Esta mudança é puramente documental e estrutural: não altera lógica de negócio, schemas ou APIs.

## Goals / Non-Goals

**Goals:**
- Renomear o submodule `services/control-plane` → `services/media-workflow` no agregador
- Atualizar todas as referências internas ao submodule renomeado
- Criar `README.md` mínimo e funcional para cada um dos 22 projetos
- Criar `AGENTE.md` mínimo para cada projeto, servindo como contexto para agentes de IA
- Atualizar `docs/PLAN.md` e `docs/ARCHITECTURE.md` para refletir o estado correto

**Non-Goals:**
- Definir stacks técnicas ou tomar decisões de implementação em qualquer projeto
- Criar scaffolding de código (package.json, tsconfig, Dockerfile, etc.)
- Renomear o repositório GitHub `adponte-infra/control-plane` (ação manual fora do escopo de código)
- Definir specs detalhados de qualquer módulo do produto
- Resolver decisões arquiteturais abertas (auth, contratos entre workers, etc.)

## Decisions

### D1 — Escopo dos READMEs: mínimo necessário

**Decisão:** Cada README terá exatamente 5 seções: O que é, Módulos do produto, Responsabilidades, Integra com, Onde roda.

**Rationale:** O objetivo é servir de base para a próxima iteração do planejamento (OpenSpec), não documentar implementação. Menos é mais: um README de 30 linhas que é lido e mantido vale mais do que 200 linhas que envelhecem.

**Alternativa considerada:** Incluir setup local, comandos e variáveis de ambiente — descartado porque esses detalhes só fazem sentido quando cada projeto tiver scaffolding real.

---

### D2 — AGENTE.md como arquivo de contexto para IA

**Decisão:** Usar `AGENTE.md` (não `CLAUDE.md`) como o arquivo de contexto para agentes de IA em cada submodule.

**Rationale:** O nome `AGENTE.md` é agnóstico à ferramenta (Claude, GLM, Gemini, etc.), alinhado com o workflow multi-modelo documentado em `docs/ai-flow.md`. O `CLAUDE.md` permanece apenas no root do aggregador saas, onde é relevante.

**Conteúdo mínimo do AGENTE.md:**
- Propósito do projeto em 2-3 frases
- O que este projeto NÃO faz (limites do contexto)
- Pontos de integração principais

---

### D3 — Rename do submodule: path vs. URL

**Decisão:** Atualizar `.gitmodules` com o novo path (`services/media-workflow`) e a nova URL (`git@github.com:adponte-infra/media-workflow`). O diretório físico `services/control-plane` deve ser removido e re-adicionado como `services/media-workflow` após o rename do repo no GitHub.

**Rationale:** Git submodules vinculam path e URL. Ambos precisam mudar — não é possível só renomear o path sem atualizar a URL se o repo remoto também for renomeado.

**Sequência correta:**
1. Renomear repo no GitHub (manual)
2. Atualizar `.gitmodules`
3. `git submodule sync`
4. Mover diretório: `git mv services/control-plane services/media-workflow`
5. Commit no agregador

---

### D4 — Organização dos READMEs por camada

**Decisão:** Os READMEs serão escritos respeitando a camada do projeto no monorepo:

| Camada | Projetos | Foco do README |
|--------|----------|----------------|
| `packages/*` | 7 pacotes | O que exporta, quem usa |
| `services/*` | 3 serviços | APIs expostas, quem depende |
| `apps/*` | 3 apps | Audiência, modo de acesso, superfície |
| `workers/media/*` | 5 workers | Etapa da pipeline, entrada/saída |
| `workers/system/*` | 3 workers | Gatilho, o que processa |
| `infra/n8n` | 1 infra | Workflows versionados |

## Risks / Trade-offs

**[Rename do submodule é irreversível sem perda de histórico local]** → O rename deve ser feito após o repo remoto ser renomeado no GitHub. Documentar a sequência exata nas tasks evita execução fora de ordem.

**[READMEs desatualizarão rapidamente]** → Aceitável nesta fase. O objetivo é servir de seed para o OpenSpec da próxima iteração, não ser documentação permanente. As specs geradas nesta mudança serão a fonte de verdade.

**[AGENTE.md pode ser ignorado se não houver convenção]** → Mitigação: incluir referência ao AGENTE.md no README de cada projeto e no CLAUDE.md do root do saas.

## Open Questions

- Qual será o nome do repo remoto no GitHub para `media-workflow`? Sugerido: `adponte-infra/media-workflow` (ação manual, fora do escopo desta mudança)
- O `AGENTE.md` do root do `saas` deve referenciar os `AGENTE.md` dos submodules? (baixa prioridade, pode ser decidido durante a implementação)
