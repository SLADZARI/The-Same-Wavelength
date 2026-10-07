const assert=require("assert");
const Core=require("../calculator-core.js");

const settings={rentPLN:3150,budgetUSD:1000,horizonMonths:12,plnPerEur:4.3,usdPerEur:1.15,diyShadowRatePLN:31.4};
const offer=()=>({
  offerId:"o1",candidateId:"b1",observedAt:"2026-10-06",priceType:"ASK",
  amount:5000,currency:"EUR",buyerPremium:null,taxFees:[],derivedAllInPrice:5000,status:"OBSERVED"
});
const base=()=>({
  id:"b1",cabins:2,berths:6,comfortablePeople:6,moveInState:"YES",
  legalGate:"PASS",structuralGate:"PASS",insuranceGate:"PASS",
  localFeasibility:"PASS",localLogisticsEUR:100,localLogisticsEvidence:"QUOTE",
  seaFeasibility:"FAIL",roadFeasibility:"FAIL",towFeasibility:"FAIL",logisticsImpossible:false,
  dueDiligenceEUR:400,dueDiligenceEvidence:"ESTIMATE",
  closingDocsEUR:100,closingDocsEvidence:"ESTIMATE",
  hullRefitEUR:0,hullRefitEvidence:"ESTIMATE",
  mechanicalRefitEUR:0,mechanicalRefitEvidence:"ESTIMATE",
  safetyRefitEUR:0,safetyRefitEvidence:"ESTIMATE",
  moveInInteriorEUR:0,moveInInteriorEvidence:"ESTIMATE",
  emergencyReserveEUR:500,
  overlapRentMonths:0,yardStorageDuringRefitEUR:0,temporaryHousingEUR:0,
  expectedResaleEUR:7000,expectedResaleEvidence:"ESTIMATE",
  quickSaleEUR:5500,quickSaleEvidence:"ESTIMATE",
  sellingCostsEUR:300,sellingCostsEvidence:"ESTIMATE",riskBufferEUR:500,
  improvements:[],
  marinaMonthlyEUR:150,marinaMonthlyEvidence:"QUOTE",
  insuranceMonthlyEUR:45,insuranceMonthlyEvidence:"QUOTE",
  maintenanceMonthlyEUR:100,electricityMonthlyEUR:50,heatingMonthlyEUR:50,localFuelMonthlyEUR:20,internetMonthlyEUR:20,winterMonthlyEUR:30,miscMonthlyEUR:30,
  hullScore:7,layoutScore:7,propulsionScore:7,comfortScore:7,refitEaseScore:7,energyScore:7,docsScore:7
});

{
  const b=base();
  b.seaFeasibility="PASS";b.seaDistanceNm=100;b.cruiseKn=5;b.seaTimeFactor=1;b.fuelBurnLPH=4;b.fuelBurnEvidence="ESTIMATE";b.dieselEUR=2;
  b.roadFeasibility="PASS";b.roadTransportEUR=1500;b.roadTransportEvidence="QUOTE";b.loadingCraneEUR=100;b.loadingCraneEvidence="QUOTE";b.unloadingCraneEUR=100;b.unloadingCraneEvidence="QUOTE";
  const c=Core.calcCandidate(b,settings,offer());
  assert.equal(c.logistics.selected.mode,"LOCAL","LOCAL must win when it is cheapest complete feasible mode");
}

{
  const b=base();b.cabins=1;
  const c=Core.calcCandidate(b,settings,offer());
  assert.equal(c.gates.habitability,"FAIL");
  assert.equal(c.decisionState,"WALK_AWAY");
}

{
  const b=base();b.moveInState="UNKNOWN";
  const c=Core.calcCandidate(b,settings,offer());
  assert.equal(c.gates.habitability,"UNKNOWN");
  assert.equal(c.decisionState,"HOLD");
}

{
  const b=base();
  b.improvements=[{cashEUR:500,diyHours:10,upliftEUR:2000}];
  const c=Core.calcCandidate(b,settings,offer());
  const expectedShadow=10*31.4/4.3;
  assert.ok(Math.abs(c.improvements.shadowEUR-expectedShadow)<0.01);
  assert.ok(Math.abs(c.improvements.net-(2000-500-expectedShadow))<0.01);
  assert.equal(c.improvements.perHour,150);
}

