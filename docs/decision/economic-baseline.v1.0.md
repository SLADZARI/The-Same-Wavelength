---
artifactId: ilka.decision.economic-baseline
project: ILKA Boat Value Calculator
documentType: DECISION
projectStage: DECISION
gate: G1_PRODUCT_LOCK
status: APPROVED
version: 1.0
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: APPROVED_AUTHORITY
supersedes: —
---

# Economic Baseline

## DECISION

1. The current apartment alternative is **3100–3200 PLN/month**.
2. The calculator may use **3150 PLN/month** as the editable midpoint default, but must preserve the original range in the authority layer.
3. The primary budget target is **no more than 1000 USD/month of all-in economic burden** over the selected evaluation horizon.
4. The initial evaluation horizon is **12 months**.
5. Phase 1 asks whether the boat works as a housing substitute **without monetization income**.
6. Phase 2 may model monetization of the boat/movement separately, but such revenue must be explicit and must not silently alter the base case.
7. Purchase price, logistics, mandatory refit, operating costs and retained/resale value must remain visible components rather than being collapsed into one unexplained score.

## Implementation mapping

The current prototype evaluates the 1000 USD target against:

`allInEconomicMonthly = economicCost / horizonMonths`

where:

`economicCost = purchase + selected logistics + mandatory refit + operating costs over horizon - expected retained value`

This mapping is the current implementation behavior. Any future change to the meaning of the budget test is a semantic change and requires explicit review.

## STRETCH HYPOTHESIS

Recovering the boat purchase in roughly one year through housing savings plus later monetization is a desired experiment, **not** a guaranteed outcome and not a hard acceptance criterion for the base housing case.
