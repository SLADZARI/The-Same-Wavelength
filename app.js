const STORAGE_KEY="ilka-boat-value-v1";
const STATE_VERSION=3;
const Core=window.ILKACore;

const scoreDefs=[
  ["hullScore","Корпус / мореходность",25],
  ["layoutScore","Планировка / приватность",20],
  ["propulsionScore","Двигатель / экономичность",15],
  ["comfortScore","Liveaboard комфорт",15],
  ["refitEaseScore","Простота переделки",10],
  ["energyScore","Solar / электрика",5],
  ["docsScore","Документы / ликвидность",10]
];

const defaultSettings={
  targetLocation:"Gdańsk, PL",rentPLN:3150,budgetUSD:1000,horizonMonths:12,
  plnPerEur:4.30,usdPerEur:1.15,diyShadowRatePLN:31.40
};

const uid=()=>globalThis.crypto?.randomUUID?.()||("id-"+Date.now()+"-"+Math.random().toString(16).slice(2));
const today=()=>new Date().toISOString().slice(0,10);
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const num=v=>Core.num(v);
const money=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(Number.isFinite(Number(n))?Number(n):0);
const nativeMoney=(n,c="EUR")=>{try{return new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:2}).format(Number.isFinite(Number(n))?Number(n):0);}catch{return String(n)+" "+c;}};
const signed=n=>(Number(n)>0?"+":"")+money(n);
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function newImprovement(name="Новая работа"){
  return {id:uid(),name,category:"INTERIOR",cashEUR:0,diyHours:0,upliftEUR:0,factLabel:"INFERENCE",notes:""};
}

function newOffer(candidateId){
  return {
    offerId:uid(),candidateId,observedAt:today(),sourceUrl:"",sourceSite:"",externalListingId:"",
    sellerType:"UNKNOWN",priceType:"ASK",amount:0,currency:"EUR",
    buyerPremium:null,taxFees:[],derivedAllInPrice:0,auctionEnd:null,offerExpiry:null,
    status:"OBSERVED",included:"",conditions:"",comment:""
  };
}

function newBoat(name="Новый кандидат"){
  return {
    id:uid(),name,model:"",location:"",
    lengthM:0,beamM:0,draftM:0,transportHeightM:0,displacementT:0,craneLiftWeightT:0,material:"UNKNOWN",
    cabins:0,cabinsEvidence:"UNKNOWN",berths:0,comfortablePeople:0,moveInState:"UNKNOWN",
    engineStatus:"unknown",engineHP:0,fuelBurnLPH:0,fuelBurnEvidence:"UNKNOWN",cruiseKn:0,
    legalGate:"UNKNOWN",structuralGate:"UNKNOWN",insuranceGate:"UNKNOWN",
    localFeasibility:"UNKNOWN",localLogisticsEUR:0,localLogisticsEvidence:"UNKNOWN",logisticsImpossible:false,
    seaFeasibility:"UNKNOWN",seaDistanceNm:0,seaTimeFactor:1.15,dieselEUR:2,
    canalFeesEUR:0,enRouteMarinasEUR:0,crewFoodEUR:0,crewTravelEUR:0,seaPrepEUR:0,seaContingencyEUR:0,
    roadFeasibility:"UNKNOWN",roadTransportEUR:0,roadTransportEvidence:"UNKNOWN",
    loadingCraneEUR:0,loadingCraneEvidence:"UNKNOWN",unloadingCraneEUR:0,unloadingCraneEvidence:"UNKNOWN",
    dismantlingRequired:"UNKNOWN",permitsEscortEUR:0,roadPrepEUR:0,roadContingencyEUR:0,
    towFeasibility:"UNKNOWN",towCostEUR:0,towCostEvidence:"UNKNOWN",towPrepEUR:0,towContingencyEUR:0,
    dueDiligenceEUR:400,dueDiligenceEvidence:"UNKNOWN",closingDocsEUR:0,closingDocsEvidence:"UNKNOWN",
    hullRefitEUR:0,hullRefitEvidence:"UNKNOWN",mechanicalRefitEUR:0,mechanicalRefitEvidence:"UNKNOWN",
    safetyRefitEUR:0,safetyRefitEvidence:"UNKNOWN",moveInInteriorEUR:0,moveInInteriorEvidence:"UNKNOWN",
    emergencyReserveEUR:500,overlapRentMonths:0,yardStorageDuringRefitEUR:0,temporaryHousingEUR:0,
    expectedResaleEUR:0,expectedResaleEvidence:"UNKNOWN",quickSaleEUR:0,quickSaleEvidence:"UNKNOWN",
    sellingCostsEUR:0,sellingCostsEvidence:"UNKNOWN",riskBufferEUR:500,improvements:[],
    marinaMonthlyEUR:0,marinaMonthlyEvidence:"UNKNOWN",selectedMarinaOfferId:"",
    insuranceMonthlyEUR:45,insuranceMonthlyEvidence:"UNKNOWN",
    maintenanceMonthlyEUR:150,electricityMonthlyEUR:60,heatingMonthlyEUR:60,localFuelMonthlyEUR:30,internetMonthlyEUR:30,winterMonthlyEUR:50,miscMonthlyEUR:50,
    hullScore:5,layoutScore:5,propulsionScore:5,comfortScore:5,refitEaseScore:5,energyScore:5,docsScore:5
  };
}

function inferEvidence(raw,field){
  const explicit=raw?.[field+"Evidence"];
  if(["UNKNOWN","ESTIMATE","QUOTE","ACTUAL"].includes(explicit)) return explicit;
  return num(raw?.[field])>0?"ESTIMATE":"UNKNOWN";
}

