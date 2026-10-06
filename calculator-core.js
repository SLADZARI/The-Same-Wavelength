(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined" && module.exports) module.exports=api;
  root.ILKACore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  const scoreDefs=[
    ["hullScore",25],["layoutScore",20],["propulsionScore",15],["comfortScore",15],
    ["refitEaseScore",10],["energyScore",5],["docsScore",10]
  ];
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const normGate=v=>["PASS","FAIL","UNKNOWN"].includes(v)?v:"UNKNOWN";

  function habitabilityGate(b){
    const move=(b.moveInState||"UNKNOWN").toUpperCase();
    const cabins=num(b.cabins);
    const berths=num(b.berths);
    const comfortable=num(b.comfortablePeople);
    if(move==="NO") return "FAIL";
    if(cabins>0 && cabins<2) return "FAIL";
    if(berths>0 && berths<6) return "FAIL";
    if(comfortable>0 && comfortable<6) return "FAIL";
    if(move!=="YES" || cabins===0 || berths===0 || comfortable===0) return "UNKNOWN";
    return "PASS";
  }

  function logistics(b){
    const options=[];
    if(b.localFeasible) options.push({mode:"LOCAL",cost:num(b.localLogisticsEUR),detail:"локальная доставка / перегон"});
    if(b.selfPropFeasible){
      const speed=Math.max(num(b.cruiseKn),0.1);
      const hours=num(b.seaDistanceNm)/speed*Math.max(num(b.seaTimeFactor),1);
      const fuelLitres=hours*num(b.fuelBurnLPH);
      const fuel=fuelLitres*num(b.dieselEUR);
      const cost=fuel+num(b.canalFeesEUR)+num(b.enRouteMarinasEUR)+num(b.crewFoodEUR)+num(b.crewTravelEUR)+num(b.seaPrepEUR)+num(b.seaContingencyEUR);
      options.push({mode:"SEA",cost,hours,fuelLitres,detail:"своим ходом"});
    }
    if(b.roadFeasible){
      const cost=num(b.roadTransportEUR)+num(b.loadingCraneEUR)+num(b.unloadingCraneEUR)+num(b.permitsEscortEUR)+num(b.roadPrepEUR)+num(b.roadContingencyEUR);
      options.push({mode:"ROAD",cost,detail:"автотранспорт"});
    }
    options.sort((a,z)=>a.cost-z.cost);
    const selected=options[0]||null;
    const gate=b.logisticsImpossible?"FAIL":(selected?"PASS":"UNKNOWN");
    return {options,selected,gate};
  }

  function improvementTotals(b,s){
    const items=Array.isArray(b.improvements)?b.improvements:[];
    const cash=items.reduce((a,x)=>a+num(x.cashEUR),0);
    const hours=items.reduce((a,x)=>a+num(x.diyHours),0);
    const uplift=items.reduce((a,x)=>a+num(x.upliftEUR),0);
    const plnPerEur=Math.max(num(s.plnPerEur),0.01);
    const shadowRatePLN=num(s.diyShadowRatePLN);
    const shadowEUR=hours*shadowRatePLN/plnPerEur;
    const net=uplift-cash-shadowEUR;
    const perHour=hours>0?(uplift-cash)/hours:0;
    return {cash,hours,uplift,shadowEUR,net,perHour};
  }

  function calcCandidate(b,s){
    const months=Math.max(num(s.horizonMonths),1);
    const plnPerEur=Math.max(num(s.plnPerEur),0.01);
    const usdPerEur=Math.max(num(s.usdPerEur),0.01);
    const rentEUR=num(s.rentPLN)/plnPerEur;
    const budgetEUR=num(s.budgetUSD)/usdPerEur;
    const log=logistics(b);
    const habitability=habitabilityGate(b);
    const gates={
      legal:normGate(b.legalGate),
      structural:normGate(b.structuralGate),
      logistics:log.gate,
      habitability,
      insurance:normGate(b.insuranceGate)
    };
    const gateValues=Object.values(gates);
    const decisionState=gateValues.includes("FAIL")?"WALK_AWAY":(gateValues.includes("UNKNOWN")?"HOLD":"ECONOMIC_EVAL");

    const dueDiligence=num(b.dueDiligenceEUR ?? b.surveyDocsEUR);
    const closingDocs=num(b.closingDocsEUR);
    const mandatoryRefit=
      num(b.hullRefitEUR)+num(b.mechanicalRefitEUR)+num(b.safetyRefitEUR)+
      num(b.moveInInteriorEUR)+num(b.initialReserveEUR);
    const overlapHousing=rentEUR*num(b.overlapRentMonths)+num(b.temporaryHousingEUR)+num(b.yardStorageDuringRefitEUR);
    const logisticsCost=log.selected?log.selected.cost:0;
    const purchase=num(b.purchaseEUR);
    const costToHabitable=purchase+dueDiligence+closingDocs+logisticsCost+mandatoryRefit+overlapHousing;

    const imp=improvementTotals(b,s);
    const monthly=
      num(b.marinaMonthlyEUR)+num(b.insuranceMonthlyEUR)+num(b.maintenanceMonthlyEUR)+
      num(b.electricityMonthlyEUR)+num(b.heatingMonthlyEUR)+num(b.localFuelMonthlyEUR)+
      num(b.internetMonthlyEUR)+num(b.winterMonthlyEUR)+num(b.miscMonthlyEUR);

    const nonPurchaseCashCosts=dueDiligence+closingDocs+logisticsCost+mandatoryRefit+overlapHousing+imp.cash+monthly*months;
    const cashCost=purchase+nonPurchaseCashCosts;
    const sellingCosts=num(b.sellingCostsEUR);
    const netExpectedSale=Math.max(0,num(b.expectedResaleEUR)-sellingCosts);
    const netQuickSale=Math.max(0,num(b.quickSaleEUR)-sellingCosts);
    const economicCost=cashCost+imp.shadowEUR-netExpectedSale;
    const downsideEconomicCost=cashCost+imp.shadowEUR-netQuickSale;
    const equivalentHousingCostMonthly=economicCost/months;
    const downsideHousingCostMonthly=downsideEconomicCost/months;
    const rentAlternative=rentEUR*months;
    const deltaVsRent=economicCost-rentAlternative;
    const downsideDeltaVsRent=downsideEconomicCost-rentAlternative;
    const riskBuffer=num(b.riskBufferEUR);
    const walkAwayPrice=budgetEUR*months+netQuickSale-nonPurchaseCashCosts-imp.shadowEUR-riskBuffer;
    const maxPurchaseVsRent=rentAlternative+netQuickSale-nonPurchaseCashCosts-imp.shadowEUR-riskBuffer;
    const marginOfSafety=walkAwayPrice-purchase;

    let score=0;
    scoreDefs.forEach(([k,w])=>score+=clamp(num(b[k]),0,10)/10*w);
    const valueIndex=score/(Math.max(economicCost,500)/1000);

    let recommendationCode, recommendationClass;
    if(decisionState==="WALK_AWAY"){
      recommendationCode="WALK_AWAY"; recommendationClass="red";
    }else if(decisionState==="HOLD"){
      recommendationCode="HOLD"; recommendationClass="yellow";
    }else if(purchase<=walkAwayPrice && downsideHousingCostMonthly<=budgetEUR && downsideDeltaVsRent<=0){
      recommendationCode="BUY_ZONE"; recommendationClass="green";
    }else if(purchase<=walkAwayPrice && downsideHousingCostMonthly<=budgetEUR){
      recommendationCode="CONSIDER"; recommendationClass="green";
    }else if(walkAwayPrice>0 && purchase>walkAwayPrice){
      recommendationCode="NEGOTIATE"; recommendationClass="yellow";
    }else{
      recommendationCode="WEAK"; recommendationClass="red";
    }

    return {
      months,rentEUR,budgetEUR,logistics:log,gates,decisionState,
      dueDiligence,closingDocs,mandatoryRefit,overlapHousing,logisticsCost,
      costToHabitable,improvements:imp,monthly,nonPurchaseCashCosts,cashCost,
      netExpectedSale,netQuickSale,economicCost,downsideEconomicCost,
      equivalentHousingCostMonthly,downsideHousingCostMonthly,rentAlternative,
      deltaVsRent,downsideDeltaVsRent,riskBuffer,walkAwayPrice,maxPurchaseVsRent,
      marginOfSafety,score,valueIndex,recommendationCode,recommendationClass
    };
  }

  return {num,habitabilityGate,logistics,improvementTotals,calcCandidate};
});
