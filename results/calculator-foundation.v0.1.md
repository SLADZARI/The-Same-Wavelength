---
artifactId: ilka.result.calculator-foundation
project: ILKA Boat Value Calculator
documentType: RESULT
projectStage: BUILD
gate: G2_DOMAIN_LOCK
status: SUPERSEDED
version: 0.1
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: HISTORY
supersedes: —
supersededBy: 0.2
---

# Result — Calculator foundation and evidence intake

## Goal

Bring the existing ILKA calculator under MP_DSL without replacing the working implementation, and establish a durable path for boat offers, marina quotes, price history and comments.

## Branch

`feat/ilka-value-calculator`

This existing branch is retained as the single active integration branch for this Result.

## Existing implementation preserved

- `index.html`
- `app.js`
- `styles.css`
- existing calculations for logistics, refit, run-rate, rent comparison, purchase ceilings and radar scoring
- existing Tamka and Sienna Grobla marina presets

## Acceptance Criteria

- [x] Existing implementation reused instead of duplicated.
- [x] `PROJECT.json`, `ARTIFACT_INDEX.json`, `APPROVED_STATE.json` created.
- [x] Product purpose recorded as current approved baseline.
- [x] Budget/housing baseline recorded as explicit DECISION.
- [x] Project DOMAIN captured as DRAFT for review rather than silently assumed.
- [x] Verified marina replies normalized into Git EVIDENCE without private email bodies/contact details.
- [x] Canonical GitHub EVIDENCE intake issue created (#2).
- [ ] DOMAIN review / G2 decision.
- [ ] Browser flow validation against the new durable evidence model.
- [ ] G6 validation evidence.
- [ ] Release authorization.

## Affected Domain

BoatCandidate / BoatOffer / MarinaOffer / CostItem / Scenario / EvaluationSnapshot / EvidenceRef.

## Evidence

- Git branch history for `feat/ilka-value-calculator`.
- GitHub issue #2 for raw offer/price/comment intake.
- `evidence/marina-offers.v0.1.json` for normalized source-backed marina facts.
- Existing calculator implementation files are intentionally unchanged by this harmonization commit.

## Production impact

None. No production deployment is authorized by this Result.

## Gate note

Current controlling gate: **G2_DOMAIN_LOCK**. Implementation already existed before the Project Kernel and is preserved as historical/current implementation evidence inside this migration Result. Further semantic expansion should wait for DOMAIN review; G5 implementation expansion, G6 validation and G7 release remain open.
