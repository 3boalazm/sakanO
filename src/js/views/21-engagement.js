// ===== سكن · يوم الخطوبة (engagement day — صفحة واحدة، بمواضيع مفتوحة + فلو زمني) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  const ENG_SECTIONS = [
    { id:"lessons",      title:"ليتنا عرفنا هذا",          icon:"🎓", intro:"تكات خبرة من عرسان قبلنا — تستاهل قراءة قبل ما اليوم يبدأ." },
    { id:"prep",         title:"الاستعداد المسبق",         icon:"🗓️", intro:"قبل الخطوبة بيوم — مراجعة، بروفة، وراحة." },
    { id:"opsroom",      title:"أفكار تنظيمية إضافية",     icon:"💡", intro:"لمسات بسيطة بتدي انطباع تنظيم من أول لحظة." },
    { id:"incidents",    title:"احتياطات من كتاب الحوادث", icon:"⚠️", intro:"دروس من مواقف حقيقية — وقاية بدل ما نتفاجأ." },
    { id:"roles",        title:"توزيع المسؤوليات",         icon:"🗂️", intro:"مين مسؤول عن إيه، وميرجعش الكل للعروسين." },
    { id:"kit",          title:"حقيبة الطوارئ",            icon:"🎒", intro:"المظهر والصحة — كل حاجة محتاجينها لو حصل أي طارئ." },
    { id:"schedule",     title:"تنظيم اليوم والتوقيت",      icon:"⏱️", intro:"الأكل، الشرب، والجدول الزمني الواقعي." },
    { id:"communication",title:"التواصل بينكم",            icon:"💬", intro:"اتفاقات بسيطة تحمي مزاجكم مع بعض طول اليوم." },
    { id:"mindset",      title:"الحالة النفسية",           icon:"🧘", intro:"الهدوء والدعم النفسي المتبادل." },
    { id:"photography",  title:"الكوشة والتصوير",          icon:"📸", intro:"إضاءة، رؤية، وإدارة السيشن." },
    { id:"afterparty",   title:"ما بعد الحفل",             icon:"🌙", intro:"إجراءات وحالة نفسية بعد ما الحفل يخلص." },
    { id:"notes",        title:"ملاحظات أخيرة",            icon:"📝", intro:"قبل ما تقفلوا القايمة." },
  ];
  const ENG_STATE_NEXT  = { pending:"done", done:"skip", skip:"pending" };
  const ENG_STATE_ICON  = { pending:"○", done:"✓", skip:"✗" };
  const ENG_STATE_LABEL = { pending:"لسه", done:"اتعمل", skip:"مش هيتعمل" };
  let _engItems = [];   // آخر تحميل لكل عناصر يوم الخطوبة (كل الأقسام)

  function engKeys(){
    const cn = coupleNames();
    const myKey = cn.me==="مصطفى" ? "m" : (cn.me==="ضحى" ? "d" : "both");
    const partnerKey = myKey==="m" ? "d" : (myKey==="d" ? "m" : "both");
    return { myKey, partnerKey, meName:cn.me, partnerName:cn.partner };
  }
  function engOwnerName(owner){
    const k = engKeys();
    if(owner==="both") return "الاتنين";
    if(owner===k.myKey) return "أنا";
    if(owner===k.partnerKey) return k.partnerName;
    return owner==="m" ? "مصطفى" : "ضحى";
  }
  function engMatchesFilter(owner, filter, k){
    if(filter==="all") return true;
    if(filter==="mine") return owner==="both" || owner===k.myKey;
    if(filter==="partner") return owner==="both" || owner===k.partnerKey;
    return true;
  }
  // شرائح فلتر بنفس نمط شرائح متابعتنا الموجود في المشروع (نمط موحّد، بدون كلاسات جديدة)
  function engChip(active,label,dataAttrs){
    return `<button ${dataAttrs} style="width:auto;padding:6px 13px;border-radius:99px;border:1px solid ${active?'transparent':'var(--line)'};background:${active?'linear-gradient(135deg,var(--brand-mid,#1a5d47),var(--brand-deep,#0e3b2e))':'var(--surface)'};color:${active?'#fff':'var(--ink)'};font:inherit;font-size:12.5px;font-weight:700;cursor:pointer">${esc(label)}</button>`;
  }
  function engBadge(label){
    return `<span style="display:inline-block;margin-inline-start:8px;padding:2px 9px;border-radius:99px;background:rgba(120,120,120,.14);color:var(--muted);font-size:11.5px;white-space:nowrap;vertical-align:middle">${esc(label)}</span>`;
  }

  async function renderEngagement(){
    S.view="engagement"; S.resourceId=null;
    if(!S.engMode) S.engMode="topics";
    if(!S.engFilter) S.engFilter="all";
    el.innerHTML = `
      ${pageTitle("💍 يوم الخطوبة","كل حاجة محتاجينها ليوم الخطوبة — منظّمة بالمواضيع، أو في فلو واحد بترتيب تنفيذها من أول الاستعداد لحد آخر الحفل.")}
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <button class="btn sm ${S.engMode==='topics'?'':'ghost'}" data-act="engMode" data-mode="topics">🗂️ بالمواضيع</button>
        <button class="btn sm ${S.engMode==='flow'?'':'ghost'}" data-act="engMode" data-mode="flow">🧭 الفلو الزمني</button>
      </div>
      <div id="engBody"><div class="empty">…تحميل</div></div>`;
    await reloadEngagement();
  }

  async function reloadEngagement(){
    const body = document.getElementById("engBody"); if(!body) return;
    try{
      _engItems = await api("GET","/engagement");
      renderEngagementBody();
    }catch(e){ body.innerHTML = `<div class="empty">${esc(errMsg(e))}</div>`; }
  }

  function renderEngagementBody(){
    const body = document.getElementById("engBody"); if(!body) return;
    body.innerHTML = S.engMode==="flow" ? engFlowHtml() : engTopicsHtml();
    const inp = document.getElementById("engNewText");
    if(inp) inp.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ e.preventDefault(); go("engAdd", inp); } });
  }

  function engItemRow(it, opts){
    opts = opts || {};
    const st = it.state||"pending";
    const strike = st==="done" ? "text-decoration:line-through;opacity:.65" : (st==="skip" ? "text-decoration:line-through;opacity:.4" : "");
    const btnBg = st==="done" ? "background:#36c46f;border-color:#36c46f;color:#fff" : (st==="skip" ? "background:#c0392b;border-color:#c0392b;color:#fff" : "");
    const sec = ENG_SECTIONS.find(s=>s.id===it.section);
    const secBadge = opts.showSection && sec ? engBadge(sec.icon+" "+sec.title) : "";
    const ownerBadge = engBadge(engOwnerName(it.owner));
    return `<div class="card tight" id="eng-row-${esc(it.id)}"><div class="actions" style="justify-content:space-between;align-items:flex-start">
      <div style="display:flex;align-items:flex-start;gap:10px;min-width:0;flex:1">
        <button class="btn ghost sm" style="flex:none;${btnBg}" data-act="engCycle" data-id="${esc(it.id)}" data-state="${st}" title="${ENG_STATE_LABEL[st]} — دوس تغيّر الحالة">${ENG_STATE_ICON[st]}</button>
        <span style="${strike};min-width:0;word-break:break-word">${esc(it.text)}${ownerBadge}${secBadge}</span>
      </div>
      <div style="display:flex;gap:10px;flex:none">
        <button class="linkbtn" data-act="engEdit" data-id="${esc(it.id)}" data-text="${esc(it.text)}">تعديل</button>
        <button class="linkbtn" data-act="engDel" data-id="${esc(it.id)}">حذف</button>
      </div>
    </div></div>`;
  }

  function engTopicsHtml(){
    const k = engKeys();
    const filter = S.engFilter||"all";
    const filterRow = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${engChip(filter==="all","الكل",`data-act="engFilter" data-f="all"`)}
      ${engChip(filter==="mine","اللي ليّا",`data-act="engFilter" data-f="mine"`)}
      ${engChip(filter==="partner","اللي لـ"+k.partnerName,`data-act="engFilter" data-f="partner"`)}
    </div>`;
    const secOptions = ENG_SECTIONS.map(s=>`<option value="${esc(s.id)}">${s.icon} ${esc(s.title)}</option>`).join("");
    const addForm = `<div class="card tight" style="margin-bottom:16px">
      <div class="row"><label>عنصر جديد</label><input id="engNewText" type="text" placeholder="اكتبوا اللي عايزين تضيفوه…"></div>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
        <select id="engNewSection" style="flex:1;min-width:140px">${secOptions}</select>
        <select id="engNewOwner" style="flex:1;min-width:120px">
          <option value="both">للاتنين</option><option value="${esc(k.myKey)}">ليّا بس</option><option value="${esc(k.partnerKey)}">لـ${esc(k.partnerName)} بس</option>
        </select>
      </div>
      <button class="btn" data-act="engAdd">أضِف</button>
    </div>`;
    const groups = ENG_SECTIONS.map(sec=>{
      const items = _engItems.filter(it=>it.section===sec.id && engMatchesFilter(it.owner, filter, k))
        .sort((a,b)=>(a.flowOrder??9999)-(b.flowOrder??9999));
      if(!items.length) return "";
      return `<div style="margin-bottom:22px">
        <h3 style="margin:0 0 4px">${sec.icon} ${esc(sec.title)}</h3>
        <p class="muted" style="margin:0 0 10px">${esc(sec.intro)}</p>
        ${items.map(it=>engItemRow(it)).join("")}
      </div>`;
    }).join("");
    return filterRow + addForm + (groups || `<div class="empty">مفيش عناصر تطابق الفلتر ده دلوقتي.</div>`);
  }

  function engFlowHtml(){
    const sorted = _engItems.slice().sort((a,b)=>(a.flowOrder??9999)-(b.flowOrder??9999) || a.createdAt-b.createdAt);
    const total = sorted.length;
    const done = sorted.filter(x=>x.state==="done").length;
    const skip = sorted.filter(x=>x.state==="skip").length;
    const pct = total ? Math.round((done/total)*100) : 0;
    const head = `<div class="card tight" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <b>التقدّم في الفلو</b><span class="muted">${done} من ${total} اتعملوا${skip?` · ${skip} متأجّلين`:""}</span>
      </div>
      <div style="height:8px;border-radius:99px;background:var(--line);overflow:hidden"><div style="height:100%;width:${pct}%;background:#36c46f;transition:width .3s"></div></div>
      <button class="btn sm" style="margin-top:10px" data-act="engNext">⏭️ روح لأول حاجة لسه</button>
    </div>`;
    const rows = sorted.map((it,i)=>`<div style="display:flex;align-items:flex-start;gap:8px">
      <span class="muted" style="flex:none;min-width:26px;text-align:center;padding-top:10px">${i+1}</span>
      <div style="flex:1;min-width:0">${engItemRow(it,{showSection:true})}</div>
    </div>`).join("");
    return head + (rows || `<div class="empty">مفيش عناصر لسه.</div>`);
  }

  function engScrollToNextPending(){
    const sorted = _engItems.slice().sort((a,b)=>(a.flowOrder??9999)-(b.flowOrder??9999) || a.createdAt-b.createdAt);
    const next = sorted.find(x=>x.state==="pending");
    if(!next){ toast("خلصتوا كل حاجة في الفلو 🎉"); return; }
    const node = document.getElementById("eng-row-"+next.id);
    if(node){
      node.scrollIntoView({behavior:"smooth", block:"center"});
      node.style.transition="box-shadow .3s"; node.style.boxShadow="0 0 0 3px var(--accent)";
      setTimeout(()=>{ node.style.boxShadow=""; }, 1400);
    }
  }
