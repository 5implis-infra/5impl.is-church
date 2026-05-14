# 014. Authentication Library: Better Auth

- Status: accepted
- Date: 2026-05-14

## Context

The product requires sessions, 2FA, social login, and per-filial token management. Candidate libraries: Better Auth, Lucia, Auth.js v5, or a custom solution with Hono middleware.

## Decision

Adopt **Better Auth** as the authentication library. Better Auth is TypeScript-first, integrates well with Hono, and provides session management, 2FA, and social login out of the box. It is the recommended default for TypeScript/Hono stacks.

If Better Auth proves insufficient for per-filial token management, a thin custom wrapper is acceptable — but the core auth flow uses Better Auth.

## Consequences

- Authentication logic centralized in `packages/auth`
- Better Auth handles session lifecycle, 2FA, and OAuth providers
- Per-filial access control is layered on top via the existing profile/access model
- Auth.js v5 is not adopted (fewer Hono integrations than Better Auth)