function migrateBoat(raw){
  const b={...newBoat(raw?.name||"Кандидат"),...(raw||{})};
  b.model=b.model||"";
  b.comfortablePeople=num(b.comfortablePeople)||num(b.berths)||0;
  b.moveInState=b.moveInState||"UNKNOWN";
  b.legalGate=b.legalGate||"UNKNOWN"; b.structuralGate=b.structuralGate||"UNKNOWN"; b.insuranceGate=b.insuranceGate||"UNKNOWN";
  b.localFeasibility=b.localFeasibility||((raw?.localFeasible===true)?"PASS":"UNKNOWN");
  b.seaFeasibility=b.seaFeasibility||((raw?.selfPropFeasible===true)?"PASS":"UNKNOWN");
  b.roadFeasibility=b.roadFeasibility||((raw?.roadFeasible===true||num(raw?.roadTransportEUR)>0)?"PASS":"UNKNOWN");
  b.towFeasibility=b.towFeasibility||"UNKNOWN";
  b.dueDiligenceEUR=raw?.dueDiligenceEUR ?? raw?.surveyDocsEUR ?? b.dueDiligenceEUR;
  b.expectedResaleEUR=raw?.expectedResaleEUR ?? raw?.resaleEUR ?? 0;
  b.quickSaleEUR=raw?.quickSaleEUR ?? (b.expectedResaleEUR?Math.round(b.expectedResaleEUR*0.75):0);
  b.emergencyReserveEUR=raw?.emergencyReserveEUR ?? raw?.initialReserveEUR ?? b.emergencyReserveEUR;
  ["fuelBurn","localLogistics","roadTransport","loadingCrane","unloadingCrane","towCost","dueDiligence","closingDocs","hullRefit","mechanicalRefit","safetyRefit","moveInInterior","expectedResale","quickSale","sellingCosts","marinaMonthly","insuranceMonthly"].forEach(k=>{
    b[k+"Evidence"]=inferEvidence(raw||{},k);
  });
  b.cabinsEvidence=b.cabinsEvidence||"UNKNOWN";
  b.dismantlingRequired=b.dismantlingRequired||"UNKNOWN";
  b.improvements=Array.isArray(raw?.improvements)?raw.improvements.map(x=>({id:x.id||uid(),name:x.name||"Работа",category:x.category||"OTHER",cashEUR:num(x.cashEUR),diyHours:num(x.diyHours),upliftEUR:num(x.upliftEUR),factLabel:x.factLabel||"INFERENCE",notes:x.notes||""})):[];
  if(!b.improvements.length){
    if(num(raw?.interiorRefitEUR)>0) b.improvements.push({...newImprovement("Интерьер — legacy assumption"),cashEUR:num(raw.interiorRefitEUR),upliftEUR:0});
    if(num(raw?.energyRefitEUR)>0) b.improvements.push({...newImprovement("Электрика / solar — legacy assumption"),category:"ENERGY",cashEUR:num(raw.energyRefitEUR),upliftEUR:0});
  }
  return b;
}

function migrateOffer(raw){
  const o={...newOffer(raw?.candidateId||""),...(raw||{})};
  o.offerId=o.offerId||o.id||uid();
  o.sourceUrl=o.sourceUrl||o.url||"";
  o.sourceSite=o.sourceSite||sourceFromUrl(o.sourceUrl);
  o.observedAt=o.observedAt||today();
  o.priceType=o.priceType||"ASK"; o.currency=(o.currency||"EUR").toUpperCase(); o.status=o.status||"OBSERVED";
  o.buyerPremium=o.buyerPremium??null; o.taxFees=Array.isArray(o.taxFees)?o.taxFees:[];
  if(Core.maybeNum(o.derivedAllInPrice)===null && Core.maybeNum(o.amount)!==null) o.derivedAllInPrice=Core.offerAllInOriginal(o);
  return o;
}

function legacyOfferFromBoat(raw,b){
  if(!raw) return newOffer(b.id);
  const hasLegacy=num(raw.purchaseEUR)>0 || raw.url || raw.sourceSite;
  if(!hasLegacy) return newOffer(b.id);
  return migrateOffer({
    offerId:uid(),candidateId:b.id,observedAt:raw.offerObservedAt||today(),
    sourceUrl:raw.url||"",sourceSite:raw.sourceSite||sourceFromUrl(raw.url||""),
    sellerType:raw.sellerType||"UNKNOWN",priceType:"ASK",amount:num(raw.purchaseEUR),currency:"EUR",
    buyerPremium:null,taxFees:[],derivedAllInPrice:num(raw.purchaseEUR),status:"OBSERVED",
    comment:raw.offerComment||"Migrated from state v2."
  });
}

function migrateState(raw){
  const old=raw&&typeof raw==="object"?raw:{};
  const rawBoats=Array.isArray(old.boats)&&old.boats.length?old.boats:[newBoat()];
  const boats=rawBoats.map(migrateBoat);
  let offers=Array.isArray(old.offers)?old.offers.map(migrateOffer):[];
  if(!offers.length) offers=rawBoats.map((x,i)=>legacyOfferFromBoat(x,boats[i]));
  boats.forEach(b=>{if(!offers.some(o=>o.candidateId===b.id))offers.push(newOffer(b.id));});
  return {version:STATE_VERSION,settings:{...defaultSettings,...(old.settings||{})},boats,offers};
}

function load(){
  try{return migrateState(JSON.parse(localStorage.getItem(STORAGE_KEY)));}
  catch{return migrateState(null);}
}

function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  const el=$("#saveState"); if(el){el.textContent="сохранено";setTimeout(()=>el.textContent="автосохранение",650);}
}

function sourceFromUrl(url){
  try{return new URL(url).hostname.replace(/^www\./,"");}catch{return "";}
}

let state=load();
let selectedId=state.boats[0]?.id;
let marinaEvidence={status:"loading",offers:[],path:"",error:""};
let fixtureEvidence={status:"loading",data:null,path:"",error:""};
let candidateFilter="all";

