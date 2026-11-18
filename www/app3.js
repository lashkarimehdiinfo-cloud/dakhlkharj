
/* ---------- family sync (Supabase) ---------- */
const SB_URL_DEFAULT="https://jzzjgvqewgtxulgowmiv.supabase.co",SB_KEY_DEFAULT="sb_publishable_p8V9yDoxk9r5GWb5L13zkg_duTfsSbt";
const SYNC_ARR=["accounts","tx","inst","shop","todo","fridge","save","budgets","bills","cheques","debts","recipes","events","deposits","prices"];
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
let _authP=null;
async function auth(){if(SY.access&&SY.exp>Date.now()+60000)return;if(!SY.refresh){SY.access="";sySave();throw new Error("login")}
  if(_authP)return _authP;
  _authP=(async()=>{try{const j=await sb("/auth/v1/token?grant_type=refresh_token",{refresh_token:SY.refresh});setSess(j)}
    catch(e){if(e.status===400||e.status===401||/refresh token|invalid grant/i.test(e.message)){SY.access="";SY.refresh="";sySave();throw new Error("login")}throw e}
    finally{_authP=null}})();return _authP}
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
    ${SY.email?`<p class="err" style="margin:0">ورودت منقضی شده؛ فقط رمز را بزن و «ورود».</p>`:""}<div class="field"><label for="sy_em">ایمیل</label><input type="text" id="sy_em" dir="ltr" inputmode="email" autocomplete="off" value="${esc(SY.email||"")}"></div>
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
    else if(a==="join"){const c=$("#sy_code").value.trim().toUpperCase().replace(/[IL]/g,"1").replace(/O/g,"0").replace(/\s/g,"");if(!c)return er("کد را وارد کن");b.disabled=true;await auth();
      const j=await sb("/rest/v1/rpc/join_home",{p_code:c});SY.home=j.id;SY.code=j.code;SY.rev=-1;sySave();
      if(S.example){SYNC_ARR.forEach(k=>S[k]=[]);S.plan={};S._m={tomb:{}};delete S.example;snap()}
      await pull();render();party();toast("به خانواده وصل شدی 🎉")}
    else if(a==="now"){await push();await pull();render();toast(syStatus==="ok"?"همگام شد ✓":"وصل نشد؛ اینترنت را چک کن")}
    else if(a==="copy")copy(SY.code);
    else if(a==="reset"){SY={url:"",key:""};sySave();render()}
    else if(a==="leave"){if(!b.dataset.armed){b.dataset.armed=1;b.textContent="مطمئنی؟";return}SY.home=null;SY.code=null;SY.rev=0;sySave();render()}
  }catch(err){b.disabled=false;const m=String(err.message||err);if(m==="login"||/refresh token/i.test(m)){if(/refresh token/i.test(m)){SY.access="";SY.refresh="";sySave()}render();toast("ورودت منقضی شده بود؛ رمز را بزن و دوباره «ورود»");return}
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

/* ---------- instant notifications (foreground service) ---------- */
const fgsOn=()=>{try{return localStorage.getItem("home-fgs")!=="0"}catch(e){return true}};
function fgsStart(){const N=NAT();if(!N||!N.startSync)return;if(SY.home&&SY.code&&fgsOn())N.startSync({url:SY.url,key:SY.key,home:SY.home,code:SY.code,me:SY.email||""}).catch(()=>{});else N.stopSync&&N.stopSync().catch(()=>{})}
function fgsVis(){const N=NAT();if(N&&N.setVisible)N.setVisible({v:document.visibilityState==="visible"}).catch(()=>{})}
setInterval(()=>{if(document.visibilityState==="visible")fgsVis()},15000);
const CHIME="data:audio/ogg;base64,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";
let _alertAt=0;
function alertIn(who){const now=Date.now();if(now-_alertAt<4000)return;_alertAt=now;
  try{navigator.vibrate&&navigator.vibrate([0,250,120,250])}catch(e){}
  try{const a=new Audio(CHIME);a.volume=1;a.play().catch(()=>{})}catch(e){}
  let v=null;try{v=localStorage.getItem("home-alertvoice")}catch(e){}
  if(v)setTimeout(()=>{try{new Audio(v).play().catch(()=>{})}catch(e){}},1300)}
let _arec=null;
async function recAlertVoice(btn){
  if(_arec){_arec.stop();return}
  let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){toast("اجازه میکروفون داده نشد");return}
  const mt=["audio/webm;codecs=opus","audio/ogg;codecs=opus","audio/mp4"].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||"";
  const r=new MediaRecorder(st,mt?{mimeType:mt}:undefined);const ch=[];_arec=r;
  r.ondataavailable=e=>{if(e.data.size)ch.push(e.data)};
  r.onstop=async()=>{st.getTracks().forEach(t=>t.stop());_arec=null;clearTimeout(r._t);
    const blob=new Blob(ch,{type:r.mimeType||mt||"audio/webm"});if(blob.size<800){toast("صدا ضبط نشد، دوباره امتحان کن");render();return}
    const url=await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(blob)});
    try{localStorage.setItem("home-alertvoice",url)}catch(e){}
    const ext=/mp4/.test(blob.type)?"m4a":/ogg/.test(blob.type)?"ogg":"webm";const N=NAT();
    if(N&&N.setAlertVoice)await N.setAlertVoice({b64:url.split(",")[1],ext}).catch(()=>{});
    render();toast("صدای اعلان ذخیره شد ✓ — حالا «تست اعلان» را بزن");try{new Audio(url).play()}catch(e){}};
  r.start();btn.textContent="⏹️ در حال ضبط… (بزن تا تمام شود)";r._t=setTimeout(()=>{if(r.state==="recording")r.stop()},4000)}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-nt]");if(!b)return;const N=NAT();const k=b.dataset.nt;
  if(k==="test"){if(N&&N.testNotify){fgsStart();await N.testNotify().catch(()=>{});toast("تا چند ثانیه دیگر اعلان آزمایشی می‌آید 🔔")}else{alertIn();toast("🔔 صدای اعلان")}}
  else if(k==="rec")recAlertVoice(b);
  else if(k==="del"){try{localStorage.removeItem("home-alertvoice")}catch(x){}if(N&&N.setAlertVoice)await N.setAlertVoice({b64:""}).catch(()=>{});render();toast("صدای ضبط‌شده حذف شد")}
  else if(k==="bat"){if(N&&N.battery){const r=await N.battery({ask:true}).catch(()=>({}));if(r&&r.ok)toast("✓ اپ اجازه کار در پس‌زمینه دارد")}}
  else if(k==="ch"){N&&N.notifSettings&&N.notifSettings()}});
