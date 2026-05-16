# OpenSpec — SDD neste Projeto

> Framework de Spec-Driven Development (SDD) usado neste monorepo.
> Nada se faz sem ele — toda feature, fix ou refactor passa por um change em `openspec/changes/`.

---

## O que é

[OpenSpec](https://github.com/Fission-AI/OpenSpec) é um framework de SDD para AI coding assistants. Ele estrutura o fluxo de trabalho em artifacts (proposal → specs → design → tasks) com controle de versão via pastas de change.

**Princípios:**
- Fluid, not rigid — sem phase gates
- Iterative, not waterfall — aprendemos enquanto construímos
- Easy, not complex — setup mínimo
- Brownfield-first — funciona com codebases existentes

---

## Fluxo Core

Profile default (`core`):

```
/opsx:propose ──► /opsx:apply ──► /opsx:sync ──► /opsx:archive
```

**Fluxo Expanded** (comandos incrementais):

```
/opsx:new ──► /opsx:ff ou /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

---

## Quick Reference: Intenção → Comando

Use esta tabela para rapidamente identificar qual comando Invocar quando o usuário expressa uma intenção.

| Intenção (o que você diz)                               | Comando que o agente deve Invocar                    |
| ------------------------------------------------------- | ----------------------------------------------------- |
| "Inicie uma task para add feature X"                     | `/opsx:propose add-feature-x`                         |
| "Inicie o planejamento/proposta para a task Y"          | `/opsx:propose add-task-y`                            |
| "Vamos explorar options primeiro"                       | `/opsx:explore [tema]`                                |
| "Comece uma change, vou criar os artifacts aos poucos"  | `/opsx:new [nome]` → `/opsx:continue` (incremental)   |
| "Já sei o que preciso — crie tudo de uma vez"           | `/opsx:new [nome]` → `/opsx:ff` (fast-forward)        |
| "Continue a implementação da change atual"              | `/opsx:apply [change-name]`                           |
| "Verifique se está pronto para archivar"                | `/opsx:verify [change-name]`                          |
| "Finalize e archive a change"                           | `/opsx:archive [change-name]`                         |
| "Archive várias changes de uma vez"                     | `/opsx:bulk-archive`                                  |
| "Vamos entender melhor o código antes de planejar"      | `/opsx:explore`                                       |
| "Preciso de ajuda com o workflow OpenSpec"              | `/opsx:onboard`                                       |

> **Nota:** Comandos podem variar conforme a ferramenta AI (Claude Code, Cursor, Windsurf, etc). A intent é a mesma — a superfície de comando pode ser `/opsx:`, `/opsx-`, ou skill-based. Consulte [Commands Reference](https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md) para detalhes.

---

## Estrutura de uma Change

```
openspec/changes/<nome>/
├── proposal.md          # Why + what (intent, scope, approach)
├── specs/               # Delta specs (ADDED/MODIFIED/REMOVED requirements)
│   └── <domain>/
│       └── spec.md
├── design.md            # How (technical approach, architecture decisions)
├── tasks.md             # Implementation checklist
└── .openspec.yaml       # Metadata (schema, created date)
```

---

## Integração com Backlog.md

Este projeto usa [Backlog.md](https://github.com/MrLesk/Backlog.md) — gerenciador de conhecimento local-first em Markdown — como projeção operacional do OpenSpec.

### Dois fluxos de sync:

**1. Tasks:** `openspec/changes/` → `.backlog/tasks/`
- Pre-commit hook `sync-openspec-changes-to-backlog.sh`
- OpenSpec é fonte canônica; Backlog tasks são geradas automaticamente
- Detalhes: [docs/OPENSPEC-BACKLOG.md](./OPENSPEC-BACKLOG.md)

**2. Docs index:** `docs/` + `docs/adrs/` → `.backlog/docs/` + `.backlog/decisions/`
- Pre-commit hook `install-backlog-sync-hook.sh`
- Canonical source é sempre `docs/`

### Estrutura Backlog

```
.backlog/
  tasks/        ← Tasks geradas de OpenSpec changes
  docs/         ← Stubs gerados de docs/*.md
  decisions/    ← Stubs gerados de docs/adrs/*.md
  archive/      ← Tasks arquivadas
```

**Regra:** Backlog é projeção read-only. Canonical source: `openspec/changes/` e `docs/`.

---

## Referências Oficiais

| Doc                                  | O que contém                                                    |
| ------------------------------------ | -------------------------------------------------------------- |
| [OpenSpec Concepts](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md)           | Filosofia, specs, changes, artifacts, delta specs, archive     |
| [OpenSpec Getting Started](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md) | Quick start, estrutura criada, example walkthrough              |
| [OpenSpec Commands](https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md)            | Referência completa de todos os comandos slash                  |
| [OpenSpec Workflows](https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md)         | Padrões de workflow (Quick Feature, Exploratory, Parallel...)  |
| [OpenSpec Customization](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md) | Project config, custom schemas, templates                      |