---
artifactId: ilka.result.calculator-foundation
project: ILKA Boat Value Calculator
documentType: RESULT
projectStage: BUILD
gate: G5_BUILD
status: DRAFT
version: 0.3
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: IMPLEMENTATION_AUTHORITY
supersedes: 0.2
---

# Result — Boat Acquisition Radar v1

## Goal
Turn the existing calculator into a practical listing-selection radar for candidates from Poland, Germany, Finland and other markets.

## Branch
`feat/ilka-value-calculator`

## Approved semantic baseline
- PRODUCT v1.1 APPROVED.
- DOMAIN v1.1 APPROVED.
- Economic baseline v1.0 APPROVED.
- Change Proposal `ilka.change-proposal.acquisition-radar-liveability` v1.0 APPROVED.

## Scope
1. Candidate/source intake: site, URL, date, seller type, location, ask.
2. Hard accommodation screen: 2 private cabins, >=6 berths, move-in possible.
3. LOCAL / SEA / ROAD logistics with cheapest feasible option.
4. Mandatory pre-move refit separated from later improvements.
5. Improvement list with cash spend, DIY hours and expected market uplift.
6. Editable DIY shadow rate; default 31.40 PLN/hour.
7. Expected resale and quick-sale downside.
8. Walk-away price and margin of safety.
9. Ranking table optimized for reject / hold / negotiate / buy-zone.
10. Marina quotes loaded through ARTIFACT_INDEX current EVIDENCE pointer.
11. Backward-compatible migration of existing localStorage candidates.
12. Parser-ready listing metadata; scraping deferred.

## Acceptance Criteria
- [x] Product/domain change explicitly approved before implementation.
- [ ] Existing saved candidates migrate without loss.
- [ ] Candidate can represent Poland/local delivery without fake Hamburg logistics.
- [ ] Habitability blocks <2 cabins, <6 berths or move-in NO.
- [ ] DIY hours contribute shadow economic cost.
- [ ] Improvement value creation is visible.
- [ ] Walk-away price and margin are visible in portfolio and detail.
- [ ] Marina evidence is runtime-loaded from current pointer.
- [ ] JS syntax validation passes.
- [ ] Calculation tests cover LOCAL vs SEA vs ROAD, hard gates and DIY economics.
- [ ] Browser smoke flow passes.
- [ ] No production deployment without G7 authorization.

## Production impact
None. G7 not authorized.
