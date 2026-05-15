---
id: decision-016
title: "Notifications Stack"
date: "2026-05-14"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [016-notifications-stack.md](../../docs/adrs/016-notifications-stack.md)

## Context

The Notifications module needs to support multiple channels: push (FCM), email (Resend), and WhatsApp (Evolution API or Twilio). Each channel has different delivery characteristics, pricing, and integration complexity.

## Decision

Adopt the following channel stack:
- **Email**: Resend — transactional email with React Email templates
- **Push**: Firebase Cloud Messaging (FCM) — native push notifications
- **WhatsApp**: Evolution API (self-hosted) — WhatsApp business API without Twilio dependency

Telegram is handled separately by the media approval bot (its own worker, not part of the Notifications module).

## Consequences

- Each user configures preferred channels via the profile system
- Notifications are published to a pub/sub queue; workers dispatch to each channel
- Evolution API runs as a self-hosted service on the VPS
- Resend handles transactional email across all modules
