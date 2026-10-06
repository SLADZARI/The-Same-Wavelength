# ILKA Boat/Home Acquisition Model — Research V2

## Executive premise

The project is not trying to find the cheapest boat. It is trying to buy the **best liveaboard asset for the lowest risk-adjusted housing cost**, while retaining mobility, maritime utility and resale value.

Professional market practice suggests five principles:

1. Deep restoration is usually not a profitable flip. Dealers make money mainly from buying below market, choosing liquid models, correcting obvious defects, cosmetic reconditioning and reducing buyer uncertainty.
2. Purchase price must be separated from **Cost-to-Habitable** and **Cost-to-Liquidate**.
3. Refit spend has unequal resale recovery. Structural/safety/mechanical work protects value; highly custom interiors and hobby labour recover poorly.
4. A cheap old boat can be expensive because of logistics, survey findings, uninsurability, winter/liveaboard limitations and time-to-habitable.
5. The correct comparison with renting is a time-based economic model with opportunity cost and uncertain outcomes, not a one-year cash sum.

---

## 1. Acquisition channels to track

### A. Private/classified
Highest pricing dispersion and best chance of mispriced assets. Highest due-diligence burden.

### B. Brokered boats
Broker provides transaction coordination, comps, paperwork, survey/sea-trial logistics and negotiation. Listing broker represents seller; buyer broker may be paid from seller-side commission.

### C. Dealer / cash-buyer / part-exchange stock
Closest professional analogue to "boat flipping". Dealer buys or trades inventory, reconditions it, carries marina/insurance risk, then resells with a margin. Useful benchmark: their trade bid is an estimate of a boat's wholesale/liquidation value.

### D. Auctions / forced sales / repossessions
Potentially strong purchase discounts but higher inspection, title, removal-deadline and logistics risk.

### E. Salvage / project boats
Must be priced against disposal/exit cost first. A zero-price hull is not a zero-cost acquisition.

Fields:
- acquisition_channel
- seller_type
- listing_age_days
- removal_deadline_days
- auction_buyer_premium
- deposit_required
- berth_transferable
- title_quality

---

## 2. Hard gates before scoring

Weighted scores should not rescue a fundamentally bad candidate.

### Legal/title gate
- seller authority to sell
- registration/title chain
- lien/mortgage release
- VAT/Union status where relevant
- CE/RCD documentation if relevant
- ability to register/insure in intended use

### Structural gate
- hull condition
- steel thickness / corrosion map where applicable
- through-hulls / seacocks
- tanks
- steering/rudder
- shaft/prop/running gear
- water ingress / structural repairs

### Logistics gate
At least one feasible route:
- self-propelled delivery,
- tow,
- road transport,
- commercial ship/freight.

### Habitability gate
- two genuinely private sleeping zones achievable
- standing headroom target
- heating/insulation path
- sanitation
- shore power / electrical safety
- liveaboard berth feasible

### Insurance gate
- underwriter willing to quote, or explicit cost/risk penalty
- survey recommendations required by insurer are costed

Any failed gate should produce HOLD / WALK AWAY rather than merely a lower score.

---

## 3. Transaction cost stack

Add to acquisition cost:
- buyer inspection travel
- pre-purchase survey
- haul/short-haul
- pressure wash
- engine specialist
- oil analysis
- rigging inspection if relevant
- document/VAT/legal review
- registration/flag change
- currency/transfer fees
- broker/auction buyer fees where applicable
- temporary berth/storage before delivery
- refundable/non-refundable deposit risk

Create:
**Acquisition Cost = Purchase + Due Diligence + Closing/Documentation**

Do not bury due diligence inside generic refit.

---

## 4. Logistics model V2

### Self-propelled
- route_nm
- planned_speed_kn
- engine_hours
- fuel_burn_lph
- fuel_price_by_leg
- canal/lock fees
- marina/harbour stops
- crew travel
- paid skipper/crew if needed
- food
- tow contingency
- weather delay days
- temporary accommodation if vessel cannot be slept aboard
- preparation work
- spare parts / filters / fluids
- destination haul/launch if needed

### Road
- route_km
- hull dimensions
- transport height on low-loader
- weight
- permits
- escort class
- route survey
- lifting at origin
- lifting at destination
- dismantling/removal of mast/arch/rails
- cradle/blocking
- waiting/storage
- reassembly
- damage insurance
- contingency

### Tow / third mode
We currently omit towing. Add as a third logistics mode for non-running boats near coast/canals.

Output:
- cheapest feasible mode
- fastest feasible mode
- P50 cost
- P90 cost
- logistics cost as % of post-refit market value

---

## 5. Time-to-habitable

This is a major missing economic variable.

If the boat needs 3 months before living aboard, the owners may pay:
- apartment rent,
- marina/yard/storage,
- repair costs

at the same time.

