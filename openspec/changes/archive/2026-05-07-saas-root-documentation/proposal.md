## Why

O monorepo `saas` não possui documentação de entrada coerente: o `CLAUDE.md` existente é específico para uma ferramenta de IA (Claude Code), e não há `README.md` nem arquitetura macro documentada. Qualquer desenvolvedor ou agente que abra o repositório parte do zero.

## What Changes

- **Cria** `README.md` na raiz do monorepo — front door do repositório com visão geral do produto, layout, stack, quickstart e links
- **Cria** `AGENTE.md` na raiz — documento agnóstico de IA unificando contexto de repositório (hoje no `CLAUDE.md`) + contexto de domínio + decisões arquiteturais macro + TBDs explícitos
- **Cria** `docs/ARCHITECTURE.md` — ADRs consolidados, diagrama de sistema, topologia de deploy, stack por componente, fluxo da pipeline de mídia
- **Remove** `CLAUDE.md` — conteúdo migrado e expandido no `AGENTE.md`
- **BREAKING**: `CLAUDE.md` deixa de existir; ferramentas de IA que o referenciam diretamente devem ser reconfiguradas para `AGENTE.md`

## Capabilities

### New Capabilities

- `monorepo-root-readme`: `README.md` como porta de entrada do monorepo para humanos e agentes — produto, layout, stack, quickstart
- `monorepo-agent-context`: `AGENTE.md` como documento unificado e agnóstico de IA com contexto de domínio, decisões, padrões e TBDs
- `monorepo-architecture-doc`: `docs/ARCHITECTURE.md` com ADRs consolidados, diagrama de sistema, topologia de deploy e pipeline de mídia

### Modified Capabilities

- `project-initial-documentation`: a definição de `AGENTE.md` nesta mudança se torna referência para o padrão de `AGENTE.md` nos 22 submodules

## Impact

- Remove `CLAUDE.md` da raiz do monorepo
- Cria três novos arquivos de documentação na raiz e em `docs/`
- Estabelece o padrão de `AGENTE.md` que será replicado em todos os submodules (escopo de mudança futura)
- Sem impacto em código de aplicação, packages ou serviços
