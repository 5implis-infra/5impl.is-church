# Product Backlog — Archived Draft

> **Este documento é um rascunho e não deve ser usado como referência autoritativa.**
> Conteúdo aqui foi omitido de `docs/PRODUCT.md` durante a criação dos docs canônicos.
> Status de cada item: **proposed** (considerado, não decidido) | **open** (em discussão) | **deferred** (prioridade baixa, adiado).

## Authentication & Access

### CPF-based member login
**Status: proposed**

During first access, member selects "login as member", enters CPF. System registers an access request. Users with relevant permission receive notification. Approver configures a system-generated password sent via email or WhatsApp. Subsequent logins use CPF + password.

### 2FA support
**Status: open**

TOTP or SMS-based two-factor authentication. Auth library TBD (see ADR-010 TBDs in `docs/ARCHITECTURE.md`). Plan-dependent: may be required for admin accounts, optional for members.

### Social login
**Status: open**

Google and Apple login options for members and operators. Requires OAuth integration. Tracked as part of auth strategy decision.

---

## Domain & Onboarding

### Custom subdomain configuration
**Status: proposed**

Each church selects an available subdomain within the system (e.g., `minhaigreja.adponte.com`). System validates availability and reserves automatically. Must support CNAME routing.

### Custom domain with ownership validation
**Status: proposed**

Church can configure a custom domain (e.g., `minhaigreja.com`). System validates domain ownership via DNS check ( TXT record or similar) before activating. More complex than subdomain, provides brand independence.

### 6-step onboarding process
**Status: proposed**

1. Plan selection — admin selects subscription plan
2. Payment configuration — set payment method for recurring billing
3. Initial payment — first charge to activate service
4. Domain configuration — subdomain or custom domain
5. User and access setup — add admins, define operator profiles and access per subsidiary
6. Visual configuration — branding, logo, theme

### Token regeneration on church/filial switch
**Status: proposed**

User token identifies church and subsidiary automatically. Token regenerates on church/filial switch to prevent privilege escalation. This is a security model detail that should be in auth spec, not product backlog — flagged for OpenSpec auth capability.

---

## Finance

### PIX parcelado
**Status: proposed**

Manage installment payments similar to credit card invoice management. Enable PIX installment payments for purchases/sales of equipment. Requires integration with payment gateway supporting PIX installments.

### Google Pay / Apple Pay for online donations
**Status: proposed**

Online donation flow with Google Pay and Apple Pay as payment methods. When a donation occurs, automatically post revenue to configured cost center and account. Requires payment gateway with wallet support.

### QR Code PIX generation
**Status: proposed**

Generate PIX QR codes for donations and other payments. Dynamic or static QR codes with amount specification. Must integrate with payment gateway for PIX settlement.

### Cost center linking to ministries
**Status: deferred**

Each physical or virtual account can be linked to a ministry. Track detailed balance per ministry. Lower priority — current financial module handles accounts and categories without ministry linkage.

---

## Courses

### Grade versioning with hierarchical material
**Status: proposed**

Curriculum hierarchy with sub-items. Each item can link to teaching material. Versioning for curriculum — old versions retained, new versions created on update. Each material item can be a book, PDF, video with hierarchical structure.

### Course enrollment via page or event editing
**Status: proposed**

Members can enroll in courses through the course page or during event editing. Enrollment captures participant data and optionally payment. Registration can be public or restricted to specific audience profiles.

### Private / public course segmentation
**Status: proposed**

Courses have an audience configuration: which member types can see/enroll. Public courses visible to anonymous users. Private courses require authentication and possibly specific profile attributes.

### Automatic revenue posting
**Status: deferred**

When a course with enrollment fee is paid, automatically post revenue to the configured cost center and account. Lower priority — financial module integration to be detailed later.

---

## Notifications & Messaging

### Pub/sub event system
**Status: open**

All system events generate notifications via a pub/sub system. Notifications classified by system event type (e.g., income entries, pending tasks, new scheduled events, new publications). Subscription preferences per user determine which notifications they receive based on their relationship to the triggering event.

### Template-based message sending
**Status: proposed**

System notifications, prayer requests, access requests, password changes, and other system events use template-based messages. Templates managed in a template editor. Supported channels: email, WhatsApp, in-app push.

### Message history with retention policy
**Status: proposed**

All sent messages logged with history. Retention period configurable per subscription plan. Search and filter sent messages by date, recipient, channel, template. Allows audit of communications sent to members.

### Automation builder
**Status: proposed**

Build automations linking: system event types → recipients (members, leaders, ministries) → message template → delivery channel (email/WhatsApp). Drag-and-drop or form-based automation builder. Each automation has enable/disable toggle.

### Pre-configured automations
**Status: proposed**

Automations pre-configured out of the box:
- Monthly, weekly, daily birthday notifications
- Event reminders to volunteers
- Important event alerts to leaders

---

## Deferred / Low Priority

### Volunteer scheduling (escala de voluntários)
Single sentence mention in original draft without implementation detail. Excluded from backlog until someone writes a proper spec.

### Ministry financial management
Covered by existing finance module scope. Duplicated in current docs. Not a backlog item.

---

## Access Control & Operation Modes

### Per-subsidiary access profiles
**Status: proposed**

When relating a user to a subsidiary, a specific access profile is defined for that subsidiary. A user can have different profiles in different subsidiaries. Profile determines which modules and features are accessible. Predefined profiles or custom profiles within subscription plan limits.

### Admin delegation
**Status: proposed**

Administrator role can be delegated to other users. An admin can grant admin rights to other operators. This creates a chain of admin responsibility. Revocation must be possible without deleting the user.

### Token-based church/filial auto-identification
**Status: proposed**

System access token automatically identifies the church and subsidiary. User cannot manually change subsidiary in requests. Token regenerates on church/filial switch for security. Prevents privilege escalation via request tampering.

### Operation mode selection
**Status: proposed**

Three distinct operation modes with their own UX and permissions:

- **Admin mode**: Restricted to operator-type users with configured profiles. Full management access per profile level.
- **Member mode**: Members access agenda, prayer requests, publications, media, financial contributions, and course enrollments per their profile.
- **Anonymous mode**: Public agenda, public photos and publications, message submission. Contributions require identification (email + CPF). Course enrollment for public courses.

### Anonymous mode contributions
**Status: proposed**

Anonymous users can make contributions but must identify with email and CPF. No account required. System records identification for audit trail. First-time anonymous contributors trigger access request workflow for future authenticated access.

---

## Event Management

### Event uniqueness classification
**Status: proposed**

Events can be:
- **Single**: one-off events with no recurrence
- **Recurring**: events that repeat on a schedule
- **Series**: events that are episodes in a series with its own curriculum/schedule

Each type has different UX and management characteristics. Series are linked to course curricula.

### Event attachments
**Status: proposed**

Events support attachments: photos, videos, and supporting materials. Attachments are stored and associated with the event record. Media processing pipeline handles ingestion and storage.

### Event-linked financial entries
**Status: proposed**

Event revenues and expenses (offerings, tithes, event-specific costs) link to the financial module. Categories and cost centers apply. Multiple payment methods supported per event.

### Volunteer scheduling for events
**Status: proposed**

Plan teams for each event/cult. Volunteer scheduling sends automatic notifications to assigned volunteers. Team composition tracked per event. Volunteer availability confirmations collected.