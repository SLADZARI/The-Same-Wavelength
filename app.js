const STORAGE_KEY = "ilka-boat-value-v1";

const scoreDefs = [
  ["hullScore","Корпус / мореходность",25],
  ["layoutScore","Планировка / приватность",20],
  ["propulsionScore","Двигатель / экономичность",15],
  ["comfortScore","Liveaboard комфорт",15],
  ["refitEaseScore","Простота переделки",10],
  ["energyScore","Solar / электрика",5],
  ["docsScore","Документы / ликвидность",10],
];

const defaults = {
  settings:{rentPLN:3150,budgetUSD:1000,plnPerEur:4.30,usdPerEur:1.15,horizonMonths:12},
  boats:[newBoat("Hamburg template 10.5 × 3.3")]
};

function newBoat(name="Новый кандидат"){
  return {
    id: crypto.randomUUID(), name, url:"", location:"Hamburg, DE", purchaseEUR:5000,
    lengthM:10.5,beamM:3.3,draftM:1.0,displacementT:10,transportHeightM:3.4,material:"Steel",
    cabins:1,berths:4,engineStatus:"running",engineCount:1,engineHP:75,fuelBurnLPH:5,cruiseKn:6,selfPropFeasible:true,
    seaDistanceNm:465,seaTimeFactor:1.15,dieselEUR:2.0,canalFeesEUR:20,enRouteMarinasEUR:250,crewFoodEUR:350,crewTravelEUR:200,seaPrepEUR:700,seaContingencyEUR:500,
    roadDistanceKm:750,roadTransportEUR:3500,loadingCraneEUR:400,unloadingCraneEUR:500,permitsEscortEUR:1200,roadPrepEUR:300,roadContingencyEUR:500,
    surveyDocsEUR:400,hullRefitEUR:800,mechanicalRefitEUR:500,safetyRefitEUR:350,interiorRefitEUR:1000,energyRefitEUR:1200,initialReserveEUR:500,resaleEUR:8000,
    marinaMonthlyEUR:250,insuranceMonthlyEUR:45,maintenanceMonthlyEUR:150,electricityMonthlyEUR:60,heatingMonthlyEUR:50,localFuelMonthlyEUR:40,internetMonthlyEUR:30,winterMonthlyEUR:70,miscMonthlyEUR:50,
    hullScore:7,layoutScore:6,propulsionScore:7,comfortScore:6,refitEaseScore:7,energyScore:8,docsScore:6
  }
}

let state = load();
let selectedId = state.boats[0]?.id;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const num = v => Number(v)||0;

function load(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(defaults); }
  catch { return structuredClone(defaults); }
}
function save(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  $("#saveState").textContent="сохранено";
  setTimeout(()=>$("#saveState").textContent="автосохранение",700);
}
function boat(){ return state.boats.find(b=>b.id===selectedId) || state.boats[0]; }

function calc(b){
  const s=state.settings;
  const speed=Math.max(num(b.cruiseKn),0.1);
  const hours=num(b.seaDistanceNm)/speed*Math.max(num(b.seaTimeFactor),1);
  const fuelLitres=hours*num(b.fuelBurnLPH);
  const seaFuel=fuelLitres*num(b.dieselEUR);
  const seaCost=seaFuel+num(b.canalFeesEUR)+num(b.enRouteMarinasEUR)+num(b.crewFoodEUR)+num(b.crewTravelEUR)+num(b.seaPrepEUR)+num(b.seaContingencyEUR);
  const roadCost=num(b.roadTransportEUR)+num(b.loadingCraneEUR)+num(b.unloadingCraneEUR)+num(b.permitsEscortEUR)+num(b.roadPrepEUR)+num(b.roadContingencyEUR);
  const logisticsMode=b.selfPropFeasible && seaCost<roadCost ? "sea" : "road";
  const logisticsCost=logisticsMode==="sea"?seaCost:roadCost;

  const refit=num(b.surveyDocsEUR)+num(b.hullRefitEUR)+num(b.mechanicalRefitEUR)+num(b.safetyRefitEUR)+num(b.interiorRefitEUR)+num(b.energyRefitEUR)+num(b.initialReserveEUR);
  const landed=num(b.purchaseEUR)+logisticsCost+refit;

  const monthly=num(b.marinaMonthlyEUR)+num(b.insuranceMonthlyEUR)+num(b.maintenanceMonthlyEUR)+num(b.electricityMonthlyEUR)+num(b.heatingMonthlyEUR)+num(b.localFuelMonthlyEUR)+num(b.internetMonthlyEUR)+num(b.winterMonthlyEUR)+num(b.miscMonthlyEUR);
  const months=Math.max(num(s.horizonMonths),1);
  const cash=landed+monthly*months;
  const economic=cash-num(b.resaleEUR);
  const rentEUR=num(s.rentPLN)/Math.max(num(s.plnPerEur),.01);
  const rentAlternative=rentEUR*months;
  const deltaVsRent=economic-rentAlternative;
  const budgetEUR=num(s.budgetUSD)/Math.max(num(s.usdPerEur),.01);
  const allInEconomicMonthly=economic/months;
  const runRateVsBudget=monthly/budgetEUR;
  const housingSaving=rentEUR-monthly;
  const upfrontAtRisk=Math.max(0,landed-num(b.resaleEUR));
  const payback=housingSaving>0?upfrontAtRisk/housingSaving:Infinity;

  let score=0;
  scoreDefs.forEach(([k,,w])=>score+=Math.max(0,Math.min(10,num(b[k])))/10*w);

  const valueBase=Math.max(economic,500);
  const valueIndex=score/(valueBase/1000);

  let verdict,verdictClass;
  if(score>=70 && allInEconomicMonthly<=budgetEUR && deltaVsRent<=0){verdict="Сильный кандидат";verdictClass="green"}
  else if(score>=60 && allInEconomicMonthly<=budgetEUR*1.2 && deltaVsRent<=3000){verdict="Стоит рассматривать";verdictClass="yellow"}
  else {verdict="Нужна осторожность";verdictClass="red"}

  return {hours,fuelLitres,seaFuel,seaCost,roadCost,logisticsMode,logisticsCost,refit,landed,monthly,cash,economic,rentEUR,rentAlternative,deltaVsRent,budgetEUR,allInEconomicMonthly,runRateVsBudget,housingSaving,payback,score,valueIndex,verdict,verdictClass};
}

