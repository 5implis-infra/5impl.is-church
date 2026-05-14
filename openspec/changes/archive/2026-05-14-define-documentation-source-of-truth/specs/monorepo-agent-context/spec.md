## MODIFIED Requirements

### Requirement: AGENTS.md exists at root and CLAUDE.md is removed
O monorepo SHALL ter `AGENTS.md` na raiz e NÃO SHALL ter `CLAUDE.md`.

#### Scenario: Correct file present
- **GIVEN** a repository listing of the root directory
- **WHEN** one checks for the agent-context file
- **THEN** `AGENTS.md` exists
- **THEN** `CLAUDE.md` does not exist

### Requirement: AGENTS.md is AI-tool agnostic
O `AGENTS.md` SHALL ser legível e útil independentemente da ferramenta de IA utilizada (Claude Code, Cursor, Windsurf, Copilot ou qualquer outro).

#### Scenario: No tool-specific references
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they examine the content for tool-specific instructions
- **THEN** no reference exists to "Claude", "Cursor", "Copilot" or any specific AI tool
- **THEN** no instruction describes AI-tool-specific behaviour

### Requirement: AGENTS.md contains product domain context
O `AGENTS.md` SHALL definir os conceitos centrais do domínio de negócio para evitar que agentes façam suposições incorretas.

#### Scenario: Domain concepts present
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand the core domain
- **THEN** they find definitions for: church (tenant), filial, subscription plan, member, operator
- **THEN** they find descriptions of operation modes: Administrative, Member, Anonymous

### Requirement: AGENTS.md contains product module map
O `AGENTS.md` SHALL listar todos os módulos funcionais do produto com descrição de uma linha cada.

#### Scenario: Module map present
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand what functional areas exist
- **THEN** they find a section listing modules: Pessoas, Eventos/Cultos, Financeiro, Cursos, Pastoral, Teologia, Agendas, Notificações, Mídia
- **THEN** each module has a one-line description

### Requirement: AGENTS.md contains ownership map by service
O `AGENTS.md` SHALL descrever qual serviço é responsável por cada domínio do sistema.

#### Scenario: Ownership is clear
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand which service owns what
- **THEN** they find a section mapping components to responsibilities (e.g., `services/api` → all product logic; `services/media-workflow` → media orchestration)
- **THEN** no ambiguity exists about which service is called directly by apps

### Requirement: AGENTS.md contains macro data flow summary
O `AGENTS.md` SHALL conter um diagrama ASCII ou lista descrevendo o fluxo principal de dados no sistema.

#### Scenario: Data flow documented
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand the main data flow
- **THEN** they find a visual or textual representation of the flow: client → api → workers → storage
- **THEN** the media pipeline is mentioned with a link to `docs/ARCHITECTURE.md`

### Requirement: AGENTS.md contains stack by layer
O `AGENTS.md` SHALL ter uma tabela ou lista com a stack tecnológica por camada do sistema.

#### Scenario: Stack by layer present
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand the tech stack
- **THEN** they find a table covering: languages, runtimes, frameworks, database, infra, CI/CD
- **THEN** each item indicates the layer it applies to (all / apps / services / workers)

### Requirement: AGENTS.md contains explicit TBDs section
O `AGENTS.md` SHALL listar decisões técnicas ainda não tomadas, para evitar suposições incorretas por agentes ou devs.

#### Scenario: TBDs visible
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they encounter a decision that has not been made
- **THEN** they find a `## TBDs` or equivalent section
- **THEN** it includes: auth strategy, payment gateway, database multi-tenancy isolation, notifications stack
- **THEN** each TBD briefly mentions possible approaches without committing to one

### Requirement: AGENTS.md contains code patterns
O `AGENTS.md` SHALL descrever os padrões de codificação vigentes no projeto.

#### Scenario: Code patterns documented
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand coding standards
- **THEN** they find a section on TypeScript patterns (ESM, Node.js, base tsconfig)
- **THEN** they find a section on Python patterns (ruff, mypy, Python 3.10+)
- **THEN** they find mention of Dockerfile + docker-compose usage in each worker

### Requirement: AGENTS.md contains essential commands
O `AGENTS.md` SHALL conter os comandos mais usados no repositório, incluindo gestão de submodules.

#### Scenario: Essential commands present
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to execute common operations
- **THEN** they find a section with pnpm commands (install, dev, build, lint, typecheck, test)
- **THEN** they find a section with submodule commands (update --init --recursive, update --remote)

### Requirement: AGENTS.md serves as template for subproject AGENTS.md files
A estrutura e estilo do `AGENTS.md` root SHALL ser a referência para os arquivos `AGENTS.md` criados nos 22 submodules.

#### Scenario: Reference template identifiable
- **GIVEN** one compares a subproject's `AGENTS.md` with the root `AGENTS.md`
- **WHEN** they examine structure and style
- **THEN** the sections follow the same naming pattern
- **THEN** the tone and level of detail are compatible
- **THEN** each subproject AGENTS.md links to relevant `openspec/specs/` in a "Specs relacionados" section

### Requirement: AGENTS.md contains Specs relacionados section

Each subproject's `AGENTS.md` SHALL include a "Specs relacionados" section that links to relevant `openspec/specs/<capability>/spec.md` files for the capabilities it implements or relates to.

#### Scenario: Spec links present in subproject AGENTS.md
- **GIVEN** an AI agent reads a subproject's `AGENTS.md`
- **WHEN** they need to understand what requirements this component must satisfy
- **THEN** they find a "Specs relacionados" section
- **THEN** it contains links to relevant `openspec/specs/<capability>/spec.md` files