---
id: decision-015
title: "Payment Gateway: Asaas"
date: "2026-05-14"
status: accepted
---
<!-- generated-by: adponte-backlog-doc-index -->

Canonical ADR: [015-payment-gateway.md](../../docs/adrs/015-payment-gateway.md)

## Context

The product needs to collect payments: PIX, boleto, card, and installments. Candidates: Asaas (Brazil-focused, native PIX), Pagar.me (Stripe-backed), or Stripe + Pagar.me for PIX.

## Decision

Adopt **Asaas** as the payment gateway. Asaas provides native PIX support, boleto generation, and card processing with strong coverage in the Brazilian market. It is the primary choice for Brazil-centric SaaS.

Stripe is not adopted as the primary gateway — while Stripe is globally robust, Asaas has better local payment method coverage for the Brazilian context.

## Consequences

- All payment flows use Asaas API
- PIX is native (no intermediary)
- Billing plans and subscription management are integrated with Asaas webhooks
- Invoicing and receipt generation handled by Asaas
