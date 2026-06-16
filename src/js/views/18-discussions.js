// ===== سكن · كل المناقشات (discussions) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderDiscussionsAll(){
    S.view="discussions"; S.resourceId=null;
    el.innerHTML = pageTitle("المناقشات","كل الأسئلة من موادنا في مكان واحد.") + `<div id="dscBody"><div class="empty">…تحميل</div></div>`;
    try{
      const [qs, res] = await Promise.all([api("GET","/questions"), api("GET","/resources")]);
      const titles = Object.fromEntries(res.map(r=>[r.id, r.title]));
      const body=document.getElementById("dscBody");
      if(!qs.length){ body.innerHTML=`<div class="empty">لسه مفيش أسئلة. افتح موردًا وولّد منه أسئلة نقاش.</div>`; return; }
      const byRes={}; qs.forEach(q=>{ (byRes[q.resourceId]=byRes[q.resourceId]||[]).push(q); });
      body.innerHTML = Object.keys(byRes).map(rid=>`<div class="eyebrow" style="margin-top:20px">${esc(titles[rid]||"مورد")}</div>`
        + byRes[rid].map(q=>`<div class="card res" data-openq="${esc(rid)}">
            <div style="flex:1;min-width:0"><p style="margin:0">${esc(q.text)}</p></div>
            <span class="pill dot ${['revealed','decided'].includes(q.state)?'':'warn'}" style="flex:none">${STATE_AR[q.state]||esc(q.state)}</span>
          </div>`).join("")).join("");
    }catch(e){ document.getElementById("dscBody").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; }
  }

