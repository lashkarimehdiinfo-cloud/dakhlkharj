
/* ---------- family sync (Supabase) ---------- */
const SB_URL_DEFAULT="https://jzzjgvqewgtxulgowmiv.supabase.co",SB_KEY_DEFAULT="sb_publishable_p8V9yDoxk9r5GWb5L13zkg_duTfsSbt";
const SYNC_ARR=["accounts","tx","inst","shop","todo","fridge","save","budgets","bills","cheques","debts","recipes","events"];
const SKEY="home-budget-sync";
let SY={};try{SY=JSON.parse(localStorage.getItem(SKEY)||"{}")}catch(e){}
if(SY.url===undefined)SY.url=SB_URL_DEFAULT;
if(SY.key===undefined)SY.key=SB_KEY_DEFAULT;
const sySave=()=>{try{localStorage.setItem(SKEY,JSON.stringify(SY))}catch(e){}};
let syStatus="",syBusy=false,syDirty=false,syPushT=null,syLast=0,syRender=false;
const strip=o=>{const {_u,ub,ubn,...r}=o;return JSON.stringify(r)};
const stable=v=>Array.isArray(v)?"["+v.map(stable).join(",")+"]":v&&typeof v==="object"?"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}":JSON.stringify(v);
let PREV=null;
function snap(){PREV={};SYNC_ARR.forEach(k=>(S[k]||[]).forEach(it=>PREV[it.id]=strip(it)));PREV.__plan=JSON.stringify(S.plan||{});PREV.__unit=S.unit||"toman"}
function stamp(){
  if(!PREV){snap();return}
  S._m=S._m||{tomb:{}};const now=Date.now(),seen={};
  SYNC_ARR.forEach(k=>(S[k]||[]).forEach(it=>{seen[it.id]=1;const j=strip(it);if(PREV[it.id]!==j){it._u=now;it.ub=SY.email||"";it.ubn=S.name||"";PREV[it.id]=strip(it)}}));
  Object.keys(PREV).forEach(id=>{if(!id.startsWith("__")&&!seen[id])S._m.tomb[id]=now});
  if(JSON.stringify(S.plan||{})!==PREV.__plan)S._m.planU=now;
  if((S.unit||"toman")!==PREV.__unit)S._m.unitU=now;
  snap();
}
function shared(st){const o={_m:st._m||{tomb:{}},plan:st.plan||{},unit:st.unit||"toman",loc:st.loc||{}};SYNC_ARR.forEach(k=>o[k]=st[k]||[]);return o}
function merge(L,R){
  const lm=L._m||{tomb:{}},rm=R._m||{tomb:{}};const tomb={...lm.tomb};
  Object.entries(rm.tomb||{}).forEach(([id,t])=>{if(!(tomb[id]>=t))tomb[id]=t});
  const cut=Date.now()-60*864e5;Object.keys(tomb).forEach(id=>{if(tomb[id]<cut)delete tomb[id]});
  const out={};
  SYNC_ARR.forEach(k=>{const lm2=new Map((L[k]||[]).map(x=>[x.id,x])),rmap=new Map((R[k]||[]).map(x=>[x.id,x]));const res=[];
    (R[k]||[]).forEach(r=>{if(!lm2.has(r.id)&&!(tomb[r.id]>=(r._u||0)))res.push(r)});
    (L[k]||[]).forEach(l=>{const r=rmap.get(l.id);const w=r&&(r._u||0)>(l._u||0)?r:l;if(!(tomb[w.id]>=(w._u||0)))res.push(w)});
    out[k]=res});
  const lp=lm.planU||0,rp=rm.planU||0,lu=lm.unitU||0,ru=rm.unitU||0;
  out.plan=rp>lp?R.plan||{}:L.plan||{};out.unit=ru>lu?R.unit:L.unit;
  out.loc={...(L.loc||{})};Object.entries(R.loc||{}).forEach(([k,v])=>{if(!out.loc[k]||(v.t||0)>(out.loc[k].t||0))out.loc[k]=v});
  out._m={tomb,planU:Math.max(lp,rp),unitU:Math.max(lu,ru)};return out;
}
async function sb(path,body,method,extra){
  const h={apikey:SY.key,"Content-Type":"application/json",...(extra||{})};if(SY.access&&!path.startsWith("/auth"))h.Authorization="Bearer "+SY.access;
  const r=await fetch(SY.url.replace(/\/$/,"")+path,{method:method||(body?"POST":"GET"),headers:h,body:body?JSON.stringify(body):undefined});
  const t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){}
  if(!r.ok){const e=new Error((j&&(j.msg||j.message||j.error_description||j.error))||("HTTP "+r.status));e.status=r.status;throw e}
  return j;
}
async function auth(){if(SY.access&&SY.exp>Date.now()+60000)return;if(!SY.refresh)throw new Error("login");
  const j=await sb("/auth/v1/token?grant_type=refresh_token",{refresh_token:SY.refresh});setSess(j)}
