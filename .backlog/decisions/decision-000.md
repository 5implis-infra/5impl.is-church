---
id: decision-000
title: "Documentation Standards"
date: "2026-05-14"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [000-documentation-standards.md](../../docs/adrs/000-documentation-standards.md)

## Context

The AD Ponte SaaS monorepo contains 22 subprojects. Without clear documentation standards, documents overlap, duplicate, and contradict each other, causing confusion for AI agents and developers alike.

## Decision

### Documentation Hierarchy

Each document has exactly one authoritative purpose. Docs point to each other, they do not duplicate:

| File/Dir | Purpose | Is Source of Truth For |
|---|---|---|
| `docs/CONSTITUTION.md` | Identity, values, principles, why we exist | Product identity and non-negotiable principles |
| `docs/PRODUCT.md` | What we build: surfaces, modules, features, domain concepts | Product functionality at macro level |
| `docs/ARCHITECTURE.md` | Technical architecture, system diagram, stack, deployment, references to global ADRs | Technical structure |
| `docs/DESIGN.md` | Visual/UX constitution: principles, token semantics, composition patterns, cross-cutting UX rules | Design intent — implementation in `packages/ui` |
| `docs/adrs/*.md` | Immutable architectural decisions, one per file | Any architectural decision that warrants a record |
| `docs/concerns/*.md` | Architecture concerns (auth strategy, multi-tenancy, API design) | Global cross-cutting architectural concerns |
| `docs/bounded-contexts/*.md` | Bounded context definitions (billing domain, notifications domain) | Domain model boundaries and integration points |
| `docs/old/` | Archived legacy docs | Historical reference only — never authoritative |
| `docs/draft/` | Pre-formalization docs: drafts, backlogs, exploratory specs, deferred decisions | Not authoritative — items promote to `openspec/specs/` or delete |
| `AGENTS.md` | AI/developer context: purpose, boundaries, integration points, minimal quick commands | How to understand and work with a component |
| `README.md` | Human entry point: what this is, how to run it, links | Getting started for humans |
| `openspec/specs/*.md` | Capability requirements and behavior | What each feature must do |

**Rule:** No document may claim to be authoritative for content that lives elsewhere.

**Conflict resolution:** When `docs/old/` conflicts with active docs, active docs always take precedence.

### Canonical Filename

All agent-context files across the monorepo SHALL be named `AGENTS.md` (not `AGENTE.md` or any other variant). This applies to:
- Root `AGENTS.md`
- All subproject `AGENTS.md` files (22 submodules)
- Any future agent-context files

### Draft Documentation

`docs/draft/` is the holding area for pre-formalization documentation. Lifetime: items are promoted to `openspec/specs/` or deleted — they should not accumulate indefinitely.

Files in `docs/draft/` MUST NOT be referenced as authoritative from active canonical docs.

## Consequences

- Each document type has a clear owner and scope
- AI agents can navigate documentation predictably
- Pre-formalization content has a distinct home without polluting canonical docs
- Quarterly review of `docs/draft/` is needed to promote or prune items
