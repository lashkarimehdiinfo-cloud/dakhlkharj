
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
const IN_CATS=["حقوق","پاداش","فروش","سود سپرده","وام","سایر درآمد"];
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
function blank(){return {name:"مهدی",accounts:[{id:uid(),name:"نقدی",type:"cash",init:0}],tx:[],inst:[],shop:[],todo:[],fridge:[],plan:{},save:[],budgets:[],bills:[],cheques:[],debts:[],recipes:[],events:[],deposits:[],prices:[]}}
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
const isFut=t=>(daysUntil(t.date)||0)>0;
function balance(acc){return (acc.init||0)+S.tx.filter(t=>t.acc===acc.id&&!isFut(t)).reduce((s,t)=>s+(t.type==="in"?t.amount:-t.amount),0)}
const monthKey=s=>{const a=jparse(s);return a?a[0]*100+a[1]:0};
function monthTx(ym){return S.tx.filter(t=>monthKey(t.date)===ym&&!isFut(t))}
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
    if(d!==null&&d<=5)A.push({bad:d<0,t:`قسط ${it.title}`,s:d<0?`${fa(-d)} روز عقب افتاده — ${toman(instAmt(it,i))}`:d===0?`امروز — ${toman(instAmt(it,i))}`:`${fa(d)} روز دیگر — ${toman(instAmt(it,i))}`,go:"inst"})});
  S.fridge.forEach(f=>{if(!f.exp)return;const d=daysUntil(f.exp);if(d!==null&&d<=2)A.push({bad:d<0,t:f.name,s:d<0?"تاریخش گذشته":d===0?"امروز باید مصرف شود":`${fa(d)} روز تا انقضا`,go:"kitchen"})});
  S.todo.forEach(t=>{if(t.done||!t.due)return;const d=daysUntil(t.due);if(d!==null&&d<=0)A.push({bad:d<0,t:t.text,s:d<0?"کار عقب افتاده":"کار امروز",go:"todo"})});
  const n=S.shop.filter(x=>!x.done).length;if(n)A.push({t:"لیست خرید",s:`${fa(n)} قلم مانده`,go:"shop"});
  A.push(...eventAlerts(),...extraAlerts());
  try{const cl=cashLow();if(cl)A.unshift({bad:true,t:"⚠️ تا حقوق پول کم می‌آید",s:`قبل از ${fa(S.salary.day)}ام ${toman(cl.before)} قسط/قبض داری؛ ${toman(cl.gap)} کم است`,go:"forecast"})}catch(e){}
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
    if(f.type==="jdate")return `<div class="field"><label>${f.label}</label>${datePickHTML("f_"+f.k,v,/اختیاری/.test(f.label))}</div>`;
    return `<div class="field"><label for="f_${f.k}">${f.label}</label><input type="text" id="f_${f.k}" name="${f.k}" ${im} value="${esc(val)}" ${f.ph?`placeholder="${esc(f.ph)}"`:""} autocomplete="off"></div>`}).join("")}
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
    if(isNew)S.tx.unshift({id:uid(),...o,date:o.date||jstr(todayJ())});else Object.assign(t,o);
    if((daysUntil(o.date)||0)>0)toast(`🗓 برای ${jfa(o.date)} برنامه‌ریزی شد · تا آن روز از موجودی کم نمی‌شود ولی در «ماه بعد چه خبر؟» حساب شده`);else toast(isNew?"ثبت شد":"ذخیره شد")});
}
function accForm(a={}){form(a.id?"ویرایش حساب":"کارت / حساب جدید",[
  {k:"name",label:"نام",type:"text",value:a.name||"",ph:"مثلاً کارت ملت، حساب پس‌انداز"},
  {k:"type",label:"نوع",type:"select",value:a.type||"card",options:[["card","کارت بانکی"],["bank","حساب بانکی"],["cash","نقدی"]]},
  {k:"init",label:"موجودی فعلی ("+U()+")",type:"money",value:a.id?a.init:""},
  {k:"last4",label:"۴ رقم آخر کارت یا حساب (برای پیامک بانک)",type:"text",value:a.last4||""}],
  o=>{if(!o.name){toast("نام را بنویس");return false}if(a.id)Object.assign(a,o);else S.accounts.push({id:uid(),...o})},
  `<p class="muted" style="margin:0">برای امنیت، شماره کارت را اینجا ننویس؛ فقط یک اسم کافی است.</p>`)}
const instAmt=(it,i)=>Array.isArray(it.amts)&&it.amts[i]!=null?+it.amts[i]:it.amount;
const instLeft=it=>{let t=0;for(let i=0;i<it.count;i++)if(!it.paid.includes(i))t+=instAmt(it,i);return t};
function buildAmts(mode,o){const n=o.count;if(mode==="eq")return null;if(mode==="custom")return o.custom;
  const out=[];const step=Math.max(1,o.every||1);for(let i=0;i<n;i++){const k=Math.floor(i/step);out.push(Math.round(o.incType==="pct"?o.amount*Math.pow(1+o.inc/100,k):o.amount+o.inc*k))}return out}
function instForm(it={}){const mode=Array.isArray(it.amts)?(it.mode||"custom"):"eq";const st=it.step||{};
  sheet(`<h2 style="margin-top:0">${it.id?"ویرایش قسط":"قسط جدید"}</h2><form class="stack" id="if">
   <div class="field"><label for="i_t">عنوان</label><input type="text" id="i_t" value="${esc(it.title||"")}" placeholder="مثلاً اقساط یخچال، وام مسکن"></div>
   <div class="seg" id="i_mode"><button type="button" data-v="eq" class="${mode==="eq"?"on":""}">مساوی</button><button type="button" data-v="step" class="${mode==="step"?"on":""}">پلکانی</button><button type="button" data-v="custom" class="${mode==="custom"?"on":""}">مبلغ دلخواه</button></div>
   <div class="grid2"><div class="field"><label for="i_n">تعداد اقساط</label><input type="text" id="i_n" inputmode="numeric" value="${it.count||12}"></div>
   <div class="field" id="i_af"><label for="i_a">${mode==="step"?"قسط اول":"مبلغ هر قسط"} (${U()})</label><input type="text" id="i_a" inputmode="decimal" value="${it.amount?Math.round(it.amount*F()).toLocaleString("en"):""}"></div></div>
   <div id="i_step" class="stack" ${mode==="step"?"":"hidden"}>
    <div class="grid2"><div class="field"><label for="i_inc">هر بار چقدر زیاد شود</label><input type="text" id="i_inc" inputmode="decimal" value="${st.inc!=null?(st.incType==="pct"?st.inc:Math.round(st.inc*F()).toLocaleString("en")):""}"></div>
    <div class="field"><label for="i_it">واحد افزایش</label><select id="i_it"><option value="amt" ${st.incType!=="pct"?"selected":""}>${U()}</option><option value="pct" ${st.incType==="pct"?"selected":""}>درصد ٪</option></select></div></div>
    <div class="field"><label for="i_ev">هر چند وقت یک بار زیاد شود</label><select id="i_ev">${[[1,"هر ماه"],[2,"هر ۲ ماه"],[3,"هر ۳ ماه"],[6,"هر ۶ ماه"],[12,"هر سال"]].map(([v,l])=>`<option value="${v}" ${(st.every||1)===v?"selected":""}>${l}</option>`).join("")}</select></div></div>
   <div id="i_custom" class="stack" ${mode==="custom"?"":"hidden"}></div>
   <div class="card" id="i_sum" style="background:var(--t-grape);box-shadow:none"></div>
   <div class="field"><label>تاریخ اولین قسط</label>${datePickHTML("i_s",it.start||jstr(todayJ()),false)}</div>
   <div class="field"><label for="i_acc">پرداخت از</label><select id="i_acc">${S.accounts.map(a=>`<option value="${a.id}" ${a.id===it.acc?"selected":""}>${esc(a.name)}</option>`).join("")}</select></div>
   <div class="row"><button class="btn grow" type="submit">ذخیره</button><button class="btn ghost" type="button" id="i_x">انصراف</button></div></form>`,
  (sh,close)=>{const g=q=>sh.querySelector(q);let M=mode;const cur=()=>({count:Math.max(1,Math.min(360,+enDigits(g("#i_n").value)||1)),amount:num(g("#i_a").value)/F(),inc:g("#i_it").value==="pct"?(+enDigits(g("#i_inc").value).replace(/[^\d.]/g,"")||0):num(g("#i_inc").value)/F(),incType:g("#i_it").value,every:+g("#i_ev").value,
      custom:[...sh.querySelectorAll("[data-ca]")].map(x=>num(x.value)/F())});
    const customRows=()=>{const n=cur().count,old=[...sh.querySelectorAll("[data-ca]")].map(x=>x.value);const base=it.amts||[];g("#i_custom").innerHTML=`<span class="muted">مبلغ هر قسط را جدا بنویس:</span>`+Array.from({length:n},(_,i)=>`<div class="row"><span style="width:80px;flex:none" class="muted">قسط ${fa(i+1)}<br><small>${jfa(addMonthsJ(g("#i_s").value||jstr(todayJ()),i))}</small></span><input type="text" data-ca="${i}" inputmode="decimal" class="grow" value="${old[i]!=null?old[i]:base[i]!=null?Math.round(base[i]*F()).toLocaleString("en"):g("#i_a").value}"></div>`).join("");sh.querySelectorAll("[data-ca]").forEach(moneyInput);sum()};
    const sum=()=>{const c=cur();const a=buildAmts(M,c)||Array(c.count).fill(c.amount);const tot=a.reduce((x,y)=>x+(y||0),0);
      g("#i_sum").innerHTML=c.amount||M==="custom"?`<b>جمع کل: ${toman(tot)}</b><br><span class="muted">${M==="eq"?fa(c.count)+" قسط "+toman(c.amount):"قسط اول "+toman(a[0]||0)+" · قسط آخر "+toman(a[a.length-1]||0)}</span>${M==="step"?`<div class="muted" style="margin-top:4px">${a.slice(0,6).map((x,i)=>fa(i+1)+": "+toman(x)).join(" · ")}${a.length>6?" …":""}</div>`:""}`:`<span class="muted">مبلغ را بنویس.</span>`};
    moneyInput(g("#i_a"));g("#i_inc").addEventListener("input",e=>{if(g("#i_it").value!=="pct"){const v=num(e.target.value);e.target.value=v?v.toLocaleString("en"):""}sum()});
    ["#i_n","#i_a"].forEach(q=>g(q).addEventListener("input",()=>{if(M==="custom")customRows();else sum()}));["#i_it","#i_ev"].forEach(q=>g(q).addEventListener("change",sum));
    sh.addEventListener("input",e=>{if(e.target.dataset.ca!=null)sum()});
    g("#i_mode").onclick=e=>{const b=e.target.closest("button");if(!b)return;M=b.dataset.v;g("#i_mode").querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));g("#i_step").hidden=M!=="step";g("#i_custom").hidden=M!=="custom";g("#i_af").querySelector("label").firstChild.textContent=M==="step"?"قسط اول ":"مبلغ هر قسط ";if(M==="custom")customRows();else sum()};
    if(M==="custom")customRows();else sum();
    g("#i_x").onclick=close;g("#if").onsubmit=e=>{e.preventDefault();const c=cur();const t=g("#i_t").value.trim();
      if(!t||(!c.amount&&M!=="custom")){toast("عنوان و مبلغ را وارد کن");return}
      const amts=buildAmts(M,c);const o={title:t,count:c.count,amount:amts?amts[0]:c.amount,amts:amts||undefined,mode:M,step:M==="step"?{inc:c.inc,incType:c.incType,every:c.every}:undefined,start:g("#i_s").value||jstr(todayJ()),acc:g("#i_acc").value};
      if(!amts){delete o.amts}if(it.id){if(!amts)delete it.amts;Object.assign(it,o)}else S.inst.push({id:uid(),paid:[],...o});close();save();render();toast("قسط ذخیره شد ✓")}})}
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
function renderTabs(){const cur=["inst","todo","save","report","accounts","settings","cards","family","budgets","bills","cheques","debts","events","chat","forecast","loans","deposits","safety"].includes(route)?"more":route==="prices"?"shop":route;
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
    ${(()=>{const sp=spendable();return `<div class="mini" style="grid-template-columns:1fr 1fr;margin-top:10px"><div><span class="lab">⏳ اقساط و قبض‌های مانده این ماه</span><b>${toman(sp.fixed)}</b></div><div><span class="lab">🛍 قابل خرج تا آخر ماه</span><b style="${sp.free<0?"color:#ffd0d6":""}">${toman(sp.free)}</b></div></div><div class="note">${SAFE().floor?"🛡️ "+toman(SAFE().floor)+" کف موجودی کنار ماند · ":""}روزی حدود ${toman(sp.perDay)} می‌توانی خرج کنی${sp.salaryComing?" · حقوق روز "+fa(S.salary.day)+" واریز می‌شود":""}${sp.reserve?`<br>📌 ${toman(sp.reserve)} برای قسط‌های اول ماه بعد (قبل از حقوق) کنار ماند`:""}</div>`})()}
    <div class="mini"><div><span class="lab">⬆ درآمد ${MONTHS[ym%100-1]}</span><b>${toman(inc)}</b></div><div><span class="lab">⬇ خرج ${MONTHS[ym%100-1]}</span><b>${toman(out)}</b></div></div>
    ${inc?`<div class="meter"><i style="width:${Math.min(100,out/inc*100)}%;${out>inc?"background:var(--pom)":""}"></i></div><div class="note">${fa(Math.round(out/inc*100))}٪ از درآمد این ماه خرج شده ${out/inc<.7?"— آفرین 👏":out>inc?"— مراقب باش ⚠️":""}</div>`:""}
  </div>
  ${(()=>{const f=forecast(ymAdd(ymNow(),1));return `<button class="card row" data-go="forecast" style="width:100%;border:0;font:inherit;color:inherit;text-align:right;cursor:pointer;margin-top:12px;background:var(--t-grape)"><span class="bub" style="background:var(--surface)">🔮</span><span class="grow"><b>${MONTHS[ymAdd(ymNow(),1)%100-1]} چقدر برایت می‌ماند؟</b><br><span class="muted">اقساط و ثابت‌ها ${toman(f.fixed)} · بعدش ${toman(f.afterFixed)}</span></span><b class="${f.free<0?"out":"in"}">${toman(f.free)}</b></button>`})()}
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
    <div class="card list">${g.items.map(t=>`<div class="item">${bub(catE(t.cat),t.cat)}<div class="t"><b>${esc(t.note||t.cat)}</b>${isFut(t)?` <span class="pill">🗓 برنامه‌ریزی‌شده</span>`:""}<br><span class="muted">${esc(t.cat)} · ${t.type==="in"?"به":"از"} ${esc(accById(t.acc)?.name||"—")}</span></div><b class="${t.type==="in"?"in":"out"}" style="white-space:nowrap">${t.type==="in"?"+":"−"}${toman(t.amount)}</b>
      <span class="row" style="flex-direction:column;gap:0"><button class="icon" data-edit="tx:${t.id}">ویرایش</button><button class="icon" data-del="tx:${t.id}">حذف</button></span></div>`).join("")}</div>`}).join("")
  :`<div class="card">${empty("🧾",S.tx.length?"با این فیلترها چیزی پیدا نشد.":"هنوز چیزی ثبت نشده. با دکمه زرد + اولین خرج یا درآمد را وارد کن.")}</div>`}`;
}

