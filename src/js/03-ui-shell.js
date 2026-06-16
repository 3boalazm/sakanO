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

  // ---------- header ----------
  function renderBar(){
    const b = document.getElementById("barActions");
    if(b){
      if(S.token){
        const QA=[["home","الرئيسية"],["journeys","قوائمنا"],["library","المكتبة"],["discussions","المناقشات"],["decisionlog","القرارات"]];
        b.innerHTML = `<div class="qa">`+QA.map(([a,l])=>`<button class="qa-link ${S.view===a?'on':''}" data-act="${a}">${l}</button>`).join("")+`</div>`
          + `<div class="qa-theme" role="group" aria-label="السمة"><button data-set-theme="light" title="فاتح">☀️</button><button data-set-theme="dark" title="داكن">🌙</button></div>`;
      } else b.innerHTML = "";
    }
    const bn = document.getElementById("brandName");
    if(bn){ const idx = S.token ? (/ضحى|ضحي/.test(S.name||"")?1:(/مصطف/.test(S.name||"")?2:0)) : 0; const src = idx? document.querySelector('#nameAssets [data-ni="'+idx+'"]') : null; bn.innerHTML = src? src.outerHTML : ""; }
    const hb = document.querySelector(".hamburger"); if(hb) hb.style.display = S.token ? "flex" : "none";
    renderDrawer();
    markTheme();
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

