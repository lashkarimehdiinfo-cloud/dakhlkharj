
/* ---------- utils ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const fa=n=>Number(n||0).toLocaleString("fa-IR");
const CURS=[["toman","تومان"],["rial","ریال"],["usd","دلار"],["eur","یورو"],["gbp","پوند"],["cny","یوان"]];
let UNIT="";try{UNIT=localStorage.getItem("home-unit")||""}catch(e){}
let RATES={};try{RATES=JSON.parse(localStorage.getItem("home-rates")||"{}")}catch(e){}
const curU=()=>{const u=UNIT||(S&&S.unit)||"toman";return (u==="toman"||u==="rial"||RATES[u]>0)?u:"toman"};
const RIAL=()=>curU()==="rial";const FX=()=>!["toman","rial"].includes(curU());
const U=()=>(CURS.find(c=>c[0]===curU())||CURS[0])[1];
const F=()=>{const u=curU();return u==="rial"?10:u==="toman"?1:1/RATES[u]};
function setUnit(u){UNIT=u;try{localStorage.setItem("home-unit",u)}catch(e){}}
const toman=n=>{const v=Math.abs(n*F());return (n<0?"منفی ":"")+(FX()?(+v.toFixed(2)).toLocaleString("fa-IR",{maximumFractionDigits:2}):fa(Math.round(v)))+" "+U()};
const enDigits=s=>String(s??"").replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
const num=s=>Number(enDigits(s).replace(/[^\d.]/g,""))||0;
const norm=s=>String(s||"").replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/[\s‌‌-]/g,"").toLowerCase();
function g2j(gy,gm,gd){const g=[0,31,59,90,120,151,181,212,243,273,304,334];const gy2=gm>2?gy+1:gy;let d=355666+365*gy+~~((gy2+3)/4)-~~((gy2+99)/100)+~~((gy2+399)/400)+gd+g[gm-1];let jy=-1595+33*~~(d/12053);d%=12053;jy+=4*~~(d/1461);d%=1461;if(d>365){jy+=~~((d-1)/365);d=(d-1)%365}const jm=d<186?1+~~(d/31):7+~~((d-186)/30);const jd=d<186?1+d%31:1+(d-186)%30;return[jy,jm,jd]}
function j2g(jy,jm,jd){jy+=1595;let d=-355668+365*jy+~~(jy/33)*8+~~(((jy%33)+3)/4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186);let gy=400*~~(d/146097);d%=146097;if(d>36524){gy+=100*~~(--d/36524);d%=36524;if(d>=365)d++}gy+=4*~~(d/1461);d%=1461;if(d>365){gy+=~~((d-1)/365);d=(d-1)%365}let gd=d+1;const s=[0,31,(gy%4===0&&gy%100!==0)||gy%400===0?29:28,31,30,31,30,31,31,30,31,30,31];let gm;for(gm=0;gm<13&&gd>s[gm];gm++)gd-=s[gm];return[gy,gm,gd]}
const MONTHS=["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const WDAYS=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];
const pad=n=>String(n).padStart(2,"0");
function todayJ(){const d=new Date();return g2j(d.getFullYear(),d.getMonth()+1,d.getDate())}
const jstr=a=>a[0]+"/"+pad(a[1])+"/"+pad(a[2]);
const jparse=s=>{const m=enDigits(s||"").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);return m?[+m[1],+m[2],+m[3]]:null};
const jfa=s=>{const a=jparse(s);return a?fa(a[2])+" "+MONTHS[a[1]-1]+(a[0]!==todayJ()[0]?" "+String(a[0]).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]):""):""};
const jToDate=s=>{const a=jparse(s);if(!a)return null;const g=j2g(...a);return new Date(g[0],g[1]-1,g[2])};
function daysUntil(s){const d=jToDate(s);if(!d)return null;const t=new Date();t.setHours(0,0,0,0);return Math.round((d-t)/864e5)}
function addMonthsJ(s,k){const a=jparse(s);let y=a[0],m=a[1]-1+k;y+=Math.floor(m/12);m=((m%12)+12)%12;const max=m<6?31:m<11?30:29;return jstr([y,m+1,Math.min(a[2],max)])}
const weekIdx=()=>(new Date().getDay()+1)%7;

/* ---------- data ---------- */
const OUT_CATS=["سوپرمارکت","میوه و سبزی","گوشت و مرغ","نان","رستوران و بیرون‌بر","قبض‌ها","اجاره","بنزین و رفت‌وآمد","درمان","پوشاک","تفریح","اقساط","پس‌انداز","سایر"];
const IN_CATS=["حقوق","پاداش","فروش","سایر درآمد"];
const RCATS=[["","همه"],["غذای اصلی","🍲 غذای اصلی"],["سوپ","🥣 سوپ و آش"],["سالاد","🥗 سالاد"],["پیش‌غذا","🥙 پیش‌غذا"],["سس","🥫 سس"],["دسر","🍮 دسر"],["کیک","🍰 کیک"],["شیرینی","🍪 شیرینی"],["تنقلات","🍟 تنقلات"],["نوشیدنی","🥤 نوشیدنی"],["صبحانه","🍳 صبحانه"],["نان","🥖 نان"]];
const CATE={"سوپ":"🥣","سالاد":"🥗","پیش‌غذا":"🥙","سس":"🥫","دسر":"🍮","کیک":"🍰","شیرینی":"🍪","تنقلات":"🍟","نوشیدنی":"🥤","صبحانه":"🍳","نان":"🥖"};
function catOf(r){if(r.g)return r.g;const n=r.n;
  if(/سوپ|آش|عدسی|حلیم|کله‌جوش|آبگوشت|دیزی/.test(n))return "سوپ";if(/سالاد|ماست و خیار|بورانی|الویه/.test(n))return "سالاد";
  if(/فرنی|شیربرنج|شله‌زرد/.test(n))return "دسر";if(/کیک/.test(n))return "کیک";if(/شیرینی|نان برنجی/.test(n))return "شیرینی";
  if(/پنکیک|نیمرو|املت|نان و پنیر/.test(n))return "صبحانه";if(/ساندویچ|سیب‌زمینی تنوری|پوره/.test(n))return "تنقلات";return "غذای اصلی"}
