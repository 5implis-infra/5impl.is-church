## MODIFIED Requirements

### Requirement: AGENTS.md contains Specs relacionados section

Root `AGENTS.md` SHALL include a "Specs relacionados" section linking to relevant `openspec/specs/<capability>/spec.md` files for the capabilities it implements or relates to.

#### Scenario: Spec links present in AGENTS.md
- **GIVEN** an AI agent reads `AGENTS.md`
- **WHEN** they need to understand what requirements this component must satisfy
- **THEN** they find a "Specs relacionados" section
- **THEN** it contains links to relevant `openspec/specs/<capability>/spec.md` files
- **AND** it does not duplicate requirement content that lives in those specs