{
  const local=base();
  const remote=base();
  remote.localFeasibility="FAIL";remote.roadFeasibility="PASS";remote.roadTransportEUR=4000;remote.roadTransportEvidence="QUOTE";remote.loadingCraneEUR=200;remote.loadingCraneEvidence="QUOTE";remote.unloadingCraneEUR=200;remote.unloadingCraneEvidence="QUOTE";
  const a=Core.calcCandidate(local,settings,offer());
  const b=Core.calcCandidate(remote,settings,offer());
  assert.ok(a.costToHabitable<b.costToHabitable,"local candidate should benefit from lower logistics");
  assert.ok(a.walkAwayPrice>b.walkAwayPrice,"lower logistics should increase walk-away purchase ceiling");
}

{
  const deAlm={
    amount:5750,currency:"EUR",priceType:"BID",
    buyerPremium:{ratePct:18},
    taxFees:[{label:"VAT on premium",ratePct:21,base:"PREMIUM"}]
  };
  const e=Core.offerEconomics(deAlm,settings);
  assert.ok(Math.abs(e.allInEUR-7002.35)<0.01,"De Alm bid must become 7002.35 EUR all-in");
}

{
  const anka={amount:46500,currency:"PLN",priceType:"ASK",buyerPremium:null,taxFees:[],derivedAllInPrice:46500};
  const e=Core.offerEconomics(anka,settings);
  assert.ok(Math.abs(e.allInEUR-(46500/4.3))<0.01,"ANKA PLN ask must convert using scenario PLN/EUR");
}

{
  const incompleteAuction={
    amount:10000,currency:"EUR",priceType:"BID",
    buyerPremium:{ratePct:12.5,evidenceState:"QUOTE"},
    taxFees:[{label:"VAT treatment",amount:null,ratePct:null,evidenceState:"UNKNOWN"}],
    derivedAllInPrice:null
  };
  const e=Core.offerEconomics(incompleteAuction,settings);
  assert.equal(e.allInEUR,null,"Incomplete auction tax/fee structure must keep all-in UNKNOWN");
  assert.equal(e.conversionKnown,false);
}

{
  const b=base();
  b.insuranceMonthlyEvidence="UNKNOWN";
  const c=Core.calcCandidate(b,settings,offer());
  assert.equal(c.evidenceGate,"UNKNOWN");
  assert.equal(c.decisionState,"HOLD");
  assert.ok(c.evidenceUnknowns.includes("insurance cost"));
}

{
  const a=base();a.emergencyReserveEUR=500;
  const b=base();b.emergencyReserveEUR=5000;
  const ca=Core.calcCandidate(a,settings,offer());
  const cb=Core.calcCandidate(b,settings,offer());
  assert.equal(ca.costToHabitable,cb.costToHabitable,"reserve must not increase Cost-to-Habitable");
  assert.equal(ca.economicCost,cb.economicCost,"reserve must not increase economic cost while unspent");
  assert.equal(cb.cashRequired-ca.cashRequired,4500,"reserve must increase Cash Required");
}

{
  const b=base();
  b.localFeasibility="FAIL";b.roadFeasibility="PASS";b.roadTransportEUR=1200;b.roadTransportEvidence="UNKNOWN";
  b.loadingCraneEUR=100;b.loadingCraneEvidence="QUOTE";b.unloadingCraneEUR=100;b.unloadingCraneEvidence="QUOTE";
  const c=Core.calcCandidate(b,settings,offer());
  assert.equal(c.gates.logistics,"UNKNOWN");
  assert.equal(c.decisionState,"HOLD");
}

{
  const b=base();
  b.localFeasibility="FAIL";b.towFeasibility="PASS";b.towCostEUR=600;b.towCostEvidence="QUOTE";
  const c=Core.calcCandidate(b,settings,offer());
  assert.equal(c.logistics.selected.mode,"TOW");
  assert.equal(c.gates.logistics,"PASS");
}

console.log("ILKA calculator-core tests: PASS");