const originOf=r=>r.o||(r.c?"غذای من":"ایران");
let mealCat="",mealOrigin="",mealLimit=60;
const allRecipes=()=>{const seen=new Set();return [...(Array.isArray(S.recipes)?S.recipes.map(r=>({...r,c:true})):[]),...RECIPES,...RECIPES2,...RECIPES3].filter(r=>{if(seen.has(r.n))return false;seen.add(r.n);return true})};
let mealOnly=true,mealQ="";
function recipeSheet(name){const r=scoreRecipes().find(x=>x.n===name);if(!r)return;
  sheet(`<div class="row between"><h2 style="margin:0">${CATE[catOf(r)]||recE(r.n)} ${esc(r.n)}</h2><span class="pill">${esc(originOf(r))}</span>${r.t?`<span class="pill">⏱ ${esc(r.t)}</span>`:""}</div>
  <b style="display:block;margin-top:12px">🧺 مواد لازم</b>
  <div class="list">${r.i.map(x=>`<div class="item">${have(x)?"✅":"❌"}<span class="t ${have(x)?"":"out"}">${esc(x)}</span>${have(x)?`<span class="pill ok">داری</span>`:`<span class="pill bad">نداری</span>`}</div>`).join("")}</div>
  ${r.s&&r.s.length?`<b style="display:block;margin-top:12px">👩‍🍳 طرز تهیه</b><ol style="padding-inline-start:20px;margin:6px 0;line-height:1.9">${r.s.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:`<p class="muted">طرز تهیه ثبت نشده.</p>`}
  <div class="row" style="flex-wrap:wrap;margin-top:12px">${r.miss.length?`<button class="btn small" data-miss="${esc(r.n)}">🛒 ${fa(r.miss.length)} کمبود به لیست خرید</button>`:""}<button class="btn small ghost" data-plan-pick="${esc(r.n)}">📅 به برنامه هفته</button>${r.c?`<button class="btn small ghost" data-recedit="${esc(r.id)}">ویرایش</button><button class="btn small ghost" data-recdel="${esc(r.id)}" style="color:var(--out)">حذف</button>`:""}</div>`,
  (sh,close)=>sh.addEventListener("click",e=>{if(e.target.closest("[data-miss],[data-plan-pick],[data-recedit],[data-recdel]"))setTimeout(close,50)}))}
function recipeForm(r={}){
  sheet(`<h2 style="margin-top:0">${r.id?"ویرایش غذا":"🍲 غذای جدید"}</h2><form class="stack" id="rf">
   <div class="field"><label for="r_n">اسم غذا</label><input type="text" id="r_n" value="${esc(r.n||"")}" placeholder="مثلاً خورش کرفس"></div>
   <div class="field"><label for="r_t">زمان پخت (اختیاری)</label><input type="text" id="r_t" value="${esc(r.t||"")}" placeholder="مثلاً ۲ ساعت"></div>
   <div class="field"><label for="r_i">مواد لازم (هر کدام یک خط یا با ویرگول)</label><textarea id="r_i" rows="4" placeholder="گوشت&#10;کرفس&#10;پیاز">${esc((r.i||[]).join("\n"))}</textarea></div>
   <div class="field"><label for="r_s">طرز تهیه (هر مرحله یک خط)</label><textarea id="r_s" rows="6" placeholder="پیاز را سرخ کن&#10;گوشت را اضافه کن…">${esc((r.s||[]).join("\n"))}</textarea></div>
   <div class="row"><button class="btn grow" type="submit">ذخیره</button><button class="btn ghost" type="button" id="r_x">انصراف</button></div></form>`,
  (sh,close)=>{sh.querySelector("#r_x").onclick=close;sh.querySelector("#rf").onsubmit=e=>{e.preventDefault();
    const n=sh.querySelector("#r_n").value.trim();const i=sh.querySelector("#r_i").value.split(/[\n،,]+/).map(x=>x.trim()).filter(Boolean);
    const st=sh.querySelector("#r_s").value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
    if(!n||!i.length){toast("اسم غذا و مواد لازم را بنویس");return}
    if(!Array.isArray(S.recipes))S.recipes=[];const o={n,t:sh.querySelector("#r_t").value.trim(),i,s:st};
    if(r.id){const x=S.recipes.find(q=>q.id===r.id);Object.assign(x,o)}else S.recipes.unshift({id:uid(),...o});
    close();save();render();toast("غذا ذخیره شد ✓")}})}
document.addEventListener("click",e=>{if(e.target.closest("[data-miss],[data-plan-pick]"))return;const mc=e.target.closest("[data-mcat],[data-morg],[data-act=mealMore]");if(mc){if(mc.dataset.act==="mealMore")mealLimit+=60;else{if(mc.dataset.mcat!==undefined)mealCat=mc.dataset.mcat;if(mc.dataset.morg!==undefined)mealOrigin=mc.dataset.morg;mealLimit=60}render();return}
  const t=e.target.closest("[data-rec],[data-recedit],[data-recdel],[data-act=addRecipe],[data-act=mealOnly]");if(!t)return;
  if(t.dataset.rec)recipeSheet(t.dataset.rec);
  else if(t.dataset.recedit)recipeForm((S.recipes||[]).find(x=>x.id===t.dataset.recedit));
  else if(t.dataset.recdel){S.recipes=(S.recipes||[]).filter(x=>x.id!==t.dataset.recdel);save();render();toast("حذف شد")}
  else if(t.dataset.act==="addRecipe")recipeForm();
  else if(t.dataset.act==="mealOnly"){mealOnly=t.dataset.v==="1";mealLimit=60;render()}},true);
document.addEventListener("input",e=>{if(e.target.id!=="mealq")return;mealQ=e.target.value;clearTimeout(window._mq);window._mq=setTimeout(()=>{render();const i=$("#mealq");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},300)});
function sample0(){
  const T=jstr(todayJ()),acc1=uid(),acc2=uid();
  return {name:"مهدی",example:true,
    accounts:[{id:acc1,name:"کارت حقوق",type:"card",init:4000000},{id:acc2,name:"نقدی",type:"cash",init:500000}],
    tx:[
      {id:uid(),type:"in",amount:25000000,cat:"حقوق",acc:acc1,date:T,note:"حقوق ماه"},
      {id:uid(),type:"out",amount:1850000,cat:"سوپرمارکت",acc:acc1,date:T,note:"خرید هفتگی"},
      {id:uid(),type:"out",amount:620000,cat:"میوه و سبزی",acc:acc2,date:T,note:""},
      {id:uid(),type:"out",amount:980000,cat:"رستوران و بیرون‌بر",acc:acc1,date:T,note:"پیتزا"},
      {id:uid(),type:"out",amount:2400000,cat:"گوشت و مرغ",acc:acc1,date:T,note:""}],
    inst:[{id:uid(),title:"اقساط یخچال",amount:3200000,count:12,start:addMonthsJ(T,0).slice(0,8)+pad(Math.min(todayJ()[2]+3,29)),acc:acc1,paid:[0,1,2]}],
    shop:[{id:uid(),name:"نان سنگک",qty:"۲ عدد",done:false},{id:uid(),name:"ماست",qty:"۱ سطل",done:false},{id:uid(),name:"پیاز",qty:"۱ کیلو",done:true}],
    todo:[{id:uid(),text:"پرداخت قبض گاز",due:T,done:false},{id:uid(),text:"سرویس کولر",due:"",done:false}],
    fridge:[{id:uid(),name:"تخم‌مرغ",qty:"۸ عدد",loc:"یخچال",exp:""},{id:uid(),name:"گوجه",qty:"۱ کیلو",loc:"یخچال",exp:addDays(T,2)},
      {id:uid(),name:"مرغ",qty:"۱ کیلو",loc:"فریزر",exp:""},{id:uid(),name:"برنج",qty:"۵ کیلو",loc:"کابینت",exp:""},
      {id:uid(),name:"سیب‌زمینی",qty:"۲ کیلو",loc:"کابینت",exp:""},{id:uid(),name:"عدس",qty:"۱ کیلو",loc:"کابینت",exp:""},{id:uid(),name:"پیاز",qty:"۱ کیلو",loc:"کابینت",exp:""}],
    plan:{},
    save:[{id:uid(),title:"سفر عید",target:30000000,saved:6000000}]
  };
}
function addDays(s,k){const d=jToDate(s);d.setDate(d.getDate()+k);return jstr(g2j(d.getFullYear(),d.getMonth()+1,d.getDate()))}
let S=null;const KEY="home-budget-v1";
function blank(){return {name:"مهدی",accounts:[{id:uid(),name:"نقدی",type:"cash",init:0}],tx:[],inst:[],shop:[],todo:[],fridge:[],plan:{},save:[],budgets:[],bills:[],cheques:[],debts:[],recipes:[],events:[]}}
try{const r=localStorage.getItem(KEY);if(r)S=JSON.parse(r)}catch(e){}
if(!S)S=sample0();
let dbRef=null,saveT=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  clearTimeout(saveT);saveT=setTimeout(()=>{if(dbRef)dbRef.set({state:JSON.stringify(S),at:Date.now()}).catch(()=>{})},700)}
(async()=>{try{
  const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);if(!db||!user)return;
  const id=await user.id();if(!id)return;dbRef=db.doc("data/users/"+id+"/home");
  const snap=await dbRef.get();
  if(snap.exists){const d=snap.data();if(d&&d.state){const loc=S;S=JSON.parse(d.state);if(!S.auth&&loc.auth)S.auth=loc.auth;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}}
  else save();
  vaultRef=db.doc("data/users/"+id+"/vault");const vs=await vaultRef.get();
  if(vs.exists&&vs.data().box){VBOX=JSON.parse(vs.data().box);try{localStorage.setItem(KEY+"-vault",vs.data().box)}catch(e){}}
  else if(VBOX)vaultRef.set({box:JSON.stringify(VBOX),at:Date.now()}).catch(()=>{});
}catch(e){}finally{setTimeout(()=>readyRes(),0)}})();
let SAMPLE=null,IMG=false;
(async()=>{try{SAMPLE=await claude.use("sample");if(SAMPLE){const l=await SAMPLE.limits().catch(()=>null);IMG=!!(l&&l.images)}render()}catch(e){}})();

/* ---------- derived ---------- */
const accById=id=>S.accounts.find(a=>a.id===id);
function balance(acc){return (acc.init||0)+S.tx.filter(t=>t.acc===acc.id).reduce((s,t)=>s+(t.type==="in"?t.amount:-t.amount),0)}
const monthKey=s=>{const a=jparse(s);return a?a[0]*100+a[1]:0};
function monthTx(ym){return S.tx.filter(t=>monthKey(t.date)===ym)}
function instDue(it,i){return addMonthsJ(it.start,i)}
function instNext(it){for(let i=0;i<it.count;i++)if(!it.paid.includes(i))return i;return -1}
const STAPLES=["پیاز","سیر","رب گوجه","آرد","زعفران","شکر","کره","گلپر","ادویه"];
const stapOn=()=>{try{return localStorage.getItem("home-stap")!=="0"}catch(e){return true}};
const ingMatch=(a,b)=>{a=norm(a);b=norm(b);if(!a||!b)return false;if(a===b)return true;const [s,l]=a.length<=b.length?[a,b]:[b,a];if(s.length<3)return false;
  if(l.startsWith(s))return !(s==="سیب"&&l.startsWith("سیبزمینی"));if(l.endsWith(s))return !l.startsWith("تخم");return false};
function have(ing){if(stapOn()&&STAPLES.some(x=>norm(x)===norm(ing)))return true;return S.fridge.some(f=>ingMatch(f.name,ing))}
function scoreRecipes(){return allRecipes().map(r=>{const miss=r.i.filter(x=>!have(x));return {...r,miss,score:(r.i.length-miss.length)/r.i.length}}).sort((a,b)=>b.score-a.score||a.miss.length-b.miss.length)}
function greeting(){const h=new Date().getHours();return h<5?"شب بخیر":h<11?"صبح بخیر":h<16?"ظهر بخیر":h<20?"عصر بخیر":"شب بخیر"}
function alerts(){
  const A=[];
  S.inst.forEach(it=>{const i=instNext(it);if(i<0)return;const d=daysUntil(instDue(it,i));
    if(d!==null&&d<=5)A.push({bad:d<0,t:`قسط ${it.title}`,s:d<0?`${fa(-d)} روز عقب افتاده — ${toman(it.amount)}`:d===0?`امروز — ${toman(it.amount)}`:`${fa(d)} روز دیگر — ${toman(it.amount)}`,go:"inst"})});
  S.fridge.forEach(f=>{if(!f.exp)return;const d=daysUntil(f.exp);if(d!==null&&d<=2)A.push({bad:d<0,t:f.name,s:d<0?"تاریخش گذشته":d===0?"امروز باید مصرف شود":`${fa(d)} روز تا انقضا`,go:"kitchen"})});
  S.todo.forEach(t=>{if(t.done||!t.due)return;const d=daysUntil(t.due);if(d!==null&&d<=0)A.push({bad:d<0,t:t.text,s:d<0?"کار عقب افتاده":"کار امروز",go:"todo"})});
  const n=S.shop.filter(x=>!x.done).length;if(n)A.push({t:"لیست خرید",s:`${fa(n)} قلم مانده`,go:"shop"});
  A.push(...eventAlerts(),...extraAlerts());
  const p=S.plan[weekIdx()];if(p&&(p.l||p.d))A.push({t:"غذای امروز",s:[p.l&&"ناهار: "+p.l,p.d&&"شام: "+p.d].filter(Boolean).join(" · "),go:"kitchen"});
  return A;
}

/* ---------- ui helpers ---------- */
let route="home",sub=null,kTab="fridge",fLoc="همه",repM=null,txFilter="all",hM=0,hCat="all",hType="all",hQ="";
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}
let ENTER=false,LASTH="";function go(r,s=null){route=r;sub=s;ENTER=true;render();scrollTo(0,0)}
function sheet(html,bind){const bg=document.createElement("div");bg.className="sheet-bg";bg.innerHTML=`<div class="sheet" role="dialog">${html}</div>`;
  bg.addEventListener("click",e=>{if(e.target===bg)bg.remove()});document.body.appendChild(bg);bind&&bind(bg.querySelector(".sheet"),()=>bg.remove());return bg}
function moneyInput(el){el.addEventListener("input",()=>{if(FX()){el.value=enDigits(el.value).replace(/[^\d.]/g,"");return}const v=num(el.value);el.value=v?v.toLocaleString("en"):""})}
function form(title,fields,onSave,extra=""){
  const html=`<h2 style="margin-top:0">${esc(title)}</h2><form class="stack" id="f">${fields.map(f=>{
    const v=f.value??"";
    if(f.type==="seg")return `<div class="seg" data-k="${f.k}">${f.options.map(o=>`<button type="button" data-v="${esc(o[0])}" class="${o[0]===v?"on":""}">${esc(o[1])}</button>`).join("")}</div>`;
    if(f.type==="select")return `<div class="field"><label for="f_${f.k}">${f.label}</label><select id="f_${f.k}" name="${f.k}">${f.options.map(o=>{const[val,lab]=Array.isArray(o)?o:[o,o];return `<option value="${esc(val)}" ${val===v?"selected":""}>${esc(lab)}</option>`}).join("")}</select></div>`;
    const im=f.type==="money"||f.type==="int"?'inputmode="numeric"':f.type==="jdate"?'inputmode="numeric" placeholder="۱۴۰۵/۰۸/۱۷"':"";
    const val=f.type==="money"&&v?(FX()?String(+(Number(v)*F()).toFixed(2)):Math.round(Number(v)*F()).toLocaleString("en")):v;
    return `<div class="field"><label for="f_${f.k}">${f.label}${f.type==="jdate"?' <span class="muted">(سال/ماه/روز)</span>':""}</label><input type="text" id="f_${f.k}" name="${f.k}" ${im} value="${esc(val)}" ${f.ph?`placeholder="${esc(f.ph)}"`:""} autocomplete="off"></div>`}).join("")}
    ${extra}<div class="row"><button class="btn grow" type="submit">ذخیره</button><button class="btn ghost" type="button" id="cx">انصراف</button></div></form>`;
  sheet(html,(sh,close)=>{
    sh.querySelectorAll(".seg").forEach(sg=>sg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;sg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));sg.dispatchEvent(new Event("change",{bubbles:true}))}));
    fields.filter(f=>f.type==="money").forEach(f=>moneyInput(sh.querySelector("#f_"+f.k)));
    sh.querySelector("#cx").onclick=close;
    fields.onMount&&fields.onMount(sh);
    sh.querySelector("#f").onsubmit=e=>{e.preventDefault();const o={};fields.forEach(f=>{
      if(f.type==="seg"){o[f.k]=sh.querySelector(`.seg[data-k="${f.k}"] .on`)?.dataset.v;return}
      const val=sh.querySelector("#f_"+f.k).value.trim();
      o[f.k]=f.type==="money"?num(val)/F():f.type==="int"?num(val):f.type==="jdate"?(jparse(val)?jstr(jparse(val)):""):val});
      if(onSave(o,sh)!==false){close();save();render()}};
    setTimeout(()=>sh.querySelector("input[type=text]")?.focus(),60);
  });
}
function delBtn(onDel,label="حذف"){return {label,onDel}}
// two-tap delete
document.addEventListener("click",e=>{const b=e.target.closest("[data-del]");if(!b)return;e.stopPropagation();
  if(b.dataset.armed){const [coll,id]=b.dataset.del.split(":");S[coll]=S[coll].filter(x=>x.id!==id);save();render();return}
  b.dataset.armed=1;b.textContent="مطمئنی؟";b.classList.add("danger");setTimeout(()=>{if(b.isConnected){delete b.dataset.armed;b.textContent="حذف"}},2500)},true);

/* ---------- forms ---------- */
function txForm(t={},preset={}){
  const isNew=!t.id;const type=t.type||preset.type||"out";
  const accs=S.accounts.map(a=>[a.id,a.name]);
  const fields=[
    {k:"type",type:"seg",value:type,options:[["out","خرج"],["in","درآمد"]]},
    {k:"amount",label:"مبلغ ("+U()+")",type:"money",value:t.amount||preset.amount||""},
    {k:"cat",label:"دسته",type:"select",value:t.cat||preset.cat||(type==="in"?"حقوق":"سوپرمارکت"),options:type==="in"?IN_CATS:OUT_CATS},
    {k:"acc",label:"از کدام کارت / حساب",type:"select",value:t.acc||preset.acc||S.accounts[0]?.id,options:accs},
    {k:"date",label:"تاریخ",type:"jdate",value:t.date||jstr(todayJ())},
    {k:"note",label:"توضیح",type:"text",value:t.note||preset.note||"",ph:"مثلاً خرید هفتگی"}];
  fields.onMount=sh=>sh.querySelector(".seg").addEventListener("change",()=>{const v=sh.querySelector(".seg .on").dataset.v;const sel=sh.querySelector("#f_cat");sel.innerHTML=(v==="in"?IN_CATS:OUT_CATS).map(c=>`<option>${c}</option>`).join("")});
  form(isNew?"ثبت دخل / خرج":"ویرایش",fields,o=>{if(!o.amount){toast("مبلغ را وارد کن");return false}
    if(!S.accounts.length){toast("اول یک کارت یا حساب بساز");return false}
    if(isNew)S.tx.unshift({id:uid(),...o,date:o.date||jstr(todayJ())});else Object.assign(t,o);toast(isNew?"ثبت شد":"ذخیره شد")});
}
function accForm(a={}){form(a.id?"ویرایش حساب":"کارت / حساب جدید",[
  {k:"name",label:"نام",type:"text",value:a.name||"",ph:"مثلاً کارت ملت، حساب پس‌انداز"},
  {k:"type",label:"نوع",type:"select",value:a.type||"card",options:[["card","کارت بانکی"],["bank","حساب بانکی"],["cash","نقدی"]]},
  {k:"init",label:"موجودی فعلی ("+U()+")",type:"money",value:a.id?a.init:""},
  {k:"last4",label:"۴ رقم آخر کارت یا حساب (برای پیامک بانک)",type:"text",value:a.last4||""}],
  o=>{if(!o.name){toast("نام را بنویس");return false}if(a.id)Object.assign(a,o);else S.accounts.push({id:uid(),...o})},
  `<p class="muted" style="margin:0">برای امنیت، شماره کارت را اینجا ننویس؛ فقط یک اسم کافی است.</p>`)}
function instForm(it={}){form(it.id?"ویرایش قسط":"قسط جدید",[
  {k:"title",label:"عنوان",type:"text",value:it.title||"",ph:"مثلاً وام، اقساط یخچال"},
  {k:"amount",label:"مبلغ هر قسط ("+U()+")",type:"money",value:it.amount||""},
  {k:"count",label:"تعداد اقساط",type:"int",value:it.count||12},
  {k:"start",label:"تاریخ اولین قسط",type:"jdate",value:it.start||jstr(todayJ())},
  {k:"acc",label:"پرداخت از",type:"select",value:it.acc||S.accounts[0]?.id,options:S.accounts.map(a=>[a.id,a.name])}],
  o=>{if(!o.title||!o.amount||!o.count||!o.start){toast("همه خانه‌ها را پر کن");return false}if(it.id)Object.assign(it,o);else S.inst.push({id:uid(),paid:[],...o})})}
function shopForm(x={}){form(x.id?"ویرایش":"افزودن به لیست خرید",[{k:"name",label:"چی بخریم؟",type:"text",value:x.name||""},{k:"qty",label:"مقدار",type:"text",value:x.qty||"",ph:"مثلاً ۲ کیلو"}],
  o=>{if(!o.name)return false;if(x.id)Object.assign(x,o);else S.shop.unshift({id:uid(),done:false,...o})})}
function fridgeForm(x={}){form(x.id?"ویرایش":"افزودن به موجودی",[{k:"name",label:"نام",type:"text",value:x.name||""},{k:"qty",label:"مقدار",type:"text",value:x.qty||""},
  {k:"loc",label:"کجا",type:"select",value:x.loc||(fLoc!=="همه"?fLoc:"یخچال"),options:["یخچال","فریزر","کابینت"]},{k:"exp",label:"تاریخ انقضا (اختیاری)",type:"jdate",value:x.exp||""}],
  o=>{if(!o.name)return false;if(x.id)Object.assign(x,o);else S.fridge.unshift({id:uid(),...o})})}
function todoForm(x={}){form(x.id?"ویرایش کار":"کار جدید",[{k:"text",label:"کار",type:"text",value:x.text||""},{k:"due",label:"موعد (اختیاری)",type:"jdate",value:x.due||""}],
  o=>{if(!o.text)return false;if(x.id)Object.assign(x,o);else S.todo.unshift({id:uid(),done:false,...o})})}
function saveForm(x={}){form(x.id?"ویرایش هدف":"هدف پس‌انداز",[{k:"title",label:"برای چی؟",type:"text",value:x.title||"",ph:"مثلاً سفر، خرید ماشین"},{k:"target",label:"مبلغ هدف ("+U()+")",type:"money",value:x.target||""}],
  o=>{if(!o.title||!o.target)return false;if(x.id)Object.assign(x,o);else S.save.push({id:uid(),saved:0,...o})})}
function depositForm(g,dir=1){form(dir>0?`واریز به «${g.title}»`:`برداشت از «${g.title}»`,[{k:"amount",label:"مبلغ ("+U()+")",type:"money"},{k:"acc",label:dir>0?"از کدام حساب":"به کدام حساب",type:"select",value:S.accounts[0]?.id,options:S.accounts.map(a=>[a.id,a.name])}],
  o=>{if(!o.amount)return false;const was=g.saved>=g.target;g.saved=Math.max(0,g.saved+dir*o.amount);if(!was&&g.saved>=g.target)setTimeout(party,300);
    S.tx.unshift({id:uid(),type:dir>0?"out":"in",amount:o.amount,cat:dir>0?"پس‌انداز":"سایر درآمد",acc:o.acc,date:jstr(todayJ()),note:(dir>0?"پس‌انداز: ":"برداشت از پس‌انداز: ")+g.title});toast("ثبت شد")})}

/* ---------- photo → list (Claude) ---------- */
let photoMode="shop";
const PHOTO=()=>!!((SAMPLE&&IMG)||window.ocrText);
function askPhoto(mode){photoMode=mode;$("#photo").value="";$("#photo").click()}
function photoMenu(){if(!PHOTO())return toast("عکس‌خوانی در این نمایش در دسترس نیست");
  sheet(`<h2 style="margin-top:0">📸 از چی عکس می‌گیری؟</h2><div class="stack">
  <button class="tile c2" data-pm="shop"><span class="ti">🛒</span><b>لیست خرید</b><span>لیست دست‌نویس یا یادداشت ← به لیست خرید اضافه می‌شود</span></button>
  <button class="tile c3" data-pm="invoice"><span class="ti">🧾</span><b>فاکتور خرید</b><span>مبلغ از کارت کم می‌شود و اقلام به یخچال می‌رود</span></button>
  <button class="tile c1" data-pm="fridge"><span class="ti">🧊</span><b>موجودی یخچال و کابینت</b><span>به موجودی آشپزخانه اضافه می‌شود</span></button></div>`,
  (sh,close)=>sh.querySelectorAll("[data-pm]").forEach(b=>b.onclick=()=>{close();askPhoto(b.dataset.pm)}))}
const UNITS="کیلوگرم|کیلو|گرم|عدد|تا|بسته|لیتر|بطری|قوطی|شانه|کیسه|کارتن|متر|جفت|دانه";
const SKIPW=/جمع|تخفیف|مالیات|فاکتور|تاریخ|شماره|تلفن|آدرس|ساعت|کد|پرداخت|مبلغ|ریال|تومان|صندوق|فروشگاه|اقتصادی|ممنون|total|tax|date/i;
function parseList(text){const out=[];
  enDigits(text).replace(/ي/g,"ی").replace(/ك/g,"ک").split(/\n+/).forEach(l=>{l=l.replace(/[|_*•·\-–—:؛;"'()\[\]]/g," ").replace(/\s+/g," ").trim();
    if(l.length<2||SKIPW.test(l)||!/[آ-ی]{2,}/.test(l))return;
    const m=l.match(new RegExp("(\\d+(?:[.,/]\\d+)?)\\s*("+UNITS+")?"));let qty="",name=l;
    if(m&&!(m[1].replace(/\D/g,"").length>=4&&!m[2])){qty=(m[1]+(m[2]?" "+m[2]:"")).trim();name=l.replace(m[0]," ")}
    name=name.replace(/\d[\d,.]*/g," ").replace(new RegExp("\\b("+UNITS+")\\b","g")," ").replace(/\s+/g," ").trim();
    if(name.length>=2&&name.length<40)out.push({name,qty})});
  return out.slice(0,40)}
function parseInvoice(text){const t=enDigits(text);const lines=t.split(/\n+/);let total=0;
  const nums=s=>(s.match(/\d[\d,٬.]{2,}\d/g)||[]).map(x=>+x.replace(/[,٬]/g,"").replace(/\.(?=\d{3}\b)/g,"")).filter(x=>x>=1000&&x<1e12);
  lines.forEach(l=>{if(/جمع|قابل پرداخت|مبلغ کل|مبلغ نهایی|پرداختی|total/i.test(l)){const n=nums(l);if(n.length)total=Math.max(total,...n)}});
  if(!total){const n=nums(t);if(n.length)total=Math.max(...n)}
  const unit=/تومان/.test(t)&&!/ریال/.test(t)?"toman":"rial";
  return {total,unit,items:parseList(text),store:""}}
async function readPhoto(file,mode){
  if(SAMPLE&&IMG){
    const P={shop:`این عکس را برای یک اپ لیست خرید خانه بخوان (لیست دست‌نویس، یادداشت یا کالاها). هر قلم را با مقدارش به فارسی استخراج کن. فقط JSON: {"items":[{"name":"...","qty":"..."}]}`,
      fridge:`این عکس داخل یخچال یا کابینت آشپزخانه است. مواد غذایی را به فارسی با مقدار تقریبی لیست کن. فقط JSON: {"items":[{"name":"...","qty":"..."}]}`,
      invoice:`این عکس فاکتور یا رسید خرید ایرانی است. مبلغ نهایی قابل پرداخت را عدد (بدون جداکننده) بده، واحدش را از روی فاکتور تشخیص بده (rial یا toman؛ اگر معلوم نیست rial)، نام فروشگاه و اقلام خریده‌شده به فارسی با مقدار. فقط JSON: {"total":0,"unit":"rial","store":"","items":[{"name":"","qty":""}]}`};
    const r=await SAMPLE.json(P[mode],{images:[file],modelTier:"default"});
    return mode==="invoice"?{total:+r.total||0,unit:r.unit==="toman"?"toman":"rial",store:r.store||"",items:(r.items||[]).filter(x=>x&&x.name)}:{items:(r.items||[]).filter(x=>x&&x.name)};
  }
  const text=await window.ocrText(file);
  return mode==="invoice"?parseInvoice(text):{items:parseList(text)};
}
$("#photo").addEventListener("change",async e=>{const file=e.target.files[0];if(!file||!PHOTO())return;const mode=photoMode;
  const bg=sheet(`<h2 style="margin-top:0">⏳ در حال خواندن عکس…</h2><p class="muted">${SAMPLE?"چند ثانیه صبر کن.":"بار اول کمی بیشتر طول می‌کشد (۱۰ تا ۳۰ ثانیه)."}</p>`);
  let r;try{r=await readPhoto(file,mode)}catch(err){bg.remove();toast(err&&err.code==="not_granted"?"اجازه استفاده از هوش مصنوعی داده نشد":"خواندن عکس نشد؛ عکس واضح‌تر و نزدیک‌تر بگیر");return}
  bg.remove();const items=r.items||[];
  const itemList=`<div class="list">${items.map((x,i)=>`<label class="item"><input type="checkbox" checked data-i="${i}">${bub(foodE(x.name),x.name)}<span class="t"><input type="text" value="${esc(x.name)}" data-n="${i}" style="padding:6px 8px"> </span><input type="text" value="${esc(x.qty||"")}" data-q="${i}" style="width:84px;padding:6px 8px" placeholder="مقدار"></label>`).join("")}</div>`;
  const pick=sh=>{const res=[];sh.querySelectorAll("input[type=checkbox][data-i]:checked").forEach(c=>{const i=c.dataset.i;const n=sh.querySelector(`[data-n="${i}"]`).value.trim();if(n)res.push({name:n,qty:sh.querySelector(`[data-q="${i}"]`).value.trim()})});return res};
  if(mode!=="invoice"){
    if(!items.length)return toast("چیزی در عکس پیدا نشد؛ عکس واضح‌تر بگیر");
    sheet(`<h2 style="margin-top:0">${fa(items.length)} قلم پیدا شد ✓</h2><p class="muted" style="margin-top:0">اگر چیزی اشتباه خوانده شده، همین‌جا درستش کن.</p>${itemList}
      <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">افزودن به ${mode==="shop"?"لیست خرید":"موجودی"}</button><button class="btn ghost" id="no">انصراف</button></div>`,
      (sh,close)=>{sh.querySelector("#no").onclick=close;sh.querySelector("#ok").onclick=()=>{const p=pick(sh);
        p.forEach(x=>{if(mode==="shop")S.shop.unshift({id:uid(),name:x.name,qty:x.qty,done:false});else S.fridge.unshift({id:uid(),name:x.name,qty:x.qty,loc:"یخچال",exp:""})});
        close();save();render();toast(fa(p.length)+" قلم اضافه شد ✓")}});
    return;
  }
  const tot=r.unit==="rial"?r.total/10:r.total;
  sheet(`<h2 style="margin-top:0">🧾 فاکتور خوانده شد</h2>
    <div class="field"><label for="iv_amt">مبلغ کل (${U()})</label><input type="text" id="iv_amt" inputmode="decimal" dir="ltr" value="${tot?(FX()?String(+(tot*F()).toFixed(2)):Math.round(tot*F()).toLocaleString("en")):""}"></div>
    ${!tot?`<p class="err">مبلغ پیدا نشد؛ دستی بنویس.</p>`:`<span class="muted">روی فاکتور: ${fa(r.total)} ${r.unit==="rial"?"ریال":"تومان"}</span>`}
    <div class="field"><label for="iv_acc">از کدام کارت کم شود؟</label><select id="iv_acc">${S.accounts.map(a=>`<option value="${a.id}">${esc(a.name)} — ${toman(balance(a))}</option>`).join("")}</select></div>
    <div class="field"><label for="iv_cat">دسته</label><select id="iv_cat">${OUT_CATS.map(c=>`<option>${c}</option>`).join("")}</select></div>
    <div class="field"><label for="iv_note">توضیح</label><input type="text" id="iv_note" value="${esc(r.store||"فاکتور خرید")}"></div>
    ${items.length?`<b style="display:block;margin-top:10px">اقلام فاکتور (تیک‌خورده‌ها به موجودی یخچال می‌روند و از لیست خرید خط می‌خورند)</b>${itemList}`:""}
    <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">ثبت خرج</button><button class="btn ghost" id="no">انصراف</button></div>`,
    (sh,close)=>{const a=sh.querySelector("#iv_amt");moneyInput(a);sh.querySelector("#no").onclick=close;sh.querySelector("#ok").onclick=()=>{
      const amt=num(a.value)/F();if(!amt){toast("مبلغ را وارد کن");return}
      S.tx.unshift({id:uid(),type:"out",amount:amt,cat:sh.querySelector("#iv_cat").value,acc:sh.querySelector("#iv_acc").value,date:jstr(todayJ()),note:sh.querySelector("#iv_note").value.trim()});
      const p=pick(sh);p.forEach(x=>{S.fridge.unshift({id:uid(),name:x.name,qty:x.qty,loc:"یخچال",exp:""});const s=S.shop.find(q=>!q.done&&(norm(q.name).includes(norm(x.name))||norm(x.name).includes(norm(q.name))));if(s)s.done=true});
      close();save();render();toast("خرج ثبت شد و از کارت کم شد ✓")}});
});

