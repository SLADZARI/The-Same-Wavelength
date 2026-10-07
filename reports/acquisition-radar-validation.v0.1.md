---
artifactId: ilka.report.acquisition-radar-validation
project: ILKA Boat Value Calculator
documentType: REPORT
projectStage: BUILD
gate: G6_VALIDATION
status: REVIEW
version: 0.1
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: EVIDENCE
supersedes: —
---

# Acquisition Radar v1 — Validation Record

## Scope

Validation evidence for the current G5 implementation on `feat/ilka-value-calculator`.

## Passed

### JS syntax
- `node --check calculator-core.js` — PASS.
- `node --check app.js` — PASS.

### Calculation tests
`node tests/calculator-core.test.js` — **PASS**.

Covered scenarios:
1. LOCAL / SEA / ROAD selection chooses the cheapest feasible option.
2. Fewer than 2 private cabins fails habitability and produces WALK_AWAY.
3. UNKNOWN move-in state produces HOLD.
4. DIY shadow cost uses editable PLN/hour rate and is included in net improvement economics.
5. Lower local logistics reduces Cost-to-Habitable and increases the allowable purchase ceiling versus a remote ROAD scenario.

### Authority / implementation alignment
- PRODUCT v1.1 explicitly requires two private cabins, six-person accommodation and immediate move-in.
- DOMAIN v1.2 explicitly requires:
  `moveInPossible = YES AND privateCabins >= 2 AND berths >= 6 AND comfortablePeople >= 6`.
- Runtime calculation core implements the same threshold.
- Marina runtime data is resolved via `ARTIFACT_INDEX.json` current pointer rather than duplicated marina prices in `app.js`.

## Not yet evidenced

### Browser smoke
NOT PASSED / NOT FAILED.

The available headless Chromium process in the execution environment hangs even for a trivial blank/data HTML page because of the container/system browser environment. This is not evidence of an application failure, but it also cannot be treated as browser PASS.

Required next validation:
- open through HTTP rather than `file://`;
- confirm initial render;
- add/edit candidate;
- confirm hard-gate state transitions;
- confirm improvement row calculations;
- confirm marina EVIDENCE loads through ARTIFACT_INDEX;
- export/import JSON;
- confirm responsive/mobile layout.

## Gate conclusion

**G6 is not PASSED.**

Calculation-layer evidence is positive; browser acceptance remains required before release consideration.
