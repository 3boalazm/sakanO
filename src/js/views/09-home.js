// ===== سكن · الرئيسية (home) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderHome(){
    S.view="home"; S.resourceId=null;
    el.innerHTML = greetHero()
      + `<div id="focusBox"></div>`
      + `<div class="card tight"><div class="eyebrow">نعمة النهارده</div>
          <div class="row" style="margin-top:4px"><input id="homeGrat" type="text" placeholder="نعمة من بيتنا نشكر الله عليها…"></div>
          <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addGratHome">أضِف للامتنان</button></div></div>`
      + `<div id="loops"><div class="empty">…تحميل</div></div>`;
    try{
      const [items, foc] = await Promise.all([api("GET","/resources"), api("GET","/focus")]);
      const fb = document.getElementById("focusBox");
      if(foc.focus){ const r=foc.focus; fb.innerHTML = `
        <div class="card res" data-open="${esc(r.id)}" style="border-color:var(--brand-gold)">
          <div style="display:flex;gap:14px;align-items:center;flex:1;min-width:0">
            ${ r.thumbnail ? `<img src="${esc(r.thumbnail)}" alt="" loading="lazy" style="width:104px;height:62px;object-fit:cover;border-radius:10px;flex:none">` : "" }
            <div style="min-width:0"><div class="eyebrow" style="margin-bottom:2px">📌 مادتنا دلوقتي</div><h2 style="margin:0">${ytMark(r)}${esc(r.title)}</h2></div>
          </div>
          <div style="display:flex;gap:6px;flex:none;align-items:center">${dualProg(r.prog)}</div></div>
        <div class="actions" style="margin:-6px 0 16px"><span class="spacer"></span><button class="linkbtn" data-act="clearFocus">إزالة التركيز</button></div>`;
      }
      const open = items.filter(r=> r.prog && r.prog.mine==='in_progress');
      const box = document.getElementById("loops");
      if(!open.length){ box.innerHTML = `<div class="empty">مفيش حلقات إنت متابعها دلوقتي 🌿 ابدأ مادة من «متابعتنا» أو المكتبة وهتظهر هنا.</div>`; return; }
      box.innerHTML = `<div class="eyebrow" style="margin-bottom:10px">حلقات مفتوحة — اللي إنت متابعها</div>` + open.slice(0,20).map(r=>`
        <div class="card res" data-open="${esc(r.id)}">
          <div style="display:flex;gap:14px;align-items:center;flex:1;min-width:0">
            ${ r.thumbnail ? `<img src="${esc(r.thumbnail)}" alt="" loading="lazy" style="width:104px;height:62px;object-fit:cover;border-radius:10px;flex:none">` : "" }
            <div style="min-width:0"><h2 style="margin:0">${ytMark(r)}${esc(r.title)}</h2><div class="meta" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.link?esc(r.link):"بدون رابط"}</div></div>
          </div>
          ${dualProg(r.prog)}
        </div>`).join("");
    }catch(e){ document.getElementById("loops").innerHTML = `<div class="empty">${esc(errMsg(e))}</div>`; }
  }