function vShop(){
  const open=S.shop.filter(x=>!x.done),done=S.shop.filter(x=>x.done);
  const row=x=>`<div class="item ${x.done?"done":""}"><input type="checkbox" data-shopt="${x.id}" ${x.done?"checked":""} aria-label="خریده شد">${bub(foodE(x.name),x.name)}<span class="t"><b>${esc(x.name)}</b> <span class="muted">${esc(x.qty||"")}</span>${x.price?`<br><span class="muted">💰 ${toman(x.price)}</span>`:(()=>{const lp=lastPrice(x.name);return lp?`<br><span class="muted">🏷️ دفعه قبل ${toman(lp.price)}</span>`:""})()}</span><button class="icon" data-edit="shop:${x.id}">ویرایش</button><button class="icon" data-del="shop:${x.id}">حذف</button></div>`;
  return `<div class="row between"><h2><span class="e">🛒</span>لیست خرید</h2><button class="btn small ghost" data-go="prices">🏷️ قیمت‌ها</button><span class="pill ${open.length?"warn":"ok"}">${open.length?fa(open.length)+" مانده":"کامل شد"}</span></div>
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
  <button class="tile c3" data-go="safety"><span class="ti">🛡️</span><b>حاشیه امن</b><span>${(()=>{const g=emerg(false);return g?toman(g.saved)+" در صندوق":"صندوق اضطراری"})()}</span></button>
  <button class="tile c4" data-go="loans"><span class="ti">🏦</span><b>وام‌ها</b><span>${fa(S.inst.filter(i=>i.loan&&instNext(i)>=0).length)} وام فعال</span></button>
  <button class="tile c1" data-go="deposits"><span class="ti">💹</span><b>سپرده و سود</b><span>${(()=>{const m=(S.deposits||[]).filter(d=>!d.closed&&d.payout!=="end").reduce((s,d)=>s+depMonthly(d),0);return m?toman(m)+" در ماه":"اضافه کن"})()}</span></button>
  <button class="tile c1" data-act="salary"><span class="ti">💼</span><b>حقوق خودکار</b><span>${S.salary&&S.salary.amount?toman(S.salary.amount):"تنظیم کن"}</span></button>
  <button class="tile c5" data-go="forecast"><span class="ti">🔮</span><b>ماه آینده</b><span>${(()=>{const f=forecast(ymAdd(ymNow(),1));return toman(f.free)+" آزاد"})()}</span></button>
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
  const totalLeft=S.inst.reduce((s,it)=>s+instLeft(it),0);
  return backBtn+`<div class="row between"><h2>اقساط</h2><button class="btn small" data-act="addinst">+ قسط</button></div>
  ${S.inst.length?`<div class="card row between" style="margin-bottom:10px"><span class="muted">مانده همه اقساط</span><b class="out">${toman(totalLeft)}</b></div>`:""}
  <div class="stack">${S.inst.length?S.inst.map(it=>{const n=instNext(it),d=n>=0?daysUntil(instDue(it,n)):null;
    return `<div class="card stack"><div class="row between"><b>${esc(it.title)}</b><span class="pill ${n<0?"ok":d<0?"bad":d<=5?"warn":""}">${n<0?"تسویه شد":d<0?"عقب افتاده":"قسط بعد: "+jfa(instDue(it,n))}</span></div>
    <div class="muted">${Array.isArray(it.amts)?(it.mode==="step"?"پلکانی":"مبلغ دلخواه")+" · قسط بعد "+toman(n>=0?instAmt(it,n):0)+" ·":toman(it.amount)+" ×"} ${fa(it.count)} قسط — ${fa(it.paid.length)} قسط پرداخت شده، مانده ${toman(instLeft(it))}</div>
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
  return `<div class="item"><div class="t"><b>${esc(a.name)}</b><br><span class="muted">موجودی ${toman(balance(a))} · <span class="in">واریز ${toman(ins)}</span> · <span class="out">برداشت ${toman(outs)}</span></span></div><button class="icon" data-recon="${a.id}">⚖️ تطبیق</button><button class="icon" data-edit="accounts:${a.id}">ویرایش</button><button class="icon" data-del="accounts:${a.id}">حذف</button></div>`}).join("")||`<p class="muted">حسابی نداری.</p>`}</div>`}

function tips(ym){
  const M=monthTx(ym),P=monthTx(ym%100===1?(Math.floor(ym/100)-1)*100+12:ym-1);
  const out=M.filter(t=>t.type==="out"&&t.cat!=="پس‌انداز"),inc=M.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
  const tot=out.reduce((s,t)=>s+t.amount,0);const by={};out.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amount);
  const pby={};P.filter(t=>t.type==="out").forEach(t=>pby[t.cat]=(pby[t.cat]||0)+t.amount);
  const T=[];const top=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
  if(top&&tot&&top[1]/tot>.35)T.push(`«${top[0]}» ${fa(Math.round(top[1]/tot*100))}٪ کل خرج این ماه است. برای این دسته یک سقف ماهانه بگذار.`);
  if(by["رستوران و بیرون‌بر"]&&by["رستوران و بیرون‌بر"]>tot*.12)T.push(`بیرون‌بر ${toman(by["رستوران و بیرون‌بر"])} شد. اگر نصفش را با برنامه هفتگی آشپزی در خانه جایگزین کنی، حدود ${toman(by["رستوران و بیرون‌بر"]/2)} صرفه‌جویی می‌شود.`);
  Object.entries(by).forEach(([c,v])=>{if(pby[c]&&v>pby[c]*1.25&&v-pby[c]>300000)T.push(`خرج «${c}» نسبت به ماه قبل ${fa(Math.round((v/pby[c]-1)*100))}٪ بیشتر شده.`)});
  const instM=S.inst.reduce((s,it)=>{const n=instNext(it);return s+(n>=0?instAmt(it,n):0)},0);
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
function ensure(){["budgets","bills","cheques","debts","recipes","events","deposits","prices"].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]})}
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
function vDebts(){ensure();const open=S.debts.filter(x=>!x.settled);const rem=x=>x.amount-(x.pays||[]).reduce((s,p)=>s+p.a,0);const owe=open.filter(x=>x.dir==="owe").reduce((s,x)=>s+rem(x),0),owed=open.filter(x=>x.dir==="owed").reduce((s,x)=>s+rem(x),0);
  const L=S.debts.filter(x=>dbTab==="open"?!x.settled:x.settled);
  return BB+`<div class="row between"><h2><span class="e">🤝</span>بدهی و طلب</h2><span class="row" style="gap:6px"><button class="btn small saf" data-fx="repayCalc">🧮 ماشین‌حساب قرض</button><button class="btn small" data-fx="addDebt">+ جدید</button></span></div>
  <div class="grid2" style="margin-bottom:10px"><div class="card"><span class="muted">ما بدهکاریم</span><br><b class="out">${toman(owe)}</b></div><div class="card"><span class="muted">از دیگران طلب داریم</span><br><b class="in">${toman(owed)}</b></div></div>
  <div class="seg" style="margin-bottom:10px"><button class="${dbTab==="open"?"on":""}" data-dbt="open">باز</button><button class="${dbTab!=="open"?"on":""}" data-dbt="done">تسویه‌شده</button></div>
  <div class="stack">${L.length?L.map(x=>`<div class="card stack"><div class="row between"><b>${x.dir==="owe"?"🔻 بدهکار به":"🔺 طلبکار از"} ${esc(x.person)}</b><b class="${x.dir==="owe"?"out":"in"}">${toman(x.amount)}</b></div>
    <div class="muted">${x.note?esc(x.note)+" · ":""}${x.plan?"برنامه "+fa(x.plan.length)+" قسطی":x.due?"موعد "+jfa(x.due):"بدون موعد"}</div>
    ${x.plan&&!x.settled?`<div class="muted">${planParts(x).map((pp,j)=>`${pp.done?"✅":"⏳"} ${jfa(pp.d)}: ${toman(pp.full)}`).join("<br>")}</div>`:""}
    ${(x.pays||[]).length?`<div class="bar"><i style="width:${Math.min(100,x.pays.reduce((s,p)=>s+p.a,0)/x.amount*100)}%"></i></div><div class="muted">${x.dir==="owe"?"پرداخت‌شده":"دریافت‌شده"} ${toman(x.pays.reduce((s,p)=>s+p.a,0))} · مانده ${toman(Math.max(0,x.amount-x.pays.reduce((s,p)=>s+p.a,0)))}</div>`:""}
    <div class="row" style="flex-wrap:wrap">${x.settled?`<span class="pill ok">تسویه شد</span>`:`<button class="btn small" data-dpay="${x.id}">${x.dir==="owe"?"پرداخت بخشی":"دریافت بخشی"}</button><button class="btn small ghost" data-rplan="${x.id}">📅 ${x.plan?"برنامه جدید":x.dir==="owe"?"کی پس بدهیم؟":"چند قسطی بگیرم؟"}</button><button class="btn small ghost" data-settle="${x.id}">تسویه کامل</button>`}<button class="icon" data-edit="debts:${x.id}">ویرایش</button><button class="icon" data-del="debts:${x.id}">حذف</button></div></div>`).join(""):`<div class="card">${empty("🤝","چیزی ثبت نشده.")}</div>`}</div>`}
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
  else if(d.settle){const x=S.debts.find(q=>q.id===d.settle);accPick(x.dir==="owe"?"بدهی را پرداختی؛ از کدام حساب؟":"طلب را گرفتی؛ به کدام حساب؟",acc=>{x.settled=true;const rest=x.amount-(x.pays||[]).reduce((s,p)=>s+p.a,0);if(acc&&rest>0)S.tx.unshift({id:uid(),type:x.dir==="owe"?"out":"in",amount:rest,cat:x.dir==="owe"?"سایر":"سایر درآمد",acc,date:jstr(todayJ()),note:(x.dir==="owe"?"تسویه بدهی به ":"دریافت طلب از ")+x.person});save();render();toast("تسویه شد ✓")})}
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

