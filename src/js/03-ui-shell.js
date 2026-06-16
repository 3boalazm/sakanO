  // ---------- الدرج الجانبي (تقسيم زي زاد) ----------
  const NAVSECS = [
    { items:[["home","الرئيسية","🏠"],["chat","شاتنا","💌"]] },
    { title:"رحلتنا", items:[["mutabaana","متابعتنا","📊"],["journeys","قوائمنا","▶️"],["library","المكتبة","📚"],["myjourney","رحلتي","🌿"]] },
    { title:"الحوار والقرار", items:[["discussions","المناقشات","💬"],["decisionlog","القرارات","✅"],["charter","ميثاقنا","📜"]] },
    { title:"حياتنا", items:[["connect","تواصلنا","💞"],["quicknotes","مفكّرتنا","📝"],["tasks","المهام","🗒️"],["budget","الميزانية","💰"],["shopping","المشتريات","🛒"]] },
    { title:"الإعدادات", items:[["settings","الإعدادات","⚙️"],["logout","خروج","↩️"]] },
  ];
  function renderDrawer(){
    const d = document.getElementById("drawer"); if(!d) return;
    if(!S.token){ d.innerHTML=""; return; }
    const cur = S.view;
    let html = `<div class="dw-head"><div class="dw-brand"><span class="brandlogo dw-logo"></span>سكن</div><button class="dw-x" data-dw="close" aria-label="إغلاق">✕</button></div>`;
    if(S.code) html += `<div class="dw-code">كود الميثاق: <b>${esc(S.code)}</b></div>`;
    html += `<div id="dwPresence" style="margin:6px 12px 2px;font-size:12.5px;line-height:1.75"></div>`;
    html += `<div style="display:flex;gap:6px;margin:8px 12px"><input id="dwSearch" type="search" placeholder="ابحث في كل حاجة…" style="flex:1;min-width:0"><button class="btn sm" data-act="doDrawerSearch" style="flex:none;width:auto;padding:0 13px">🔍</button></div>`;
    html += NAVSECS.map(sec=>{
      const links = sec.items.map(([act,label,ico])=>{
        return `<button class="dw-link ${act===cur?'active':''}" data-act="${act}"><span class="dw-ico">${ico}</span><span>${label}</span></button>`;
      }).join("");
      if(!sec.title) return `<div class="dw-group">${links}</div>`;
      return `<div class="dw-sep" data-dwsec>${esc(sec.title)}<span class="dw-arrow">▾</span></div><div class="dw-group">${links}</div>`;
    }).join("");
    html += `<div class="dw-sep" style="cursor:default">السمة</div>
      <div class="themesw dw-theme" role="group" aria-label="السمة" style="margin:4px 8px">
        <button data-set-theme="light" title="فاتح">☀️</button>
        <button data-set-theme="dark" title="داكن">🌙</button>
        <button data-set-theme="oled" title="OLED">⚫</button></div>`;
    html += `<div class="dw-foot" style="color:rgba(244,236,214,.5);font-size:12px;text-align:center;margin-top:18px">سكن · مساحتنا إحنا الاتنين 🌿</div>`;
    d.innerHTML = html;
    renderPresence();
    const _ds = document.getElementById("dwSearch");
    if(_ds) _ds.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ e.preventDefault(); go("doDrawerSearch", _ds); } });
    markTheme();
  }
  // حالة الحضور (متصل/آخر ظهور) للطرفين — تتحدّث مع نبضة الحضور
  function lastSeenAr(ts){
    if(!ts) return "ما ظهرش بعد";
    const diff = Date.now()-ts;
    if(diff < 55000) return "متصل الآن";
    const m = Math.floor(diff/60000); if(m<60) return `آخر ظهور من ${m} د`;
    const h = Math.floor(m/60); if(h<24) return `آخر ظهور من ${h} س`;
    const dd = Math.floor(h/24); return `آخر ظهور من ${dd} يوم`;
  }
  function partnerStatus(){
    const pr = S.presence || {}; const cn = coupleNames();
    const online = !!pr.partner && (Date.now()-pr.partner < 55000);
    const fem = cn.partner==="ضحى";
    const txt = pr.partner ? (online ? ("متصل"+(fem?"ة":"")+" الآن") : lastSeenAr(pr.partner)) : "ما ظهرش بعد";
    return { online, txt, name: cn.partner };
  }
  function renderChatPresence(){
    const box = document.getElementById("chatPresence"); if(!box) return;
    const st = partnerStatus();
    box.innerHTML = `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${st.online?'#36c46f':'var(--line)'};margin-inline-end:8px;flex:none;${st.online?'box-shadow:0 0 6px #36c46f':''}"></span><span><b>${esc(st.name)}</b> · <span class="muted">${esc(st.txt)}</span></span>`;
  }
  function renderPresence(){
    const box = document.getElementById("dwPresence"); if(!box) return;
    const pr = S.presence || {}; const cn = coupleNames();
    const online = (ts)=> !!ts && (Date.now()-ts < 55000);
    const dot = (on)=> `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${on?'#36c46f':'rgba(244,236,214,.3)'};margin-inline-end:7px;${on?'box-shadow:0 0 6px #36c46f':''}"></span>`;
    const fem = (name)=> name==="ضحى";
    const pOnline = online(pr.partner);
    const meTxt = "متصل"+(fem(cn.me)?"ة":"")+" الآن";
    const pTxt = pr.partner ? (pOnline ? ("متصل"+(fem(cn.partner)?"ة":"")+" الآن") : lastSeenAr(pr.partner)) : "ما ظهرش بعد";
    box.innerHTML = `<div style="color:rgba(244,236,214,.85)">${dot(true)}${esc(cn.me)}: ${meTxt}</div>`
                  + `<div style="color:rgba(244,236,214,.85)">${dot(pOnline)}${esc(cn.partner)}: ${esc(pTxt)}</div>`;
  }
  function openDrawer(){ renderDrawer(); document.getElementById("drawerBg").hidden=false; const d=document.getElementById("drawer"); requestAnimationFrame(()=>{ d.classList.add("open"); document.getElementById("drawerBg").classList.add("open"); }); document.body.style.overflow="hidden"; }
  function closeDrawer(){ const d=document.getElementById("drawer"), bg=document.getElementById("drawerBg"); if(d) d.classList.remove("open"); if(bg){ bg.classList.remove("open"); setTimeout(()=>{ if(bg) bg.hidden=true; },260); } document.body.style.overflow=""; }

  // ---------- الإشعارات + الشات العائم ----------
  function applyBadges(){
    const u = S.updates || {count:0, chatUnread:0};
    const nb = document.getElementById("ntfBadge");
    if(nb){ if(u.count){ nb.hidden=false; nb.textContent = u.count>99?"99+":String(u.count); } else nb.hidden=true; }
    const fb = document.getElementById("fabBadge");
    if(fb){ if(u.chatUnread){ fb.hidden=false; fb.textContent = u.chatUnread>99?"99+":String(u.chatUnread); } else fb.hidden=true; }
  }
  function syncShell(){
    const fab = document.getElementById("fab");
    const showFab = !!S.token && S.view!=="chat" && S.view!=="pinlock" && S.view!=="onboarding";
    if(fab) fab.hidden = !showFab;
    if(!showFab && S.fabOpen) closeFab();
    applyBadges();
  }
  function notifMeta(it){
    const who = coupleNames().partner;
    const trunc = (t)=> t ? (t.length>42? t.slice(0,42)+"…" : t) : "";
    if(it.kind==="chat") return { ic:"💌", tx:`${who} بعتتلك رسالة`+(it.text?`: «${trunc(it.text)}»`:""), target:"chat" };
    if(it.kind==="resChat") return { ic:"🎬", tx:`${who} كتبت في نقاش «${it.title||"حلقة"}»`+(it.text?`: «${trunc(it.text)}»`:""), target:"resChat", res:it.resourceId };
    const p = it.path||[]; const k = (p[0]||"")+(p[2]?"/"+p[2]:"");
    const M = {
      "resources":{ic:"📚",tx:"أضافت موردًا",target:"library"},
      "resources/full":{ic:"📚",tx:"أضافت موردًا",target:"library"},
      "resources/questions":{ic:"💬",tx:"أضافت أسئلة نقاش",target:"discussions"},
      "resources/progress":{ic:"▶️",tx:"حدّثت تقدّمها في مادة",target:"mutabaana"},
      "resources/notes":{ic:"📝",tx:"حفظت ملاحظة",target:"library"},
      "resources/summary":{ic:"🤖",tx:"ولّدت ملخصًا",target:"library"},
      "questions/responses":{ic:"✍️",tx:"ردّت على سؤال",target:"discussions"},
      "questions/reveal":{ic:"👀",tx:"كشفت إجابات سؤال",target:"discussions"},
      "questions/force-reveal":{ic:"👀",tx:"كشفت إجابات سؤال",target:"discussions"},
      "decisions":{ic:"⚡",tx:"سجّلت قرارًا",target:"decisionlog"},
      "decisions/confirm":{ic:"🤝",tx:"أكّدت قرارًا",target:"decisionlog"},
      "decisions/reviewed":{ic:"🔁",tx:"راجعت قرارًا",target:"decisionlog"},
      "charter":{ic:"📜",tx:"أضافت لميثاقكم",target:"charter"},
      "charter/delete":{ic:"📜",tx:"عدّلت الميثاق",target:"charter"},
      "tasks":{ic:"🗒️",tx:"أضافت مهمة",target:"tasks"}, "tasks/toggle":{ic:"✔️",tx:"حدّثت مهمة",target:"tasks"},
      "budget":{ic:"💰",tx:"أضافت بند ميزانية",target:"budget"}, "budget/pay":{ic:"💵",tx:"سجّلت دفعة",target:"budget"},
      "shopping":{ic:"🛒",tx:"أضافت للمشتريات",target:"shopping"},
      "wishes":{ic:"🌠",tx:"أضافت أمنية",target:"connect"}, "gratitude":{ic:"🤲",tx:"أضافت امتنانًا",target:"connect"},
      "safespace":{ic:"🕊️",tx:"أضافت لصندوق التفاهم",target:"connect"}, "keys":{ic:"🗝️",tx:"أضافت مفتاحًا",target:"connect"},
      "mood":{ic:"🌤️",tx:"حدّثت مزاجها",target:"connect"}, "focus":{ic:"📌",tx:"غيّرت مادتكم الحالية",target:"home"},
    };
    const m = M[k] || M[p[0]] || {ic:"🔔",tx:"عملت تحديث",target:"home"};
    return { ic:m.ic, tx:`${who} ${m.tx}`+(it.title?` · ${it.title}`:""), target:m.target, res:it.resourceId };
  }
  function renderNotifPanel(){
    const panel = document.getElementById("ntfPanel"); if(!panel) return;
    const u = S.updates || {items:[]};
    const items = u.items || [];
    const timeAr = (ts)=> new Date(ts).toLocaleString("ar-EG",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"});
    let body = `<div class="ntf-head"><span>🔔 إشعارات ${esc(coupleNames().partner)}</span><span class="spacer" style="flex:1"></span><button class="dw-x" data-act="closeNotif" aria-label="إغلاق" style="background:none;border:0;font-size:17px;cursor:pointer;color:var(--muted)">✕</button></div>`;
    if(!items.length){ body += `<div class="ntf-empty">مفيش جديد من ${esc(coupleNames().partner)} 🌿</div>`; }
    else body += items.map(it=>{ const m=notifMeta(it);
      return `<button class="ntf-item" data-act="notifGo" data-target="${esc(m.target)}" data-res="${esc(m.res||"")}">
        <span class="ntf-ic">${m.ic}</span>
        <span class="ntf-tx">${esc(m.tx)}<div class="ntf-tm">${timeAr(it.createdAt)}</div></span></button>`;
    }).join("");
    panel.innerHTML = body;
  }
  function openNotif(){
    renderNotifPanel();
    const bg=document.getElementById("ntfBg"), p=document.getElementById("ntfPanel");
    if(bg) bg.hidden=false; if(p) p.hidden=false;
    api("POST","/updates/read",{}).catch(()=>{});
    if(S.updates) S.updates.count=0; applyBadges();
  }
  function closeNotif(){ const bg=document.getElementById("ntfBg"), p=document.getElementById("ntfPanel"); if(bg) bg.hidden=true; if(p) p.hidden=true; }
  function renderFab(){
    const panel = document.getElementById("fabPanel"); if(!panel) return;
    const st = partnerStatus();
    panel.innerHTML = `<div class="fab-head">
        <span class="fab-dot" style="background:${st.online?'#36c46f':'rgba(255,255,255,.4)'};${st.online?'box-shadow:0 0 6px #36c46f':''}"></span>
        <div><div class="fh-name">${esc(st.name)}</div><div class="fh-sub">${esc(st.txt)}</div></div>
        <button class="fh-x" data-act="closeFab" aria-label="إغلاق">✕</button>
      </div>
      <div class="fab-body" id="chatScroll"><div class="empty">…تحميل</div></div>
      <div class="fab-foot" id="chatComposer"></div>`;
  }
  function openFab(){
    if(S.fabOpen) return;
    S.fabOpen = true;
    const bg=document.getElementById("fabBg"); if(bg) bg.hidden=false;
    const p=document.getElementById("fabPanel"); if(p) p.hidden=false;
    renderFab(); renderComposer(); _chatSig=""; loadChat();
    try{ history.pushState({sakanFab:true}, ""); _fabHist=true; }catch(_){ _fabHist=false; }
    if(_fabPoll) clearInterval(_fabPoll);
    _fabPoll = setInterval(()=>{ if(!S.fabOpen){ clearInterval(_fabPoll); _fabPoll=null; return; } loadChat(); }, 10000);
  }
  function closeFab(fromPop){
    if(!S.fabOpen && !_fabHist) return;
    S.fabOpen=false;
    const p=document.getElementById("fabPanel"); if(p) p.hidden=true;
    const bg=document.getElementById("fabBg"); if(bg) bg.hidden=true;
    if(_fabPoll){ clearInterval(_fabPoll); _fabPoll=null; }
    applyBadges();
    // لو الإغلاق مش جاي من زر الباك، نشيل حالة الـ history اللي دفعناها
    if(_fabHist){ _fabHist=false; if(!fromPop){ try{ history.back(); }catch(_){} } }
  }

  // ---------- header ----------
  function renderBar(){
    const b = document.getElementById("barActions");
    if(b){
      if(S.token){
        const QA=[["home","الرئيسية"],["journeys","قوائمنا"],["library","المكتبة"],["discussions","المناقشات"],["decisionlog","القرارات"]];
        const u = S.updates || {count:0};
        const bell = `<button class="qa-bell" data-act="toggleNotif" aria-label="الإشعارات" title="الإشعارات" style="position:relative;background:none;border:0;font-size:19px;cursor:pointer;line-height:1;padding:4px">🔔<span class="badge" id="ntfBadge" ${u.count?'':'hidden'}>${u.count>99?'99+':(u.count||0)}</span></button>`;
        b.innerHTML = `<div class="qa">`+QA.map(([a,l])=>`<button class="qa-link ${S.view===a?'on':''}" data-act="${a}">${l}</button>`).join("")+`</div>`
          + bell
          + `<div class="qa-theme" role="group" aria-label="السمة"><button data-set-theme="light" title="فاتح">☀️</button><button data-set-theme="dark" title="داكن">🌙</button></div>`;
      } else b.innerHTML = "";
    }
    const bn = document.getElementById("brandName");
    if(bn){ const idx = S.token ? (/ضحى|ضحي/.test(S.name||"")?1:(/مصطف/.test(S.name||"")?2:0)) : 0; const src = idx? document.querySelector('#nameAssets [data-ni="'+idx+'"]') : null; bn.innerHTML = src? src.outerHTML : ""; }
    const hb = document.querySelector(".hamburger"); if(hb) hb.style.display = S.token ? "flex" : "none";
    renderDrawer();
    markTheme();
    syncShell();
  }
  function markTheme(){
    const cur = document.documentElement.getAttribute("data-theme")||"light";
    document.querySelectorAll(".themesw button, .qa-theme button").forEach(x=>x.classList.toggle("on", x.dataset.setTheme===cur));
  }
  function applyTheme(t){
    document.documentElement.setAttribute("data-theme", t);
    try{ localStorage.setItem("sakan_theme", t); }catch(e){}
    markTheme();
  }

