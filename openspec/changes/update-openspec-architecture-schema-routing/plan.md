## 1. Fix architecture-driven schema

- **Micro-steps**:
  1.1 Open `openspec/schemas/architecture-driven/schema.yaml` in editor
  1.2 Find line 40 (`id: proposal`) and change to `id: scope`
  1.3 Find routing table in instruction section; update `docs/concerns/<name>/ARCHITECTURE.md` → `docs/concerns/<name>.md` and `docs/contexts/<name>/domain-model.md` → `docs/bounded-contexts/<name>.md`
  1.4 Save and close
- **File paths**: `openspec/schemas/architecture-driven/schema.yaml`
- **Test commands**: `openspec schema validate architecture-driven`
- **Commit point**: After step 1.4

## 2. Update scope.md template

- **Micro-steps**:
  2.1 Open `openspec/schemas/architecture-driven/templates/scope.md`
  2.2 Update routing table paths to flat file format
  2.3 Save and close
- **File paths**: `openspec/schemas/architecture-driven/templates/scope.md`
- **Test commands**: None (template only)
- **Commit point**: After step 2.3

## 3. Update openspec/config.yaml skill rules

- **Micro-steps**:
  3.1 Open `openspec/config.yaml`
  3.2 Add new `architecture-doc:` section after `specs:` rule
  3.3 Edit `design:` section — keep `c4-architecture` mandatory; add comment that other skills apply conditionally
  3.4 Edit `adr:` section — remove `c4-architecture` from mandatory list
  3.5 Save and close
- **File paths**: `openspec/config.yaml`
- **Test commands**: `openspec schema validate intent-driven`
- **Commit point**: After step 3.5

## 4. Add scope guidance to README

- **Micro-steps**:
  4.1 Open `openspec/schemas/architecture-driven/README.md`
  4.2 Append note that concerns and bounded-contexts directories live at monorepo root only
  4.3 Save and close
- **File paths**: `openspec/schemas/architecture-driven/README.md`
- **Test commands**: None (documentation only)
- **Commit point**: After step 4.3

## 5. Update ADR 010

- **Micro-steps**:
  5.1 Open `docs/adrs/010-documentation-hierarchy-source-of-truth.md`
  5.2 Add two new rows to hierarchy table: `docs/concerns/*.md` and `docs/bounded-contexts/*.md`
  5.3 Save and close
- **File paths**: `docs/adrs/010-documentation-hierarchy-source-of-truth.md`
- **Test commands**: `openspec schema validate architecture-driven`
- **Commit point**: After step 5.3

## 6. Adapt arc42-documentation skill path

- **Micro-steps**:
  6.1 Open `.agents/skills/arc42-documentation/SKILL.md`
  6.2 Identify where `docs/architecture/arc42/` is hardcoded as output path
  6.3 Determine whether skill supports a path parameter or requires fork
  6.4 If parameterizable: add path override to skill invocation
  6.5 If not parameterizable: fork the skill with configurable target path
  6.6 Test with a sample architecture-doc run
- **File paths**: `.agents/skills/arc42-documentation/SKILL.md`
- **Test commands**: Manual validation by running arc42 skill on a test concern
- **Commit point**: After step 6.6