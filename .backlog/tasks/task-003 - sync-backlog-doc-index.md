---
id: task-003
title: sync-backlog-doc-index
status: To Do
labels: ["openspec", "sync"]
references: []
documentation: []
generated-by: openspec-backlog-task-sync
---
## OpenSpec Proposal
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- OPENSPEC:PROPOSAL:BEGIN -->
## Why

Backlog.md is used as the project task manager and Kanban board. Its `docs` and `decisions` features allow AI agents to discover and navigate project documentation via `backlog doc list`, `backlog decision list`, and `backlog search`. Currently, canonical project documentation lives under `docs/` and `docs/adrs/` but is invisible to Backlog's search and list commands because the files do not follow Backlog's naming conventions and frontmatter format. This creates a gap where agents working through Backlog cannot see existing architecture decisions and documentation unless they are explicitly pointed to the canonical paths.

## What Changes

- Add a deterministic sync script that generates Backlog-compatible document stubs (`.backlog/docs/`) from canonical documentation files under `docs/` (excluding `docs/adrs/`).
- Add a deterministic sync script that generates Backlog-compatible decision stubs (`.backlog/decisions/`) from canonical ADR files under `docs/adrs/`.
- Install a `pre-commit` hook that runs the sync script when staged changes include new, deleted, or renamed Markdown files under `docs/` or `docs/adrs/`.
- Stage generated stub files automatically from the hook so they are included in the same commit as the canonical file that triggered them.
- Mark all generated files with a stable tag so the sync script never removes manually maintained Backlog files.

## Capabilities

### New Capabilities

- `backlog-doc-index-sync`: A script that scans canonical documentation (`docs/` and `docs/adrs/`), generates Backlog-compatible stubs under `.backlog/docs/` and `.backlog/decisions/`, and removes stubs whose canonical source no longer exists. The script is deterministic, fast, local, and idempotent. It is triggered by a `pre-commit` hook when the staged changes show created, deleted, or renamed Markdown files under `docs/` or `docs/adrs/`.

### Modified Capabilities

- None. This change does not alter the behaviour of any existing capability. It only adds a new index bridge layer on top of existing documentation files.

## Impact

- New files created: `scripts/backlog-sync-doc-index.ts` (or `.js`), hook installer script.
- Modified files: `.git/hooks/pre-commit` (or equivalent hook configuration file if using a hook manager).
- Generated directories (auto-created, gitignored): `.backlog/docs/`, `.backlog/decisions/`.
- No changes to existing documentation files in `docs/` or `docs/adrs/`.
- No changes to Backlog.md configuration or task structure.
- No breaking changes to existing workflows.
<!-- OPENSPEC:PROPOSAL:END -->

## OpenSpec Design
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- OPENSPEC:DESIGN:BEGIN -->
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
<!-- OPENSPEC:DESIGN:END -->

## OpenSpec Tasks
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- OPENSPEC:TASKS:BEGIN -->
## 1. Script Implementation

- [x] 1.1 Create `scripts/backlog-sync-doc-index.ts` with TypeScript and Zod for argument parsing
- [x] 1.2 Implement `scanCanonicalDocs()`: walk `docs/` excluding `docs/adrs/`, extract frontmatter title
- [x] 1.3 Implement `scanCanonicalADRs()`: walk `docs/adrs/`, extract frontmatter date/status, parse ADR sections
- [x] 1.4 Implement `generateDocStub(file)`: produce Backlog doc stub with YAML frontmatter and canonical link
- [x] 1.5 Implement `generateDecisionStub(file)`: produce Backlog decision stub preserving Context/Decision/Consequences
- [x] 1.6 Implement `cleanupOrphans()`: remove stubs without canonical source, skip files without `generated-by` marker
- [x] 1.7 Implement `--full` flag: process all canonical files regardless of staged changes
- [x] 1.8 Add `generated-by: adponte-backlog-doc-index` marker to all generated stubs

## 2. Pre-Commit Hook

- [x] 2.1 Detect existing hook manager (lefthook, husky) or install raw `.git/hooks/pre-commit`
- [x] 2.2 Write pre-commit hook that inspects `git diff --cached --name-status` for `A`, `D`, `R` on `docs/**/*.md` and `docs/adrs/**/*.md`
- [x] 2.3 Hook runs sync script and stages generated stub files
- [x] 2.4 Hook skips sync on `M` (modified-only) changes
- [x] 2.5 Create idempotent hook installer `scripts/install-backlog-sync-hook.sh`

## 3. Gitignore and Directory Setup