setTimeout(async()=>{const N=NAT();if(!N||!N.battery||!SY.home)return;try{if(localStorage.getItem("home-batask"))return;localStorage.setItem("home-batask","1")}catch(e){return}const r=await N.battery({ask:false}).catch(()=>({ok:true}));if(!r.ok)N.battery({ask:true}).catch(()=>{})},9000);
document.addEventListener("visibilitychange",fgsVis);setTimeout(()=>{fgsVis();fgsStart()},4000);
let _fgsSig="";setInterval(()=>{const g=[SY.home,SY.code,SY.email,fgsOn()].join("|");if(g!==_fgsSig){_fgsSig=g;fgsStart()}},3000);
{const _nc=nativeCard;nativeCard=function(){if(!NAT())return "";return `<div class="card stack" style="background:var(--t-green)"><b>🔔 اعلان فوری خانواده</b><span class="muted">پیام چت، لیست خرید و کارهای جدید مثل تلگرام همان لحظه با صدا می‌آید، حتی وقتی اپ بسته است. یک اعلان کوچک ثابت در نوار بالای گوشی می‌ماند.</span>${SY.home?`<button class="btn small ${fgsOn()?"ghost":""}" data-fgs style="align-self:flex-start">${fgsOn()?"خاموش کردن":"روشن کردن"}</button>`:`<span class="muted">اول به خانواده وصل شو.</span>`}</div>
  <div class="card stack"><b>🔊 صدای اعلان پیام</b><span class="muted">هر پیام که بیاید، گوشی زنگ مخصوص دخل و خرج می‌زند و بعد با صدای فارسی می‌گوید «… پیام داده». بهتر است صدای خودتان را ضبط کنید (مثلاً «مهدی پیام داده»)؛ اگر ضبط نکنید، اگر گوشی صدای فارسی داشته باشد خودش می‌خواند.</span>
  <div class="row wrap" style="gap:8px"><button class="btn small" data-nt="test">🔔 تست اعلان</button><button class="btn small ghost" data-nt="rec">🎙️ ${(()=>{try{return localStorage.getItem("home-alertvoice")}catch(e){return null}})()?"ضبط دوباره صدا":"ضبط صدای اعلان"}</button>${(()=>{try{return localStorage.getItem("home-alertvoice")}catch(e){return null}})()?`<button class="btn small ghost" data-nt="del">🗑️ حذف صدا</button>`:""}</div>
  <div class="row wrap" style="gap:8px"><button class="btn small ghost" data-nt="bat">🔋 اجازه کار در پس‌زمینه</button><button class="btn small ghost" data-nt="ch">⚙️ تنظیم صدا در اندروید</button></div>
  <span class="muted">اگر صدا نیامد: ۱) «تست اعلان» را بزن ۲) «اجازه کار در پس‌زمینه» را تأیید کن ۳) در «تنظیم صدا در اندروید» صدا و «نمایش روی صفحه» را روشن کن ۴) گوشی روی بی‌صدا نباشد.</span></div>`+_nc()}}
document.addEventListener("click",e=>{if(!e.target.closest("[data-fgs]"))return;try{localStorage.setItem("home-fgs",fgsOn()?"0":"1")}catch(x){}fgsStart();render();toast(fgsOn()?"اعلان فوری روشن شد 🔔":"اعلان فوری خاموش شد")});
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
    if(CH_NSINCE&&fresh.length&&document.visibilityState==="visible")alertIn(fresh[fresh.length-1].sender_name);
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
