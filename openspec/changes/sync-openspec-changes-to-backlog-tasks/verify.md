## Simple Mode (2 checks)

- [x] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [x] Validation: `openspec validate sync-openspec-changes-to-backlog-tasks --type change --json` returns valid

## Full Mode (5 checks)

- [ ] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [ ] Spec sync: all delta specs merged into openspec/specs/
- [ ] Design coherence: design.md decisions reflected in implementation
- [ ] Implementation signal: at least one git commit with code changes
- [ ] Validation: `openspec validate sync-openspec-changes-to-backlog-tasks --type change --json` returns valid

<!-- Delete the mode you're not using before saving. -->

## Notes

Implementation completed:
- `scripts/sync-openspec-change-to-backlog.ts` created with bidirectional sync logic
- `scripts/sync-backlog-task-to-openspec.ts` created for reverse sync
- `scripts/.git/sync-openspec-changes-to-backlog.sh` pre-commit hook created
- `.backlog/tasks/` populated with generated task files for all active OpenSpec changes
- Backlog tasks contain embedded snapshots of proposal, design, tasks, plan, verify, retrospective, and specs
- Section mapping aligned with valid Backlog.md sections: Description, Acceptance Criteria, Implementation Plan, Notes, Final Summary
- Validation script confirms all generated tasks have valid YAML frontmatter and required section markers