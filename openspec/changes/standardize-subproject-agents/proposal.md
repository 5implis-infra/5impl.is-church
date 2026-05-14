## Why

The `AGENTS.md` files are agent-context documents that live in each subproject. After the README standardization (change #7), the `AGENTS.md` files need the same treatment: a consistent structure with a "Specs Relacionados" section that links to the OpenSpec specs that govern the subproject's behaviour.

## What Changes

- Add "Specs Relacionados" section to all 22 subproject `AGENTS.md` files
- Ensure each subproject's AGENTS.md has a "Pontos de integração" section (standard requirement)
- No structural changes beyond adding the new section

## Capabilities

### New Capabilities
- `subproject-agents-readme-linkage`: Standardized "Specs Relacionados" section in all subproject AGENTS.md files

### Modified Capabilities
- (none — no spec-level behaviour changes, only cross-reference addition)

## Impact

- 22 subproject `AGENTS.md` files across apps, services, workers, packages, and infra