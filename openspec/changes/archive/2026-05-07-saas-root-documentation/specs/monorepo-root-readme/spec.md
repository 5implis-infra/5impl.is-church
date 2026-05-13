# Spec: monorepo-root-readme

## Purpose

Estabelecer o `README.md` da raiz do monorepo `saas` como porta de entrada concisa e navegável para humanos e agentes.

## ADDED Requirements

### Requirement: README.md existe na raiz do monorepo
O monorepo `saas` SHALL ter um `README.md` na raiz com no máximo duas telas de conteúdo (sem scroll extenso).

#### Scenario: README presente na raiz
- **WHEN** se acessa a raiz do repositório `adponte-infra/saas`
- **THEN** existe um arquivo `README.md`
- **THEN** o arquivo tem menos de 120 linhas

### Requirement: README contém one-liner do produto
O `README.md` SHALL abrir com uma frase única descrevendo o produto e seu público-alvo.

#### Scenario: One-liner presente
- **WHEN** se lê o `README.md`
- **THEN** a primeira seção de conteúdo (após título) descreve o produto em no máximo 2 frases
- **THEN** menciona "SaaS", "igrejas" e "multi-tenant"

### Requirement: README contém tabela de componentes
O `README.md` SHALL conter uma tabela listando todos os componentes do monorepo com nome, caminho, tecnologia e onde roda.

#### Scenario: Tabela de componentes presente
- **WHEN** se lê o `README.md`
- **THEN** existe uma tabela com colunas: componente, caminho, tech, runtime
- **THEN** a tabela cobre apps, services, workers e packages

### Requirement: README contém comandos de quickstart
O `README.md` SHALL conter um bloco de código com os comandos mínimos para clonar e iniciar o ambiente de desenvolvimento.

#### Scenario: Quickstart funcional
- **WHEN** se lê a seção de quickstart
- **THEN** inclui o comando `git clone --recurse-submodules`
- **THEN** inclui `pnpm install` e `pnpm dev`

### Requirement: README aponta para documentos complementares
O `README.md` SHALL conter links para `AGENTE.md` e `docs/ARCHITECTURE.md`.

#### Scenario: Links de navegação presentes
- **WHEN** se lê o `README.md`
- **THEN** existe link para `AGENTE.md`
- **THEN** existe link para `docs/ARCHITECTURE.md`

### Requirement: README não contém decisões técnicas detalhadas
O `README.md` SHALL ser um documento de navegação, não de decisões.

#### Scenario: README sem conteúdo de design
- **WHEN** se lê o `README.md`
- **THEN** NÃO existe seção de ADRs
- **THEN** NÃO existe diagrama de arquitetura
- **THEN** NÃO existe descrição de módulos de produto