/* ---------- Jalali date picker ---------- */
function datePickHTML(id,val,optional){const t=todayJ();const a=jparse(val)||(optional?null:t);
  const yr=[];for(let y=t[0]-2;y<=t[0]+5;y++)yr.push(y);
  return `<div class="dpick" data-dp="${id}"><input type="hidden" id="${id}" value="${a?jstr(a):""}">
   <select data-dpp="d" aria-label="روز">${optional?`<option value="">روز</option>`:""}${Array.from({length:31},(_,i)=>`<option value="${i+1}" ${a&&a[2]===i+1?"selected":""}>${fa(i+1)}</option>`).join("")}</select>
   <select data-dpp="m" aria-label="ماه">${optional?`<option value="">ماه</option>`:""}${MONTHS.map((m,i)=>`<option value="${i+1}" ${a&&a[1]===i+1?"selected":""}>${m}</option>`).join("")}</select>
   <select data-dpp="y" aria-label="سال">${optional?`<option value="">سال</option>`:""}${yr.map(y=>`<option value="${y}" ${a&&a[0]===y?"selected":""}>${String(y).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}</option>`).join("")}</select></div>
   <div class="chips dpq" data-dpq="${id}"><button type="button" class="chip" data-q="0">امروز</button><button type="button" class="chip" data-q="1">فردا</button><button type="button" class="chip" data-q="7">هفته بعد</button><button type="button" class="chip" data-q="m1">ماه بعد</button>${optional?`<button type="button" class="chip" data-q="x">بدون تاریخ</button>`:""}</div>`}
function dpSet(id,s){const w=document.querySelector(`[data-dp="${id}"]`);if(!w)return;const a=jparse(s);w.querySelector("input").value=a?jstr(a):"";
  ["d","m","y"].forEach((k,i)=>{w.querySelector(`[data-dpp="${k}"]`).value=a?String(a[[2,1,0][i]]):""})}
document.addEventListener("change",e=>{const s=e.target.closest("[data-dpp]");if(!s)return;const w=s.closest("[data-dp]");
  const v=k=>w.querySelector(`[data-dpp="${k}"]`).value;const d=+v("d"),m=+v("m"),y=+v("y");
  w.querySelector("input").value=d&&m&&y?jstr([y,m,Math.min(d,m<=6?31:m<=11?30:30)]):""});
document.addEventListener("click",e=>{const b=e.target.closest("[data-dpq] [data-q]");if(!b)return;e.preventDefault();const id=b.closest("[data-dpq]").dataset.dpq;const q=b.dataset.q;const t=jstr(todayJ());
  dpSet(id,q==="x"?"":q==="m1"?addMonthsJ(t,1):addDays(t,+q))});

/* ---------- next-month forecast ---------- */
function ymAdd(ym,k){let y=Math.floor(ym/100),m=ym%100-1+k;y+=Math.floor(m/12);m=((m%12)+12)%12;return y*100+m+1}
const ymName=ym=>MONTHS[ym%100-1]+" "+String(Math.floor(ym/100)).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
function avgIncome(){const now=ymNow();const v=[1,2,3].map(k=>S.tx.filter(t=>t.type==="in"&&monthKey(t.date)===ymAdd(now,-k)&&t.cat!=="سایر درآمد").reduce((s,t)=>s+t.amount,0)).filter(x=>x>0);
  const cur=S.tx.filter(t=>t.type==="in"&&monthKey(t.date)===now&&t.cat!=="سایر درآمد").reduce((s,t)=>s+t.amount,0);
  if(v.length)return Math.round(v.reduce((a,b)=>a+b,0)/v.length);return cur}
function avgDaily(){const now=ymNow();const fixed=new Set(["اقساط","پس‌انداز","اجاره","قبض‌ها"]);const billCats=new Set((S.bills||[]).map(b=>b.title));
  const mon=k=>S.tx.filter(t=>t.type==="out"&&monthKey(t.date)===ymAdd(now,-k)&&!fixed.has(t.cat)&&!/خودکار|قسط|چک |تسویه/.test(t.note||"")).reduce((s,t)=>s+t.amount,0);
  const v=[1,2,3].map(mon).filter(x=>x>0);if(v.length)return Math.round(v.reduce((a,b)=>a+b,0)/v.length);
  const cur=mon(0),day=todayJ()[2];return day>3?Math.round(cur/day*30):cur}
function forecast(ym,noSafe){ensure();const L=[];
  const income=S.fcIncome>0?S.fcIncome:(S.salary&&S.salary.amount?S.salary.amount:avgIncome());
  S.inst.forEach(it=>{for(let i=0;i<it.count;i++){if(it.paid.includes(i))continue;const d=instDue(it,i);if(monthKey(d)===ym)L.push({k:"inst",e:"📆",t:`قسط ${it.title} (${fa(i+1)} از ${fa(it.count)})`,d,a:instAmt(it,i)})}});
  S.bills.forEach(b=>{if(b.last===ym)return;const max=ym%100<=6?31:ym%100<=11?30:29;L.push({k:"bill",e:"🔁",t:b.title,d:jstr([Math.floor(ym/100),ym%100,Math.min(b.day,max)]),a:b.amount})});
  let chIn=0;S.cheques.forEach(c=>{if(c.status!=="pending"||monthKey(c.due)!==ym)return;if(c.kind==="out")L.push({k:"cheque",e:"🧾",t:"چک به "+(c.person||""),d:c.due,a:c.amount});else chIn+=c.amount});
  let dbIn=0;S.debts.forEach(x=>{if(x.settled||x.id===FC_SKIP)return;if(Array.isArray(x.plan)&&x.plan.length){planParts(x).forEach((pp,j)=>{if(pp.done||monthKey(pp.d)!==ym)return;if(x.dir==="owe")L.push({k:"debt",e:"🤝",t:`قرض ${x.person} (${fa(j+1)} از ${fa(x.plan.length)})`,d:pp.d,a:pp.a});else dbIn+=pp.a});return}if(!x.due||monthKey(x.due)!==ym)return;const rm=x.amount-(x.pays||[]).reduce((s,p)=>s+p.a,0);if(x.dir==="owe")L.push({k:"debt",e:"🤝",t:"بدهی به "+x.person,d:x.due,a:rm});else dbIn+=rm});
  let depIn=0;(S.deposits||[]).forEach(d=>{if(d.closed||!d.amount)return;const end=d.term?addMonthsJ(d.start,d.term):null;if(d.payout==="end"){if(end&&monthKey(end)===ym)depIn+=depMonthly(d)*d.term}else if(monthKey(d.start)<ym&&(!end||monthKey(end)>=ym))depIn+=depMonthly(d)});
  let ptIn=0;S.tx.forEach(t=>{if(!isFut(t)||monthKey(t.date)!==ym)return;if(t.type==="out")L.push({k:"plan",e:"🗓",t:"خرج برنامه‌ریزی‌شده: "+(t.note||t.cat),d:t.date,a:t.amount});else ptIn+=t.amount});
  L.sort((a,b)=>(jToDate(a.d)||0)-(jToDate(b.d)||0));
  const fixed=L.reduce((s,x)=>s+x.a,0);
  const bud=(S.budgets||[]).reduce((s,b)=>s+(b.limit||0),0);const daily=S.fcDaily>0?S.fcDaily:(bud||avgDaily());
  const extraIn=chIn+dbIn+depIn+ptIn;const afterFixed=income+extraIn-fixed;const safety=noSafe?0:safeMonthly(income);const free=afterFixed-safety-daily;
  return {ym,income,extraIn,L,fixed,daily,afterFixed,safety,free,src:S.fcDaily>0?"دستی":bud?"جمع بودجه‌ها":"میانگین ۳ ماه اخیر",isrc:S.fcIncome>0?"دستی":S.salary&&S.salary.amount?"حقوق ثبت‌شده":"میانگین ۳ ماه اخیر"}}