/* ---------- views ---------- */
const ICONS={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 money:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h4"/></svg>',
 shop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
 kitchen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M5 10h14M8 6v2M8 13v3"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>'};
const TABS=[["home","خانه"],["money","دخل و خرج"],["shop","خرید"],["kitchen","آشپزخانه"],["more","بیشتر"]];
function renderTabs(){const cur=["inst","todo","save","report","accounts","settings","cards","family","budgets","bills","cheques","debts","events","chat"].includes(route)?"more":route;
  $("#tabs").innerHTML=TABS.map(([k,l])=>`<button class="navb ${cur===k?"on":""}" data-go="${k}" aria-label="${l}">${ICONS[k]}<span>${l}</span></button>`).join("")}

const CAT_E={"سوپرمارکت":"🛒","میوه و سبزی":"🥦","گوشت و مرغ":"🍗","نان":"🍞","رستوران و بیرون‌بر":"🍕","قبض‌ها":"💡","اجاره":"🏠","بنزین و رفت‌وآمد":"⛽","درمان":"💊","پوشاک":"👗","تفریح":"🎡","اقساط":"📆","پس‌انداز":"🐷","سایر":"📦","حقوق":"💼","پاداش":"🎁","فروش":"🏷️","سایر درآمد":"💰"};
const catE=c=>CAT_E[c]||"📦";
const FOOD=[["تخم","🥚"],["مرغ","🍗"],["گوشت","🥩"],["ماهی","🐟"],["میگو","🦐"],["نان","🍞"],["برنج","🍚"],["سیب‌زمینی","🥔"],["پیاز","🧅"],["گوجه","🍅"],["سیر","🧄"],["هویج","🥕"],["بادمجان","🍆"],["فلفل","🫑"],["خیار","🥒"],["لیمو","🍋"],["سیب","🍎"],["موز","🍌"],["پرتقال","🍊"],["نارنگی","🍊"],["انگور","🍇"],["هندوانه","🍉"],["انار","🍎"],["توت","🍓"],["ماست","🥛"],["شیر","🥛"],["دوغ","🥛"],["کشک","🥛"],["پنیر","🧀"],["کره","🧈"],["عدس","🫘"],["لوبیا","🫘"],["نخود","🫘"],["لپه","🫘"],["ماکارونی","🍝"],["رشته","🍝"],["قارچ","🍄"],["سبزی","🌿"],["جعفری","🌿"],["کاهو","🥬"],["کلم","🥬"],["چای","☕"],["قهوه","☕"],["قند","🍬"],["شکر","🍬"],["شکلات","🍫"],["بیسکویت","🍪"],["کیک","🍰"],["روغن","🫗"],["نمک","🧂"],["زعفران","🌼"],["گردو","🌰"],["پسته","🥜"],["آب","💧"],["نوشابه","🥤"],["رب","🥫"],["تن","🥫"],["مایع","🧴"],["پودر","🧼"],["دستمال","🧻"],["شامپو","🧴"]];
const foodE=n=>{const m=norm(n);for(const[k,e]of FOOD)if(m.includes(norm(k)))return e;return "🛍️"};
const REC_E=[["ماکارونی","🍝"],["املت","🍳"],["کوکو","🥚"],["کتلت","🥚"],["کباب","🍢"],["ماهی","🐟"],["سوپ","🥣"],["آش","🥣"],["عدسی","🥣"],["الویه","🥗"],["مرغ","🍗"],["ته‌چین","🍗"],["بادمجان","🍆"],["میرزا","🍆"],["دلمه","🫑"],["پلو","🍚"]];
const recE=n=>{for(const[k,e]of REC_E)if(n.includes(k))return e;return "🍲"};
const PAL=["var(--brand)","var(--saffron)","var(--pom)","var(--sky)","var(--grape)","var(--muted)"];
const TINT=["var(--t-green)","var(--t-saf)","var(--t-pom)","var(--t-sky)","var(--t-grape)"];
const tintOf=s=>TINT[[...String(s)].reduce((a,c)=>a+c.charCodeAt(0),0)%TINT.length];
const bub=(e,key)=>`<span class="bub" style="background:${tintOf(key||e)}" aria-hidden="true">${e}</span>`;
const compact=n=>{n*=F();return n>=1e9?fa(+(n/1e9).toFixed(1))+" میلیارد":n>=1e6?fa(+(n/1e6).toFixed(1))+" میلیون":fa(Math.round(n/1e3))+" هزار"};
const empty=(e,t)=>`<div class="empty"><span class="ee">${e}</span>${t}</div>`;
function donut(by,tot,label){
  const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]);const top=rows.slice(0,5);const rest=rows.slice(5).reduce((s,r)=>s+r[1],0);if(rest)top.push(["بقیه",rest]);
  let acc=0;const stops=top.map((r,i)=>{const a=acc/tot*360;acc+=r[1];return `${PAL[i%PAL.length]} ${a}deg ${acc/tot*360}deg`}).join(",");
  return `<div class="donut-wrap"><div class="donut" style="background:conic-gradient(${stops||"var(--surface2) 0 360deg"})"><span>${label}<b>${compact(tot)}</b>${U()}</span></div>
  <div class="legend">${top.map((r,i)=>`<div class="row between"><span><i style="background:${PAL[i%PAL.length]}"></i>${catE(r[0])} ${esc(r[0])}</span><b>${fa(Math.round(r[1]/tot*100))}٪</b></div>`).join("")}</div></div>`;
}
function party(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const E=["🎉","✨","🌟","💚","🧡","🎊"];
  for(let i=0;i<22;i++){const s=document.createElement("span");s.className="confetti";s.textContent=E[i%E.length];s.style.left=Math.random()*100+"vw";s.style.animationDelay=Math.random()*.5+"s";document.body.appendChild(s);setTimeout(()=>s.remove(),2400)}}

function vHome(){
  const ym=monthKey(jstr(todayJ())),M=monthTx(ym);
  const inc=M.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0),outs=M.filter(t=>t.type==="out"&&t.cat!=="پس‌انداز"),out=outs.reduce((s,t)=>s+t.amount,0);
  const by={};outs.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amount);
  const total=S.accounts.reduce((s,a)=>s+balance(a),0);const A=alerts();
  const saved=S.save.reduce((s,g)=>s+g.saved,0),target=S.save.reduce((s,g)=>s+g.target,0);
  const ICO={inst:"📆",kitchen:"🥗",todo:"✅",shop:"🛒",bills:"🔁",cheques:"🧾",debts:"🤝",budgets:"🎯",events:"🎂"};
  return `${S.example?`<div class="banner row between" style="margin-bottom:12px"><span>✨ این‌ها داده‌های نمونه‌اند تا ببینی اپ چطور کار می‌کند.</span><button class="btn small" data-act="wipe" style="white-space:nowrap">شروع از صفر</button></div>`:""}
  <div class="wallet" data-go="money" role="button" tabindex="0" style="cursor:pointer">
    <div class="lab">💳 موجودی همه کارت‌ها و حساب‌ها</div><div class="big">${toman(total)}</div>
    <div class="mini"><div><span class="lab">⬆ درآمد ${MONTHS[ym%100-1]}</span><b>${toman(inc)}</b></div><div><span class="lab">⬇ خرج ${MONTHS[ym%100-1]}</span><b>${toman(out)}</b></div></div>
    ${inc?`<div class="meter"><i style="width:${Math.min(100,out/inc*100)}%;${out>inc?"background:var(--pom)":""}"></i></div><div class="note">${fa(Math.round(out/inc*100))}٪ از درآمد این ماه خرج شده ${out/inc<.7?"— آفرین 👏":out>inc?"— مراقب باش ⚠️":""}</div>`:""}
  </div>
  <h2><span class="e">🔔</span>یادآوری‌ها</h2>
  <div class="stack">${A.length?A.map(a=>`<button class="alert ${a.bad?"bad":""}" data-go="${a.go}">${bub(ICO[a.go]||"🔔",a.go)}<span class="grow"><b>${esc(a.t)}</b><br><span class="muted">${esc(a.s)}</span></span><span class="muted">‹</span></button>`).join(""):`<div class="card">${empty("🌿","همه‌چیز مرتب است. یادآوری فوری نداری.")}</div>`}</div>
  ${out?`<h2><span class="e">🍩</span>خرج ${MONTHS[ym%100-1]} کجا رفت؟</h2><button class="card" data-go="report" style="width:100%;border:0;font:inherit;color:inherit;text-align:right;cursor:pointer">${donut(by,out,"جمع خرج")}</button>`:""}
  <h2><span class="e">⚡</span>میان‌بر</h2>
  <div class="tiles">
    <button class="tile c1" data-act="addtx"><span class="ti">✍️</span><b>ثبت دخل / خرج</b><span>کارت یا نقدی</span></button>
    <button class="tile c2" data-act="photoMenu"><span class="ti">📸</span><b>عکس بگیر</b><span>${PHOTO()?"لیست، فاکتور یا یخچال":"در این نمایش در دسترس نیست"}</span></button>
    <button class="tile c4" data-go="cards"><span class="ti">💳</span><b>کیف کارت‌ها</b><span>شماره کارت و شبا</span></button>
    <button class="tile c3" data-go="save"><span class="ti">🐷</span><b>پس‌انداز</b><span>${target?fa(Math.round(saved/target*100))+"٪ از هدف‌ها":"یک هدف بساز"}</span></button>
    <button class="tile c5" data-go="report"><span class="ti">📊</span><b>گزارش این ماه</b><span>و پیشنهاد صرفه‌جویی</span></button>
    <button class="tile c1" data-go="kitchen" data-kt="meals"><span class="ti">🍳</span><b>امروز چی بپزیم؟</b><span>${fa(scoreRecipes().filter(r=>r.miss.length<=1&&r.i.length-r.miss.length>=Math.min(2,r.i.length)).length)} غذا با موجودی یخچال</span></button>
  </div>`;
}

function vMoney(){
  const total=S.accounts.reduce((s,a)=>s+balance(a),0);
  const months=[...new Set(S.tx.map(t=>monthKey(t.date)).filter(Boolean))].sort((a,b)=>b-a);
  const dkey=t=>{const a=jparse(t.date);return a?a[0]*10000+a[1]*100+a[2]:0};
  const q=norm(hQ);
  const list=S.tx.filter(t=>(txFilter==="all"||t.acc===txFilter)&&(!hM||monthKey(t.date)===hM)&&(hCat==="all"||t.cat===hCat)&&(hType==="all"||t.type===hType)
    &&(!q||norm(t.note+t.cat+(accById(t.acc)?.name||"")).includes(q))).sort((a,b)=>dkey(b)-dkey(a));
  const sIn=list.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0),sOut=list.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
  const cats=[...new Set(S.tx.filter(t=>hType==="all"||t.type===hType).map(t=>t.cat))];
  const groups=[];list.slice(0,300).forEach(t=>{const g=groups[groups.length-1];if(g&&g.d===t.date)g.items.push(t);else groups.push({d:t.date,items:[t]})});
  const tj=jstr(todayJ()),yj=addDays(tj,-1);
  const dayLabel=d=>{const a=jparse(d);if(!a)return "بدون تاریخ";const w=WDAYS[(jToDate(d).getDay()+1)%7];return (d===tj?"امروز — ":d===yj?"دیروز — ":"")+w+" "+jfa(d)};
  return `<div class="wallet" style="margin-top:6px">
    <div class="lab">💰 کل پولی که داری (جمع همه حساب‌ها)</div><div class="big">${toman(total)}</div>
    <div class="mini" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">${S.accounts.map(a=>`<div><span class="lab">${a.type==="cash"?"💵":a.type==="bank"?"🏦":"💳"} ${esc(a.name)}</span><b>${toman(balance(a))}</b></div>`).join("")}</div>
  </div>
  <div class="row" style="margin-top:10px"><button class="btn ghost grow" data-go="accounts">🏦 حساب‌ها</button><button class="btn ghost grow" data-go="cards">💳 کیف کارت‌ها</button></div>
  <div class="row between"><h2><span class="e">🕘</span>تاریخچه خرج و درآمد</h2><span class="row" style="gap:6px">${PHOTO()?`<button class="btn small saf" data-act="photoInvoice">📸 فاکتور</button>`:""}<button class="btn small" data-act="addtx">+ ثبت</button></span></div>
  <div class="card stack" style="margin-bottom:12px">
    <input type="text" id="hq" placeholder="🔍 جستجو: مثلاً نان، پیتزا، قبض…" value="${esc(hQ)}" autocomplete="off">
    <div class="row"><select id="hm" aria-label="ماه" class="grow"><option value="0">همه ماه‌ها</option>${months.map(m=>`<option value="${m}" ${m===hM?"selected":""}>${MONTHS[m%100-1]} ${String(Math.floor(m/100)).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}</option>`).join("")}</select>
      <select id="ha" aria-label="حساب" class="grow"><option value="all">همه حساب‌ها</option>${S.accounts.map(a=>`<option value="${a.id}" ${txFilter===a.id?"selected":""}>${esc(a.name)}</option>`).join("")}</select></div>
    <div class="seg"><button class="${hType==="all"?"on":""}" data-ht="all">همه</button><button class="${hType==="out"?"on":""}" data-ht="out">⬇ خرج</button><button class="${hType==="in"?"on":""}" data-ht="in">⬆ درآمد</button></div>
    <div class="chips"><button class="chip ${hCat==="all"?"on":""}" data-hc="all">همه دسته‌ها</button>${cats.map(c=>`<button class="chip ${hCat===c?"on":""}" data-hc="${esc(c)}">${catE(c)} ${esc(c)}</button>`).join("")}</div>
    <div class="grid2"><div><span class="muted">جمع خرج</span><br><b class="out">${toman(sOut)}</b></div><div><span class="muted">جمع درآمد</span><br><b class="in">${toman(sIn)}</b></div></div>
    <span class="muted">${fa(list.length)} مورد پیدا شد</span>
  </div>
  ${groups.length?groups.map(g=>{const dOut=g.items.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
    return `<div class="row between" style="margin:14px 4px 6px"><b style="font-size:13.5px">${dayLabel(g.d)}</b>${dOut?`<span class="muted">خرج: ${toman(dOut)}</span>`:""}</div>
    <div class="card list">${g.items.map(t=>`<div class="item">${bub(catE(t.cat),t.cat)}<div class="t"><b>${esc(t.note||t.cat)}</b><br><span class="muted">${esc(t.cat)} · ${t.type==="in"?"به":"از"} ${esc(accById(t.acc)?.name||"—")}</span></div><b class="${t.type==="in"?"in":"out"}" style="white-space:nowrap">${t.type==="in"?"+":"−"}${toman(t.amount)}</b>
      <span class="row" style="flex-direction:column;gap:0"><button class="icon" data-edit="tx:${t.id}">ویرایش</button><button class="icon" data-del="tx:${t.id}">حذف</button></span></div>`).join("")}</div>`}).join("")
  :`<div class="card">${empty("🧾",S.tx.length?"با این فیلترها چیزی پیدا نشد.":"هنوز چیزی ثبت نشده. با دکمه زرد + اولین خرج یا درآمد را وارد کن.")}</div>`}`;
}

