---
id: task-001
title: bidirectional-backlog-sync
status: To Do
assignee: []
created_date: ''
updated_date: '2026-05-15 06:49'
labels:
  - openspec
  - sync
dependencies: []
priority: low
---

## Description
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- SECTION:DESCRIPTION:BEGIN -->
## Why

O sync atual `docs/` → `.backlog/` gera stubs parciais que não contêm o conteúdo completo dos documentos. Precisa ser bidirecional: não apenas expor docs ao Backlog, mas também permitir que arquivos em `.backlog/` sejam a fonte visível ao Backlog enquanto o conteúdo completo é mantido sincronizado.

## What Changes

- Modificar `backlog-sync-doc-index.ts` para copiar o conteúdo COMPLETO dos arquivos canonical para `.backlog/` ao invés de stubs
- Adicionar link canônico na primeira linha após frontmatter em cada arquivo `.backlog/`
- Criar pre-commit hook para detectar alterações em `.backlog/` e fazer push para `docs/`
- Manter idempotência em ambas direções

## Capabilities

### New Capabilities
- `backlog-full-sync`: Sync bidirecional que mantém `.backlog/` e `docs/` sincronizados com conteúdo completo

## Impact

- `scripts/backlog-sync-doc-index.ts`: modificado para cópia integral
- `.git/hooks/pre-commit`: adicionado handler para `backlog→docs`
- Novos stubs em `.backlog/` conterão conteúdo completo ao invés de stubs
<!-- SECTION:DESCRIPTION:END -->

## Discussion
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- SECTION:DISCUSSION:BEGIN -->
## Context

O sistema atual gera stubs parciais em `.backlog/` que contêm apenas frontmatter e um link para o arquivo canônico. O objetivo é ter `.backlog/` como um espelho completo de `docs/` e `docs/adrs/`, com conteúdo integral disponível ao Backlog.md.

## Decisions

### 1. Cópia integral ao invés de stubs

Cada arquivo em `.backlog/` agora contém:
1. Frontmatter Backlog-compatible (id, title, type, created_date)
2. Marker `generated-by: adponte-backlog-doc-index`
3. Link canônico na primeira linha: `Canonical: [path](relative_path)`
4. Conteúdo completo do arquivo original

### 2. Hook bidirecional

O pre-commit hook detecta:
- `A`, `D`, `R` em `docs/` → regenerate `.backlog/` (existente)
- `A`, `D`, `R` em `.backlog/` → propagate para `docs/` (novo)

O hook verifica a ORIGEM da alteração para evitar loops:
- Alteração em `docs/` → atualiza `.backlog/`
- Alteração em `.backlog/` → atualiza `docs/`

### 3. Marker para não-sobrescrita

Arquivos sem `generated-by: adponte-backlog-doc-index` são ignorados em ambas direções.

### 4. Conflito Docs vs Backlog

Se ambos forem editados entre commits, `docs/` wins (source of truth).

## Migration Plan

1. Re-gerar todos os stubs com `--full` para popular `.backlog/` com conteúdo completo
2. Instalar novo hook com handler `backlog→docs`
3. Commitar novos stubs gerados
4. Testar cenários de edit, delete, rename nas duas direções
<!-- SECTION:DISCUSSION:END -->

## Acceptance Criteria
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- AC:BEGIN -->
## 1. Script Modification - Full Content Sync

- [x] 1.1 Modify `generateDocStub()` to include full file content instead of just link
- [x] 1.2 Modify `generateDecisionStub()` to include full ADR content
- [x] 1.3 Update canonical link path calculation for correct relative paths
- [x] 1.4 Test that `.backlog/docs/*.md` now contains full canonical content
- [x] 1.5 Test that `.backlog/decisions/*.md` now contains full ADR content

## 2. Pre-Commit Hook - Bidirectional

- [x] 2.1 Update pre-commit hook to detect `A`, `D`, `R` in `.backlog/docs/` and `.backlog/decisions/`
- [x] 2.2 Implement `backlog→docs` propagation logic
- [x] 2.3 Add safeguard to detect if file was originally changed in `docs/` (avoid overwrite)
- [x] 2.4 Hook stages propagated files automatically
- [x] 2.5 Update idempotent installer to include new hook block

