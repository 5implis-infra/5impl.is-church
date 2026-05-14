# Root Documentation Refactor

## MODIFIED Requirements

### Requirement: README contém one-liner do produto

O `README.md` SHALL abrir com uma frase única descrevendo o produto e seu público-alvo.

#### Scenario: One-liner presente
- **WHEN** se lê o `README.md`
- **THEN** a primeira seção de conteúdo (após título) descreve o produto em no máximo 2 frases
- **AND** menciona "igrejas" como público-alvo
- **AND** não replica a descrição textual de `docs/PRODUCT.md` verbatim

### Requirement: README aponta para documentos complementares

O `README.md` SHALL conter links para `AGENTS.md`, `docs/ARCHITECTURE.md` e `docs/PRODUCT.md`.

#### Scenario: Links de navegação presentes
- **WHEN** se lê o `README.md`
- **THEN** existe link para `AGENTS.md`
- **THEN** existe link para `docs/ARCHITECTURE.md`
- **THEN** existe link para `docs/PRODUCT.md`

### Requirement: AGENTS.md contém stack por camada

O `AGENTS.md` SHALL referenciar a stack tecnológica por camada do sistema via pointer para `docs/ARCHITECTURE.md`.

#### Scenario: Stack referenciada via pointer
- **WHEN** se lê a seção de stack no `AGENTS.md`
- **THEN** existe uma nota apontando para `[docs/ARCHITECTURE.md — Stack por Camada](docs/ARCHITECTURE.md#stack-por-camada)`
- **AND** a seção não replica o conteúdo da tabela de stack