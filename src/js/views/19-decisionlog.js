// ===== سكن · سجلّ القرارات (decisionlog) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderDecisionLog(){
    S.view="decisionlog"; S.resourceId=null;
    el.innerHTML = pageTitle("سجل القرارات","كل ما اتفقنا عليه — مرتّب ودائم.") + `<div id="decBody"><div class="empty">…تحميل</div></div>`;
    try{
      const decs = await api("GET","/decisions");
      document.getElementById("decBody").innerHTML = decs.length ? decs.map(d=> decCard(d,{inResource:false})).join("")
        : `<div class="empty">لا قرارات بعد. كل حوار تكملوه يتحوّل لقرار من تبويب القرارات داخل المورد.</div>`;
    }catch(e){ document.getElementById("decBody").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; }
  }

  // ---------- phase 5: التواصل ----------
