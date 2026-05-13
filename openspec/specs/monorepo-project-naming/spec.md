# Spec: monorepo-project-naming

## Purpose

Define the canonical naming of projects within the SaaS monorepo and ensure that each project's purpose is unambiguous and non-overlapping with other projects.

## Requirements

### Requirement: Submodule media-workflow existe com nome correto
O monorepo agregador SHALL referenciar o orquestrador do workflow de mídia como `services/media-workflow`. O submodule `services/control-plane` NÃO deve existir no `.gitmodules` após esta mudança.

#### Scenario: Rename refletido no .gitmodules
- **WHEN** se lê o arquivo `.gitmodules` do root do saas
- **THEN** existe uma entrada com `path = services/media-workflow` e `url = git@github.com:adponte-infra/media-workflow`
- **THEN** NÃO existe nenhuma entrada com `path = services/control-plane`

#### Scenario: Diretório físico correto
- **WHEN** se lista o diretório `services/` do monorepo
- **THEN** existe `services/media-workflow/`
- **THEN** NÃO existe `services/control-plane/`

### Requirement: Documentação interna reflete o rename
O `docs/PLAN.md` e o `docs/ARCHITECTURE.md` SHALL referenciar `services/media-workflow` em todos os lugares onde anteriormente constava `services/control-plane`.

#### Scenario: PLAN.md atualizado
- **WHEN** se lê `docs/PLAN.md`
- **THEN** a tabela de projetos lista `media-workflow` com descrição: orquestrador do workflow de produção de mídia
- **THEN** a seção de estrutura interna do `saas` lista `services/media-workflow/`

#### Scenario: ARCHITECTURE.md atualizado
- **WHEN** se lê `docs/ARCHITECTURE.md`
- **THEN** ADR-007 menciona `services/media-workflow` (não `control-plane`)
- **THEN** existe um ADR descrevendo a separação entre `services/api` (API do produto) e `services/media-workflow` (orquestrador de mídia)

### Requirement: Propósito de cada projeto está definido e é não-ambíguo
Cada um dos 22 projetos do monorepo SHALL ter seu propósito claramente descrito de forma que não confunda com o propósito de outro projeto.

#### Scenario: Sem sobreposição de responsabilidades na documentação
- **WHEN** se lêem os READMEs de `services/api` e `services/media-workflow`
- **THEN** as seções de responsabilidades NÃO se sobrepõem
- **THEN** cada serviço descreve claramente o que o outro NÃO faz
