## Context

Canonical project documentation lives under `docs/` and `docs/adrs/`. Backlog.md manages tasks and exposes `backlog doc list` and `backlog decision list` commands that only surface files inside `.backlog/docs/` and `.backlog/decisions/`. These two documentation worlds are currently disconnected: canonical docs are invisible to Backlog's discovery commands.

The solution is a deterministic index bridge. Generated stubs in `.backlog/docs/` and `.backlog/decisions/` expose canonical files to Backlog, while canonical files remain the single source of truth.

## Goals / Non-Goals

**Goals:**

- Expose canonical `docs/` and `docs/adrs/` files through Backlog's `doc` and `decision` commands.
- Keep canonical files as the only editable source.
- Make the bridge deterministic, idempotent, and safe in a dirty worktree.
- Never delete or overwrite manually maintained Backlog files.
- Run automatically on pre-commit without agent or LLM involvement.

**Non-Goals:**

- Replace or duplicate canonical documentation content.
- Make Backlog.md the authoritative source for any document.
- Run on every content edit — only structural changes (create/delete/rename) trigger sync.
- Use symlinks (rejected due to format incompatibility).

## Decisions

### 1. Trigger: pre-commit hook over opencode tool hook

A pre-commit hook inspects `git diff --cached --name-status` and runs the sync when staged changes show `A`, `D`, or `R` for `docs/**/*.md` or `docs/adrs/**/*.md`.

**Why over alternatives:**

- Covers all creation paths (manual, editor, opencode, openspec) since all eventually go through git staging.
- Opencode tool hooks only fire when the agent edits files, missing manual creation.
- LLM-at-commit-time was rejected for determinism and speed.
- The hook is fire-and-forget: it stages generated stubs automatically.

### 2. Stub format: Backlog frontmatter + canonical link

Each generated stub contains:

```yaml
---
id: decision-014
title: "Authentication Library"
date: "2026-05-14"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

## Context

Canonical ADR: [docs/adrs/014-authentication-library.md](../../docs/adrs/014-authentication-library.md)

## Decision

See canonical ADR.

## Consequences

See canonical ADR.
```

**Why:**

- Provides the exact frontmatter Backlog.md needs to list, view, and search the file.
- Inline link makes the canonical file directly accessible.
- `generated-by` marker allows safe cleanup: script only removes its own files.
- Backlog's `## Context / ## Decision / ## Consequences` sections are present (empty for stubs), keeping format compatibility.

### 3. Naming: derived from canonical path and ID

- `docs/adrs/014-authentication-library.md` → `.backlog/decisions/decision-014 - Authentication-Library.md`
- `docs/ARCHITECTURE.md` → `.backlog/docs/doc-architecture - Architecture.md`
- `docs/concerns/auth.md` → `.backlog/docs/concerns/doc-concerns-auth - Auth.md`

ID is derived from the numeric ADR prefix (e.g., `014`). Document IDs use a path-fingerprint: `doc-` + first path segment + `-` + sanitized filename.

**Why:**

- Traceable: you can map stub → canonical file at a glance.
- No独立的 ID sequence needed; the source ID is preserved.
- Sanitization converts spaces and special characters to dashes, matching Backlog's filename conventions.

### 4. Idempotency and orphan cleanup

The script:

1. Scans all canonical `docs/` (non-adrs) and `docs/adrs/` files.
2. Generates stubs for all found files.
3. Removes stubs whose canonical source no longer exists, but only if the stub carries the `generated-by` marker.
4. Does not touch files without the marker.

Running the script multiple times produces the same result (idempotent).

### 5. Hook installation mechanism

Use a simple POSIX shell script installer that writes directly to `.git/hooks/pre-commit`. This avoids adding a Node.js dependency just for hook installation. The installer is idempotent: it checks for an existing Backlog sync block before appending.

If a hook manager (Lefthook, Husky) is already in use in the project, the installer should detect and integrate with it instead of writing raw files.

### 6. Initial batch sync

The sync script runs on first invocation (pre-commit trigger or manual) with a `--full` flag that processes all canonical files, not just staged changes. This populates the stub directories on adoption without needing a separate migration step.

## Risks / Trade-offs

- **[Risk] Canonical file deleted but stub still exists if sync never runs again**: Mitigated by orphan cleanup on every sync run. The stub is removed the next time the hook fires.
- **[Risk] Hook slows down commit when many docs change**: The script is O(n) on doc count (currently ~20 files). It is fast. If performance becomes an issue, add a file-count threshold before running.
- **[Risk] Generated stubs drift from canonical after rename**: On rename, the old stub is removed (orphan cleanup) and a new stub is created. The canonical file is the source of truth, so this is correct behaviour.
- **[Trade-off] pre-commit only syncs when files are staged**: Uncommitted canonical files are not visible to Backlog until committed. This is acceptable — Backlog index reflects the versioned state, not drafts.

## Migration Plan

**Step 1 — Install hook**

```bash
./scripts/install-backlog-sync-hook.sh
```

The installer writes the pre-commit hook and marks it executable.

**Step 2 — Run initial sync**

```bash
./scripts/backlog-sync-doc-index.ts --full
```

This generates stubs for all existing canonical docs and ADRs. The hook will pick up any staged changes after this point.

**Step 3 — Commit generated stubs**

```bash
git add .backlog/docs .backlog/decisions
git commit -m "chore: add Backlog doc index bridge stubs"
```

**Step 4 — Verify**

```bash
backlog doc list
backlog decision list
```

Both should show canonical docs and ADRs through the generated stubs.

**Rollback**: Remove the pre-commit hook with `./scripts/install-backlog-sync-hook.sh --uninstall` and delete all generated stubs (files with `generated-by: adponte-backlog-doc-index` marker). No canonical data is affected.

## Open Questions

- **Which hook mechanism is already in use?** Check for existing `lefthook.yml`, `.husky/`, or similar before installing raw hooks. If none exists, use the plain `.git/hooks/pre-commit` installer.
- **Should `docs/adrs/` files be excluded from `.backlog/docs` generation?** Yes — by design, ADRs live under `.backlog/decisions/`. The script explicitly excludes `docs/adrs/` from the docs scan.
- **Should the initial `--full` sync be run manually or automated?** Manual first-run is safer so the team can review generated stubs before committing. After that, the pre-commit hook handles ongoing sync automatically.