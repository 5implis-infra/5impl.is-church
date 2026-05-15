---
id: task-003
title: sync-backlog-doc-index
status: To Do
labels: ["openspec", "sync"]
references: ["openspec/changes/sync-backlog-doc-index/proposal.md", "openspec/changes/sync-backlog-doc-index/design.md", "openspec/changes/sync-backlog-doc-index/tasks.md", "openspec/changes/sync-backlog-doc-index/plan.md"]
documentation: ["openspec/changes/sync-backlog-doc-index/.openspec.yaml"]
generated-by: openspec-backlog-task-sync
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
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
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
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
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
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
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Agreed Scope

This change will add a deterministic Backlog.md index bridge for the project's canonical documentation.

In scope:

- Generate Backlog-compatible document stubs under `.backlog/docs` for canonical non-ADR Markdown files under `docs/`.
- Generate Backlog-compatible decision stubs under `.backlog/decisions` for canonical ADR files under `docs/adrs/`.
- Keep `docs/` and `docs/adrs/` as the only authoritative sources of documentation and architectural decisions.
- Use generated stubs that contain only Backlog frontmatter, a generated marker, and an inline link to the canonical file.
- Use derived names and IDs rather than independent Backlog sequences.
- Run synchronization from a `pre-commit` hook only when staged files show created, deleted, or renamed canonical docs/ADRs.
- Ignore ordinary content modifications to canonical files because generated stubs link to canonical content and do not mirror it.
- Stage generated `.backlog/docs` and `.backlog/decisions` changes automatically from the hook when synchronization changes files.

Out of scope:

- Symlinking `.backlog/docs` to `docs/` or `.backlog/decisions` to `docs/adrs/`.
- Running a hook on every file edit.
- Using an LLM at hook time.
- Duplicating canonical documentation content into Backlog stubs.
- Making Backlog.md the source of truth for project docs or ADRs.

## Key Constraints

- The project documentation hierarchy in `docs/adrs/000-documentation-standards.md` remains authoritative.
- Backlog.md expects documents to have YAML frontmatter with fields such as `id`, `title`, `type`, and `created_date`.
- Backlog.md expects decisions to live as `decision-*.md` files with YAML frontmatter including `id`, `title`, `date`, and `status`, plus `## Context`, `## Decision`, and `## Consequences` sections.
- Generated files must be identifiable by a stable marker so cleanup never deletes manually maintained Backlog files.
- The hook must be deterministic, fast, and local; it should not depend on network access or model calls.
- The synchronization should be safe in a dirty worktree and should only modify generated index files.

## Alternatives Considered

- Direct symlinks from `.backlog/docs` to `docs/` and `.backlog/decisions` to `docs/adrs/` were rejected because current canonical files do not match Backlog.md naming and frontmatter conventions, and Backlog-generated files would pollute canonical documentation directories.
- An opencode tool hook was considered, but rejected as the primary mechanism because it would not cover manual edits or file creation outside opencode.
- A manual-only command or skill instruction was considered, but rejected as insufficient because it depends on human or agent discipline.
- A hook that invokes an LLM or skill was rejected because generation should be deterministic and safe during commit.

## Chosen Direction

Implement a script-driven index bridge triggered by `pre-commit`.

The pre-commit hook will inspect staged file changes with `git diff --cached --name-status`. If it detects added, deleted, or renamed Markdown files under `docs/` or `docs/adrs/`, it will run a deterministic sync script. The script will scan canonical documentation, generate or remove Backlog-compatible stubs, and update only files marked as generated by the index bridge. If generated files change, the hook will stage `.backlog/docs` and `.backlog/decisions` before allowing the commit to continue.

Derived naming rules will preserve traceability:

- `docs/adrs/014-authentication-library.md` maps to `.backlog/decisions/decision-014 - Authentication-Library.md`.
- `docs/ARCHITECTURE.md` maps to `.backlog/docs/doc-architecture - Architecture.md`.
- `docs/concerns/auth.md` maps to `.backlog/docs/concerns/doc-concerns-auth - Auth.md`.

The generated stubs exist only to make canonical docs and ADRs searchable/listable through Backlog.md while keeping canonical ownership unchanged.

## Open Questions

- Which pre-commit hook mechanism should be used in this repository if none already exists: a plain `.git/hooks/pre-commit` installer, Husky, Lefthook, or another project-standard tool?
- Should generated document IDs use full path-derived identifiers for all docs, or should top-level canonical docs use shorter fixed IDs such as `doc-architecture`?
- Should the initial batch sync be performed by the same script during implementation, or left for the first pre-commit after installation?


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

## ADDED Requirements

### Requirement: Backlog doc index sync script scans canonical docs and generates Backlog-compatible stubs