let fcYm=0;
function vForecast(){const base=ymAdd(ymNow(),1);const ym=fcYm||base;const f=forecast(ym);
  const months=[0,1,2,3,4,5,6].map(k=>forecast(ymAdd(ymNow(),k)));const mx=Math.max(1,...months.map(m=>Math.abs(m.free)),...months.map(m=>m.income));
  const pct=f.income?Math.round(f.fixed/f.income*100):0;
  return `<button class="btn small ghost back" data-go="more">→ بازگشت</button>
  <h2><span class="e">🔮</span>پیش‌بینی ماه‌های آینده</h2>
  <div class="chips" style="margin-bottom:10px">${[0,1,2,3,4,5].map(k=>{const y=ymAdd(ymNow(),k);return `<button class="chip ${y===ym?"on":""}" data-fcym="${y}">${k===0?"این ماه":k===1?"ماه بعد":MONTHS[y%100-1]}</button>`}).join("")}</div>
  <div class="wallet"><div class="lab">💰 ${ymName(ym)} — بعد از اقساط و خرج‌های ثابت می‌ماند</div><div class="big">${toman(f.afterFixed)}</div>
   <div class="mini"><div><span class="lab">⬆ درآمد پیش‌بینی</span><b>${toman(f.income+f.extraIn)}</b></div><div><span class="lab">⬇ اقساط و ثابت‌ها</span><b>${toman(f.fixed)}</b></div></div>
   ${f.income?`<div class="meter"><i style="width:${Math.min(100,pct)}%;${pct>70?"background:var(--pom)":""}"></i></div><div class="note">${fa(pct)}٪ درآمد صرف اقساط و پرداخت‌های ثابت می‌شود ${pct>50?"⚠️":"👍"}</div>`:""}</div>
  ${(()=>{const sl=S.salary;if(!sl||!(sl.day>1))return "";const E=f.L.filter(x=>{const q=jparse(x.d);return q&&q[2]<sl.day});if(!E.length)return "";const sum=E.reduce((s,x)=>s+x.a,0);
    return `<div class="card stack" style="margin-top:12px;border:2px solid var(--t-pom)"><b>⏰ قبل از حقوق (۱ تا ${fa(sl.day-1)} ${MONTHS[ym%100-1]}): ${toman(sum)}</b><div class="muted">${E.map(x=>`${jfa(x.d)} · ${esc(x.t)}: ${toman(x.a)}`).join("<br>")}</div><div class="muted">حقوقت ${fa(sl.day)}ام می‌آید؛ این مبلغ را از حقوق ${MONTHS[ymAdd(ym,-1)%100-1]} کنار بگذار. اپ خودش آن را از «قابل خرج» کم می‌کند.</div></div>`})()}
  <div class="card stack" style="margin-top:12px">${f.safety?`<div class="row between"><span>🛟 حاشیه امن (${fa(SAFE().pct)}٪ درآمد)</span><b class="out">${toman(f.safety)}</b></div>`:""}<div class="row between"><span>🛒 خرج روزمره تخمینی <span class="muted">(${f.src})</span></span><b class="out">${toman(f.daily)}</b></div>
   <div class="row between" style="border-top:1px dashed var(--line);padding-top:8px"><b>✨ پول آزاد آخر ماه</b><b class="${f.free<0?"out":"in"}" style="font-size:20px">${toman(f.free)}</b></div>
   ${f.free<0?`<div class="banner" style="background:var(--t-pom)">⚠️ این ماه ${toman(-f.free)} کم می‌آوری. خرج روزمره را کم کن یا از پس‌انداز بردار.</div>`:f.free>0?`<span class="muted">پیشنهاد: ${toman(Math.round(f.free*.5))} از آن را به پس‌انداز بزن.</span>`:""}</div>
  ${adviceCard()}
  <h2><span class="e">📋</span>پرداخت‌های ${ymName(ym)}</h2>
  <div class="card list">${f.L.length?f.L.map(x=>`<div class="item">${bub(x.e,x.k)}<div class="t"><b>${esc(x.t)}</b><br><span class="muted">${jfa(x.d)}${daysUntil(x.d)!==null&&daysUntil(x.d)>=0&&daysUntil(x.d)<=40?" · "+(daysUntil(x.d)===0?"امروز":fa(daysUntil(x.d))+" روز دیگر"):""}</span></div><b class="out">${toman(x.a)}</b></div>`).join("")+`<div class="item"><span class="t"><b>جمع</b></span><b class="out">${toman(f.fixed)}</b></div>`:empty("🎉","پرداخت ثابتی برای این ماه ثبت نشده.")}</div>
  ${f.extraIn?`<div class="card row between" style="margin-top:10px"><span>📥 سود سپرده، چک یا طلبی که این ماه می‌گیری</span><b class="in">${toman(f.extraIn)}</b></div>`:""}
  <h2><span class="e">📈</span>۷ ماه آینده</h2>
  <div class="card stack">${months.map(m=>`<button class="row" data-fcym="${m.ym}" style="border:0;background:none;font:inherit;color:inherit;cursor:pointer;padding:2px 0;text-align:right"><span style="width:62px;font-size:13px;flex:none">${MONTHS[m.ym%100-1]}</span><span class="grow bar" style="height:14px"><i style="width:${Math.max(2,Math.abs(m.free)/mx*100)}%;${m.free<0?"background:var(--pom)":""}"></i></span><b class="${m.free<0?"out":"in"}" style="font-size:12.5px;min-width:96px;text-align:left">${toman(m.free)}</b></button>`).join("")}
   <span class="muted">پول آزاد هر ماه بعد از اقساط، پرداخت‌های ثابت و خرج روزمره. ماهی که قسطی تمام شود، سبزتر می‌شود.</span></div>
  <h2><span class="e">⚙️</span>تنظیم پیش‌بینی</h2>
  <div class="card stack"><div class="row between"><span>💼 حقوق خودکار: <b>${S.salary&&S.salary.amount?toman(S.salary.amount)+" — روز "+fa(S.salary.day):"تنظیم نشده"}</b></span><button class="btn small" data-act="salary">${S.salary&&S.salary.amount?"ویرایش":"تنظیم"}</button></div>
   <div class="field"><label for="fc_inc">درآمد دستی برای پیش‌بینی (اختیاری) (${U()})</label><input type="text" id="fc_inc" inputmode="decimal" value="${S.fcIncome>0?Math.round(S.fcIncome*F()).toLocaleString("en"):""}" placeholder="خالی = ${S.salary&&S.salary.amount?"حقوق ثبت‌شده":toman(avgIncome())+" (میانگین)"}"></div>
   <div class="field"><label for="fc_day">خرج روزمره ماهانه (${U()})</label><input type="text" id="fc_day" inputmode="decimal" value="${S.fcDaily>0?Math.round(S.fcDaily*F()).toLocaleString("en"):""}" placeholder="خالی = خودکار"></div>
   <button class="btn small" data-act="fcSave" style="align-self:flex-start">ذخیره</button></div>`}
document.addEventListener("click",e=>{const t=e.target.closest("[data-fcym],[data-act=fcSave]");if(!t)return;
  if(t.dataset.fcym){fcYm=+t.dataset.fcym;render();scrollTo(0,0);return}
  S.fcIncome=num($("#fc_inc").value)/F()||0;S.fcDaily=num($("#fc_day").value)/F()||0;save();render();toast("ذخیره شد ✓")},true);
document.addEventListener("input",e=>{if(e.target.id==="fc_inc"||e.target.id==="fc_day"){const v=num(e.target.value);e.target.value=v?v.toLocaleString("en"):""}});

/* ---------- auto salary, spendable, advisor ---------- */
function processSalary(){const sl=S.salary;if(!sl||!sl.amount||!sl.day)return;const ym=ymNow(),t=todayJ();
  if(sl.last!==ym&&t[2]>=sl.day){const acc=accById(sl.acc)?sl.acc:S.accounts[0]?.id;const max=t[1]<=6?31:t[1]<=11?30:29;
    S.tx.unshift({id:uid(),type:"in",amount:sl.amount,cat:"حقوق",acc,date:jstr([t[0],t[1],Math.min(sl.day,max)]),note:"حقوق ماهانه (خودکار)"});sl.last=ym;save();const f=forecast(ym);const en=earlyNext();toast(`💼 حقوق ثبت شد · ${toman(f.fixed)} برای اقساط این ماه${en.sum?" و "+toman(en.sum)+" برای قسط‌های اول ماه بعد":""} و ${toman(f.safety)} برای حاشیه امن کنار بگذار`)}}
function salaryForm(){const sl=S.salary||{};form("💼 حقوق ماهانه خودکار",[
  {k:"amount",label:"مبلغ حقوق ("+U()+")",type:"money",value:sl.amount||""},
  {k:"day",label:"روز واریز در ماه (۱ تا ۳۱)",type:"int",value:sl.day||1},
  {k:"acc",label:"به کدام حساب",type:"select",value:sl.acc||S.accounts[0]?.id,options:S.accounts.map(a=>[a.id,a.name])}],
  o=>{if(!o.amount)return false;o.day=Math.min(31,Math.max(1,o.day||1));S.salary={...sl,...o};S.fcIncome=0;setTimeout(()=>{processSalary();render()},50)},
  `<p class="muted" style="margin:0">هر ماه از این روز به بعد، حقوق خودکار به حساب اضافه می‌شود و در پیش‌بینی ماه‌های آینده حساب می‌شود.</p>`)}
function dueRest(){const ym=ymNow(),L=[];
  S.inst.forEach(it=>{for(let i=0;i<it.count;i++){if(it.paid.includes(i))continue;const d=instDue(it,i);if(monthKey(d)===ym&&daysUntil(d)>=0)L.push({t:"قسط "+it.title,a:instAmt(it,i),d})}});
  (S.bills||[]).forEach(b=>{if(b.last===ym||b.auto&&todayJ()[2]>=b.day)return;L.push({t:b.title,a:b.amount,d:billDue(b)})});
  (S.cheques||[]).forEach(c=>{if(c.status==="pending"&&c.kind==="out"&&monthKey(c.due)===ym)L.push({t:"چک "+(c.person||""),a:c.amount,d:c.due})});

  S.tx.forEach(t=>{if(t.type==="out"&&isFut(t)&&monthKey(t.date)===ym)L.push({t:t.note||t.cat,a:t.amount,d:t.date})});
  (S.debts||[]).forEach(x=>{if(x.settled||x.dir!=="owe"||x.id===FC_SKIP||!Array.isArray(x.plan))return;planParts(x).forEach(pp=>{if(!pp.done&&monthKey(pp.d)===ym)L.push({t:"قرض "+x.person,a:pp.a,d:pp.d})})});
  return L}
function spendable(){const bal=S.accounts.filter(a=>a.type!=="savings").reduce((s,a)=>s+balance(a),0);const L=dueRest();const fixed=L.reduce((s,x)=>s+x.a,0);
  const t=todayJ();const dim=t[1]<=6?31:t[1]<=11?30:29;const left=Math.max(1,dim-t[2]+1);
  const sl=S.salary;const salaryComing=sl&&sl.amount&&sl.last!==ymNow()&&t[2]<sl.day;
  const en=earlyNext();const reserve=salaryComing?0:en.sum;
  const free=bal-fixed-SAFE().floor-reserve;return {bal,fixed,L,free,left,perDay:Math.floor(Math.max(0,free)/left),salaryComing,salary:salaryComing?sl.amount:0,reserve,early:en}}
