---
id: decision-017
title: "API-Local Stack: Hono Lite"
date: "2026-05-14"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [017-api-local-stack.md](../../docs/adrs/017-api-local-stack.md)

# 017. API-Local Stack: Hono Lite

- Status: accepted
- Date: 2026-05-14

## Context

`services/api-local` runs on a mini-PC at the church location, with limited resources and no dedicated internet. It receives media via Wi-Fi local and relays to `services/media-workflow`. The question is which framework to use.

## Decision

Use **Hono Lite** for `api-local`. Hono is consistent with the rest of the TypeScript service stack (`services/api`, `services/media-workflow`), lightweight enough for a resource-constrained mini-PC, and has good TypeScript support.

Node.js runtime on the mini-PC (not Bun or Deno) for maximum compatibility with existing Docker tooling.

## Consequences

- Shared TypeScript conventions across all services
- `api-local` is a Hono app, deployed as a minimal Docker container
- Wi-Fi media upload is handled by a local Hono route; authenticated relay to `media-workflow` via internal token
- Docker image must be small (<100MB) to support limited hardware
