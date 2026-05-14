# Spec: monorepo-agent-context

## Purpose

Estabelecer o `AGENTS.md` como documento unificado, agnóstico de IA e de domínio na raiz do monorepo `saas`, consolidando o contexto de tooling com contexto de produto, decisões e TBDs.

## Requirements

### Requirement: AGENTS.md existe na raiz
O monorepo SHALL ter `AGENTS.md` na raiz.

#### Scenario: Arquivo correto presente
- **WHEN** se lista a raiz do repositório
- **THEN** existe `AGENTS.md`

### Requirement: AGENTS.md é agnóstico de ferramenta de IA
O `AGENTS.md` SHALL ser legível e útil independentemente da ferramenta de IA utilizada (Claude Code, Cursor, Windsurf, Copilot ou qualquer outro).

#### Scenario: Sem referências a ferramentas específicas
- **WHEN** se lê o `AGENTS.md`
- **THEN** NÃO existe referência a "Claude", "Cursor", "Copilot" ou qualquer ferramenta específica
- **THEN** NÃO existe instrução de comportamento específica de tooling de IA

### Requirement: AGENTS.md contém contexto de domínio do produto
O `AGENTS.md` SHALL definir os conceitos centrais do domínio de negócio para evitar que agentes façam suposições incorretas.

#### Scenario: Conceitos de domínio presentes
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe definição de: church (tenant), filial, plano de assinatura, membro, operador
- **THEN** existe descrição dos modos de operação: Administrativo, Membro, Anônimo

### Requirement: AGENTS.md contém mapa de módulos do produto
O `AGENTS.md` SHALL listar todos os módulos funcionais do produto com descrição de uma linha cada.

#### Scenario: Mapa de módulos presente
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe seção com lista dos módulos: Pessoas, Eventos/Cultos, Financeiro, Cursos, Pastoral, Teologia, Agendas, Notificações, Mídia
- **THEN** cada módulo tem descrição de uma linha

### Requirement: AGENTS.md contém mapa de ownership por serviço
O `AGENTS.md` SHALL descrever qual serviço é responsável por cada domínio do sistema.

#### Scenario: Ownership claro
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe seção mapeando componentes a responsabilidades (ex: `services/api` → toda lógica de produto; `services/media-workflow` → orquestração de mídia)
- **THEN** NÃO existe ambiguidade sobre qual serviço é chamado diretamente por apps

### Requirement: AGENTS.md contém resumo do fluxo de dados macro
O `AGENTS.md` SHALL conter um diagrama ASCII ou lista descrevendo o fluxo principal de dados no sistema.

#### Scenario: Fluxo de dados documentado
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe representação visual ou textual do fluxo: cliente → api → workers → storage
- **THEN** o pipeline de mídia é mencionado com link para `docs/ARCHITECTURE.md`

### Requirement: AGENTS.md contém stack por camada
O `AGENTS.md` SHALL ter uma tabela ou lista com a stack tecnológica por camada do sistema.

#### Scenario: Stack por camada presente
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe tabela cobrindo: linguagens, runtimes, frameworks, banco de dados, infra, CI/CD
- **THEN** cada item indica a camada onde se aplica (todos / apps / services / workers)

### Requirement: AGENTS.md contém seção de TBDs explícitos
O `AGENTS.md` SHALL listar decisões técnicas ainda não tomadas, para evitar suposições incorretas por agentes ou devs.

#### Scenario: TBDs visíveis
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe seção `## TBDs` ou equivalente
- **THEN** inclui: estratégia de auth, gateway de pagamentos, isolamento de multi-tenancy no banco, stack de notificações
- **THEN** cada TBD menciona brevemente abordagens possíveis sem comprometer uma escolha

### Requirement: AGENTS.md contém padrões de código
O `AGENTS.md` SHALL descrever os padrões de codificação vigentes no projeto.

#### Scenario: Padrões de código documentados
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe seção sobre padrões TypeScript (ESM, Node.js, tsconfig base)
- **THEN** existe seção sobre padrões Python (ruff, mypy, Python 3.10+)
- **THEN** existe menção ao uso de Dockerfile + docker-compose em cada worker

### Requirement: AGENTS.md contém comandos essenciais
O `AGENTS.md` SHALL conter os comandos mais usados no repositório, incluindo gestão de submodules.

#### Scenario: Comandos essenciais presentes
- **WHEN** se lê o `AGENTS.md`
- **THEN** existe seção com comandos pnpm (install, dev, build, lint, typecheck, test)
- **THEN** existe seção com comandos de submodule (update --init --recursive, update --remote)

### Requirement: AGENTS.md serve como template para AGENTS.md dos submodules
A estrutura e estilo do `AGENTS.md` root SHALL ser a referência para os arquivos `AGENTS.md` criados nos 22 submodules.

#### Scenario: Template de referência identificável
- **WHEN** se compara um `AGENTS.md` de submodule com o root
- **THEN** as seções seguem o mesmo padrão de nomenclatura
- **THEN** o tom e nível de detalhe são compatíveis