function earlyNext(){const sl=S.salary;if(!sl||!sl.amount||!(sl.day>1))return {sum:0,L:[]};const L=forecast(ymAdd(ymNow(),1),true).L.filter(x=>{const a=jparse(x.d);return a&&a[2]<sl.day});return {sum:L.reduce((s,x)=>s+x.a,0),L}}
function cashLow(){const sl=S.salary;const sp=spendable();if(!sp.salaryComing)return null;const before=sp.L.filter(x=>{const a=jparse(x.d);return a&&a[2]<sl.day}).reduce((s,x)=>s+x.a,0);const gap=before-sp.bal;return gap>0?{gap,before}:null}
const ESS=["نان","شیر","ماست","پنیر","تخم","برنج","روغن","مرغ","گوشت","سبزی","میوه","سیب‌زمینی","پیاز","گوجه","حبوبات","عدس","لوبیا","دارو","پوشک","شوینده","مایع","پودر","دستمال","آب","قبض","اجاره","بنزین","شکر","چای","نمک"];
const LUX=["پیتزا","فست","رستوران","کافه","بستنی","شکلات","پفک","چیپس","نوشابه","کیک","آجیل","لباس","کفش","عطر","ادکلن","لوازم آرایش","اسباب‌بازی","گیم","طلا","موبایل","هدفون","تزئینی","تفریح","سینما"];
const isEss=n=>ESS.some(k=>norm(n).includes(norm(k)));const isLux=n=>LUX.some(k=>norm(n).includes(norm(k)));
function advice(){const sp=spendable();const f=forecast(ymAdd(ymNow(),1));const now=ymNow(),prev=ymAdd(now,-1);const T=[];
  const by=ym=>{const o={};S.tx.filter(t=>t.type==="out"&&monthKey(t.date)===ym&&!["اقساط","پس‌انداز"].includes(t.cat)).forEach(t=>o[t.cat]=(o[t.cat]||0)+t.amount);return o};
  const bc=by(now),bp=by(prev);
  if(sp.free<0)T.push({lv:2,t:`با موجودی فعلی، پرداخت‌های باقی‌مانده این ماه را نمی‌توانی کامل بدهی (${toman(-sp.free)} کم داری). تا واریز بعدی فقط چیزهای ضروری بخر.`});
  else T.push({lv:0,t:`تا آخر ماه روزی حدود ${toman(sp.perDay)} می‌توانی خرج کنی و اقساط و قبض‌ها هم پرداخت شوند.`});
  const fun=["رستوران و بیرون‌بر","تفریح","پوشاک"];const funSum=fun.reduce((s,c)=>s+(bc[c]||0),0);
  if(funSum>0&&(sp.free<0||f.free<0))T.push({lv:1,t:`این ماه ${toman(funSum)} خرج بیرون‌بر، تفریح و پوشاک شده. تا وضع بهتر شود، این‌ها را عقب بینداز.`});
  Object.entries(bc).forEach(([c,v])=>{if(bp[c]&&v>bp[c]*1.3&&v-bp[c]>500000)T.push({lv:1,t:`«${c}» از ماه قبل ${fa(Math.round((v/bp[c]-1)*100))}٪ بیشتر شده.`})});
  (S.budgets||[]).forEach(b=>{const s=bc[b.cat]||0;if(b.limit&&s>b.limit)T.push({lv:2,t:`بودجه «${b.cat}» رد شده. تا آخر ماه دیگر از این دسته خرید نکن.`})});
  if(f.free<0)T.push({lv:2,t:`ماه آینده ${toman(-f.free)} کم می‌آوری. خرید قسطی جدید نگیر و از الان کنار بگذار.`});
  else if(f.free>0)T.push({lv:0,t:`ماه آینده حدود ${toman(f.free)} آزاد داری. پیشنهاد: ${toman(Math.round(f.free*.3))} را اول ماه به پس‌انداز بزن.`});
  {const g=emerg(false),tg=safeTarget();if(!g||!g.saved)T.push({lv:1,t:"صندوق اضطراری نداری. از بخش «حاشیه امن» هر ماه ۱۰٪ درآمد را برای مواقع خاص کنار بگذار."});else if(tg&&g.saved<tg)T.push({lv:0,t:`صندوق اضطراری ${fa(Math.round(g.saved/tg*100))}٪ پر است؛ ${toman(tg-g.saved)} دیگر تا خرج ${fa(SAFE().months)} ماه.`})}
  const fin=S.inst.filter(it=>instNext(it)>=0).map(it=>({it,left:it.count-it.paid.length})).sort((a,b)=>a.left-b.left)[0];
  if(fin&&fin.left<=3)T.push({lv:0,t:`قسط «${fin.it.title}» فقط ${fa(fin.left)} قسط دیگر مانده؛ بعدش ماهی ${toman(instAmt(fin.it,instNext(fin.it)))} دستت بازتر می‌شود.`});
  const open=S.shop.filter(x=>!x.done);const lux=open.filter(x=>isLux(x.name)&&!isEss(x.name)),ess=open.filter(x=>isEss(x.name));
  return {sp,f,T,lux,ess}}
function adviceCard(){const a=advice();const col={0:"var(--t-green)",1:"var(--t-saf)",2:"var(--t-pom)"};const ico={0:"💡",1:"⚠️",2:"⛔"};
  return `<h2><span class="e">🧠</span>مشاور خرید</h2><div class="stack">${a.T.map(x=>`<div class="alert" style="background:${col[x.lv]};box-shadow:none;cursor:default">${ico[x.lv]}<span class="grow">${esc(x.t)}</span></div>`).join("")}
  ${a.ess.length||a.lux.length?`<div class="card stack"><b>🛒 لیست خرید فعلی</b>${a.ess.length?`<div><span class="pill ok">ضروری — بخر</span> ${a.ess.map(x=>esc(x.name)).join("، ")}</div>`:""}${a.lux.length?`<div><span class="pill ${a.sp.free<0||a.f.free<0?"bad":"warn"}">${a.sp.free<0||a.f.free<0?"فعلاً نخر":"اگر پول اضافه ماند"}</span> ${a.lux.map(x=>esc(x.name)).join("، ")}</div>`:""}</div>`:""}</div>`}

/* ---------- loans, deposits, partial debt payments ---------- */
function loanCalc(P,rate,n){const r=rate/1200;const m=r>0?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n;const total=m*n;return {m:Math.round(m),total:Math.round(total),interest:Math.round(total-P)}}
function vLoans(){ensure();const L=S.inst.filter(it=>it.loan);
  const left=L.reduce((s,it)=>s+(it.count-it.paid.length)*it.amount,0),monthly=L.filter(it=>instNext(it)>=0).reduce((s,it)=>s+it.amount,0);
  return BB+`<div class="row between"><h2><span class="e">🏦</span>وام‌ها</h2><button class="btn small" data-fx="addLoan">+ وام</button></div>
  ${L.length?`<div class="grid2" style="margin-bottom:10px"><div class="card"><span class="muted">قسط ماهانه همه وام‌ها</span><br><b class="out">${toman(monthly)}</b></div><div class="card"><span class="muted">مانده کل بدهی وام</span><br><b class="out">${toman(left)}</b></div></div>`:""}
  <div class="stack">${L.length?L.map(it=>{const l=it.loan,n=instNext(it),paidN=it.paid.length,c=loanCalc(l.principal,l.rate,it.count);
    const intPaid=(()=>{let bal=l.principal,ip=0;const r=l.rate/1200;for(let i=0;i<paidN;i++){const x=bal*r;ip+=x;bal-=it.amount-x}return {ip:Math.round(ip),bal:Math.max(0,Math.round(bal))}})();
    return `<div class="card stack"><div class="row between"><b>🏦 ${esc(it.title)}</b><span class="pill ${n<0?"ok":""}">${n<0?"تسویه شد":"قسط بعد: "+jfa(instDue(it,n))}</span></div>
    <div class="muted">${l.bank?"بانک "+esc(l.bank)+" · ":""}مبلغ وام ${toman(l.principal)} · سود ${fa(l.rate)}٪ · ${fa(it.count)} ماه</div>
    <div class="grid2"><div><span class="muted">قسط ماهانه</span><br><b>${toman(it.amount)}</b></div><div><span class="muted">کل سود وام</span><br><b class="out">${toman(c.interest)}</b></div>
    <div><span class="muted">اصل باقی‌مانده</span><br><b>${toman(intPaid.bal)}</b></div><div><span class="muted">سود پرداخت‌شده تا حالا</span><br><b>${toman(intPaid.ip)}</b></div></div>
    <div class="bar"><i style="width:${paidN/it.count*100}%"></i></div><div class="muted">${fa(paidN)} از ${fa(it.count)} قسط پرداخت شده · مانده ${toman((it.count-paidN)*it.amount)}</div>
    ${l.acct||l.card?`<div class="muted">${l.acct?`شماره حساب وام: <b dir="ltr">${esc(l.acct)}</b> <button class="icon" data-copyv="${esc(l.acct)}">کپی</button>`:""}${l.card?`<br>کارت پرداخت قسط: <b dir="ltr">${esc(grp(l.card))}</b> <button class="icon" data-copyv="${esc(l.card)}">کپی</button>`:""}</div>`:""}
    <div class="row">${n>=0?`<button class="btn small" data-pay="${it.id}">پرداخت قسط ${fa(n+1)}</button>`:""}<button class="icon" data-loanedit="${it.id}">ویرایش</button><button class="icon" data-del="inst:${it.id}">حذف</button></div></div>`}).join(""):`<div class="card">${empty("🏦","وامی ثبت نشده. مبلغ و سود و تعداد اقساط را بده تا قسط و کل سود را حساب کنم.")}</div>`}</div>`}
function loanForm(it={}){const l=it.loan||{};
  sheet(`<h2 style="margin-top:0">${it.id?"ویرایش وام":"🏦 وام جدید"}</h2><form class="stack" id="lf">
   <div class="field"><label for="l_t">عنوان</label><input type="text" id="l_t" value="${esc(it.title||"")}" placeholder="مثلاً وام ازدواج"></div>
   <div class="field"><label for="l_b">بانک</label><input type="text" id="l_b" value="${esc(l.bank||"")}"></div>
   <div class="field"><label for="l_p">مبلغ وام (${U()})</label><input type="text" id="l_p" inputmode="decimal" value="${l.principal?Math.round(l.principal*F()).toLocaleString("en"):""}"></div>
   <div class="grid2"><div class="field"><label for="l_r">سود سالانه ٪</label><input type="text" id="l_r" inputmode="decimal" value="${l.rate??""}" placeholder="مثلاً ۲۳"></div>
   <div class="field"><label for="l_n">تعداد اقساط (ماه)</label><input type="text" id="l_n" inputmode="numeric" value="${it.count||""}" placeholder="مثلاً ۳۶"></div></div>
   <div class="card" id="l_calc" style="background:var(--t-grape);box-shadow:none"></div>
   <div class="field"><label>تاریخ اولین قسط</label>${datePickHTML("l_s",it.start||addMonthsJ(jstr(todayJ()),1),false)}</div>
   <div class="field"><label for="l_acc">قسط از کدام حساب پرداخت می‌شود</label><select id="l_acc">${S.accounts.map(a=>`<option value="${a.id}" ${a.id===it.acc?"selected":""}>${esc(a.name)}</option>`).join("")}</select></div>
   <div class="field"><label for="l_ac">شماره حساب وام (اختیاری)</label><input type="text" id="l_ac" dir="ltr" value="${esc(l.acct||"")}" autocomplete="off"></div>
   <div class="field"><label for="l_c">شماره کارت پرداخت قسط (اختیاری)</label><input type="text" id="l_c" dir="ltr" inputmode="numeric" value="${esc(l.card?grp(l.card):"")}" autocomplete="off"></div>
   ${it.id?"":`<label class="row"><input type="checkbox" id="l_in"> <span>مبلغ وام همین الان به حساب واریز شد (به درآمد اضافه شود)</span></label>`}
   <div class="row"><button class="btn grow" type="submit">ذخیره</button><button class="btn ghost" type="button" id="l_x">انصراف</button></div></form>`,
  (sh,close)=>{const g=id=>sh.querySelector(id);const calc=()=>{const P=num(g("#l_p").value)/F(),r=+enDigits(g("#l_r").value)||0,n=+enDigits(g("#l_n").value)||0;
      g("#l_calc").innerHTML=P&&n?(()=>{const c=loanCalc(P,r,n);return `<b>قسط ماهانه: ${toman(c.m)}</b><br><span class="muted">کل بازپرداخت ${toman(c.total)} · کل سود ${toman(c.interest)}</span>`})():`<span class="muted">مبلغ، سود و تعداد اقساط را بنویس تا قسط حساب شود.</span>`};
    ["#l_p","#l_r","#l_n"].forEach(id=>g(id).addEventListener("input",calc));moneyInput(g("#l_p"));calc();
    g("#l_c").addEventListener("input",e=>{e.target.value=grp(enDigits(e.target.value).slice(0,19))});
    g("#l_x").onclick=close;g("#lf").onsubmit=e=>{e.preventDefault();const P=num(g("#l_p").value)/F(),r=+enDigits(g("#l_r").value)||0,n=+enDigits(g("#l_n").value)||0;
      if(!g("#l_t").value.trim()||!P||!n){toast("عنوان، مبلغ و تعداد اقساط را وارد کن");return}const c=loanCalc(P,r,n);
      const o={title:g("#l_t").value.trim(),amount:c.m,count:n,start:g("#l_s").value||jstr(todayJ()),acc:g("#l_acc").value,loan:{bank:g("#l_b").value.trim(),principal:P,rate:r,acct:enDigits(g("#l_ac").value.trim()),card:enDigits(g("#l_c").value).replace(/\D/g,"")}};
      if(it.id)Object.assign(it,o);else{S.inst.push({id:uid(),paid:[],...o});if(g("#l_in")&&g("#l_in").checked)S.tx.unshift({id:uid(),type:"in",amount:P,cat:"وام",acc:o.acc,date:jstr(todayJ()),note:"دریافت "+o.title})}
      close();save();render();toast("وام ذخیره شد ✓")}})}
