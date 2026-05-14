## Why

The 22 subprojects in the AD Ponte SaaS monorepo have inconsistent README formats. Some (like `apps/admin-web` and `services/api`) have full paragraphs describing modules, responsibilities, and integrations. Others (like `packages/db` and `workers/media/transcript`) have only a one-liner. This inconsistency makes it harder to quickly understand a subproject when navigating the monorepo. The documentation roadmap (change #7) established this standardization as a goal.

## What Changes

- Define a minimal consistent structure for all 22 subproject READMEs
- Update subproject READMEs that deviate from the pattern
- The pattern: title + one-liner + (optional) what it is + local quickstart (if applicable) + key links
- Avoid repeating global architecture/product content already in root docs
- Link to local `AGENTS.md` and relevant global docs

## Capabilities

### New Capabilities
- `subproject-readme-standard`: Standardized README format for all 22 subprojects

### Modified Capabilities
- (none — no spec-level behaviour changes, only editorial standardization)

## Impact

- 22 subproject `README.md` files across apps, services, workers, packages, and infra
- No code, APIs, or dependencies affected