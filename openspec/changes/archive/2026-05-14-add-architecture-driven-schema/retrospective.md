## §0 Evidence

| Metric | Value |
|---|---|
| Tasks completed | 16/16 |
| Artifacts produced | 8/9 (plan: skip marker) |
| New files created | 6 (schema.yaml, README.md, 4 templates) |
| Schema lines | 108 (schema.yaml) + 96 (README.md) |
| Verify result | PASS WITH NOTE |
| OpenSpec schema validate | ✅ valid |
| Skipped specs | 1 (tooling-only, expected) |
| Preceding exploration | Extensive conversation session (~15 turns) prior to `/opsx:new` |

## §1 Wins

- **arc42 + C4 framing landed clearly** — the three-type routing (Concern / Bounded Context / Subproject-local) with corresponding section sets gave the schema a concrete, usable structure instead of a generic "document things" instruction
- **`scope` as explicit routing artifact** worked well — separating the routing decision into its own reviewable artifact prevents silent misrouting before any doc is written
- **Brainstorm captured conversation history faithfully** — the extensive pre-change exploration translated cleanly into a structured brainstorm.md with agreed scope, constraints, and rejected alternatives
- **Schema validated on first attempt** — `openspec schema validate architecture-driven` passed without iteration

## §2 Misses

- 🟡 **`openspec validate --type change` fails for skip-specs changes** — the strict change validator requires delta specs regardless of change type. The skip marker approach (`specs/skipped.md`) satisfies `requires` dependencies but not the validator. This is a documentation gap: the workflow doesn't make clear that tooling changes should use a different validation command (`openspec schema validate`) rather than the change validator.
- 📌 **plan artifact was part of this change's schema but never useful** — since this is a doc-only change, plan was immediately skipped. The skip marker mechanism worked, but it adds a step with no value for this change type.

## §3 Plan Deviations

- **Validation task (4.1)** used `openspec schema validate architecture-driven` instead of `openspec validate --type change` — both are correct but cover different scopes. The change validator failure (§2) was not anticipated in the task definition.
- **No deviation** in file structure or schema design — all decisions from design.md were implemented as specified.

## §4 Skill Compliance

| Skill | Status | Note |
|---|---|---|
| `grill-me` (brainstorm) | ✓ | Extensive conversation session served as brainstorm; brainstorm.md written from it |
| `openspec-apply-change` (tasks) | ✓ | Applied |
| `openspec-verify-change` (verify) | ✓ | verify.md produced with PRECHECK |
| c4-architecture (design) | ✓ | Applied in DAG diagram and routing table |
| Other design skills (tailwind, frontend, ui-ux-pro-max, site-architecture) | ✗ | **Deliberately skipped** — tooling change with no frontend/UI components. These rules in config.yaml are project-wide and not applicable to schema creation. Schema-level or artifact-level filtering would prevent this category mismatch. |

### Deliberately Skipped Skills

**Skills:** `tailwind-design-system`, `frontend-design`, `ui-ux-pro-max`, `site-architecture`, `caveman`, `improve-codebase-architecture`

**What was skipped:** All design-phase skills except `c4-architecture`.

**Why this cycle:** These skills are registered in `config.yaml rules.design` for the entire project. This change adds a new OpenSpec schema — there is no UI, no frontend, no site structure, no Tailwind components. Invoking them would produce irrelevant output. `improve-codebase-architecture` was skipped because the deliverable is a YAML schema file, not application code.

**How to prevent recurrence:** The `config.yaml rules.design` set should be narrowed or split. Options: (1) add a preamble to each rule "Apply only if: [condition]" — but config.yaml doesn't support conditional rules. (2) Accept that tooling changes will always have irrelevant design skill rules and document this as a known gap. (3) For future schema changes, create a separate config profile or note in the change's brainstorm.md which design skills apply.

## §5 Surprises

- **intent-driven schema was already upgraded** when this change started — tasks 1.1–1.4 from `upgrade-intent-driven-schema` were already applied, so `add-architecture-driven-schema` immediately saw the 9-artifact workflow (brainstorm, plan, verify, retrospective). This was not expected but had no negative effect.
- **`openspec schemas` output is already clean and useful** — the schema descriptions and artifact sequences display clearly, no additional formatting needed.

## §6 Promote Candidates

- [ ] 🟡 **config.yaml design rules fire for tooling/schema changes where they don't apply**
  → **Promote to**: CLAUDE.md or config.yaml comment
  > **Why**: design rules include frontend/UI skills registered project-wide; schema/tooling changes don't have these components but still trigger all rules
  > **How to apply**: When creating a change for tooling or schema work, explicitly note in brainstorm.md which design rules are N/A for this change type

- [ ] 📌 **`openspec validate --type change` vs `openspec schema validate` distinction not obvious**
  → **Promote to**: schema instruction (verify artifact's instruction)
  > **Why**: tooling changes that skip specs will always fail the change validator; the verify instruction should surface this distinction explicitly
  > **How to apply**: Add to verify instruction: "For tooling-only changes (skip-specs marker), use `openspec schema validate <schema-name>` instead of `openspec validate --type change`"
