// ===== سكن · متابعتنا (mutabaana) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function loadMutabaana(){
    let items;
    try{ items = await api("GET","/resources"); }
    catch(e){ const b=document.getElementById("mtbBody"); if(b) b.innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; return; }
    // توقيع التقدّم فقط — نعيد الرسم لو اتغيّر حاجة (يمنع وميض كل ١٥ث)
    const sig = items.map(r=>`${r.id}:${(r.prog&&r.prog.mine)||"x"}/${(r.prog&&r.prog.partner)||"x"}@${(r.prog&&r.prog.minePos)||""}~${(r.prog&&r.prog.partnerPos)||""}`).join("|");
    const body = document.getElementById("mtbBody");
    if(sig===_mtbSig && body && body.dataset.ready) return;
    _mtbSig = sig;
    _mtbItems = items;
    renderMutabaanaBody(items);
  }
  function renderMutabaanaBody(items){
    const body = document.getElementById("mtbBody"); if(!body) return;
    const _cn = coupleNames();
    const pct = st => st==="completed"?100:(st==="in_progress"?50:0);
    const mineDone    = items.filter(r=>r.prog&&r.prog.mine==="completed").length;
    const partnerDone = items.filter(r=>r.prog&&r.prog.partner==="completed").length;
    const bothDone    = items.filter(r=>r.prog&&r.prog.mine==="completed"&&r.prog.partner==="completed").length;
    let html = `<div class="card" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:space-around;text-align:center;padding:16px">
      <div><div class="display" style="font-size:26px;margin:0">${items.length}</div><div class="muted" style="font-size:12px">إجمالي المواد</div></div>
      <div><div class="display" style="font-size:26px;margin:0">${bothDone}</div><div class="muted" style="font-size:12px">خلّصناه سوا</div></div>
      <div><div class="display" style="font-size:26px;margin:0">${mineDone}</div><div class="muted" style="font-size:12px">أنا</div></div>
      <div><div class="display" style="font-size:26px;margin:0">${partnerDone}</div><div class="muted" style="font-size:12px">شريكي</div></div>
    </div>`;
    // فلتر بحالة المتابعة: الكل / لم يتم البدء / جاري المشاهدة / تمت المشاهدة (حسب متابعتي)
    const F = S.mtbFilter || "all";
    const chip = (val,lbl)=>{ const a=F===val; return `<button data-act="mtbFilter" data-f="${val}" style="width:auto;padding:6px 13px;border-radius:99px;border:1px solid ${a?'transparent':'var(--line)'};background:${a?'linear-gradient(135deg,var(--brand-mid,#1a5d47),var(--brand-deep,#0e3b2e))':'var(--surface)'};color:${a?'#fff':'var(--ink)'};font:inherit;font-size:12.5px;font-weight:700;cursor:pointer">${lbl}</button>`; };
    html += `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 2px 2px">${chip("all","الكل")}${chip("not_started","لم يتم البدء")}${chip("in_progress","جاري المشاهدة")}${chip("completed","تمت المشاهدة")}</div>`;
    const matchF = (r)=>{ const p=r.prog||{mine:"not_started"}; if(F==="all") return true; return (p.mine||"not_started")===F; };
    const shown = items.filter(matchF);
    // مجمّعة على المراحل الست؛ بلا مرحلة → "أخرى"
    const groups = STAGES.map(s=>({ n:s.n, title:s.title, theme:s.theme, items: shown.filter(r=> Number(r.stage)===s.n) }));
    const noStage = shown.filter(r=> r.stage==null || Number.isNaN(Number(r.stage)));
    if(noStage.length) groups.push({ n:-1, title:"أخرى", theme:"مواد مضافة يدويًا بلا مرحلة.", items:noStage });
    let any=false;
    const barTrack = "flex:1;height:8px;border-radius:99px;background:var(--line);overflow:hidden";
    for(const g of groups){
      if(!g.items.length) continue; any=true;
      const done = g.items.filter(r=>r.prog&&r.prog.mine==="completed"&&r.prog.partner==="completed").length;
      html += `<div class="cat-h"><span class="cat-ic">🗺️</span><div><div class="cat-t">${esc(g.title)}</div><div class="cat-s">${esc(g.theme)} — <b>${done}/${g.items.length}</b> خلّصناه معًا</div></div></div>`;
      const sorted = g.items.slice().sort((a,b)=> (a.order||999)-(b.order||999) || (a.createdAt||0)-(b.createdAt||0));
      for(const r of sorted){
        const p = r.prog || {mine:"not_started",partner:"not_started"};
        const mp = pct(p.mine), pp = pct(p.partner);
        const sBtn = (val,lbl)=>`<button data-act="setProgId" data-res="${esc(r.id)}" data-val="${val}" style="width:auto;padding:0 11px" class="${p.mine===val?"on":""}">${lbl}</button>`;
        const posTag = (pos)=> pos?`<span class="muted" style="flex:none;font-size:11.5px;background:var(--surface);border:1px solid var(--line);border-radius:99px;padding:1px 7px" title="آخر نقطة توقّف">⏱ ${esc(pos)}</span>`:"";
        html += `<div class="card res" data-id="${esc(r.id)}" style="display:block">
          <div data-open="${esc(r.id)}" style="display:flex;gap:10px;align-items:center;min-width:0;cursor:pointer">
            <span style="font-size:20px;flex:none">${TYPE_ICON[r.type]||"📄"}</span>
            <div style="min-width:0;flex:1"><h2 style="margin:0;font-size:16px">${ytMark(r)}${esc(r.title)}</h2>
              <div class="meta">${r.speaker?esc(r.speaker):""}</div></div>
            <span style="flex:none;color:var(--muted);font-size:18px;opacity:.55" aria-hidden="true">‹</span>
          </div>
          <div style="margin:10px 0 8px">
            <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
              <span class="muted" style="flex:none;width:48px;font-size:12px">${esc(_cn.me)}</span>
              <span style="${barTrack}"><i style="display:block;height:100%;width:${mp}%;border-radius:99px;background:linear-gradient(90deg,var(--brand-mid,#1a5d47),var(--brand-deep,#0e3b2e));transition:width .35s"></i></span>
              <span class="muted" style="flex:none;width:34px;text-align:left;font-size:12px">${mp}%</span>
              ${posTag(p.minePos)}
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
              <span class="muted" style="flex:none;width:48px;font-size:12px">${esc(_cn.partner)}</span>
              <span style="${barTrack}"><i style="display:block;height:100%;width:${pp}%;border-radius:99px;background:var(--brand-gold,#c9a14a);transition:width .35s"></i></span>
              <span class="muted" style="flex:none;width:34px;text-align:left;font-size:12px">${pp}%</span>
              ${posTag(p.partnerPos)}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span class="muted" style="flex:none;font-size:12px">متابعتي:</span>
            <div class="themesw">${sBtn("not_started","لم أبدأ")}${sBtn("in_progress","أتابع")}${sBtn("completed","أكملت ✓")}</div>
            <span class="spacer" style="flex:1"></span>
            <button class="linkbtn" data-openq="${esc(r.id)}">💬 مناقشة</button>
          </div>
        </div>`;
      }
    }
    if(!any) html += `<div class="empty">${F==="all"?"لسه مفيش مواد. استورد المنهج من «قوائمنا» الأول 🌿":"مفيش مواد في الفلتر ده."}</div>`;
    body.innerHTML = html;
    body.dataset.ready = "1";
  }
  function renderMutabaana(){
    S.view="mutabaana"; S.resourceId=null;
    el.innerHTML = pageTitle("متابعتنا","شوف إنت و"+coupleNames().partner+" وصلتوا لفين في كل مرحلة — والتحديثات بتظهر تلقائيًا كل شوية 🌿")
      + `<div id="mtbBody"><div class="empty">…تحميل</div></div>`;
    _mtbSig = "";
    loadMutabaana();
    _mtbPoll = setInterval(()=>{ if(S.view!=="mutabaana"){ clearInterval(_mtbPoll); _mtbPoll=null; return; } loadMutabaana(); }, 15000);
  }

  // ---------- شاتنا: محادثة خاصة ١:١ زيّ تيليجرام (server-mediated + polling) ----------
