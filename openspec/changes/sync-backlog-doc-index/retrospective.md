## §0 Evidence

**Artifacts produced:** 8/9 (brainstorm, proposal, design, specs, adr, tasks, plan, verify)
**Total artifact count:** 9
**Change directory:** `openspec/changes/sync-backlog-doc-index/`
**Schema:** intent-driven
**Phase:** Artifact creation (apply phase pending implementation)

## §1 Wins

- Backlog.md analysis was thorough and decisive: direct symlinks were correctly rejected in favor of script-driven index bridge.
- OpenSpec change was pre-created before this session; all required artifacts were already in good shape.
- Spec artifact followed Gherkin style with proper Feature/Rule/Scenario structure and concrete Given/When/Then steps.
- Task artifact captured all 5 task groups with checkbox format ready for apply phase tracking.
- Plan artifact broke each task into micro-steps with file paths, test commands, and commit points — ready for subagent-driven execution.

## §2 Misses

- `openspec instructions <artifact> --json` returns spurious "Unknown artifact ID in rules: architecture-doc" warnings even when artifact is valid. This pollutes output and requires filtering.
- `openspec status --change <name>` shows `plan` as `[-] plan (blocked by: tasks)` even after tasks.md was created and committed — required manual re-check with JSON status to confirm plan was unblocked.
- The ADR artifact output path `../../../docs/adrs/*.md` is an existing ADR file (not a change artifact), which is conceptually confusing. The artifact status tracking maps `adr` to canonical `docs/adrs/` files rather than a change-specific artifact.

## §3 Plan deviations

- Implementation has not started yet (change is in artifact creation phase, not apply phase). No plan deviations to report.
- Retrospective was created as part of artifact creation workflow rather than post-implementation.

## §4 Skill compliance

| Skill | Invoked | Notes |
|---|---|---|
| gherkin-authoring | ✅ Yes | Required for specs artifact; used to structure Gherkin scenarios |
| brainstorming | ❌ Skipped | Already completed in prior session; change design was already agreed |
| architecture-decision-records | ❌ Skipped | ADR was pre-created in prior session |
| openspec-verify-change | ❌ Skipped | Not yet in apply phase; verify artifact created with instructions |
| openspec-apply-change | ❌ Skipped | Not yet in apply phase |

## §5 Surprises

- Backlog.md docs/decisions use YAML frontmatter but canonical docs use Markdown list metadata — format incompatibility was deeper than expected.
- The `generated: "manual"` marker approach allows manually maintained Backlog files to coexist with generated stubs, solving the orphan cleanup problem elegantly.
- pre-commit hook trigger ignores `M` (modified) and only acts on `A` (added), `D` (deleted), `R` (renamed) — this means content edits don't cause unnecessary stub regeneration.

## §6 Promote candidates

- **Stub orphan cleanup pattern**: The `generated-by` marker approach (only remove stubs that have the marker) is a clean pattern for any future index bridge tools.
- **pre-commit trigger filter**: Filtering `git diff --cached --name-status` for A/D/R only, ignoring M — this pattern could be extracted as a reusable hook utility.
- **Intent-driven schema workflow**: The sequence brainstorm → proposal → design → adr → specs → tasks → plan → verify → retrospective provides excellent structure for complex changes. The `applyRequires = ["plan"]` gate correctly prevents apply without a plan.