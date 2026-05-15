---
id: decision-007
title: "Git Granularity: 1 Repo per Component"
date: "2026-04-25"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [007-one-repo-per-component.md](../../docs/adrs/007-one-repo-per-component.md)

# 007. Git Granularity: 1 Repo per Component

- Status: accepted
- Date: 2026-04-25

## Context

In v1, `gestao` was an internal mini-monorepo with multiple apps/services/packages, creating coupling between components with different release cycles.

## Decision

Within `saas`, each app, service, worker, and package is an independent Git repo. The aggregator monorepo references all as submodules.

## Consequences

22 submodules; each component can evolve, be deployed, and have CI/CD independently.
