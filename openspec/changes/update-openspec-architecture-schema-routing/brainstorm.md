## Agreed Scope

1. **Fix `architecture-driven` schema artifact ID mismatch**
   - Rename `id: proposal` to `id: scope` in `schema.yaml` so `architecture-doc` can reference it correctly
   - `architecture-doc` has `requires: [scope]` but the artifact is named `proposal`, causing CLI validation to fail

2. **Update path routing to flat file structure**
   - Architecture Concern: `docs/concerns/<name>.md` (not `docs/concerns/<name>/ARCHITECTURE.md`)
   - Bounded Context: `docs/bounded-contexts/<name>.md` (not `docs/contexts/<name>/domain-model.md`)
   - Subproject-local: `<subproject>/docs/ARCHITECTURE.md` (unchanged)
   - Update routing table in `scope.md` template and `schema.yaml` instruction

3. **Add `architecture-doc` rule to `openspec/config.yaml`**
   - Require `arc42-documentation` skill for `architecture-doc` artifact generation
   - Permit `c4-architecture` when diagrams clarify system structure, containers, or deployment
   - This fills the gap where `architecture-driven`'s `architecture-doc` has no skill rule

4. **Refine `design` rule in `openspec/config.yaml`**
   - Make `c4-architecture` skill mandatory only when the change affects system structure, service boundaries, runtime flow, or deployment
   - Other skills (caveman, improve-codebase-architecture, site-architecture, tailwind-design-system, frontend-design, ui-ux-pro-max) should apply conditionally — only when the change involves frontend, design system, or site architecture
   - Keep `c4-architecture` as a default for design, but the others should be skip-able

5. **Remove mandatory C4 from `adr` rule**
   - `adr` rule should only require `architecture-decision-records` skill
   - `c4-architecture` is optional for `adr` — include only when a decision depends on a visual architecture view

6. **Document scope rules for `concerns` and `bounded-contexts`**
   - `docs/concerns/` and `docs/bounded-contexts/` live in the monorepo root only
   - Subprojects (`services/api`, `apps/admin-web`, etc.) use `<subproject>/docs/ARCHITECTURE.md` and `<subproject>/docs/adrs/` for local decisions only
   - Do not create `concerns/` or `bounded-contexts/` directories inside subprojects unless a subproject genuinely encapsulates multiple concerns or bounded contexts (defer until needed)

7. **Adapt skill `arc42-documentation` to respect schema-defined paths**
   - Skill hardcodes `docs/architecture/arc42/` as output path — this conflicts with the schema's routing table
   - Either override the path rule to use the OpenSpec scope-resolved path, or update the skill to accept a target path parameter
   - The schema instruction should set the target path; the skill should write there, not to a fixed subdirectory

## Key Constraints

- `openspec/schema validate architecture-driven` must pass after changes
- `openspec/schema validate intent-driven` must continue to pass (don't break existing valid schema)
- `docs/ARCHITECTURE.md` remains the root-level system overview per ADR 010
- `docs/concerns/` and `docs/bounded-contexts/` are additions to the hierarchy defined in ADR 010, not replacements
- ADRs go to `docs/adrs/*.md` (root) or `<subproject>/docs/adrs/*.md` (local) — unchanged routing

## Alternatives Considered

**Subdirectory-per-item for concerns/contexts** (`docs/concerns/auth/ARCHITECTURE.md`)
- Rejected because each concern/context will have a single file initially; subdividing creates navigation overhead and redundant naming (ARCHITECTURE.md inside an architecture directory)
- Subdirectories make sense only when a concern grows to have multiple artifacts (e.g., diagrams, threat models, C4 views separately) — defer until volume warrants it

**Per-subproject `concerns/` and `bounded-contexts/` directories**
- Rejected initially because concerns and bounded contexts are product-level concepts that cross subproject boundaries
- A concern like "multi-tenancy isolation" spans `services/api`, `packages/db`, and potentially `admin-web`
- Subprojects only need local `docs/ARCHITECTURE.md` and `docs/adrs/` for decisions specific to their implementation

**Full arc42 12-section document for every concern/context**
- Rejected because arc42 is heavyweight for a single concern doc
- `architecture-driven` uses arc42-lite sections selected per change type (5 sections for Concern, 4 for Bounded Context, 3 for Subproject-local)
- The `arc42-documentation` skill can be used for whole-system arc42 docs, but concern/context docs use the lighter subset

**Keep `docs/contexts/` naming instead of `docs/bounded-contexts/`**
- `context` is a generic term already overloaded in this codebase (context maps, context diagrams, context files in `docs/old/`)
- `bounded-contexts/` is more explicit and reduces ambiguity with existing documentation patterns

## Chosen Direction

Implement targeted edits to schema YAML files and config, plus a documentation update to ADR 010:

| Change | File | Action |
|--------|------|--------|
| Fix artifact ID | `openspec/schemas/architecture-driven/schema.yaml` | Rename `id: proposal` to `id: scope` |
| Update concern path | `openspec/schemas/architecture-driven/schema.yaml` + `scope.md` template | `docs/concerns/<name>.md` |
| Update bounded-context path | `openspec/schemas/architecture-driven/schema.yaml` + `scope.md` template | `docs/bounded-contexts/<name>.md` |
| Add architecture-doc rule | `openspec/config.yaml` | Add `architecture-doc:` section with `arc42-documentation` + conditional `c4-architecture` |
| Refine design rule | `openspec/config.yaml` | Keep `c4-architecture` mandatory; make frontend/design-system skills conditional |
| Remove C4 from adr rule | `openspec/config.yaml` | Keep only `architecture-decision-records`; move `c4-architecture` to optional |
| Document scope guidance | `openspec/schemas/architecture-driven/README.md` | Add note about concerns/contexts living in root only |
| Update ADR 010 | `docs/adrs/010-documentation-hierarchy-source-of-truth.md` | Add rows for `docs/concerns/` and `docs/bounded-contexts/` |

## Open Questions

1. Should the `arc42-documentation` skill path rule (`docs/architecture/arc42/`) be overridden via a skill parameter, or should the skill be forked to accept a target path? Forking gives more control but diverges from upstream; parameter passing is cleaner but requires skill support.

2. The `architecture-driven` schema currently has `id: proposal` generating `scope.md` — renaming to `id: scope` fixes validation but changes the CLI command to create this artifact. Will this break any existing muscle memory or scripts referencing the artifact ID `proposal`?