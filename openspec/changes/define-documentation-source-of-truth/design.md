## Context

Monorepo com 22 subprojetos. Docs fragmentation:

- `AGENTS.md` vs `AGENTE.md` — filename inconsistency
- Sem fonte de verdade: sem hierarchy entre docs
- `docs/context/` stale vs actual architecture
- Subproject docs duplicam conteúdo global ao invés de referenciar
- 9 ADRs inline em `ARCHITECTURE.md` — sem path pra `docs/adrs/`

## Goals / Non-Goals

**Goals:**
- Hierarquia onde cada doc = 1 propósito
- Eliminar `AGENTE.md` → `AGENTS.md` everywhere
- Arquivar `docs/context/` → `docs/old/`
- Specs OpenSpec como fonte de requisitos; AGENTS.md aponta, não repete

**Non-Goals:**
- Não reescrever tudo do zero — só realinhar ownership
- Templates flexíveis com mínimo bar
- Design system implementation em `packages/ui`, não em `docs/DESIGN.md`
- `docs/PRODUCT.md` escrito do zero, não derivado de archived content

## C4 Architecture View

### Level 1 — System Context

```mermaid
C4Context
  title System Context — AD Ponte SaaS Documentation

  Person(dev, "Developer/AI Agent", "Reads docs to understand and work in monorepo")
  Person(new_member, "New Contributor", "Onboarding: clone, understand structure")

  System(saas_monorepo, "AD Ponte SaaS Monorepo", "22 subprojects: apps, services, workers, packages, infra")

  System_Ext(github, "GitHub", "Hosts 22 submodule repos + aggregator")
  System_Ext(coolify, "Coolify", "Deploys services to Hetzner VPS")
  System_Ext(runpod, "RunPod", "GPU workers for media pipeline")

  Rel(dev, saas_monorepo, "Reads docs, commits code")
  Rel(new_member, saas_monorepo, "Clones, follows README")
  Rel(saas_monorepo, github, "push/pull")
  Rel(saas_monorepo, coolify, "webhook deploy")
  Rel(saas_monorepo, runpod, "job execution")
```

### Level 2 — Documentation Containers

```mermaid
C4Container
  title Container Diagram — Documentation Architecture

  Person(dev, "Developer/AI Agent")

  System_Boundary(docs, "docs/") {
    Container(constitution, "CONSTITUTION.md", "Identity, values, principles")
    Container(product, "PRODUCT.md", "Products, modules, domain concepts")
    Container(architecture, "ARCHITECTURE.md", "Technical overview + ADR refs")
    Container(design, "DESIGN.md", "Visual/UX constitution")
    Container(adrs, "docs/adrs/", "Immutable ADR files")
    Container(old, "docs/old/", "Archived stale docs")
  }

  System_Boundary(root, "root/") {
    Container(readme, "README.md", "Human entry: quickstart, links")
    Container(agents, "AGENTS.md", "AI context: boundaries, integrations, commands")
  }

  System_Boundary(openspec, "openspec/specs/") {
    Container(specs, "capability specs", "Canonical requirements")
  }

  Rel(dev, readme, "Human quickstart")
  Rel(dev, agents, "AI context")
  Rel(dev, constitution, "Product identity")
  Rel(dev, product, "What we build")
  Rel(dev, architecture, "Technical structure")
  Rel(dev, design, "Visual principles")
  Rel(dev, adrs, "Architectural decisions")
  Rel(agents, specs, "Points to requirements")
```

**Documentation ownership map:**

| Doc | Authority For | Owned By |
|-----|-------------|----------|
| `CONSTITUTION.md` | Identity, values, principles | Product/Leadership |
| `PRODUCT.md` | Products, modules, domain | Product |
| `ARCHITECTURE.md` | Tech architecture + global ADR refs | Architect |
| `DESIGN.md` | Visual/UX intent (implementation in `packages/ui`) | Designer/Architect |
| `docs/adrs/*.md` | Immutable architectural decisions | Architect |
| `docs/old/*` | Historical reference only | None (frozen) |
| `AGENTS.md` | Component boundaries + integrations + minimal commands | Component owner |
| `README.md` | Human entry point + ops | Component owner |
| `openspec/specs/*.md` | Capability requirements | Feature owner |

