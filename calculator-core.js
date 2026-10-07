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
  const maybeNum=v=>v!==""&&v!==null&&v!==undefined&&Number.isFinite(Number(v))?Number(v):null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const normGate=v=>["PASS","FAIL","UNKNOWN"].includes(v)?v:"UNKNOWN";
  const normEvidence=v=>["ESTIMATE","QUOTE","ACTUAL"].includes(v)?v:"UNKNOWN";
  const normFeasibility=v=>["PASS","FAIL","UNKNOWN"].includes(v)?v:"UNKNOWN";

  function toEUR(amount,currency,s){
    const a=maybeNum(amount);
    if(a===null) return null;
    const c=String(currency||"EUR").toUpperCase();
    if(c==="EUR") return a;
    if(c==="PLN") return a/Math.max(num(s.plnPerEur),0.01);
    if(c==="USD") return a/Math.max(num(s.usdPerEur),0.01);
    return null;
  }

  function buyerPremiumAmount(o){
    const p=o?.buyerPremium;
    if(p===null||p===undefined) return 0;
    if(typeof p==="number") return num(p);
    if(typeof p!=="object") return 0;
    if(maybeNum(p.amount)!==null) return num(p.amount);
    const rate=maybeNum(p.ratePct ?? p.value);
    return rate===null?0:num(o.amount)*rate/100;
  }

  function taxFeesAmount(o,premium){
    const fees=Array.isArray(o?.taxFees)?o.taxFees:[];
    return fees.reduce((sum,f)=>{
      if(maybeNum(f?.amount)!==null) return sum+num(f.amount);
      const rate=maybeNum(f?.ratePct);
      if(rate===null) return sum;
      const base=String(f?.base||"AMOUNT").toUpperCase();
      if(base==="PREMIUM") return sum+premium*rate/100;
      return sum+num(o.amount)*rate/100;
    },0);
  }

  function offerFeesComplete(o){
    if(!o) return false;
    const premium=o.buyerPremium;
    if(premium && typeof premium==="object" && premium.evidenceState==="UNKNOWN") return false;
    const fees=Array.isArray(o.taxFees)?o.taxFees:[];
    if(fees.some(f=>f?.evidenceState==="UNKNOWN")) return false;
    return !fees.some(f=>maybeNum(f?.amount)===null && maybeNum(f?.ratePct)===null);
  }

  function offerAllInOriginal(o){
    if(!o) return null;
    if(maybeNum(o.derivedAllInPrice)!==null) return num(o.derivedAllInPrice);
    if(maybeNum(o.amount)===null || !offerFeesComplete(o)) return null;
    const premium=buyerPremiumAmount(o);
    return num(o.amount)+premium+taxFeesAmount(o,premium);
  }

  function offerEconomics(o,s,legacyPurchaseEUR){
    if(!o){
      const legacy=maybeNum(legacyPurchaseEUR);
      return {
        offer:null,rawAmount:legacy,rawCurrency:"EUR",allInOriginal:legacy,allInEUR:legacy,
        conversionKnown:legacy!==null,priceType:"ASK",buyerPremium:0,taxFees:0
      };
    }
    const allInOriginal=offerAllInOriginal(o);
    const premium=buyerPremiumAmount(o);
    const taxes=taxFeesAmount(o,premium);
    return {
      offer:o,
      rawAmount:maybeNum(o.amount),
      rawCurrency:String(o.currency||"EUR").toUpperCase(),
      allInOriginal,
      allInEUR:allInOriginal===null?null:toEUR(allInOriginal,o.currency||"EUR",s),
      conversionKnown:allInOriginal!==null && toEUR(allInOriginal,o.currency||"EUR",s)!==null,
      priceType:o.priceType||"ASK",
      buyerPremium:premium,
      taxFees:taxes
    };
  }

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

  function feasibility(b,newKey,legacyKey){
    if(b[newKey]) return normFeasibility(b[newKey]);
    if(b[legacyKey]===true) return "PASS";
    return "UNKNOWN";
  }

  function logistics(b){
    const options=[];
    const add=(mode,state,cost,unknowns=[],detail="")=>{
      options.push({mode,state,cost:num(cost),complete:state==="PASS"&&!unknowns.length,unknowns,detail});
    };

    const localState=feasibility(b,"localFeasibility","localFeasible");
    if(localState!=="FAIL"){
      const unknowns=localState==="PASS"&&normEvidence(b.localLogisticsEvidence)==="UNKNOWN"?["LOCAL transport quote"]: [];
      add("LOCAL",localState,num(b.localLogisticsEUR),unknowns,"локальная доставка / перегон");
    }else add("LOCAL","FAIL",0,[],"локальная доставка / перегон");

    const seaState=feasibility(b,"seaFeasibility","selfPropFeasible");
    if(seaState!=="FAIL"){
      const unknowns=[];
      if(seaState==="PASS" && normEvidence(b.fuelBurnEvidence)==="UNKNOWN") unknowns.push("engine fuel burn");
      const speed=Math.max(num(b.cruiseKn),0.1);
      const hours=num(b.seaDistanceNm)/speed*Math.max(num(b.seaTimeFactor),1);
      const fuelLitres=hours*num(b.fuelBurnLPH);
      const fuel=fuelLitres*num(b.dieselEUR);
      const cost=fuel+num(b.canalFeesEUR)+num(b.enRouteMarinasEUR)+num(b.crewFoodEUR)+num(b.crewTravelEUR)+num(b.seaPrepEUR)+num(b.seaContingencyEUR);
      add("SEA",seaState,cost,unknowns,"своим ходом");
      const last=options[options.length-1]; last.hours=hours; last.fuelLitres=fuelLitres;
    }else add("SEA","FAIL",0,[],"своим ходом");

    const roadState=feasibility(b,"roadFeasibility","roadFeasible");
    if(roadState!=="FAIL"){
      const unknowns=[];
      if(roadState==="PASS" && normEvidence(b.roadTransportEvidence)==="UNKNOWN") unknowns.push("ROAD transport quote");
      if(roadState==="PASS" && normEvidence(b.loadingCraneEvidence)==="UNKNOWN") unknowns.push("loading crane");
      if(roadState==="PASS" && normEvidence(b.unloadingCraneEvidence)==="UNKNOWN") unknowns.push("unloading crane");
      const cost=num(b.roadTransportEUR)+num(b.loadingCraneEUR)+num(b.unloadingCraneEUR)+num(b.permitsEscortEUR)+num(b.roadPrepEUR)+num(b.roadContingencyEUR);
      add("ROAD",roadState,cost,unknowns,"автотранспорт");
    }else add("ROAD","FAIL",0,[],"автотранспорт");

    const towState=normFeasibility(b.towFeasibility);
    if(towState!=="FAIL"){
      const unknowns=towState==="PASS"&&normEvidence(b.towCostEvidence)==="UNKNOWN"?["TOW quote"]:[];
      add("TOW",towState,num(b.towCostEUR)+num(b.towPrepEUR)+num(b.towContingencyEUR),unknowns,"буксировка");
    }else add("TOW","FAIL",0,[],"буксировка");

    const complete=options.filter(x=>x.complete).sort((a,z)=>a.cost-z.cost);
    const selected=complete[0]||null;
    const states=options.map(x=>x.state);
    let gate="UNKNOWN";
    if(b.logisticsImpossible===true || states.every(x=>x==="FAIL")) gate="FAIL";
    else if(selected) gate="PASS";
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

  function criticalCostUnknowns(b,log,offerEcon){
    const unknowns=[];
    const req=(field,label)=>{
      if(normEvidence(b[field+"Evidence"])==="UNKNOWN") unknowns.push(label);
    };
    if(!offerEcon.conversionKnown) unknowns.push("current offer all-in / currency conversion");
    req("dueDiligence","survey / due diligence");
    req("closingDocs","closing / documents");
    req("hullRefit","hull pre-move refit");
    req("mechanicalRefit","mechanical pre-move refit");
    req("safetyRefit","safety pre-move refit");
    req("moveInInterior","minimum move-in interior");
    req("insuranceMonthly","insurance cost");
    req("marinaMonthly","marina cost");
    req("sellingCosts","selling costs");
    req("expectedResale","expected resale");
    req("quickSale","quick-sale value");
    if(log.gate==="UNKNOWN"){
      const passedIncomplete=log.options.filter(x=>x.state==="PASS"&&!x.complete);
      passedIncomplete.forEach(x=>x.unknowns.forEach(u=>unknowns.push(u)));
    }
    return [...new Set(unknowns)];
  }

  function calcCandidate(b,s,offer=null){
    const months=Math.max(num(s.horizonMonths),1);
    const plnPerEur=Math.max(num(s.plnPerEur),0.01);
    const usdPerEur=Math.max(num(s.usdPerEur),0.01);
    const rentEUR=num(s.rentPLN)/plnPerEur;
    const budgetEUR=num(s.budgetUSD)/usdPerEur;
    const offerEcon=offerEconomics(offer,s,b.purchaseEUR);
    const log=logistics(b);
    const habitability=habitabilityGate(b);
    const gates={
      legal:normGate(b.legalGate),
      structural:normGate(b.structuralGate),
      logistics:log.gate,
      habitability,
      insurance:normGate(b.insuranceGate)
    };
    const evidenceUnknowns=criticalCostUnknowns(b,log,offerEcon);
    const evidenceGate=evidenceUnknowns.length?"UNKNOWN":"PASS";
    const gateValues=Object.values(gates);
    const decisionState=gateValues.includes("FAIL")?"WALK_AWAY":(
      gateValues.includes("UNKNOWN")||evidenceGate==="UNKNOWN"?"HOLD":"ECONOMIC_EVAL"
    );

    const dueDiligence=num(b.dueDiligenceEUR ?? b.surveyDocsEUR);
    const closingDocs=num(b.closingDocsEUR);
    const mandatoryRefit=
      num(b.hullRefitEUR)+num(b.mechanicalRefitEUR)+num(b.safetyRefitEUR)+num(b.moveInInteriorEUR);
    const overlapHousing=rentEUR*num(b.overlapRentMonths)+num(b.temporaryHousingEUR)+num(b.yardStorageDuringRefitEUR);
    const logisticsCost=log.selected?log.selected.cost:0;
    const transactionAllInPrice=offerEcon.allInEUR===null?0:offerEcon.allInEUR;
    const costToHabitable=transactionAllInPrice+dueDiligence+closingDocs+logisticsCost+mandatoryRefit+overlapHousing;
    const emergencyReserve=num(b.emergencyReserveEUR ?? b.initialReserveEUR);
    const cashRequired=costToHabitable+emergencyReserve;

    const imp=improvementTotals(b,s);
    const monthly=
      num(b.marinaMonthlyEUR)+num(b.insuranceMonthlyEUR)+num(b.maintenanceMonthlyEUR)+
      num(b.electricityMonthlyEUR)+num(b.heatingMonthlyEUR)+num(b.localFuelMonthlyEUR)+
      num(b.internetMonthlyEUR)+num(b.winterMonthlyEUR)+num(b.miscMonthlyEUR);

    const nonPurchaseCashCosts=dueDiligence+closingDocs+logisticsCost+mandatoryRefit+overlapHousing+imp.cash+monthly*months;
    const cashCost=transactionAllInPrice+nonPurchaseCashCosts;
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
    const marginOfSafety=walkAwayPrice-transactionAllInPrice;

    let score=0;
    scoreDefs.forEach(([k,w])=>score+=clamp(num(b[k]),0,10)/10*w);
    const valueIndex=score/(Math.max(economicCost,500)/1000);

    let recommendationCode,recommendationClass;
    if(decisionState==="WALK_AWAY"){
      recommendationCode="WALK_AWAY"; recommendationClass="red";
    }else if(decisionState==="HOLD"){
      recommendationCode="HOLD"; recommendationClass="yellow";
    }else if(transactionAllInPrice<=walkAwayPrice && downsideHousingCostMonthly<=budgetEUR && downsideDeltaVsRent<=0){
      recommendationCode="BUY_ZONE"; recommendationClass="green";
    }else if(transactionAllInPrice<=walkAwayPrice && downsideHousingCostMonthly<=budgetEUR){
      recommendationCode="CONSIDER"; recommendationClass="green";
    }else if(walkAwayPrice>0 && transactionAllInPrice>walkAwayPrice){
      recommendationCode="NEGOTIATE"; recommendationClass="yellow";
    }else{
      recommendationCode="WEAK"; recommendationClass="red";
    }

    return {
      months,rentEUR,budgetEUR,offer:offerEcon,transactionAllInPrice,
      logistics:log,gates,evidenceGate,evidenceUnknowns,decisionState,
      dueDiligence,closingDocs,mandatoryRefit,overlapHousing,logisticsCost,
      costToHabitable,emergencyReserve,cashRequired,improvements:imp,monthly,
      nonPurchaseCashCosts,cashCost,netExpectedSale,netQuickSale,economicCost,
      downsideEconomicCost,equivalentHousingCostMonthly,downsideHousingCostMonthly,
      rentAlternative,deltaVsRent,downsideDeltaVsRent,riskBuffer,walkAwayPrice,
      maxPurchaseVsRent,marginOfSafety,score,valueIndex,recommendationCode,recommendationClass
    };
  }

  return {
    num,maybeNum,toEUR,buyerPremiumAmount,taxFeesAmount,offerFeesComplete,offerAllInOriginal,offerEconomics,
    habitabilityGate,logistics,improvementTotals,criticalCostUnknowns,calcCandidate
  };
});
