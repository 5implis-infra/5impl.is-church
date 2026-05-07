## Why

O monorepo possui um submodule chamado `services/control-plane` cujo propósito real é a orquestração do workflow de produção de mídia — não a gestão de tenants/planos (que reside dentro de `services/api`). O nome incorreto gera ambiguidade arquitetural e contradiz a semântica estabelecida do projeto. Além disso, os 22 projetos do monorepo não possuem documentação inicial, tornando impossível entender o propósito e os limites de cada projeto sem ler múltiplos arquivos de configuração.

## What Changes

- **BREAKING** Submodule `services/control-plane` renomeado para `services/media-workflow`, refletindo sua responsabilidade real: orquestrar o workflow de produção de mídia (da captura à publicação)
- `.gitmodules` atualizado com novo path e URL do submodule
- `docs/PLAN.md` atualizado: tabela de projetos e estrutura interna do `saas`
- `docs/ARCHITECTURE.md` atualizado: ADR-007 revisado para refletir a mudança; novo ADR sobre o módulo de Mídia e separação de responsabilidades
- `README.md` criado para cada um dos 22 projetos do monorepo (mínimo necessário: propósito, módulos servidos, responsabilidades, integrações, onde roda)
- `AGENTE.md` criado para cada um dos 22 projetos (contexto para agentes de IA: o que o projeto faz, o que não faz, pontos de integração)

## Capabilities

### New Capabilities

- `monorepo-project-naming`: Nomenclatura e definição de propósito correta para cada submodule do monorepo, incluindo o rename de `control-plane` → `media-workflow`
- `project-initial-documentation`: Documentação baseline (README.md + AGENTE.md) para todos os 22 projetos do monorepo, servindo como fundação para as próximas iterações de planejamento arquitetural

### Modified Capabilities

<!-- Nenhuma spec existente ainda — projeto greenfield -->

## Impact

- `saas/.gitmodules` — rename do submodule `control-plane` → `media-workflow`
- `saas/pnpm-workspace.yaml` — atualizar glob se necessário
- `saas/docs/PLAN.md` — tabela de projetos e estrutura de diretórios
- `saas/docs/ARCHITECTURE.md` — ADRs revisados e novo ADR
- Todos os 22 diretórios de projetos — novos arquivos `README.md` e `AGENTE.md`
- GitHub: renomear repo `adponte-infra/control-plane` → `adponte-infra/media-workflow` (ação manual)
