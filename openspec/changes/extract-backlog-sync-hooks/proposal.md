## Why

O código do pre-commit hook está inline no `.git/hooks/pre-commit`, dificultando manutenção e teste. Extrair para scripts separados melhora modularidade e permite chamadas diretas.

## What Changes

- Criar `.git/hooks/backlog-sync-docs-to-backlog.sh` com lógica docs→backlog
- Criar `.git/hooks/backlog-sync-backlog-to-docs.sh` com lógica backlog→docs
- `.git/hooks/pre-commit` delega para os dois scripts
- Atualizar `install-backlog-sync-hook.sh` para instalar os novos scripts

## Capabilities

Nenhum capability novo - é refactoring puro.

## Impact

- `.git/hooks/backlog-sync-docs-to-backlog.sh` (novo)
- `.git/hooks/backlog-sync-backlog-to-docs.sh` (novo)
- `scripts/install-backlog-sync-hook.sh` (modificado)
- `.git/hooks/pre-commit` (modificado)