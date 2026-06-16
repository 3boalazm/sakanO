// ===== سكن · قوائمنا (journeys) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderJourneys(){
    S.view="journeys"; S.resourceId=null;
    if(!S.playlist) S.playlist="youtube";
    el.innerHTML = pageTitle("قوائمنا","منهجنا مقسوم على ٤ مراحل: الخطوبة، مرحلة الجواز، ما بعد الجواز، والتربية.") + `<div id="jBody"><div class="empty">…تحميل</div></div>`;
    try{
      const items = await api("GET","/resources");
      const seeded = items.some(r=>r.seed);
      const counts = { youtube: items.filter(r=>srcOf(r)==="youtube").length, telegram: items.filter(r=>srcOf(r)==="telegram").length };
      let html = "";
      // زر استيراد المنهج — ظاهر دائمًا (يستورد لو لسه، وبيقول مستورد لو خلاص)
      html += `<div class="card" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
        <div style="flex:1;min-width:180px"><div class="eyebrow">${seeded?"منهجنا":"ابدأ الرحلة"}</div>
          <p class="muted" style="margin:2px 0 0;font-size:13px">${seeded?"المنهج مستورد. تقدر تعيد الاستيراد لإضافة أي جديد.":"استورد دورات وكتب التأهيل دفعة واحدة، جاهزة للحوار والقرارات."}</p></div>
        <button class="btn accent" data-act="seedCurriculum">${seeded?"تحديث المنهج":"استورد المنهج"}</button></div>`;
      // محوّل القائمة (يوتيوب / تيليجرام)
      html += `<div class="pl-seg" role="group" aria-label="القائمة">
        <button class="${S.playlist==='youtube'?'on':''}" data-act="setPlaylist" data-pl="youtube"><span class="pl-ic">▶</span> يوتيوب <span class="pl-n">${counts.youtube}</span></button>
        <button class="${S.playlist==='telegram'?'on':''}" data-act="setPlaylist" data-pl="telegram"><span class="pl-ic tg">✈</span> تيليجرام <span class="pl-n">${counts.telegram}</span></button></div>`;
      html += `<p class="muted" style="margin:6px 2px 0;font-size:12.5px">📍 الشارة <b>أنا / شريكي</b> على كل مادة بتوريكم مين سمعها ووصل لفين.</p>`;
      const inList = items.filter(r=> srcOf(r)===S.playlist);
      if(!inList.length){
        html += `<div class="empty">مفيش موارد في قائمة ${S.playlist==='youtube'?'يوتيوب':'تيليجرام'} لسه.</div>`;
      } else {
        for(const c of CATS){
          const inCat = inList.filter(r=> catOf(r)===c.id)
            .sort((a,b)=> (PRIO_W[a.priority]??1)-(PRIO_W[b.priority]??1) || (a.order||999)-(b.order||999) || (a.createdAt-b.createdAt));
          if(!inCat.length) continue;
          const done = inCat.filter(r=> r.prog && r.prog.mine==='completed' && r.prog.partner==='completed').length;
          html += `<div class="cat-h"><span class="cat-ic">${c.ico}</span><div><div class="cat-t">${esc(c.title)}</div><div class="cat-s">${esc(c.theme)} — <b>${done}/${inCat.length}</b> خلّصناه معًا</div></div></div>`
            + inCat.map(r=>`<div class="card res" data-open="${esc(r.id)}">
                <div style="display:flex;gap:12px;align-items:center;flex:1;min-width:0">
                  <span style="font-size:22px;flex:none">${TYPE_ICON[r.type]||"📄"}</span>
                  <div style="min-width:0"><h2 style="margin:0;font-size:17px">${ytMark(r)}${esc(r.title)}</h2>
                  <div class="meta">${r.speaker?esc(r.speaker)+" · ":""}${r.episodes?esc(r.episodes)+" حلقة":""}</div></div>
                </div>
                <div style="display:flex;gap:6px;flex:none;align-items:center">${r.priority?`<span class="pill warn">${PRIO_AR[r.priority]||esc(r.priority)}</span>`:""}${dualProg(r.prog)}</div>
              </div>`).join("");
        }
      }
      document.getElementById("jBody").innerHTML = html;
    }catch(e){ document.getElementById("jBody").innerHTML = `<div class="empty">${esc(errMsg(e))}</div>`; }
  }



  // ---------- متابعتنا: تتبّع التقدّم الثنائي على المراحل (phase 3) ----------