function renderSettings(){
  Object.keys(state.settings).forEach(k=>{
    const el=$("#"+k); if(!el)return; el.value=state.settings[k];
    el.oninput=()=>{state.settings[k]=num(el.value);save();renderAll(false)}
  });
}

function renderTable(){
  const table=$("#boatsTable");
  table.innerHTML=`<thead><tr><th>Кандидат</th><th>Цена</th><th>Габариты</th><th>Логистика</th><th>Landed</th><th>€/мес</th><th>Δ vs rent</th><th>Score</th><th>Value</th></tr></thead><tbody></tbody>`;
  const body=table.querySelector("tbody");
  state.boats.forEach(b=>{
    const c=calc(b);
    const tr=document.createElement("tr"); if(b.id===selectedId)tr.classList.add("selected");
    const dot=c.verdictClass==="green"?"good":c.verdictClass==="yellow"?"warn":"bad";
    tr.innerHTML=`<td><span class="status-dot ${dot}"></span><b>${escapeHtml(b.name)}</b><br><small>${escapeHtml(b.location||"")}</small></td>
      <td>${money(num(b.purchaseEUR))}</td>
      <td>${num(b.lengthM).toFixed(1)} × ${num(b.beamM).toFixed(2)} m</td>
      <td>${c.logisticsMode==="sea"?"морем":"авто"} · ${money(c.logisticsCost)}</td>
      <td><b>${money(c.landed)}</b></td>
      <td>${money(c.monthly)}</td>
      <td>${signedMoney(c.deltaVsRent)}</td>
      <td>${c.score.toFixed(0)}/100</td>
      <td>${c.valueIndex.toFixed(1)}</td>`;
    tr.onclick=()=>{selectedId=b.id;renderAll()};
    body.appendChild(tr);
  });
}
function signedMoney(n){return (n>0?"+":"")+money(n)}

function renderEditor(){
  const b=boat(); if(!b)return;
  $("#boatTitle").textContent=b.name;
  $$("[data-field]").forEach(el=>{
    const k=el.dataset.field;
    if(!(k in b))return;
    if(el.type==="checkbox")el.checked=!!b[k]; else el.value=b[k];
    el.oninput=()=>{
      b[k]=el.type==="checkbox"?el.checked:(el.type==="number"||el.type==="range"?num(el.value):el.value);
      if(k==="name")$("#boatTitle").textContent=b.name;
      save();renderComputed();renderTable();
    }
  });
  renderScoreInputs();
}
function renderScoreInputs(){
  const b=boat(), wrap=$("#scoreInputs"); wrap.innerHTML="";
  scoreDefs.forEach(([k,label,w])=>{
    const row=document.createElement("div");row.className="score-row";
    row.innerHTML=`<label>${label} <span class="hint">(${w}%)</span></label><input type="range" min="0" max="10" step="1" value="${b[k]}"><div class="score-value">${b[k]}</div>`;
    const input=row.querySelector("input"), val=row.querySelector(".score-value");
    input.oninput=()=>{b[k]=num(input.value);val.textContent=input.value;save();renderComputed();renderTable()};
    wrap.appendChild(row);
  });
}