function boat(){return state.boats.find(x=>x.id===selectedId)||state.boats[0];}
function offersFor(candidateId){
  return state.offers.filter(o=>o.candidateId===candidateId);
}

function currentOffer(b=boat()){
  if(!b)return null;
  const list=offersFor(b.id);
  const active=list.filter(o=>!["HISTORICAL","EXPIRED","WITHDRAWN","SOLD","REJECTED"].includes(o.status));
  const sort=(a,z)=>String(z.observedAt||"").localeCompare(String(a.observedAt||"")) || String(z.offerId).localeCompare(String(a.offerId));
  return (active.sort(sort)[0]||list.sort(sort)[0]||null);
}

function calc(b=boat()){
  return Core.calcCandidate(b,state.settings,currentOffer(b));
}

function recommendationLabel(c){
  const map={
    WALK_AWAY:"ОТМЕСТИ",
    HOLD:"ПАУЗА — НУЖНЫ ДАННЫЕ",
    BUY_ZONE:"BUY ZONE",
    CONSIDER:"РАССМАТРИВАТЬ",
    NEGOTIATE:"ТОРГОВАТЬСЯ",
    WEAK:"НЕВЫГОДНО"
  };
  return map[c.recommendationCode]||c.recommendationCode;
}

function renderSettings(){
  Object.keys(defaultSettings).forEach(k=>{
    const el=$("#"+k); if(!el)return;
    el.value=state.settings[k]??"";
    el.oninput=()=>{
      state.settings[k]=el.type==="number"?num(el.value):el.value;
      save();renderScenarioSummary();renderTable();renderComputed();renderOfferSummary();renderOfferHistory();renderImprovementTotals();renderMarinaPresets();
    };
  });
}

function renderScenarioSummary(){
  const el=$("#scenarioSummary"); if(!el)return;
  const pln=Math.max(num(state.settings.plnPerEur),0.01);
  const rentEUR=num(state.settings.rentPLN)/pln;
  const budgetEUR=num(state.settings.budgetUSD)/Math.max(num(state.settings.usdPerEur),0.01);
  el.innerHTML=[
    ["База",escapeHtml(state.settings.targetLocation||"—")],
    ["Аренда",money(rentEUR)+"/мес"],
    ["Лимит",money(budgetEUR)+"/мес"],
    ["Горизонт",num(state.settings.horizonMonths)+" мес"]
  ].map(([a,b])=>`<div class="scenario-chip"><span>${a}</span><strong>${b}</strong></div>`).join("");
}

function candidateMatchesFilter(c){
  if(candidateFilter==="strong") return ["BUY_ZONE","CONSIDER","NEGOTIATE"].includes(c.recommendationCode);
  if(candidateFilter==="hold") return c.recommendationCode==="HOLD";
  if(candidateFilter==="reject") return ["WALK_AWAY","WEAK"].includes(c.recommendationCode);
  return true;
}

function priceLabel(o){
  if(!o)return "no offer";
  return (o.priceType||"ASK")+" "+nativeMoney(o.amount,o.currency||"EUR");
}

function gateCompact(c){
  const vals=Object.values(c.gates);
  if(vals.includes("FAIL")) return "hard fail";
  const hardUnknown=vals.filter(x=>x==="UNKNOWN").length;
  if(hardUnknown) return hardUnknown+" gate unknown";
  if(c.evidenceGate==="UNKNOWN") return c.evidenceUnknowns.length+" cost unknown";
  return "gates closed";
}

function renderTable(){
  const wrap=$("#candidateList"),stats=$("#portfolioStats"); if(!wrap)return;
  const priority={BUY_ZONE:0,CONSIDER:1,NEGOTIATE:2,HOLD:3,WEAK:4,WALK_AWAY:5};
  const all=state.boats.map(b=>({b,c:calc(b),o:currentOffer(b)})).sort((x,y)=>(priority[x.c.recommendationCode]??9)-(priority[y.c.recommendationCode]??9)||y.c.marginOfSafety-x.c.marginOfSafety);
  const rows=all.filter(x=>candidateMatchesFilter(x.c));
  const strong=all.filter(x=>["BUY_ZONE","CONSIDER","NEGOTIATE"].includes(x.c.recommendationCode)).length;
  const hold=all.filter(x=>x.c.recommendationCode==="HOLD").length;
  const reject=all.filter(x=>["WALK_AWAY","WEAK"].includes(x.c.recommendationCode)).length;
  if(stats) stats.innerHTML=all.length+" всего<br>"+strong+" сильных · "+hold+" hold · "+reject+" отсев";
  if(!rows.length){wrap.innerHTML='<div class="empty-state">В этом фильтре пока нет кандидатов.</div>';return;}
  wrap.innerHTML=rows.map(({b,c,o})=>{
    const log=c.logistics.selected,selected=b.id===selectedId?" selected":"",marginClass=c.marginOfSafety>=0?"positive":"negative";
    const source=o?.sourceSite||"источник ?";
    const price=o?priceLabel(o):"no offer";
    return `<button type="button" class="candidate-card${selected}" data-candidate="${escapeHtml(b.id)}">
      <div class="candidate-card-top">
        <div><h3>${escapeHtml(b.name||"Кандидат")}</h3><div class="source">${escapeHtml(b.location||"локация ?")} · ${escapeHtml(source)}</div></div>
        <span class="tag ${c.recommendationClass}">${recommendationLabel(c)}</span>
      </div>
      <div class="candidate-card-grid">
        <div><span>Current</span><strong>${escapeHtml(price)}</strong></div>
        <div><span>All-in / EUR</span><strong>${c.offer.conversionKnown?money(c.transactionAllInPrice):"UNKNOWN"}</strong></div>
        <div><span>Жильё</span><strong>${num(b.cabins)||"?"} кают · ${num(b.berths)||"?"} мест</strong></div>
        <div><span>Логистика</span><strong>${log?log.mode+" · "+money(log.cost):"unknown"}</strong></div>
      </div>
      <div class="candidate-card-foot">
        <span>${gateCompact(c)}</span>
        <strong class="${marginClass}">${signed(c.marginOfSafety)}</strong>
      </div>
    </button>`;
  }).join("");
  wrap.querySelectorAll("[data-candidate]").forEach(el=>{el.onclick=()=>{selectedId=el.dataset.candidate;renderAll();};});
}