Fields:
- months_to_habitable
- overlapping_rent_months
- yard_storage_during_refit
- temporary_accommodation

Output:
**Cost-to-Habitable = Acquisition + Logistics + Mandatory Refit + Overlap Housing**

This should become a primary KPI.

---

## 6. Refit accounting: do not treat all spend equally

Classify every refit line into:

### A. Safety / compliance
Examples: seacocks, fuel leaks, fire safety, wiring hazards.
Recovery at resale: protects saleability; not an "upgrade premium".

### B. Structural integrity
Steel replacement, tank remediation, bulkheads, deck core.
Recovery: prevents value destruction but rarely returns 100%.

### C. Machinery / systems
Engine overhaul/repower, gearbox, charging, heating, plumbing.
Usually strongest marketability/value protection when documented.

### D. Efficiency
Insulation, solar, batteries, heating efficiency.
Value to ILKA may be high even if market recovery is moderate.

### E. Cosmetic / marketability
Paint, polishing, upholstery, clean interior.
Can produce high return per euro when starting from neglected-but-sound condition.

### F. Personal/custom
Bespoke interiors and unusual conversions.
Potentially high utility to us but low resale recovery and smaller buyer pool.

For each line:
- cost
- DIY labour hours
- external labour
- category
- mandatory_before_move_in
- useful_life_years
- expected_recovery_pct
- documentation_quality

Calculate:
**Recovered Refit Value = Σ(cost × recovery coefficient)**

and separately:
**Personal Utility Spend = refit spend not expected to be recovered**

DIY labour must have an optional shadow hourly rate even if cash cost is zero.

---

## 7. Lifecycle CAPEX schedule

A flat "10% maintenance" field is not enough.

Track major components by:
- current age
- estimated remaining life
- replacement cost
- annual failure probability / planned year

Suggested components:
- engine
- gearbox
- shaft/cutlass/seal
- prop/rudder
- fuel tanks
- freshwater/blackwater tanks
- batteries
- charger/inverter
- solar
- shore-power system
- heating
- refrigeration
- pumps
- toilet/holding tank
- electronics/navigation
- hull coating/antifouling/anodes
- steel repair/corrosion
- windows/hatches/seals
- rig/sails if applicable

Output:
- routine OPEX
- scheduled CAPEX
- emergency reserve
- 1/3/5-year maintenance cliffs

---

## 8. Winter liveaboard model

For northern Europe, add:
- shore-power amperage limit
- electricity price/kWh
- heating source
- estimated kWh/month by winter month
- diesel/LPG heating fuel
- insulation score
- dehumidifier consumption
- ventilation
- water availability in winter
- shower/WC/laundry fees
- pump-out/waste
- freeze risk / plumbing winterization
- condensation/mould remediation reserve

Marina quote should have:
- liveaboard_allowed
- winter_water
- shore_power
- shower
- toilet
- laundry
- kitchen
- access_hours
- tariff_valid_until
- quote_for_LOA
- transferable_to_other_boat_length
- source_date

---

## 9. Insurance and insurability

Older/metal boats may require surveys and close-out of recommendations.

Fields:
- quoted_premium
- deductible
- navigation_area
- liveaboard_covered
- commercial_use_excluded
- survey_required
- outstanding_recommendation_cost
- agreed_value
- insurer_quote_expiry

Use a gate if no realistic insurance is available for required use.

---

## 10. Legal / conversion risk

EU Recreational Craft Directive 2013/53/EU applies to major craft conversions and major engine modifications. Changing the means of propulsion can qualify as a major craft conversion and may trigger post-construction assessment before placing into service/market.

Therefore electric repower must include:
- engineering/design
- stability/weight impact
- electrical compliance
- potential conformity/PCA cost
- documentation
- insurer acceptance

Do not score "electric conversion potential" only as hardware cost.

---

## 11. Resale and liquidity model

Boat value is market-comparable driven, not purchase-price-plus-refit.

Add:
- comparable asking prices
- estimated real transaction discount
- market segment / builder recognition
- days on market
- seasonality
- selling location
- buyer pool size
- custom-conversion penalty
- documented-refit premium
- broker selling commission
- haul/clean/photo/listing prep
- relocation-to-market cost
- months-to-sell carrying cost

Three values:
1. **Retail Market Value**
2. **Quick-Sale Value**
3. **Dealer/Wholesale Value**

Net liquidation:
**Net Sale Proceeds = Sale Price - Broker/auction fees - Sale Prep - Carrying Cost During Sale - Relocation**

Use quick-sale value for downside/risk calculations.

---

## 12. Opportunity cost and alternative housing

The current rent-vs-boat model should become monthly and time-based.

Track:
- apartment rent
- utility differences
- rent inflation
- cash tied in boat
- alternative return on that cash
- recovered resale proceeds
- selling costs
- move-in delay
- expected ownership horizon

Primary economic output:
**Equivalent Housing Cost / month**

