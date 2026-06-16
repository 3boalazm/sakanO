// ===== سكن · الميزانية (budget) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderBudget(){
    S.view="budget"; S.resourceId=null;
    el.innerHTML = pageTitle("الميزانية المشتركة","نتتبّع فلوسنا رايحة فين: مخطّط، مدفوع، ومتبقّي.") + `
      <div class="card tight">
        <div class="row"><label>اسم البند</label><input id="bLabel" type="text" placeholder="مثلًا: قاعة الفرح"></div>
        <div class="row"><label>الفئة (اختياري)</label><input id="bCat" type="text" placeholder="فرح / جهاز / بيت / فواتير"></div>
        <div class="row"><label>المبلغ المخطّط</label><input id="bPlanned" type="text" placeholder="0"></div>
        <button class="btn" data-act="addBudget">أضِف بند</button>
      </div>
      <div id="bSummary"></div><div id="bList"><div class="empty">…تحميل</div></div>`;
    await reloadBudget();
  }
  async function reloadBudget(){
    try{
      const items = await api("GET","/budget");
      const planned = items.reduce((a,b)=>a+(+b.planned||0),0), paid = items.reduce((a,b)=>a+(+b.paid||0),0);
      document.getElementById("bSummary").innerHTML = `<div class="card tight"><div class="actions">
        <span class="pill">المخطّط: ${fmtMoney(planned)}</span><span class="pill warn">المدفوع: ${fmtMoney(paid)}</span>
        <span class="pill dot ${planned-paid<=0?'':'warn'}">المتبقّي: ${fmtMoney(planned-paid)}</span></div></div>`;
      const list = document.getElementById("bList");
      list.innerHTML = items.length ? items.map(b=>{const rem=(+b.planned||0)-(+b.paid||0);return `
        <div class="card tight"><div class="actions" style="justify-content:space-between"><h2 style="margin:0;font-size:17px">${esc(b.label)}</h2>
          <button class="linkbtn" data-act="delBudget" data-id="${esc(b.id)}">حذف</button></div>
          <div class="actions" style="margin-top:8px">${b.cat?`<span class="pill">${esc(b.cat)}</span>`:""}<span class="pill warn">مدفوع ${fmtMoney(b.paid)} / ${fmtMoney(b.planned)}</span>
          <span class="pill dot ${rem<=0?'':'warn'}">${rem<=0?'مكتمل':'باقي '+fmtMoney(rem)}</span>
          <div class="spacer"></div><button class="btn soft sm" data-act="payBudget" data-id="${esc(b.id)}">سجّل دفعة</button></div>
        </div>`}).join("") : `<div class="empty">مفيش بنود. أضيفوا بنود الميزانية فوق.</div>`;
    }catch(e){ document.getElementById("bList").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; }
  }