function depMonthly(d){return Math.round(d.amount*d.rate/1200)}
function processDeposits(){ensure();const t=todayJ(),ym=ymNow();let n=0;
  S.deposits.forEach(d=>{if(d.closed||!d.amount)return;const end=d.term?addMonthsJ(d.start,d.term):null;const day=jparse(d.start)[2];
    if(d.payout==="end"){if(end&&daysUntil(end)<=0&&!d.paidEnd){S.tx.unshift({id:uid(),type:"in",amount:depMonthly(d)*d.term,cat:"سود سپرده",acc:d.acc,date:end,note:"سود "+d.title});d.paidEnd=1;n++}return}
    if(d.last===ym||daysUntil(d.start)>0||(end&&daysUntil(end)<0&&monthKey(end)!==ym))return;
    if(t[2]>=Math.min(day,t[1]<=6?31:t[1]<=11?30:29)&&monthKey(d.start)!==ym){S.tx.unshift({id:uid(),type:"in",amount:depMonthly(d),cat:"سود سپرده",acc:d.acc,date:jstr([t[0],t[1],Math.min(day,t[1]<=6?31:t[1]<=11?30:29)]),note:"سود ماهانه "+d.title+" (خودکار)"});d.last=ym;n++}});
  if(n){save();toast(`💹 سود ${fa(n)} سپرده ثبت شد`)}}
function vDeposits(){ensure();const D=S.deposits;const tot=D.filter(d=>!d.closed).reduce((s,d)=>s+d.amount,0),mon=D.filter(d=>!d.closed&&d.payout!=="end").reduce((s,d)=>s+depMonthly(d),0);
  const earned=S.tx.filter(t=>t.cat==="سود سپرده").reduce((s,t)=>s+t.amount,0);
  return BB+`<div class="row between"><h2><span class="e">💹</span>سپرده‌ها</h2><button class="btn small" data-fx="addDep">+ سپرده</button></div>
  ${D.length?`<div class="grid2" style="margin-bottom:10px"><div class="card"><span class="muted">جمع سپرده‌ها</span><br><b>${toman(tot)}</b></div><div class="card"><span class="muted">سود ماهانه</span><br><b class="in">${toman(mon)}</b></div></div><div class="card row between" style="margin-bottom:10px"><span class="muted">کل سودی که تا حالا گرفتی</span><b class="in">${toman(earned)}</b></div>`:""}
  <div class="stack">${D.length?D.map(d=>{const end=d.term?addMonthsJ(d.start,d.term):null;const de=end?daysUntil(end):null;
    return `<div class="card stack"><div class="row between"><b>💹 ${esc(d.title)}</b>${d.closed?`<span class="pill">بسته شد</span>`:end?`<span class="pill ${de<=30?"warn":""}">${de<0?"سررسید گذشته":"سررسید "+jfa(end)}</span>`:`<span class="pill ok">کوتاه‌مدت</span>`}</div>
    <div class="muted">${d.bank?"بانک "+esc(d.bank)+" · ":""}${toman(d.amount)} · سود ${fa(d.rate)}٪ سالانه${d.term?" · "+fa(d.term)+" ماهه":""}</div>
    <div class="grid2"><div><span class="muted">${d.payout==="end"?"سود کل در سررسید":"سود هر ماه"}</span><br><b class="in">${toman(d.payout==="end"?depMonthly(d)*d.term:depMonthly(d))}</b></div><div><span class="muted">سود سالانه</span><br><b class="in">${toman(depMonthly(d)*12)}</b></div></div>
    <div class="muted">${d.payout==="end"?"سود در سررسید":"هر ماه روز "+fa(jparse(d.start)[2])+" خودکار"} به ${esc(accById(d.acc)?.name||"")} واریز می‌شود${d.acct?` · حساب سپرده <b dir="ltr">${esc(d.acct)}</b>`:""}</div>
    <div class="row">${d.closed?"":`<button class="btn small ghost" data-depclose="${d.id}">بستن سپرده</button>`}<button class="icon" data-edit="deposits:${d.id}">ویرایش</button><button class="icon" data-del="deposits:${d.id}">حذف</button></div></div>`}).join(""):`<div class="card">${empty("💹","سپرده‌ای ثبت نشده. مبلغ و درصد سود را بده تا سود ماهانه‌ات حساب و خودکار به درآمد اضافه شود.")}</div>`}</div>`}
function depositForm2(d={}){form(d.id?"ویرایش سپرده":"💹 سپرده جدید",[
  {k:"title",label:"عنوان",type:"text",value:d.title||"",ph:"مثلاً سپرده یک‌ساله"},
  {k:"bank",label:"بانک",type:"text",value:d.bank||""},
  {k:"amount",label:"مبلغ سپرده ("+U()+")",type:"money",value:d.amount||""},
  {k:"rate",label:"سود سالانه ٪",type:"text",value:d.rate??"",ph:"مثلاً ۲۰.۵"},
  {k:"term",label:"مدت (ماه) — برای کوتاه‌مدت خالی بگذار",type:"int",value:d.term||""},
  {k:"start",label:"تاریخ افتتاح",type:"jdate",value:d.start||jstr(todayJ())},
  {k:"payout",type:"seg",value:d.payout||"monthly",options:[["monthly","سود ماهانه"],["end","سود در سررسید"]]},
  {k:"acc",label:"سود به کدام حساب واریز شود",type:"select",value:d.acc||S.accounts[0]?.id,options:S.accounts.map(a=>[a.id,a.name])},
  {k:"acct",label:"شماره حساب سپرده (اختیاری)",type:"text",value:d.acct||""}],
  o=>{o.rate=+enDigits(String(o.rate)).replace(/[^\d.]/g,"")||0;if(!o.title||!o.amount||!o.rate){toast("عنوان، مبلغ و درصد سود را وارد کن");return false}
    if(d.id)Object.assign(d,o);else S.deposits.push({id:uid(),last:monthKey(o.start),...o});setTimeout(()=>{processDeposits();render()},50)},
  `<div class="card" style="background:var(--t-green);box-shadow:none" id="dep_calc"><span class="muted">سود = مبلغ × درصد ÷ ۱۲ برای هر ماه</span></div>`)}
function debtPay(x){const paid=(x.pays||[]).reduce((s,p)=>s+p.a,0),rest=x.amount-paid;
  sheet(`<h2 style="margin-top:0">${x.dir==="owe"?"پرداخت بخشی از بدهی به":"دریافت بخشی از طلب از"} ${esc(x.person)}</h2>
   <div class="muted">کل ${toman(x.amount)} · ${x.dir==="owe"?"پرداخت‌شده":"دریافت‌شده"} ${toman(paid)} · <b>مانده ${toman(rest)}</b></div>
   <div class="field" style="margin-top:10px"><label for="dp_a">مبلغ این بار (${U()})</label><input type="text" id="dp_a" inputmode="decimal" value="${Math.round(rest*F()).toLocaleString("en")}"></div>
   <div class="field"><label for="dp_acc">${x.dir==="owe"?"از کدام حساب":"به کدام حساب"}</label><select id="dp_acc"><option value="">بدون ثبت در حساب</option>${S.accounts.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></div>
   ${(x.pays||[]).length?`<b style="display:block;margin-top:10px">پرداخت‌های قبلی</b><div class="list">${x.pays.map(p=>`<div class="item"><span class="t">${jfa(p.d)}</span><b>${toman(p.a)}</b></div>`).join("")}</div>`:""}
   <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">ثبت</button><button class="btn ghost" id="no">انصراف</button></div>`,(sh,close)=>{moneyInput(sh.querySelector("#dp_a"));sh.querySelector("#no").onclick=close;
   sh.querySelector("#ok").onclick=()=>{const a=num(sh.querySelector("#dp_a").value)/F();if(!a)return;const acc=sh.querySelector("#dp_acc").value;
     x.pays=x.pays||[];x.pays.push({a,d:jstr(todayJ())});if(x.pays.reduce((s,p)=>s+p.a,0)>=x.amount-1)x.settled=true;
     if(acc)S.tx.unshift({id:uid(),type:x.dir==="owe"?"out":"in",amount:a,cat:x.dir==="owe"?"سایر":"سایر درآمد",acc,date:jstr(todayJ()),note:(x.dir==="owe"?"پرداخت بدهی به ":"دریافت طلب از ")+x.person});
     close();save();render();toast(x.settled?"کامل تسویه شد 🎉":"ثبت شد · مانده "+toman(x.amount-x.pays.reduce((s,p)=>s+p.a,0)))}})}
document.addEventListener("click",e=>{const t=e.target.closest("[data-fx=addLoan],[data-loanedit],[data-fx=addDep],[data-depclose],[data-copyv],[data-dpay]");if(!t)return;ensure();
  if(t.dataset.fx==="addLoan")loanForm();else if(t.dataset.loanedit)loanForm(S.inst.find(x=>x.id===t.dataset.loanedit));else if(t.dataset.fx==="addDep")depositForm2();
  else if(t.dataset.copyv)copy(t.dataset.copyv);else if(t.dataset.dpay)debtPay(S.debts.find(x=>x.id===t.dataset.dpay));
  else if(t.dataset.depclose){const d=S.deposits.find(x=>x.id===t.dataset.depclose);if(!t.dataset.armed){t.dataset.armed=1;t.textContent="مطمئنی؟";return}d.closed=true;save();render();toast("سپرده بسته شد")}},true);

/* ---------- financial safety margin ---------- */
const SAFE=()=>Object.assign({floor:0,pct:10,months:3},S.safety||{});
function emerg(create){let g=(S.save||[]).find(x=>x.emerg);if(!g&&create){g={id:uid(),title:"صندوق اضطراری",target:0,saved:0,emerg:1};S.save.push(g)}return g}
function safeTarget(){const f=forecast(ymAdd(ymNow(),1),true);return Math.round((f.fixed+f.daily)*SAFE().months)}
function safeMonthly(income){const s=SAFE(),g=emerg(false),tg=safeTarget();if(!s.pct||(g&&tg&&g.saved>=tg))return 0;return Math.round(income*s.pct/100)}
function vSafety(){const s=SAFE(),g=emerg(true),tg=safeTarget();if(g.target!==tg){g.target=tg}
  const p=tg?Math.min(1,g.saved/tg):0;const f=forecast(ymAdd(ymNow(),1));const sp=spendable();
  return `<button class="btn small ghost back" data-go="more">→ بازگشت</button>
  <h2><span class="e">🛡️</span>حاشیه امن مالی</h2>
  <div class="wallet"><div class="lab">🛟 صندوق اضطراری (برای مواقع خاص: بیماری، بیکاری، خرابی ماشین…)</div><div class="big">${toman(g.saved)}</div>
   <div class="meter"><i style="width:${p*100}%"></i></div><div class="note">${tg?`هدف: ${toman(tg)} = خرج ${fa(s.months)} ماه زندگی · ${fa(Math.round(p*100))}٪ پر شده ${p>=1?"🎉":""}`:"هدف بعد از ثبت اقساط و خرج‌ها حساب می‌شود."}</div>
   <div class="row" style="margin-top:12px"><button class="btn small" style="background:#fff;color:var(--brand2)" data-dep="${g.id}">+ واریز به صندوق</button><button class="btn small ghost" style="background:rgba(255,255,255,.18);color:#fff" data-wd="${g.id}">برداشت</button></div></div>
  <div class="card stack" style="margin-top:12px">
   <div class="row between"><span>💼 درآمد ماه بعد</span><b class="in">${toman(f.income+f.extraIn)}</b></div>
   <div class="row between"><span>📆 اقساط و پرداخت‌های ثابت</span><b class="out">− ${toman(f.fixed)}</b></div>
   <div class="row between"><span>🛟 کنار گذاشتن برای حاشیه امن (${fa(s.pct)}٪)</span><b class="out">− ${toman(f.safety)}</b></div>
   <div class="row between"><span>🛒 خرج روزمره</span><b class="out">− ${toman(f.daily)}</b></div>
   <div class="row between" style="border-top:1px dashed var(--line);padding-top:8px"><b>✨ آزاد برای خرید و تفریح</b><b class="${f.free<0?"out":"in"}">${toman(f.free)}</b></div></div>
  <div class="card stack" style="margin-top:12px"><b>این ماه</b>
   <div class="row between"><span>موجودی حساب‌ها</span><b>${toman(sp.bal)}</b></div>
   <div class="row between"><span>اقساط و قبض‌های مانده</span><b class="out">− ${toman(sp.fixed)}</b></div>
   <div class="row between"><span>🛡️ کف موجودی (دست نزن)</span><b class="out">− ${toman(s.floor)}</b></div>
   <div class="row between" style="border-top:1px dashed var(--line);padding-top:8px"><b>قابل خرج تا آخر ماه</b><b class="${sp.free<0?"out":"in"}">${toman(sp.free)}</b></div></div>
  <h2><span class="e">⚙️</span>تنظیمات</h2>
  <div class="card stack">
   <div class="field"><label for="sf_floor">🛡️ کف موجودی — این مقدار همیشه در حساب بماند و جزو «قابل خرج» حساب نشود (${U()})</label><input type="text" id="sf_floor" inputmode="decimal" value="${s.floor?Math.round(s.floor*F()).toLocaleString("en"):""}" placeholder="مثلاً ۵,۰۰۰,۰۰۰"></div>
   <div class="field"><label for="sf_pct">🛟 هر ماه چند درصد درآمد به صندوق اضطراری برود؟</label><input type="text" id="sf_pct" inputmode="numeric" value="${s.pct}" placeholder="۱۰"></div>
   <div class="field"><label for="sf_m">🎯 صندوق اضطراری به اندازه خرج چند ماه باشد؟</label><select id="sf_m">${[1,2,3,4,6,9,12].map(m=>`<option value="${m}" ${m===s.months?"selected":""}>${fa(m)} ماه</option>`).join("")}</select></div>
   <button class="btn small" data-act="sfSave" style="align-self:flex-start">ذخیره</button>
   <span class="muted">کارشناسان مالی معمولاً پیشنهاد می‌کنند صندوق اضطراری به اندازه خرج ۳ تا ۶ ماه باشد و ماهی ۱۰ تا ۲۰٪ درآمد کنار گذاشته شود. وقتی صندوق پر شد، دیگر از درآمد کم نمی‌شود.</span></div>`}
