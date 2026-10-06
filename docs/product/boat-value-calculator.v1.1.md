---
artifactId: ilka.product.boat-value-calculator
project: ILKA Boat Value Calculator
documentType: PRODUCT
projectStage: CLARITY
gate: G1_PRODUCT_LOCK
status: APPROVED
version: 1.1
updated: 2026-10-06
owner: Modern Pilgrims
sourceSystem: GIT
authorityType: APPROVED_AUTHORITY
supersedes: 1.0
---

# ILKA Boat Acquisition Radar — Product

## Audience
Nikita and Zhenya, evaluating boat offers as a replacement for rented housing and as a retained movable asset.

## Primary decision
For any listing from Poland, Germany, Finland or another market, determine whether to:
- reject it immediately;
- hold for missing evidence;
- negotiate only below a calculated walk-away price;
- keep it in the buy zone.

## Hard liveability requirement
A candidate is not a valid housing acquisition unless the intended move-in state provides:
- **at least 2 private cabins** — one for Nikita and one for Zhenya;
- **at least 6 sleeping/comfortable places** including guest accommodation;
- the ability to live aboard immediately after acquisition / delivery.

A finished interior is **not** required. Temporary shore-powered heating, unfinished cosmetic surfaces and later interior work are acceptable if the boat is otherwise safe and usable.

## Economic principle
The system compares **the full path to a usable asset**, not listing price. A more expensive boat already in Gdańsk may beat a cheaper remote boat if the remote candidate creates delivery, crane, preparation, overlap-rent, refit or risk costs.

## Core flow
Source / Evidence
→ BoatCandidate + BoatOffer
→ hard liveability / legal / structural / insurance gates
→ LOCAL / SEA / ROAD logistics
→ mandatory pre-move RefitPlan
→ post-move Improvement Plan
→ MarinaOffer + monthly costs
→ Scenario
→ EvaluationSnapshot
→ ranking / walk-away price / margin of safety
→ Decision

## DIY / improvement economics
Post-purchase work is evaluated as an investment:

`cash spend + DIY shadow cost → expected market-value uplift + owner utility`

The first shadow-rate default is 31.40 PLN/hour and is editable.

The model separately shows:
- cash spent;
- owner hours;
- shadow cost of those hours;
- expected market-value uplift;
- net value creation/loss;
- value created per DIY hour.

Expected uplift is an assumption unless supported by market evidence.

## Required decision surfaces
Ask price / selected logistics and cost / Cost-to-Habitable / immediate move-in and accommodation gate / monthly run-rate / expected and downside housing cost / walk-away price / margin of safety / max price vs rent / improvement value creation / hard-gate state / candidate ranking.

## Evidence / history
BoatOffer price history and MarinaOffer history are retained; newer offers do not overwrite old evidence silently.

## Parser-ready, not parser-dependent
Candidate intake stores source site, URL, observation date, seller type and listing location so marketplace parsers can be added later without changing the acquisition model.

## Non-goals
Automated marketplace scraping; monetization income inside the housing base case; Monte Carlo; production deployment without G7 authorization.
