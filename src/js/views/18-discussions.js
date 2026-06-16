// ===== سكن · كل المناقشات (discussions) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderDiscussionsAll(){
    S.view="discussions"; S.resourceId=null;
    el.innerHTML = pageTitle("المناقشات","كل الأسئلة من موادنا، وكمان مواضيع نقاش حرّة بينكما.")
      + `<div class="card tight">
           <div class="row"><label>موضوع نقاش جديد</label><input id="topicNew" type="text" placeholder="اطرح موضوعًا للنقاش بينكما…"></div>
           <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addTopic">افتح الموضوع</button></div>
           <p class="muted" style="font-size:12.5px;margin:6px 0 0">موضوع حرّ مش مربوط بمادة — كلٌّ منكما يجاوب، والإجابتان تتكشفان معًا.</p>
         </div>
         <div id="dscBody"><div class="empty">…تحميل</div></div>`;
    try{
      const [qs, res] = await Promise.all([api("GET","/questions"), api("GET","/resources")]);
      const titles = Object.fromEntries(res.map(r=>[r.id, r.title]));
      const body=document.getElementById("dscBody");

      const free = qs.filter(q=> !q.resourceId);
      const bound = qs.filter(q=> q.resourceId);

      // ── مواضيع النقاش الحرّة (تفاعلية داخل الصفحة) ──
      let html = "";
      if(free.length){
        html += `<div class="eyebrow" style="margin-top:20px">💬 مواضيع نقاش حرّة</div>`;
        const data = await Promise.all(free.map(q=> api("GET","/questions/"+q.id+"/responses")
          .then(r=>({q,r})).catch(()=>({q,r:{questionState:q.state,mine:null,partner:null}}))));
        html += data.map(({q,r})=> topicCard(q,r)).join("");
      }

      // ── أسئلة الموارد (روابط تفتح المادة) ──
      if(bound.length){
        const byRes={}; bound.forEach(q=>{ (byRes[q.resourceId]=byRes[q.resourceId]||[]).push(q); });
        html += Object.keys(byRes).map(rid=>`<div class="eyebrow" style="margin-top:20px">${esc(titles[rid]||"مورد")}</div>`
          + byRes[rid].map(q=>`<div class="card res" data-openq="${esc(rid)}">
              <div style="flex:1;min-width:0"><p style="margin:0">${esc(q.text)}</p></div>
              <span class="pill dot ${['revealed','decided'].includes(q.state)?'':'warn'}" style="flex:none">${STATE_AR[q.state]||esc(q.state)}</span>
            </div>`).join("")).join("");
      }

      body.innerHTML = html || `<div class="empty">لسه مفيش أسئلة. افتح موضوعًا حرًّا فوق، أو ولّد أسئلة من مورد.</div>`;
    }catch(e){ document.getElementById("dscBody").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; }
  }

  // كارت موضوع حرّ: نفس فلو الإجابة/الكشف بتاع المورد، بس داخل صفحة المناقشات.
  function topicCard(q, r){
    const st = r.questionState;
    const locked = st==="revealed" || st==="decided";
    const mine = r.mine? r.mine.text : "";
    const partnerCell = (locked && r.partner)
      ? `<div class="ans revealed-glow"><div class="who"><span class="pill" style="background:var(--accent-soft);color:#7c4b5b">الطرف الآخر</span></div><div class="body">${esc(r.partner.text)}</div></div>`
      : `<div class="ans covered"><div class="lock">۝</div><div>إجابة الطرف الآخر مخفية<br>حتى تجيبا كلاكما</div></div>`;
    return `<div class="q" data-q="${esc(q.id)}">
      <p class="qtext">${esc(q.text)}</p>
      <span class="pill dot ${locked?'':'warn'}">${STATE_AR[st]||esc(st)}</span>
      <div class="answers">
        <div class="ans">
          <div class="who">إجابتك</div>
          <textarea class="myans" ${locked?'disabled':''} placeholder="${locked?'':'اكتب إجابتك بصدق…'}">${esc(mine)}</textarea>
          ${locked? '' : `<div style="margin-top:8px"><button class="btn sm" data-act="saveAns" data-q="${esc(q.id)}">احفظ إجابتي</button></div>`}
        </div>
        ${partnerCell}
      </div>
      ${ st==="ready_to_reveal" ? `<div class="actions" style="margin-top:12px"><button class="btn accent sm" data-act="reveal" data-q="${esc(q.id)}">اكشفا الإجابتين معًا</button></div>`
        : (st==="answered_by_one" ? `<div class="actions" style="margin-top:12px"><span class="muted" style="font-size:13px">بانتظار الطرف الآخر…</span><button class="linkbtn" data-act="force" data-q="${esc(q.id)}">اكشف الآن</button></div>` : "") }
    </div>`;
  }
