## ADDED Requirements

### Requirement: Documentation hierarchy is enforced

The monorepo SHALL maintain a documentation hierarchy where each document has exactly one authoritative purpose and does not duplicate content that lives elsewhere.

#### Scenario: Root docs have clear ownership
- **GIVEN** a developer reads the root documentation
- **WHEN** they need to understand product identity, technical architecture, design intent, or operational procedures
- **THEN** they can unambiguously identify which file is authoritative for each topic
- **THEN** no two files claim to be the source of truth for the same subject

#### Scenario: Subproject docs reference global sources
- **GIVEN** a developer reads a subproject's README.md or AGENTS.md
- **WHEN** they need context that belongs to global docs (architecture, product, design)
- **THEN** the subproject doc links to the relevant global doc
- **THEN** the subproject doc does not duplicate that content locally

### Requirement: AGENTS.md is the canonical agent-context filename

All agent-context files across the monorepo SHALL be named `AGENTS.md`. No file SHALL be named `AGENTE.md` or any other variant.

#### Scenario: Correct filename everywhere
- **GIVEN** a repository listing of any subproject
- **WHEN** the agent-context file exists
- **THEN** it is named `AGENTS.md`
- **THEN** all titles inside these files say `# AGENTS.md`
- **THEN** no links anywhere reference `AGENTE.md`

### Requirement: OpenSpec specs are linked from AGENTS.md

Each subproject's AGENTS.md SHALL contain a "Specs relacionados" section that links to relevant `openspec/specs/` capability specs.

#### Scenario: Spec links present
- **GIVEN** an AI agent reads a subproject's AGENTS.md
- **WHEN** they need to understand what requirements this component must satisfy
- **THEN** they can follow links to `openspec/specs/<capability>/spec.md`
- **THEN** the AGENTS.md does not re-document requirements that live in those specs

### Requirement: Archived docs do not conflict with active docs

When `docs/old/` contains content that conflicts with new documentation, the new documentation takes precedence.

#### Scenario: Conflict resolution
- **GIVEN** a reader finds conflicting information between `docs/old/` and active docs
- **WHEN** they need to determine the authoritative answer
- **THEN** active docs (CONSTITUTION.md, PRODUCT.md, ARCHITECTURE.md, DESIGN.md, adrs/) always take precedence
- **THEN** `docs/old/` is clearly marked as historical reference only

### Requirement: Subproject AGENTS.md has minimum required sections

Every subproject AGENTS.md SHALL contain at minimum: Propósito, O que NÃO faz, and Pontos de integração. These sections establish clear boundaries.

#### Scenario: Minimum structure present
- **GIVEN** an AI agent reads any subproject's AGENTS.md
- **WHEN** they need to understand what the component does, what it explicitly does not do, and what it integrates with
- **THEN** all three sections (Propósito, O que NÃO faz, Pontos de integração) are present
- **THEN** the "O que NÃO faz" section is specific enough to prevent the agent from assuming responsibilities

### Requirement: Root README and AGENTS.md have distinct purposes

The root `README.md` SHALL be the human entry point. The root `AGENTS.md` SHALL be the AI/developer context. These files do not duplicate each other's purpose.

#### Scenario: Readme is human entry point
- **GIVEN** a new contributor clones the repository
- **WHEN** they read `README.md`
- **THEN** they find: what this repo is, how to clone and setup, key links
- **THEN** it does NOT attempt to be comprehensive about architecture or product

#### Scenario: Agents is AI context
- **GIVEN** an AI agent begins working in the repository
- **WHEN** they read `AGENTS.md`
- **THEN** they find: architecture summary, domain concepts, ownership, TBDs, minimal quick commands
- **THEN** it does NOT duplicate the quickstart from README