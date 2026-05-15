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