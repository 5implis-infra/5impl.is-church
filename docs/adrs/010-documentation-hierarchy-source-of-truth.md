# 010. Documentation Hierarchy and Source-of-Truth

- Status: accepted
- Date: 2026-05-14

## Context

The AD Ponte SaaS monorepo contains 22 subprojects with overlapping, duplicative, and sometimes contradictory documentation. `docs/context/` files were labeled as drafts but remained in use. There was no rule for which document was authoritative for what, causing confusion for AI agents and developers alike.

## Decision

Establish a documentation hierarchy where each document has exactly one authoritative purpose and does not duplicate content that lives elsewhere:

| File/Dir | Purpose | Is Source of Truth For |
|---|---|---|
| `docs/CONSTITUTION.md` | Identity, values, principles, why we exist | Product identity and non-negotiable principles |
| `docs/PRODUCT.md` | What we build: surfaces, modules, features, domain concepts | Product functionality at macro level |
| `docs/ARCHITECTURE.md` | Technical architecture, system diagram, stack, deployment, references to global ADRs | Technical structure |
| `docs/DESIGN.md` | Visual/UX constitution: principles, token semantics, composition patterns, cross-cutting UX rules | Design intent — implementation in `packages/ui` |
| `docs/adrs/*.md` | Immutable architectural decisions, one per file | Any architectural decision that warrants a record |
| `docs/old/` | Archived legacy docs | Historical reference only — never authoritative |
| `AGENTS.md` | AI/developer context: purpose, boundaries, integration points, minimal quick commands | How to understand and work with a component |
| `README.md` | Human entry point: what this is, how to run it, links | Getting started for humans |
| `openspec/specs/*.md` | Capability requirements and behavior | What each feature must do |

**Rule:** No document may claim to be authoritative for content that lives elsewhere. Docs point to each other, they do not duplicate.

**Conflict resolution:** When `docs/old/` conflicts with active docs, active docs always take precedence.

## Consequences

- Each document type has a clear owner and scope — reduces ambiguity about where to find information
- New docs can be created confidently knowing they fill a specific gap, not an overlapping one
- `docs/context/` content archived to `docs/old/` — stale docs no longer mislead
- AI agents can navigate documentation predictably since roles are unambiguous
- Risk of drift remains if teams create new docs without following the hierarchy — mitigated by this ADR being in force