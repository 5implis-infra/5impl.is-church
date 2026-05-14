# 003. CI/CD: GitHub Actions + GHCR + Coolify

- Status: accepted
- Date: 2026-04-16

## Decision

`push → GitHub Actions (build + push → GHCR) → webhook → Coolify (pull + deploy)`

- Build outside VPS (does not consume server resources)
- GHCR free for private repos
- Coolify: zero-downtime restart via webhook

**Required GitHub Secrets per project:**

| Secret | Purpose |
|---|---|
| `TURBO_API` | Turborepo Remote Cache URL |
| `TURBO_TOKEN` | Cache auth token |
| `TURBO_TEAM` | Turborepo Team ID |
| `COOLIFY_TOKEN` | Coolify token |
| `COOLIFY_WEBHOOK_*` | Webhook URL per service |