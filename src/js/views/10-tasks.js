// ===== سكن · المهام (tasks) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderTasks(){
    S.view="tasks"; S.resourceId=null;
    el.innerHTML = pageTitle("المهام ومخطّط الفرح","كل مهمة: اسمها، تفاصيلها، وطريقة نتابع بيها إنجازها — إحنا فريق واحد.") + `
      <div class="card tight">
        <div class="row"><label>اسم المهمة</label><input id="tTitle" type="text" placeholder="مثلًا: حجز القاعة"></div>
        <div class="row"><label>تفاصيل المهمة <span class="muted">(اختياري)</span></label><textarea id="tDetails" placeholder="أي تفاصيل تنفع تتكتب…" rows="2"></textarea></div>
        <div class="row"><label>طريقة متابعة الإنجاز</label>
          <div class="themesw" id="tMode" role="group" style="border-radius:12px">
            <button type="button" data-mode="simple" class="on" style="width:auto;padding:6px 12px">مهمة واحدة</button>
            <button type="button" data-mode="steps" style="width:auto;padding:6px 12px">مقسّمة لمراحل</button></div></div>
        <div class="row" id="tStepsWrap" style="display:none">
          <label>مراحل المهمة <span class="muted">(سطر لكل مرحلة)</span></label>
          <textarea id="tSteps" placeholder="مثلًا:&#10;معاينة القاعة&#10;دفع العربون&#10;تأكيد التاريخ" rows="3"></textarea>
          <p class="muted" style="font-size:12.5px;margin:4px 0 0">نسبة الإنجاز هتتحسب لوحدها من المراحل اللي تخلص.</p>
        </div>
        <div class="row"><label>المسؤول <span class="muted">(اختياري)</span></label>
          <div class="themesw" id="tOwner" role="group" style="border-radius:12px">
            <button type="button" data-own="m" style="width:auto;padding:6px 12px">مصطفى</button>
            <button type="button" data-own="d" style="width:auto;padding:6px 12px">ضحى</button>
            <button type="button" data-own="both" class="on" style="width:auto;padding:6px 12px">الاتنين</button></div></div>
        <div class="row"><label>تاريخ (اختياري)</label><input id="tDue" type="text" placeholder="2026-08-01"></div>
        <button class="btn" data-act="addTask">أضِف مهمة</button>
      </div>
      <div id="tList"><div class="empty">…تحميل</div></div>`;
    document.getElementById("tOwner").addEventListener("click",ev=>{const b=ev.target.closest("button[data-own]");if(!b)return;[...ev.currentTarget.children].forEach(x=>x.classList.toggle("on",x===b));});
    document.getElementById("tMode").addEventListener("click",ev=>{const b=ev.target.closest("button[data-mode]");if(!b)return;[...ev.currentTarget.children].forEach(x=>x.classList.toggle("on",x===b));document.getElementById("tStepsWrap").style.display = b.dataset.mode==="steps"?"":"none";});
    await reloadTasks();
  }
  function taskProgressBar(t){
    return `<div style="background:var(--line);border-radius:999px;height:8px;overflow:hidden;margin-top:8px">
      <div style="height:100%;width:${t.progress}%;background:var(--accent);transition:width .25s"></div></div>
      <div class="muted" style="font-size:12.5px;margin-top:4px">${t.stepsDone} من ${t.stepsTotal} مراحل · ${t.progress}%</div>`;
  }
  async function reloadTasks(){
    try{
      const items = await api("GET","/tasks");
      const list = document.getElementById("tList");
      list.innerHTML = items.length ? items.map(t=>{
        const hasSteps = t.stepsTotal>0;
        const stepsHtml = hasSteps ? `<div style="margin-top:8px">` + t.steps.map(st=>`
            <div class="actions" style="gap:8px;margin-top:4px">
              <button class="btn ${st.done?'':'ghost'} sm" data-act="toggleStep" data-id="${esc(t.id)}" data-step="${esc(st.id)}" style="flex:none">${st.done?'✓':'○'}</button>
              <span style="flex:1;${st.done?'text-decoration:line-through;opacity:.6':''}">${esc(st.text)}</span>
              <button class="linkbtn" data-act="delStep" data-id="${esc(t.id)}" data-step="${esc(st.id)}" style="flex:none">حذف</button>
            </div>`).join("") + `
            <div class="actions" style="gap:8px;margin-top:8px">
              <input id="ns-${esc(t.id)}" type="text" placeholder="أضِف مرحلة…" style="flex:1">
              <button class="btn ghost sm" data-act="addStep" data-id="${esc(t.id)}" style="flex:none">أضِف</button>
            </div>` + taskProgressBar(t) + `</div>` : "";
        return `<div class="card tight"><div class="actions" style="justify-content:space-between">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
            ${hasSteps ? `<span class="pill ${t.done?'':'warn'} dot" style="flex:none">${t.done?'✓ تمّت':t.progress+'%'}</span>`
                       : `<button class="btn ${t.done?'':'ghost'} sm" data-act="toggleTask" data-id="${esc(t.id)}" style="flex:none">${t.done?'✓ تم':'علّم تم'}</button>`}
            <span style="${t.done?'text-decoration:line-through;opacity:.6':''}">${esc(t.title)}</span></div>
          <button class="linkbtn" data-act="delTask" data-id="${esc(t.id)}" style="flex:none">حذف</button></div>
          ${t.details?`<p class="muted" style="font-size:13.5px;margin:6px 0 0">${esc(t.details)}</p>`:""}
          ${stepsHtml}
          <div class="actions" style="margin-top:8px"><span class="pill">المسؤول: ${esc(OWN_AR[t.owner]||t.owner)}</span>${t.due?`<span class="pill warn">📅 ${esc(t.due)}</span>`:""}</div>
        </div>`;}).join("") : `<div class="empty">مفيش مهام. أضيفوا أول مهمة فوق.</div>`;
    }catch(e){ document.getElementById("tList").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; }
  }

