---
artifactId: ilka.result.calculator-foundation
project: ILKA Boat Value Calculator
documentType: RESULT
projectStage: BUILD
gate: G5_BUILD
status: REVIEW
version: 0.4
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: IMPLEMENTATION_AUTHORITY
supersedes: 0.3
---

# Result — Boat Acquisition Radar v1

## Goal
Turn the existing calculator into a practical listing-selection radar for candidates from Poland, Germany, Finland and other markets.

## Branch
`feat/ilka-value-calculator`

## Approved semantic baseline
- PRODUCT v1.1 APPROVED.
- DOMAIN v1.2 APPROVED.
- Economic baseline v1.0 APPROVED.
- Change Proposal `ilka.change-proposal.acquisition-radar-liveability` v1.0 APPROVED.

## Implemented scope
1. Candidate/source intake: site, URL, date, seller type, location, ask.
2. Hard accommodation screen: >=2 private cabins, >=6 berths, >=6 comfortable people, move-in YES.
3. LOCAL / SEA / ROAD logistics with cheapest feasible option.
4. Mandatory pre-move refit separated from later improvements.
5. Improvement list with cash spend, DIY hours and expected market uplift.
6. Editable DIY shadow rate; default 31.40 PLN/hour.
7. Expected resale and quick-sale downside.
8. Walk-away price and margin of safety.
9. Portfolio ranking optimized for reject / hold / negotiate / buy-zone.
10. Marina quotes resolved through ARTIFACT_INDEX current EVIDENCE pointer.
11. Backward-compatible migration of existing localStorage candidates.
12. Parser-ready listing metadata; scraping deferred.
13. Calculation engine separated into `calculator-core.js` for deterministic testing.

## Acceptance Criteria
- [x] Product/domain change explicitly approved before implementation.
- [x] Compatible localStorage migration implemented without intentionally dropping existing candidate fields.
- [x] Candidate can represent local Poland/Gdańsk logistics without fake Hamburg assumptions.
- [x] Habitability blocks <2 cabins, <6 berths, <6 comfortable people or move-in NO.
- [x] DIY hours contribute editable shadow economic cost.
- [x] Improvement value creation/loss is visible.
- [x] Walk-away price and margin are visible in portfolio and detail.
- [x] Marina evidence is runtime-loaded from current ARTIFACT_INDEX pointer.
- [x] JS syntax validation passes.
- [x] Calculation tests cover LOCAL/SEA/ROAD, hard gates and DIY economics.
- [ ] Browser smoke flow passes.
- [x] No production deployment performed.

## Validation
See `ilka.report.acquisition-radar-validation` v0.1.

## Production impact
None. G7 is not authorized.

## Current gate conclusion
Implementation is complete enough for browser validation, but the Result is not Done and is not release-ready until browser smoke evidence exists.