function setSess(j){SY.access=j.access_token;SY.refresh=j.refresh_token;SY.exp=Date.now()+(j.expires_in||3600)*1000;if(j.user)SY.email=j.user.email;sySave()}
function applyShared(o){const keep={auth:S.auth,name:S.name};SYNC_ARR.forEach(k=>S[k]=o[k]);S.plan=o.plan;S.unit=o.unit||S.unit;S.loc=o.loc||{};S._m=o._m;S.auth=keep.auth;S.name=keep.name;delete S.example;
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}snap()}
function safeRender(){const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&a.closest("#view")||document.querySelector(".sheet-bg")||!UNLOCKED){syRender=true;return}render()}
async function pull(){
  if(!SY.home||syBusy)return;syBusy=true;
  try{await auth();const a=await sb(`/rest/v1/homes?id=eq.${SY.home}&select=state,rev`);
    if(a&&a[0]&&a[0].rev!==SY.rev){familyNews(a[0].state||{});const m=merge(shared(S),a[0].state||{});applyShared(m);SY.rev=a[0].rev;sySave();safeRender();if(stable(shared(S))!==stable(a[0].state||{}))syDirty=true}
    syLast=Date.now();syStatus="ok";
  }catch(e){syStatus=e.message==="login"?"login":"off"}finally{syBusy=false}
  if(syDirty)push();
}
async function push(){
  if(!SY.home)return;if(syBusy){syDirty=true;return}syBusy=true;syDirty=false;
  try{await auth();
    for(let i=0;i<3;i++){const r=await sb("/rest/v1/rpc/push_state",{p_home:SY.home,p_state:shared(S),p_rev:SY.rev||0});
      if(r!==null&&r!==undefined){SY.rev=r;sySave();break}
      const a=await sb(`/rest/v1/homes?id=eq.${SY.home}&select=state,rev`);if(a&&a[0]){applyShared(merge(shared(S),a[0].state||{}));SY.rev=a[0].rev;safeRender()}}
    syLast=Date.now();syStatus="ok";
  }catch(e){syDirty=true;syStatus=e.message==="login"?"login":"off"}finally{syBusy=false}
}
snap();
{const _sv=save;save=function(){stamp();_sv();if(SY.home){clearTimeout(syPushT);syPushT=setTimeout(push,700)}}}
setInterval(()=>{if(document.visibilityState==="visible"&&SY.home)pull();if(syRender&&!document.querySelector(".sheet-bg")){const a=document.activeElement;if(!(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))&&UNLOCKED){syRender=false;render()}}},5000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")pull()});
setTimeout(pull,1500);

const syAgo=()=>{if(!syLast)return "هنوز همگام نشده";const s=Math.round((Date.now()-syLast)/1000);return s<60?"همین الان":fa(Math.round(s/60))+" دقیقه پیش"};
function syncCard(){
  const st=syStatus==="off"?`<span class="pill bad">قطع — اینترنت یا فیلترشکن را چک کن</span>`:syStatus==="login"?`<span class="pill warn">دوباره وارد شو</span>`:`<span class="pill ok">وصل · ${syAgo()}</span>`;
  let body;
  if(!SY.url||!SY.key)body=`<div class="field"><label for="sy_url">آدرس سرور (Project URL)</label><input type="text" id="sy_url" dir="ltr" placeholder="https://xxxx.supabase.co"></div>
    <div class="field"><label for="sy_key">کلید (anon key)</label><input type="text" id="sy_key" dir="ltr" placeholder="eyJ..."></div><button class="btn small" data-sync="cfg" style="align-self:flex-start">ذخیره</button>`;
  else if(!SY.access)body=`<span class="muted">هر نفر با ایمیل خودش وارد می‌شود، بعد هر دو به یک «خانواده» وصل می‌شوید.</span>
    <div class="field"><label for="sy_em">ایمیل</label><input type="text" id="sy_em" dir="ltr" inputmode="email" autocomplete="off"></div>
    <div class="field"><label for="sy_pw">رمز (حداقل ۶ حرف)</label><div class="pw"><input type="password" id="sy_pw" dir="ltr" autocomplete="off">${eye}</div></div>
    <p class="err" id="sy_err"></p><div class="row"><button class="btn small grow" data-sync="login">ورود</button><button class="btn small ghost grow" data-sync="signup">ثبت‌نام</button></div><button class="icon" data-sync="reset" style="align-self:flex-start">تغییر سرور</button>`;
  else if(!SY.home)body=`<span class="muted">وارد شدی: ${esc(SY.email||"")}</span>
    <button class="btn" data-sync="create">🏡 ساخت خانواده جدید (برای نفر اول)</button>
    <div class="field"><label for="sy_code">یا کد خانواده‌ای که همسرت ساخته را بزن</label><input type="text" id="sy_code" dir="ltr" autocomplete="off" style="text-transform:uppercase;letter-spacing:3px"></div>
    <p class="err" id="sy_err"></p><button class="btn small ghost" data-sync="join" style="align-self:flex-start">پیوستن</button>`;
  else body=`<div class="row between"><span>کد خانواده:</span><b dir="ltr" style="font-size:22px;letter-spacing:4px">${esc(SY.code||"")}</b></div>
    <span class="muted">این کد را به همسرت بده تا در گوشی‌اش «پیوستن» بزند. لیست خرید، دخل و خرج، اقساط، یخچال و برنامه غذا بین شما مشترک می‌شود. کیف کارت‌ها و رمز ورود برای هر نفر جداست.</span>
    <div class="row">${st}</div><div class="row"><button class="btn small" data-sync="now">همگام‌سازی الان</button><button class="btn small ghost" data-sync="copy">کپی کد</button><button class="btn small ghost" data-sync="leave">خروج از خانواده</button></div>`;
  return `<div class="card stack" style="background:var(--t-sky)"><b>👨‍👩‍👧 همگام‌سازی با خانواده</b>${body}</div>`;
}
{const _vs=vSettings;vSettings=function(){return _vs().replace('<h2>تنظیمات</h2><div class="stack">','<h2>تنظیمات</h2><div class="stack">'+syncCard())}}
{const _vh=vHome;vHome=function(){const h=_vh();if(SY.home)return h;return `<button class="banner row between" data-go="settings" style="width:100%;border:0;font:inherit;color:inherit;text-align:right;margin-bottom:12px;background:var(--t-sky)"><span>👨‍👩‍👧 گوشی همسرت را وصل کن تا همه‌چیز مشترک شود</span><b>اتصال ‹</b></button>`+h}}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-sync]");if(!b)return;const a=b.dataset.sync;const er=m=>{const x=$("#sy_err");if(x)x.textContent=m};
  try{
    if(a==="cfg"){SY.url=$("#sy_url").value.trim();SY.key=$("#sy_key").value.trim();if(!/^https:\/\//.test(SY.url)||SY.key.length<20)return toast("آدرس یا کلید درست نیست");sySave();render()}
    else if(a==="login"||a==="signup"){const em=$("#sy_em").value.trim(),pw=$("#sy_pw").value;if(!em||pw.length<6)return er("ایمیل و رمز (حداقل ۶ حرف) را وارد کن");b.disabled=true;er("⏳ …");
      const j=a==="login"?await sb("/auth/v1/token?grant_type=password",{email:em,password:pw}):await sb("/auth/v1/signup",{email:em,password:pw});
      if(!j||!j.access_token){b.disabled=false;return er("ثبت‌نام شد ولی تأیید ایمیل روشن است. در Supabase گزینه Confirm email را خاموش کن.")}
      setSess(j);SY.email=em;sySave();render();toast("وارد شدی ✓")}
    else if(a==="create"){b.disabled=true;await auth();const j=await sb("/rest/v1/rpc/create_home",{});SY.home=j.id;SY.code=j.code;SY.rev=0;sySave();
      if(S.example){const n=S.name,au=S.auth,un=S.unit;S=blank();S.name=n;S.auth=au;S.unit=un}
      PREV=null;SYNC_ARR.forEach(k=>(S[k]||[]).forEach(it=>it._u=it._u||Date.now()));snap();await push();render();party();toast("خانواده ساخته شد 🎉")}
    else if(a==="join"){const c=$("#sy_code").value.trim().toUpperCase();if(!c)return er("کد را وارد کن");b.disabled=true;await auth();
      const j=await sb("/rest/v1/rpc/join_home",{p_code:c});SY.home=j.id;SY.code=j.code;SY.rev=-1;sySave();
      if(S.example){SYNC_ARR.forEach(k=>S[k]=[]);S.plan={};S._m={tomb:{}};delete S.example;snap()}
      await pull();render();party();toast("به خانواده وصل شدی 🎉")}
    else if(a==="now"){await push();await pull();render();toast(syStatus==="ok"?"همگام شد ✓":"وصل نشد؛ اینترنت را چک کن")}
    else if(a==="copy")copy(SY.code);
    else if(a==="reset"){SY={url:"",key:""};sySave();render()}
    else if(a==="leave"){if(!b.dataset.armed){b.dataset.armed=1;b.textContent="مطمئنی؟";return}SY.home=null;SY.code=null;SY.rev=0;sySave();render()}
  }catch(err){b.disabled=false;const m=String(err.message||err);
    er(/Invalid login|invalid_credentials/i.test(m)?"ایمیل یا رمز اشتباه است":/already registered|already exists/i.test(m)?"این ایمیل قبلاً ثبت شده؛ «ورود» را بزن":/not_found/.test(m)?"کد خانواده پیدا نشد":/api key|apikey/i.test(m)?"کلید سرور اشتباه است؛ «تغییر سرور» را بزن و کلید را دوباره بچسبان":/fetch|network|Failed/i.test(m)?"به سرور وصل نشد؛ فیلترشکن را روشن کن":m);
    if(!$("#sy_err"))toast("خطا: "+m)}
});

