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