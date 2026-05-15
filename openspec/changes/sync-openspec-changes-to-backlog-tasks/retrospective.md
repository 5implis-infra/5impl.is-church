## §0 Evidence

**Artifacts produced:** 9/9 (brainstorm, proposal, design, specs, adr, tasks, plan, verify, retrospective)
**Total artifact count:** 9
**Change directory:** `openspec/changes/sync-openspec-changes-to-backlog-tasks/`
**Schema:** intent-driven
**Phase:** Artifact creation (apply phase complete)

## §1 Wins

- Backlog task generation script (`sync-openspec-change-to-backlog.ts`) created with idempotent sync logic and --full regeneration support.
- Reverse sync script (`sync-backlog-task-to-openspec.ts`) implemented for controlled field back-sync (status, checklist, notes).
- Pre-commit hook integration established using existing pattern from docs↔backlog docs sync.
- Section mapping corrected to use only valid Backlog.md sections: Description, Acceptance Criteria, Implementation Plan, Notes, Final Summary.
- Design and retrospective artifacts correctly mapped to Discussion and Final Summary Backlog sections.
- OpenSpec change verification confirmed all checklist items marked complete.

## §2 Misses

- Initially used invalid Backlog section names (SPECIFICATIONS, DISCUSSION) that are not recognized by the Backlog.md tool.
- Regenerated tasks multiple times before settling on correct section mapping — required user feedback to identify invalid sections.
- Section ordering in generated task bodies may not match reference file order (Discussion appears after Notes instead of before Acceptance Criteria).

## §3 Plan deviations

- Implementation followed plan.md micro-steps closely: scripts created, pre-commit hook added, validation implemented.
- Section mapping adjustment required — initially mapped OpenSpec "design" to "Discussion" but was flagged as invalid by user.
- Changed SECTION_MAP to use only valid Backlog sections and added EXTRA_SECTIONS for optional artifacts (design, retrospective, dod).
- DoD artifact handling added after discovering DoD:BEGIN/DOD:END pattern in reference files.

## §4 Skill compliance

| Skill | Invoked | Notes |
|---|---|---|
| openspec-apply-change | ❌ Skipped | Implementation already done in prior sessions |
| openspec-verify-change | ❌ Skipped | Used manual verification instead |

## §5 Surprises

- Backlog.md section names are rigidly defined — "Discussion" and "Specifications" are not valid Backlog task sections.
- The "Discussion" section from design.md is valuable context but must be embedded in task body as extra section.
- DoD section uses just "DOD" as marker name (not "SECTION:DOD") with DOD:BEGIN/DOD:END syntax.
- OpenSpec changes with all tasks checked show status "Done" which triggers archive flow in sync script.

## §6 Promote candidates

- `sync-openspec-change-to-backlog.ts` script pattern — could serve as template for other tool integrations.
- The EXTRA_SECTIONS pattern for handling optional artifacts (design, retrospective, dod) is reusable.
- Idempotent sync with --force regeneration flag is a good pattern for script-based integrations.