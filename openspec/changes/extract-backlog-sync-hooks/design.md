## Context

O hook atual tem toda lógica inline no pre-commit. A refatoração extrai para scripts separados.

## Decisions

### 1. Arquivos de Hook

`.git/hooks/backlog-sync-docs-to-backlog.sh`:
- Detecta `A`, `D`, `R` em `docs/` e `docs/adrs/`
- Executa `tsx scripts/backlog-sync-doc-index.ts`
- Stageia `.backlog/docs/` e `.backlog/decisions/`

`.git/hooks/backlog-sync-backlog-to-docs.sh`:
- Detecta `A`, `D`, `R` em `.backlog/docs/` e `.backlog/decisions/`
- Propaga conteúdo para `docs/` preservando marker
- Stageia `docs/` e `docs/adrs/`

### 2. pre-commit

```bash
#!/bin/bash
.git/hooks/backlog-sync-docs-to-backlog.sh
.git/hooks/backlog-sync-backlog-to-docs.sh
```

## Migration Plan

1. Criar scripts em `.git/hooks/`
2. Atualizar installer
3. Re-instalar hook
4. Testar fluxo bidirecional