function vShop(){
  const open=S.shop.filter(x=>!x.done),done=S.shop.filter(x=>x.done);
  const row=x=>`<div class="item ${x.done?"done":""}"><input type="checkbox" data-shopt="${x.id}" ${x.done?"checked":""} aria-label="خریده شد">${bub(foodE(x.name),x.name)}<span class="t"><b>${esc(x.name)}</b> <span class="muted">${esc(x.qty||"")}</span></span><button class="icon" data-edit="shop:${x.id}">ویرایش</button><button class="icon" data-del="shop:${x.id}">حذف</button></div>`;
  return `<div class="row between"><h2><span class="e">🛒</span>لیست خرید</h2><span class="pill ${open.length?"warn":"ok"}">${open.length?fa(open.length)+" مانده":"کامل شد"}</span></div>
  <div class="row" style="margin-bottom:10px"><button class="btn grow" data-act="addshop">+ افزودن</button>${PHOTO()?`<button class="btn saf grow" data-act="photoShop">📸 عکس بگیر</button>`:""}</div>
  ${PHOTO()?`<p class="muted" style="margin-top:0">از لیست دست‌نویس، فاکتور یا خود کالا عکس بگیر؛ اقلام خودکار به لیست اضافه می‌شوند.</p>`:""}
  <div class="card list">${open.length?open.map(row).join(""):empty(done.length?"🎉":"🧺",done.length?"همه را خریدی!":"لیست خالی است.")}</div>
  ${done.length?`<h2><span class="e">✅</span>خریده شد</h2><div class="card list">${done.map(row).join("")}</div>
  <div class="stack" style="margin-top:12px"><button class="btn" data-act="toFridge">🧊 انتقال خریده‌ها به یخچال و کابینت</button><button class="btn ghost" data-act="shopExpense">🧾 ثبت هزینه این خرید</button></div>`:""}`;
}

function vKitchen(){
  const tab=`<h2><span class="e">🍳</span>آشپزخانه</h2><div class="seg" style="margin-bottom:12px"><button class="${kTab==="fridge"?"on":""}" data-kt="fridge">🧊 موجودی</button><button class="${kTab==="meals"?"on":""}" data-kt="meals">🍲 چی بپزم؟</button><button class="${kTab==="plan"?"on":""}" data-kt="plan">📅 هفته</button></div>`;
  if(kTab==="fridge"){
    const items=S.fridge.filter(f=>fLoc==="همه"||f.loc===fLoc);const LE={"همه":"🏠","یخچال":"🧊","فریزر":"❄️","کابینت":"🗄️"};
    return tab+`<div class="chips">${["همه","یخچال","فریزر","کابینت"].map(l=>`<button class="chip ${fLoc===l?"on":""}" data-loc="${l}">${LE[l]} ${l}</button>`).join("")}</div>
    <div class="row" style="margin:12px 0"><button class="btn grow" data-act="addfridge">+ افزودن</button>${PHOTO()?`<button class="btn saf grow" data-act="photoFridge">📸 عکس از یخچال</button>`:""}</div>
    <div class="card list">${items.length?items.map(f=>{const d=f.exp?daysUntil(f.exp):null;
      return `<div class="item">${bub(foodE(f.name),f.name)}<div class="t"><b>${esc(f.name)}</b> <span class="muted">${esc(f.qty||"")}</span><br><span class="pill">${LE[f.loc]||""} ${esc(f.loc)}</span> ${d!==null?`<span class="pill ${d<0?"bad":d<=2?"warn":"ok"}">${d<0?"تاریخ گذشته":d===0?"امروز":fa(d)+" روز مانده"}</span>`:""}</div>
      <button class="icon" data-finish="${f.id}">تمام شد</button><button class="icon" data-edit="fridge:${f.id}">ویرایش</button><button class="icon" data-del="fridge:${f.id}">حذف</button></div>`}).join(""):empty("🧊","چیزی ثبت نشده. مواد یخچال، فریزر و کابینت را اضافه کن تا پیشنهاد غذا بگیری.")}</div>
    <p class="muted">«تمام شد» آن قلم را از موجودی برمی‌دارد و به لیست خرید اضافه می‌کند.</p>`;
  }
  if(kTab==="meals"){
    const q=norm(mealQ);const sugg=r=>r.miss.length<=1&&r.i.length-r.miss.length>=Math.min(2,r.i.length);const R0=scoreRecipes().filter(r=>(!mealCat||catOf(r)===mealCat)&&(!mealOrigin||(mealOrigin==="ir"?originOf(r)==="ایران"||r.c:originOf(r)!=="ایران"&&!r.c))&&(q?norm(r.n+r.i.join("")+originOf(r)).includes(q):(!mealOnly||sugg(r))));const R=R0.slice(0,mealLimit);const nS=scoreRecipes().filter(sugg).length;
    return tab+`<div class="row" style="flex-wrap:wrap;margin-bottom:8px"><button class="btn small" data-act="addRecipe">+ غذای جدید</button></div><div class="seg" style="margin-bottom:8px"><button class="${mealOnly?"on":""}" data-act="mealOnly" data-v="1">🧊 با موجودی من (${fa(nS)})</button><button class="${mealOnly?"":"on"}" data-act="mealOnly" data-v="0">📖 همه غذاها (${fa(allRecipes().length)})</button></div>
    <div class="chips" style="margin-bottom:8px">${RCATS.map(([k,l])=>`<button class="chip ${mealCat===k?"on":""}" data-mcat="${k}">${l}</button>`).join("")}</div>
    <div class="chips" style="margin-bottom:8px">${[["","🌐 همه کشورها"],["ir","🇮🇷 ایرانی"],["fx","🌍 خارجی"]].map(([k,l])=>`<button class="chip ${mealOrigin===k?"on":""}" data-morg="${k}">${l}</button>`).join("")}</div>
    <label class="row muted" style="margin-bottom:6px"><input type="checkbox" id="stap" ${stapOn()?"checked":""}> <span>پیاز، سیر، رب، آرد و ادویه همیشه در خانه هست</span></label>
    <input type="text" id="mealq" placeholder="🔍 جستجوی غذا یا ماده (مثلاً مرغ)" value="${esc(mealQ)}" autocomplete="off" style="margin-bottom:8px">
    <p class="muted" style="margin-top:0">${mealOnly&&!q?"غذاهایی که همه مواد را داری یا فقط یک قلم کم داری.":"روی هر غذا بزن تا مواد و طرز تهیه را ببینی."}</p>
    ${SAMPLE?`<div class="card stack" style="margin-bottom:12px;background:var(--t-saf)"><b>✨ پیشنهاد هوشمند</b><div class="ai muted" id="aiMeal">با موجودی فعلی، چند غذای اقتصادی و ساده پیشنهاد می‌دهد.</div><button class="btn small saf" data-act="aiMeal" style="align-self:flex-start">پیشنهاد بده</button></div>`:""}
    <div class="stack">${R.length?R.map(r=>`<div class="card recipe" data-rec="${esc(r.n)}" style="cursor:pointer"><span class="bub">${CATE[catOf(r)]||recE(r.n)}</span><div class="grow"><div class="row between"><b>${esc(r.n)}${r.c?' <span class="pill">غذای من</span>':""}</b><span class="pill ${r.miss.length===0?"ok":r.score>=.6?"warn":""}">${r.miss.length===0?"همه مواد را داری ✓":fa(r.i.length-r.miss.length)+" از "+fa(r.i.length)}</span></div>
      <div class="muted"><span class="pill">${esc(originOf(r))} · ${esc(catOf(r))}</span> ${r.t?"⏱ "+esc(r.t)+" · ":""}${r.i.map(x=>r.miss.includes(x)?`<span class="out">${esc(x)}</span>`:esc(x)).join("، ")}</div>
      <div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="btn small" data-rec="${esc(r.n)}">👩‍🍳 طرز تهیه</button>${r.miss.length?`<button class="btn small ghost" data-miss="${esc(r.n)}">🛒 کمبودها</button>`:""}<button class="btn small ghost" data-plan-pick="${esc(r.n)}">📅 برنامه</button></div></div></div>`).join("")+(R0.length>R.length?`<button class="btn ghost" data-act="mealMore">نمایش ${fa(Math.min(60,R0.length-R.length))} غذای دیگر (از ${fa(R0.length)})</button>`:""):`${R0.length>R.length?"":""}<div class="card">${empty("🍲",mealOnly&&!q?"با موجودی فعلی غذایی پیدا نشد. مواد یخچال را در «موجودی» ثبت کن یا «همه غذاها» را ببین.":"غذایی پیدا نشد. «غذای جدید» را بزن و دستور خودت را اضافه کن.")}</div>`}</div>`;
  }
  const wi=weekIdx();
  return tab+`<p class="muted" style="margin-top:0">روی هر خانه بزن تا غذا انتخاب کنی.</p>
  <div class="week"><div class="day muted"><span></span><span>☀️ ناهار</span><span>🌙 شام</span></div>
  ${WDAYS.map((w,i)=>{const p=S.plan[i]||{};return `<div class="day"><span class="dn ${i===wi?"now":""}">${w}</span><button class="slot ${p.l?"f":""}" data-slot="${i}:l">${p.l?recE(p.l)+" "+esc(p.l):"+"}</button><button class="slot ${p.d?"f":""}" data-slot="${i}:d">${p.d?recE(p.d)+" "+esc(p.d):"+"}</button></div>`}).join("")}</div>
  <div class="stack" style="margin-top:14px"><button class="btn" data-act="weekShop">🛒 مواد لازم هفته به لیست خرید</button><div class="row"><button class="btn ghost grow" data-act="planAuto">🪄 چیدن خودکار</button><button class="btn ghost grow" data-act="planClear">پاک کردن</button></div></div>`;
}

function vMore(){return `<h2><span class="e">🧩</span>بیشتر</h2><div class="tiles">
  <button class="tile c2" data-go="events"><span class="ti">🎂</span><b>تولد و مناسبت</b><span>${(()=>{const n=allEvents().map(e=>evNext(e)).sort((a,b)=>a.days-b.days)[0];return n?(n.days===0?"امروز!":fa(n.days)+" روز تا بعدی"):"اضافه کن"})()}</span></button>
  <button class="tile c3" data-go="budgets"><span class="ti">🎯</span><b>بودجه ماهانه</b><span>سقف خرج هر دسته</span></button>
  <button class="tile c1" data-go="bills"><span class="ti">🔁</span><b>قبض و تکراری</b><span>${fa((S.bills||[]).length)} مورد</span></button>
  <button class="tile c5" data-go="cheques"><span class="ti">🧾</span><b>چک‌ها</b><span>${fa((S.cheques||[]).filter(c=>c.status==="pending").length)} در انتظار</span></button>
  <button class="tile c2" data-go="debts"><span class="ti">🤝</span><b>بدهی و طلب</b><span>${fa((S.debts||[]).filter(x=>!x.settled).length)} باز</span></button>
  <button class="tile c4" data-go="cards"><span class="ti">💳</span><b>کیف کارت‌ها</b><span>${VAULT?fa(VAULT.length)+" کارت":"قفل"}</span></button>
  <button class="tile c2" data-go="inst"><span class="ti">📆</span><b>اقساط</b><span>${fa(S.inst.length)} مورد</span></button>
  <button class="tile c1" data-go="todo"><span class="ti">✅</span><b>لیست کارها</b><span>${fa(S.todo.filter(t=>!t.done).length)} کار باز</span></button>
  <button class="tile c3" data-go="save"><span class="ti">🐷</span><b>پس‌انداز</b><span>${fa(S.save.length)} هدف</span></button>
  <button class="tile c5" data-go="report"><span class="ti">📊</span><b>گزارش ماهانه</b><span>و پیشنهاد اقتصادی</span></button>
  <button class="tile c1" data-go="accounts"><span class="ti">🏦</span><b>حساب‌ها</b><span>${fa(S.accounts.length)} حساب</span></button>
  <button class="tile c2" data-go="settings"><span class="ti">⚙️</span><b>تنظیمات</b><span>رمز، پین، واحد پول</span></button>
  <button class="tile c3" data-act="lock"><span class="ti">🔒</span><b>قفل کن</b><span>خروج تا ورود بعدی</span></button></div>`}
const backBtn=`<button class="btn small ghost back" data-go="more">→ بازگشت</button>`;

function vInst(){
  const totalLeft=S.inst.reduce((s,it)=>s+(it.count-it.paid.length)*it.amount,0);
  return backBtn+`<div class="row between"><h2>اقساط</h2><button class="btn small" data-act="addinst">+ قسط</button></div>
  ${S.inst.length?`<div class="card row between" style="margin-bottom:10px"><span class="muted">مانده همه اقساط</span><b class="out">${toman(totalLeft)}</b></div>`:""}
  <div class="stack">${S.inst.length?S.inst.map(it=>{const n=instNext(it),d=n>=0?daysUntil(instDue(it,n)):null;
    return `<div class="card stack"><div class="row between"><b>${esc(it.title)}</b><span class="pill ${n<0?"ok":d<0?"bad":d<=5?"warn":""}">${n<0?"تسویه شد":d<0?"عقب افتاده":"قسط بعد: "+jfa(instDue(it,n))}</span></div>
    <div class="muted">${toman(it.amount)} × ${fa(it.count)} — ${fa(it.paid.length)} قسط پرداخت شده، مانده ${toman((it.count-it.paid.length)*it.amount)}</div>
    <div class="bar"><i style="width:${it.paid.length/it.count*100}%"></i></div>
    <div class="row">${n>=0?`<button class="btn small" data-pay="${it.id}">پرداخت قسط ${fa(n+1)}</button>`:""}<button class="icon" data-edit="inst:${it.id}">ویرایش</button><button class="icon" data-del="inst:${it.id}">حذف</button></div>
    <p class="muted" style="margin:0">پرداخت قسط، خودش یک خرج با دسته «اقساط» از حساب ${esc(accById(it.acc)?.name||"")} ثبت می‌کند.</p></div>`}).join(""):`<div class="card muted">قسطی ثبت نشده.</div>`}</div>`;
}
function vTodo(){
  const o=S.todo.filter(t=>!t.done),d=S.todo.filter(t=>t.done);
  const row=t=>{const dd=t.due?daysUntil(t.due):null;return `<div class="item ${t.done?"done":""}"><input type="checkbox" data-todot="${t.id}" ${t.done?"checked":""} aria-label="انجام شد"><span class="t">${esc(t.text)} ${t.due&&!t.done?`<span class="pill ${dd<0?"bad":dd===0?"warn":""}">${dd<0?"عقب افتاده":dd===0?"امروز":jfa(t.due)}</span>`:""}</span><button class="icon" data-edit="todo:${t.id}">ویرایش</button><button class="icon" data-del="todo:${t.id}">حذف</button></div>`};
  return backBtn+`<div class="row between"><h2>لیست کارها</h2><button class="btn small" data-act="addtodo">+ کار</button></div>
  <div class="card list">${o.length?o.map(row).join(""):`<p class="muted">کار بازی نداری.</p>`}</div>${d.length?`<h2>انجام شده</h2><div class="card list">${d.map(row).join("")}</div>`:""}`;
}
function vSave(){return (route==="save"?backBtn:"")+`<div class="row between"><h2>پس‌انداز</h2><button class="btn small" data-act="addsave">+ هدف</button></div>
  <div class="stack">${S.save.length?S.save.map(g=>`<div class="card stack"><div class="row between"><b>${esc(g.title)}</b><span class="pill ${g.saved>=g.target?"ok":""}">${fa(Math.round(g.saved/g.target*100))}٪</span></div>
  <div class="bar"><i style="width:${Math.min(100,g.saved/g.target*100)}%;background:var(--saffron)"></i></div>
  <div class="muted">${toman(g.saved)} از ${toman(g.target)} — ${g.saved>=g.target?"به هدف رسیدی!":"مانده "+toman(g.target-g.saved)}</div>
  <div class="row"><button class="btn small" data-dep="${g.id}">واریز</button><button class="btn small ghost" data-wd="${g.id}">برداشت</button><button class="icon" data-edit="save:${g.id}">ویرایش</button><button class="icon" data-del="save:${g.id}">حذف</button></div></div>`).join(""):`<div class="card muted">یک هدف بساز؛ مثلاً «سفر عید» یا «پول پیش». هر واریز از حساب انتخابی کم می‌شود.</div>`}</div>`}
function vAccounts(){return backBtn+`<div class="row between"><h2>کارت‌ها و حساب‌ها</h2><button class="btn small" data-act="addacc">+ حساب</button></div>
  <div class="card list">${S.accounts.map(a=>{const ins=S.tx.filter(t=>t.acc===a.id&&t.type==="in").reduce((s,t)=>s+t.amount,0),outs=S.tx.filter(t=>t.acc===a.id&&t.type==="out").reduce((s,t)=>s+t.amount,0);
  return `<div class="item"><div class="t"><b>${esc(a.name)}</b><br><span class="muted">موجودی ${toman(balance(a))} · <span class="in">واریز ${toman(ins)}</span> · <span class="out">برداشت ${toman(outs)}</span></span></div><button class="icon" data-edit="accounts:${a.id}">ویرایش</button><button class="icon" data-del="accounts:${a.id}">حذف</button></div>`}).join("")||`<p class="muted">حسابی نداری.</p>`}</div>`}

