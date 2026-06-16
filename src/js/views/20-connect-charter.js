// ===== سكن · تواصلنا + ميثاقنا (connect/charter) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  const MOOD_OPT = [["great","😍 رائعة"],["good","🙂 جيدة"],["ok","😐 عادية"],["low","😟 متعبة"]];
  const moodLabel = (v)=> (MOOD_OPT.find(m=>m[0]===v)||["","—"])[1];
  async function renderCharter(){
    S.view="charter"; S.resourceId=null;
    el.innerHTML = pageTitle("ميثاقنا","اتفاقاتنا الثابتة اللي نرجعلها وقت الحاجة — من قلبنا ومن منهجنا.") + `<div id="chBody"><div class="empty">…تحميل</div></div>`;
    try{
      const items = await api("GET","/charter");
      const by = k => items.filter(x=>x.kind===k);
      const calm = by("calmword")[0];
      const listBlock = (k, ph) => {
        const arr = by(k);
        return `<div class="row" style="margin-top:4px"><input id="ch_${k}" type="text" placeholder="${ph}"></div>
          <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addCharter" data-kind="${k}">أضِف</button></div>
          ${arr.length? arr.map(it=>`<div class="actions" style="justify-content:space-between;padding:7px 0;border-top:1px solid var(--line)">
            <span style="flex:1">• ${esc(it.text)}</span><button class="linkbtn" data-act="delCharter" data-id="${esc(it.id)}">حذف</button></div>`).join("")
            : `<p class="muted" style="font-size:13px">لسه فاضي.</p>`}`;
      };
      document.getElementById("chBody").innerHTML = `
        <div class="card"><div class="eyebrow">كلمة التهدئة</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">كلمة سرّ بسيطة نقولها أول ما النبرة تبدأ تحتدّ — إشارة نوقف عندها فورًا.</p>
          ${calm? `<div class="codebox" style="font-size:20px;letter-spacing:1px">${esc(calm.text)}</div>
            <div class="actions" style="margin-top:8px"><span class="spacer"></span><button class="linkbtn" data-act="delCharter" data-id="${esc(calm.id)}">تغيير/حذف</button></div>`
          : `<div class="row" style="margin-top:4px"><input id="ch_calmword" type="text" placeholder="مثلًا: القمر 🌙"></div>
            <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addCharter" data-kind="calmword">احفظ الكلمة</button></div>`}</div>

        <div class="card"><div class="eyebrow">ميثاق التغافل</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">الحاجات الصغيرة اللي اتفقنا نعدّي عنها ومنوقفش عندها (الـ20%).</p>
          ${listBlock("tagaful","حاجة نتغافل عنها…")}</div>

        <div class="card"><div class="eyebrow">قواعدنا وقت الخلاف</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">قواعد نلتزم بيها وقت ما نختلف — زي قاعدة الـ24 ساعة، مفيش صمت عقابي، مننامش غاضبين.</p>
          ${listBlock("conflict","قاعدة نلتزم بيها…")}</div>

        <div class="card"><div class="eyebrow">نيّاتنا</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">ليه احنا هنا — النيّات اللي بنعقد عليها بيتنا.</p>
          ${listBlock("niyyah","نيّة من نيّاتنا…")}</div>`;
    }catch(e){ document.getElementById("chBody").innerHTML = `<div class="empty">${esc(errMsg(e))}</div>`; }
  }

  function keyCol(arr, mine){
    if(!arr.length) return `<p class="muted" style="font-size:12.5px">—</p>`;
    return arr.map(k=>`<div style="display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px solid var(--line)">
      <span style="font-size:13.5px">${k.kind==='soothe'?'🌿':'⚠️'} ${esc(k.text)}</span>
      ${mine?`<button class="linkbtn" data-act="delKey" data-id="${esc(k.id)}">حذف</button>`:""}</div>`).join("");
  }

  async function renderConnect(){
    S.view="connect"; S.resourceId=null;
    el.innerHTML = pageTitle("تواصلنا","مساحة لمودّتنا: أمنياتنا، امتناننا، رسايلنا، واللي يصعب قوله.") + `<div id="cBody"><div class="empty">…تحميل</div></div>`;
    try{
      const [wishes,grat,caps,mood,safe,keys] = await Promise.all([
        api("GET","/wishes"), api("GET","/gratitude"), api("GET","/capsules"), api("GET","/mood"), api("GET","/safespace"), api("GET","/keys")
      ]);
      document.getElementById("cBody").innerHTML =
        `<div class="card"><div class="eyebrow">فحص حالتنا الآن</div>
          <div class="actions" style="flex-wrap:wrap;gap:8px;margin-top:6px">
            ${MOOD_OPT.map(([v,l])=>`<button class="btn ${mood.mine===v?'':'ghost'} sm" data-act="setMood" data-v="${v}">${l}</button>`).join("")}</div>
          <p class="muted" style="font-size:13px;margin-top:10px">أنت: <b>${esc(moodLabel(mood.mine))}</b> · شريكك: <b>${mood.partner?esc(moodLabel(mood.partner)):"لم يحدّد بعد"}</b></p></div>

        <div class="card"><div class="eyebrow">قائمة أمنياتنا</div>
          <div class="row"><input id="wText" type="text" placeholder="حاجة نفسنا نعملها سوا…"></div>
          <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addWish">أضِف</button></div>
          ${wishes.length? wishes.map(w=>`<div class="actions" style="justify-content:space-between;padding:6px 0;border-top:1px solid var(--line)">
            <div style="display:flex;align-items:center;gap:8px"><button class="btn ${w.done?'':'ghost'} sm" data-act="toggleWish" data-id="${esc(w.id)}">${w.done?'✓':'○'}</button>
            <span style="${w.done?'text-decoration:line-through;opacity:.6':''}">${esc(w.text)}</span></div>
            <button class="linkbtn" data-act="delWish" data-id="${esc(w.id)}">حذف</button></div>`).join("") : `<p class="muted" style="font-size:13px">ابدأوا بأمنية واحدة.</p>`}</div>

        <div class="card"><div class="eyebrow">مساحة الامتنان</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">اكتب حاجة بتشكر فيها شريك حياتك — نشوفها إحنا الاتنين.</p>
          <div class="row"><input id="gText" type="text" placeholder="ممتنّ لك لأنك…"></div>
          <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addGrat">أضِف</button></div>
          ${grat.length? grat.map(g=>`<div class="actions" style="justify-content:space-between;padding:6px 0;border-top:1px solid var(--line)">
            <span>${esc(g.text)} <span class="pill ${g.mine?'':'warn'}" style="margin-inline-start:6px">${g.mine?'أنا':'شريكي'}</span></span>
            ${g.mine?`<button class="linkbtn" data-act="delGrat" data-id="${esc(g.id)}">حذف</button>`:""}</div>`).join("") : `<p class="muted" style="font-size:13px">امتنان صغير يصنع فرقًا.</p>`}</div>

        <div class="card"><div class="eyebrow">كتالوج المفاتيح</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">كل واحد يكتب مفاتيحه: إيه اللي بيهدّيني وإيه اللي بيضايقني — عشان نتعلّم بعض ونراعي بعض.</p>
          <div class="row" style="margin-top:4px"><label>يهدّيني 🌿</label><input id="keySoothe" type="text" placeholder="بحس بالأمان لما…"></div>
          <div class="actions" style="margin-bottom:4px"><span class="spacer"></span><button class="btn sm" data-act="addKey" data-kind="soothe">أضِف</button></div>
          <div class="row"><label>يضايقني ⚠️</label><input id="keyAnnoy" type="text" placeholder="بضايق لما…"></div>
          <div class="actions"><span class="spacer"></span><button class="btn sm ghost" data-act="addKey" data-kind="annoy">أضِف</button></div>
          <div class="answers" style="margin-top:12px">
            <div><div class="muted" style="font-size:12.5px;margin-bottom:2px">مفاتيحي</div>${keyCol(keys.mine,true)}</div>
            <div><div class="muted" style="font-size:12.5px;margin-bottom:2px">مفاتيح شريكي</div>${keyCol(keys.partner,false)}</div>
          </div></div>

        <div class="card"><div class="eyebrow">رسالة للمستقبل</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">اكتب رسالة لشريكك: تظهرله تلقائيًا بعد تاريخ تختاره، أو تفضل مختومة لحد ما تبعتها بنفسك.</p>
          <div class="row"><textarea id="capContent" placeholder="رسالة لنا بعد سنة…"></textarea></div>
          <div class="row"><label>طريقة الفتح</label>
            <div class="themesw" id="capMode" role="group" style="border-radius:12px">
              <button type="button" data-act="capMode" data-mode="date" class="on" style="width:auto;padding:6px 12px">بتاريخ</button>
              <button type="button" data-act="capMode" data-mode="manual" style="width:auto;padding:6px 12px">أبعتها بنفسي</button></div></div>
          <div class="row" id="capDateWrap"><label>تاريخ الفتح (اختياري)</label><input id="capDate" type="text" placeholder="2027-06-01"></div>
          <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addCapsule">اختِم الرسالة</button></div>
          ${caps.length? caps.map(c=>`<div class="card tight" style="margin-top:8px">
            <div class="actions" style="justify-content:space-between"><span class="pill ${c.mine?'':'warn'}">${c.mine?'رسالتك':'رسالة شريكك'}</span>${c.openDate?`<span class="pill">📅 ${esc(c.openDate)}</span>`:(c.manual?`<span class="pill">✋ تتبعت يدوي</span>`:"")}</div>
            <p style="margin:8px 0 0">${c.sealed?'<span class="muted">🔒 مختومة.</span>':esc(c.content)}</p>
            ${c.canOpen?`<div class="actions" style="margin-top:8px;flex-wrap:wrap;gap:6px">
              <button class="linkbtn" data-act="delCapsule" data-id="${esc(c.id)}">حذف</button>
              <button class="linkbtn" data-act="convCapsule" data-id="${esc(c.id)}" data-to="${c.manual?'date':'manual'}">${c.manual?'حوّلها لفتح بتاريخ':'خلّيها مختومة (أبعتها بنفسي)'}</button>
              <span class="spacer"></span>
              <button class="btn accent sm" data-act="openCapsule" data-id="${esc(c.id)}">${c.manual?'ابعتها لشريكي دلوقتي':'افتحها لشريكي دلوقتي'}</button>
            </div>`:""}</div>`).join("") : ""}</div>

        <div class="card" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <div style="flex:1;min-width:160px"><div class="eyebrow">شاتنا 💌</div>
            <p class="muted" style="margin:2px 0 0;font-size:13px">مساحة دردشة خاصة بينك وبين شريكك.</p></div>
          <button class="btn accent" data-act="chat" style="flex:none">افتح الشات</button></div>
        <div class="card"><div class="eyebrow">صندوق التفاهم</div>
          <p class="muted" style="margin-top:-6px;font-size:13px">اطرح موضوعًا يصعب قوله — بهدوء، وبصيغة المشاعر والاحتياج.</p>
          <div class="row"><label>الموضوع</label><input id="safeTopic" type="text" placeholder="حاجة نفسي نتكلم فيها…"></div>
          <div class="row"><label>أشعر أنّ…</label><input id="safeFeel" type="text" placeholder="بصراحة بحس إن…"></div>
          <div class="row"><label>وأحتاج…</label><input id="safeNeed" type="text" placeholder="محتاج منك…"></div>
          <div class="actions"><span class="spacer"></span><button class="btn sm" data-act="addSafe">ضَعها في الصندوق</button></div>
          ${safe.length? safe.map(x=>`<div class="card tight" style="margin-top:8px">
            <div class="actions" style="justify-content:space-between"><b>${esc(x.topic)}</b><span class="pill ${x.status==='addressed'?'':'warn'} dot">${x.status==='addressed'?'تمت معالجته':'مفتوح'}</span></div>
            ${x.feeling?`<p class="muted" style="font-size:13.5px;margin:6px 0 0">أشعر: ${esc(x.feeling)}</p>`:""}
            ${x.need?`<p class="muted" style="font-size:13.5px;margin:2px 0 0">أحتاج: ${esc(x.need)}</p>`:""}
            <div class="actions" style="margin-top:8px"><span class="pill ${x.mine?'':'warn'}">${x.mine?'مني':'من شريكي'}</span>${x.status!=='addressed'?`<div class="spacer"></div><button class="btn soft sm" data-act="safeAddressed" data-id="${esc(x.id)}">تكلّمنا فيه</button>`:""}</div></div>`).join("") : `<p class="muted" style="font-size:13px">الصندوق فاضي — وده كويس.</p>`}</div>`;
    }catch(e){ document.getElementById("cBody").innerHTML = `<div class="empty">${esc(errMsg(e))}</div>`; }
  }

  // ---------- actions ----------
