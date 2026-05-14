## Context

The `intent-driven` schema currently has 5 artifacts: `proposal → specs → design → adr → tasks`. It lacks a formal entry point for exploration, has no post-apply artifacts, and provides no mechanism for skipping non-mandatory artifacts. The `superpowers-bridge` schema solves these problems but requires the Superpowers plugin and subagent-capable platforms.

This design merges the two schemas into an upgraded `intent-driven` that adopts `superpowers-bridge`'s artifact patterns without imposing its hard dependencies.

Existing ADRs are all product-scoped (git, CI/CD, multi-tenancy, auth, payments). None constrain this schema design.

## Goals / Non-Goals

**Goals:**
- Formal brainstorming artifact as entry point
- Skip mechanism for non-mandatory artifacts that does not break the DAG
- Post-apply artifacts: `verify` (simple/full modes) and `retrospective`
- Optional `plan` artifact for TDD micro-steps when subagents are available
- Clean config.yaml — project-specific skill bindings only, no workflow logic

**Non-Goals:**
- Hard Superpowers dependency (remains optional throughout)
- Changes to OpenSpec CLI behavior or commands
- Modifications to existing in-flight changes

## Decisions

### D1 — Skip mechanism: file marker over DAG bypass

**Decision:** A skippable artifact is skipped by writing `Skipped: <reason>` as its file content. The file exists → `requires` dependency satisfied → downstream artifacts become READY.

**Alternative considered:** Remove the artifact from downstream `requires` (off critical path). Rejected because `/opsx:ff` would still create the artifact, and the skip intent is invisible in `openspec status`.

**Why marker:** OpenSpec's `requires` checks file existence, not content. A marker file satisfies the dependency while leaving a traceable record of why the step was skipped. Downstream artifacts read the marker and propagate the skip gracefully.

**Artifacts with skip support:** `brainstorm`, `design`, `adr`, `plan`, `retrospective`. `specs` uses a marker directory (`specs/skipped.md`). `proposal`, `tasks`, and `verify` (minimum simple mode) are never skipped.

---

### D2 — brainstorm as formal artifact, not config context

**Decision:** `brainstorm` becomes the first schema artifact (`requires: []`). `proposal.requires` changes from `[]` to `[brainstorm]`.

**Alternative considered:** Keep brainstorming as a `config.yaml context` instruction. Rejected because it is not tracked by `openspec status`, has no file output, and cannot be skipped via the marker mechanism.

**Why artifact:** Trackable, skippable (scope-clear changes write `Skipped: scope already locked`), and creates an explicit dependency contract. The `grill-me` skill binding moves from `config.yaml rules.proposal` → `rules.brainstorm`.

---

### D3 — verify as separate post-apply artifact with two modes

**Decision:** `verify` is a standalone artifact (`requires: [tasks]`) with a runtime PRECHECK that asks: *"Simple verify (2 checks) or full verify (5 checks)?"* before producing `verify.md`.

Simple mode: task completion check + `openspec validate --all --json`.
Full mode: adds spec sync state, design/specs coherence review, implementation signal (committed code).

**Alternative considered:** Embed verification logic inside `apply` instruction. Rejected because it cannot be re-run independently, does not appear in `openspec status`, and mixes apply and verify concerns.

**Timing mismatch (known):** `verify.requires: [tasks]` is a file-existence dependency. The artifact is actually produced after `apply` completes. This follows the same pattern as `superpowers-bridge` — the PRECHECK enforces timing by requiring git commit evidence before proceeding.

---

### D4 — plan artifact optional via skip marker

**Decision:** `plan` artifact generates `plan.md` (micro-step decomposition). `apply.requires` changes from `[tasks]` to `[plan]`. When `plan.md` contains `Skipped: <reason>`, the apply instruction falls back to `tasks.md`.

**Alternative considered:** `apply.requires: [tasks]` and plan off the critical path. Rejected because it makes plan invisible to `openspec status` and `/opsx:ff` would never create it.

**Why this way:** Keeps the DAG explicit. Users without subagent support write the skip marker; the apply instruction reads it and falls back gracefully.

---

### D5 — retrospective produced before PR, after verify

**Decision:** `retrospective` is produced after `verify.md` shows no blocking issues, before the PR is opened. It is skippable for trivial single-commit changes via a one-liner marker.

**Why before PR:** Captures hot context (active test results, fresh fix memory). Written after PR merge, it becomes a trailing commit and loses the hot context.

## Artifact DAG (resulting)

```
brainstorm ──→ proposal ──→ specs ──→ design ──→ adr ──→ tasks ──→ plan ──→ [apply] ──→ verify ──→ retrospective
               (skip ok)   (skip ok) (skip ok)  (skip ok)          (skip ok)            (simple/full)  (skip ok)
```

Not skippable: `proposal`, `tasks`, `verify` (minimum simple mode).

## Risks / Trade-offs

- [BREAKING: proposal.requires change] → Mitigation: only affects new changes started after the upgrade. In-flight changes that already have `proposal.md` are unaffected — OpenSpec marks proposal as done regardless.
- [Marker files add noise to change directory] → Mitigation: markers are one-liners; the `openspec status` output shows them as `[x]` (done), which is correct.
- [Timing mismatch for verify/retrospective] → Mitigation: PRECHECK commands enforce timing at runtime; the `requires` edges serve only as graph ordering for OpenSpec's engine.

## Migration Plan

1. Update `schema.yaml`: add 4 artifacts, update `proposal.requires`, update `apply.requires`, add skip instructions to `design` and `adr`.
2. Add 4 templates: `brainstorm.md`, `plan.md`, `verify.md`, `retrospective.md`.
3. Update `config.yaml`: move `grill-me` to `rules.brainstorm`, move `openspec-verify-change` to `rules.verify`, remove context brainstorming instruction.
4. No rollback needed — schema files are version-controlled.

## Open Questions

None. All decisions are resolved by the design above.
