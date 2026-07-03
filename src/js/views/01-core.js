// ===== سكن · النواة: الحالة المشتركة + موجّه render + مساعدات عامة =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  // ---------- views ----------
  let _mtbPoll = null;   // متابعتنا: مؤقّت التحديث الحيّ (polling)
  let _chatPoll = null;  // شاتنا: مؤقّت التحديث الحيّ (polling)
  let _chatSig  = "";    // توقيع آخر رسائل لمنع إعادة رسم بلا داعٍ
  let _chatMsgs = [];    // آخر رسائل محمّلة (لقائمة الإجراءات/الرد)
  let _chatPartnerRead = 0; // آخر وقت قرأ فيه الشريك (لعلامات ✓✓)
  let _mtbSig  = "";     // توقيع آخر بيانات لمنع إعادة الرسم بلا داعٍ
  let _mtbItems = [];    // آخر مواد محمّلة (للفلترة بدون إعادة جلب)
  let _rcPoll = null;    // دردشة المورد: مؤقّت التحديث الحيّ
  let _rcSig  = "";      // توقيع آخر رسائل دردشة المورد
  let _rcMsgs = [];      // آخر رسائل دردشة المورد المحمّلة
  let _fabPoll = null;   // الشات العائم: مؤقّت التحديث الحيّ
  let _fabHist = false;  // الشات العائم: هل دفعنا حالة في الـ history (لزر الباك)
  function render(){
    if(_mtbPoll){ clearInterval(_mtbPoll); _mtbPoll=null; }   // أي تنقّل يوقف الـ polling
    if(_chatPoll){ clearInterval(_chatPoll); _chatPoll=null; }
    if(_rcPoll){ clearInterval(_rcPoll); _rcPoll=null; }
    closeNotif();
    renderBar();
    document.body.classList.toggle("pre-auth", !S.token || S.view==="pinlock");
    if(S.view==="pinlock") return renderPinLock();
    if(!S.token){ closeFab(); return renderOnboarding(); }
    if(S.view==="resource" && S.resourceId){ return renderResource(); }
    if(S.view==="home") return renderHome();
    if(S.view==="journeys") return renderJourneys();
    if(S.view==="discussions") return renderDiscussionsAll();
    if(S.view==="decisionlog") return renderDecisionLog();
    if(S.view==="connect") return renderConnect();
    if(S.view==="chat") return renderChat();
    if(S.view==="search") return renderSearch();
    if(S.view==="charter") return renderCharter();
    if(S.view==="tasks") return renderTasks();
    if(S.view==="budget") return renderBudget();
    if(S.view==="shopping") return renderShopping();
    if(S.view==="quicknotes") return renderQuickNotes();
    if(S.view==="myjourney")  return renderMyJourney();
    if(S.view==="mutabaana")  return renderMutabaana();
    if(S.view==="settings") return renderSettings();
    return renderLibrary();
  }

  // ---------- phase 2 + home: helpers ----------
  const OWN_AR = { m:"مصطفى", d:"ضحى", both:"الاتنين" };
  // مين أنا ومين شريكي — حسب اسم الجلسة. يمنع لخبطة عرض تقدّم كل طرف على الشاشة التانية.
  function coupleNames(){
    const me = /ضحى|ضحي/.test(S.name||"") ? "ضحى" : (/مصطف/.test(S.name||"") ? "مصطفى" : (S.name||"أنا"));
    const partner = me==="ضحى" ? "مصطفى" : (me==="مصطفى" ? "ضحى" : "شريكي");
    return { me, partner };
  }
  const fmtMoney = (n)=> (Number(n)||0).toLocaleString("ar-EG");
  function pageTitle(t, lede){ return `<h1 class="display">${esc(t)}</h1>${lede?`<p class="lede">${esc(lede)}</p>`:""}`; }

  // ---------- phase 3: journeys & stages ----------
  const STAGES = [
    {n:0, title:"التأسيس والنيّة", theme:"الزواج كميثاق وعبادة ومقصد — قبل أي تفاصيل."},
    {n:1, title:"الخطوبة والاختيار", theme:"فقه الخطوبة، معايير الاختيار، والتخطيط العملي."},
    {n:2, title:"فهم الذات والآخر", theme:"بناء شخصية الطرفين وفهم طبيعة كلٍّ ودوره."},
    {n:3, title:"المودة والمهارات", theme:"فن العشرة والمعايشة وتنمية الحب وآداب البيت."},
    {n:4, title:"التأهيل الشامل", theme:"برامج متكاملة تجمع وتعمّق ما سبق."},
    {n:5, title:"متقدّم وللرجوع", theme:"مواضيع جانبية أو لأوقات الأزمات."},
  ];
  const PRIO_AR = { high:"عالية", medium:"متوسطة", later:"لاحقًا" };
  const PRIO_W  = { high:0, medium:1, later:2 };
  // التقسيم الجديد: ٤ كاتيجوريز + قائمتان (يوتيوب/تيليجرام)
  const CATS = [
    { id:"khotouba", title:"الخطوبة والاختيار", ico:"💍", theme:"التأسيس، فقه الخطوبة، معايير الاختيار، وفهم الذات." },
    { id:"zawaj",    title:"مرحلة الجواز",       ico:"🤝", theme:"المودة وفن العشرة ومهارات البيت في أول الزواج." },
    { id:"baad",     title:"ما بعد الجواز",       ico:"🏡", theme:"برامج التأهيل الشامل وبناء البيت المستقر." },
    { id:"tarbiya",  title:"التربية",            ico:"🌱", theme:"تربية الأبناء وبناء جيل صالح." },
  ];
  const STAGE_CAT = { 0:"khotouba", 1:"khotouba", 2:"khotouba", 3:"zawaj", 4:"baad", 5:"baad" };
  const catOf = r => r.category || STAGE_CAT[Number(r.stage)] || "khotouba";
  function srcOf(r){ const l=r.link||""; if(/youtu\.?be|youtube/i.test(l)) return "youtube"; if(/t\.me|telegram/i.test(l)) return "telegram"; return (r.type==="video")?"youtube":"telegram"; }
  const TYPE_ICON = { course:"🎓", book:"📖", video:"🎬", pdf:"📄", article:"📰" };
  const hasYt = r => /youtu\.?be/.test(r.link||"");
  function progPill(st, who){ const done=st==='completed'; return `<span class="pill dot ${done?'':'warn'}" title="${who}: ${STATE_AR[st]||st}">${done?who+' ✓':(st==='in_progress'?who+' •':who)}</span>`; }
  function dualProg(p){ p=p||{mine:'not_started',partner:'not_started'}; return `<span style="display:inline-flex;gap:6px;flex:none;align-items:center">${progPill(p.mine,'أنا')}${progPill(p.partner,'شريكي')}</span>`; }
  function ytMark(r){ return hasYt(r)?`<span title="يوتيوب" style="color:#e23;flex:none;font-size:13px">▶</span> `:""; }
  // أصول الأسماء مدمجة inline: Asset 1 = ضحى، Asset 2 = مصطفى. اللون يتبع الثيم (داكن على اللايت، أبيض على الدارك).
  function nameCal(){
    const n = S.name||"";
    const idx = /ضحى|ضحي/.test(n) ? 1 : (/مصطف/.test(n) ? 2 : 0);
    if(!idx) return "";
    const alt = idx===1 ? "ضحى" : "مصطفى";
    const src = document.querySelector('#nameAssets [data-ni="'+idx+'"]');
    const svg = src ? src.outerHTML : '<span class="namefallback">'+alt+'</span>';
    return `<div class="namecal" role="img" aria-label="${alt}">${svg}</div>`;
  }
  function greetHero(){
    const n = S.name||"";
    const cal = nameCal();
    if(cal){
      const sub = /ضحى|ضحي/.test(n) ? "نوّرتِ سكن 🌿" : "نوّرت سكن 🌿";
      return `<div class="card greet"><div class="hi">أهلًا</div>${cal}<p class="muted" style="margin:8px 0 0">${sub}</p></div>`;
    }
    const who = (n && n!=="أنا") ? esc(n) : "بكم في سكن";
    return `<div class="card greet"><div class="hi">أهلًا</div><h1 class="display" style="margin:4px 0 0">${who}</h1></div>`;
  }


