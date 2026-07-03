// ===== سكن · المكتبة + تفاصيل المورد (library/resource) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  const APP_URL = location.origin;
  const NB_PROMPT = `أنت تعمل كمحلل محتوى خبير لمشروع «سكن»، نظام تشغيل خاص للأزواج يهدف لتعزيز التوافق (Alignment) عبر التعلّم المنظّم والنقاش الهادف وتوثيق القرارات. مهمتك: تحويل المحتوى المقدَّم (رابط فيديو أو نص) إلى معرفة منظّمة وقابلة للتطبيق ومحفّزة للنقاش بين الزوجين.

قواعد «سكن»: الزوجان أولًا · الخصوصية أساس · كل مورد يولّد نقاشًا · كل نقاش يولّد قرارًا · لا ميزات اجتماعية · القرارات أهم من الملاحظات.

أخرِج بالضبط بهذا التنسيق (Markdown):

## [عنوان الفيديو]

### 1. ملخص تحليلي مفصل
(الفكرة المحورية، البنية الرئيسية، الحجج والأدلة، الخلاصة. حتى 300 كلمة.)

### 2. أهم الأفكار والدروس
(7–10 نقاط، كل نقطة مبدأ يمكن للزوجين التأمل فيه وتطبيقه.)

### 3. أسئلة للنقاش العميق بين الزوجين
(5–7 أسئلة مفتوحة تشجّع على التأمل الذاتي، تبادل وجهات النظر، كشف التوقعات، تحديد التوافق/الاختلاف، والتخطيط. تجنّب أسئلة نعم/لا.)

### 4. تطبيقات عملية متعددة الأوجه
(5–8 تطبيقات: أفعال فردية، أنشطة زوجية مشتركة، ونقاط لاتخاذ القرار.)`;

  function resCard(r){
    return `<div class="card res" data-open="${esc(r.id)}">
      <div style="display:flex;gap:14px;align-items:center;flex:1;min-width:0">
        ${ r.thumbnail ? `<img src="${esc(r.thumbnail)}" alt="" loading="lazy" style="width:104px;height:62px;object-fit:cover;border-radius:10px;flex:none">` : `<span style="font-size:22px;flex:none">${TYPE_ICON[r.type]||"📄"}</span>` }
        <div style="min-width:0"><h2 style="margin:0;font-size:17px">${ytMark(r)}${esc(r.title)}</h2><div class="meta" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.link?esc(r.link):"بدون رابط"}</div></div>
      </div>
      <div style="display:flex;gap:6px;flex:none;align-items:center">${r.priority?`<span class="pill warn">${PRIO_AR[r.priority]||esc(r.priority)}</span>`:""}${dualProg(r.prog)}</div>
    </div>`;
  }
  function doSearch(q, items, questions, decisions){
    const box=document.getElementById("searchResults"), list=document.getElementById("list"), lc=document.getElementById("libListWrap");
    q=(q||"").trim().toLowerCase();
    if(!q){ if(box) box.innerHTML=""; if(lc) lc.style.display=""; return; }
    if(lc) lc.style.display="none";
    const hit=(s)=> String(s||"").toLowerCase().includes(q);
    const ri=items.filter(r=> hit(r.title)||hit(r.speaker)||hit(r.purpose)||hit(r.link));
    const qi=(questions||[]).filter(x=> hit(x.text));
    const di=(decisions||[]).filter(x=> hit(x.title)||hit(x.context)||hit(x.summary));
    let html="";
    if(ri.length) html += `<div class="eyebrow" style="margin-top:14px">موارد (${ri.length})</div>`+ri.map(resCard).join("");
    if(qi.length) html += `<div class="eyebrow" style="margin-top:16px">أسئلة نقاش (${qi.length})</div>`+qi.map(x=>`<div class="card res" data-openq="${esc(x.resourceId)}"><div style="flex:1;min-width:0">💬 ${esc(x.text)}</div></div>`).join("");
    if(di.length) html += `<div class="eyebrow" style="margin-top:16px">قرارات (${di.length})</div>`+di.map(x=>`<div class="card res" data-act="decisionlog"><div style="flex:1;min-width:0">✅ ${esc(x.title||x.context||"قرار")}</div></div>`).join("");
    if(!html) html = `<div class="empty" style="margin-top:12px">مفيش نتائج لـ «${esc(q)}».</div>`;
    if(box) box.innerHTML = html;
  }

  async function renderLibrary(){
    S.view="library"; S.resourceId=null;
    el.innerHTML = pageTitle("المكتبة","كل موادنا في مكان واحد — دوّر، أضِف، وتابعوا تقدّم بعض.")
    + `<div class="card"><div class="eyebrow">بحث في كل حاجة</div>
        <div class="row" style="margin-top:4px"><input id="libSearch" type="search" placeholder="دوّر في الموارد، أسئلة النقاش، والقرارات…"></div>
        <div id="searchResults"></div></div>`
    + `<div class="card"><div class="eyebrow">إضافة</div><h2 style="margin:2px 0 0">أضِف موردًا</h2>
        <details class="hintbox">
          <summary>إزاي نجهّز المورد بالظبط؟ (NotebookLM)</summary>
          <ol style="margin:10px 0 0; padding-inline-start:20px; line-height:2; font-size:13.5px">
            <li>افتح <b>NotebookLM</b> وحط رابط الفيديو كـ <b>Source</b>.</li>
            <li>اضغط «انسخ البرومت» تحت والصقه في NotebookLM.</li>
            <li>هيطلّعلك: ملخّص + أهم الأفكار + أسئلة نقاش + تطبيقات عملية.</li>
            <li>الصق كل قسم في خانته تحت — وهنحفظهم جاهزين للحوار والقرار.</li>
          </ol>
          <div class="actions" style="margin-top:10px; gap:8px; flex-wrap:wrap">
            <button class="btn soft sm" data-act="copyPrompt">📋 انسخ البرومت</button>
            <a class="btn ghost sm" href="https://notebooklm.google.com" target="_blank" rel="noopener">افتح NotebookLM ↗</a>
            <button class="btn ghost sm" data-act="copyAppUrl">🔗 انسخ رابط التطبيق</button>
          </div>
        </details>
        <div class="row"><label>العنوان</label><input id="rTitle" type="text" placeholder="مثلًا: حتى ترضى"></div>
        <div class="row"><label>الرابط (يوتيوب / تيليجرام)</label><input id="rLink" type="text" placeholder="https://..."></div>
        <div class="row"><label>الملخّص</label><textarea id="rSummary" placeholder="الصق الملخّص من NotebookLM…"></textarea></div>
        <div class="row"><label>أهم الأفكار <span class="muted">(سطر لكل فكرة)</span></label><textarea id="rInsights" placeholder="فكرة في كل سطر…"></textarea></div>
        <div class="row"><label>أسئلة النقاش <span class="muted">(سطر لكل سؤال)</span></label><textarea id="rQuestions" placeholder="سؤال في كل سطر…"></textarea></div>
        <div class="row"><label>تطبيقات عملية <span class="muted">(سطر لكل تطبيق)</span></label><textarea id="rApps" placeholder="تطبيق في كل سطر…"></textarea></div>
        <button class="btn" data-act="addRes">أضِف المورد</button></div>`
    + `<div id="libListWrap">
        <div class="eyebrow" style="margin-top:24px">موادنا <span class="muted" id="libCount"></span></div>
        <p class="muted" style="margin:-2px 0 10px;font-size:13px">الشارة <b>أنا / شريكي</b> بتوريكم مين سمع إيه ووصل لفين.</p>
        <div id="list"><div class="empty">…تحميل</div></div></div>`
    + `<details class="card" style="margin-top:18px"><summary style="cursor:pointer;font-weight:700;color:var(--primary-ink)">استيراد سريع لروابط كتير</summary>
        <p class="muted" style="margin-top:8px;font-size:13px">سطر لكل مورد. تقدر تكتب الرابط لوحده، أو تنظّمه كده: <b>العنوان | الرابط | المصدر</b> (المصدر اختياري).</p>
        <div class="row"><textarea id="bulk" placeholder="ألف باء الزواج – مشكلة الزواج | https://youtu.be/... | د. عبد الرحمن الهاشمي&#10;https://youtu.be/..." style="min-height:110px"></textarea></div>
        <button class="btn ghost" data-act="importBulk">استورد الكل</button></details>`;
    try{
      const [items, questions, decisions] = await Promise.all([api("GET","/resources"), api("GET","/questions").catch(()=>[]), api("GET","/decisions").catch(()=>[])]);
      items.sort((a,b)=> (PRIO_W[a.priority]??1)-(PRIO_W[b.priority]??1) || (hasYt(b)-hasYt(a)) || (b.createdAt-a.createdAt));
      const cnt=document.getElementById("libCount"); if(cnt) cnt.textContent="("+items.length+")";
      const list=document.getElementById("list");
      if(list) list.innerHTML = items.length ? items.map(resCard).join("") : `<div class="empty">لسه مفيش موارد. استورد المنهج من «قوائمنا» أو ضيف مورد فوق.</div>`;
      const si=document.getElementById("libSearch");
      if(si) si.addEventListener("input", ()=> doSearch(si.value, items, questions||[], decisions||[]));
    }catch(e){ const l=document.getElementById("list"); if(l) l.innerHTML = `<div class="empty">${esc(errMsg(e))}</div>`; }
  }

  async function renderResource(){
    el.innerHTML = `<div class="empty">…تحميل</div>`;
    try{ S.detail = await api("GET","/resources/"+S.resourceId); }
    catch(e){ el.innerHTML = `<div class="empty">${esc(errMsg(e))}</div><button class="btn ghost" data-act="library">رجوع</button>`; return; }
    const r = S.detail.resource;
    const emb = ytEmbed(r.link);
    const pg = r.prog || {mine:'not_started',partner:'not_started'};
    const pgBtn = (v,lbl)=>`<button data-act="setProg" data-val="${v}" style="width:auto;padding:0 11px" class="${pg.mine===v?'on':''}">${lbl}</button>`;
    const prBtn = (v,lbl)=>`<button data-act="setPrio" data-val="${v}" style="width:auto;padding:0 11px" class="${r.priority===v?'on':''}">${lbl}</button>`;
    const curCat = catOf(r);
    const ctBtn = (v,lbl)=>`<button data-act="setCat" data-val="${v}" style="width:auto;padding:0 11px" class="${curCat===v?'on':''}">${lbl}</button>`;
    el.innerHTML = `
      <button class="linkbtn" data-act="library">→ المكتبة</button>
      <h1 class="display" style="margin-top:8px">${ytMark(r)}${esc(r.title)}</h1>
      <div class="card tight" style="display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center">
        <span class="muted" style="flex:none">متابعتي:</span>
        <div class="themesw">${pgBtn('not_started','لم أبدأ')}${pgBtn('in_progress','أشاهد')}${pgBtn('completed','أنهيت ✓')}</div>
        <span class="muted" style="flex:none">شريكي:</span> ${progPill(pg.partner,'شريكي')}
        <span class="spacer"></span>
        <span class="muted" style="flex:none">الأولوية:</span>
        <div class="themesw">${prBtn('high','عالية')}${prBtn('medium','متوسطة')}${prBtn('later','لاحقًا')}</div>
        <button class="btn soft sm" data-act="setFocus" style="flex:none">📌 مادتنا دلوقتي</button>
      </div>
      <div class="card tight" style="display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center">
        <span class="muted" style="flex:none">وصلت عند:</span>
        <input id="posInput" type="text" inputmode="numeric" placeholder="مثال: ٢٣:١٥ أو 1:23:45" value="${esc(pg.minePos||'')}" style="flex:1;min-width:120px;max-width:220px">
        <button class="btn sm" data-act="savePos" style="flex:none;width:auto;padding:0 13px">حفظ</button>
        ${pg.minePos?`<button class="linkbtn" data-act="clearPos" style="flex:none">مسح</button>`:""}
        <span class="spacer" style="flex:1"></span>
        <span class="muted" style="flex:none;font-size:12.5px">شريكي: ${pg.partnerPos?`⏱ <b>${esc(pg.partnerPos)}</b>`:"<span style=\"opacity:.6\">لسه ما سجّلش</span>"}</span>
      </div>
      <div class="card tight" style="display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center">
        <span class="muted" style="flex:none">التصنيف:</span>
        <div class="themesw">${CATS.map(c=>ctBtn(c.id,c.ico+' '+c.title)).join("")}</div>
      </div>
      ${ emb ? `<div style="margin-top:14px;border-radius:var(--radius-sm);overflow:hidden;aspect-ratio:16/9;background:#000"><iframe src="${emb}" style="width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div>`
            : (r.link ? `<div style="margin-top:8px"><a class="linkbtn" href="${esc(r.link)}" target="_blank" rel="noopener">فتح المصدر ↗</a></div>` : "") }
      <div class="tabs">
        <button class="tab ${S.tab==='summary'?'active':''}" data-tab="summary">الملخص</button>
        <button class="tab ${S.tab==='discussion'?'active':''}" data-tab="discussion">الحوار</button>
        <button class="tab ${S.tab==='chat'?'active':''}" data-tab="chat">💬 دردشة</button>
        <button class="tab ${S.tab==='notes'?'active':''}" data-tab="notes">ملاحظات</button>
        <button class="tab ${S.tab==='decisions'?'active':''}" data-tab="decisions">القرارات</button>
      </div>
      <div id="tab"></div>`;
    if(S.tab==="summary") renderSummary();
    else if(S.tab==="discussion") renderDiscussion();
    else if(S.tab==="chat") renderResChat();
    else if(S.tab==="notes") renderNotes();
    else renderDecisions();
  }
  function ytEmbed(link){
    link = link||"";
    const v = link.match(/(?:youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|[?&]v=)([\w-]{6,})/);
    if(v) return "https://www.youtube.com/embed/"+v[1];
    const p = link.match(/[?&]list=([\w-]+)/);
    if(p) return "https://www.youtube.com/embed/videoseries?list="+p[1];
    return null;
  }
  async function renderNotes(){
    const t = document.getElementById("tab");
    t.innerHTML = `<div class="empty">…تحميل</div>`;
    let n; try{ n = await api("GET","/resources/"+S.resourceId+"/notes"); }catch(e){ t.innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; return; }
    t.innerHTML = `
      <div class="card"><div class="eyebrow">ملاحظات مشتركة</div>
        <p class="muted" style="margin-top:-6px">نشوفها ونعدّلها إحنا الاتنين.</p>
        <textarea id="sharedNote" placeholder="نقاط اتفقتوا تكتبوها سوا…">${esc(n.shared)}</textarea>
        <div class="actions" style="margin-top:8px"><span class="spacer"></span><button class="btn sm" data-act="saveSharedNote">احفظ المشتركة</button></div></div>
      <div class="card"><div class="eyebrow">ملاحظاتك الخاصة</div>
        <p class="muted" style="margin-top:-6px">تظهر لك وحدك.</p>
        <textarea id="privNote" placeholder="تأملاتك الخاصة حول هذا المورد…">${esc(n.mine)}</textarea>
        <div class="actions" style="margin-top:8px"><span class="spacer"></span><button class="btn sm" data-act="savePrivateNote">احفظ الخاصة</button></div></div>`;
  }

  function renderSummary(){
    const t = document.getElementById("tab");
    const sum = S.detail.summary;
    t.innerHTML = `
      <div class="card">
        <div class="eyebrow">الملخص</div>
        ${ sum ? `<p style="white-space:pre-wrap">${esc(sum.content)}</p>`
               : `<p class="muted">لم يُولَّد ملخص بعد. سيُولّده الذكاء الاصطناعي من نص المصدر (هو فقط يلخّص ويقترح الأسئلة — القرار لينا إحنا بس).</p>` }
        <div class="actions" style="margin-top:12px">
          <button class="btn ${sum?'ghost':''}" data-act="genSummary">${sum?'إعادة التوليد':'وَلِّد الملخص'}</button>
        </div>
      </div>
      <div class="card tight">
        <div class="actions"><span class="muted">جاهزين للحوار؟</span><div class="spacer"></div>
        <button class="btn soft" data-act="goDiscuss">يلا نبدأ الحوار ←</button></div>
      </div>`;
  }

  async function renderDiscussion(){
    const t = document.getElementById("tab");
    const qs = S.detail.questions || [];
    if(!qs.length){
      t.innerHTML = `<div class="card"><div class="eyebrow">الحوار</div>
        <p class="muted">لا توجد أسئلة بعد. ولِّد أسئلة نقاش من الملخص، أو أضِف سؤالك الخاص.</p>
        <div class="actions" style="margin-top:10px">
          <button class="btn" data-act="genQuestions">وَلِّد أسئلة للنقاش</button>
        </div></div>
        <div class="card tight"><div class="row"><label>أضِف سؤالًا بنفسك</label><input id="qNew" type="text" placeholder="اكتب سؤالًا…"></div><button class="btn ghost sm" data-act="addQ">أضِف السؤال</button></div>`;
      return;
    }
    t.innerHTML = `<div id="qs"><div class="empty">…تحميل الإجابات</div></div>
      <div class="card tight"><div class="row"><label>أضِف سؤالًا</label><input id="qNew" type="text" placeholder="اكتب سؤالًا…"></div><button class="btn ghost sm" data-act="addQ">أضِف السؤال</button></div>`;
    // load each question's responses
    const data = await Promise.all(qs.map(q=> api("GET","/questions/"+q.id+"/responses").then(r=>({q,r})).catch(()=>({q,r:{questionState:q.state,mine:null,partner:null}}))));
    document.getElementById("qs").innerHTML = data.map(({q,r})=>{
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
    }).join("");
  }

