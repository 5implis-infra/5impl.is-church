---
id: decision-018
title: "Telegram Bot Language: Python"
date: "2026-05-14"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [018-telegram-bot-language.md](../../docs/adrs/018-telegram-bot-language.md)

# 018. Telegram Bot Language: Python

- Status: accepted
- Date: 2026-05-14

## Context

The media approval workflow uses a Telegram bot for human review: preview + Approve/Reprocess buttons. The bot runs alongside the media workers. Language choice is between Python (consistent with media workers) and Node.js (consistent with API services).

## Decision

Use **Python** for the Telegram bot. Python is already the language of the media workers (`workers/media/transcript`, `workers/media/ffmpeg`, `workers/media/images`, `workers/media/davinci`), so the bot fits naturally into the existing Python tooling ecosystem. This also simplifies the DevOps story — one language across the entire media pipeline.

Node.js is not adopted for the bot — it would introduce a second runtime for the media pipeline.

## Consequences

- The Telegram bot is a Python project with its own `requirements.txt` / `pyproject.toml`
- Shares the same Docker host as other media workers
- Python logging and monitoring conventions apply
