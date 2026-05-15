## 1. Fix architecture-driven schema

- [x] 1.1 Rename `id: proposal` to `id: scope` in `openspec/schemas/architecture-driven/schema.yaml` line 40
- [x] 1.2 Update routing table in `openspec/schemas/architecture-driven/schema.yaml` instruction to use `docs/concerns/<name>.md` and `docs/bounded-contexts/<name>.md`
- [x] 1.3 Update path table in `openspec/schemas/architecture-driven/templates/scope.md` to use flat file paths
- [x] 1.4 Verify with `openspec schema validate architecture-driven`

## 2. Update openspec/config.yaml skill rules

- [x] 2.1 Add `architecture-doc:` section requiring `arc42-documentation` skill (permit `c4-architecture`)
- [x] 2.2 Refine `design:` section — keep `c4-architecture` mandatory; mark other skills as conditional (apply only when change involves frontend/design/system)
- [x] 2.3 Remove `c4-architecture` from mandatory `adr:` section (keep only `architecture-decision-records`; move C4 to optional)
- [x] 2.4 Verify with `openspec schema validate intent-driven`

## 3. Document scope rules

- [x] 3.1 Add scope guidance note to `openspec/schemas/architecture-driven/README.md` stating `docs/concerns/` and `docs/bounded-contexts/` live at monorepo root only

## 4. Update ADR 010

- [x] 4.1 Add `docs/concerns/*.md` row to `docs/adrs/010-documentation-hierarchy-source-of-truth.md` hierarchy table
- [x] 4.2 Add `docs/bounded-contexts/*.md` row to same table
- [x] 4.3 Verify with `openspec schema validate architecture-driven`

## 5. Adapt arc42-documentation skill path

- [x] 5.1 Read `.agents/skills/arc42-documentation/SKILL.md` to understand path hardcoding mechanism
- [x] 5.2 Determine whether skill supports path parameter or requires fork
- [x] 5.3 Implement path adaptation to respect schema-resolved target path
- [x] 5.4 Validate output location is correct when skill runs