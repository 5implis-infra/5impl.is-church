## Agreed Scope

Modificar o fluxo de sync entre `docs/` e `.backlog/` para:

1. **Docs → Backlog (existente, modificado)**: Copiar o conteúdo COMPLETO do arquivo canonical para `.backlog/` ao invés de apenas gerar stubs. Incluir link canônico na primeira linha após frontmatter.

2. **Backlog → Docs (NOVO)**: Criar pre-commit hook que detecta alterações em `.backlog/docs/*.md` e `.backlog/decisions/*.md` e copia o conteúdo de volta para `docs/` e `docs/adrs/` respectivamente.

3. **Bidirecional**: O sync funciona em ambas direções, mantendo ambos arquivos sincronizados.

## Key Constraints

- Arquivos em `.backlog/` são a versão "visível pelo Backlog" mas `docs/` permanece como source of truth para o conteúdo
- Links must be preserved: canonical path link header in each file
- O hook deve ser idempotente e não causar loops infinitos
- Arquivos sem o marker `generated-by` não são tocados

## Alternatives Considered

1. **Symlinks**: Rejeitado - Backlog não suporta bem symlinks e há problemas de portabilidade
2. **Apenas uma direção (docs→backlog)**: Já implementado mas não cobre o caso de uso de editar via Backlog
3. **Dupla cópia integral**: Manter cópias idênticas em ambos, com merge manual - complexo demais

## Chosen Direction

- Arquivos em `.backlog/` contêm conteúdo COMPLETO + link header
- Pre-commit hook detecta mudanças em `.backlog/` e faz push para `docs/`
- Marker `generated-by` continua marcando arquivos gerados
- O script de sync `backlog-sync-doc-index.ts` é adaptado para fazer cópia integral

## Open Questions

- Como tratar conflitos se ambos forem editados? (Raro - assumir que `docs/` wins)
- O hook de `backlog→docs` deve verificar se há alterações em `docs/` também? (Sim, para evitar sobrescrever)