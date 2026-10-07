---
artifactId: ilka.product.boat-value-calculator
project: ILKA Boat Value Calculator
documentType: PRODUCT
projectStage: CLARITY
gate: G1_PRODUCT_LOCK
status: SUPERSEDED
version: 1.0
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: HISTORY
supersedes: —
supersededBy: 1.1
---

# ILKA Boat Value Calculator — Product

## Audience

Project owners evaluating whether buying and living on a boat is economically preferable to continuing to rent an apartment.

## Problem

A low listing price does not tell us whether a boat is actually a good housing asset. The real decision depends on purchase price, delivery/logistics, required initial refit, marina/wintering, utilities, insurance, maintenance, retained value, liveaboard suitability and uncertainty.

## Primary outcome

For every candidate, answer:

1. What does it cost to obtain a usable liveaboard asset in Poland?
2. What is the monthly operating run-rate?
3. What is the economic cost over the chosen horizon after retained value?
4. Is it better or worse than the apartment alternative?
5. What is the maximum purchase price that still satisfies the budget/rent constraints?
6. What evidence supports each material number?
7. Which risks or unknowns can still invalidate the case?

## Core flow

Source / Evidence
→ BoatCandidate + BoatOffer / MarinaOffer
→ Logistics + mandatory refit + monthly costs
→ Scenario
→ EvaluationSnapshot
→ comparison / radar
→ Decision

## Product principles

- Compare total economics, not listing price alone.
- Separate verified quotes from planning assumptions.
- Preserve old prices and offers as history; never silently overwrite them.
- Unknown is a valid value. Do not replace missing evidence with invented precision.
- The boat is an asset with retained value, so cash outflow and economic cost must be shown separately.
- Housing viability comes first. Monetization is a second-stage upside scenario and must not rescue an otherwise unviable base case.
- Quality and price are separate dimensions: score the object independently, then compare that quality to economic cost.

## Required calculation surfaces

- Landed cost.
- Monthly run-rate.
- Cash cost over horizon.
- Economic cost over horizon.
- All-in economic monthly burden.
- Delta vs rent.
- Housing saving per month.
- Payback / capital-at-risk indicator.
- Max purchase price at budget.
- Max purchase price vs rent.
- Cash-only purchase ceiling.
- Value score and value index.
- Sea vs road logistics comparison.
- Named marina scenarios with source-backed terms.

## Evidence intake

Raw comments, links, screenshots, new quotes and price changes are collected in GitHub issue #2. Comments are REFERENCE/DISCUSSION only. Material verified values are promoted into versioned Git EVIDENCE artifacts.

Because the repository is public, private email bodies and personal contact details must remain outside Git.

## Non-goals for the base case

- Automatic marketplace scraping.
- Automatic FX as a hidden dependency.
- Treating an asking price as an accepted purchase price.
- Charter/stay/content/event revenue inside the base housing case.
- Replacing marine survey, mechanical inspection, legal checks or insurance underwriting.
- Production release without G7 authorization.

## Current approved economic baseline

See `ilka.decision.economic-baseline` v1.0.
