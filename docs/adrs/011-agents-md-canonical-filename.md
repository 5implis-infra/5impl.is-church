# 011. AGENTS.md as Canonical Agent-Context Filename

- Status: accepted
- Date: 2026-05-14

## Context

Some agent-context files were named `AGENTS.md` while their titles and links referenced `AGENTE.md`. OpenSpec specs also referenced `AGENTE.md`. This inconsistency caused broken links and confusion about the canonical filename.

## Decision

All agent-context files across the monorepo SHALL be named `AGENTS.md`. This applies to:

- Root `AGENTS.md` (the primary agent context for the monorepo)
- All subproject `AGENTS.md` files (22 submodules)
- Any future agent-context files

All internal titles `# AGENTE.md` are updated to `# AGENTS.md`. All links pointing to `AGENTE.md` are fixed to point to `AGENTS.md`. OpenSpec specs are updated to require `AGENTS.md` as the canonical filename.

The filename `AGENTS.md` is AI-tool agnostic — it does not reference any specific AI assistant or agent framework.

## Consequences

- Consistent naming eliminates broken links across the monorepo
- AI agents can reliably locate the agent-context file in any subproject
- `AGENTS.md` title clearly signals its purpose without coupling to any specific AI tool
- Existing references in OpenSpec specs and documentation must be updated — a one-time migration cost