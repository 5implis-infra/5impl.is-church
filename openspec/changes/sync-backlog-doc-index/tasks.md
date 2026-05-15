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