function renderCandidateSnapshot(){
  const b=boat(); if(!b)return;
  const o=currentOffer(b);
  const fields=[
    ["Каюты",num(b.cabins)||"?"],
    ["Спальных",num(b.berths)||"?"],
    ["Комфортно",num(b.comfortablePeople)||"?"],
    ["Заселение",b.moveInState||"UNKNOWN"],
    ["Корпус",b.material||"UNKNOWN"],
    ["Габарит",num(b.lengthM)?num(b.lengthM).toFixed(1)+" × "+num(b.beamM).toFixed(2)+" м":"?"]
  ];
  $("#candidateSnapshot").innerHTML=fields.map(([a,v])=>`<div class="snapshot-item"><span>${a}</span><strong>${escapeHtml(v)}</strong></div>`).join("");
  const meta=$("#candidateSourceMeta");
  if(meta) meta.textContent=[o?.priceType,o?.sellerType,o?.sourceSite,o?.observedAt].filter(Boolean).join(" · ");
  const link=$("#openListingBtn");
  if(link){
    if(o?.sourceUrl){link.href=o.sourceUrl;link.classList.remove("disabled");link.removeAttribute("aria-disabled");}
    else{link.removeAttribute("href");link.classList.add("disabled");link.setAttribute("aria-disabled","true");}
  }
}

function recomputeOffer(o){
  if(!o)return;
  o.derivedAllInPrice=Core.offerAllInOriginal({...o,derivedAllInPrice:null});
}

function offerTaxRate(o){
  const f=(o?.taxFees||[]).find(x=>String(x.base||"").toUpperCase()==="PREMIUM");
  return Core.maybeNum(f?.ratePct)??0;
}

function renderOfferSummary(){
  const o=currentOffer(),el=$("#currentOfferSummary"); if(!el)return;
  if(!o){el.innerHTML='<div class="empty-state">Нет текущего offer.</div>';return;}
  const econ=Core.offerEconomics(o,state.settings);
  const expiry=o.auctionEnd||o.offerExpiry||"—";
  el.innerHTML=[
    ["Current "+(o.priceType||"ASK"),nativeMoney(o.amount,o.currency||"EUR")],
    ["All-in native",econ.allInOriginal===null?"UNKNOWN":nativeMoney(econ.allInOriginal,o.currency||"EUR")],
    ["All-in scenario EUR",econ.allInEUR===null?"UNKNOWN":money(econ.allInEUR)],
    ["Статус / expiry",(o.status||"OBSERVED")+" · "+expiry]
  ].map(([a,v])=>`<div class="snapshot-item"><span>${escapeHtml(a)}</span><strong>${escapeHtml(v)}</strong></div>`).join("");
}

function renderOfferHistory(){
  const b=boat(),el=$("#offerHistory"); if(!b||!el)return;
  const cur=currentOffer(b);
  const list=offersFor(b.id).slice().sort((a,z)=>String(z.observedAt||"").localeCompare(String(a.observedAt||""))||String(z.offerId).localeCompare(String(a.offerId)));
  el.innerHTML=list.map(o=>{
    const econ=Core.offerEconomics(o,state.settings),isCurrent=cur&&cur.offerId===o.offerId;
    return `<div class="offer-history-row${isCurrent?" current":""}">
      <div><strong>${escapeHtml(priceLabel(o))}</strong><small>${escapeHtml(o.observedAt||"")} · ${escapeHtml(o.sourceSite||"")}</small></div>
      <div><span>all-in</span><strong>${econ.allInEUR===null?"UNKNOWN":money(econ.allInEUR)}</strong></div>
      <div><span>status</span><strong>${escapeHtml(o.status||"OBSERVED")}</strong></div>
    </div>`;
  }).join("")||'<div class="empty-state">Истории цен пока нет.</div>';
}