function tips(ym){
  const M=monthTx(ym),P=monthTx(ym%100===1?(Math.floor(ym/100)-1)*100+12:ym-1);
  const out=M.filter(t=>t.type==="out"&&t.cat!=="پس‌انداز"),inc=M.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
  const tot=out.reduce((s,t)=>s+t.amount,0);const by={};out.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amount);
  const pby={};P.filter(t=>t.type==="out").forEach(t=>pby[t.cat]=(pby[t.cat]||0)+t.amount);
  const T=[];const top=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
  if(top&&tot&&top[1]/tot>.35)T.push(`«${top[0]}» ${fa(Math.round(top[1]/tot*100))}٪ کل خرج این ماه است. برای این دسته یک سقف ماهانه بگذار.`);
  if(by["رستوران و بیرون‌بر"]&&by["رستوران و بیرون‌بر"]>tot*.12)T.push(`بیرون‌بر ${toman(by["رستوران و بیرون‌بر"])} شد. اگر نصفش را با برنامه هفتگی آشپزی در خانه جایگزین کنی، حدود ${toman(by["رستوران و بیرون‌بر"]/2)} صرفه‌جویی می‌شود.`);
  Object.entries(by).forEach(([c,v])=>{if(pby[c]&&v>pby[c]*1.25&&v-pby[c]>300000)T.push(`خرج «${c}» نسبت به ماه قبل ${fa(Math.round((v/pby[c]-1)*100))}٪ بیشتر شده.`)});
  const instM=S.inst.reduce((s,it)=>s+(instNext(it)>=0?it.amount:0),0);
  if(inc&&instM/inc>.35)T.push(`اقساط ماهانه ${fa(Math.round(instM/inc*100))}٪ درآمد است. تا تسویه بعضی‌ها، قسط جدید برندار.`);
  const sv=M.filter(t=>t.cat==="پس‌انداز").reduce((s,t)=>s+t.amount,0);
  if(inc&&sv<inc*.1)T.push(`این ماه ${fa(Math.round(sv/inc*100))}٪ درآمد پس‌انداز شده. هدف خوب: اول ماه ۱۰٪ حقوق را جدا کنی (${toman(inc*.1)}).`);
  const exp=S.fridge.filter(f=>f.exp&&daysUntil(f.exp)<0).length;if(exp)T.push(`${fa(exp)} قلم در آشپزخانه تاریخ‌گذشته است. قبل از خرید، موجودی را چک کن تا مواد هدر نرود.`);
  if(!T.length&&tot)T.push("خرج این ماه متعادل است. همین روند را ادامه بده.");
  return {by,tot,inc,T};
}
function vReport(){
  const ym=repM||monthKey(jstr(todayJ()));const {by,tot,inc,T}=tips(ym);
  const rows=Object.entries(by).sort((a,b)=>b[1]-a[1]);const max=rows[0]?.[1]||1;
  const biggest=monthTx(ym).filter(t=>t.type==="out"&&t.cat!=="پس‌انداز").sort((a,b)=>b.amount-a.amount).slice(0,5);
  const prev=ym%100===1?(Math.floor(ym/100)-1)*100+12:ym-1,next=ym%100===12?(Math.floor(ym/100)+1)*100+1:ym+1;
  return backBtn+`<div class="row between" style="margin-top:6px"><button class="btn small ghost" data-rep="${prev}">ماه قبل</button><h2 style="margin:0">گزارش ${MONTHS[ym%100-1]} ${String(Math.floor(ym/100)).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}</h2><button class="btn small ghost" data-rep="${next}">ماه بعد</button></div>
  <div class="grid2" style="margin:12px 0"><div class="card"><div class="muted">درآمد</div><b class="in">${toman(inc)}</b></div><div class="card"><div class="muted">خرج</div><b class="out">${toman(tot)}</b></div></div>
  <h2><span class="e">🍩</span>بیشتر کجا خرج کردیم؟</h2>
  ${tot?`<div class="card" style="margin-bottom:10px">${donut(by,tot,"جمع خرج")}</div>`:""}
  <div class="card stack">${rows.length?rows.map(([c,v])=>`<div><div class="row between"><span>${catE(c)} ${esc(c)}</span><span class="muted">${toman(v)} · ${fa(Math.round(v/tot*100))}٪</span></div><div class="bar"><i style="width:${v/max*100}%"></i></div></div>`).join(""):`<p class="muted">برای این ماه خرجی ثبت نشده.</p>`}</div>
  ${biggest.length?`<h2>بزرگ‌ترین خرج‌ها</h2><div class="card list">${biggest.map(t=>`<div class="item"><span class="t">${esc(t.note||t.cat)} <span class="muted">${jfa(t.date)}</span></span><b class="out">${toman(t.amount)}</b></div>`).join("")}</div>`:""}
  <h2>پیشنهاد اقتصادی</h2>
  <div class="stack">${T.map(t=>`<div class="alert"><span class="dot"></span><span>${esc(t)}</span></div>`).join("")}</div>
  ${SAMPLE?`<div class="card stack" style="margin-top:10px"><b>مشاوره هوشمند این ماه</b><div class="ai muted" id="aiTip">تحلیل خرج‌ها و چند پیشنهاد عملی برای کم کردن هزینه‌ها.</div><button class="btn small saf" data-act="aiTip" data-ym="${ym}" style="align-self:flex-start">تحلیل کن</button></div>`:""}`;
}
function vSettings(){
  let perm="unsupported";try{perm=("Notification" in window)?Notification.permission:"unsupported"}catch(e){}
  return backBtn+`<h2>تنظیمات</h2><div class="stack">
  <div class="card stack"><div class="field"><label for="setName">اسمت (برای سلام اول صفحه)</label><input type="text" id="setName" value="${esc(S.name)}"></div><button class="btn small" data-act="setName" style="align-self:flex-start">ذخیره</button></div>
  <div class="card stack"><b>🔐 امنیت</b><span class="muted">نام کاربری: ${esc(S.auth?.user||"")} · ${getRem()?"ورود سریع با پین روی این گوشی فعال است":"ورود با رمز"}</span>
  <div class="row" style="flex-wrap:wrap"><button class="btn small ghost" data-act="chpass">تغییر رمز</button><button class="btn small ghost" data-act="setpin">${getRem()?"تغییر پین":"ساختن پین"}</button>${getRem()?`<button class="btn small ghost" data-act="delpin">حذف پین</button>`:""}<button class="btn small ghost" data-act="lock">🔒 قفل کن</button></div></div>
  <div class="card stack"><b>💱 واحد پول این گوشی</b><div class="chips">${CURS.map(c=>`<button class="chip ${curU()===c[0]?"on":""}" data-unit="${c[0]}">${c[1]}</button>`).join("")}</div>
  <span class="muted">هر گوشی واحد خودش را دارد؛ مثلاً تو ریال ببینی و همسرت تومان. هر کس هر عددی وارد کند، برای دیگری با واحد خودش نشان داده می‌شود.</span>
  <b style="margin-top:6px">نرخ ارز (به تومان)</b>${CURS.slice(2).map(c=>`<div class="row"><span style="width:56px">${c[1]}</span><input type="text" inputmode="decimal" dir="ltr" class="grow" id="rate_${c[0]}" value="${RATES[c[0]]?RATES[c[0]]:""}" placeholder="قیمت ۱ ${c[1]} به تومان"></div>`).join("")}
  <button class="btn small" data-act="saveRates" style="align-self:flex-start">ذخیره نرخ‌ها</button><span class="muted">مبلغ‌ها همیشه به تومان ذخیره می‌شوند و با این نرخ به ارز تبدیل می‌شوند؛ نرخ را هر وقت عوض شد به‌روز کن.</span></div>
  <div class="card stack"><b>اعلان روی گوشی</b><span class="muted">${perm==="granted"?"اعلان فعال است؛ هر بار که اپ را باز می‌کنی خلاصه یادآوری‌ها می‌آید.":perm==="denied"||perm==="unsupported"?"این نمایشگر اجازه اعلان سیستمی نمی‌دهد؛ یادآوری‌ها در صفحه خانه نشان داده می‌شوند.":"اجازه بده تا سلام و یادآوری‌ها به‌صورت اعلان بیاید."}</span>${perm==="default"?`<button class="btn small" data-act="notif" style="align-self:flex-start">فعال کردن اعلان</button>`:""}</div>
  <div class="card stack"><b>پشتیبان</b><span class="muted">اطلاعات روی حساب Claude تو ذخیره می‌شود و روی هر گوشی که با همین حساب باز کنی می‌آید.</span>
  <div class="row"><button class="btn small ghost" data-act="export">کپی پشتیبان</button><button class="btn small ghost" data-act="import">بازگردانی از متن</button></div></div>
  <div class="card stack"><b>پاک کردن همه اطلاعات</b><button class="btn small ghost" data-act="wipeAsk" style="align-self:flex-start;color:var(--out)">پاک کردن همه</button></div></div>`;
}

/* ---------- lock, password, PIN & encrypted card wallet ---------- */
const te=new TextEncoder(),td=new TextDecoder();
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
async function pbk(pass,salt){return crypto.subtle.importKey("raw",te.encode(pass),"PBKDF2",false,["deriveKey","deriveBits"]).then(k=>({k,salt}))}
async function aesKey(pass,salt){const {k}=await pbk(pass,salt);return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
async function passHash(pass,salt){const {k}=await pbk(pass,salt);return b64(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},k,256))}
async function seal(key,obj){const iv=rnd(12);const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,te.encode(JSON.stringify(obj)));return {iv:b64(iv),ct:b64(ct)}}
async function unseal(key,box){const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:ub64(box.iv)},key,ub64(box.ct));return JSON.parse(td.decode(pt))}
const REM="home-budget-remember";
let VKEY=null,VAULT=null,VBOX=null,vaultRef=null,UNLOCKED=false,showSecret={};
let readyRes;const READY=new Promise(r=>{readyRes=r;setTimeout(r,4000)});
try{const v=localStorage.getItem(KEY+"-vault");if(v)VBOX=JSON.parse(v)}catch(e){}
function saveVault(){if(!VKEY||!VAULT)return;seal(VKEY,VAULT).then(box=>{VBOX=box;try{localStorage.setItem(KEY+"-vault",JSON.stringify(box))}catch(e){}
  if(vaultRef)vaultRef.set({box:JSON.stringify(box),at:Date.now()}).catch(()=>toast("ذخیره کارت‌ها روی سرور نشد؛ عکس کوچک‌تر بگیر"))})}
async function openVault(pass){VKEY=await aesKey(pass,ub64(S.auth.vsalt));VAULT=VBOX?await unseal(VKEY,VBOX):[];}
async function doUnlock(pass){await openVault(pass);UNLOCKED=true;$("#lock").hidden=true;render();setTimeout(()=>{if(window.smsSync)smsSync(false)},1500)}
function getRem(){try{return JSON.parse(localStorage.getItem(REM)||"null")}catch(e){return null}}
async function setRem(pass,pin){const salt=rnd(16);const key=await aesKey(pin,salt);const box=await seal(key,{p:pass});try{localStorage.setItem(REM,JSON.stringify({salt:b64(salt),...box,fails:0}))}catch(e){}}
function lockNow(){UNLOCKED=false;VKEY=null;VAULT=null;showSecret={};renderLock()}
const eye=`<button type="button" class="eye" aria-label="نمایش رمز" data-eye>👁️</button>`;
function pwField(id,label,ph=""){return `<div class="field"><label for="${id}">${label}</label><div class="pw"><input type="password" id="${id}" autocomplete="off" placeholder="${ph}">${eye}</div></div>`}
document.addEventListener("click",e=>{const b=e.target.closest("[data-eye]");if(!b)return;const i=b.parentNode.querySelector("input");i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"👁️":"🙈"});

async function renderLock(){
  const L=$("#lock");L.hidden=false;L.innerHTML=`<div class="lockbox"><div class="logo">🏡</div><p class="muted">در حال آماده‌سازی…</p></div>`;
  await READY;
  const rem=getRem();
  if(!S.auth){ // first-time setup
    L.innerHTML=`<form class="lockbox stack" id="setup"><div class="logo">🏡</div><h2 style="justify-content:center;margin:0">خوش آمدی!</h2>
      <p class="muted" style="margin:0;text-align:center">برای امنیت، یک نام کاربری و رمز بساز.</p>
      <div class="field"><label for="su">نام کاربری</label><input type="text" id="su" autocomplete="off" value=""></div>
      ${pwField("sp","رمز (حداقل ۶ حرف)")}${pwField("sp2","تکرار رمز")}
      <div class="field"><label for="spin">پین ۴ رقمی برای ورود سریع</label><input type="password" id="spin" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"></div>
      <label class="row"><input type="checkbox" id="srem" checked> <span>مرا به خاطر بسپار (دفعه بعد فقط پین)</span></label>
      <p class="err" id="serr"></p><button class="btn" type="submit">ساختن و ورود</button></form>`;
    $("#setup").onsubmit=async e=>{e.preventDefault();const u=$("#su").value.trim(),p=$("#sp").value,p2=$("#sp2").value,pin=enDigits($("#spin").value);
      const er=m=>$("#serr").textContent=m;
      if(!u)return er("نام کاربری را بنویس");if(p.length<6)return er("رمز باید حداقل ۶ حرف باشد");if(p!==p2)return er("تکرار رمز یکی نیست");
      if($("#srem").checked&&!/^\d{4}$/.test(pin))return er("پین باید ۴ رقم باشد");
      er("");const hs=rnd(16),vs=rnd(16);S.auth={user:u,hsalt:b64(hs),hash:await passHash(p,hs),vsalt:b64(vs)};VBOX=null;save();
      if($("#srem").checked)await setRem(p,pin);await doUnlock(p);saveVault();toast("ورود موفق 🎉")};
    return;
  }
  if(rem){ // PIN pad
    let pin="";
    L.innerHTML=`<div class="lockbox stack"><div class="logo">🔐</div><h2 style="justify-content:center;margin:0">${esc(S.name||S.auth.user)}، ${greeting()}</h2><p class="muted" style="text-align:center;margin:0">پین را وارد کن</p>
      <div class="dots" id="dots">${"<i></i>".repeat(4)}</div><p class="err" id="perr"></p>
      <div class="pad">${[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(k=>k===""?"<span></span>":`<button type="button" data-k="${k}">${typeof k==="number"?fa(k):k}</button>`).join("")}</div>
      <button class="btn ghost small" id="usePw" style="align-self:center">ورود با نام کاربری و رمز</button></div>`;
    const dots=()=>$("#dots").querySelectorAll("i").forEach((d,i)=>d.classList.toggle("on",i<pin.length));
    $("#usePw").onclick=()=>{try{localStorage.removeItem(REM)}catch(e){}renderLock()};
    L.querySelector(".pad").onclick=async e=>{const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k;
      if(k==="⌫"){pin=pin.slice(0,-1);dots();return}if(pin.length>=4)return;pin+=k;dots();
      if(pin.length===4){try{const r=getRem();const key=await aesKey(pin,ub64(r.salt));const {p}=await unseal(key,r);r.fails=0;localStorage.setItem(REM,JSON.stringify(r));await doUnlock(p)}
        catch(err){const r=getRem()||{};r.fails=(r.fails||0)+1;pin="";dots();$("#dots").classList.add("shake");setTimeout(()=>$("#dots")?.classList.remove("shake"),400);
          if(r.fails>=5){try{localStorage.removeItem(REM)}catch(e){}toast("۵ بار اشتباه؛ با رمز وارد شو");renderLock()}else{try{localStorage.setItem(REM,JSON.stringify(r))}catch(e){}$("#perr").textContent=`پین اشتباه است (${fa(5-r.fails)} فرصت دیگر)`}}}};
    return;
  }
  L.innerHTML=`<form class="lockbox stack" id="login"><div class="logo">🏡</div><h2 style="justify-content:center;margin:0">${greeting()}!</h2>
    <div class="field"><label for="lu">نام کاربری</label><input type="text" id="lu" autocomplete="off" value="${esc(S.auth.user)}"></div>
    ${pwField("lp","رمز")}
    <label class="row"><input type="checkbox" id="lrem"> <span>مرا به خاطر بسپار</span></label>
    <div class="field" id="lpinf" hidden><label for="lpin">یک پین ۴ رقمی برای ورود سریع بساز</label><input type="password" id="lpin" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"></div>
    <p class="err" id="lerr"></p><button class="btn" type="submit">ورود</button>
    <button type="button" class="btn ghost small" id="forgot" style="align-self:center">رمز را فراموش کردم</button></form>`;
  $("#lrem").onchange=()=>$("#lpinf").hidden=!$("#lrem").checked;
  $("#forgot").onclick=()=>sheet(`<h2 style="margin-top:0">بازنشانی رمز</h2><p class="muted">دخل و خرج، لیست‌ها و بقیه اطلاعات می‌مانند، ولی <b>کیف کارت‌ها پاک می‌شود</b> چون فقط با رمز قبلی باز می‌شود.</p><div class="row"><button class="btn grow" id="y" style="background:var(--out);color:#fff">بازنشانی</button><button class="btn ghost grow" id="n">انصراف</button></div>`,(sh,close)=>{sh.querySelector("#n").onclick=close;sh.querySelector("#y").onclick=()=>{S.auth=null;VBOX=null;try{localStorage.removeItem(KEY+"-vault");localStorage.removeItem(REM)}catch(e){}if(vaultRef)vaultRef.delete().catch(()=>{});save();close();renderLock()}});
  $("#login").onsubmit=async e=>{e.preventDefault();const er=m=>$("#lerr").textContent=m;
    if($("#lu").value.trim()!==S.auth.user)return er("نام کاربری یا رمز اشتباه است");
    const p=$("#lp").value;if(await passHash(p,ub64(S.auth.hsalt))!==S.auth.hash)return er("نام کاربری یا رمز اشتباه است");
    if($("#lrem").checked){const pin=enDigits($("#lpin").value);if(!/^\d{4}$/.test(pin))return er("پین باید ۴ رقم باشد");await setRem(p,pin)}
    try{await doUnlock(p)}catch(err){er("کیف کارت‌ها باز نشد")}};
}

