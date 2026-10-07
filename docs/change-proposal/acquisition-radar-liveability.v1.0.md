---
artifactId: ilka.change-proposal.acquisition-radar-liveability
project: ILKA Boat Value Calculator
documentType: CHANGE_PROPOSAL
projectStage: DECISION
gate: G2_DOMAIN_LOCK
status: APPROVED
version: 1.0
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: APPROVED_AUTHORITY
supersedes: —
---

# Change Proposal — Acquisition Radar Liveability + DIY Economics

## Current
PRODUCT v1.0 and DOMAIN v1.0 define liveaboard economics, hard gates, logistics, refit, walk-away price and evidence lineage, but do not protect as explicit requirements: two private cabins, six-person accommodation, immediate move-in, LOCAL logistics, DIY time cost, or value uplift from improvements.

## Proposed
1. Require at least **2 private cabins** and **6 sleeping/comfortable places**.
2. Add **moveInPossible** as a hard screen. A finished interior or permanent installed heating is not required; safe temporary shore-powered heating is acceptable.
3. Preserve poor/unfinished interior as potentially attractive when structural/mechanical/habitability gates pass.
4. Add `LOCAL` alongside SEA and ROAD logistics.
5. Cost DIY time with an editable shadow rate; initial default **31.40 PLN/hour**.
6. Split mandatory pre-move work from post-move improvements.
7. For each improvement track cash spend, DIY hours and expected market-value uplift.
8. Store parser-ready listing metadata without implementing scraping in this Result.

## Why
A more expensive boat already in Gdańsk can outperform a cheaper remote boat after delivery, crane, preparation, overlap-rent, refit and risk. Interior work is comparatively feasible for the owners; engine/structural work has different risk/time economics.

## Affected artifacts
PRODUCT / DOMAIN / RESULT.

## Affected entities
BoatCandidate / BoatOffer / LogisticsOption / RefitPlan / GateAssessment / Scenario / EvaluationSnapshot.

## Breaking change
NO — compatible semantic extension.

## Migration
Existing candidates are retained. Missing fields receive UNKNOWN/default values. Existing interior/energy refit values are preserved as post-move improvement assumptions unless explicitly marked mandatory.

## Risk
Expected value uplift can create false precision. It remains an assumption unless backed by evidence.

## Decision owner
Modern Pilgrims.

## Status
APPROVED by explicit project-owner instruction on 2026-10-06.
