
/* ---------- Android (Capacitor): local notifications + back button ---------- */
(function(){
  const C=window.Capacitor; if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
  const LN=C.Plugins.LocalNotifications, APP=C.Plugins.App;
  let t=null;
  async function schedule(){
    try{
      const p=await LN.checkPermissions(); if(p.display!=="granted"){const r=await LN.requestPermissions(); if(r.display!=="granted")return;}
      const pend=await LN.getPending(); if(pend.notifications.length) await LN.cancel({notifications:pend.notifications.map(n=>({id:n.id}))});
      const N=[]; let id=1; const now=new Date();
      for(let k=0;k<14;k++){
        const day=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k);
        const j=jstr(g2j(day.getFullYear(),day.getMonth()+1,day.getDate()));
        const items=[];
        S.inst.forEach(it=>{const n=instNext(it);if(n>=0&&instDue(it,n)===j)items.push("قسط "+it.title+": "+toman(it.amount))});
        S.todo.forEach(x=>{if(!x.done&&x.due===j)items.push("کار: "+x.text)});
        S.fridge.forEach(f=>{if(f.exp===j)items.push(f.name+" امروز تاریخش تمام می‌شود")});
        items.push(...eventsOnDay(j));
        const jy=jparse(j);(S.bills||[]).forEach(b=>{const ym=jy[0]*100+jy[1];const max=jy[1]<=6?31:jy[1]<=11?30:29;if(b.last!==ym&&Math.min(b.day,max)===jy[2])items.push((b.auto?"ثبت خودکار: ":"پرداخت امروز: ")+b.title+" "+toman(b.amount))});
        (S.cheques||[]).forEach(c=>{if(c.status!=="pending")return;if(c.due===j)items.push("سررسید چک امروز: "+(c.person||"")+" "+toman(c.amount));else if(c.due===addDays(j,1))items.push("فردا سررسید چک: "+(c.person||"")+" "+toman(c.amount))});
        (S.debts||[]).forEach(x=>{if(!x.settled&&x.due===j)items.push((x.dir==="owe"?"موعد بدهی به ":"موعد طلب از ")+x.person+" "+toman(x.amount))});
        const at9=new Date(day);at9.setHours(9,0,0,0);
        if(at9>now) N.push({id:id++,title:(S.name||"")+"، صبح بخیر",body:items.length?items.join("\n"):"امروز یادآوری خاصی نداری. خرج‌هایت را ثبت کن.",schedule:{at:at9,allowWhileIdle:true}});
        const wi=(day.getDay()+1)%7, pl=S.plan[wi]||{};
        const at12=new Date(day);at12.setHours(12,30,0,0);
        if(at12>now) N.push({id:id++,title:(S.name||"")+"، ظهر بخیر",body:pl.l||pl.d?["ناهار: "+(pl.l||"—"),"شام: "+(pl.d||"—")].join(" · "):"برنامه غذای امروز خالی است؛ از بخش آشپزخانه پیشنهاد بگیر.",schedule:{at:at12,allowWhileIdle:true}});
        const jj=g2j(day.getFullYear(),day.getMonth()+1,day.getDate()), nx=new Date(day);nx.setDate(nx.getDate()+1);
        if(g2j(nx.getFullYear(),nx.getMonth()+1,nx.getDate())[1]!==jj[1]){const at20=new Date(day);at20.setHours(20,0,0,0);
          if(at20>now) N.push({id:id++,title:"گزارش "+MONTHS[jj[1]-1]+" آماده است",body:"ببین این ماه بیشتر کجا خرج کردی و پیشنهادهای صرفه‌جویی را بخوان.",schedule:{at:at20,allowWhileIdle:true}});}
      }
      if(S.shop.some(x=>!x.done)){const d=new Date(now);d.setHours(18,0,0,0);if(d<=now)d.setDate(d.getDate()+1);
        N.push({id:id++,title:"لیست خرید",body:S.shop.filter(x=>!x.done).length+" قلم در لیست خرید مانده",schedule:{at:d,allowWhileIdle:true}});}
      if(N.length) await LN.schedule({notifications:N});
    }catch(e){console.log(e)}
  }
  const _save=save; save=function(){_save();clearTimeout(t);t=setTimeout(schedule,1500)};
  schedule();
  if(APP) APP.addListener("backButton",()=>{
    const sh=document.querySelector(".sheet-bg"); if(sh){sh.remove();return}
    if(route!=="home"){go(["inst","todo","save","report","accounts","settings","cards","family","budgets","bills","cheques","debts","events","chat"].includes(route)?"more":"home");return}
    APP.exitApp();
  });
  window.Notification=undefined;
})();