function renderComputed(){
  const b=boat(); if(!b)return; const c=calc(b);
  $("#seaCostInline").textContent=b.selfPropFeasible?money(c.seaCost):"не доступно";
  $("#roadCostInline").textContent=money(c.roadCost);
  $("#logisticsChoiceInline").textContent=c.logisticsMode==="sea"?"Своим ходом":"Автотранспорт";

  const v=$("#verdict");v.className="verdict "+c.verdictClass;v.innerHTML=`${c.verdict} · ${c.score.toFixed(0)}/100`;

  const metrics=[
    ["Landed cost",money(c.landed),`${c.logisticsMode==="sea"?"морем":"авто"} · логистика ${money(c.logisticsCost)}`],
    ["Run-rate / мес",money(c.monthly),`лимит ≈ ${money(c.budgetEUR)}`],
    ["12m cash",money(c.cash),"фактический денежный отток"],
    ["12m economic",money(c.economic),`после resale ${money(num(b.resaleEUR))}`],
    ["Δ vs квартира",signedMoney(c.deltaVsRent),`аренда ≈ ${money(c.rentAlternative)} / горизонт`],
    ["Экономия жилья / мес",signedMoney(c.housingSaving),c.housingSaving>0?"лодка дешевле аренды по run-rate":"run-rate выше аренды"],
    ["Перегон морем",b.selfPropFeasible?money(c.seaCost):"—",`${c.hours.toFixed(0)} h · ${c.fuelLitres.toFixed(0)} L`],
    ["Автоперевозка",money(c.roadCost),`${num(b.beamM).toFixed(2)} m ширина`],
    ["Value index",c.valueIndex.toFixed(1),"score / €1k economic cost"],
    ["Payback",Number.isFinite(c.payback)?c.payback.toFixed(1)+" мес":"—","capital-at-risk / housing saving"],
  ];
  $("#metrics").innerHTML=metrics.map(([a,bv,sm])=>`<div class="metric"><span>${a}</span><strong>${bv}</strong><small>${sm}</small></div>`).join("");
  drawRadar(b);
}
function drawRadar(b){
  const svg=$("#radar"), cx=180,cy=180,R=118,N=scoreDefs.length;
  const pts=(radius,vals=null)=>scoreDefs.map((_,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/N, rr=vals?radius*vals[i]/10:radius;
    return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]
  });
  const poly=a=>a.map(p=>p.join(",")).join(" ");
  let html="";
  [0.25,0.5,0.75,1].forEach(k=>html+=`<polygon points="${poly(pts(R*k))}" fill="none" stroke="#26384b" stroke-width="1"/>`);
  pts(R).forEach(p=>html+=`<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#26384b"/>`);
  const vals=scoreDefs.map(([k])=>num(b[k]));
  html+=`<polygon points="${poly(pts(R,vals))}" fill="rgba(103,211,176,.18)" stroke="#67d3b0" stroke-width="2"/>`;
  scoreDefs.forEach(([,label],i)=>{
    const a=-Math.PI/2+i*2*Math.PI/N, rr=R+30, x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
    const anchor=x<cx-8?"end":x>cx+8?"start":"middle";
    html+=`<text x="${x}" y="${y}" fill="#90a4b8" font-size="10" text-anchor="${anchor}" dominant-baseline="middle">${label.split("/")[0].trim()}</text>`;
  });
  svg.innerHTML=html;
}
function renderAll(editor=true){renderSettings();renderTable();if(editor)renderEditor();renderComputed()}

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

$$(".tab").forEach(t=>t.onclick=()=>{
  $$(".tab").forEach(x=>x.classList.remove("active")); $$(".tab-content").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");$("#tab-"+t.dataset.tab).classList.add("active")
});

$("#newBoatBtn").onclick=()=>{const b=newBoat();state.boats.push(b);selectedId=b.id;save();renderAll()};
$("#duplicateBtn").onclick=()=>{const src=boat();const b=structuredClone(src);b.id=crypto.randomUUID();b.name+=" — копия";state.boats.push(b);selectedId=b.id;save();renderAll()};
$("#deleteBtn").onclick=()=>{if(state.boats.length<=1)return alert("Оставьте хотя бы одного кандидата.");const i=state.boats.findIndex(x=>x.id===selectedId);state.boats.splice(i,1);selectedId=state.boats[0].id;save();renderAll()};
$("#exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="ilka-boat-calculator.json";a.click();URL.revokeObjectURL(a.href)
};
$("#importInput").onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{state=JSON.parse(r.result);selectedId=state.boats[0]?.id;save();renderAll()}catch{alert("Не удалось прочитать JSON")}};r.readAsText(f)
};

renderAll();
