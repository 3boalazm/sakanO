// ===== سكن · قرارات المورد (decisions) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  const CAT_AR = { general:"عام", financial:"مالي", family:"عائلي", life:"حياتي" };
  function decCard(d, opts){
    const inResource = opts && opts.inResource;
    return `<div class="card">
        <div class="eyebrow">قرار${d.category?` · ${CAT_AR[d.category]||esc(d.category)}`:""}</div>
        <p style="font-family:'El Messiri',serif; font-size:18px; margin:0 0 ${(d.context||d.reviewDate)?'6':'10'}px">${esc(d.statement)}</p>
        ${d.context?`<p class="muted" style="font-size:13.5px;margin:0 0 8px">السياق: ${esc(d.context)}</p>`:""}
        ${d.reviewDate?`<p class="muted" style="font-size:13px;margin:0 0 8px">📅 مراجعة: ${esc(d.reviewDate)}${d.reviewed?' · تمت':''}</p>`:""}
        <div class="actions">
          <span class="pill dot ${d.state==='confirmed'?'':'warn'}" style="${d.state==='confirmed'?'background:var(--accent-soft);color:#7c4b5b':''}">${STATE_AR[d.state]||esc(d.state)} ${d.confirmCount?('· '+d.confirmCount+'/2'):''}</span>
          ${ inResource && d.state!=="confirmed" ? `<button class="btn accent sm" data-act="confirm" data-d="${esc(d.id)}">أؤكّد موافقتي</button>` : (d.state==="confirmed"? `<span class="muted" style="font-size:13px">مؤكَّد من كليكما.</span>`:"") }
          ${ (d.state==="confirmed" && !d.reviewed) ? `<button class="btn ghost sm" data-act="reviewDec" data-d="${esc(d.id)}">تمت المراجعة</button>` : "" }
        </div>
      </div>`;
  }

  function renderDecisions(){
    const t = document.getElementById("tab");
    const decs = S.detail.decisions || [];
    const qs = (S.detail.questions||[]).filter(q=> q.state==="revealed" || q.state==="decided");
    const list = decs.length ? decs.map(d=> decCard(d,{inResource:true})).join("") : `<div class="empty">لا قرارات بعد. القرار هو ثمرة الحوار — سجّلاه بعد أن تكشفا إجاباتكما.</div>`;

    t.innerHTML = list + `
      <div class="card">
        <div class="eyebrow">تسجيل قرار</div>
        <h2>على إيه اتفقنا؟</h2>
        ${ qs.length ? `
        <div class="row"><label>صياغة القرار</label><textarea id="dStmt" placeholder="مثلًا: اتفقنا على تخصيص ليلة أسبوعية للحوار."></textarea></div>
        <div class="row"><label>السياق (اختياري)</label><textarea id="dContext" placeholder="إيه اللي أدّى للقرار ده؟"></textarea></div>
        <div class="row"><label>التصنيف</label>
          <div class="themesw" id="dCat" role="group" style="border-radius:12px;flex-wrap:wrap">
            <button type="button" data-cat="general" class="on" style="width:auto;padding:6px 12px">عام</button>
            <button type="button" data-cat="financial" style="width:auto;padding:6px 12px">مالي</button>
            <button type="button" data-cat="family" style="width:auto;padding:6px 12px">عائلي</button>
            <button type="button" data-cat="life" style="width:auto;padding:6px 12px">حياتي</button></div></div>
        <div class="row"><label>تاريخ مراجعة (اختياري)</label><input id="dReview" type="text" placeholder="2026-12-01"></div>
        <label>اربط القرار بالأسئلة التي ناقشتماها</label>
        <div class="checks">${qs.map(q=>`<label><input type="checkbox" class="dq" value="${esc(q.id)}"><span>${esc(q.text)}</span></label>`).join("")}</div>
        <button class="btn" data-act="createDec">سجّل القرار (مسودّة)</button>
        <p class="muted" style="font-size:12.5px; margin-top:10px">القرار يبقى نهائي بس لما نأكّده إحنا الاتنين.</p>
        ` : `<p class="muted">اكشفا سؤالًا واحدًا على الأقل في تبويب الحوار أولًا، ثم عودا لتسجيل قراركما.</p>` }
      </div>`;
  }

  // ========== رحلتي ==========