function renderOfferEditor(){
  const o=currentOffer(),el=$("#currentOfferEditor"); if(!el)return;
  if(!o){el.innerHTML="";return;}
  const premium=typeof o.buyerPremium==="object"?(Core.maybeNum(o.buyerPremium.ratePct)??0):0;
  const tax=offerTaxRate(o);
  el.innerHTML=`<div class="grid four offer-editor">
    <label>Price type<select data-offer-field="priceType">${["ASK","BID","COUNTER","ACCEPTED"].map(v=>`<option ${v===o.priceType?"selected":""}>${v}</option>`).join("")}</select></label>
    <label>Amount<input data-offer-field="amount" type="number" value="${num(o.amount)}"></label>
    <label>Currency<select data-offer-field="currency">${["EUR","PLN","USD"].map(v=>`<option ${v===o.currency?"selected":""}>${v}</option>`).join("")}</select></label>
    <label>Observed<input data-offer-field="observedAt" type="date" value="${escapeHtml(o.observedAt||today())}"></label>
    <label>Buyer premium, %<input data-offer-special="premium" type="number" step="0.1" value="${premium}"></label>
    <label>Tax on premium, %<input data-offer-special="taxPremium" type="number" step="0.1" value="${tax}"></label>
    <label>Seller<select data-offer-field="sellerType">${["UNKNOWN","PRIVATE","BROKER","DEALER","AUCTION","OTHER"].map(v=>`<option ${v===o.sellerType?"selected":""}>${v}</option>`).join("")}</select></label>
    <label>Status<select data-offer-field="status">${["OBSERVED","CONTACTED","NEGOTIATING","ACCEPTED","HISTORICAL","EXPIRED","REJECTED","WITHDRAWN","SOLD"].map(v=>`<option ${v===o.status?"selected":""}>${v}</option>`).join("")}</select></label>
    <label>Source site<input data-offer-field="sourceSite" value="${escapeHtml(o.sourceSite||"")}"></label>
    <label class="span-three">Source URL<input data-offer-field="sourceUrl" type="url" value="${escapeHtml(o.sourceUrl||"")}"></label>
    <label>Auction end / expiry<input data-offer-field="auctionEnd" value="${escapeHtml(o.auctionEnd||o.offerExpiry||"")}"></label>
    <label class="span-three">Conditions / comment<textarea data-offer-field="comment" rows="2">${escapeHtml(o.comment||o.conditions||"")}</textarea></label>
  </div>
  <p class="note">Новая цена = новая запись через “+ Price observation”. Редактирование здесь корректирует выбранное текущее наблюдение.</p>`;
  const refresh=()=>{recomputeOffer(o);save();renderOfferSummary();renderOfferHistory();renderCandidateSnapshot();renderTable();renderComputed();};
  el.querySelectorAll("[data-offer-field]").forEach(input=>{
    input.oninput=()=>{
      const k=input.dataset.offerField;
      o[k]=input.type==="number"?num(input.value):input.value;
      if(k==="sourceUrl"&&!o.sourceSite)o.sourceSite=sourceFromUrl(o.sourceUrl);
      refresh();
    };
  });
  el.querySelector("[data-offer-special='premium']").oninput=e=>{
    const rate=num(e.target.value);o.buyerPremium=rate?{ratePct:rate}:null;refresh();
  };
  el.querySelector("[data-offer-special='taxPremium']").oninput=e=>{
    const rate=num(e.target.value);o.taxFees=rate?[{label:"Tax on buyer premium",ratePct:rate,base:"PREMIUM"}]:[];refresh();
  };
}

function renderOfferPanel(){
  renderOfferSummary();renderOfferEditor();renderOfferHistory();
}

function renderEditor(){
  const b=boat(); if(!b)return;
  $("#boatTitle").textContent=b.name||"Кандидат";
  $$("[data-field]").forEach(el=>{
    const k=el.dataset.field;
    if(!(k in b))return;
    if(el.type==="checkbox") el.checked=!!b[k]; else el.value=b[k]??"";
    el.oninput=()=>{
      if(el.type==="checkbox") b[k]=el.checked;
      else if(el.type==="number"||el.type==="range") b[k]=num(el.value);
      else b[k]=el.value;
      if(k==="name") $("#boatTitle").textContent=b.name||"Кандидат";
      save();renderCandidateSnapshot();renderTable();renderComputed();renderLogisticsSummary();renderImprovementTotals();renderMarinaPresets();
    };
  });
  renderCandidateSnapshot();
  renderOfferPanel();
  renderImprovementList();
  renderScoreInputs();
}

function optionCost(c,mode){
  const o=c.logistics.options.find(x=>x.mode===mode);
  if(!o)return "—";
  if(o.state==="FAIL")return "FAIL";
  if(o.state==="UNKNOWN")return "UNKNOWN";
  if(!o.complete)return "~"+money(o.cost)+" · evidence?";
  return money(o.cost);
}

function renderLogisticsSummary(){
  const b=boat(); if(!b)return; const c=calc(b);
  const selected=c.logistics.selected;
  $("#logisticsSummary").innerHTML=[
    ["LOCAL",optionCost(c,"LOCAL")],["SEA",optionCost(c,"SEA")],["ROAD",optionCost(c,"ROAD")],["TOW",optionCost(c,"TOW")]
  ].map(([a,v])=>`<div><span>${a}</span><strong>${v}</strong></div>`).join("")+
  `<div class="selected-logistics"><span>Выбрано</span><strong>${selected?selected.mode+" · "+money(selected.cost):"нет подтверждённого пути"}</strong></div>`;
}

function renderImprovementList(){
  const b=boat(),wrap=$("#improvementList"); if(!b||!wrap)return;
  if(!b.improvements.length){
    wrap.innerHTML='<div class="empty-state">Пока нет работ. Добавьте, например, интерьер, батарею или solar.</div>';
    return;
  }
  wrap.innerHTML=b.improvements.map((x,i)=>`
    <div class="improvement-row" data-idx="${i}">
      <label>Работа<input data-imp="name" value="${escapeHtml(x.name)}"></label>
      <label>Категория<select data-imp="category">
        ${["INTERIOR","ENERGY","SYSTEMS","COSMETIC","SAFETY","OTHER"].map(v=>`<option ${v===x.category?"selected":""}>${v}</option>`).join("")}
      </select></label>
      <label>Cash, €<input data-imp="cashEUR" type="number" value="${num(x.cashEUR)}"></label>
      <label>Наши часы<input data-imp="diyHours" type="number" value="${num(x.diyHours)}"></label>
      <label>Прирост цены, €<input data-imp="upliftEUR" type="number" value="${num(x.upliftEUR)}"></label>
      <label>Уверенность<select data-imp="factLabel">
        ${["UNKNOWN","INFERENCE","FACT"].map(v=>`<option ${v===x.factLabel?"selected":""}>${v}</option>`).join("")}
      </select></label>
      <button class="icon-button danger remove-improvement" title="Удалить">×</button>
    </div>`).join("");
  wrap.querySelectorAll(".improvement-row").forEach(row=>{
    const i=Number(row.dataset.idx);
    row.querySelectorAll("[data-imp]").forEach(el=>{
      el.oninput=()=>{
        const k=el.dataset.imp;
        b.improvements[i][k]=el.type==="number"?num(el.value):el.value;
        save();renderImprovementTotals();renderComputed();renderTable();
      };
    });
    row.querySelector(".remove-improvement").onclick=()=>{b.improvements.splice(i,1);save();renderAll();};
  });
}

