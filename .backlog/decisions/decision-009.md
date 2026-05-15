---
id: decision-009
title: "Separation of `services/api` and `services/media-workflow`"
date: "2026-05-07"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [009-n8n-ownership.md](../../docs/adrs/009-n8n-ownership.md)

## Context

The product has two distinct types of systemic operation: CRUD/business rules (request/response) and media workflow orchestration (event-driven, long-running).

## Decision

- `services/api` concentrates all product logic (all modules + billing + tenants). It is the request/response API consumed by apps and workers.
- `services/media-workflow` is exclusive to the Media Module: receives events from `api-local`, maintains job state machine, triggers and receives callbacks from `infra/n8n`.

## Consequences

- `services/api` is the only service called directly by apps
- `services/media-workflow` is never called by apps — only reacts to events
- Billing, plans, and tenants are internal domain of `services/api`
- Independent deploy cycles between the two services