/* ---------- card wallet ---------- */
const BINS={"603799":"ملی","589210":"سپه","627648":"توسعه صادرات","207177":"توسعه صادرات","627961":"صنعت و معدن","603770":"کشاورزی","639217":"کشاورزی","628023":"مسکن","627760":"پست بانک","502908":"توسعه تعاون","627412":"اقتصاد نوین","622106":"پارسیان","639194":"پارسیان","627884":"پارسیان","502229":"پاسارگاد","639347":"پاسارگاد","627488":"کارآفرین","502910":"کارآفرین","621986":"سامان","639346":"سینا","639607":"سرمایه","636214":"آینده","502806":"شهر","504706":"شهر","502938":"دی","603769":"صادرات","610433":"ملت","991975":"ملت","627353":"تجارت","585983":"تجارت","589463":"رفاه","505785":"ایران زمین","636795":"مرکزی","504172":"رسالت","606373":"مهر ایران","505416":"گردشگری","507677":"نور","628157":"توسعه","505801":"کوثر","639370":"مهر اقتصاد","606256":"ملل"};
const BANK_C={"ملی":["#1e4c8f","#0f2c5c"],"ملت":["#c8102e","#7a0a1c"],"صادرات":["#1a3b8b","#0b1f52"],"تجارت":["#2457a7","#123166"],"سپه":["#e0a100","#8a5b00"],"کشاورزی":["#2e8b3e","#14501f"],"مسکن":["#e06b00","#8a3d00"],"پاسارگاد":["#d4a017","#5a4108"],"سامان":["#2b8fd1","#14527d"],"پارسیان":["#8b1d3b","#4d0f21"],"رفاه":["#1f6fb8","#0f3d69"],"آینده":["#5b2c83","#33174a"],"شهر":["#c62828","#6d1515"]};
const bankOf=n=>BINS[String(n||"").slice(0,6)]||"";
function luhn(n){let s=0;for(let i=0;i<n.length;i++){let d=+n[n.length-1-i];if(i%2){d*=2;if(d>9)d-=9}s+=d}return s%10===0}
const grp=n=>String(n||"").replace(/\D/g,"").replace(/(\d{4})(?=\d)/g,"$1 ");
const maskCard=n=>n?"•••• •••• •••• "+n.slice(-4):"—";
async function copy(t){try{await navigator.clipboard.writeText(t);toast("کپی شد ✓")}catch(e){toast("کپی نشد؛ متن را نگه دار و کپی کن")}}
function cardVis(c){const bk=bankOf(c.num);const col=BANK_C[bk]||(()=>{const h=[...(c.title||bk||"x")].reduce((a,ch)=>a+ch.charCodeAt(0),0)%360;return [`hsl(${h} 55% 38%)`,`hsl(${(h+30)%360} 60% 22%)`]})();const sh=showSecret[c.id];
  return `<div class="bank" style="background:linear-gradient(135deg,${col[0]},${col[1]})">
    <div class="row between"><b>${esc(c.title||("بانک "+bk)||"کارت")}</b><span class="chipicon"></span></div>
    <div class="num" dir="ltr">${sh?grp(c.num):maskCard(c.num)}</div>
    <div class="row between small"><span>${esc(c.holder||"")}</span><span dir="ltr">${c.exp?(sh?esc(c.exp):"••/••"):""}</span></div>
    ${bk?`<span class="bk">بانک ${bk}</span>`:""}</div>`}
function vCards(){
  if(!VAULT)return backBtn+`<div class="card">${empty("🔒","کیف کارت قفل است.")}</div>`;
  return backBtn+`<div class="row between"><h2><span class="e">💳</span>کیف کارت‌ها</h2><button class="btn small ghost" data-act="addcard">+ دستی</button></div>
  <button class="btn saf" data-act="addcardphoto" style="width:100%;margin-bottom:12px;padding:16px;font-size:16px">📸 ساخت کارت با عکس</button>
  <p class="muted" style="margin-top:0">اطلاعات کارت‌ها با رمز تو رمزنگاری می‌شود و بدون رمز قابل خواندن نیست.</p>
  <div class="stack">${VAULT.length?VAULT.map(c=>{const sh=showSecret[c.id];return `<div class="card stack">${cardVis(c)}
    <div class="row between"><span class="muted">شماره کارت</span><span class="row"><b dir="ltr">${sh?grp(c.num):maskCard(c.num)}</b><button class="icon" data-copy="num:${c.id}">کپی</button></span></div>
    ${c.sheba?`<div class="row between"><span class="muted">شبا</span><span class="row"><b dir="ltr" style="font-size:12.5px">${sh?esc(c.sheba):"IR•• •••• "+esc(c.sheba.slice(-4))}</b><button class="icon" data-copy="sheba:${c.id}">کپی</button></span></div>`:""}
    ${c.acct?`<div class="row between"><span class="muted">شماره حساب</span><span class="row"><b dir="ltr">${sh?esc(c.acct):"•••• "+esc(c.acct.slice(-4))}</b><button class="icon" data-copy="acct:${c.id}">کپی</button></span></div>`:""}
    ${c.exp?`<div class="row between"><span class="muted">تاریخ انقضا</span><b dir="ltr">${sh?esc(c.exp):"••/••"}</b></div>`:""}
    ${c.cvv?`<div class="row between"><span class="muted">CVV2</span><b dir="ltr">${sh?esc(c.cvv):"•••"}</b></div>`:""}
    ${c.photo&&sh?`<img src="${c.photo}" alt="عکس کارت" style="border-radius:14px">`:""}
    <div class="row"><button class="btn small ${sh?"ghost":""}" data-show="${c.id}">${sh?"🙈 پنهان کن":"👁️ نمایش"}</button><button class="icon" data-editcard="${c.id}">ویرایش</button><button class="icon" data-delcard="${c.id}">حذف</button></div></div>`}).join(""):`<div class="card">${empty("💳","هنوز کارتی ذخیره نکردی. با دکمه «+ کارت» اضافه کن.")}</div>`}</div>`;
}
function shrink(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const w=Math.min(720,img.width),h=Math.round(img.height*w/img.width);const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(img.src);res(c.toDataURL("image/jpeg",.6))};img.onerror=rej;img.src=URL.createObjectURL(file)})}
function cardForm(c={},auto=false){
  let photo=c.photo||"";
  sheet(`<h2 style="margin-top:0">${c.id?"ویرایش کارت":"کارت جدید"}</h2><form class="stack" id="cf">
    <div class="field"><label for="c_title">نام (مثلاً کارت حقوق)</label><input type="text" id="c_title" value="${esc(c.title||"")}"></div>
    <div class="field"><label for="c_num">شماره کارت ۱۶ رقمی</label><input type="text" id="c_num" inputmode="numeric" dir="ltr" value="${esc(grp(c.num||""))}" autocomplete="off"><span class="muted" id="c_bank"></span></div>
    <div class="field"><label for="c_sheba">شماره شبا</label><input type="text" id="c_sheba" dir="ltr" placeholder="IR..." value="${esc(c.sheba||"")}" autocomplete="off"></div>
    <div class="field"><label for="c_acct">شماره حساب (اختیاری)</label><input type="text" id="c_acct" dir="ltr" inputmode="numeric" value="${esc(c.acct||"")}" autocomplete="off"></div>
    <div class="grid2"><div class="field"><label for="c_exp">تاریخ انقضا (سال/ماه)</label><input type="text" id="c_exp" dir="ltr" inputmode="numeric" placeholder="05/09" maxlength="5" value="${esc(c.exp||"")}" autocomplete="off"></div>
    <div class="field"><label for="c_cvv">CVV2</label><div class="pw"><input type="password" id="c_cvv" inputmode="numeric" maxlength="4" dir="ltr" value="${esc(c.cvv||"")}" autocomplete="off">${eye}</div></div></div>
    <div class="field"><label for="c_holder">نام دارنده کارت</label><input type="text" id="c_holder" value="${esc(c.holder||"")}"></div>
    <div class="banner">⚠️ پیشنهاد: CVV2 را ذخیره نکن. اگر گوشی یا رمزت لو برود، با شماره کارت + CVV2 + انقضا می‌شود خرید اینترنتی کرد. رمز دوم را هیچ‌وقت ذخیره نکن.</div>
    <div class="row"><button type="button" class="btn ghost grow" id="c_ph">📸 ${photo?"عوض کردن عکس کارت":"عکس کارت"}</button></div>
    <img id="c_img" ${photo?`src="${photo}"`:"hidden"} alt="عکس کارت" style="border-radius:14px">
    <input type="file" id="c_file" accept="image/*" capture="environment" hidden>
    <p class="err" id="c_err"></p>
    <div class="row"><button class="btn grow" type="submit">ذخیره</button><button class="btn ghost" type="button" id="c_x">انصراف</button></div></form>`,(sh,close)=>{
    const num=sh.querySelector("#c_num"),bk=()=>{const n=num.value.replace(/\D/g,"");sh.querySelector("#c_bank").textContent=bankOf(n)?"بانک "+bankOf(n):""};
    num.addEventListener("input",()=>{num.value=grp(enDigits(num.value).slice(0,19));bk()});bk();
    sh.querySelector("#c_exp").addEventListener("input",e=>{let v=enDigits(e.target.value).replace(/\D/g,"").slice(0,4);e.target.value=v.length>2?v.slice(0,2)+"/"+v.slice(2):v});
    sh.querySelector("#c_x").onclick=close;sh.querySelector("#c_ph").onclick=()=>sh.querySelector("#c_file").click();
    sh.querySelector("#c_file").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{photo=await shrink(f);const im=sh.querySelector("#c_img");im.src=photo;im.hidden=false}catch(err){toast("عکس خوانده نشد");return}
      if(!(SAMPLE&&IMG))return;const st=sh.querySelector("#c_err");st.style.color="var(--muted)";st.textContent="⏳ در حال خواندن اطلاعات کارت از عکس…";
      try{const r=await SAMPLE.json(`این عکس یک کارت بانکی ایرانی (روی کارت) است. اطلاعات چاپ‌شده را بخوان و فقط JSON بده: {"num":"۱۶ رقم شماره کارت با ارقام انگلیسی بدون فاصله","sheba":"شماره شبا با IR اگر روی کارت هست","acct":"شماره حساب اگر هست","exp":"تاریخ انقضا به شکل YY/MM","holder":"نام دارنده به فارسی","bank":"نام بانک"}. هر مورد که دیده نمی‌شود رشته خالی باشد. CVV2 را نخوان و برنگردان.`,{images:[f],modelTier:"default"});
        const put=(id,v)=>{if(v&&!sh.querySelector(id).value.trim())sh.querySelector(id).value=v};
        if(r.num){num.value=grp(enDigits(r.num).replace(/\D/g,"").slice(0,16));bk()}
        put("#c_sheba",r.sheba&&enDigits(r.sheba).replace(/\s/g,""));put("#c_acct",r.acct&&enDigits(r.acct));put("#c_exp",r.exp&&enDigits(r.exp));put("#c_holder",r.holder);
        put("#c_title",r.bank?("کارت "+String(r.bank).replace(/^بانک\s*/,"")):"");
        st.style.color="";st.textContent=r.num?"":"شماره کارت خوانده نشد؛ دستی وارد کن";toast("اطلاعات خوانده شد؛ چک کن و ذخیره بزن ✓")}
      catch(err){st.style.color="";st.textContent=err&&err.code==="not_granted"?"اجازه خواندن عکس داده نشد؛ دستی وارد کن":"خواندن عکس نشد؛ دستی وارد کن"}};
    if(auto)setTimeout(()=>sh.querySelector("#c_file").click(),150);
    sh.querySelector("#cf").onsubmit=e=>{e.preventDefault();const g=id=>enDigits(sh.querySelector(id).value.trim());
      const o={title:sh.querySelector("#c_title").value.trim(),num:g("#c_num").replace(/\D/g,""),sheba:g("#c_sheba").replace(/\s/g,"").toUpperCase(),acct:g("#c_acct"),exp:g("#c_exp"),cvv:g("#c_cvv").replace(/\D/g,""),holder:sh.querySelector("#c_holder").value.trim(),photo};
      const er=m=>sh.querySelector("#c_err").textContent=m;
      if(!o.num&&!o.sheba)return er("حداقل شماره کارت یا شبا را وارد کن");
      if(o.num&&(o.num.length!==16||!luhn(o.num)))return er("شماره کارت درست نیست؛ دوباره چک کن");
      if(o.sheba&&!/^IR\d{24}$/.test(o.sheba.startsWith("IR")?o.sheba:"IR"+o.sheba))return er("شبا باید IR و ۲۴ رقم باشد");
      if(o.sheba&&!o.sheba.startsWith("IR"))o.sheba="IR"+o.sheba;
      if(c.id)Object.assign(c,o);else VAULT.unshift({id:uid(),...o});saveVault();close();render();toast("کارت ذخیره شد 💳")};
  });
}
document.addEventListener("click",e=>{const t=e.target.closest("[data-show],[data-copy],[data-editcard],[data-delcard]");if(!t||!VAULT)return;const d=t.dataset;
  if(d.show){showSecret[d.show]=!showSecret[d.show];render()}
  else if(d.copy){const[f,id]=d.copy.split(":");const c=VAULT.find(x=>x.id===id);copy(c[f])}
  else if(d.editcard)cardForm(VAULT.find(x=>x.id===d.editcard));
  else if(d.delcard){if(t.dataset.armed){VAULT=VAULT.filter(x=>x.id!==d.delcard);saveVault();render();return}t.dataset.armed=1;t.textContent="مطمئنی؟";t.classList.add("danger");setTimeout(()=>{if(t.isConnected){delete t.dataset.armed;t.textContent="حذف"}},2500)}});
async function changePass(){sheet(`<h2 style="margin-top:0">تغییر رمز</h2><form class="stack" id="cp">${pwField("op","رمز فعلی")}${pwField("np","رمز جدید (حداقل ۶ حرف)")}${pwField("np2","تکرار رمز جدید")}<p class="err" id="cperr"></p><button class="btn" type="submit">ذخیره</button></form>`,(sh,close)=>{
  sh.querySelector("#cp").onsubmit=async e=>{e.preventDefault();const er=m=>sh.querySelector("#cperr").textContent=m;const o=sh.querySelector("#op").value,n=sh.querySelector("#np").value;
    if(await passHash(o,ub64(S.auth.hsalt))!==S.auth.hash)return er("رمز فعلی اشتباه است");if(n.length<6)return er("رمز جدید کوتاه است");if(n!==sh.querySelector("#np2").value)return er("تکرار یکی نیست");
    const hs=rnd(16),vs=rnd(16);S.auth={...S.auth,hsalt:b64(hs),hash:await passHash(n,hs),vsalt:b64(vs)};VKEY=await aesKey(n,vs);save();saveVault();try{localStorage.removeItem(REM)}catch(e){}close();toast("رمز عوض شد؛ پین را دوباره بساز")}})}
function setPin(){sheet(`<h2 style="margin-top:0">پین ورود سریع</h2><form class="stack" id="sp">${pwField("pp","رمز")}<div class="field"><label for="pn">پین ۴ رقمی جدید</label><input type="password" id="pn" inputmode="numeric" maxlength="4" autocomplete="off"></div><p class="err" id="sperr"></p><button class="btn" type="submit">ذخیره پین</button></form>`,(sh,close)=>{
  sh.querySelector("#sp").onsubmit=async e=>{e.preventDefault();const er=m=>sh.querySelector("#sperr").textContent=m;const p=sh.querySelector("#pp").value,pin=enDigits(sh.querySelector("#pn").value);
    if(await passHash(p,ub64(S.auth.hsalt))!==S.auth.hash)return er("رمز اشتباه است");if(!/^\d{4}$/.test(pin))return er("پین باید ۴ رقم باشد");await setRem(p,pin);close();render();toast("پین ذخیره شد 🔐")}})}

/* ---------- budgets, recurring bills, cheques, debts ---------- */
function ensure(){["budgets","bills","cheques","debts","recipes","events"].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]})}
const ymNow=()=>monthKey(jstr(todayJ()));
function catSpent(cat,ym){return S.tx.filter(t=>t.type==="out"&&t.cat===cat&&monthKey(t.date)===(ym||ymNow())).reduce((s,t)=>s+t.amount,0)}
let BNOTE={};try{BNOTE=JSON.parse(localStorage.getItem("home-bnote")||"{}")}catch(e){}
function notifyLocal(title,body){try{const LN=window.Capacitor&&Capacitor.Plugins.LocalNotifications;if(LN)LN.schedule({notifications:[{id:700000+(Date.now()%90000),title,body}]})}catch(e){}}
function budgetCheck(){ensure();const ym=ymNow();let ch=false;
  S.budgets.forEach(b=>{if(!b.limit)return;const p=catSpent(b.cat,ym)/b.limit;const lv=p>=1?2:p>=.8?1:0;const k=ym+":"+b.cat;
    if(lv>(BNOTE[k]||0)){BNOTE[k]=lv;ch=true;const m=lv===2?`بودجه «${b.cat}» تمام شد (${fa(Math.round(p*100))}٪)`:`${fa(Math.round(p*100))}٪ بودجه «${b.cat}» خرج شده`;toast("⚠️ "+m);notifyLocal("🎯 بودجه ماهانه",m)}});
  if(ch)try{localStorage.setItem("home-bnote",JSON.stringify(BNOTE))}catch(e){}}
function billDue(b){const t=todayJ();const max=t[1]<=6?31:t[1]<=11?30:29;return jstr([t[0],t[1],Math.min(b.day,max)])}
function processBills(){ensure();const ym=ymNow(),t=todayJ();let n=0;
  S.bills.forEach(b=>{if(b.auto&&b.last!==ym&&t[2]>=b.day){S.tx.unshift({id:uid(),type:"out",amount:b.amount,cat:b.cat||"قبض‌ها",acc:b.acc||S.accounts[0]?.id,date:billDue(b),note:b.title+" (خودکار)"});b.last=ym;n++}});
  if(n){save();toast(`🔁 ${fa(n)} پرداخت تکراری این ماه ثبت شد`)}}
function payBill(b,accId){ensure();S.tx.unshift({id:uid(),type:"out",amount:b.amount,cat:b.cat||"قبض‌ها",acc:accId||b.acc||S.accounts[0]?.id,date:jstr(todayJ()),note:b.title});b.last=ymNow();save();render();toast("پرداخت ثبت شد ✓")}
function extraAlerts(){ensure();const A=[],ym=ymNow();
  S.bills.forEach(b=>{if(b.auto||b.last===ym)return;const d=daysUntil(billDue(b));if(d!==null&&d<=3)A.push({bad:d<0,t:`🔁 ${b.title}`,s:(d<0?`${fa(-d)} روز گذشته`:d===0?"امروز":`${fa(d)} روز دیگر`)+" — "+toman(b.amount),go:"bills"})});
  S.cheques.forEach(c=>{if(c.status!=="pending")return;const d=daysUntil(c.due);if(d!==null&&d<=3)A.push({bad:d<0,t:`🧾 چک ${c.kind==="out"?"صادره به":"دریافتی از"} ${c.person||""}`,s:(d<0?`${fa(-d)} روز گذشته`:d===0?"سررسید امروز":`${fa(d)} روز تا سررسید`)+" — "+toman(c.amount),go:"cheques"})});
  S.debts.forEach(x=>{if(x.settled||!x.due)return;const d=daysUntil(x.due);if(d!==null&&d<=3)A.push({bad:d<0,t:`🤝 ${x.dir==="owe"?"بدهی به":"طلب از"} ${x.person}`,s:(d<0?"موعد گذشته":d===0?"موعد امروز":`${fa(d)} روز مانده`)+" — "+toman(x.amount),go:"debts"})});
  S.budgets.forEach(b=>{if(!b.limit)return;const p=catSpent(b.cat,ym)/b.limit;if(p>=.8)A.push({bad:p>=1,t:`🎯 بودجه ${b.cat}`,s:`${fa(Math.round(p*100))}٪ خرج شده — مانده ${toman(Math.max(0,b.limit-catSpent(b.cat,ym)))}`,go:"budgets"})});
  return A}
