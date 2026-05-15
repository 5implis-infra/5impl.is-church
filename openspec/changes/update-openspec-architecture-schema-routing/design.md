## Context

This change modifies OpenSpec schema configuration files and documentation hierarchy rules. No production code is affected. The work is entirely within `openspec/`, `docs/`, and `.agents/skills/` directories.

Key constraints driving these decisions:
- `architecture-driven/schema.yaml` must pass `openspec schema validate` after changes
- `intent-driven` schema must remain unaffected (don't touch what works)
- `docs/ARCHITECTURE.md` remains the root system overview per ADR 010
- Concerns and bounded contexts are product-level concepts; subprojects only hold local architecture docs

## Goals / Non-Goals

**Goals:**
- Fix the `architecture-driven` schema validation error (broken artifact ID reference)
- Update path routing to flat file structure (`docs/concerns/<name>.md` not `docs/concerns/<name>/ARCHITECTURE.md`)
- Align skill rules in `config.yaml` with actual usage: mandatory C4 for design, optional C4 for adr, new arc42 rule for architecture-doc
- Document that `docs/concerns/` and `docs/bounded-contexts/` live at monorepo root, not inside subprojects
- Update ADR 010 to include the new documentation types
- Adapt the `arc42-documentation` skill to respect schema-resolved target paths

**Non-Goals:**
- Do not create actual concern or bounded-context documents (those are future changes)
- Do not modify `intent-driven` schema (already valid and working)
- Do not change where ADRs are stored (`docs/adrs/` or `<subproject>/docs/adrs/` — unchanged)
- Do not enforce frontend/design skills unconditionally on all design artifacts

## Decisions

### Decision 1: Rename `id: proposal` to `id: scope` in `architecture-driven/schema.yaml`

The artifact at line 40 has `id: proposal` but generates `scope.md`, and downstream `architecture-doc` (line 89) has `requires: [scope]`. This mismatch causes CLI validation to fail.

**Choice:** Rename the artifact ID from `proposal` to `scope`. The `generates` field stays as `scope.md` — only the `id` changes.

**Alternative considered:** Keep the artifact ID and change `architecture-doc`'s `requires` to `[proposal]`. Rejected because the `scope` name is semantically correct (this artifact determines the scope and target path), and the mismatch indicates the original naming was the error.

**Implication:** Any CLI command referencing this artifact by ID will use `scope` instead of `proposal`.

---

### Decision 2: Flat file paths for concerns and bounded contexts

**Choice:** Use `docs/concerns/<name>.md` and `docs/bounded-contexts/<name>.md` as single files per concern/context.

**Alternative rejected:** `docs/concerns/<name>/ARCHITECTURE.md` — creates redundant naming (ARCHITECTURE.md inside an architecture directory) and adds unnecessary directory depth for what starts as a single file.

**Alternative rejected:** `docs/contexts/<name>/domain-model.md` — `context` is overloaded in this codebase (context maps, context diagrams, files in `docs/old/`). `bounded-contexts/` is more explicit.

---

### Decision 3: Skill rules in `config.yaml`

**Choice:**
- `architecture-doc`: require `arc42-documentation`, permit `c4-architecture` as optional
- `design`: keep `c4-architecture` mandatory; make `caveman`, `improve-codebase-architecture`, `site-architecture`, `tailwind-design-system`, `frontend-design`, `ui-ux-pro-max` conditional (apply only when change involves those domains)
- `adr`: keep only `architecture-decision-records`; `c4-architecture` becomes optional, not mandatory

**Alternative rejected:** Leave all skills mandatory for both. This caused `design` to demand frontend skills even for backend-only schema changes.

**Rationale:** Skills are guidance, not enforcement. Making them conditional or optional doesn't prevent their use — it just removes false positives.

---

### Decision 4: `arc42-documentation` skill path adaptation

**Choice:** The skill's hardcoded `docs/architecture/arc42/` path conflicts with the schema's routing table. The skill must be adapted to accept a target path from the schema instruction rather than hardcoding its own.

**Implementation:** Override the path in the skill's `Must` rules to use the OpenSpec scope-resolved target path. If the skill supports parameters, use those; otherwise, fork the skill with path as a configurable parameter.

**Rationale:** The schema already defines where `architecture-doc` should be written. The skill should serve the schema, not dictate its own path.

---

### Decision 5: ADR 010 documentation hierarchy update

**Choice:** Add two new rows to the hierarchy table in `docs/adrs/010-documentation-hierarchy-source-of-truth.md`:

| File/Dir | Purpose | Is Source of Truth For |
|---|---|---|
| `docs/concerns/*.md` | Architecture concerns cross-cutting subprojects | Auth strategy, multi-tenancy isolation, billing integration, etc. |
| `docs/bounded-contexts/*.md` | Bounded context domain models and integration points | People, finance, media, courses bounded contexts |

**Rationale:** ADR 010 is the canonical source of truth for documentation roles. Every new documentation type must be declared there to avoid ambiguity.

---

## Risks / Trade-offs

- **Skill adaptation risk** — The `arc42-documentation` skill may not accept parameter overrides for its output path. If so, a fork is required, which diverges from upstream. Mitigation: test path override before fully committing; fork if parameterization proves infeasible.

- **CLI artifact ID change** — Renaming `proposal` to `scope` changes the artifact identifier used by `openspec instructions scope`. Any scripts or muscle memory referencing `proposal` for this artifact will break. Mitigation: document the change clearly; this is a one-time fix.

- **Conditional skill enforcement** — Making some design skills conditional reduces guardrail enforcement. A backend-only change might skip relevant frontend skills even if they would help. Mitigation: conditional doesn't mean forbidden — agents can still invoke them when appropriate.

## Migration Plan

1. Edit `openspec/schemas/architecture-driven/schema.yaml`:
   - Change `id: proposal` to `id: scope` at line 40
2. Update `openspec/schemas/architecture-driven/templates/scope.md` routing table
3. Add `architecture-doc:` section to `openspec/config.yaml` rules
4. Refine `design:` section in `openspec/config.yaml`
5. Remove `c4-architecture` from mandatory `adr:` section in `openspec/config.yaml`
6. Add scope guidance note to `openspec/schemas/architecture-driven/README.md`
7. Edit `docs/adrs/010-documentation-hierarchy-source-of-truth.md` with new rows
8. Adapt `.agents/skills/arc42-documentation/SKILL.md` path rule
9. Run `openspec schema validate architecture-driven` to confirm fix
10. Run `openspec schema validate intent-driven` to confirm no regression

No rollback needed beyond `git checkout` on the modified files — all changes are purely additive or cosmetic (file moves are not involved).

## Open Questions

1. **arc42 skill path parameterization** — Does the `arc42-documentation` skill support a target path parameter, or must it be forked? This determines the implementation effort for Decision 4. (The skill source at `.agents/skills/arc42-documentation/SKILL.md` line 40 hardcodes `docs/architecture/arc42/` — no parameter is evident, so a fork or override is likely needed.)

2. **Conditional skill specification** — How should the conditional nature of `design` frontend skills be expressed in `config.yaml`? Current format is `Must use X` which is boolean. A future extension might use `May use X` or `Use when change involves frontend`. For now, keeping them as `Must use` with a comment that they may be skipped via explicit opt-out seems acceptable.