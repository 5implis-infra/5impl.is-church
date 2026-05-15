# Architecture-Driven OpenSpec Schema

`architecture-driven` is a documentation-first workflow for architectural sessions where the output is arc42-structured documents, ADRs, and doc-update checklists — with no code.

Use this schema when defining authentication strategy, multi-tenancy isolation models, bounded context boundaries, or any other architectural concern that requires careful documentation before implementation.

- **Good fit**: Architectural decisions that need durable records, cross-cutting concerns affecting multiple subprojects, bounded context definitions.
- **Not a good fit**: Implementation changes (use `intent-driven`), small tactical fixes, dependency bumps.

## Activate

```bash
openspec new change "<name>" --schema architecture-driven
```

Or set in `openspec/config.yaml`:

```yaml
schema: architecture-driven
```

## Artifact Sequence

```
scope → architecture-doc → adr → tasks → [apply]
```

| Artifact | Purpose |
|----------|---------|
| `scope` | Determines change type and resolves target doc path before any writing begins |
| `architecture-doc` | Writes arc42-structured document to the resolved path |
| `adr` | Distills durable decisions into ADRs |
| `tasks` | Doc-update checklist for related documentation |
| `apply` | Executes the doc-update checklist |

## Path Routing

The `scope` artifact resolves the target path using three routing questions:

1. **Change Type**: Architecture Concern / Bounded Context / Subproject-local
2. **Target Name**: The specific identifier
3. **Affected Subprojects**: Which subprojects does this touch?

| Type | Target Path |
|------|-------------|
| Architecture Concern | `docs/concerns/<name>.md` |
| Bounded Context | `docs/bounded-contexts/<name>.md` |
| Subproject-local | `<subproject>/docs/ARCHITECTURE.md` |

**Note:** `docs/concerns/` and `docs/bounded-contexts/` live at the monorepo root only. Subprojects use `<subproject>/docs/ARCHITECTURE.md` and `<subproject>/docs/adrs/`.

## arc42 Section Map

Each change type uses the arc42 subset that fits:

| Type | Sections |
|------|----------|
| Architecture Concern | §Scope, §Current State, §Decision, §Consequences, §Per-subproject implications |
| Bounded Context | §Ubiquitous Language, §Aggregates, §Context Map, §Integration points |
| Subproject-local | §Context, §Decisions, §Components affected |

## ADR Destination

ADRs route to either global or local based on scope:

- **Global** (`docs/adrs/<nnn>-<name>.md`): Architecture Concerns or cross-subproject Bounded Contexts
- **Local** (`<subproject>/docs/adrs/<nnn>-<name>.md`): Subproject-local or bounded-context entirely within one subproject

Sequence numbers are monotonic per directory.

## CLI Usage

```bash
# Create a new architecture-driven change
openspec new change "auth-strategy" --schema architecture-driven

# Validate the schema
openspec schema validate architecture-driven

# List available schemas
openspec schemas
```

## Compared to intent-driven

| | `architecture-driven` | `intent-driven` |
|--|--|--|
| Output | Documents only | Delta specs + code |
| Artifact sequence | scope → architecture-doc → adr → tasks | proposal → specs → design → adr → tasks |
| Apply phase | Doc updates | Code implementation |
| Worktree needed | No | Optional |

## Validate

```bash
openspec schema validate architecture-driven
```

For more schemas, refer to https://github.com/intent-driven-dev/openspec-schemas.