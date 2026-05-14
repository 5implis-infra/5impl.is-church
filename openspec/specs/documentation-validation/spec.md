# Spec: documentation-validation

## Purpose

Establish requirements for validating new canonical docs for consistency, completeness, and cross-referencing. Ensures each doc stays within its own purpose and does not duplicate content.

## Requirements

### Requirement: docs/draft/product-backlog.md contains selected omitted content

`docs/draft/product-backlog.md` SHALL contain topics from `docs/old/product-context.md` that are not in `PRODUCT.md` and not yet formalized in OpenSpec specs, selected by these criteria:

- Specific enough to guide future implementation
- Not contradicted by current architecture or domain decisions
- Not already in any OpenSpec capability spec
- At least 2-3 sentences of useful context

#### Scenario: Backlog contains selected topics
- **GIVEN** a reader examines `docs/draft/product-backlog.md`
- **WHEN** they compare it to `PRODUCT.md`
- **THEN** no topic in the backlog is already fully described in `PRODUCT.md`
- **THEN** each backlog item has topic name + context + status
- **THEN** items are grouped by domain area

#### Scenario: Backlog excludes vague or covered content
- **GIVEN** a reader examines `docs/draft/product-backlog.md`
- **WHEN** they check items against `docs/old/product-context.md` and `openspec/specs/`
- **THEN** items that are single sentences without implementation context are excluded
- **THEN** items already in OpenSpec specs are not listed as backlog

### Requirement: PRODUCT.md links to related docs

`docs/PRODUCT.md` SHALL include a "See also" section with links to `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, and `AGENTS.md` at minimum.

#### Scenario: PRODUCT.md has See also section
- **GIVEN** a reader finishes `docs/PRODUCT.md`
- **WHEN** they look for where to go next
- **THEN** a "See also" section exists at the end
- **THEN** it links to `docs/ARCHITECTURE.md` (technical details)
- **THEN** it links to `docs/DESIGN.md` (design intent)
- **THEN** it links to `AGENTS.md` (AI context)

### Requirement: CONSTITUTION.md links to related docs

`docs/CONSTITUTION.md` SHALL include a "See also" section linking to `docs/PRODUCT.md` and `docs/DESIGN.md`.

#### Scenario: CONSTITUTION.md has See also section
- **GIVEN** a reader finishes `docs/CONSTITUTION.md`
- **WHEN** they look for where to go next
- **THEN** a "See also" section exists at the end
- **THEN** it links to `docs/PRODUCT.md`
- **THEN** it links to `docs/DESIGN.md`

### Requirement: DESIGN.md links to related docs and packages/ui

`docs/DESIGN.md` SHALL include a "See also" section linking to `docs/PRODUCT.md` and `packages/ui`.

#### Scenario: DESIGN.md has See also section
- **GIVEN** a reader finishes `docs/DESIGN.md`
- **WHEN** they look for where to go next
- **THEN** a "See also" section exists at the end
- **THEN** it links to `docs/PRODUCT.md`
- **THEN** it links to `packages/ui` (implementation reference)

### Requirement: AGENTS.md links to openspec/specs/

Root `AGENTS.md` SHALL include a "Specs relacionados" section linking to relevant `openspec/specs/<capability>/spec.md` files.

#### Scenario: AGENTS.md has Specs relacionados
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand what requirements a component must satisfy
- **THEN** a "Specs relacionados" section exists
- **THEN** it links to relevant `openspec/specs/<capability>/spec.md` files
- **AND** it does not duplicate requirement content that lives in those specs

### Requirement: No duplication across PRODUCT.md, CONSTITUTION.md, and DESIGN.md

No fact SHALL appear in more than one of `docs/PRODUCT.md`, `docs/CONSTITUTION.md`, or `docs/DESIGN.md`.

#### Scenario: No shared content across docs
- **GIVEN** a reader examines all three files
- **WHEN** they search for shared phrases
- **THEN** no paragraph or bullet appears in more than one file
- **THEN** authority order is respected: CONSTITUTION (values) > PRODUCT (domain) > DESIGN (visual)