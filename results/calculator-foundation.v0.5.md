---
artifactId: ilka.result.calculator-foundation
project: ILKA Boat Value Calculator
documentType: RESULT
projectStage: BUILD
gate: G6_VALIDATION
status: REVIEW
version: 0.5
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: IMPLEMENTATION_AUTHORITY
supersedes: 0.4
---

# Result — Boat Acquisition Radar v1 · Decision Cockpit UI

## Goal
Turn the approved acquisition model into a fast decision interface for real boat listings without changing approved Product/Domain semantics.

## Branch
`feat/ilka-value-calculator`

## Approved semantic baseline
- PRODUCT v1.1 APPROVED.
- DOMAIN v1.2 APPROVED.
- Economic baseline v1.0 APPROVED.
- Change Proposal `ilka.change-proposal.acquisition-radar-liveability` v1.0 APPROVED.

## Interface iteration implemented
1. Replaced the wide portfolio table as the primary navigation with a shortlist rail of candidate cards.
2. Added filters: All / Strong / HOLD / Reject.
3. Candidate card now exposes decision, ask, walk-away, margin, accommodation and selected logistics at a glance.
4. Added a persistent center editor for the selected candidate; existing input fields and state meanings are preserved.
5. Added a compact liveability snapshot above the editor: cabins / berths / comfortable people / move-in / material / dimensions.
6. Added direct listing link when a source URL exists.
7. Kept the Decision Engine as a persistent right rail.
8. Added explicit human-readable decision reasons for FAIL / UNKNOWN hard gates and economic blockers.
9. Reduced the primary decision metrics to walk-away, margin, cost-to-habitable, downside/month, run-rate, logistics, quick-sale and DIY value.
10. Moved quality radar and formula explanation into secondary disclosure panels.
11. Preserved localStorage migration, marina EVIDENCE lookup, improvements and all approved calculation formulas.

## Acceptance Criteria
- [x] No approved Product/Domain meaning changed.
- [x] Existing candidate fields remain editable.
- [x] Hard gates remain stronger than quality score.
- [x] Candidate shortlist exposes reject / hold / negotiate / buy-state quickly.
- [x] Decision reason text derives from existing gate/economic outputs.
- [x] Existing calculation core unchanged.
- [ ] Browser smoke of redesigned cockpit passes.
- [ ] Visual/mobile acceptance evidence captured.
- [x] No production deployment performed.

## Validation status
Previous deterministic calculation evidence remains applicable to `calculator-core.js`, which was not changed in this UI iteration.

Current static validation after the cockpit rewrite:
- PASS — `app.js` compiles with ECMAScript Function syntax compilation.
- PASS — `calculator-core.js` compiles with ECMAScript Function syntax compilation.
- PASS — 27 explicit `#id` references from `app.js` resolve to elements in the current `index.html`.
- OPEN — real browser interaction smoke.
- OPEN — responsive / visual acceptance.

A preview deployment attempt on 2026-10-06 was blocked by connected Vercel account permissions to create a project; this is an environment/permission limitation, not validation evidence for or against the UI.

## Production impact
None. PR remains draft. G7 is not authorized.

## Current gate conclusion
G6_VALIDATION remains OPEN. The interface is ready for review, but the Result is not Done until the redesigned cockpit is exercised in a real browser and evidence is recorded.
