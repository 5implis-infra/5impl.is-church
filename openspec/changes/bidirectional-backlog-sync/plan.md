## Task Groups

## 1. Script Modification - Full Content Sync

### Micro-steps

1. **Read current `backlog-sync-doc-index.ts`** to understand generateDocStub/generateDecisionStub functions
2. **Modify `generateDocStub()`** to append full file content after the canonical link header
3. **Modify `generateDecisionStub()`** to append full ADR content after the canonical link header
4. **Update path calculations** for the canonical link (ensure `../../docs/` prefix is correct)
5. **Run script with `--full`** and verify output in `.backlog/`

### File paths
- `scripts/backlog-sync-doc-index.ts`

### Test commands
```bash
tsx scripts/backlog-sync-doc-index.ts --full
cat .backlog/docs/doc-architecture.md
cat .backlog/decisions/decision-014.md
```

### Commit point
After step 5 - commit "chore: sync full content to backlog stubs"

---

## 2. Pre-Commit Hook - Bidirectional

### Micro-steps

1. **Read current `.git/hooks/pre-commit`** to see existing backlog-sync block
2. **Add `backlog→docs` detection**: grep for `A`, `D`, `R` in `.backlog/docs/` and `.backlog/decisions/`
3. **Implement propagation**: copy modified `.backlog/` files back to `docs/` (keeping generated-by marker)
4. **Add origin safeguard**: check if `docs/` was also changed in same commit (if so, skip to avoid overwrite)
5. **Stage propagated files**: `git add docs/ docs/adrs/`
6. **Update hook installer** to include new block with idempotency

### File paths
- `.git/hooks/pre-commit`
- `scripts/install-backlog-sync-hook.sh`

### Test commands
```bash
# Test propagation manually
git diff --cached --name-status
# Should show docs changes when .backlog is modified
```

### Commit point
After step 6 - commit "chore: add bidirectional sync to pre-commit hook"

---

## 3. Initial Sync - Regenerate Stubs

### Micro-steps

1. **Run `backlog-sync-doc-index.ts --full`** to regenerate all stubs with full content
2. **Verify content**: compare a few `.backlog/` files with original `docs/` files
3. **Stage and commit** regenerated stubs

### File paths
- `.backlog/docs/*.md` (regenerated)
- `.backlog/decisions/*.md` (regenerated)

### Test commands
```bash
diff docs/ARCHITECTURE.md <(tail -n +9 .backlog/docs/doc-architecture.md)
```

### Commit point
After step 3 - commit "chore: regenerate backlog stubs with full content"

---

## 4. Verification Tests

### Micro-steps

1. **Edit test**: Modify `docs/PRODUCT.md`, stage, commit, verify `.backlog/docs/doc-product.md` updated
2. **Backlog→Docs test**: Modify `.backlog/docs/doc-product.md`, stage, commit, verify `docs/PRODUCT.md` updated
3. **Delete test docs→backlog**: Delete `docs/TEMP.md`, stage, commit, verify stub removed
4. **Delete test backlog→docs**: Delete `.backlog/docs/doc-architecture.md`, stage, commit, verify canonical kept
5. **Modified-only test**: Modify content of `docs/ARCHITECTURE.md`, stage, verify hook doesn't trigger cross-sync
6. **Final validation**: Run `openspec validate bidirectional-backlog-sync --type change --strict`

### Test commands
```bash
# Each test is manual verification of file contents
```

### Commit point
After all tests pass - commit "test: add bidirectional sync verification tests"