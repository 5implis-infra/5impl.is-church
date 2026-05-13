## 1. Preparação

- [x] 1.1 Verificar se algum workflow em `.github/workflows/` ou `openspec/config.yaml` referencia `CLAUDE.md` diretamente
- [x] 1.2 Verificar se há outras ferramentas ou scripts no repositório que dependem de `CLAUDE.md`

## 2. Criar README.md

- [x] 2.1 Criar `README.md` na raiz com one-liner do produto (SaaS multi-tenant para igrejas)
- [x] 2.2 Adicionar tabela de componentes (apps, services, workers, packages) com nome, caminho, tech e runtime
- [x] 2.3 Adicionar bloco de quickstart (clone com submodules, pnpm install, pnpm dev)
- [x] 2.4 Adicionar links para `AGENTE.md` e `docs/ARCHITECTURE.md`
- [x] 2.5 Validar que o arquivo tem menos de 120 linhas e não contém ADRs nem diagramas

## 3. Criar AGENTE.md

- [x] 3.1 Criar `AGENTE.md` na raiz com seção de produto (one-liner + contexto SaaS multi-tenant)
- [x] 3.2 Adicionar seção de conceitos de domínio: church/tenant, filial, plano, membro, operador, modos de operação
- [x] 3.3 Adicionar mapa de módulos do produto (Pessoas, Eventos, Financeiro, Cursos, Pastoral, Teologia, Agendas, Notificações, Mídia)
- [x] 3.4 Adicionar mapa de ownership por serviço (qual serviço é dono de quê)
- [x] 3.5 Adicionar diagrama ASCII ou lista do fluxo de dados macro (cliente → api → workers → storage)
- [x] 3.6 Adicionar resumo da pipeline de mídia com link para `docs/ARCHITECTURE.md`
- [x] 3.7 Adicionar tabela de stack por camada (linguagens, frameworks, runtimes, banco, infra, CI/CD)
- [x] 3.8 Adicionar seção de TBDs explícitos (auth, pagamentos, multi-tenancy, notificações) com breve abordagem sugerida
- [x] 3.9 Adicionar seção de padrões de código (TypeScript ESM + Python ruff/mypy + Dockerfile por worker)
- [x] 3.10 Adicionar seção de comandos essenciais (pnpm workspace + submodule management)
- [x] 3.11 Adicionar lista de repositórios e submodules com caminhos
- [x] 3.12 Verificar que nenhuma referência a ferramentas específicas de IA (Claude, Cursor, Copilot) existe no arquivo

## 4. Criar docs/ARCHITECTURE.md

- [x] 4.1 Criar `docs/ARCHITECTURE.md` substituindo o arquivo existente
- [x] 4.2 Adicionar diagrama ASCII do sistema completo (apps → api → workers → storage, media-workflow event-driven)
- [x] 4.3 Consolidar ADR-001 a ADR-009 no novo formato (data, status, contexto, decisão, consequências)
- [x] 4.4 Adicionar tabela de stack por componente (14 componentes deployáveis: apps, services, workers)
- [x] 4.5 Adicionar seção de topologia de deploy (Hetzner/Coolify, RunPod, mini-PC, GHCR, fluxo CI/CD)
- [x] 4.6 Adicionar resumo da pipeline de mídia (captura → ingestão → orquestração → análise → processamento → aprovação → publicação)
- [x] 4.7 Adicionar seção de TBDs arquiteturais (multi-tenancy isolation, auth lib, payment gateway, notification stack)

## 5. Remover CLAUDE.md

- [x] 5.1 Remover `CLAUDE.md` da raiz do repositório
- [x] 5.2 Confirmar que `AGENTE.md` cobre todo o conteúdo relevante que estava no `CLAUDE.md`

## 6. Validação final

- [x] 6.1 Verificar que `README.md` renderiza corretamente (tabelas, links, blocos de código)
- [x] 6.2 Verificar que `AGENTE.md` não contém referências a ferramentas específicas de IA
- [x] 6.3 Verificar que `docs/ARCHITECTURE.md` contém os 9 ADRs e o diagrama de sistema
- [x] 6.4 Confirmar que `CLAUDE.md` foi removido e não existe mais na raiz