/* ---------- family location ---------- */
let LOCON=false;try{LOCON=localStorage.getItem("home-locshare")==="1"}catch(e){}
let locErr="";
function km(a,b){const R=6371,t=x=>x*Math.PI/180;const dLa=t(b.lat-a.lat),dLo=t(b.lng-a.lng);const h=Math.sin(dLa/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function locTick(){
  if(!LOCON||!SY.home||!SY.email||document.visibilityState!=="visible"||!navigator.geolocation)return;
  navigator.geolocation.getCurrentPosition(p=>{locErr="";S.loc=S.loc||{};S.loc[SY.email]={n:S.name||SY.email,lat:+p.coords.latitude.toFixed(5),lng:+p.coords.longitude.toFixed(5),acc:Math.round(p.coords.accuracy||0),t:Date.now()};
      try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}push();if(route==="family")safeRender()},
    e=>{locErr=e.code===1?"اجازه موقعیت داده نشده؛ از تنظیمات گوشی ← برنامه‌ها ← دخل و خرج خانه ← مجوزها ← مکان را روشن کن":"موقعیت پیدا نشد؛ GPS گوشی را روشن کن";if(route==="family")safeRender()},
    {enableHighAccuracy:true,timeout:20000,maximumAge:30000});
}
setInterval(locTick,60000);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")locTick()});setTimeout(locTick,3000);
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?"همین الان":m<60?fa(m)+" دقیقه پیش":m<1440?fa(Math.round(m/60))+" ساعت پیش":fa(Math.round(m/1440))+" روز پیش"};
function vFamily(){
  const back=`<button class="btn small ghost back" data-go="more">→ بازگشت</button>`;
  if(!SY.home)return back+`<h2><span class="e">📍</span>موقعیت خانواده</h2><div class="card">${empty("👨‍👩‍👧","اول از تنظیمات، گوشی‌ها را به یک خانواده وصل کن.")}<button class="btn" data-go="settings" style="width:100%">رفتن به تنظیمات</button></div>`;
  const L=Object.entries(S.loc||{}).sort((a,b)=>(b[1].t||0)-(a[1].t||0));const me=(S.loc||{})[SY.email];
  return back+`<h2><span class="e">📍</span>موقعیت خانواده</h2>
  <div class="card stack" style="background:${LOCON?"var(--t-green)":"var(--surface)"}"><div class="row between"><b>${LOCON?"🟢 موقعیت تو در حال اشتراک است":"⚪ موقعیت تو اشتراک گذاشته نمی‌شود"}</b></div>
   <span class="muted">وقتی روشن است، هر یک دقیقه که اپ باز است موقعیتت برای خانواده فرستاده می‌شود. وقتی اپ بسته است چیزی فرستاده نمی‌شود.</span>
   ${locErr?`<p class="err">${esc(locErr)}</p>`:""}
   <button class="btn ${LOCON?"ghost":""}" data-act="locToggle">${LOCON?"خاموش کردن اشتراک موقعیت":"روشن کردن اشتراک موقعیت من"}</button></div>
  <div class="stack" style="margin-top:12px">${L.length?L.map(([k,v])=>{const isMe=k===SY.email;const d=me&&!isMe?km(me,v):null;
    return `<div class="card stack"><div class="row">${bub(isMe?"🙋":"💚",k)}<div class="grow"><b>${esc(v.n||k)}${isMe?" (تو)":""}</b><br><span class="muted">آخرین موقعیت: ${ago(v.t)}${v.acc?" · دقت حدود "+fa(v.acc)+" متر":""}${d!==null?" · فاصله با تو: "+(d<1?fa(Math.round(d*1000))+" متر":fa(+d.toFixed(1))+" کیلومتر"):""}</span></div></div>
    <div class="row"><a class="btn small grow" style="text-align:center;text-decoration:none" href="https://neshan.org/maps/@${v.lat},${v.lng},16z">🗺️ نشان</a><a class="btn small ghost grow" style="text-align:center;text-decoration:none" href="https://www.google.com/maps?q=${v.lat},${v.lng}">گوگل مپ</a><button class="btn small ghost" data-copyloc="${v.lat},${v.lng}">کپی</button></div></div>`}).join("")
   :`<div class="card">${empty("📍","هنوز کسی موقعیتش را به اشتراک نگذاشته.")}</div>`}</div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-act=locToggle],[data-copyloc]");if(!b)return;
  if(b.dataset.copyloc){copy(b.dataset.copyloc);return}
  LOCON=!LOCON;try{localStorage.setItem("home-locshare",LOCON?"1":"0")}catch(e){}
  if(!LOCON&&S.loc&&S.loc[SY.email]){delete S.loc[SY.email];S._m=S._m||{tomb:{}};push()}
  render();if(LOCON){toast("اشتراک موقعیت روشن شد");locTick()}else toast("اشتراک موقعیت خاموش شد")},true);
{const _vm=vMore;vMore=function(){return _vm().replace('<div class="tiles">','<div class="tiles"><button class="tile c4" data-go="family"><span class="ti">📍</span><b>موقعیت خانواده</b><span>'+(LOCON?"اشتراک روشن":"اشتراک خاموش")+'</span></button>')}}
{const _r=render;render=function(){if(route==="family"&&UNLOCKED){const h=vFamily();if(h!==LASTH){$("#view").innerHTML=h;LASTH=h}renderTabs();$("#unitBtn").textContent=U();return}_r()}}

/* ---------- family notifications ---------- */
let NSINCE=0;try{NSINCE=+(localStorage.getItem("home-nsince")||0)}catch(e){}
const NLAB={shop:"🛒 لیست خرید",todo:"✅ کار",tx:"💸 خرج"};
function familyNews(rem){
  if(!SY.email)return;let mx=NSINCE;const msgs=[];
  ["shop","todo","tx"].forEach(k=>(rem[k]||[]).forEach(it=>{const u=it._u||0;if(u>mx)mx=u;
    if(u>NSINCE&&it.ub&&it.ub!==SY.email&&!(k==="shop"&&it.done)){const n=k==="shop"?it.name+(it.qty?" "+it.qty:""):k==="todo"?it.text:(it.note||it.cat)+" — "+toman(it.amount);msgs.push(`${NLAB[k]} از ${it.ubn||"خانواده"}: ${n}`)}}));
  if(NSINCE&&msgs.length){toast(msgs[0]+(msgs.length>1?" (+"+fa(msgs.length-1)+")":""));
    try{const LN=window.Capacitor&&Capacitor.Plugins.LocalNotifications;if(LN&&document.visibilityState!=="visible")LN.schedule({notifications:msgs.slice(0,5).map((m,i)=>({id:900000+(Date.now()%9000)+i,title:"دخل و خرج خانه",body:m}))})}catch(e){}}
  NSINCE=Math.max(mx,NSINCE||Date.now());try{localStorage.setItem("home-nsince",String(NSINCE))}catch(e){}
  bgCfg();
}
function bgCfg(){try{const BR=window.Capacitor&&Capacitor.Plugins.BackgroundRunner;if(!BR||!SY.home||!SY.code)return;
  BR.dispatchEvent({label:"ir.dakhlkharj.check",event:"cfg",details:{url:SY.url,key:SY.key,home:SY.home,code:SY.code,me:SY.email||"",since:NSINCE}}).catch(()=>{})}catch(e){}}
setTimeout(bgCfg,4000);
/* ---------- on-device OCR (Persian) ---------- */
let OCRW=null;
if(window.Tesseract){window.ocrText=async file=>{
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(file)});
  const sc=Math.min(1,1800/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
  const g=c.getContext("2d");g.filter="grayscale(1) contrast(1.4)";g.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);
  if(!OCRW){const base=new URL("ocr/",location.href).href;OCRW=await Tesseract.createWorker(["fas","eng"],1,{workerPath:base+"worker.min.js",corePath:base,langPath:base,gzip:true,workerBlobURL:false})}
  const {data}=await OCRW.recognize(c);return data.text||"";
}}
/* ---------- native: bank SMS, fingerprint, widget ---------- */
const NAT=()=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.HomeNative;
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};
/* bank SMS */
function parseBankSms(body){
  const t=enDigits(body).replace(/ي/g,"ی").replace(/ك/g,"ک");
  if(/رمز|کد|پویا|otp|password|تایید|فعال‌سازی/i.test(t))return null;
  if(!/برداشت|واریز|خرید|انتقال|مبلغ|سود|پرداخت|[+-]\s*\d[\d,٬]{3,}/.test(t))return null;
  const amtM=t.match(/(?:مبلغ|برداشت|واریز|خرید|انتقال)\s*[:：]?\s*([+-]?\s*\d[\d,٬]{2,})/)||t.match(/([+-]\s*\d[\d,٬]{3,})/)||t.match(/(\d[\d,٬]{3,})\s*ریال/);
  if(!amtM)return null;const raw=amtM[1].replace(/\s/g,"");let amt=+raw.replace(/[^\d]/g,"");if(!amt)return null;
  let type=null;if(/^-/.test(raw)||/برداشت|خرید|انتقال\s*از|پرداخت\s*قبض|کسر/.test(t))type="out";if(/^\+/.test(raw)||/واریز|انتقال\s*به\s*حساب\s*شما|سود|بستانکار/.test(t))type=type&&!/^\+/.test(raw)?type:"in";
  if(!type)return null;
  const toman_=/تومان/.test(t)?amt:amt/10;
  const toks=(t.replace(/(مانده|مبلغ|برداشت|واریز)\s*[:：]?\s*[+-]?[\d,٬]+/g," ").match(/[\d*xX.]{2,}\d{4}(?!\d)/g)||[]).filter(x=>!/^\d{4}$/.test(x)&&+x.replace(/\D/g,"")!==amt);const last4=toks.length?toks[0].slice(-4):"";
  const bal=t.match(/مانده\s*[:：]?\s*([\d,٬]+)/);
  return {type,amount:toman_,last4,bal:bal?+bal[1].replace(/\D/g,""):null}}
function smsAccount(last4){if(last4){const a=S.accounts.find(x=>x.last4&&String(x.last4).slice(-4)===last4);if(a)return a.id}const c=S.accounts.find(x=>x.type!=="cash");return (c||S.accounts[0]||{}).id}
let smsBusy=false;
async function smsSync(review){
  const N=NAT();if(!N||lsGet("home-sms")!=="1"||smsBusy)return;smsBusy=true;
  try{const since=+(lsGet("home-sms-since")||0)||Date.now()-3*864e5;
    const r=await N.readSms({since:String(since)});let mx=since;const found=[];const seen=new Set(JSON.parse(lsGet("home-sms-seen")||"[]"));
    (r.messages||[]).forEach(m=>{if(m.date>mx)mx=m.date;const key=m.date+":"+(m.body||"").length;if(seen.has(key))return;const p=parseBankSms(m.body||"");if(p)found.push({...p,date:m.date,key,from:m.address||"",body:m.body})});
    lsSet("home-sms-since",String(mx));
    const addOne=f=>{const d=new Date(f.date);S.tx.unshift({id:uid(),type:f.type,amount:f.amount,cat:f.type==="in"?"سایر درآمد":"سایر",acc:smsAccount(f.last4),date:jstr(g2j(d.getFullYear(),d.getMonth()+1,d.getDate())),note:"پیامک بانک"+(f.last4?" ****"+f.last4:"")});seen.add(f.key)};
    const done=()=>{lsSet("home-sms-seen",JSON.stringify([...seen].slice(-500)));save();render()};
    if(!found.length){if(review)toast("پیامک بانکی جدیدی پیدا نشد");return}
    if(!review){found.forEach(addOne);done();toast(`📩 ${fa(found.length)} تراکنش از پیامک بانک ثبت شد`);return}
    sheet(`<h2 style="margin-top:0">📩 ${fa(found.length)} پیامک بانکی پیدا شد</h2><p class="muted" style="margin-top:0">تیک‌خورده‌ها ثبت می‌شوند. از این به بعد پیامک‌های جدید خودکار ثبت می‌شوند.</p>
      <div class="list">${found.map((f,i)=>`<label class="item"><input type="checkbox" checked data-i="${i}"><span class="t"><b class="${f.type==="in"?"in":"out"}">${f.type==="in"?"+":"−"}${toman(f.amount)}</b><br><span class="muted">${esc(accById(smsAccount(f.last4))?.name||"")}${f.last4?" · ****"+f.last4:""} · ${esc((f.body||"").slice(0,40))}…</span></span></label>`).join("")}</div>
      <div class="row" style="margin-top:12px"><button class="btn grow" id="ok">ثبت</button><button class="btn ghost" id="no">رد کردن همه</button></div>`,
      (sh,close)=>{sh.querySelector("#no").onclick=()=>{found.forEach(f=>seen.add(f.key));done();close()};
        sh.querySelector("#ok").onclick=()=>{sh.querySelectorAll("input[data-i]").forEach(c=>{const f=found[c.dataset.i];if(c.checked)addOne(f);else seen.add(f.key)});done();close();toast("ثبت شد ✓")}});
  }catch(e){if(String(e&&e.message||e).includes("denied")){lsSet("home-sms",null);toast("اجازه خواندن پیامک داده نشد")}}
  finally{smsBusy=false}}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&UNLOCKED)setTimeout(()=>smsSync(false),800)});
/* fingerprint */
async function bioUnlock(){const N=NAT();const pin=lsGet("home-bio");if(!N||!pin)return;
  try{await N.bioAuth();const r=getRem();const key=await aesKey(pin,ub64(r.salt));const {p}=await unseal(key,r);await doUnlock(p)}catch(e){}}
{const _rl=renderLock;renderLock=async function(){await _rl();const pad=document.querySelector("#lock .pad");if(pad&&NAT()&&lsGet("home-bio")&&getRem()){
  const b=document.createElement("button");b.className="btn";b.type="button";b.textContent="🔓 ورود با اثر انگشت";b.style.alignSelf="center";b.onclick=bioUnlock;pad.after(b);setTimeout(bioUnlock,300)}}}
/* home-screen widget */
let WLAST="";
function widgetPush(){const N=NAT();if(!N||!UNLOCKED)return;
  const total=S.accounts.reduce((s,a)=>s+balance(a),0),ym=ymNow();const out=S.tx.filter(t=>t.type==="out"&&t.cat!=="پس‌انداز"&&monthKey(t.date)===ym).reduce((s,t)=>s+t.amount,0);
  const sh=S.shop.filter(x=>!x.done);
  const d={title:"💰 موجودی: "+toman(total),line1:"خرج "+MONTHS[ym%100-1]+": "+toman(out),line2:sh.length?"🛒 "+fa(sh.length)+" قلم: "+sh.slice(0,4).map(x=>x.name).join("، "):"🛒 لیست خرید خالی است",line3:(extraAlerts()[0]?extraAlerts()[0].t+" — "+extraAlerts()[0].s:"")};
  const j=JSON.stringify(d);if(j===WLAST)return;WLAST=j;N.setWidget(d).catch(()=>{})}
{const _r2=render;render=function(){_r2();setTimeout(widgetPush,200)}}
/* settings cards */
function nativeCard(){if(!NAT())return "";const sms=lsGet("home-sms")==="1",bio=!!lsGet("home-bio");
  return `<div class="card stack"><b>📩 ثبت خودکار از پیامک بانک</b><span class="muted">پیامک‌های برداشت و واریز بانک خوانده و خودکار ثبت می‌شوند. برای اینکه به کارت درست برود، در «حساب‌ها» برای هر کارت ۴ رقم آخرش را بنویس. پیامک‌های رمز و کد هرگز خوانده نمی‌شوند.</span>
   <div class="row" style="flex-wrap:wrap"><button class="btn small ${sms?"ghost":""}" data-nat="sms">${sms?"خاموش کردن":"روشن کردن"}</button>${sms?`<button class="btn small ghost" data-nat="smsnow">الان چک کن</button>`:""}</div></div>
  <div class="card stack"><b>👆 ورود با اثر انگشت</b><span class="muted">${getRem()?"به جای پین، با اثر انگشت وارد شو.":"اول «پین ورود سریع» را بساز."}</span>
   ${getRem()?`<button class="btn small ${bio?"ghost":""}" data-nat="bio" style="align-self:flex-start">${bio?"خاموش کردن":"روشن کردن"}</button>`:""}</div>
  <div class="card stack"><b>📱 ویجت صفحه گوشی</b><span class="muted">روی صفحه اصلی گوشی انگشتت را نگه دار ← ویجت‌ها ← «دخل و خرج خانه» را بکش روی صفحه. موجودی، خرج ماه و لیست خرید را نشان می‌دهد.</span></div>`}
{const _vs2=vSettings;vSettings=function(){return _vs2().replace('<h2>تنظیمات</h2><div class="stack">','<h2>تنظیمات</h2><div class="stack">'+nativeCard())}}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-nat]");if(!b)return;const a=b.dataset.nat;
  if(a==="sms"){if(lsGet("home-sms")==="1"){lsSet("home-sms",null);render();return}lsSet("home-sms","1");lsSet("home-sms-since",String(Date.now()-3*864e5));render();smsSync(true)}
  else if(a==="smsnow")smsSync(true);
  else if(a==="bio"){if(lsGet("home-bio")){lsSet("home-bio",null);render();toast("اثر انگشت خاموش شد");return}
    sheet(`<h2 style="margin-top:0">👆 فعال کردن اثر انگشت</h2><div class="field"><label for="bp">پین فعلی</label><input type="password" id="bp" inputmode="numeric" maxlength="4"></div><p class="err" id="be"></p><button class="btn" id="ok">فعال کن</button>`,(sh,close)=>{
      sh.querySelector("#ok").onclick=async()=>{const pin=enDigits(sh.querySelector("#bp").value);try{const r=getRem();const key=await aesKey(pin,ub64(r.salt));await unseal(key,r);await NAT().bioAuth();lsSet("home-bio",pin);close();render();toast("اثر انگشت فعال شد ✓")}catch(err){sh.querySelector("#be").textContent="پین اشتباه است یا اثر انگشت تأیید نشد"}}})}
});
setTimeout(()=>{if(UNLOCKED)smsSync(false)},2500);
/* ---------- family chat ---------- */
let CH=[],CH_LAST=0,CH_BUSY=false,CH_REPLY=null,CH_REC=null,CH_NSINCE=0,CH_LOADED=false;
try{CH_NSINCE=+(localStorage.getItem("home-chsince")||0)}catch(e){}
const chMe=()=>SY.email||"";
const chUnread=()=>CH.filter(m=>m.sender_email!==chMe()&&!(m.seen_by||{})[chMe()]).length;
const chTime=m=>{const d=new Date(m.t);return d.toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"})};
const chDay=m=>{const d=new Date(m.t);return jfa(jstr(g2j(d.getFullYear(),d.getMonth()+1,d.getDate())))};
async function chFetch(){
  if(!SY.home||!SY.access||CH_BUSY)return;CH_BUSY=true;
  try{await auth();
    if(!CH_LOADED){const r=await sb(`/rest/v1/messages?home_id=eq.${SY.home}&order=t.desc&limit=60&select=*`);CH=(r||[]).reverse();CH_LOADED=true}
    else{const r=await sb(`/rest/v1/messages?home_id=eq.${SY.home}&t=gt.${CH_LAST}&order=t.asc&select=*`);(r||[]).forEach(m=>{if(!CH.find(x=>x.id===m.id))CH.push(m)});
      if(CH.length){const ids=CH.slice(-60).map(m=>m.id).join(",");const meta=await sb(`/rest/v1/messages?id=in.(${ids})&select=id,reactions,seen_by`);const mp={};(meta||[]).forEach(x=>mp[x.id]=x);
        if(meta&&meta.length){const tail=new Set(CH.slice(-60).map(m=>m.id));CH=CH.filter(m=>!tail.has(m.id)||mp[m.id]||String(m.id).startsWith("tmp"))}CH.forEach(m=>{if(mp[m.id]){m.reactions=mp[m.id].reactions;m.seen_by=mp[m.id].seen_by}})}}
    CH_LAST=CH.reduce((a,m)=>Math.max(a,m.t),CH_LAST);
    const fresh=CH.filter(m=>m.t>CH_NSINCE&&m.sender_email!==chMe());
    if(CH_NSINCE&&fresh.length&&route!=="chat"){const m=fresh[fresh.length-1];toast(`💬 ${m.sender_name||"خانواده"}: ${m.kind==="image"?"📷 عکس":m.kind==="voice"?"🎤 پیام صوتی":m.body.slice(0,40)}`)}
    if(CH_LAST>CH_NSINCE||!CH_NSINCE){CH_NSINCE=CH_LAST||Date.now();try{localStorage.setItem("home-chsince",String(CH_NSINCE))}catch(e){}}
    if(route==="chat"&&document.visibilityState==="visible"&&chUnread())sb("/rest/v1/rpc/chat_seen",{p_home:SY.home}).catch(()=>{});
  }catch(e){}finally{CH_BUSY=false}
  chBadge();if(route==="chat")chPaint();
}
function chBadge(){const n=chUnread();const b=$("#chatBtn");if(b){b.hidden=!SY.home;b.querySelector("i").textContent=n?fa(n):"";b.querySelector("i").hidden=!n}}
setInterval(()=>{if(document.visibilityState!=="visible"||!SY.home)return;if(route==="chat"||Date.now()%15000<3100)chFetch()},3000);
setTimeout(chFetch,3500);
function vChat(){
  if(!SY.home)return `<button class="btn small ghost back" data-go="more">→ بازگشت</button><div class="card" style="margin-top:12px">${empty("💬","اول از تنظیمات، گوشی‌ها را به یک خانواده وصل کن.")}<button class="btn" data-go="settings" style="width:100%">رفتن به تنظیمات</button></div>`;
  return `<div class="chatwrap"><div class="row between" style="margin:6px 0"><h2 style="margin:0"><span class="e">💬</span>چت خانواده</h2><button class="btn small ghost" data-go="home">بستن</button></div>
  <div id="chatlist" class="chatlist"></div>
  <div class="composer"><div id="chreply" hidden class="chreply"></div><div id="chrec" hidden class="chrec"><span class="dot bad"></span><b id="chrect">۰:۰۰</b><span class="grow muted">در حال ضبط صدا…</span><button class="btn small" id="chrecsend">➤ بفرست</button><button class="btn small ghost" id="chreccancel">✕</button></div>
   <div class="row" id="chbar"><button class="cbtn" id="chpic" aria-label="عکس">📷</button><button class="cbtn" id="chmic" aria-label="ضبط صدا">🎤</button>
   <textarea id="chtext" rows="1" placeholder="پیام…"></textarea><button class="cbtn send" id="chsend" aria-label="ارسال">➤</button></div></div>
  <input type="file" id="chfile" accept="image/*" hidden></div>`;
}
function chPaint(){const L=$("#chatlist");if(!L)return;const me=chMe();let html="",lastDay="";
  CH.forEach(m=>{const d=chDay(m);if(d!==lastDay){html+=`<div class="chday">${d}</div>`;lastDay=d}
    const mine=m.sender_email===me;const rp=m.reply_to?CH.find(x=>x.id===m.reply_to):null;
    const seen=mine&&Object.keys(m.seen_by||{}).some(k=>k!==me);
    const reacts=Object.entries(m.reactions||{});const grp={};reacts.forEach(([k,v])=>{grp[v]=(grp[v]||0)+1});
    html+=`<div class="msg ${mine?"me":"them"}" data-mid="${m.id}"><div class="bubble">${mine?"":`<b class="mname">${esc(m.sender_name||"")}</b>`}
      ${rp?`<div class="mquote">↩️ ${esc(rp.sender_name||"")}: ${esc(rp.kind==="image"?"📷 عکس":rp.kind==="voice"?"🎤 پیام صوتی":rp.body.slice(0,60))}</div>`:""}
      ${m.kind==="image"&&m.media?`<img src="${m.media}" class="mimg" data-full="${m.id}" alt="عکس">`:""}
      ${m.kind==="voice"&&m.media?`<audio controls src="${m.media}" preload="none"></audio>`:""}
      ${m.body?`<div class="mtext">${esc(m.body).replace(/\n/g,"<br>")}</div>`:""}
      <div class="mmeta">${chTime(m)}${mine?`<span class="tick ${seen?"seen":""}">${seen?"✓✓":"✓"}</span>`:""}</div></div>
      ${reacts.length?`<div class="mreact">${Object.entries(grp).map(([e,n])=>`<span>${e}${n>1?fa(n):""}</span>`).join("")}</div>`:""}</div>`});
  if(!CH.length)html=`<div class="empty"><span class="ee">💬</span>اولین پیام را بفرست!</div>`;
  const atBottom=L.scrollHeight-L.scrollTop-L.clientHeight<80;const first=!L.dataset.ok;
  if(L.dataset.h!==String(html.length)+":"+CH.length+":"+JSON.stringify(CH.map(m=>[m.reactions,m.seen_by]))){L.innerHTML=html;L.dataset.h=String(html.length)+":"+CH.length+":"+JSON.stringify(CH.map(m=>[m.reactions,m.seen_by]))}
  if(first||atBottom){L.scrollTop=L.scrollHeight;L.dataset.ok=1}}
async function chSend(kind,body,media){
  if(!SY.home)return;const tmp={id:"tmp"+uid(),t:Date.now(),sender_email:chMe(),sender_name:S.name||"",kind,body,media,reply_to:CH_REPLY,reactions:{},seen_by:{}};CH.push(tmp);chPaint();
  try{await auth();const r=await sb("/rest/v1/messages",{home_id:SY.home,sender_email:chMe(),sender_name:S.name||"",kind,body:body||"",media:media||null,reply_to:CH_REPLY},"POST",{Prefer:"return=representation"});
    const i=CH.indexOf(tmp);if(r&&r[0])CH[i]=r[0];CH_LAST=Math.max(CH_LAST,(r&&r[0]&&r[0].t)||0)}
  catch(e){CH=CH.filter(x=>x!==tmp);toast("ارسال نشد؛ اینترنت یا فیلترشکن را چک کن")}
  CH_REPLY=null;const rb=$("#chreply");if(rb)rb.hidden=true;chPaint()}
function chImg(file){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>{const sc=Math.min(1,1280/Math.max(i.width,i.height));const c=document.createElement("canvas");c.width=Math.round(i.width*sc);c.height=Math.round(i.height*sc);c.getContext("2d").drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(i.src);res(c.toDataURL("image/jpeg",.7))};i.onerror=rej;i.src=URL.createObjectURL(file)})}
async function chRecStart(){
  if(!navigator.mediaDevices||!window.MediaRecorder){toast("ضبط صدا روی این گوشی پشتیبانی نمی‌شود");return}
  try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const mr=new MediaRecorder(st);const parts=[];let t0=Date.now();
    mr.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};
    CH_REC={mr,st,parts,send:false,iv:setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);const el=$("#chrect");if(el)el.textContent=fa(Math.floor(s/60))+":"+String(s%60).padStart(2,"0").replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);if(s>=90)chRecStop(true)},300)};
    mr.onstop=()=>{clearInterval(CH_REC.iv);st.getTracks().forEach(t=>t.stop());const send=CH_REC.send;const blob=new Blob(parts,{type:mr.mimeType||"audio/webm"});CH_REC=null;$("#chrec").hidden=true;$("#chbar").hidden=false;
      if(send&&blob.size>500){const fr=new FileReader();fr.onload=()=>chSend("voice","",fr.result);fr.readAsDataURL(blob)}};
    mr.start();$("#chrec").hidden=false;$("#chbar").hidden=true;
  }catch(e){toast("اجازه میکروفون داده نشد؛ از تنظیمات گوشی ← برنامه‌ها ← دخل و خرج خانه ← مجوزها ← میکروفون را روشن کن")}}
function chRecStop(send){if(!CH_REC)return;CH_REC.send=send;try{CH_REC.mr.stop()}catch(e){}}
function chActions(id){const m=CH.find(x=>x.id===id);if(!m||String(id).startsWith("tmp"))return;const mine=m.sender_email===chMe();const myR=(m.reactions||{})[chMe()];
  sheet(`<div class="reactbar">${["👍","❤️","😂","😮","😢","🙏","👏","🔥"].map(e=>`<button data-re="${e}" class="${myR===e?"on":""}">${e}</button>`).join("")}</div>
   <div class="stack" style="margin-top:12px"><button class="btn ghost" data-ma="reply">↩️ پاسخ</button>${m.body?`<button class="btn ghost" data-ma="copy">📋 کپی متن</button>`:""}${mine?`<button class="btn ghost" data-ma="del" style="color:var(--out)">🗑 حذف پیام</button>`:""}</div>`,
  (sh,close)=>{sh.onclick=async e=>{const r=e.target.closest("[data-re]"),a=e.target.closest("[data-ma]");
    if(r){const em=r.dataset.re===myR?"":r.dataset.re;m.reactions=m.reactions||{};if(em)m.reactions[chMe()]=em;else delete m.reactions[chMe()];close();chPaint();try{await auth();await sb("/rest/v1/rpc/chat_react",{p_id:m.id,p_emoji:em})}catch(x){toast("ثبت نشد")}}
    else if(a){close();const k=a.dataset.ma;
      if(k==="reply"){CH_REPLY=m.id;const rb=$("#chreply");rb.hidden=false;rb.innerHTML=`↩️ پاسخ به ${esc(m.sender_name||"")}: ${esc(m.kind==="image"?"📷 عکس":m.kind==="voice"?"🎤 پیام صوتی":m.body.slice(0,50))} <button class="icon" id="chrx">✕</button>`;$("#chtext").focus()}
      else if(k==="copy")copy(m.body);
      else if(k==="del"){try{await auth();await sb(`/rest/v1/messages?id=eq.${m.id}`,null,"DELETE");CH=CH.filter(x=>x.id!==m.id);chPaint()}catch(x){toast("حذف نشد")}}}}})}
document.addEventListener("click",async e=>{if(route!=="chat"&&!e.target.closest("#chatBtn"))return;const t=e.target;
  if(t.closest("#chatBtn")){go("chat");return}
  if(t.closest("#chsend")){const x=$("#chtext");const v=x.value.trim();if(!v)return;x.value="";x.style.height="";chSend("text",v,null);return}
  if(t.closest("#chpic")){$("#chfile").value="";$("#chfile").click();return}
  if(t.closest("#chmic")){chRecStart();return}
  if(t.closest("#chrecsend")){chRecStop(true);return}
  if(t.closest("#chreccancel")){chRecStop(false);return}
  if(t.closest("#chrx")){CH_REPLY=null;$("#chreply").hidden=true;return}
  const full=t.closest("[data-full]");if(full){sheet(`<img src="${full.src}" style="width:100%;border-radius:14px">`);return}
  if(t.closest("audio"))return;
  const mm=t.closest("[data-mid]");if(mm)chActions(mm.dataset.mid)});
document.addEventListener("change",async e=>{if(e.target.id!=="chfile")return;const f=e.target.files[0];if(!f)return;try{const d=await chImg(f);const x=$("#chtext");const cap=x.value.trim();x.value="";chSend("image",cap,d)}catch(err){toast("عکس خوانده نشد")}});
document.addEventListener("input",e=>{if(e.target.id==="chtext"){e.target.style.height="auto";e.target.style.height=Math.min(120,e.target.scrollHeight)+"px"}});
{const _r3=render;render=function(){if(route==="chat"&&UNLOCKED){const h=vChat();const v=$("#view");if(h!==LASTH){v.innerHTML=h;LASTH=h}renderTabs();$("#unitBtn").textContent=U();chPaint();chBadge();chFetch();return}_r3();chBadge()}}
{const _vm2=vMore;vMore=function(){return _vm2().replace('<div class="tiles">','<div class="tiles"><button class="tile c4" data-go="chat"><span class="ti">💬</span><b>چت خانواده</b><span>'+(chUnread()?fa(chUnread())+" پیام نخوانده":"پیام، عکس، صدا")+'</span></button>')}}
