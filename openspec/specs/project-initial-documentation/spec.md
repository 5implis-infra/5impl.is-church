# Spec: project-initial-documentation

## Purpose

Establish a consistent documentation baseline across all 22 projects in the SaaS monorepo, enabling both human contributors and AI agents to quickly understand each project's role, boundaries, and integration points.

## Requirements

### Requirement: Cada projeto possui README.md com estrutura mínima
Todos os 22 projetos do monorepo SHALL ter um arquivo `README.md` na raiz do submodule contendo exatamente as seguintes seções: "O que é", "Módulos do produto", "Responsabilidades", "Integra com", "Onde roda".

#### Scenario: README presente em todos os projetos
- **WHEN** se lista a raiz de cada um dos 22 submodules
- **THEN** existe um arquivo `README.md` em cada um

#### Scenario: README contém todas as seções obrigatórias
- **WHEN** se lê o `README.md` de qualquer projeto
- **THEN** o arquivo contém as seções: "O que é", "Módulos do produto", "Responsabilidades", "Integra com", "Onde roda"
- **THEN** a seção "O que é" tem no máximo 3 frases
- **THEN** a seção "Responsabilidades" lista entre 3 e 7 itens

#### Scenario: README não contém decisões técnicas de implementação
- **WHEN** se lê qualquer README gerado nesta mudança
- **THEN** NÃO existe referência a versões específicas de dependências
- **THEN** NÃO existe código de exemplo ou comandos de setup
- **THEN** NÃO existe decisão de stack técnica não confirmada

### Requirement: Cada projeto possui AGENTE.md com contexto para IA
Todos os 22 projetos SHALL ter um arquivo `AGENTE.md` na raiz do submodule contendo: propósito (2-3 frases), o que este projeto NÃO faz, e pontos de integração principais.

#### Scenario: AGENTE.md presente em todos os projetos
- **WHEN** se lista a raiz de cada um dos 22 submodules
- **THEN** existe um arquivo `AGENTE.md` em cada um

#### Scenario: AGENTE.md define limites do contexto
- **WHEN** se lê o `AGENTE.md` de qualquer projeto
- **THEN** existe uma seção explicitando o que o projeto NÃO faz
- **THEN** existe uma seção listando os projetos com os quais este integra

### Requirement: READMEs respeitam a camada do projeto no monorepo
O conteúdo dos READMEs SHALL variar de acordo com a camada (`packages`, `services`, `apps`, `workers/media`, `workers/system`, `infra`) — cada camada tem um foco diferente.

#### Scenario: READMEs de packages focam em o que exportam
- **WHEN** se lê o README de qualquer projeto em `packages/*`
- **THEN** a seção "Responsabilidades" descreve o que o pacote exporta e quem o consome
- **THEN** a seção "Onde roda" indica "não deployado isoladamente — importado como dependência"

#### Scenario: READMEs de workers/media descrevem etapa da pipeline
- **WHEN** se lê o README de qualquer projeto em `workers/media/*`
- **THEN** a seção "O que é" identifica qual etapa da pipeline de produção de mídia este worker executa
- **THEN** a seção "Integra com" menciona o `services/media-workflow` como orquestrador

#### Scenario: READMEs de apps descrevem audiência e superfície
- **WHEN** se lê o README de qualquer projeto em `apps/*`
- **THEN** a seção "O que é" identifica claramente a audiência (operador, membro, anônimo)
- **THEN** a seção "Onde roda" especifica a forma de entrega (web, nativo, PWA)

### Requirement: Módulo do produto é declarado em cada README
Cada README SHALL declarar explicitamente quais módulos do produto o projeto serve (ex: Módulo Mídia, Módulo Financeiro, Plataforma, todos os módulos).

#### Scenario: Módulo declarado
- **WHEN** se lê o README de qualquer projeto
- **THEN** a seção "Módulos do produto" lista pelo menos um módulo ou declara "Infraestrutura compartilhada" / "Todos os módulos"

### Requirement: AGENTE.md dos submodules referencia o AGENTE.md root como template
Os `AGENTE.md` criados em cada submodule (escopo de mudança futura) SHALL seguir a estrutura estabelecida no `AGENTE.md` root do monorepo.

#### Scenario: Estrutura compatível com o template root
- **WHEN** se cria um `AGENTE.md` em qualquer submodule
- **THEN** as seções usam os mesmos nomes e ordem definidos no `AGENTE.md` root
- **THEN** a seção "Integra com" referencia os componentes do monorepo pelos caminhos canônicos (ex: `services/api`, `services/media-workflow`)

### Requirement: AGENTE.md dos submodules é agnóstico de ferramenta de IA
Os `AGENTE.md` de cada submodule SHALL seguir o mesmo requisito de agnosticismo do `AGENTE.md` root.

#### Scenario: Sem referências a ferramentas específicas
- **WHEN** se lê o `AGENTE.md` de qualquer submodule
- **THEN** NÃO existe referência a "Claude", "Cursor", "Copilot" ou qualquer ferramenta específica de IA
