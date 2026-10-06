const STORAGE_KEY="ilka-boat-value-v1";
const STATE_VERSION=2;
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
  targetLocation:"Gdańsk, PL",
  rentPLN:3150,
  budgetUSD:1000,
  horizonMonths:12,
  plnPerEur:4.30,
  usdPerEur:1.15,
  diyShadowRatePLN:31.40
};

const uid=()=>globalThis.crypto?.randomUUID?.()||("id-"+Date.now()+"-"+Math.random().toString(16).slice(2));
const today=()=>new Date().toISOString().slice(0,10);
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const num=v=>Core.num(v);
const money=n=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(Number.isFinite(Number(n))?Number(n):0);
const signed=n=>(Number(n)>0?"+":"")+money(n);
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function newImprovement(name="Новая работа"){
  return {id:uid(),name,category:"INTERIOR",cashEUR:0,diyHours:0,upliftEUR:0,factLabel:"INFERENCE",notes:""};
}

function newBoat(name="Новый кандидат"){
  return {
    id:uid(),name,url:"",sourceSite:"",sellerType:"UNKNOWN",offerObservedAt:today(),offerComment:"",
    location:"",purchaseEUR:0,
    lengthM:0,beamM:0,draftM:0,displacementT:0,material:"UNKNOWN",
    cabins:0,berths:0,comfortablePeople:0,moveInState:"UNKNOWN",
    engineStatus:"unknown",engineHP:0,fuelBurnLPH:0,cruiseKn:0,
    legalGate:"UNKNOWN",structuralGate:"UNKNOWN",insuranceGate:"UNKNOWN",
    localFeasible:false,localLogisticsEUR:0,logisticsImpossible:false,
    selfPropFeasible:false,seaDistanceNm:0,seaTimeFactor:1.15,dieselEUR:2,
    canalFeesEUR:0,enRouteMarinasEUR:0,crewFoodEUR:0,crewTravelEUR:0,seaPrepEUR:0,seaContingencyEUR:0,
    roadFeasible:false,roadTransportEUR:0,loadingCraneEUR:0,unloadingCraneEUR:0,permitsEscortEUR:0,roadPrepEUR:0,roadContingencyEUR:0,
    dueDiligenceEUR:400,closingDocsEUR:0,hullRefitEUR:0,mechanicalRefitEUR:0,safetyRefitEUR:0,moveInInteriorEUR:0,initialReserveEUR:500,
    overlapRentMonths:0,yardStorageDuringRefitEUR:0,temporaryHousingEUR:0,
    expectedResaleEUR:0,quickSaleEUR:0,sellingCostsEUR:0,riskBufferEUR:500,
    improvements:[],
    marinaMonthlyEUR:0,selectedMarinaOfferId:"",
    insuranceMonthlyEUR:45,maintenanceMonthlyEUR:150,electricityMonthlyEUR:60,heatingMonthlyEUR:60,localFuelMonthlyEUR:30,internetMonthlyEUR:30,winterMonthlyEUR:50,miscMonthlyEUR:50,
    hullScore:5,layoutScore:5,propulsionScore:5,comfortScore:5,refitEaseScore:5,energyScore:5,docsScore:5
  };
}

function migrateBoat(raw){
  const b={...newBoat(raw?.name||"Кандидат"),...(raw||{})};
  b.sourceSite=b.sourceSite||sourceFromUrl(b.url);
  b.offerObservedAt=b.offerObservedAt||today();
  b.sellerType=b.sellerType||"UNKNOWN";
  b.comfortablePeople=num(b.comfortablePeople)||num(b.berths)||0;
  b.moveInState=b.moveInState||"UNKNOWN";
  b.legalGate=b.legalGate||"UNKNOWN";
  b.structuralGate=b.structuralGate||"UNKNOWN";
  b.insuranceGate=b.insuranceGate||"UNKNOWN";
  b.dueDiligenceEUR=raw?.dueDiligenceEUR ?? raw?.surveyDocsEUR ?? b.dueDiligenceEUR;
  b.expectedResaleEUR=raw?.expectedResaleEUR ?? raw?.resaleEUR ?? 0;
  b.quickSaleEUR=raw?.quickSaleEUR ?? (b.expectedResaleEUR?Math.round(b.expectedResaleEUR*0.75):0);
  b.roadFeasible=raw?.roadFeasible ?? (num(raw?.roadTransportEUR)>0);
  b.localFeasible=!!raw?.localFeasible;
  b.improvements=Array.isArray(raw?.improvements)?raw.improvements.map(x=>({id:x.id||uid(),name:x.name||"Работа",category:x.category||"OTHER",cashEUR:num(x.cashEUR),diyHours:num(x.diyHours),upliftEUR:num(x.upliftEUR),factLabel:x.factLabel||"INFERENCE",notes:x.notes||""})):[];
  if(!b.improvements.length){
    if(num(raw?.interiorRefitEUR)>0) b.improvements.push({...newImprovement("Интерьер — legacy assumption"),cashEUR:num(raw.interiorRefitEUR),upliftEUR:0});
    if(num(raw?.energyRefitEUR)>0) b.improvements.push({...newImprovement("Электрика / solar — legacy assumption"),category:"ENERGY",cashEUR:num(raw.energyRefitEUR),upliftEUR:0});
  }
  return b;
}