function renderImprovementTotals(){
  const b=boat(),el=$("#improvementTotals"); if(!b||!el)return;
  const c=calc(b),imp=c.improvements;
  el.innerHTML=`
    <div><span>Cash</span><strong>${money(imp.cash)}</strong></div>
    <div><span>Наше время</span><strong>${imp.hours.toFixed(0)} ч</strong><small>${money(imp.shadowEUR)} shadow</small></div>
    <div><span>Ожидаемый uplift</span><strong>${money(imp.uplift)}</strong></div>
    <div class="${imp.net>=0?"positive":"negative"}"><span>Net value</span><strong>${signed(imp.net)}</strong><small>${imp.hours?money(imp.perHour)+"/DIY ч":"—"}</small></div>`;
}

function renderScoreInputs(){
  const b=boat(),wrap=$("#scoreInputs"); if(!b||!wrap)return;
  wrap.innerHTML="";
  scoreDefs.forEach(([k,label,w])=>{
    const row=document.createElement("div"); row.className="score-row";
    row.innerHTML=`<label>${label} <span class="hint">(${w}%)</span></label><input type="range" min="0" max="10" step="1" value="${num(b[k])}"><div class="score-value">${num(b[k])}</div>`;
    const input=row.querySelector("input"),val=row.querySelector(".score-value");
    input.oninput=()=>{b[k]=num(input.value);val.textContent=input.value;save();renderComputed();renderTable();};
    wrap.appendChild(row);
  });
}

function gateBadge(name,value){
  const cls=value==="PASS"?"green":value==="FAIL"?"red":"yellow";
  return `<span class="gate-badge ${cls}"><b>${name}</b> ${value}</span>`;
}

function renderDecisionReasons(b,c){
  const el=$("#decisionReasons"); if(!el)return;
  const labels={legal:"Документы",structural:"Корпус",logistics:"Логистика",habitability:"Жильё",insurance:"Страхование"};
  const reasons=[];
  Object.entries(c.gates).forEach(([k,v])=>{
    if(v==="FAIL") reasons.push(["red",labels[k]+": hard gate FAIL — высокий score не может это отменить."]);
    else if(v==="UNKNOWN") reasons.push(["yellow",labels[k]+": нужны подтверждённые данные."]);
  });
  if(!Object.values(c.gates).includes("FAIL") && c.evidenceUnknowns?.length){
    c.evidenceUnknowns.slice(0,6).forEach(x=>reasons.push(["yellow","Evidence UNKNOWN: "+x+". Числовой placeholder не считается подтверждённым расходом."]));
  }
  if(!reasons.length){
    if(c.marginOfSafety<0) reasons.push(["yellow","All-in цена выше walk-away на "+money(Math.abs(c.marginOfSafety))+". Нужен торг ниже потолка."]);
    if(c.downsideHousingCostMonthly>c.budgetEUR) reasons.push(["yellow","Downside "+money(c.downsideHousingCostMonthly)+"/мес выше лимита "+money(c.budgetEUR)+"/мес."]);
    if(c.downsideDeltaVsRent>0) reasons.push(["yellow","Downside за горизонт хуже аренды на "+money(c.downsideDeltaVsRent)+"."]);
    if(!reasons.length) reasons.push(["green","Hard gates и critical evidence закрыты; можно переходить к экономическому решению."]);
  }
  el.innerHTML=reasons.slice(0,7).map(([cls,text])=>`<div class="reason ${cls}"><i></i><span>${escapeHtml(text)}</span></div>`).join("");
}

function renderComputed(){
  const b=boat(); if(!b)return; const c=calc(b),o=currentOffer(b);
  const v=$("#verdict");
  let detail="";
  if(c.recommendationCode==="NEGOTIATE") detail=" · максимум "+money(Math.max(0,c.walkAwayPrice));
  if(c.recommendationCode==="HOLD") detail=" · нужны evidence / hard-gate данные";
  const raw=o?priceLabel(o):"no offer";
  const allIn=c.offer.conversionKnown?money(c.transactionAllInPrice):"UNKNOWN";
  v.className="verdict "+c.recommendationClass;
  v.innerHTML=`<strong>${recommendationLabel(c)}</strong>${detail}<small>${escapeHtml(b.location||"")} · ${escapeHtml(raw)} · all-in ${escapeHtml(allIn)}</small>`;

  $("#gateStrip").innerHTML=[
    gateBadge("Legal",c.gates.legal),gateBadge("Hull",c.gates.structural),
    gateBadge("Logistics",c.gates.logistics),gateBadge("Liveability",c.gates.habitability),
    gateBadge("Insurance",c.gates.insurance),gateBadge("Evidence",c.evidenceGate)
  ].join("");
  renderDecisionReasons(b,c);

  const log=c.logistics.selected;
  const metrics=[
    ["Current all-in",c.offer.conversionKnown?money(c.transactionAllInPrice):"UNKNOWN",o?priceLabel(o):"no offer"],
    ["Cost-to-Habitable",money(c.costToHabitable),"ожидаемые потраченные деньги до заселения"],
    ["Cash Required",money(c.cashRequired),"Cost-to-Habitable + reserve"],
    ["Emergency Reserve",money(c.emergencyReserve),"остаётся резервом, не expense"],
    ["Walk-away",money(Math.max(0,c.walkAwayPrice)),"max all-in before logistics"],
    ["Margin",signed(c.marginOfSafety),c.marginOfSafety>=0?"all-in ниже потолка":"торг / отбой"],
    ["Downside / мес",money(c.downsideHousingCostMonthly),"лимит "+money(c.budgetEUR)],
    ["Run-rate",money(c.monthly),"/ месяц"],
    ["Логистика",log?money(log.cost):"—",log?log.mode:"путь unknown"],
    ["Quick-sale",money(c.netQuickSale),"net downside"],
    ["DIY value",signed(c.improvements.net),c.improvements.hours.toFixed(0)+" ч"]
  ];
  $("#metrics").innerHTML=metrics.map(([a,bv,sm])=>`<div class="metric"><span>${a}</span><strong>${bv}</strong><small>${sm}</small></div>`).join("");
  drawRadar(b);
}

