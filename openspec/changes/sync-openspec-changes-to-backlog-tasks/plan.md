## Task Groups

## Micro-steps

### 1. Script Infrastructure

- **Micro-steps**:
  1. Create empty `scripts/sync-openspec-change-to-backlog.ts` file
  2. Create empty `scripts/sync-backlog-task-to-openspec.ts` file
  3. Create `scripts/.git/sync-openspec-changes-to-backlog.sh` with pre-commit hook runner logic
  4. Read `.git/hooks/pre-commit` and add new hook call
- **File paths**: `scripts/sync-openspec-change-to-backlog.ts`, `scripts/sync-backlog-task-to-openspec.ts`, `scripts/.git/sync-openspec-changes-to-backlog.sh`, `.git/hooks/pre-commit`
- **Test commands**: `git diff --cached .git/hooks/pre-commit` to verify hook was added
- **Commit point**: After step 4 (hook call added)

---

### 2. Backlog Task Generation

- **Micro-steps**:
  1. Implement `buildBacklogFrontmatter(changeDir)` — returns frontmatter object with id, title, status, labels, references, documentation, priority
  2. Implement `embedSnapshot(content, sectionName)` — wraps content with `<!-- OPENSPEC:SECTIONNAME:BEGIN -->` and regeneration header
  3. Implement `generateTaskBody(changeDir)` — reads all OpenSpec artifacts, calls embedSnapshot for each, returns markdown body string
  4. Implement `writeBacklogTask(changeDir, outputPath)` — combines frontmatter + body, writes to `.backlog/tasks/`
  5. Implement `generateTaskId()` — creates incremental task ID (e.g., `task-001`) based on existing `.backlog/tasks/` files
- **File paths**: `scripts/sync-openspec-change-to-backlog.ts`
- **Test commands**: `tsx scripts/sync-openspec-change-to-backlog.ts --change sync-openspec-changes-to-backlog-tasks --dry-run` and inspect output
- **Commit point**: After step 5

---

### 3. Status Mapping

- **Micro-steps**:
  1. Implement `parseTaskChecklist(tasksMdPath)` — returns count of total and checked items
  2. Implement `deriveBacklogStatus(checklistProgress)` — returns `To Do`, `In Progress`, or `Done`
  3. Integrate status derivation into task generation flow (call after reading tasks.md)
  4. Add `isArchived` check from OpenSpec `.openspec.yaml` status field
- **File paths**: `scripts/sync-openspec-change-to-backlog.ts`
- **Test commands**: Unit test `parseTaskChecklist` with sample tasks.md content
- **Commit point**: After step 4

---

### 4. Archive Projection

- **Micro-steps**:
  1. Implement `isChangeArchived(changeDir)` — checks `.openspec.yaml` or change directory location
  2. Implement `generateArchiveTask(changeDir)` — creates `.backlog/archive/` version with verify/retrospective snapshots
  3. Implement `removeActiveTaskIfGenerated(taskFilePath)` — removes active task only if `generated-by` marker present and no manual content outside snapshot sections
  4. Add archive flow to main sync: archive detected → generate archive task → remove active task
- **File paths**: `scripts/sync-openspec-change-to-backlog.ts`
- **Test commands**: Create a test OpenSpec archive and run sync, verify `.backlog/archive/` task created and active task removed
- **Commit point**: After step 4

---

### 5. Reverse Sync (Controlled Fields)

- **Micro-steps**:
  1. Implement `parseBacklogTask(taskFilePath)` — reads frontmatter and body, returns structured object
  2. Implement `extractStatus(backlogTask)` — returns status from frontmatter
  3. Implement `extractChecklistProgress(backlogTask)` — returns AC/DoD checklist state
  4. Implement `extractNotes(backlogTask)` — returns Implementation Notes content
  5. Implement `updateOpenspecMetadata(changeDir, status, checklist, notes)` — writes to `.openspec.yaml` and tasks.md
  6. Guard: verify task has `generated-by` marker before writing back
- **File paths**: `scripts/sync-backlog-task-to-openspec.ts`
- **Test commands**: Modify a Backlog task manually, run reverse sync, verify `.openspec.yaml` updated
- **Commit point**: After step 6

---

### 6. Validation

- **Micro-steps**:
  1. Implement `validateTaskMarkdown(filePath)` — parses YAML frontmatter, checks body markers, returns `{valid: boolean, errors: string[]}`
  2. Implement `checkBacklogCli()` — tries `backlog task list --plain`, returns `{available: boolean, error?: string}`
  3. Add drift detection: compare content hash of each artifact on each sync run, log if changed
  4. Add `openspec validate` call to verify phase in tasks.md
- **File paths**: `scripts/sync-openspec-change-to-backlog.ts`, `scripts/sync-backlog-task-to-openspec.ts`
- **Test commands**: Run sync on an existing change, verify validation output; run with CLI unavailable and verify warning logged
- **Commit point**: After step 4

---

### 7. Documentation

- **Micro-steps**:
  1. Create `docs/OPENSPEC-BACKLOG.md` with: integration overview, ownership model (OpenSpec canonical, Backlog operational), snapshot format explanation, troubleshooting section
  2. Update `AGENTS.md`: find appropriate section, add note "Backlog ↔ OpenSpec sync — see docs/OPENSPEC-BACKLOG.md"
- **File paths**: `docs/OPENSPEC-BACKLOG.md`, `AGENTS.md`
- **Test commands**: `cat docs/OPENSPEC-BACKLOG.md` and `grep -n "OPENSPEC-BACKLOG\|Backlog.*OpenSpec" AGENTS.md`
- **Commit point**: After step 2

---

### 8. Initial Sync

- **Micro-steps**:
  1. List all existing OpenSpec changes under `openspec/changes/`
  2. Run sync script on each existing change (skip if already has corresponding Backlog task with same generation marker)
  3. Verify each generated Backlog task is readable and non-empty
- **File paths**: (runs existing scripts)
- **Test commands**: `ls .backlog/tasks/` and spot-check 2-3 generated tasks for content
- **Commit point**: After verifying all tasks synced correctly