// ===== سكن · البحث (search) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderSearch(){
    S.view="search"; S.resourceId=null;
    el.innerHTML = pageTitle("بحث","دوّر في كل حاجة في سكن — موارد، أسئلة نقاش، قرارات، ومهام.")
      + `<div class="card"><div class="row"><input id="gSearch" type="search" placeholder="اكتب اللي بتدوّر عليه…" value="${esc(S.searchQ||"")}"></div></div>`
      + `<div id="gResults"><div class="empty">اكتب كلمة للبحث.</div></div>`;
    let data;
    try{ const [items,questions,decisions,tasks] = await Promise.all([api("GET","/resources"),api("GET","/questions").catch(()=>[]),api("GET","/decisions").catch(()=>[]),api("GET","/tasks").catch(()=>[])]); data={items,questions,decisions,tasks}; }
    catch(e){ const b=document.getElementById("gResults"); if(b) b.innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; return; }
    const run = (q)=>{
      q=(q||"").trim().toLowerCase(); const box=document.getElementById("gResults"); if(!box) return;
      if(!q){ box.innerHTML=`<div class="empty">اكتب كلمة للبحث.</div>`; return; }
      const hit=s=>String(s||"").toLowerCase().includes(q);
      const ri=data.items.filter(r=>hit(r.title)||hit(r.speaker)||hit(r.link));
      const qi=data.questions.filter(x=>hit(x.text));
      const di=data.decisions.filter(x=>hit(x.title)||hit(x.context)||hit(x.summary));
      const ti=data.tasks.filter(x=>hit(x.title));
      let html="";
      if(ri.length) html+=`<div class="eyebrow" style="margin-top:14px">موارد (${ri.length})</div>`+ri.map(r=>`<div class="card res" data-open="${esc(r.id)}"><div style="flex:1;min-width:0">${ytMark(r)}${esc(r.title)}${r.speaker?` <span class="muted">· ${esc(r.speaker)}</span>`:""}</div>${dualProg(r.prog)}</div>`).join("");
      if(qi.length) html+=`<div class="eyebrow" style="margin-top:16px">أسئلة نقاش (${qi.length})</div>`+qi.map(x=>`<div class="card res" data-openq="${esc(x.resourceId)}"><div style="flex:1;min-width:0">💬 ${esc(x.text)}</div></div>`).join("");
      if(di.length) html+=`<div class="eyebrow" style="margin-top:16px">قرارات (${di.length})</div>`+di.map(x=>`<div class="card res" data-act="decisionlog"><div style="flex:1;min-width:0">✅ ${esc(x.title||x.context||"قرار")}</div></div>`).join("");
      if(ti.length) html+=`<div class="eyebrow" style="margin-top:16px">مهام (${ti.length})</div>`+ti.map(x=>`<div class="card res" data-act="tasks"><div style="flex:1;min-width:0">🗒️ ${esc(x.title)}</div></div>`).join("");
      box.innerHTML = html || `<div class="empty" style="margin-top:12px">مفيش نتائج لـ «${esc(q)}».</div>`;
    };
    const gi=document.getElementById("gSearch");
    if(gi){ gi.addEventListener("input",()=>run(gi.value)); if(S.searchQ) run(S.searchQ); gi.focus(); }
  }

  // ========== PIN Lock ==========
  function getNameSVG(who){
    // who: "m"=مصطفى(ni=2), "d"=ضحى(ni=1)
    const ni = who==="m" ? 2 : who==="d" ? 1 : 0;
    if(!ni) return "";
    const src = document.querySelector('#nameAssets [data-ni="'+ni+'"]');
    return src ? src.outerHTML : "";
  }

