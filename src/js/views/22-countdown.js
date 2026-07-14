// ===== سكن · عدّاد يوم الخطوبة / آخر يوم ميري (الرئيسية) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  // التواريخ بتوقيت الجهاز (محلي) — نص الليل بداية اليوم
  const CD_T1 = new Date(2026, 6, 29, 0, 0, 0); // 29 يوليو 2026 — يوم الخطوبة
  const CD_T2 = new Date(2026, 7, 20, 0, 0, 0); // 20 أغسطس 2026 — آخر يوم ميري
  let _cdTimer = null;

  function cdParts(target){
    const now = new Date();
    let diff = target.getTime() - now.getTime();
    if(diff < 0) diff = 0;
    const s = Math.floor(diff/1000);
    return {
      d: Math.floor(s/86400),
      h: Math.floor((s%86400)/3600),
      m: Math.floor((s%3600)/60),
      s: s%60,
      reached: diff<=0,
    };
  }

  function countdownWidgetHtml(){
    const now = new Date();
    if(now >= CD_T2){
      return `<div class="cd-wrap cd-phase2"><div class="cd-overlay"></div>
        <div class="cd-inner"><div class="cd-done">🎉 خلصنا يوم الخطوبة وآخر يوم ميري — مبروك!</div></div></div>`;
    }
    const phase2 = now >= CD_T1;
    const target = phase2 ? CD_T2 : CD_T1;
    const label = phase2 ? "فاضل على آخر يوم ميري" : "فاضل على يوم الخطوبة";
    const p = cdParts(target);
    return `<div class="cd-wrap ${phase2?'cd-phase2':'cd-phase1'}"><div class="cd-overlay"></div>
      <div class="cd-inner">
        <div class="cd-label" id="cdLabel">${label}</div>
        <div class="cd-grid">
          <div class="cd-cell"><div class="cd-num" id="cdD">${p.d}</div><div class="cd-unit">يوم</div></div>
          <div class="cd-cell"><div class="cd-num" id="cdH">${String(p.h).padStart(2,'0')}</div><div class="cd-unit">ساعة</div></div>
          <div class="cd-cell"><div class="cd-num" id="cdM">${String(p.m).padStart(2,'0')}</div><div class="cd-unit">دقيقة</div></div>
          <div class="cd-cell"><div class="cd-num" id="cdS">${String(p.s).padStart(2,'0')}</div><div class="cd-unit">ثانية</div></div>
        </div>
      </div></div>`;
  }

  function startCountdownTicker(){
    stopCountdownTicker();
    _cdTimer = setInterval(()=>{
      const now = new Date();
      const wrap = document.querySelector(".cd-wrap");
      if(!wrap) { stopCountdownTicker(); return; }
      // لو دخلنا مرحلة جديدة (عدّينا 29/7 أو 20/8) نعيد بناء الويدجت كامل
      const shouldBePhase2 = now >= CD_T1 && now < CD_T2;
      const isPhase2 = wrap.classList.contains("cd-phase2");
      const isDone = now >= CD_T2;
      if((shouldBePhase2 !== isPhase2 && !isDone) || (isDone && !wrap.querySelector(".cd-done"))){
        wrap.outerHTML = countdownWidgetHtml();
        return;
      }
      if(isDone) return;
      const target = isPhase2 ? CD_T2 : CD_T1;
      const p = cdParts(target);
      const dEl=document.getElementById("cdD"), hEl=document.getElementById("cdH"),
            mEl=document.getElementById("cdM"), sEl=document.getElementById("cdS");
      if(dEl) dEl.textContent = p.d;
      if(hEl) hEl.textContent = String(p.h).padStart(2,'0');
      if(mEl) mEl.textContent = String(p.m).padStart(2,'0');
      if(sEl) sEl.textContent = String(p.s).padStart(2,'0');
    }, 1000);
  }
  function stopCountdownTicker(){ if(_cdTimer){ clearInterval(_cdTimer); _cdTimer=null; } }