function drawRadar(b){
  const svg=$("#radar"),cx=180,cy=180,R=118,N=scoreDefs.length;
  const pts=(radius,vals=null)=>scoreDefs.map((_,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/N,rr=vals?radius*vals[i]/10:radius;
    return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];
  });
  const poly=a=>a.map(p=>p.join(",")).join(" ");
  let html="";
  [0.25,0.5,0.75,1].forEach(k=>html+=`<polygon points="${poly(pts(R*k))}" fill="none" stroke="#26384b" stroke-width="1"/>`);
  pts(R).forEach(p=>html+=`<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#26384b"/>`);
  const vals=scoreDefs.map(([k])=>num(b[k]));
  html+=`<polygon points="${poly(pts(R,vals))}" fill="rgba(103,211,176,.18)" stroke="#67d3b0" stroke-width="2"/>`;
  scoreDefs.forEach(([,label],i)=>{
    const a=-Math.PI/2+i*2*Math.PI/N,rr=R+30,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
    const anchor=x<cx-8?"end":x>cx+8?"start":"middle";
    html+=`<text x="${x}" y="${y}" fill="#90a4b8" font-size="10" text-anchor="${anchor}" dominant-baseline="middle">${label.split("/")[0].trim()}</text>`;
  });
  svg.innerHTML=html;
}

async function loadMarinaEvidence(){
  marinaEvidence={status:"loading",offers:[],path:"",error:""};
  renderMarinaPresets();
  try{
    const idx=await fetch("ARTIFACT_INDEX.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("ARTIFACT_INDEX "+r.status);return r.json();});
    const a=idx.artifacts.find(x=>x.artifactId==="ilka.research.marina-offers");
    if(!a?.path) throw new Error("marina evidence pointer missing");
    const data=await fetch(a.path,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("EVIDENCE "+r.status);return r.json();});
    marinaEvidence={status:"ready",offers:data.offers||[],path:a.path,error:""};
  }catch(e){
    marinaEvidence={status:"error",offers:[],path:"",error:e.message};
  }
  renderMarinaPresets();
}

function daysBetween(from,to){
  if(!from||!to)return 0;
  const a=new Date(from+"T00:00:00Z"),b=new Date(to+"T00:00:00Z");
  return Math.max(1,Math.round((b-a)/86400000)+1);
}
function marinaMonthlyEUR(o,b){
  const p=o.pricing||{},pln=Math.max(num(state.settings.plnPerEur),0.01);
  if(num(p.baseTotalPln)>0){
    const days=daysBetween(o.period?.from,o.period?.to);
    const months=days?days/30.44:6;
    return num(p.baseTotalPln)/months/pln;
  }
  if(num(p.ratePlnPerMeterPerDay)>0) return num(p.ratePlnPerMeterPerDay)*num(b.lengthM)*30.44/pln;
  if(num(p.landStorageTotalPln)>0) return num(p.landStorageTotalPln)/Math.max(num(p.months),1)/pln;
  return 0;
}
function marinaLabel(o){
  const avail=o.availability||"UNKNOWN";
  return `${o.marinaName} · ${o.location||""} · ${avail}`;
}
function renderMarinaPresets(){
  const select=$("#marinaPreset"),info=$("#marinaPresetInfo"),apply=$("#applyMarinaPreset"),b=boat();
  if(!select||!info||!apply||!b)return;
  if(marinaEvidence.status==="loading"){
    select.innerHTML='<option>Загрузка EVIDENCE…</option>';select.disabled=true;apply.disabled=true;info.textContent="Читаю текущий pointer из ARTIFACT_INDEX.";return;
  }
  if(marinaEvidence.status==="error"){
    select.innerHTML='<option>Manual</option>';select.disabled=true;apply.disabled=true;info.textContent="EVIDENCE не загрузился. При открытии через file:// это ожидаемо; ручное поле марина остаётся доступным.";return;
  }
  const offers=marinaEvidence.offers.filter(o=>o.availability==="AVAILABLE"&&o.liveaboardAllowed===true&&marinaMonthlyEUR(o,b)>0);
  if(!offers.length){select.innerHTML='<option>Нет применимых liveaboard offers</option>';select.disabled=true;apply.disabled=true;info.textContent="Можно вводить marina cost вручную.";return;}
  select.disabled=false;apply.disabled=false;
  const previous=b.selectedMarinaOfferId||select.value;
  select.innerHTML=offers.map(o=>`<option value="${escapeHtml(o.offerId)}">${escapeHtml(marinaLabel(o))}</option>`).join("");
  if(offers.some(o=>o.offerId===previous)) select.value=previous;
  const selected=offers.find(o=>o.offerId===select.value)||offers[0];
  const refresh=()=>{
    const o=offers.find(x=>x.offerId===select.value)||offers[0];
    const m=marinaMonthlyEUR(o,b);
    info.textContent=`${money(m)}/мес экв. · source ${o.source?.sourceLabel||"EVIDENCE"}${o.pricing?.referenceLengthM&&Math.abs(num(b.lengthM)-num(o.pricing.referenceLengthM))>.1?" · quote требует переподтверждения для другой длины":""}`;
  };
  select.onchange=refresh;
  apply.onclick=()=>{
    const o=offers.find(x=>x.offerId===select.value)||selected;
    b.selectedMarinaOfferId=o.offerId;
    b.marinaMonthlyEUR=Math.round(marinaMonthlyEUR(o,b)*100)/100;
    b.marinaMonthlyEvidence="QUOTE";
    save();renderAll();
  };
  refresh();
}

