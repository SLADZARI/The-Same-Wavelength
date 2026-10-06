---
artifactId: ilka.result.calculator-foundation
project: ILKA Boat Value Calculator
documentType: RESULT
projectStage: BUILD
gate: G5_BUILD
status: DRAFT
version: 0.2
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: IMPLEMENTATION_AUTHORITY
supersedes: 0.1
---

# Result — Boat Acquisition Radar v1

## Goal

Extend the existing ILKA calculator, without parallel architecture, into the first controlled acquisition radar linking:

BoatOffer → MarinaOffer → LogisticsOption → RefitPlan → GateAssessment → Scenario → EvaluationSnapshot.

The radar must answer not only “what does the boat cost?” but “what is our walk-away price and does the downside housing case fit the approved budget?”

## Branch

`feat/ilka-value-calculator`

One Result → one active integration branch.

## Approved semantic baseline

- PRODUCT: `ilka.product.boat-value-calculator` v1.0 APPROVED.
- DOMAIN: `ilka.domain.boat-value-calculator` v1.0 APPROVED.
- DECISION: `ilka.decision.economic-baseline` v1.0 APPROVED.
- RESEARCH V2 remains REFERENCE only.

## Scope

1. Use `ARTIFACT_INDEX.json` to resolve the current marina EVIDENCE artifact at runtime instead of hardcoded marina prices.
2. Preserve BoatOffer source/date/comment and price history semantics.
3. Add Cost-to-Habitable and overlap-rent inputs.
4. Split expected resale from quick-sale/downside value.
5. Add selling costs and explicit risk buffer.
6. Add hard gates: legal / structural / logistics / habitability / insurance.
7. Calculate walk-away price and margin of safety.
8. Make hard-gate FAIL produce WALK_AWAY and UNKNOWN produce HOLD before economic scoring.
9. Keep monetization outside the base case.
10. Preserve JSON export/import and existing candidate workflow.

## Acceptance Criteria

- [x] G2 DOMAIN v1.0 approved before implementation.
- [ ] Marina presets are loaded through ARTIFACT_INDEX current pointer, not duplicated in app.js.
- [ ] Candidate records include offer source/date/comment.
- [ ] Cost-to-Habitable includes due diligence, logistics, mandatory refit and overlap housing.
- [ ] Expected resale and quick-sale downside are separated.
- [ ] Walk-away price and margin of safety are visible.
- [ ] Five hard gates are editable and control HOLD/WALK_AWAY.
- [ ] Existing saved state migrates without deleting user candidate data.
- [ ] JS syntax validation passes.
- [ ] Browser smoke flow passes.
- [ ] Evidence of validation is recorded.
- [ ] No production deployment without G7 authorization.

## Evidence

- Git commits on this Result branch.
- `evidence/marina-offers.v0.1.json` (resolved through ARTIFACT_INDEX).
- GitHub issue #2 for raw price/offer/comment intake.
- Validation record to be added after implementation.

## Production impact

None yet. G7 is not authorized.