document.addEventListener("click",e=>{const t=e.target.closest("[data-act=sfSave]");if(!t)return;
  S.safety={floor:num($("#sf_floor").value)/F()||0,pct:Math.min(50,Math.max(0,+enDigits($("#sf_pct").value)||0)),months:+$("#sf_m").value||3};save();render();toast("حاشیه امن ذخیره شد 🛡️")},true);
document.addEventListener("input",e=>{if(e.target.id==="sf_floor"){const v=num(e.target.value);e.target.value=v?v.toLocaleString("en"):""}});

/* ---------- debt repayment planner ---------- */
let FC_SKIP=null;
function planParts(x){const pays=(x.pays||[]).reduce((s,p)=>s+p.a,0);let acc=0;return (x.plan||[]).map(p=>{const st=acc;acc+=p.a;const left=Math.max(0,Math.min(p.a,acc-pays));return {d:p.d,a:left,full:p.a,done:pays>=acc-1,partial:pays>st&&pays<acc}})}
function freeFor(ym,skipId){FC_SKIP=skipId;try{return forecast(ym).free}finally{FC_SKIP=null}}
function repayOptions(amount,skipId,startK){startK=startK||0;const now=ymNow();const months=[...Array(13)].map((_,k)=>ymAdd(now,startK+k));const free=months.map((ym,k)=>{if(k||startK)return freeFor(ym,skipId);FC_SKIP=skipId;try{return Math.max(0,spendable().free)}finally{FC_SKIP=null}});
  const opts=[1,2,3,4,6].map(n=>{const part=Math.ceil(amount/n/10000)*10000;const sch=[];let budget=free.slice(),i=0;
    for(let p=0;p<n;p++){while(i<months.length&&budget[i]<part)i++;if(i>=months.length)break;sch.push({ym:months[i],a:p===n-1?amount-part*(n-1):part,free:free[i]});budget[i]-=part;i++}
    return {n,part,sch,ok:sch.length===n}});
  let rest=amount,fast=[];for(let i=0;i<months.length&&rest>0;i++){const can=Math.max(0,Math.floor(free[i]*0.8/100000)*100000);if(can<=0)continue;const a=Math.min(rest,can);fast.push({ym:months[i],a});rest-=a}
  return {months,free,opts,fast,fastOk:rest<=0}}
function repaySheet(x,amountIn){const isNew=!x;const rest=x?x.amount-(x.pays||[]).reduce((s,p)=>s+p.a,0):amountIn;
  const draw=(sh,amt)=>{const sk=+sh.querySelector("#rp_st").value||0;const per=num(sh.querySelector("#rp_m").value)/F();const recv=x&&x.dir==="owed";const R=recv?{opts:[1,2,3,4,6,10,12].map(n=>{const part=Math.ceil(amt/n);return {n,part,ok:true,sch:[...Array(n)].map((_,i)=>({ym:ymAdd(ymNow(),sk+i),a:i===n-1?amt-part*(n-1):part}))}})}:repayOptions(amt,x&&x.id,sk);const box=sh.querySelector("#rp_out");
    let fixedHTML="";if(per>0){const n=Math.ceil(amt/per);const sch=[...Array(n)].map((_,i)=>({ym:ymAdd(ymNow(),sk+i),a:i===n-1?amt-per*(n-1):per}));const bad=recv?[]:sch.filter(q=>freeFor(q.ym,x&&x.id)<q.a);
      R.custom={n,sch};fixedHTML=`<div class="card stack" style="box-shadow:none;border:2px solid var(--brand)"><div class="row between"><b>ماهی ${toman(per)} ← ${fa(n)} قسط</b>${bad.length?`<span class="pill bad">${fa(bad.length)} ماه پول کم است</span>`:`<span class="pill ok">ممکن ✓</span>`}</div><div class="muted">از ${ymName(sch[0].ym)} تا ${ymName(sch[n-1].ym)} تمام می‌شود</div>${!isNew?`<button class="btn small" data-rpsave="custom" style="align-self:flex-start">همین برنامه را ثبت کن</button>`:""}</div>`}
    if(recv){box.innerHTML=`${fixedHTML}<b style="display:block;margin:10px 0 6px">چند قسط پس بگیریم؟</b><div class="stack">${R.opts.map(o=>`<div class="card stack" style="box-shadow:none;border:1.5px solid var(--line)"><b>${o.n===1?"یک‌جا":fa(o.n)+" قسط"} · ${toman(o.part)}${o.n>1?" هر قسط":""}</b><div class="muted">از ${ymName(o.sch[0].ym)} تا ${ymName(o.sch[o.n-1].ym)}</div><button class="btn small" data-rpsave="${o.n}" style="align-self:flex-start">همین برنامه را ثبت کن</button></div>`).join("")}</div><p class="muted">هر قسط که رسید «دریافت بخشی» را بزن تا به حسابت واریز شود. قسط‌ها در پیش‌بینی ماه‌ها جزو درآمد حساب می‌شوند.</p>`}else
    box.innerHTML=`${R.fastOk?`<div class="alert" style="background:var(--t-green);box-shadow:none;cursor:default">⚡<span class="grow"><b>زودترین زمان تسویه:</b> ${R.fast.length===1?"یک‌جا در "+ymName(R.fast[0].ym):fa(R.fast.length)+" قسط تا "+ymName(R.fast[R.fast.length-1].ym)}<br><span class="muted">${R.fast.map(f=>MONTHS[f.ym%100-1]+": "+toman(f.a)).join(" · ")}</span></span></div>`:`<div class="alert" style="background:var(--t-pom);box-shadow:none;cursor:default">⚠️<span class="grow">با پول آزاد ۱۲ ماه آینده کامل پس داده نمی‌شود. خرج‌ها را کم کن یا درآمد را در پیش‌بینی درست وارد کن.</span></div>`}
    ${fixedHTML}<b style="display:block;margin:10px 0 6px">چند قسط پس بدهیم؟</b>
    <div class="stack">${R.opts.map(o=>`<div class="card stack" style="box-shadow:none;border:1.5px solid ${o.ok?"var(--line)":"var(--t-pom)"}"><div class="row between"><b>${o.n===1?"یک‌جا":fa(o.n)+" قسط"} · ${toman(o.part)}${o.n>1?" هر قسط":""}</b>${o.ok?`<span class="pill ok">ممکن ✓</span>`:`<span class="pill bad">پول نمی‌رسد</span>`}</div>
      ${o.sch.length?`<div class="muted">${o.sch.map(s=>`${MONTHS[s.ym%100-1]}: ${toman(s.a)} <small>(آزاد ${toman(s.free)})</small>`).join("<br>")}</div>`:""}
      ${o.ok&&!isNew?`<button class="btn small" data-rpsave="${o.n}" style="align-self:flex-start">همین برنامه را ثبت کن</button>`:""}</div>`).join("")}</div>
    <p class="muted">بر اساس «پول آزاد آخر ماه» در پیش‌بینی (درآمد منهای اقساط، ثابت‌ها، حاشیه امن و خرج روزمره). برای این ماه از «قابل خرج تا آخر ماه» حساب شده؛ روز پرداخت ماه‌های بعد ۵ام فرض شده.</p>`;
    sh.querySelectorAll("[data-rpsave]").forEach(b=>b.onclick=()=>{const o=b.dataset.rpsave==="custom"?R.custom:R.opts.find(q=>q.n===+b.dataset.rpsave);const paid=(x.pays||[]).reduce((s,p)=>s+p.a,0);
      const dd=(jparse(x.due)||[])[2]||5;const pd=ym=>ym===ymNow()&&dd<=todayJ()[2]?jstr(todayJ()):jstr([Math.floor(ym/100),ym%100,Math.min(dd,ym%100<=6?31:ym%100<=11?30:29)]);x.plan=[...(paid?[{d:jstr(todayJ()),a:paid}]:[]),...o.sch.map(s=>({d:pd(s.ym),a:s.a}))];x.due=o.sch[0]?pd(o.sch[0].ym):x.due;
      sh.closest(".sheet-bg").remove();save();render();toast(x.dir==="owed"?"برنامه دریافت طلب ثبت شد ✓":"برنامه بازپرداخت ثبت شد ✓")})};
  sheet(`<h2 style="margin-top:0">🧮 ${x?(x.dir==="owe"?"پس دادن قرض به ":"طلب از ")+esc(x.person):"ماشین‌حساب قرض"}</h2>
    <div class="field"><label for="rp_a">مبلغ (${U()})</label><input type="text" id="rp_a" inputmode="decimal" value="${rest?Math.round(rest*F()).toLocaleString("en"):""}" placeholder="مثلاً ۲۰,۰۰۰,۰۰۰"></div>
    <div class="grid2"><div class="field"><label for="rp_st">شروع ${x&&x.dir==="owed"?"پس گرفتن":"پس دادن"} از</label><select id="rp_st">${[...Array(13)].map((_,k)=>`<option value="${k}">${k===0?"همین ماه":ymName(ymAdd(ymNow(),k))}</option>`).join("")}</select></div>
    <div class="field"><label for="rp_m">یا ماهی چقدر ${x&&x.dir==="owed"?"بگیرم":"بدهم"}؟ (اختیاری)</label><input type="text" id="rp_m" inputmode="decimal" placeholder="مثلاً ۲,۰۰۰,۰۰۰"></div></div><div id="rp_out"></div>`,
    sh=>{const a=sh.querySelector("#rp_a");moneyInput(a);const go_=()=>{const v=num(a.value)/F();if(v>0)draw(sh,v);else sh.querySelector("#rp_out").innerHTML=""};a.addEventListener("input",()=>{clearTimeout(a._t);a._t=setTimeout(go_,300)});const m=sh.querySelector("#rp_m");moneyInput(m);m.addEventListener("input",()=>{clearTimeout(m._t);m._t=setTimeout(go_,300)});const st=sh.querySelector("#rp_st");if(x&&x.due){const a=monthKey(x.due),b=ymNow();const k=(Math.floor(a/100)-Math.floor(b/100))*12+a%100-b%100;if(k>0&&k<=12)st.value=String(k)}st.addEventListener("change",go_);go_()})}