function accPick(title,onOk,dflt){sheet(`<h2 style="margin-top:0">${esc(title)}</h2><div class="field"><label for="ap_acc">کدام حساب؟</label><select id="ap_acc">${S.accounts.map(a=>`<option value="${a.id}" ${a.id===dflt?"selected":""}>${esc(a.name)} — ${toman(balance(a))}</option>`).join("")}</select></div>
  <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">ثبت</button><button class="btn ghost" id="skip">بدون ثبت در حساب</button></div>`,(sh,close)=>{sh.querySelector("#ok").onclick=()=>{onOk(sh.querySelector("#ap_acc").value);close()};sh.querySelector("#skip").onclick=()=>{onOk(null);close()}})}
const BB=`<button class="btn small ghost back" data-go="more">→ بازگشت</button>`;
function vBudgets(){ensure();const ym=ymNow();
  return BB+`<div class="row between"><h2><span class="e">🎯</span>بودجه ماهانه</h2><button class="btn small" data-fx="addBudget">+ سقف</button></div>
  <p class="muted" style="margin-top:0">برای هر دسته یک سقف ماهانه بگذار؛ به ۸۰٪ که رسید خبرت می‌کنم.</p>
  <div class="stack">${S.budgets.length?S.budgets.map(b=>{const sp=catSpent(b.cat,ym),p=b.limit?sp/b.limit:0;
    return `<div class="card stack"><div class="row between"><b>${catE(b.cat)} ${esc(b.cat)}</b><span class="pill ${p>=1?"bad":p>=.8?"warn":"ok"}">${fa(Math.round(p*100))}٪</span></div>
    <div class="bar"><i style="width:${Math.min(100,p*100)}%;${p>=1?"background:var(--out)":p>=.8?"background:var(--saffron)":""}"></i></div>
    <div class="muted">${toman(sp)} از ${toman(b.limit)} — ${p>=1?"بیشتر از سقف: "+toman(sp-b.limit):"مانده "+toman(b.limit-sp)}</div>
    <div class="row"><button class="icon" data-edit="budgets:${b.id}">ویرایش</button><button class="icon" data-del="budgets:${b.id}">حذف</button></div></div>`}).join(""):`<div class="card">${empty("🎯","هنوز سقفی نگذاشته‌ای. مثلاً رستوران ۲ میلیون در ماه.")}</div>`}</div>`}
function budgetForm(b={}){form(b.id?"ویرایش سقف":"سقف ماهانه جدید",[{k:"cat",label:"دسته",type:"select",value:b.cat||"رستوران و بیرون‌بر",options:OUT_CATS},{k:"limit",label:"سقف ماهانه ("+U()+")",type:"money",value:b.limit||""}],
  o=>{if(!o.limit)return false;if(b.id)Object.assign(b,o);else{const ex=S.budgets.find(x=>x.cat===o.cat);if(ex)ex.limit=o.limit;else S.budgets.push({id:uid(),...o})}})}
function vBills(){ensure();const ym=ymNow();
  return BB+`<div class="row between"><h2><span class="e">🔁</span>قبض‌ها و پرداخت‌های تکراری</h2><button class="btn small" data-fx="addBill">+ جدید</button></div>
  <p class="muted" style="margin-top:0">اجاره، اینترنت، شارژ، قبض‌ها… یک بار تعریف کن؛ هر ماه یادآوری یا خودکار ثبت می‌شود.</p>
  <div class="stack">${S.bills.length?S.bills.map(b=>{const paid=b.last===ym,d=daysUntil(billDue(b));
    return `<div class="card stack"><div class="row between"><b>${catE(b.cat||"قبض‌ها")} ${esc(b.title)}</b><span class="pill ${paid?"ok":d<0?"bad":d<=3?"warn":""}">${paid?"این ماه پرداخت شد":d<0?"عقب افتاده":"روز "+fa(b.day)+" هر ماه"}</span></div>
    <div class="muted">${toman(b.amount)} · ${esc(accById(b.acc)?.name||"")} · ${b.auto?"ثبت خودکار":"فقط یادآوری"}</div>
    <div class="row">${paid?"":`<button class="btn small" data-paybill="${b.id}">پرداخت کردم</button>`}<button class="icon" data-edit="bills:${b.id}">ویرایش</button><button class="icon" data-del="bills:${b.id}">حذف</button></div></div>`}).join(""):`<div class="card">${empty("🔁","پرداخت تکراری نداری. مثلاً «اجاره» روز ۱ هر ماه.")}</div>`}</div>`}
function billForm(b={}){form(b.id?"ویرایش":"پرداخت تکراری جدید",[
  {k:"title",label:"عنوان",type:"text",value:b.title||"",ph:"اجاره، اینترنت، شارژ ساختمان…"},
  {k:"amount",label:"مبلغ ("+U()+")",type:"money",value:b.amount||""},
  {k:"day",label:"روز ماه (۱ تا ۳۱)",type:"int",value:b.day||1},
  {k:"cat",label:"دسته",type:"select",value:b.cat||"قبض‌ها",options:OUT_CATS},
  {k:"acc",label:"از حساب",type:"select",value:b.acc||S.accounts[0]?.id,options:S.accounts.map(a=>[a.id,a.name])},
  {k:"auto",type:"seg",value:b.auto?"1":"0",options:[["0","فقط یادآوری کن"],["1","خودکار ثبت کن"]]}],
  o=>{if(!o.title||!o.amount)return false;o.day=Math.min(31,Math.max(1,o.day||1));o.auto=o.auto==="1";if(b.id)Object.assign(b,o);else S.bills.push({id:uid(),last:"",...o});setTimeout(processBills,50)})}
let chTab="pending";
function vCheques(){ensure();const L=S.cheques.filter(c=>chTab==="pending"?c.status==="pending":c.status!=="pending").sort((a,b)=>(jToDate(a.due)||0)-(jToDate(b.due)||0));
  const po=S.cheques.filter(c=>c.status==="pending"&&c.kind==="out").reduce((s,c)=>s+c.amount,0),pi=S.cheques.filter(c=>c.status==="pending"&&c.kind==="in").reduce((s,c)=>s+c.amount,0);
  return BB+`<div class="row between"><h2><span class="e">🧾</span>چک‌ها</h2><button class="btn small" data-fx="addCheque">+ چک</button></div>
  <div class="grid2" style="margin-bottom:10px"><div class="card"><span class="muted">چک‌های صادره (باید پاس کنیم)</span><br><b class="out">${toman(po)}</b></div><div class="card"><span class="muted">چک‌های دریافتی</span><br><b class="in">${toman(pi)}</b></div></div>
  <div class="seg" style="margin-bottom:10px"><button class="${chTab==="pending"?"on":""}" data-cht="pending">در انتظار</button><button class="${chTab!=="pending"?"on":""}" data-cht="done">پاس‌شده / برگشتی</button></div>
  <div class="stack">${L.length?L.map(c=>{const d=daysUntil(c.due);return `<div class="card stack"><div class="row between"><b>${c.kind==="out"?"📤 صادره به":"📥 دریافتی از"} ${esc(c.person||"")}</b><b class="${c.kind==="out"?"out":"in"}">${toman(c.amount)}</b></div>
    <div class="muted">سررسید ${jfa(c.due)}${c.bank?" · "+esc(c.bank):""}${c.num?" · شماره "+esc(c.num):""}</div>
    <div class="row">${c.status==="pending"?`<span class="pill ${d<0?"bad":d<=3?"warn":""}">${d<0?fa(-d)+" روز گذشته":d===0?"امروز":fa(d)+" روز مانده"}</span><button class="btn small" data-chq="clear:${c.id}">پاس شد</button><button class="btn small ghost" data-chq="bounce:${c.id}">برگشت خورد</button>`:`<span class="pill ${c.status==="cleared"?"ok":"bad"}">${c.status==="cleared"?"پاس شد":"برگشتی"}</span>`}
    <button class="icon" data-edit="cheques:${c.id}">ویرایش</button><button class="icon" data-del="cheques:${c.id}">حذف</button></div></div>`}).join(""):`<div class="card">${empty("🧾","چکی در این بخش نیست.")}</div>`}</div>`}
function chequeForm(c={}){form(c.id?"ویرایش چک":"چک جدید",[
  {k:"kind",type:"seg",value:c.kind||"out",options:[["out","📤 صادره (من دادم)"],["in","📥 دریافتی (به من دادند)"]]},
  {k:"amount",label:"مبلغ ("+U()+")",type:"money",value:c.amount||""},
  {k:"due",label:"تاریخ سررسید",type:"jdate",value:c.due||""},
  {k:"person",label:"در وجه / از طرف",type:"text",value:c.person||""},
  {k:"bank",label:"بانک (اختیاری)",type:"text",value:c.bank||""},
  {k:"num",label:"شماره چک (اختیاری)",type:"text",value:c.num||""}],
  o=>{if(!o.amount||!o.due){toast("مبلغ و تاریخ سررسید را وارد کن");return false}if(c.id)Object.assign(c,o);else S.cheques.push({id:uid(),status:"pending",...o})})}
let dbTab="open";
function vDebts(){ensure();const open=S.debts.filter(x=>!x.settled);const owe=open.filter(x=>x.dir==="owe").reduce((s,x)=>s+x.amount,0),owed=open.filter(x=>x.dir==="owed").reduce((s,x)=>s+x.amount,0);
  const L=S.debts.filter(x=>dbTab==="open"?!x.settled:x.settled);
  return BB+`<div class="row between"><h2><span class="e">🤝</span>بدهی و طلب</h2><button class="btn small" data-fx="addDebt">+ جدید</button></div>
  <div class="grid2" style="margin-bottom:10px"><div class="card"><span class="muted">ما بدهکاریم</span><br><b class="out">${toman(owe)}</b></div><div class="card"><span class="muted">از دیگران طلب داریم</span><br><b class="in">${toman(owed)}</b></div></div>
  <div class="seg" style="margin-bottom:10px"><button class="${dbTab==="open"?"on":""}" data-dbt="open">باز</button><button class="${dbTab!=="open"?"on":""}" data-dbt="done">تسویه‌شده</button></div>
  <div class="stack">${L.length?L.map(x=>`<div class="card stack"><div class="row between"><b>${x.dir==="owe"?"🔻 بدهکار به":"🔺 طلبکار از"} ${esc(x.person)}</b><b class="${x.dir==="owe"?"out":"in"}">${toman(x.amount)}</b></div>
    <div class="muted">${x.note?esc(x.note)+" · ":""}${x.due?"موعد "+jfa(x.due):"بدون موعد"}</div>
    <div class="row">${x.settled?`<span class="pill ok">تسویه شد</span>`:`<button class="btn small" data-settle="${x.id}">تسویه شد</button>`}<button class="icon" data-edit="debts:${x.id}">ویرایش</button><button class="icon" data-del="debts:${x.id}">حذف</button></div></div>`).join(""):`<div class="card">${empty("🤝","چیزی ثبت نشده.")}</div>`}</div>`}
function debtForm(x={}){form(x.id?"ویرایش":"بدهی یا طلب جدید",[
  {k:"dir",type:"seg",value:x.dir||"owe",options:[["owe","🔻 من بدهکارم"],["owed","🔺 من طلبکارم"]]},
  {k:"person",label:"طرف حساب",type:"text",value:x.person||""},
  {k:"amount",label:"مبلغ ("+U()+")",type:"money",value:x.amount||""},
  {k:"due",label:"موعد (اختیاری)",type:"jdate",value:x.due||""},
  {k:"note",label:"توضیح",type:"text",value:x.note||""}],
  o=>{if(!o.person||!o.amount){toast("طرف حساب و مبلغ را وارد کن");return false}if(x.id)Object.assign(x,o);else S.debts.push({id:uid(),settled:false,...o})})}
document.addEventListener("click",e=>{const t=e.target.closest("[data-fx],[data-paybill],[data-cht],[data-dbt],[data-chq],[data-settle]");if(!t)return;ensure();const d=t.dataset;
  if(d.fx==="addBudget")budgetForm();else if(d.fx==="addBill")billForm();else if(d.fx==="addCheque")chequeForm();else if(d.fx==="addDebt")debtForm();
  else if(d.paybill){const b=S.bills.find(x=>x.id===d.paybill);accPick("پرداخت «"+b.title+"» — "+toman(b.amount),acc=>{if(acc)payBill(b,acc);else{b.last=ymNow();save();render()}},b.acc)}
  else if(d.cht){chTab=d.cht;render()}else if(d.dbt){dbTab=d.dbt;render()}
  else if(d.chq){const[op,id]=d.chq.split(":");const c=S.cheques.find(x=>x.id===id);
    if(op==="bounce"){c.status="bounced";save();render();toast("چک برگشتی ثبت شد")}
    else accPick(c.kind==="out"?"چک پاس شد؛ از کدام حساب کم شود؟":"چک پاس شد؛ به کدام حساب واریز شد؟",acc=>{c.status="cleared";if(acc)S.tx.unshift({id:uid(),type:c.kind==="out"?"out":"in",amount:c.amount,cat:c.kind==="out"?"سایر":"سایر درآمد",acc,date:jstr(todayJ()),note:"چک "+(c.kind==="out"?"به ":"از ")+(c.person||"")});save();render();toast("ثبت شد ✓")})}
  else if(d.settle){const x=S.debts.find(q=>q.id===d.settle);accPick(x.dir==="owe"?"بدهی را پرداختی؛ از کدام حساب؟":"طلب را گرفتی؛ به کدام حساب؟",acc=>{x.settled=true;if(acc)S.tx.unshift({id:uid(),type:x.dir==="owe"?"out":"in",amount:x.amount,cat:x.dir==="owe"?"سایر":"سایر درآمد",acc,date:jstr(todayJ()),note:(x.dir==="owe"?"تسویه بدهی به ":"دریافت طلب از ")+x.person});save();render();toast("تسویه شد ✓")})}
},true);

/* ---------- birthdays & occasions ---------- */
const EVK={birthday:["🎂","تولد"],anniv:["💍","سالگرد"],other:["🎉","مناسبت"]};
const NATIONAL=[{id:"n1",title:"نوروز",kind:"other",m:1,d:1,nat:1},{id:"n2",title:"سیزده‌به‌در",kind:"other",m:1,d:13,nat:1},{id:"n3",title:"شب یلدا",kind:"other",m:9,d:30,nat:1}];
const natOn=()=>{try{return localStorage.getItem("home-natev")!=="0"}catch(e){return true}};
const allEvents=()=>[...(S.events||[]),...(natOn()?NATIONAL:[])];
function evNext(ev,fromJ){const t=fromJ||todayJ();let y=t[0];const dd=(m,y)=>Math.min(ev.d,m<=6?31:m<=11?30:29);
  let s=jstr([y,ev.m,dd(ev.m,y)]);if(daysUntil(s)<0){y++;s=jstr([y,ev.m,dd(ev.m,y)])}return {date:s,days:daysUntil(s),year:y}}
function evLabel(ev,n){const k=EVK[ev.kind]||EVK.other;const age=ev.y?n.year-ev.y:null;
  return `${k[0]} ${ev.kind==="other"?"":k[1]+" "}${ev.title}${age>0?(ev.kind==="birthday"?` (${fa(age)} ساله می‌شود)`:` (${fa(age)} سال)`):""}`}
function eventAlerts(){return allEvents().map(ev=>{const n=evNext(ev);return {ev,n}}).filter(x=>x.n.days<=7).map(({ev,n})=>({t:evLabel(ev,n),s:n.days===0?"امروز 🎉":n.days===1?"فردا":fa(n.days)+" روز دیگر — "+jfa(n.date),go:"events"}))}
function eventsOnDay(j){const out=[];const jj=jparse(j);allEvents().forEach(ev=>{const r=ev.remind||[0,1];[0,1,7].forEach(off=>{if(!r.includes(off)&&!(ev.nat&&off===0))return;
  const target=addDays(j,off);const tj=jparse(target);const max=tj[1]<=6?31:tj[1]<=11?30:29;if(tj[1]===ev.m&&tj[2]===Math.min(ev.d,max)){const n={year:tj[0]};out.push((off===0?"امروز ":off===1?"فردا ":"یک هفته دیگر ")+evLabel(ev,n))}})});return out}
function vEvents(){ensure();const L=allEvents().map(ev=>({ev,n:evNext(ev)})).sort((a,b)=>a.n.days-b.n.days);
  return BB+`<div class="row between"><h2><span class="e">🎂</span>تولد و مناسبت‌ها</h2><button class="btn small" data-fx="addEvent">+ جدید</button></div>
  <p class="muted" style="margin-top:0">روز قبل و همان روز اعلان می‌آید. تولدها بین گوشی‌های خانواده مشترک است.</p>
  <label class="row" style="margin-bottom:10px"><input type="checkbox" id="natev" ${natOn()?"checked":""}> <span>نمایش نوروز، سیزده‌به‌در و یلدا</span></label>
  <div class="stack">${L.length?L.map(({ev,n})=>`<div class="card row">${bub((EVK[ev.kind]||EVK.other)[0],ev.title)}<div class="grow"><b>${esc(evLabel(ev,n))}</b><br><span class="muted">${fa(ev.d)} ${MONTHS[ev.m-1]}${ev.y?" "+String(ev.y).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]):""}</span></div>
    <span class="pill ${n.days===0?"ok":n.days<=7?"warn":""}">${n.days===0?"امروز":fa(n.days)+" روز"}</span>${ev.nat?"":`<span class="row" style="flex-direction:column;gap:0"><button class="icon" data-edit="events:${ev.id}">ویرایش</button><button class="icon" data-del="events:${ev.id}">حذف</button></span>`}</div>`).join(""):`<div class="card">${empty("🎂","تولد آریا، سالگرد ازدواج… را اضافه کن تا یادت بماند.")}</div>`}</div>`}
