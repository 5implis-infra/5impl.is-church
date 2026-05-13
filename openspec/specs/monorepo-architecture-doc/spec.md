# Spec: monorepo-architecture-doc

## Purpose

Estabelecer `docs/ARCHITECTURE.md` como documento técnico de referência consolidando ADRs, diagrama de sistema, topologia de deploy e pipeline de mídia.

## Requirements

### Requirement: docs/ARCHITECTURE.md existe na raiz do monorepo
O monorepo SHALL ter `docs/ARCHITECTURE.md` com conteúdo técnico de referência.

#### Scenario: Arquivo presente
- **WHEN** se acessa `docs/ARCHITECTURE.md`
- **THEN** o arquivo existe e está no formato Markdown
- **THEN** o arquivo tem mais de 100 linhas (documento substancial)

### Requirement: ARCHITECTURE.md contém diagrama ASCII do sistema
O `docs/ARCHITECTURE.md` SHALL incluir um diagrama em ASCII representando os componentes principais e suas relações.

#### Scenario: Diagrama de sistema presente
- **WHEN** se lê o `docs/ARCHITECTURE.md`
- **THEN** existe um bloco de diagrama ASCII mostrando apps, services, workers, infra e storage
- **THEN** o diagrama deixa explícito que `services/api` é o único ponto de entrada para apps
- **THEN** o diagrama mostra que `services/media-workflow` é event-driven e não é chamado diretamente por apps

### Requirement: ARCHITECTURE.md contém ADRs consolidados
O `docs/ARCHITECTURE.md` SHALL consolidar as decisões arquiteturais do projeto (ADR-001 a ADR-009) em formato padronizado.

#### Scenario: ADRs presentes e formatados
- **WHEN** se lê o `docs/ARCHITECTURE.md`
- **THEN** existem no mínimo 9 ADRs numerados (ADR-001 a ADR-009)
- **THEN** cada ADR contém: data, status, contexto, decisão e consequências
- **THEN** os ADRs cobrem: estratégia git, estrutura de diretórios, CI/CD, turborepo cache, separação site/saas, multi-tenancy, granularidade git, separação api/media-workflow

### Requirement: ARCHITECTURE.md contém tabela de stack por componente
O `docs/ARCHITECTURE.md` SHALL conter tabela detalhando stack técnica de cada componente.

#### Scenario: Stack por componente documentada
- **WHEN** se lê o `docs/ARCHITECTURE.md`
- **THEN** existe tabela com colunas: componente, caminho, linguagem, framework, runtime, status
- **THEN** cobre os 14 componentes deployáveis (apps, services, workers)

### Requirement: ARCHITECTURE.md contém topologia de deploy
O `docs/ARCHITECTURE.md` SHALL descrever onde cada componente roda em produção.

#### Scenario: Topologia de deploy documentada
- **WHEN** se lê o `docs/ARCHITECTURE.md`
- **THEN** existe seção descrevendo: Hetzner VPS (Coolify), RunPod (workers GPU), mini-PC local (api-local), GHCR como registry
- **THEN** o fluxo de CI/CD está documentado: push → GitHub Actions → GHCR → Coolify webhook

### Requirement: ARCHITECTURE.md contém resumo da pipeline de mídia
O `docs/ARCHITECTURE.md` SHALL conter um resumo das etapas da pipeline de produção de mídia.

#### Scenario: Pipeline de mídia documentada
- **WHEN** se lê o `docs/ARCHITECTURE.md`
- **THEN** existe seção descrevendo as etapas: captura → ingestão → orquestração → análise → processamento → aprovação → publicação
- **THEN** cada etapa indica qual componente é responsável

### Requirement: ARCHITECTURE.md declara TBDs arquiteturais
O `docs/ARCHITECTURE.md` SHALL listar as decisões arquiteturais ainda abertas.

#### Scenario: TBDs arquiteturais presentes
- **WHEN** se lê o `docs/ARCHITECTURE.md`
- **THEN** existe seção de TBDs cobrindo: isolamento de multi-tenancy no banco, biblioteca de auth, gateway de pagamentos, stack de notificações
- **THEN** cada TBD tem breve justificativa de por que ainda não foi decidido
