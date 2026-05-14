## 1. New Templates

- [x] 1.1 Create `openspec/schemas/intent-driven/templates/brainstorm.md` — sections: Agreed Scope, Key Constraints, Alternatives Considered, Chosen Direction, Open Questions
- [x] 1.2 Create `openspec/schemas/intent-driven/templates/plan.md` — sections per task: Micro-steps (2-5 min each), File paths, Test commands, Commit point
- [x] 1.3 Create `openspec/schemas/intent-driven/templates/verify.md` — two-mode structure: Simple (task completion + openspec validate), Full (+ spec sync + coherence + implementation signal)
- [x] 1.4 Create `openspec/schemas/intent-driven/templates/retrospective.md` — sections: §0 Evidence, §1 Wins, §2 Misses, §3 Plan deviations, §4 Skill compliance, §5 Surprises, §6 Promote candidates

## 2. schema.yaml — New Artifacts

- [x] 2.1 Add `brainstorm` artifact: `requires: []`, `generates: brainstorm.md`, instruction includes skip condition ("Skipped: <reason>" if scope already clear) and grill-me invocation guidance
- [x] 2.2 Add `plan` artifact: `requires: [tasks]`, `generates: plan.md`, instruction includes skip condition (no subagent support), guidance to decompose tasks into micro-steps
- [x] 2.3 Add `verify` artifact: `requires: [plan]`, `generates: verify.md`, instruction includes PRECHECK (git commits > 0 + tasks completed), simple/full mode prompt, re-runnable note
- [x] 2.4 Add `retrospective` artifact: `requires: [verify]`, `generates: retrospective.md`, instruction includes PRECHECK (verify.md exists + not FAIL), skip policy for trivial changes, §0–§6 structure
- [x] 3.1 Update `proposal.requires` from `[]` to `[brainstorm]`
- [x] 3.2 Update `design` instruction: add "When to skip" block — write `Skipped: <reason>` if single-module change with no cross-cutting decisions; downstream `adr` reads marker and propagates
- [x] 3.3 Update `adr` instruction: add skip propagation — if `design.md` contains only a `Skipped:` line, write `adr` marker; otherwise proceed normally
- [x] 3.4 Update `apply.requires` from `[tasks]` to `[plan]`; update apply instruction to fallback to `tasks.md` when `plan.md` contains a `Skipped:` marker
- [x] 3.5 Update schema `description` and `version` to reflect the merged workflow: `brainstorm → proposal → specs → design → adr → tasks → plan → [apply] → verify → retrospective`
- [x] 4.1 Remove context block line: `MUST use brainstorming mode before creating proposal artifacts. Explore user intent...` (now handled by `brainstorm` artifact instruction)
- [x] 4.2 Remove `rules.proposal` entry `grill-me`; add `rules.brainstorm: [grill-me]`
- [x] 4.3 Move `openspec-verify-change` from `rules.tasks` to `rules.verify`

## 5. Validation

- [x] 5.1 Run `openspec schema validate intent-driven` — confirm no validation errors
- [x] 5.2 Create a test change: `openspec new change "schema-smoke-test" --schema intent-driven` and confirm `openspec status` shows `brainstorm` as first READY artifact
- [x] 5.3 Delete the smoke-test change directory (`openspec/changes/schema-smoke-test/`)
