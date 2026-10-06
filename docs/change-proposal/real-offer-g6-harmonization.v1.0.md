---
artifactId: ilka.change-proposal.real-offer-g6-harmonization
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

# Change Proposal — Real Offer / Evidence Harmonization for G6

## Current
Runtime v0.5 still stores the visible listing price and seller/source fields directly on BoatCandidate even though APPROVED DOMAIN v1.2 already says one BoatCandidate has many BoatOffer records. Several numeric defaults are calculated as zero/amounts without an explicit evidence-maturity state. `initialReserveEUR` is currently included inside mandatory refit cost. Logistics feasibility is represented by booleans and TOW is deferred.

## Proposed
1. Runtime/state separates BoatCandidate and append-only BoatOffer history.
2. BoatOffer records: price type, original amount/currency, buyer premium, taxes/fees, derived all-in price before logistics, auction/expiry dates, status and source lineage.
3. Critical cost inputs expose `UNKNOWN / ESTIMATE / QUOTE / ACTUAL`.
4. UNKNOWN critical inputs keep the Decision Engine in HOLD even when a numeric scenario placeholder is present.
5. `Cost-to-Habitable`, `Cash Required` and `Emergency Reserve` become separate KPIs; reserve is not automatically an expense.
6. Logistics feasibility becomes `UNKNOWN / PASS / FAIL`; ROAD adds transport height, weight, dismantling and crane-lift data.
7. TOW becomes an explicit logistics mode.
8. Four real offers are loaded from a versioned EVIDENCE fixture through ARTIFACT_INDEX for browser validation.
9. Product liveability semantics remain unchanged.

## Why
Real listings already demonstrate failure modes that the v0.5 runtime cannot represent correctly:
- ANKA has one current and multiple historical asking prices.
- De Alm has a raw auction bid and a materially higher all-in transaction cost after buyer premium/VAT.
- unknown transport/insurance/survey costs must not silently behave like confirmed zero.
- emergency liquidity is economically different from money already spent.

## Affected entities
BoatOffer, LogisticsOption, CostItem, Scenario/EvaluationSnapshot metrics.

## UI
Current ask/bid remains prominent, with all-in-before-logistics and price history beside it. Critical monetary inputs show evidence maturity. Cockpit composition is otherwise unchanged.

## Database / integrations
No database. localStorage state migrates compatibly to a new runtime version. EVIDENCE fixtures are Git JSON artifacts addressed through ARTIFACT_INDEX.

## Breaking change
Compatible domain extension. Legacy localStorage fields are migrated; approved Product thresholds are unchanged.

## Migration
- one legacy candidate price/source becomes one BoatOffer;
- existing non-zero manual cost values migrate as ESTIMATE unless an explicit evidence state exists;
- old feasibility true → PASS; false/absent → UNKNOWN;
- old initialReserveEUR → emergencyReserveEUR without adding it to mandatory refit.

## Risk
More HOLD states are expected until evidence is supplied. This is intentional and preferable to false precision.

## Decision owner
Modern Pilgrims

## Status
APPROVED — explicitly authorized by the user on 2026-10-06 for the next G6 iteration.