- [x] 3.1 Add `.backlog/docs/` and `.backlog/decisions/` to `.gitignore`
- [x] 3.2 Script auto-creates `.backlog/docs/` and `.backlog/decisions/` on first run

## 4. Initial Sync and Verification

- [x] 4.1 Run initial batch sync with `--full` flag
- [x] 4.2 Commit generated stubs: `git add .backlog/docs .backlog/decisions`
- [x] 4.3 Verify: run `backlog doc list` and `backlog decision list` to confirm canonical docs appear
- [x] 4.4 Verify stub-to-canonical links are correct by clicking through in Backlog
- [x] 4.5 Test delete scenario: delete a canonical doc, run sync, confirm stub is removed
- [x] 4.6 Test rename scenario: rename a canonical doc, run sync, confirm old stub removed and new stub created
- [x] 4.7 Test modified-only scenario: edit a canonical doc (no add/delete/rename), confirm hook does not trigger sync

## 5. Validation

- [x] 5.1 Run `openspec validate sync-backlog-doc-index --type change --strict` to confirm all specs are satisfied
- [x] 5.2 Validate generated stubs conform to Backlog.md frontmatter schema
<!-- OPENSPEC:TASKS:END -->

## OpenSpec Plan
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- OPENSPEC:PLAN:BEGIN -->
## Task Groups

## 1. Script Implementation

### Micro-steps

- **Micro-steps**:
  1.1 Create `scripts/backlog-sync-doc-index.ts` with shebang and module imports
  1.2 Add Zod schema for CLI args (`--full` flag) and parse arguments with `minimist`
  1.3 Implement `getCanonicalDocFiles()`: glob `docs/**/*.md` excluding `docs/adrs/`
  1.4 Implement `getCanonicalADRFiles()`: glob `docs/adrs/**/*.md`
  1.5 Implement `parseFrontmatter(content)`: extract YAML frontmatter from markdown
  1.6 Implement `sanitizeId(name)`: convert filename to kebab-case Backlog id (e.g., `ARCHITECTURE.md` → `doc-architecture`)
  1.7 Implement `generateDocStub(file, frontmatter)`: build Backlog doc stub with id, title, type, created_date, canonical link, and `generated-by` marker
  1.8 Implement `generateDecisionStub(file, frontmatter)`: build Backlog decision stub preserving `## Context`, `## Decision`, `## Consequences` sections
  1.9 Implement `cleanupOrphans(stubDir, generatedIds)`: remove stubs not in generatedIds set and not marked `generated: "manual"`
  1.10 Wire `--full` flag: when set, process all canonical files; when unset, only process files from staged git diff

- **File paths**: `scripts/backlog-sync-doc-index.ts`, `package.json` (add `minimist` if not present)

- **Test commands**:
  - `tsx scripts/backlog-sync-doc-index.ts --full` — dry run without writing files
  - `tsx scripts/backlog-sync-doc-index.ts --full` — run and verify `.backlog/docs/` and `.backlog/decisions/` populated
  - `git ls-files .backlog/` — confirm stubs are generated

- **Commit point**: Commit after step 1.10 (full script wired and tested locally)

---

## 2. Pre-Commit Hook

### Micro-steps

- **Micro-steps**:
  2.1 Check for existing hook manager: look for `lefthook.yml`, `.husky/`, `package.json` husky config
  2.2 If no manager found, create `scripts/install-backlog-sync-hook.sh` POSIX shell script
  2.3 Installer writes pre-commit hook that: runs `git diff --cached --name-status`, checks for `A`/`D`/`R` on `docs/**/*.md` or `docs/adrs/**/*.md`, calls `tsx scripts/backlog-sync-doc-index.ts`, stages generated stubs with `git add .backlog/docs/ .backlog/decisions/`
  2.4 Installer is idempotent: checks for existing Backlog sync block before appending
  2.5 If hook manager detected, integrate (e.g., add to `lefthook.yml` `post-commit` or husky `post-commit` script)
  2.6 Run installer and verify `.git/hooks/pre-commit` is executable

- **File paths**: `scripts/install-backlog-sync-hook.sh`, `.git/hooks/pre-commit`

- **Test commands**:
  - `cat .git/hooks/pre-commit` — verify hook content
  - `ls -la .git/hooks/pre-commit` — verify executable bit
  - `git commit --allow-empty -m "test hook"` — trigger hook and verify it runs without error

- **Commit point**: Commit after step 2.6 (hook installed and verified)

---

## 3. Gitignore and Directory Setup

### Micro-steps

- **Micro-steps**:
  3.1 Read existing `.gitignore` and check if `.backlog/` entries already exist
  3.2 Add `.backlog/docs/` and `.backlog/decisions/` entries to `.gitignore`
  3.3 Script auto-creates `.backlog/docs/` and `.backlog/decisions/` on first run (add to script initialization)