function renderFixtureButton(){
  const btn=$("#loadFixturesBtn"); if(!btn)return;
  if(fixtureEvidence.status==="loading"){btn.disabled=true;btn.textContent="Fixtures…";return;}
  if(fixtureEvidence.status==="error"){btn.disabled=true;btn.textContent="Fixtures unavailable";btn.title=fixtureEvidence.error;return;}
  btn.disabled=false;btn.textContent="Load 4 fixtures";btn.title="Load/refresh versioned real-offer G6 fixtures from ARTIFACT_INDEX";
}

async function loadFixtureEvidence(){
  fixtureEvidence={status:"loading",data:null,path:"",error:""};renderFixtureButton();
  try{
    const idx=await fetch("ARTIFACT_INDEX.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("ARTIFACT_INDEX "+r.status);return r.json();});
    const a=idx.artifacts.find(x=>x.artifactId==="ilka.research.real-offer-fixtures");
    if(!a?.path) throw new Error("fixture evidence pointer missing");
    const data=await fetch(a.path,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("EVIDENCE "+r.status);return r.json();});
    fixtureEvidence={status:"ready",data,path:a.path,error:""};
  }catch(e){fixtureEvidence={status:"error",data:null,path:"",error:e.message};}
  renderFixtureButton();
}

function isBlankCandidate(b){
  const o=currentOffer(b);
  return state.boats.length===1 && !b.name?.trim()?.replace("Новый кандидат","") && num(o?.amount)===0 && !o?.sourceUrl;
}

function applyFixtures(){
  if(fixtureEvidence.status!=="ready"||!fixtureEvidence.data)return;
  const data=fixtureEvidence.data,ids=new Set(data.candidates.map(x=>x.id));
  const existingBlank=state.boats.length===1 && state.boats[0].name==="Новый кандидат" && num(currentOffer(state.boats[0])?.amount)===0;
  if(existingBlank){const oldId=state.boats[0].id;state.boats=[];state.offers=state.offers.filter(o=>o.candidateId!==oldId);}
  state.boats=state.boats.filter(b=>!ids.has(b.id)).concat(data.candidates.map(migrateBoat));
  state.offers=state.offers.filter(o=>!ids.has(o.candidateId)).concat(data.offers.map(migrateOffer));
  selectedId=data.candidates[0]?.id||state.boats[0]?.id;
  candidateFilter="all";$$("[data-filter]").forEach(x=>x.classList.toggle("active",x.dataset.filter==="all"));
  save();renderAll();
}

function renderAll(editor=true){
  renderSettings();renderScenarioSummary();renderTable();if(editor)renderEditor();renderComputed();renderLogisticsSummary();renderImprovementTotals();renderMarinaPresets();renderFixtureButton();
}

$$("[data-filter]").forEach(btn=>btn.onclick=()=>{
  candidateFilter=btn.dataset.filter||"all";
  $$("[data-filter]").forEach(x=>x.classList.toggle("active",x===btn));
  renderTable();
});

$$(".tab").forEach(t=>t.onclick=()=>{
  $$(".tab").forEach(x=>x.classList.remove("active"));$$(".tab-content").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");$("#tab-"+t.dataset.tab).classList.add("active");
});

$("#newBoatBtn").onclick=()=>{
  const b=newBoat();state.boats.push(b);state.offers.push(newOffer(b.id));selectedId=b.id;save();renderAll();
};
$("#loadFixturesBtn").onclick=applyFixtures;
$("#addOfferBtn").onclick=()=>{
  const b=boat(),old=currentOffer(b);if(!b)return;
  if(old&&old.status==="OBSERVED")old.status="HISTORICAL";
  const next=migrateOffer(old?{...JSON.parse(JSON.stringify(old)),offerId:uid(),observedAt:today(),status:"OBSERVED"}:newOffer(b.id));
  next.candidateId=b.id;state.offers.push(next);save();renderAll();
};
$("#duplicateBtn").onclick=()=>{
  const srcBoat=boat(),b=JSON.parse(JSON.stringify(srcBoat));const oldId=b.id;
  b.id=uid();b.name=(b.name||"Кандидат")+" — копия";b.improvements=(b.improvements||[]).map(x=>({...x,id:uid()}));
  state.boats.push(b);
  offersFor(oldId).forEach(o=>state.offers.push(migrateOffer({...JSON.parse(JSON.stringify(o)),offerId:uid(),candidateId:b.id})));
  if(!offersFor(b.id).length)state.offers.push(newOffer(b.id));
  selectedId=b.id;save();renderAll();
};
$("#deleteBtn").onclick=()=>{
  if(state.boats.length<=1)return alert("Оставьте хотя бы один кандидат.");
  const id=selectedId;state.boats=state.boats.filter(x=>x.id!==id);state.offers=state.offers.filter(x=>x.candidateId!==id);
  selectedId=state.boats[0].id;save();renderAll();
};
$("#addImprovementBtn").onclick=()=>{boat().improvements.push(newImprovement());save();renderAll();};
$("#exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="ilka-acquisition-radar.json";a.click();URL.revokeObjectURL(a.href);
};
$("#importInput").onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=()=>{try{state=migrateState(JSON.parse(r.result));selectedId=state.boats[0]?.id;save();renderAll();}catch{alert("Не удалось прочитать JSON");}};
  r.readAsText(file);
};

renderAll();
loadMarinaEvidence();
loadFixtureEvidence();
