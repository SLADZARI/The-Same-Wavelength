const assert=require("assert");
const Core=require("../calculator-core.js");

const settings={rentPLN:3150,budgetUSD:1000,horizonMonths:12,plnPerEur:4.3,usdPerEur:1.15,diyShadowRatePLN:31.4};
const base=()=>({
  purchaseEUR:5000,cabins:2,berths:6,comfortablePeople:6,moveInState:"YES",
  legalGate:"PASS",structuralGate:"PASS",insuranceGate:"PASS",
  localFeasible:true,localLogisticsEUR:100,logisticsImpossible:false,
  selfPropFeasible:false,roadFeasible:false,
  dueDiligenceEUR:400,closingDocsEUR:100,hullRefitEUR:0,mechanicalRefitEUR:0,safetyRefitEUR:0,moveInInteriorEUR:0,initialReserveEUR:500,
  overlapRentMonths:0,yardStorageDuringRefitEUR:0,temporaryHousingEUR:0,
  expectedResaleEUR:7000,quickSaleEUR:5500,sellingCostsEUR:300,riskBufferEUR:500,
  improvements:[],
  marinaMonthlyEUR:150,insuranceMonthlyEUR:45,maintenanceMonthlyEUR:100,electricityMonthlyEUR:50,heatingMonthlyEUR:50,localFuelMonthlyEUR:20,internetMonthlyEUR:20,winterMonthlyEUR:30,miscMonthlyEUR:30,
  hullScore:7,layoutScore:7,propulsionScore:7,comfortScore:7,refitEaseScore:7,energyScore:7,docsScore:7
});

{
  const b=base();
  b.selfPropFeasible=true;b.seaDistanceNm=100;b.cruiseKn=5;b.seaTimeFactor=1;b.fuelBurnLPH=4;b.dieselEUR=2;
  b.roadFeasible=true;b.roadTransportEUR=1500;
  const c=Core.calcCandidate(b,settings);
  assert.equal(c.logistics.selected.mode,"LOCAL","LOCAL must win when it is cheapest feasible mode");
}

{
  const b=base();b.cabins=1;
  const c=Core.calcCandidate(b,settings);
  assert.equal(c.gates.habitability,"FAIL");
  assert.equal(c.decisionState,"WALK_AWAY");
}

{
  const b=base();b.moveInState="UNKNOWN";
  const c=Core.calcCandidate(b,settings);
  assert.equal(c.gates.habitability,"UNKNOWN");
  assert.equal(c.decisionState,"HOLD");
}

{
  const b=base();
  b.improvements=[{cashEUR:500,diyHours:10,upliftEUR:2000}];
  const c=Core.calcCandidate(b,settings);
  const expectedShadow=10*31.4/4.3;
  assert.ok(Math.abs(c.improvements.shadowEUR-expectedShadow)<0.01);
  assert.ok(Math.abs(c.improvements.net-(2000-500-expectedShadow))<0.01);
  assert.equal(c.improvements.perHour,150);
}

{
  const local=base();
  const remote=base();
  remote.localFeasible=false;remote.roadFeasible=true;remote.roadTransportEUR=4000;
  const a=Core.calcCandidate(local,settings);
  const b=Core.calcCandidate(remote,settings);
  assert.ok(a.costToHabitable<b.costToHabitable,"local candidate should benefit from lower logistics");
  assert.ok(a.walkAwayPrice>b.walkAwayPrice,"lower logistics should increase walk-away purchase ceiling");
}

console.log("ILKA calculator-core tests: PASS");
