---
id: decision-002
title: "Directory Structure"
date: "2026-04-16"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [002-directory-structure.md](../../docs/adrs/002-directory-structure.md)

# 002. Directory Structure

- Status: accepted
- Date: 2026-04-16
- Review: 2026-04-25

## Decision

Turborepo with domain-based organization: `apps/`, `services/`, `workers/media/`, `workers/system/`, `packages/`, `infra/`.

**v2 changes:**
- End of mini-monorepo `apps/gestao`: each component promoted to its own repo
- Workers grouped by domain: `media/` and `system/`
- `services/n8n` migrated to `infra/n8n`
- `apps/site` separated as independent repo
