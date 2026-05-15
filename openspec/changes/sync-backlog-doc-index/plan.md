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