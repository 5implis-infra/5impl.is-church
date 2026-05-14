# 013. Multi-Tenancy Database Isolation

- Status: accepted
- Date: 2026-05-14
- Supersedes: ADR-006 (partial)

## Context

The product requires multi-tenant data isolation. Two architectural approaches are on the table:
- **Schema-per-tenant**: Separate PostgreSQL schemas, one per church. Maximum isolation, higher operational complexity.
- **Schema + RLS**: Single shared schema with `church_id` in all tables and PostgreSQL Row-Level Security policies. Lower operational cost, sufficient isolation for current stage.

## Decision

Use **schema-per-tenant** for the initial production deployment. Each church gets its own PostgreSQL schema. This provides hard data isolation boundaries — a church's data never shares a schema with another church's data at the database level.

RLS is not adopted as the primary isolation mechanism. The schema separation makes RLS a defense-in-depth measure rather than the primary boundary.

## Consequences

- Each church's schema is provisioned at onboarding time
- Cross-church queries are impossible at the database level
- Schema migrations must run per-tenant or use Prisma's multi-schema support
- Operational complexity increases with tenant count — schema migration scripts must be tenant-aware
- At scale (hundreds of churches), schema-per-tenant may require further evaluation