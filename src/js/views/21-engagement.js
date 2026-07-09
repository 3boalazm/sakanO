// ===== سكن · يوم الخطوبة (engagement day — قوائم تفاعلية قابلة للتعديل) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
// كل موضوع (section) صفحة مستقلة في السايد بار، مش تابات متراكمة في صفحة واحدة.
  const ENG_SECTIONS = [
    { id:"prep",         title:"الاستعداد المسبق",         icon:"🗓️", intro:"قبل الخطوبة بيوم — مراجعة، بروفة، وراحة." },
    { id:"kit",          title:"حقيبة الطوارئ",            icon:"🎒", intro:"المظهر والصحة — كل حاجة محتاجينها لو حصل أي طارئ." },
    { id:"schedule",     title:"تنظيم اليوم والتوقيت",      icon:"⏱️", intro:"الأكل، الشرب، والجدول الزمني الواقعي." },
    { id:"roles",        title:"توزيع المسؤوليات",         icon:"🗂️", intro:"مين مسؤول عن إيه، وميرجعش الكل للعروسين." },
    { id:"photography",  title:"الكوشة والتصوير",          icon:"📸", intro:"إضاءة، رؤية، وإدارة السيشن." },
    { id:"communication",title:"التواصل بينكم",            icon:"💬", intro:"اتفاقات بسيطة تحمي مزاجكم مع بعض طول اليوم." },
    { id:"mindset",      title:"الحالة النفسية",           icon:"🧘", intro:"الهدوء والدعم النفسي المتبادل." },
    { id:"opsroom",      title:"أفكار تنظيمية إضافية",     icon:"💡", intro:"لمسات بسيطة بتدي انطباع تنظيم من أول لحظة." },
    { id:"incidents",    title:"احتياطات من كتاب الحوادث", icon:"⚠️", intro:"دروس من مواقف حقيقية — وقاية بدل ما نتفاجأ." },
    { id:"lessons",      title:"ليتنا عرفنا هذا",          icon:"🎓", intro:"تكات خبرة من عرسان قبلنا." },
    { id:"afterparty",   title:"ما بعد الحفل",             icon:"🌙", intro:"إجراءات وحالة نفسية بعد ما الحفل يخلص." },
    { id:"notes",        title:"ملاحظات أخيرة",            icon:"📝", intro:"قبل ما تقفلوا القايمة." },
  ];
  function engMeta(id){ return ENG_SECTIONS.find(x=>x.id===id) || ENG_SECTIONS[0]; }
  const ENG_STATE_NEXT = { pending:"done", done:"skip", skip:"pending" };
  const ENG_STATE_ICON = { pending:"○", done:"✓", skip:"✗" };
  const ENG_STATE_LABEL = { pending:"لسه", done:"اتعمل", skip:"مش هيتعمل" };

  async function renderEngagement(){
    S.view="engagement"; S.resourceId=null;
    const m = engMeta(S.engSection || "prep"); S.engSection = m.id;
    el.innerHTML = `
      <div class="eng-nav" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
        ${ENG_SECTIONS.map(x=>`<button class="btn sm ${x.id===m.id?'':'ghost'}" data-act="eng_${x.id}">${x.icon} ${esc(x.title)}</button>`).join("")}
      </div>
      ${pageTitle(m.icon+" "+m.title, m.intro)}
      <div class="card tight"><div class="row"><label>إضافة عنصر جديد</label><input id="engNewText" type="text" placeholder="اكتبوا اللي عايزين تضيفوه…"></div>
        <button class="btn" data-act="engAdd">أضِف</button></div>
      <div id="engList" style="margin-top:12px"><div class="empty">…تحميل</div></div>`;
    await reloadEngagement();
    const inp = document.getElementById("engNewText");
    if(inp) inp.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ e.preventDefault(); go("engAdd", inp); } });
  }
  async function reloadEngagement(){
    const list = document.getElementById("engList"); if(!list) return;
    try{
      const items = await api("GET","/engagement/"+encodeURIComponent(S.engSection));
      list.innerHTML = items.length ? items.map(it=>{
        const st = it.state||"pending";
        const cls = st==="done" ? "" : (st==="skip" ? "ghost" : "ghost");
        const strike = st==="done" ? "text-decoration:line-through;opacity:.65" : (st==="skip" ? "text-decoration:line-through;opacity:.4" : "");
        const dot = st==="done" ? "#36c46f" : (st==="skip" ? "#c0392b" : "var(--muted)");
        return `<div class="card tight"><div class="actions" style="justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:flex-start;gap:10px;min-width:0">
            <button class="btn ${cls} sm" style="flex:none;color:${st==='pending'?'':'#fff'};${st==='done'?'background:#36c46f;border-color:#36c46f':''}${st==='skip'?'background:#c0392b;border-color:#c0392b':''}" data-act="engCycle" data-id="${esc(it.id)}" data-state="${st}" title="${ENG_STATE_LABEL[st]} — دوس تغيّر الحالة">${ENG_STATE_ICON[st]}</button>
            <span style="${strike};min-width:0;word-break:break-word">${esc(it.text)}</span>
          </div>
          <div style="display:flex;gap:10px;flex:none">
            <button class="linkbtn" data-act="engEdit" data-id="${esc(it.id)}" data-text="${esc(it.text)}">تعديل</button>
            <button class="linkbtn" data-act="engDel" data-id="${esc(it.id)}">حذف</button>
          </div>
        </div></div>`;
      }).join("") : `<div class="empty">القايمة فاضية. ضيفوا أول عنصر ليها.</div>`;
    }catch(e){ list.innerHTML = `<div class="empty">${esc(errMsg(e))}</div>`; }
  }