function eventForm(ev={}){
  sheet(`<h2 style="margin-top:0">${ev.id?"ویرایش":"🎂 تولد یا مناسبت جدید"}</h2><form class="stack" id="evf">
   <div class="seg" id="ev_k">${Object.entries(EVK).map(([k,v])=>`<button type="button" data-v="${k}" class="${(ev.kind||"birthday")===k?"on":""}">${v[0]} ${v[1]}</button>`).join("")}</div>
   <div class="field"><label for="ev_t">اسم (مثلاً آریا، ازدواج ما)</label><input type="text" id="ev_t" value="${esc(ev.title||"")}"></div>
   <div class="grid2"><div class="field"><label for="ev_d">روز</label><select id="ev_d">${Array.from({length:31},(_,i)=>`<option value="${i+1}" ${ev.d===i+1?"selected":""}>${fa(i+1)}</option>`).join("")}</select></div>
   <div class="field"><label for="ev_m">ماه</label><select id="ev_m">${MONTHS.map((m,i)=>`<option value="${i+1}" ${ev.m===i+1?"selected":""}>${m}</option>`).join("")}</select></div></div>
   <div class="field"><label for="ev_y">سال (اختیاری، برای حساب سن)</label><input type="text" id="ev_y" inputmode="numeric" value="${ev.y||""}" placeholder="مثلاً ۱۳۹۸"></div>
   <b>یادآوری</b>${[[7,"یک هفته قبل"],[1,"یک روز قبل"],[0,"همان روز"]].map(([o,l])=>`<label class="row"><input type="checkbox" data-rm="${o}" ${(ev.remind||[0,1]).includes(o)?"checked":""}> <span>${l}</span></label>`).join("")}
   <div class="row"><button class="btn grow" type="submit">ذخیره</button><button class="btn ghost" type="button" id="ev_x">انصراف</button></div></form>`,
  (sh,close)=>{const sg=sh.querySelector("#ev_k");sg.onclick=e=>{const b=e.target.closest("button");if(!b)return;sg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b))};
   sh.querySelector("#ev_x").onclick=close;sh.querySelector("#evf").onsubmit=e=>{e.preventDefault();ensure();
    const o={kind:sg.querySelector(".on").dataset.v,title:sh.querySelector("#ev_t").value.trim(),d:+sh.querySelector("#ev_d").value,m:+sh.querySelector("#ev_m").value,y:+enDigits(sh.querySelector("#ev_y").value)||0,remind:[...sh.querySelectorAll("[data-rm]:checked")].map(x=>+x.dataset.rm)};
    if(!o.title){toast("اسم را بنویس");return}if(ev.id)Object.assign(ev,o);else S.events.push({id:uid(),...o});close();save();render();toast("ذخیره شد 🎂")}})}
document.addEventListener("click",e=>{const t=e.target.closest("[data-fx=addEvent]");if(t)eventForm()},true);
document.addEventListener("change",e=>{if(e.target.id==="stap"){try{localStorage.setItem("home-stap",e.target.checked?"1":"0")}catch(x){}render();return}if(e.target.id==="natev"){try{localStorage.setItem("home-natev",e.target.checked?"1":"0")}catch(x){}render()}});

function render(){
  $("#unitBtn").textContent=U();const hh=new Date().getHours();$("#sunny").textContent=hh<5||hh>=20?"🌙":hh<11?"🌤️":hh<16?"☀️":"🌇";
  $("#hello").innerHTML=`<em>${esc(S.name||"سلام")}</em>، ${greeting()}`;
  const tj=todayJ();$("#today").textContent=`${WDAYS[weekIdx()]} ${fa(tj[2])} ${MONTHS[tj[1]-1]} ${String(tj[0]).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}`;
  const V={home:vHome,money:vMoney,shop:vShop,kitchen:vKitchen,more:vMore,inst:vInst,todo:vTodo,save:vSave,report:vReport,accounts:vAccounts,settings:vSettings,cards:vCards,budgets:vBudgets,bills:vBills,cheques:vCheques,debts:vDebts,events:vEvents};ensure();if(UNLOCKED){if(!window._pb){window._pb=1;processBills()}budgetCheck()}
  const vh=UNLOCKED?(V[route]||vHome)():"";const vw=$("#view");if(vh!==LASTH){vw.innerHTML=vh;LASTH=vh}vw.classList.toggle("enter",ENTER);if(ENTER)setTimeout(()=>vw.classList.remove("enter"),300);ENTER=false;renderTabs();
}

/* ---------- events ---------- */
const find=(coll,id)=>S[coll].find(x=>x.id===id);
document.addEventListener("click",async e=>{
  const t=e.target.closest("[data-go],[data-act],[data-edit],[data-shopt],[data-todot],[data-kt],[data-loc],[data-finish],[data-miss],[data-plan-pick],[data-slot],[data-pay],[data-dep],[data-wd],[data-rep],[data-txf],[data-unit],[data-ht],[data-hc]");if(!t)return;
  const d=t.dataset;
  if(d.go){if(d.kt)kTab=d.kt;go(d.go);return}
  if(d.unit){if(!["toman","rial"].includes(d.unit)&&!(RATES[d.unit]>0)){toast("اول نرخ "+CURS.find(c=>c[0]===d.unit)[1]+" را پایین همین کارت وارد کن");$("#rate_"+d.unit)?.focus();return}setUnit(d.unit);render();toast("واحد: "+U());return}
  if(d.txf){txFilter=d.txf;render();return}
  if(d.ht){hType=d.ht;hCat="all";render();return}
  if(d.hc){hCat=d.hc;render();return}
  if(d.kt){kTab=d.kt;render();return}
  if(d.loc){fLoc=d.loc;render();return}
  if(d.rep){repM=+d.rep;render();return}
  if(d.edit){const[c,id]=d.edit.split(":");const x=find(c,id);({events:eventForm,tx:txForm,shop:shopForm,fridge:fridgeForm,todo:todoForm,inst:instForm,save:saveForm,accounts:accForm,budgets:budgetForm,bills:billForm,cheques:chequeForm,debts:debtForm})[c](x);return}
  if(d.shopt){const x=find("shop",d.shopt);x.done=!x.done;save();render();if(x.done&&S.shop.every(i=>i.done))party();return}
  if(d.todot){const x=find("todo",d.todot);x.done=!x.done;save();render();return}
  if(d.finish){const x=find("fridge",d.finish);S.fridge=S.fridge.filter(f=>f!==x);S.shop.unshift({id:uid(),name:x.name,qty:"",done:false});save();render();toast(`${x.name} به لیست خرید رفت`);return}
  if(d.miss){const r=scoreRecipes().find(r=>r.n===d.miss);let k=0;r.miss.forEach(m=>{if(!S.shop.some(s=>norm(s.name)===norm(m))){S.shop.unshift({id:uid(),name:m,qty:"",done:false});k++}});save();render();toast(`${fa(k)} قلم به لیست خرید اضافه شد`);return}
  if(d.planPick){pickDay(d.planPick);return}
  if(d.slot){pickMeal(...d.slot.split(":"));return}
  if(d.pay){const it=find("inst",d.pay);const n=instNext(it);if(n<0)return;it.paid.push(n);
    S.tx.unshift({id:uid(),type:"out",amount:it.amount,cat:"اقساط",acc:it.acc||S.accounts[0]?.id,date:jstr(todayJ()),note:`${it.title} — قسط ${n+1}`});save();render();if(instNext(it)<0){party();toast("تبریک! این قسط تسویه شد 🎉")}else toast("قسط پرداخت و ثبت شد");return}
  if(d.dep){depositForm(find("save",d.dep),1);return}
  if(d.wd){depositForm(find("save",d.wd),-1);return}
  const a=d.act;
  if(a==="addtx")txForm();
  else if(a==="addshop")shopForm();
  else if(a==="addfridge")fridgeForm();
  else if(a==="addtodo")todoForm();
  else if(a==="addinst")instForm();
  else if(a==="addsave")saveForm();
  else if(a==="addacc")accForm();
  else if(a==="addcard")cardForm();
  else if(a==="saveRates"){CURS.slice(2).forEach(c=>{const v=num($("#rate_"+c[0]).value);if(v>0)RATES[c[0]]=v;else delete RATES[c[0]]});try{localStorage.setItem("home-rates",JSON.stringify(RATES))}catch(e){}render();toast("نرخ‌ها ذخیره شد ✓")}
  else if(a==="addcardphoto")cardForm({},true);
  else if(a==="lock")lockNow();
  else if(a==="chpass")changePass();
  else if(a==="setpin")setPin();
  else if(a==="delpin"){try{localStorage.removeItem(REM)}catch(e){}render();toast("پین حذف شد")}
  else if(a==="photoShop"){if(PHOTO())askPhoto("shop");else toast("عکس‌خوانی در این نمایش در دسترس نیست")}
  else if(a==="photoMenu")photoMenu();
  else if(a==="photoInvoice"){if(PHOTO())askPhoto("invoice");else toast("عکس‌خوانی در این نمایش در دسترس نیست")}
  else if(a==="photoFridge")askPhoto("fridge");
  else if(a==="toFridge"){const done=S.shop.filter(x=>x.done);done.forEach(x=>S.fridge.unshift({id:uid(),name:x.name,qty:x.qty,loc:"یخچال",exp:""}));S.shop=S.shop.filter(x=>!x.done);save();render();toast(`${fa(done.length)} قلم به موجودی رفت`)}
  else if(a==="shopExpense"){txForm({},{type:"out",cat:"سوپرمارکت",note:S.shop.filter(x=>x.done).map(x=>x.name).join("، ").slice(0,120)})}
  else if(a==="weekShop"){const need=new Set();Object.values(S.plan).forEach(p=>[p.l,p.d].forEach(m=>{const r=allRecipes().find(r=>r.n===m);r&&r.i.forEach(x=>{if(!have(x))need.add(x)})}));
    let k=0;need.forEach(m=>{if(!S.shop.some(s=>norm(s.name)===norm(m))){S.shop.unshift({id:uid(),name:m,qty:"",done:false});k++}});save();render();toast(k?`${fa(k)} قلم به لیست خرید اضافه شد`:"همه مواد را داری یا برنامه خالی است")}
  else if(a==="planAuto"){const R=scoreRecipes();let j=0;for(let i=0;i<7;i++){S.plan[i]=S.plan[i]||{};if(!S.plan[i].l){S.plan[i].l=R[j%R.length].n;j++}if(!S.plan[i].d){S.plan[i].d=R[(j+5)%R.length].n;j++}}save();render();toast("خانه‌های خالی پر شد")}
  else if(a==="planClear"){S.plan={};save();render()}
  else if(a==="aiMeal"){runAI("#aiMeal",t,`تو مشاور آشپزی خانواده ایرانی هستی. موجودی آشپزخانه: ${S.fridge.map(f=>f.name+(f.qty?" ("+f.qty+")":"")+(f.exp&&daysUntil(f.exp)<=2?" [نزدیک انقضا]":"")).join("، ")||"خالی"}.
۵ غذای ایرانی ساده و اقتصادی پیشنهاد بده که بیشتر با همین مواد درست شود و اول مواد نزدیک به انقضا مصرف شود. برای هر غذا: نام، مواد لازم که کم داریم، و یک جمله طرز تهیه. کوتاه و فارسی، بدون مقدمه.`)}
  else if(a==="aiTip"){const ym=+d.ym;const {by,tot,inc}=tips(ym);runAI("#aiTip",t,`تو مشاور اقتصادی خانواده ایرانی هستی. خلاصه ماه ${MONTHS[ym%100-1]}: درآمد ${inc} تومان، خرج ${tot} تومان. خرج به تفکیک دسته: ${Object.entries(by).map(([c,v])=>c+": "+v).join("، ")}. اقساط ماهانه: ${S.inst.filter(it=>instNext(it)>=0).map(it=>it.title+" "+it.amount).join("، ")||"ندارد"}. اهداف پس‌انداز: ${S.save.map(g=>g.title+" "+g.saved+"/"+g.target).join("، ")||"ندارد"}.
۵ پیشنهاد عملی و مشخص (با عدد تقریبی صرفه‌جویی به تومان) برای کم کردن خرج و پس‌انداز بیشتر بده. کوتاه، فارسی، بدون مقدمه.`)}
  else if(a==="setName"){S.name=$("#setName").value.trim()||"مهدی";save();render();toast("ذخیره شد")}
  else if(a==="notif"){try{const p=await Notification.requestPermission();if(p==="granted")notifyNow();}catch(err){}render()}
  else if(a==="export"){const {auth,...rest}=S;const txt=JSON.stringify(rest);try{await navigator.clipboard.writeText(txt);toast("پشتیبان کپی شد؛ در یادداشت گوشی نگه دار")}catch(err){sheet(`<h2 style="margin-top:0">متن پشتیبان</h2><textarea rows="8" readonly>${esc(txt)}</textarea>`,sh=>sh.querySelector("textarea").select())}}
  else if(a==="import"){sheet(`<h2 style="margin-top:0">بازگردانی</h2><p class="muted">متن پشتیبان را اینجا بچسبان. اطلاعات فعلی جایگزین می‌شود.</p><textarea id="imp" rows="8"></textarea><div class="row" style="margin-top:10px"><button class="btn grow" id="ok">بازگردانی</button></div>`,(sh,close)=>sh.querySelector("#ok").onclick=()=>{try{const o=JSON.parse(sh.querySelector("#imp").value);if(!o.tx)throw 0;const au=S.auth;S=o;S.auth=au;save();close();render();toast("بازگردانی شد")}catch(err){toast("متن پشتیبان درست نیست")}})}
  else if(a==="wipe"){const n=S.name,au=S.auth,un=S.unit;S=blank();S.name=n;S.auth=au;S.unit=un;save();render();toast("آماده‌ای؛ از صفر شروع کن")}
  else if(a==="wipeAsk"){sheet(`<h2 style="margin-top:0">همه اطلاعات پاک شود؟</h2><p class="muted">تراکنش‌ها، اقساط، لیست‌ها و موجودی همه حذف می‌شوند و برنمی‌گردند.</p><div class="row"><button class="btn grow" id="y" style="background:var(--out);color:#fff">بله، پاک کن</button><button class="btn ghost grow" id="n">نه</button></div>`,(sh,close)=>{sh.querySelector("#n").onclick=close;sh.querySelector("#y").onclick=()=>{const n=S.name,au=S.auth,un=S.unit;S=blank();S.name=n;S.auth=au;S.unit=un;save();close();go("home")}})}
});
$("#quickAdd").onclick=()=>txForm();
document.addEventListener("change",e=>{if(e.target.id==="hm"){hM=+e.target.value;render()}else if(e.target.id==="ha"){txFilter=e.target.value;render()}});
let hqT;document.addEventListener("input",e=>{if(e.target.id!=="hq")return;hQ=e.target.value;clearTimeout(hqT);hqT=setTimeout(()=>{render();const i=$("#hq");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},350)});
$("#unitBtn").onclick=()=>{const av=CURS.filter(c=>["toman","rial"].includes(c[0])||RATES[c[0]]>0);const i=av.findIndex(c=>c[0]===curU());setUnit(av[(i+1)%av.length][0]);render();toast("واحد: "+U()+(av.length<3?" — دلار، یورو، پوند و یوان را از تنظیمات فعال کن":""))};

let aiCtl=null;
async function runAI(sel,btn,prompt){const out=$(sel);if(!SAMPLE||!out)return;btn.disabled=true;out.classList.remove("muted");out.textContent="در حال فکر کردن…";
  aiCtl?.abort();aiCtl=new AbortController();
  try{await SAMPLE(prompt,{signal:aiCtl.signal,cache:false,onText:({text})=>{out.textContent=text}})}
  catch(err){out.textContent=err?.code==="not_granted"?"اجازه استفاده داده نشد.":err?.code==="rate_limited"?"کمی بعد دوباره امتحان کن.":"جواب نیامد؛ دوباره امتحان کن."}
  btn.disabled=false}

function pickMeal(day,slot){const R=scoreRecipes();const cur=(S.plan[day]||{})[slot]||"";
  sheet(`<h2 style="margin-top:0">${WDAYS[day]} — ${slot==="l"?"ناهار":"شام"}</h2>
  <div class="chips">${R.map(r=>`<button class="chip ${cur===r.n?"on":""}" data-m="${esc(r.n)}">${esc(r.n)}${r.miss.length===0?" ✓":""}</button>`).join("")}</div>
  <div class="field" style="margin-top:12px"><label for="cm">یا غذای دیگر</label><input type="text" id="cm" value="${esc(R.some(r=>r.n===cur)?"":cur)}"></div>
  <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">ذخیره</button><button class="btn ghost" id="clr">خالی</button></div>`,(sh,close)=>{
    let sel=cur;sh.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{sel=b.dataset.m;sh.querySelectorAll("[data-m]").forEach(x=>x.classList.toggle("on",x===b));sh.querySelector("#cm").value=""});
    const set=v=>{S.plan[day]=S.plan[day]||{};S.plan[day][slot]=v;save();close();render()};
    sh.querySelector("#ok").onclick=()=>set(sh.querySelector("#cm").value.trim()||sel);sh.querySelector("#clr").onclick=()=>set("")})}
function pickDay(meal){sheet(`<h2 style="margin-top:0">«${esc(meal)}» برای کدام روز؟</h2><div class="stack">${WDAYS.map((w,i)=>`<div class="row"><span class="grow">${w}</span><button class="btn small ghost" data-d="${i}:l">ناهار</button><button class="btn small ghost" data-d="${i}:d">شام</button></div>`).join("")}</div>`,(sh,close)=>{
  sh.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const[i,s]=b.dataset.d.split(":");S.plan[i]=S.plan[i]||{};S.plan[i][s]=meal;save();close();render();toast("به برنامه اضافه شد")})})}

function notifyNow(){try{if(!("Notification" in window)||Notification.permission!=="granted")return;const A=alerts();
  new Notification(`${S.name}، ${greeting()}`,{body:A.length?A.slice(0,3).map(a=>a.t+": "+a.s).join("\n"):"امروز یادآوری فوری نداری.",lang:"fa",dir:"rtl"})}catch(e){}}

renderTabs();renderLock();
setInterval(()=>{if(UNLOCKED)render()},300000);