## Decisions

### D1: Document Hierarchy and Ownership

No doc pode ser autoritativo para conteúdo que vive em outro lugar. Docs apontam entre si, não duplicam.

**Conflict rule:** `docs/old/` conflicts resolvidos a favor de docs ativos.

### D2: `docs/context/*` → `docs/old/`

`product-context.md` + `flow-midia.md` → `docs/old/`. Marcados como archived. Novos docs (`PRODUCT.md`, etc.) escritos do zero.

### D3: ADR Migration

9 ADRs inline → `docs/adrs/001-git-submodules.md` ... `009-api-media-workflow-split.md`. `ARCHITECTURE.md` vira index — só referencia ADRs globais (001, 002, 003, 006, 007, 009).

### D4: `AGENTS.md` Canonical Filename

Todos os agent-context files = `AGENTS.md`. Títulos atualizados. Links consertados. OpenSpec specs atualizadas.

### D5: `openspec/specs/` → Canonical Requirements

Cada subproject AGENTS.md inclui **"Specs relacionados"** com links para specs relevantes. AGENTS.md = "o que este componente faz e como se relaciona". Specs = "o que o feature deve fazer".

### D6: Subproject AGENTS.md — Loose Structure

Mínimo obrigatório: **Propósito**, **O que NÃO faz**, **Pontos de integração**. Além disso, free-form.

### D7: `docs/DESIGN.md` — Strategy, Not Implementation

Princípios visuais + semântica de tokens + padrões de composição + regras UX transversais. **Não** inclui código, API de componentes, ou valores de tokens — vivem em `packages/ui`.

### D8: `docs/OPERATIONS.md` — Only Where Needed

Sem root `docs/OPERATIONS.md`. Só subprojetos com ops complexas/independentes ganham `OPERATIONS.md` próprio.

## Risks / Trade-offs

- **[Risk]** `docs/old/` acumula se não fizer cleanup periódico → **Mitigation:** review quarterly
- **[Risk]** Sem enforcement, docs voltam a duplicar → **Mitigation:** futuro linter CI check
- **[Risk]** AGENTS.md fica stale se teams não atualizam → **Mitigation:** loose structure = low friction to update
- **[Trade-off]** `PRODUCT.md` escrito do zero pode perder knowledge de `product-context.md` → **Mitigation:** `docs/old/product-context.md` preservado para referência

## Migration Plan

```
Phase 1 — Create structure
  mkdir -p docs/adrs/ docs/old/
  touch docs/CONSTITUTION.md docs/PRODUCT.md docs/DESIGN.md

Phase 2 — Populate
  Extrair ADRs de ARCHITECTURE.md → docs/adrs/*.md
  Escrever docs/PRODUCT.md (informado por docs/old/product-context.md)
  Escrever docs/CONSTITUTION.md
  Escrever docs/DESIGN.md

Phase 3 — Cleanup
  mv docs/context/*.md docs/old/
  Atualizar ARCHITECTURE.md como index de ADRs
  Renomear # AGENTE.md → # AGENTS.md em todos os arquivos
  Consertar links AGENTE.md → AGENTS.md
  Atualizar openspec/specs/monorepo-agent-context/spec.md
  Atualizar subproject README + AGENTS

Phase 4 — Validation
  Verificar links quebrados
  Verificar duplicações
  Verificar todos AGENTS.md acessíveis e corretamente titulados
```

## Open Questions

- CI check anti-duplicação? — futuro, não neste change
- `docs/context/` deletado após archivar? — manter directory vazio ou deletar
- `docs/OPERATIONS.md` no root para ops de monorepo? — decisão: não por agora