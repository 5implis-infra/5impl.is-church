## Agreed Scope

Refatorar o sync do Backlog para extrair a lógica dos hooks em scripts separados:
1. Extrair lógica inline do `.git/hooks/pre-commit` para scripts em `.git/hooks/`
2. `.git/hooks/pre-commit` apenas delega para os scripts
3. `scripts/backlog-sync-doc-index.ts` permanece como está

## Key Constraints

- Backlog sync bidirecional deve continuar funcionando
- Hook installer deve ser idempotente
- Arquivos em `.git/hooks/` devem ser executáveis

## Chosen Direction

- Criar `.git/hooks/backlog-sync-docs-to-backlog.sh` para docs→backlog
- Criar `.git/hooks/backlog-sync-backlog-to-docs.sh` para backlog→docs
- `pre-commit` chama ambos os scripts

## Open Questions

Nenhum - a direção é clara.