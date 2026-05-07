## 1. Rename do Submodule (pré-requisito manual)

- [x] 1.1 Renomear repo no GitHub: `adponte-infra/control-plane` → `adponte-infra/media-workflow` (ação manual no GitHub UI)
- [x] 1.2 Atualizar `.gitmodules`: substituir path `services/control-plane` por `services/media-workflow` e URL correspondente
- [x] 1.3 Executar `git submodule sync` no root do saas
- [x] 1.4 Mover diretório: `git mv services/control-plane services/media-workflow`
- [x] 1.5 Verificar `git submodule status` — confirmar que `services/media-workflow` está íntegro

## 2. Atualização da Documentação Arquitetural

- [x] 2.1 Atualizar `docs/PLAN.md`: substituir todas as referências a `control-plane` por `media-workflow` na tabela de projetos e na estrutura interna
- [x] 2.2 Atualizar `docs/PLAN.md`: corrigir a descrição do projeto `media-workflow` (orquestrador do workflow de produção de mídia)
- [x] 2.3 Atualizar `docs/ARCHITECTURE.md` ADR-007: substituir referências a `control-plane` por `media-workflow`
- [x] 2.4 Adicionar novo ADR em `docs/ARCHITECTURE.md` descrevendo a separação de responsabilidades entre `services/api` e `services/media-workflow`

## 3. README.md — Packages

- [x] 3.1 Criar `packages/db/README.md`
- [x] 3.2 Criar `packages/types/README.md`
- [x] 3.3 Criar `packages/auth/README.md`
- [x] 3.4 Criar `packages/core/README.md`
- [x] 3.5 Criar `packages/ui/README.md`
- [x] 3.6 Criar `packages/api-client/README.md`
- [x] 3.7 Criar `packages/config/README.md`

## 4. README.md — Services

- [x] 4.1 Criar `services/api/README.md`
- [x] 4.2 Criar `services/media-workflow/README.md` (em `services/control-plane/` até rename)
- [x] 4.3 Criar `services/api-local/README.md`

## 5. README.md — Apps

- [x] 5.1 Criar `apps/admin-web/README.md`
- [x] 5.2 Criar `apps/admin-app/README.md`
- [x] 5.3 Criar `apps/member-app/README.md`

## 6. README.md — Workers (Mídia)

- [x] 6.1 Criar `workers/media/transcript/README.md`
- [x] 6.2 Criar `workers/media/ffmpeg/README.md`
- [x] 6.3 Criar `workers/media/davinci/README.md`
- [x] 6.4 Criar `workers/media/images/README.md`
- [x] 6.5 Criar `workers/media/telegram-bot/README.md`

## 7. README.md — Workers (Sistema)

- [x] 7.1 Criar `workers/system/notifications/README.md`
- [x] 7.2 Criar `workers/system/sync/README.md`
- [x] 7.3 Criar `workers/system/scheduled-jobs/README.md`

## 8. README.md — Infra

- [x] 8.1 Criar `infra/n8n/README.md`

## 9. AGENTE.md — Packages

- [x] 9.1 Criar `packages/db/AGENTE.md`
- [x] 9.2 Criar `packages/types/AGENTE.md`
- [x] 9.3 Criar `packages/auth/AGENTE.md`
- [x] 9.4 Criar `packages/core/AGENTE.md`
- [x] 9.5 Criar `packages/ui/AGENTE.md`
- [x] 9.6 Criar `packages/api-client/AGENTE.md`
- [x] 9.7 Criar `packages/config/AGENTE.md`

## 10. AGENTE.md — Services

- [x] 10.1 Criar `services/api/AGENTE.md`
- [x] 10.2 Criar `services/media-workflow/AGENTE.md` (em `services/control-plane/` até rename)
- [x] 10.3 Criar `services/api-local/AGENTE.md`

## 11. AGENTE.md — Apps

- [x] 11.1 Criar `apps/admin-web/AGENTE.md`
- [x] 11.2 Criar `apps/admin-app/AGENTE.md`
- [x] 11.3 Criar `apps/member-app/AGENTE.md`

## 12. AGENTE.md — Workers (Mídia)

- [x] 12.1 Criar `workers/media/transcript/AGENTE.md`
- [x] 12.2 Criar `workers/media/ffmpeg/AGENTE.md`
- [x] 12.3 Criar `workers/media/davinci/AGENTE.md`
- [x] 12.4 Criar `workers/media/images/AGENTE.md`
- [x] 12.5 Criar `workers/media/telegram-bot/AGENTE.md`

## 13. AGENTE.md — Workers (Sistema)

- [x] 13.1 Criar `workers/system/notifications/AGENTE.md`
- [x] 13.2 Criar `workers/system/sync/AGENTE.md`
- [x] 13.3 Criar `workers/system/scheduled-jobs/AGENTE.md`

## 14. AGENTE.md — Infra

- [x] 14.1 Criar `infra/n8n/AGENTE.md`

## 15. Verificação Final

- [x] 15.1 Verificar que todos os 22 projetos possuem `README.md` com as 5 seções obrigatórias
- [x] 15.2 Verificar que todos os 22 projetos possuem `AGENTE.md`
- [x] 15.3 Confirmar que `git submodule status` não mostra erros após o rename
- [x] 15.4 Commit no saas root: `chore: rename control-plane to media-workflow + initial docs`