function migrateState(raw){
  const state=raw&&typeof raw==="object"?raw:{};
  return {
    version:STATE_VERSION,
    settings:{...defaultSettings,...(state.settings||{})},
    boats:(Array.isArray(state.boats)&&state.boats.length?state.boats:[newBoat()]).map(migrateBoat)
  };
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

function boat(){return state.boats.find(x=>x.id===selectedId)||state.boats[0];}
function calc(b=boat()){return Core.calcCandidate(b,state.settings);}

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
      save();renderTable();renderComputed();renderImprovementTotals();renderMarinaPresets();
    };
  });
}

function renderTable(){
  const table=$("#boatsTable");
  const priority={BUY_ZONE:0,CONSIDER:1,NEGOTIATE:2,HOLD:3,WEAK:4,WALK_AWAY:5};
  const rows=state.boats.map(b=>({b,c:calc(b)})).sort((x,y)=>(priority[x.c.recommendationCode]??9)-(priority[y.c.recommendationCode]??9)||y.c.marginOfSafety-x.c.marginOfSafety);
  table.innerHTML=`<thead><tr>
    <th>Кандидат</th><th>Решение</th><th>Ask</th><th>Walk-away</th><th>Запас</th>
    <th>Cost-to-Habitable</th><th>Downside / мес</th><th>Логистика</th><th>Жильё</th><th>DIY value</th>
  </tr></thead><tbody></tbody>`;
  const body=table.querySelector("tbody");
  rows.forEach(({b,c})=>{
    const tr=document.createElement("tr"); if(b.id===selectedId)tr.classList.add("selected");
    const log=c.logistics.selected;
    const layout=`${num(b.cabins)||"?"} кают · ${num(b.berths)||"?"} мест`;
    tr.innerHTML=`
      <td><b>${escapeHtml(b.name)}</b><br><small>${escapeHtml(b.location||"локация ?")} · ${escapeHtml(b.sourceSite||"источник ?")}</small></td>
      <td><span class="tag ${c.recommendationClass}">${recommendationLabel(c)}</span></td>
      <td>${money(num(b.purchaseEUR))}</td>
      <td><b>${money(Math.max(0,c.walkAwayPrice))}</b></td>
      <td class="${c.marginOfSafety>=0?"positive":"negative"}">${signed(c.marginOfSafety)}</td>
      <td>${money(c.costToHabitable)}</td>
      <td>${money(c.downsideHousingCostMonthly)}</td>
      <td>${log?log.mode+" · "+money(log.cost):"?"}</td>
      <td>${layout}<br><small>${c.gates.habitability}</small></td>
      <td class="${c.improvements.net>=0?"positive":"negative"}">${signed(c.improvements.net)}</td>`;
    tr.onclick=()=>{selectedId=b.id;renderAll();};
    body.appendChild(tr);
  });
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
      if(k==="url"&&!b.sourceSite) b.sourceSite=sourceFromUrl(b.url);
      save();renderTable();renderComputed();renderLogisticsSummary();renderImprovementTotals();renderMarinaPresets();
    };
  });
  renderImprovementList();
  renderScoreInputs();
}

