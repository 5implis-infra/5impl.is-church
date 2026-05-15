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