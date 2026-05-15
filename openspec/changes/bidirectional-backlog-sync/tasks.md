## 1. Script Modification - Full Content Sync

- [x] 1.1 Modify `generateDocStub()` to include full file content instead of just link
- [x] 1.2 Modify `generateDecisionStub()` to include full ADR content
- [x] 1.3 Update canonical link path calculation for correct relative paths
- [x] 1.4 Test that `.backlog/docs/*.md` now contains full canonical content
- [x] 1.5 Test that `.backlog/decisions/*.md` now contains full ADR content

## 2. Pre-Commit Hook - Bidirectional

- [x] 2.1 Update pre-commit hook to detect `A`, `D`, `R` in `.backlog/docs/` and `.backlog/decisions/`
- [x] 2.2 Implement `backlog→docs` propagation logic
- [x] 2.3 Add safeguard to detect if file was originally changed in `docs/` (avoid overwrite)
- [x] 2.4 Hook stages propagated files automatically
- [x] 2.5 Update idempotent installer to include new hook block

## 3. Initial Sync - Regenerate Stubs

- [x] 3.1 Run `backlog-sync-doc-index.ts --full` to regenerate all stubs with full content
- [x] 3.2 Verify stub content matches canonical exactly (except for header)
- [x] 3.3 Stubs are gitignored (not committed) - generated on-demand by pre-commit hook

## 4. Verification

- [x] 4.1 Test: Edit a file in `docs/`, commit, verify `.backlog/` updated
- [x] 4.2 Test: Edit a file in `.backlog/`, commit, verify `docs/` updated
- [x] 4.3 Test: Delete scenario in both directions
- [x] 4.4 Test: Rename scenario in both directions
- [x] 4.5 Test: Modified-only edit does not trigger cross-directional sync