function optionCost(c,mode){
  const o=c.logistics.options.find(x=>x.mode===mode);
  return o?money(o.cost):"—";
}
function renderLogisticsSummary(){
  const b=boat(); if(!b)return; const c=calc(b);
  const selected=c.logistics.selected;
  $("#logisticsSummary").innerHTML=`
    <div><span>LOCAL</span><strong>${optionCost(c,"LOCAL")}</strong></div>
    <div><span>SEA</span><strong>${optionCost(c,"SEA")}</strong></div>
    <div><span>ROAD</span><strong>${optionCost(c,"ROAD")}</strong></div>
    <div><span>Выбрано</span><strong>${selected?selected.mode+" · "+money(selected.cost):"нет данных"}</strong></div>`;
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
function renderComputed(){
  const b=boat(); if(!b)return; const c=calc(b);
  const v=$("#verdict");
  let detail="";
  if(c.recommendationCode==="NEGOTIATE") detail=` · максимум ${money(Math.max(0,c.walkAwayPrice))}`;
  if(c.recommendationCode==="HOLD") detail=" · закройте UNKNOWN hard gates";
  v.className="verdict "+c.recommendationClass;
  v.innerHTML=`<strong>${recommendationLabel(c)}</strong>${detail}<small>${escapeHtml(b.location||"")} · ask ${money(num(b.purchaseEUR))}</small>`;

  $("#gateStrip").innerHTML=[
    gateBadge("Legal",c.gates.legal),gateBadge("Hull",c.gates.structural),
    gateBadge("Logistics",c.gates.logistics),gateBadge("Liveability",c.gates.habitability),gateBadge("Insurance",c.gates.insurance)
  ].join("");

  const log=c.logistics.selected;
  const metrics=[
    ["Цена объявления",money(num(b.purchaseEUR)),b.sourceSite||"источник не указан"],
    ["Walk-away",money(Math.max(0,c.walkAwayPrice)),"максимум по downside-бюджету"],
    ["Запас безопасности",signed(c.marginOfSafety),c.marginOfSafety>=0?"ask ниже потолка":"нужен торг / отбой"],
    ["Cost-to-Habitable",money(c.costToHabitable),"до пригодного жилого актива"],
    ["Downside / мес",money(c.downsideHousingCostMonthly),`лимит ≈ ${money(c.budgetEUR)}`],
    ["Base / мес",money(c.equivalentHousingCostMonthly),"с expected resale"],
    ["Downside Δ vs rent",signed(c.downsideDeltaVsRent),`аренда ${money(c.rentAlternative)} / горизонт`],
    ["Run-rate / мес",money(c.monthly),"марина + эксплуатация"],
    ["Логистика",log?money(log.cost):"—",log?log.mode:"нет подтверждённого пути"],
    ["Обязательный ремонт",money(c.mandatoryRefit),"до заселения"],
    ["DIY shadow",money(c.improvements.shadowEUR),`${c.improvements.hours.toFixed(0)} ч × ${num(state.settings.diyShadowRatePLN).toFixed(2)} PLN`],
    ["Value from work",signed(c.improvements.net),`uplift ${money(c.improvements.uplift)}`],
    ["Expected sale",money(c.netExpectedSale),"net after selling costs"],
    ["Quick-sale",money(c.netQuickSale),"downside liquidation"],
    ["Max price vs rent",money(Math.max(0,c.maxPurchaseVsRent)),"чтобы downside не проиграл аренде"],
    ["Quality",c.score.toFixed(0)+"/100",`Value index ${c.valueIndex.toFixed(1)}`]
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
    save();renderAll();
  };
  refresh();
}

function renderAll(editor=true){
  renderSettings();renderTable();if(editor)renderEditor();renderComputed();renderLogisticsSummary();renderImprovementTotals();renderMarinaPresets();
}

$$(".tab").forEach(t=>t.onclick=()=>{
  $$(".tab").forEach(x=>x.classList.remove("active"));$$(".tab-content").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");$("#tab-"+t.dataset.tab).classList.add("active");
});

$("#newBoatBtn").onclick=()=>{const b=newBoat();state.boats.push(b);selectedId=b.id;save();renderAll();};
$("#duplicateBtn").onclick=()=>{const src=boat(),b=JSON.parse(JSON.stringify(src));b.id=uid();b.name=(b.name||"Кандидат")+" — копия";b.improvements=(b.improvements||[]).map(x=>({...x,id:uid()}));state.boats.push(b);selectedId=b.id;save();renderAll();};
$("#deleteBtn").onclick=()=>{if(state.boats.length<=1)return alert("Оставьте хотя бы один кандидат.");state.boats=state.boats.filter(x=>x.id!==selectedId);selectedId=state.boats[0].id;save();renderAll();};
$("#addImprovementBtn").onclick=()=>{boat().improvements.push(newImprovement());save();renderAll();};
$("#exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="ilka-acquisition-radar.json";a.click();URL.revokeObjectURL(a.href);
};
$("#importInput").onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{state=migrateState(JSON.parse(r.result));selectedId=state.boats[0]?.id;save();renderAll();}catch{alert("Не удалось прочитать JSON");}};
  r.readAsText(f);
};

renderAll();
loadMarinaEvidence();
