## Why

The `intent-driven` schema starts at `proposal` with only an informal config-level instruction to brainstorm, produces no artifacts after `apply`, and has no skip mechanism for non-mandatory steps. Merging with `superpowers-bridge` patterns closes these gaps — adding a formal brainstorming phase, post-apply verification, and retrospection — while keeping the schema self-sufficient (no hard Superpowers dependency).

## What Changes

- **BREAKING**: `proposal.requires` updated from `[]` to `[brainstorm]` — existing changes that have `proposal.md` but no `brainstorm.md` will remain unaffected; new changes start at `brainstorm`
- Add `brainstorm` artifact as new entry point; invokes `grill-me` skill (skippable: write `brainstorm.md` with `Skipped: <reason>` if scope is already clear)
- Add skip marker mechanism to `design` and `adr` artifacts — writing `Skipped: <reason>` as the file content satisfies the `requires` dependency and signals downstream artifacts to propagate the skip
- Add `plan` artifact for micro-step task decomposition (Superpowers-optional; skippable if no subagent support available)
- Add `verify` artifact (post-apply): simple mode (2 checks) or full mode (5 checks) determined at runtime via prompt PRECHECK
- Add `retrospective` artifact (post-apply, post-verify): skippable for trivial single-commit changes via one-liner marker
- Update `apply` phase to accept `plan` as primary input, with `tasks.md` fallback when `plan.md` is a skip marker
- Move `grill-me` from `config.yaml rules.proposal` → `rules.brainstorm`
- Move `openspec-verify-change` from `config.yaml rules.tasks` → `rules.verify`
- Remove brainstorming context instruction from `config.yaml` (now formalized as `brainstorm` artifact)
- Add templates: `brainstorm.md`, `plan.md`, `verify.md`, `retrospective.md`

## Capabilities

### New Capabilities

None — this change modifies the OpenSpec development workflow schema, not product behavior. No delta specs in `openspec/specs/` are required.

### Modified Capabilities

None — no existing spec-level behavior changes.

## Impact

- `openspec/schemas/intent-driven/schema.yaml` — add 4 artifacts (`brainstorm`, `plan`, `verify`, `retrospective`); update `proposal.requires`; add skip instructions to `design` and `adr`; update `apply.requires`
- `openspec/schemas/intent-driven/templates/` — add `brainstorm.md`, `plan.md`, `verify.md`, `retrospective.md`
- `openspec/config.yaml` — move `grill-me` rule, move `openspec-verify-change` rule, remove context brainstorming instruction
- No application code affected
- No API or external dependency changes