The sync script SHALL scan all Markdown files under `docs/` (excluding `docs/adrs/`) and generate Backlog-compatible document stubs under `.backlog/docs/`. Each stub SHALL contain YAML frontmatter with fields `id`, `title`, `type`, and `created_date`, followed by an inline link to the canonical source file. The script SHALL derive a stable `id` from the canonical filename using kebab-case normalization (e.g., `ARCHITECTURE.md` → `doc-architecture`).

Feature: Backlog Doc Index Sync

  Rule: Canonical docs are scanned without modification

    Scenario: Script scans docs directory and generates stubs for all markdown files
      - **GIVEN** a canonical documentation file `docs/ARCHITECTURE.md` exists with title "Architecture"
      - **WHEN** the sync script runs
      - **THEN** a stub file `.backlog/docs/doc-architecture.md` is created with valid Backlog YAML frontmatter

    Scenario: Script derives id from filename using kebab-case
      - **GIVEN** a canonical documentation file `docs/API_GUIDE.md` exists
      - **WHEN** the sync script runs
      - **THEN** the generated stub uses id `doc-api-guide` (lowercase, underscores converted)

    Scenario: Stub contains inline link to canonical source
      - **GIVEN** a canonical documentation file `docs/ARCHITECTURE.md` exists
      - **WHEN** the sync script runs
      - **THEN** the generated stub body contains a link to `../../docs/ARCHITECTURE.md`

    Scenario: Generated stubs are marked with stable generation marker
      - **GIVEN** a canonical documentation file `docs/ARCHITECTURE.md` exists
      - **WHEN** the sync script runs
      - **THEN** the generated stub includes a `generated: "backlog-sync"` marker in frontmatter

  Rule: ADR files are excluded from docs stubs

    Scenario: Files under docs/adrs are not processed for docs stubs
      - **GIVEN** a canonical ADR file `docs/adrs/014-payment-gateway.md` exists
      - **WHEN** the sync script runs
      - **THEN** no stub is created under `.backlog/docs/` for this file

### Requirement: Backlog decision index sync script scans canonical ADRs and generates decision stubs

The sync script SHALL scan all Markdown files under `docs/adrs/` and generate Backlog-compatible decision stubs under `.backlog/decisions/`. Each stub SHALL contain YAML frontmatter with fields `id`, `title`, `date`, and `status`, followed by the original `## Context`, `## Decision`, and `## Consequences` sections copied from the canonical ADR. The script SHALL derive a stable `id` from the ADR filename (e.g., `014-payment-gateway.md` → `decision-014`).

Feature: Backlog Decision Index Sync

  Rule: Canonical ADRs are scanned for decision stub generation

    Scenario: Script generates decision stub from ADR file
      - **GIVEN** a canonical ADR file `docs/adrs/014-payment-gateway.md` exists with title "Payment Gateway Selection"
      - **WHEN** the sync script runs
      - **THEN** a stub file `.backlog/decisions/decision-014.md` is created with valid Backlog YAML frontmatter

    Scenario: Decision stub preserves Context, Decision, and Consequences sections
      - **GIVEN** a canonical ADR file `docs/adrs/014-payment-gateway.md` with `## Context`, `## Decision`, and `## Consequences` sections
      - **WHEN** the sync script runs
      - **THEN** the generated stub contains verbatim copies of all three sections

    Scenario: Decision stub date and status are extracted from ADR frontmatter
      - **GIVEN** a canonical ADR file `docs/adrs/014-payment-gateway.md` with frontmatter `date: 2024-01-15` and `status: Accepted`
      - **WHEN** the sync script runs
      - **THEN** the generated stub frontmatter contains the same `date` and `status` values

  Rule: Non-ADR markdown files are not processed for decisions stubs

    Scenario: Regular docs files do not appear in decisions stubs
      - **GIVEN** a canonical documentation file `docs/ARCHITECTURE.md` exists
      - **WHEN** the sync script runs
      - **THEN** no stub is created under `.backlog/decisions/` for this file

### Requirement: Sync script removes stubs whose canonical source no longer exists

The sync script SHALL detect stub files whose canonical source has been deleted or renamed, and SHALL remove those stubs in the same sync run.