## 3. Initial Sync - Regenerate Stubs

- [x] 3.1 Run `backlog-sync-doc-index.ts --full` to regenerate all stubs with full content
- [x] 3.2 Verify stub content matches canonical exactly (except for header)
- [x] 3.3 Stubs are gitignored (not committed) - generated on-demand by pre-commit hook

## 4. Verification

- [x] 4.1 Test: Edit a file in `docs/`, commit, verify `.backlog/` updated
- [x] 4.2 Test: Edit a file in `.backlog/`, commit, verify `docs/` updated
- [x] 4.3 Test: Delete scenario in both directions
- [x] 4.4 Test: Rename scenario in both directions
- [x] 4.5 Test: Modified-only edit does not trigger cross-directional sync
<!-- AC:END -->

## Implementation Plan
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- SECTION:PLAN:BEGIN -->
## Task Groups

## 1. Script Modification - Full Content Sync

### Micro-steps

1. **Read current `backlog-sync-doc-index.ts`** to understand generateDocStub/generateDecisionStub functions
2. **Modify `generateDocStub()`** to append full file content after the canonical link header
3. **Modify `generateDecisionStub()`** to append full ADR content after the canonical link header
4. **Update path calculations** for the canonical link (ensure `../../docs/` prefix is correct)
5. **Run script with `--full`** and verify output in `.backlog/`

### File paths
- `scripts/backlog-sync-doc-index.ts`

### Test commands
```bash
tsx scripts/backlog-sync-doc-index.ts --full
cat .backlog/docs/doc-architecture.md
cat .backlog/decisions/decision-014.md
```

### Commit point
After step 5 - commit "chore: sync full content to backlog stubs"

---

## 2. Pre-Commit Hook - Bidirectional

### Micro-steps

1. **Read current `.git/hooks/pre-commit`** to see existing backlog-sync block
2. **Add `backlog→docs` detection**: grep for `A`, `D`, `R` in `.backlog/docs/` and `.backlog/decisions/`
3. **Implement propagation**: copy modified `.backlog/` files back to `docs/` (keeping generated-by marker)
4. **Add origin safeguard**: check if `docs/` was also changed in same commit (if so, skip to avoid overwrite)
5. **Stage propagated files**: `git add docs/ docs/adrs/`
6. **Update hook installer** to include new block with idempotency

### File paths
- `.git/hooks/pre-commit`
- `scripts/install-backlog-sync-hook.sh`

### Test commands
```bash
# Test propagation manually
git diff --cached --name-status
# Should show docs changes when .backlog is modified
```

### Commit point
After step 6 - commit "chore: add bidirectional sync to pre-commit hook"

---

## 3. Initial Sync - Regenerate Stubs

### Micro-steps

1. **Run `backlog-sync-doc-index.ts --full`** to regenerate all stubs with full contents
2. **Verify content**: compare a few `.backlog/` files with original `docs/` files
3. **Stage and commit** regenerated stubs

### File paths
- `.backlog/docs/*.md` (regenerated)
- `.backlog/decisions/*.md` (regenerated)

### Test commands
```bash
diff docs/ARCHITECTURE.md <(tail -n +9 .backlog/docs/doc-architecture.md)
```

### Commit point
After step 3 - commit "chore: regenerate backlog stubs with full content"

---

## 4. Verification Tests

### Micro-steps

1. **Edit test**: Modify `docs/PRODUCT.md`, stage, commit, verify `.backlog/docs/doc-product.md` updated
2. **Backlog→Docs test**: Modify `.backlog/docs/doc-product.md`, stage, commit, verify `docs/PRODUCT.md` updated
3. **Delete test docs→backlog**: Delete `docs/TEMP.md`, stage, commit, verify stub removed
4. **Delete test backlog→docs**: Delete `.backlog/docs/doc-architecture.md`, stage, commit, verify canonical kept
5. **Modified-only test**: Modify content of `docs/ARCHITECTURE.md`, stage, verify hook doesn't trigger cross-sync
6. **Final validation**: Run `openspec validate bidirectional-backlog-sync --type change --strict`

### Test commands
```bash
# Each test is manual verification of file contents
```

### Commit point
After all tests pass - commit "test: add bidirectional sync verification tests"
<!-- SECTION:PLAN:END -->
