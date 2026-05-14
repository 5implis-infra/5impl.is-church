# Legacy Doc Archive Format

## ADDED Requirements

### Requirement: Archived document banner

SHALL documents moved to `docs/old/` be clearly marked as historical reference only.

Feature: Legacy doc archive format

#### Scenario: Banner present on archived doc
- **GIVEN** a document has been moved to `docs/old/`
- **WHEN** a reader opens the file
- **THEN** the file begins with a banner stating it is archived and directing readers to authoritative sources

#### Scenario: Banner includes redirect guidance
- **GIVEN** an archived document banner
- **WHEN** a reader views the banner
- **THEN** the banner references the current authoritative document(s) that supersede the archived content

### Requirement: Stale docs do not appear as active references

SHALL files without archive banners NOT exist in `docs/old/` — they create false impressions of active content.

Feature: Legacy doc archive format

#### Scenario: All archived files have banners
- **GIVEN** a file exists in `docs/old/`
- **WHEN** the file is read
- **THEN** it contains an archive banner at line 1