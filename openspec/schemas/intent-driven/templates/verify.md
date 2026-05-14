## Simple Mode (2 checks)

- [ ] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [ ] Validation: `openspec validate <change> --type change --json` returns valid

## Full Mode (5 checks)

- [ ] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [ ] Spec sync: all delta specs merged into openspec/specs/
- [ ] Design coherence: design.md decisions reflected in implementation
- [ ] Implementation signal: at least one git commit with code changes
- [ ] Validation: `openspec validate <change> --type change --json` returns valid

<!-- Delete the mode you're not using before saving. -->

## Notes

<!-- Implementation notes, issues encountered, or follow-up items. -->