This is better than simple ROI.

Secondary:
- savings vs renting
- net asset value after N years
- break-even month
- maximum bid price

---

## 13. Uncertainty: move from one answer to a probability

Borrow from modern rent-vs-buy models.

Create Low / Base / High distributions for:
- refit surprise
- resale value
- marina cost
- fuel
- logistics
- time-to-habitable
- annual maintenance
- selling time
- major component failure

Run Monte Carlo (e.g. 1,000 scenarios).

Outputs:
- P10 / P50 / P90 Cost-to-Habitable
- P10 / P50 / P90 first-year cash burn
- probability monthly budget <= target
- probability boat beats rent by year 1 / 3 / 5
- probability emergency reserve is exhausted
- probability of positive net liquidation value

Also create a sensitivity/tornado chart: which assumption changes the decision most?

---

## 14. Bid / negotiation engine

The calculator should output a **walk-away price**, not just a score.

Suggested formula concept:

Target Max Bid =
Target Economic Budget
+ Expected Net Resale
- Due Diligence
- Logistics
- Mandatory Refit
- Ownership Costs over Horizon
- Selling Costs
- Risk Buffer
- Opportunity Cost Adjustment

Also show:
- seller ask
- target offer
- max bid
- margin of safety
- survey-renegotiation reserve

Survey findings should update the max bid automatically.

---

## 15. Monetization must remain a separate module

Do not use speculative charter/content/event income to make an otherwise bad housing acquisition look good.

First require the boat to pass **Housing Base Case with zero monetization**.

Then optional commercial scenarios:
- short stays / accommodation
- charter
- experiences/events
- content/media
- workspace/studio

For each:
- legal/commercial coding
- marina permission
- insurance
- tax
- platform commission
- cleaning/turnover
- additional wear
- occupancy/utilization
- seasonality
- incremental capex
- probability-weighted revenue

Output:
**Incremental Contribution**, not gross revenue.

---

## 16. Score architecture V2

Separate:

### Gates
Legal / structural / logistics / habitability / insurance.

### Objective economics
Cost-to-Habitable, monthly run-rate, P90 downside, net liquidation, break-even.

### Utility score
- two private cabins
- standing headroom
- workspace
- storage
- deck/roof
- seaworthiness
- mobility
- solar potential

### Liquidity score
- model recognition
- market comps
- standard systems
- documented refit
- buyer pool
- time-to-sale

Do not allow subjective utility score to hide a poor downside case.

---

## 17. Professional benchmarks found in research

### Dealers / buy-refurbish-resell
European dealers such as Boats.co.uk explicitly use cash purchase / part exchange / reconditioning / resale. Their business model reinforces:
- buy below retail,
- value condition before purchase,
- minimise carry time,
- refurbish selectively,
- sell into a known buyer pool.

### Brokers
Broker value is strongest in comps, transaction history, documents, negotiation, survey/sea-trial coordination and closing. Asking prices alone are not sufficient.

### Auctions/liquidations
YachtBid and forced-sale/liquidation markets can be acquisition channels, but need removal deadlines, buyer fees, title/VAT and survey/logistics risk in the model.

### Flipper/forum consensus
Deep restoration usually fails as a pure financial flip. Cosmetic correction and fixing a small number of obvious mechanical/safety blockers on a sound, popular hull is much more plausible.

---

## 18. Open-source patterns worth borrowing

### swhitt/breakeven
Useful ideas:
- monthly simulation
- time value of money
- initial / recurring / opportunity / sale buckets
- explicit break-even rent and break-even year
- transparent calculation engine
- sensitivity to a single key assumption

### kelb777/rent-vs-buy-calculator
Useful ideas:
- Monte Carlo
- percentile bands
- probability that one choice wins
- year-by-year table
- scenario distributions

### kapil433/TCO-Calculator
Useful ideas:
- separate reference-data layer from calculation engine
- compare multiple candidates
- update live external inputs independently
- backend service architecture when the dataset grows

No mature open-source boat-specific project was found that combines acquisition, refit, logistics, liveaboard housing replacement and resale in one model. That gap is exactly where ILKA can be distinctive.

---

## 19. V2 priority order

### P0 — before evaluating more boats
1. Cost-to-Habitable
2. time-to-habitable / overlap rent
3. survey/due-diligence costs
4. three resale values: retail / quick-sale / wholesale
5. selling costs
6. refit categories + recovery %
7. mandatory gates
8. max-bid / walk-away price

### P1
9. lifecycle CAPEX
10. winter liveaboard energy
11. insurer/survey requirements
12. tow as third logistics mode
13. marina scenario records with source/date

### P2
14. Monte Carlo
15. sensitivity chart
16. 1/3/5-year comparison
17. opportunity cost / discounting

### P3
18. monetization scenarios
19. commercial-regulatory impacts
20. actual-vs-budget expense ledger
