# 001. Git Submodules Strategy

- Status: accepted
- Date: 2026-04-16

## Context

The `saas` contains projects with different stacks (Next.js, Expo, Hono, Python) that evolve at different rates.

## Decision

Use Git Submodules within `saas`. Each component is an independent private GitHub repository. The `saas` root references each component via `.gitmodules`.

## Consequences

- Each project maintains its own history, issues, and CI/CD
- `git clone --recurse-submodules` is required
- Submodule updates require a commit in the root