Feature: Stub Lifecycle Management

  Rule: Orphaned stubs are cleaned up

    Scenario: Stub is removed when canonical file is deleted
      - **GIVEN** a stub `.backlog/docs/doc-architecture.md` exists and its canonical source `docs/ARCHITECTURE.md` has been deleted
      - **WHEN** the sync script runs
      - **THEN** the orphaned stub file is removed from `.backlog/docs/`

    Scenario: Stub is removed when canonical ADR is deleted
      - **GIVEN** a stub `.backlog/decisions/decision-014.md` exists and its canonical source `docs/adrs/014-payment-gateway.md` has been deleted
      - **WHEN** the sync script runs
      - **THEN** the orphaned stub file is removed from `.backlog/decisions/`

    Scenario: Stub is removed when canonical file is renamed
      - **GIVEN** a stub `.backlog/docs/doc-architecture.md` exists and its canonical source `docs/ARCHITECTURE.md` has been renamed to `docs/ARCH.md`
      - **WHEN** the sync script runs
      - **THEN** the old stub `doc-architecture` is removed and a new stub `doc-arch` is created

  Rule: Manually maintained Backlog files are never removed

    Scenario: Manually created doc stub without canonical source is preserved
      - **GIVEN** a manually created file `.backlog/docs/manual-note.md` with `generated: "manual"` marker
      - **WHEN** the sync script runs
      - **THEN** the manually created file is preserved and not removed

    Scenario: Manually created decision stub without canonical source is preserved
      - **GIVEN** a manually created file `.backlog/decisions/manual-decision.md` with `generated: "manual"` marker
      - **WHEN** the sync script runs
      - **THEN** the manually created file is preserved and not removed

### Requirement: Sync script is deterministic and idempotent

Running the sync script multiple times with the same canonical files SHALL produce identical output without errors or side effects.

Feature: Idempotent Sync

  Scenario: Second run produces identical stubs without duplicates
    - **GIVEN** canonical documentation files exist under `docs/` and `docs/adrs/`
    - **WHEN** the sync script runs a second time
    - **THEN** all generated stubs are identical to the first run without modifications

  Scenario: Running sync when nothing has changed produces no errors
    - **GIVEN** canonical documentation files exist and stubs are already in sync
    - **WHEN** the sync script runs
    - **THEN** the script exits with code 0 and produces no error output

### Requirement: Sync script is triggered by pre-commit hook on relevant file changes

A pre-commit hook SHALL run the sync script when staged changes include created, deleted, or renamed Markdown files under `docs/` or `docs/adrs/`. The hook SHALL stage any newly generated stub files so they are included in the same commit as the canonical file that triggered them.

Feature: Pre-Commit Hook Integration

  Rule: Hook triggers on new markdown files in docs directory

    Scenario: Hook runs sync when a new markdown file is staged in docs/
      - **GIVEN** a new canonical file `docs/NEW_GUIDE.md` has been created and staged
      - **WHEN** the pre-commit hook fires
      - **THEN** the sync script generates `.backlog/docs/doc-new-guide.md`
      - **AND** the hook stages the generated stub file

  Rule: Hook triggers on deleted markdown files in docs directory

    Scenario: Hook runs sync when a markdown file is deleted from docs/
      - **GIVEN** a canonical file `docs/OLD_GUIDE.md` has been deleted and staged
      - **WHEN** the pre-commit hook fires
      - **THEN** the sync script removes `.backlog/docs/doc-old-guide.md`
      - **AND** the hook stages the stub removal

  Rule: Hook triggers on renamed markdown files in docs directory

    Scenario: Hook runs sync when a markdown file is renamed in docs/
      - **GIVEN** a canonical file `docs/OLD.md` has been renamed to `docs/NEW.md` and both changes are staged
      - **WHEN** the pre-commit hook fires
      - **THEN** the sync script removes the old stub and creates a new stub for the renamed file

  Rule: Hook does not trigger on modified-only files

    Scenario: Editing a doc file without adding/removing/renaming does not trigger sync
      - **GIVEN** a canonical file `docs/ARCHITECTURE.md` has been modified (content change only, no add/delete/rename) and staged
      - **WHEN** the pre-commit hook fires
      - **THEN** the sync script does NOT run

  Rule: Stub files are staged automatically by the hook

    Scenario: Newly generated stubs are added to the same commit
      - **GIVEN** a new canonical file `docs/NEW_GUIDE.md` has been staged
      - **WHEN** the pre-commit hook fires and sync completes
      - **THEN** the generated stub `.backlog/docs/doc-new-guide.md` is staged automatically

### Requirement: .backlog directories are auto-created and gitignored

The `.backlog/docs/` and `.backlog/decisions/` directories SHALL be created automatically by the sync script if they do not exist, and SHALL be added to `.gitignore` so generated stubs are never committed to the repository.

Feature: Backlog Directory Management

  Scenario: .backlog directories are created on first sync
    - **GIVEN** the `.backlog/` directory does not exist
    - **WHEN** the sync script runs
    - **THEN** both `.backlog/docs/` and `.backlog/decisions/` directories are created

  Scenario: .backlog directories and generated files are gitignored
    - **GIVEN** a `.gitignore` file exists in the project root
    - **WHEN** the sync script is installed
    - **THEN** entries for `.backlog/docs/` and `.backlog/decisions/` are added to `.gitignore`
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
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
<!-- SECTION:FINAL_SUMMARY:END -->