document.addEventListener("click",e=>{const t=e.target.closest("[data-rplan],[data-fx=repayCalc]");if(!t)return;ensure();if(t.dataset.rplan)repaySheet(S.debts.find(x=>x.id===t.dataset.rplan));else repaySheet(null,0)},true);

/* ---------- price book ---------- */
const pkey=n=>norm(n).replace(/[0-9۰-۹]/g,"");
function priceHist(name){const k=pkey(name);return (S.prices||[]).filter(p=>pkey(p.name)===k).sort((a,b)=>(jToDate(b.d)||0)-(jToDate(a.d)||0))}
function lastPrice(name){return priceHist(name)[0]}
function addPrice(name,price,qty,store){if(!name||!price)return;ensure();S.prices.unshift({id:uid(),name,price,qty:qty||"",store:store||"",d:jstr(todayJ())})}
function priceSheet(x){const lp=lastPrice(x.name);
  sheet(`<h2 style="margin-top:0">✅ ${esc(x.name)} خریده شد</h2>${lp?`<p class="muted" style="margin-top:0">دفعه قبل: ${toman(lp.price)}${lp.qty?" برای "+esc(lp.qty):""} · ${jfa(lp.d)}</p>`:""}
   <div class="field"><label for="pr_p">قیمت (${U()}) — اختیاری</label><input type="text" id="pr_p" inputmode="decimal" placeholder="چقدر خریدی؟"></div>
   <div class="grid2"><div class="field"><label for="pr_q">مقدار</label><input type="text" id="pr_q" value="${esc(x.qty||"")}"></div><div class="field"><label for="pr_s">فروشگاه</label><input type="text" id="pr_s" value="${esc((S.prices||[])[0]?.store||"")}"></div></div>
   <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">ثبت</button><button class="btn ghost" id="no">بدون قیمت</button></div>`,
  (sh,close)=>{const p=sh.querySelector("#pr_p");moneyInput(p);setTimeout(()=>p.focus(),80);sh.querySelector("#no").onclick=close;
    sh.querySelector("#ok").onclick=()=>{const v=num(p.value)/F();if(v){addPrice(x.name,v,sh.querySelector("#pr_q").value.trim(),sh.querySelector("#pr_s").value.trim());x.price=v;
      const lp2=lp&&lp.price;toast(lp2?(v>lp2?`📈 ${fa(Math.round((v/lp2-1)*100))}٪ گران‌تر از دفعه قبل`:v<lp2?`📉 ${fa(Math.round((1-v/lp2)*100))}٪ ارزان‌تر از دفعه قبل`:"همان قیمت دفعه قبل"):"قیمت ثبت شد ✓");save();render()}close()}})}
let prQ="";
function vPrices(){ensure();const groups={};(S.prices||[]).forEach(p=>{const k=pkey(p.name);(groups[k]=groups[k]||[]).push(p)});
  const q=norm(prQ);const L=Object.values(groups).map(g=>g.sort((a,b)=>(jToDate(b.d)||0)-(jToDate(a.d)||0))).filter(g=>!q||norm(g[0].name).includes(q)).sort((a,b)=>(jToDate(b[0].d)||0)-(jToDate(a[0].d)||0));
  return `<button class="btn small ghost back" data-go="shop">→ بازگشت</button><div class="row between"><h2><span class="e">🏷️</span>قیمت اجناس</h2><button class="btn small" data-fx="addPrice">+ قیمت</button></div>
  <p class="muted" style="margin-top:0">هر بار چیزی از لیست خرید تیک بزنی، قیمتش را می‌پرسد. اینجا آخرین قیمت و گران یا ارزان شدنش را می‌بینی.</p>
  <input type="text" id="prq" placeholder="🔍 جستجو: مثلاً برنج" value="${esc(prQ)}" autocomplete="off" style="margin-bottom:10px">
  <div class="stack">${L.length?L.map(g=>{const a=g[0],b=g[1];const ch=b?(a.price/b.price-1)*100:0;
    return `<div class="card stack">${""}<div class="row">${bub(foodE(a.name),a.name)}<div class="grow"><b>${esc(a.name)}</b>${a.qty?` <span class="muted">${esc(a.qty)}</span>`:""}<br><span class="muted">${jfa(a.d)}${a.store?" · "+esc(a.store):""}</span></div><div style="text-align:left"><b>${toman(a.price)}</b><br>${b?`<span class="pill ${ch>0?"bad":ch<0?"ok":""}">${ch>0?"📈 ":ch<0?"📉 ":""}${fa(Math.abs(Math.round(ch)))}٪</span>`:""}</div></div>
    ${g.length>1?`<details><summary class="muted" style="cursor:pointer">تاریخچه ${fa(g.length)} خرید</summary><div class="list">${g.map(p=>`<div class="item"><span class="t">${jfa(p.d)}${p.store?" · "+esc(p.store):""}${p.qty?" · "+esc(p.qty):""}</span><b>${toman(p.price)}</b><button class="icon" data-del="prices:${p.id}">حذف</button></div>`).join("")}</div></details>`:`<div class="row"><button class="icon" data-del="prices:${a.id}">حذف</button></div>`}</div>`}).join(""):`<div class="card">${empty("🏷️","هنوز قیمتی ثبت نشده. در لیست خرید وقتی چیزی را تیک می‌زنی، قیمتش را بنویس.")}</div>`}</div>`}
document.addEventListener("click",e=>{const t=e.target.closest("[data-fx=addPrice]");if(!t)return;
  form("🏷️ ثبت قیمت",[{k:"name",label:"جنس",type:"text"},{k:"price",label:"قیمت ("+U()+")",type:"money"},{k:"qty",label:"مقدار",type:"text",ph:"مثلاً ۱ کیلو"},{k:"store",label:"فروشگاه",type:"text"}],o=>{if(!o.name||!o.price)return false;addPrice(o.name,o.price,o.qty,o.store)})},true);
document.addEventListener("input",e=>{if(e.target.id!=="prq")return;prQ=e.target.value;clearTimeout(window._prq);window._prq=setTimeout(()=>{render();const i=$("#prq");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},300)});
/* ---------- reconcile account balance ---------- */
function reconcile(a){sheet(`<h2 style="margin-top:0">⚖️ تطبیق موجودی «${esc(a.name)}»</h2>
  <p class="muted" style="margin-top:0">موجودی اپ: <b>${toman(balance(a))}</b>. موجودی واقعی را از همراه‌بانک ببین و اینجا بنویس تا اپ درست شود. تراکنش‌ها دست نمی‌خورند.</p>
  <div class="field"><label for="rc_v">موجودی واقعی الان (${U()})</label><input type="text" id="rc_v" inputmode="decimal"></div>
  <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">درست کن</button><button class="btn ghost" id="no">انصراف</button></div>`,
  (sh,close)=>{const v=sh.querySelector("#rc_v");moneyInput(v);setTimeout(()=>v.focus(),80);sh.querySelector("#no").onclick=close;
   sh.querySelector("#ok").onclick=()=>{const real=num(v.value)/F();if(!v.value.trim())return;const diff=real-balance(a);a.init=(a.init||0)+diff;close();save();render();toast(diff?`موجودی درست شد (${diff>0?"+":"−"}${toman(Math.abs(diff))})`:"موجودی درست بود ✓")}})}
document.addEventListener("click",e=>{const t=e.target.closest("[data-recon]");if(!t)return;reconcile(S.accounts.find(a=>a.id===t.dataset.recon))},true);

function render(){
  $("#unitBtn").textContent=U();const hh=new Date().getHours();$("#sunny").textContent=hh<5||hh>=20?"🌙":hh<11?"🌤️":hh<16?"☀️":"🌇";
  $("#hello").innerHTML=`<em>${esc(S.name||"سلام")}</em>، ${greeting()}`;
  const tj=todayJ();$("#today").textContent=`${WDAYS[weekIdx()]} ${fa(tj[2])} ${MONTHS[tj[1]-1]} ${String(tj[0]).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d])}`;
  const V={home:vHome,money:vMoney,shop:vShop,kitchen:vKitchen,more:vMore,inst:vInst,todo:vTodo,save:vSave,report:vReport,accounts:vAccounts,settings:vSettings,cards:vCards,budgets:vBudgets,bills:vBills,cheques:vCheques,debts:vDebts,events:vEvents,forecast:vForecast,loans:vLoans,deposits:vDeposits,safety:vSafety,prices:vPrices};ensure();if(UNLOCKED){if(!window._pb){window._pb=1;processBills();processSalary();processDeposits()}budgetCheck()}
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
  if(d.edit){const[c,id]=d.edit.split(":");const x=find(c,id);({deposits:depositForm2,inst:x=>x&&x.loan?loanForm(x):instForm(x),events:eventForm,tx:txForm,shop:shopForm,fridge:fridgeForm,todo:todoForm,save:saveForm,accounts:accForm,budgets:budgetForm,bills:billForm,cheques:chequeForm,debts:debtForm})[c](x);return}
  if(d.shopt){const x=find("shop",d.shopt);x.done=!x.done;save();render();if(x.done){priceSheet(x);if(S.shop.every(i=>i.done))party()}return}
  if(d.todot){const x=find("todo",d.todot);x.done=!x.done;save();render();return}
  if(d.finish){const x=find("fridge",d.finish);S.fridge=S.fridge.filter(f=>f!==x);S.shop.unshift({id:uid(),name:x.name,qty:"",done:false});save();render();toast(`${x.name} به لیست خرید رفت`);return}
  if(d.miss){const r=scoreRecipes().find(r=>r.n===d.miss);let k=0;r.miss.forEach(m=>{if(!S.shop.some(s=>norm(s.name)===norm(m))){S.shop.unshift({id:uid(),name:m,qty:"",done:false});k++}});save();render();toast(`${fa(k)} قلم به لیست خرید اضافه شد`);return}
  if(d.planPick){pickDay(d.planPick);return}
  if(d.slot){pickMeal(...d.slot.split(":"));return}
  if(d.pay){const it=find("inst",d.pay);const n=instNext(it);if(n<0)return;
    accPick(`پرداخت قسط ${fa(n+1)} «${it.title}» — ${toman(instAmt(it,n))}`,acc=>{it.paid.push(n);if(acc){it.acc=acc;S.tx.unshift({id:uid(),type:"out",amount:instAmt(it,n),cat:"اقساط",acc,date:jstr(todayJ()),note:`${it.title} — قسط ${n+1}`})}
      save();render();if(instNext(it)<0){party();toast("تبریک! این قسط تسویه شد 🎉")}else toast(acc?"قسط پرداخت شد و از "+accById(acc).name+" کم شد ✓":"قسط پرداخت‌شده علامت خورد")},accById(it.acc)?it.acc:S.accounts[0]?.id);return}
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
  else if(a==="salary")salaryForm();
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
  else if(a==="shopExpense"){txForm({},{type:"out",cat:"سوپرمارکت",amount:S.shop.filter(x=>x.done).reduce((a,x)=>a+(x.price||0),0)||"",note:S.shop.filter(x=>x.done).map(x=>x.name).join("، ").slice(0,120)})}
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
