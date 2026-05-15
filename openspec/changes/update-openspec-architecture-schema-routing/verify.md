## Simple Mode (2 checks)

- [ ] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [ ] Validation: `openspec validate update-openspec-architecture-schema-routing --type change --json` returns valid

## Full Mode (5 checks)

- [ ] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [ ] Spec sync: all delta specs merged into openspec/specs/
- [ ] Design coherence: design.md decisions reflected in implementation
- [ ] Implementation signal: at least one git commit with code changes
- [ ] Validation: `openspec validate update-openspec-architecture-schema-routing --type change --json` returns valid

<!-- Using Simple Mode — small infrastructure change, no production code -->

## Notes

- Implementation consists of YAML/TEMPLATE file edits and documentation updates only — no production code, no new packages, no subagent work required
- After apply phase completes, run simple mode checks to verify schema validation passes and all tasks are checked off
- `openspec schema validate architecture-driven` and `openspec schema validate intent-driven` are the canonical gate