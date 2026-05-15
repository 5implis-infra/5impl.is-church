## §0 Evidence

- **Change**: `update-openspec-architecture-schema-routing`
- **Artifacts produced**: 9/9 (brainstorm, proposal, design, specs, adr, tasks, plan, verify, retrospective)
- **Tasks from tasks.md**: 5 groups, ~18 micro-tasks across all groups
- **Commits**: 0 (pending apply phase)
- **Time**: Artifact creation ~3 sessions; implementation not yet started

## §1 Wins

- **Schema analysis**: Found the exact bug in `architecture-driven` — `id: proposal` vs `requires: [scope]` mismatch was clear once the YAML was read
- **Flat file decision**: Single-file-per-concern path was a quick consensus; avoids redundant ARCHITECTURE.md nesting
- **Skill rule realignment**: Separating mandatory vs conditional skills in `config.yaml` addresses the real pain point — backend changes shouldn't require frontend skills
- **No production code needed**: This change is pure YAML/doc edits; no build, no test suite, no deployment risk

## §2 Misses

- **Specification bloat for pure-config change**: Creating a full `specs/spec.md` with all empty sections (ADDED/MODIFIED/REMOVED all blank) was technically correct but felt ceremonial — this is a config-only change with no product capabilities affected
- **Conditional skill format unresolved**: Decision recorded as open question rather than solved; `config.yaml` doesn't have a `May use X` syntax so the refinement is still incomplete
- **arc42 skill adaptation**: The skill path fix (Decision 4) was designed but not tested — whether the skill accepts a path parameter or requires a fork remains an open question until implementation

## §3 Plan deviations

- **No subagent-driven execution**: The plan was written for subagent-driven micro-steps, but all artifacts are config/YAML edits that are straightforward for a human or single agent to execute directly
- **tasks.md and plan.md are redundant for this change**: Since the apply phase is just YAML edits, breaking into micro-steps adds overhead without value — a simple ordered list would have sufficed
- **Did not use c4-architecture skill for design**: The `design` rule lists `c4-architecture` as mandatory but the design doc had no diagrams to produce — this is exactly the conditional-skill problem this change aims to fix; the design was written without invoking C4 skills

## §4 Skill compliance

- **brainstorming**: Invoked (via skill tool)
- **grill-me**: Not invoked — scope was clear from compressed conversation context
- **c4-architecture**: Skipped — design doc contained no diagrams; change is schema/config only
- **caveman, improve-codebase-architecture, site-architecture, tailwind-design-system, frontend-design, ui-ux-pro-max**: Not invoked — change does not involve frontend, design systems, or site architecture
- **gherkin-authoring**: Invoked (via skill tool) for specs artifact
- **openspec-apply-change**: Not invoked — apply phase not yet run
- **openspec-verify-change**: Not invoked — verify phase not yet run
- **architecture-decision-records**: Invoked for adr artifact

## §5 Surprises

- **Empty specs was correct**: The proposal's Capabilities section correctly lists "None — this change modifies infrastructure tooling, not product behavior." No spec files needed; the empty spec file satisfies the schema without false ceremony
- **verify artifact is pre-written**: The verify.md artifact was created as a template with checkboxes, not a post-apply summary — this is the expected pattern for pre-apply artifact generation in the intent-driven schema
- **OpenSpec CLI `architecture-driven` validation**: The exact error message — "Invalid dependency reference in artifact 'architecture-doc': 'scope' does not exist" — directly pointed to the fix needed, confirming that validation is working correctly

## §6 Promote candidates

- **Empty spec pattern**: `## ADDED Requirements\n\n(None — ...)\n\n## MODIFIED Requirements\n\n(None — ...)\n\n## REMOVED Requirements\n\n(None — ...)` is a valid, schema-compliant way to satisfy the specs artifact for config-only changes. Consider documenting this as a schema-level guideline for "pure-config changes."
- **Conditional skill syntax need**: The open question about `May use X` vs `Must use X` in `config.yaml` suggests a schema enhancement. Consider a future schema change that distinguishes mandatory vs conditional skill requirements explicitly.