- **File paths**: `.gitignore`

- **Test commands**:
  - `cat .gitignore | grep backlog` — verify gitignore entries
  - `tsx scripts/backlog-sync-doc-index.ts --full` — verify directories are created

- **Commit point**: Commit in same commit as hook (step 2.6) if gitignore updated at same time

---

## 4. Initial Sync and Verification

### Micro-steps

- **Micro-steps**:
  4.1 Run `tsx scripts/backlog-sync-doc-index.ts --full` to populate all stubs
  4.2 Review generated stubs in `.backlog/docs/` and `.backlog/decisions/` for correctness
  4.3 `git add .backlog/docs/ .backlog/decisions/` and commit with message "chore: add Backlog doc index bridge stubs"
  4.4 If `backlog` CLI available, run `backlog doc list` and `backlog decision list` to verify canonical docs appear
  4.5 Manually verify stub-to-canonical links by opening canonical files from stubs
  4.6 Test delete: `git rm docs/OLD_GUIDE.md`, commit, run sync, confirm stub removed
  4.7 Test rename: `git mv docs/OLD.md docs/NEW.md`, commit, run sync, confirm old stub removed, new stub created
  4.8 Test modified-only: edit `docs/ARCHITECTURE.md` content (no add/delete/rename), verify hook does NOT trigger sync

- **File paths**: `.backlog/docs/`, `.backlog/decisions/`

- **Test commands**:
  - `backlog doc list` — list docs in Backlog
  - `backlog decision list` — list decisions in Backlog
  - `git ls-files .backlog/` — list tracked stubs

- **Commit point**: Commit after step 4.3 (initial stubs committed)

---

## 5. Validation

### Micro-steps

- **Micro-steps**:
  5.1 Run `openspec validate sync-backlog-doc-index --type change --strict` to verify all specs satisfied
  5.2 Sample generated stubs to verify Backlog YAML frontmatter format (id, title, type, created_date for docs; id, title, date, status for decisions)
  5.3 Confirm all stubs have `generated-by: adponte-backlog-doc-index` marker

- **File paths**: No new files; validates existing artifacts

- **Test commands**:
  - `openspec validate sync-backlog-doc-index --type change --strict`
  - `grep -l "generated-by: adponte-backlog-doc-index" .backlog/docs/*.md .backlog/decisions/*.md | wc -l` — count generated stubs

- **Commit point**: No additional commit needed for this group
<!-- OPENSPEC:PLAN:END -->

## OpenSpec Verify
*This section is generated from OpenSpec. Edit the OpenSpec artifact, not this snapshot.*
<!-- OPENSPEC:VERIFY:BEGIN -->
## Simple Mode (2 checks)

- [ ] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [ ] Validation: `openspec validate sync-backlog-doc-index --type change --json` returns valid

## Full Mode (5 checks)

- [ ] Task completion: all `- [ ]` → `- [x]` in tasks.md
- [ ] Spec sync: all delta specs merged into openspec/specs/
- [ ] Design coherence: design.md decisions reflected in implementation
- [ ] Implementation signal: at least one git commit with code changes
- [ ] Validation: `openspec validate sync-backlog-doc-index --type change --json` returns valid

<!-- Delete the mode you're not using before saving. -->

## Notes

### Verification Checklist

**Pre-check before running verify:**
- git commits > 0 (at least one commit exists for this change)
- tasks.md shows all items checked off

**If precheck fails:** Report blocking issues and stop.

**Simple verify steps:**
1. Confirm all tasks in tasks.md are checked off (`- [ ]` → `- [x]`)
2. Run `openspec validate sync-backlog-doc-index --type change --json`
3. Confirm validation returns valid

**Full verify steps (in addition to simple):**
4. Merge delta specs into `openspec/specs/backlog-doc-index-sync/spec.md`
5. Review implementation matches design.md decisions:
   - Pre-commit hook uses `git diff --cached --name-status` for A/D/R
   - Stub format has Backlog frontmatter + `generated-by` marker + canonical link
   - Naming uses kebab-case derived ids
   - Orphan cleanup skips files without `generated-by` marker
   - Hook installer detects existing hook managers
   - Initial batch sync uses `--full` flag
6. Confirm at least one git commit with code changes (`scripts/backlog-sync-doc-index.ts`, hook files)
7. Run `openspec validate sync-backlog-doc-index --type change --json` to confirm

**Re-runable:** This verify.md can be regenerated by re-running precheck and re-producing the artifact.
<!-- OPENSPEC:VERIFY:END -->
