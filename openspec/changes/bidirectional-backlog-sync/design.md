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