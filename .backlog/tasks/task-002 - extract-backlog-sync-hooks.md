---
id: task-002
title: extract-backlog-sync-hooks
status: To Do
labels: ["openspec", "sync"]
references: []
documentation: []
generated-by: openspec-backlog-task-sync
---

## Description
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- SECTION:DESCRIPTION:BEGIN -->
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
<!-- SECTION:DESCRIPTION:END -->

## Discussion
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- SECTION:DISCUSSION:BEGIN -->
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
<!-- SECTION:DISCUSSION:END -->

## Acceptance Criteria
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- AC:BEGIN -->
## Tasks

- [x] 1.1 Create `.git/hooks/backlog-sync-docs-to-backlog.sh`
- [x] 1.2 Create `.git/hooks/backlog-sync-backlog-to-docs.sh`
- [x] 2.1 Update `install-backlog-sync-hook.sh` to install the new scripts
- [x] 2.2 Update `pre-commit` to call the new scripts
- [x] 3.1 Run installer to install new hook structure
- [x] 3.2 Test bidirectional sync works
- [x] 3.3 Verify clean run (no errors)
<!-- AC:END -->

## Implementation Plan
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- SECTION:PLAN:BEGIN -->
## Plan

### 1. Create Hook Scripts

1. Create `.git/hooks/backlog-sync-docs-to-backlog.sh`
2. Create `.git/hooks/backlog-sync-backlog-to-docs.sh`
3. Make both executable

### 2. Update Installer and pre-commit

1. Update `install-backlog-sync-hook.sh` to install the new scripts
2. Update `pre-commit` to call the scripts

### 3. Test

1. Run installer
2. Test docs→backlog sync
3. Test backlog→docs sync
<!-- SECTION:PLAN:END -->