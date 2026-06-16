// ===== سكن · الإعدادات (settings) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderSettings(){
    S.view="settings"; S.resourceId=null;
    const pinSet = !!localStorage.getItem(PIN_KEY);
    const whoName = devWho()==="m"?"مصطفى":devWho()==="d"?"ضحى":"";
    el.innerHTML = pageTitle("الإعدادات","الخصوصية أولًا. بياناتنا ملكنا.") + `
      <div class="card"><div class="eyebrow">الميثاق</div><p class="muted" style="margin-top:-6px">${S.code ? `كود ميثاقكم: <b>${esc(S.code)}</b> — شاركه مع شريكك مرة واحدة فقط (بيتمسح تلقائيًا بعد ما ينضم، لأمان مساحتكم).` : `تم الإقران ✓ — إنت وشريكك في نفس الميثاق. الكود اتمسح بعد الإقران عشان محدش تاني يقدر يستخدمه — ده مقصود مش عطل.`}</p>
        <div class="actions" style="margin-top:6px"><span class="spacer"></span><button class="btn ghost sm" data-act="regenCode" style="width:auto;color:#c0392b">🔄 إعادة توليد كود الإقران (طوارئ)</button></div>
        <p class="muted" style="font-size:11.5px;margin:6px 0 0;opacity:.8">⚠️ بيفصل شريكك الحالي ويلغي وصوله، وهيحتاج ينضم من جديد بالكود الجديد. استخدمها بس لو حصلت مشكلة في الإقران.</p></div>

      <div class="card">
        <div class="eyebrow">قفل الجهاز 🔐</div>
        <p class="muted" style="margin-top:-6px">
          ${pinSet ? `كود PIN مفعّل على الجهاز ده${whoName?" ("+whoName+")":" "}.` : "مفيش كود PIN على الجهاز ده — الأب مكشوف لأي حد."}
        </p>
        <div class="actions" style="flex-wrap:wrap;gap:8px;margin-top:10px">
          <button class="btn sm" data-act="setupPin">${pinSet?"تغيير الكود":"إعداد كود PIN"}</button>
          ${pinSet?`<button class="btn ghost sm" data-act="clearPin">إزالة القفل</button>`:""}
        </div>
      </div>

      <div class="card"><div class="eyebrow">النسخ الاحتياطي والاسترجاع</div><h2>بياناتنا ملكنا</h2>
        <p class="muted" style="margin-top:-6px">نزّل نسخة كاملة من كل بيانات الميثاق (المكتبة، التقدّم، النقاشات، القرارات، الملاحظات، المهام، الميزانية…) في ملف واحد. احتفظ بيها في مكان آمن — بتنفع لو حصل أي عطل أو لو فتحت حساب جديد.</p>
        <div class="actions" style="flex-wrap:wrap;gap:8px;margin-top:8px">
          <button class="btn" data-act="doBackup">⬇️ نسخة احتياطية كاملة (JSON)</button>
          <button class="btn ghost" data-act="doRestore">⬆️ استرجاع من نسخة</button>
        </div>
        <input type="file" id="restoreFile" accept="application/json,.json" style="display:none">
        <p class="muted" style="font-size:11.5px;margin:8px 0 0;opacity:.85">💡 للاسترجاع الكامل في حساب جديد: اعمل الحساب، خلّي شريكك ينضم بالكود الأول، وبعدين استرجع — عشان تقدّم كل واحد يرجع له صح.</p></div>
      <div class="card"><div class="eyebrow">الحساب</div><div class="actions"><button class="btn ghost" data-act="logout">تسجيل الخروج</button></div></div>`;
    const _rf = document.getElementById("restoreFile");
    if(_rf) _rf.addEventListener("change", onRestoreFile);
  }
  async function onRestoreFile(ev){
    const file = ev.target.files && ev.target.files[0]; if(!file) return;
    let backup;
    try{ backup = JSON.parse(await file.text()); }
    catch(_){ toast("الملف مش صالح (JSON غلط)"); ev.target.value=""; return; }
    if(!backup || backup.app!=="sakan"){ toast("ده مش ملف نسخة بتاعة سكن"); ev.target.value=""; return; }
    const when = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString("ar-EG") : "غير معروف";
    if(!confirm("استرجاع نسخة سكن:\n\n• تاريخ النسخة: "+when+"\n• هتكتب بيانات النسخة فوق الحالية (المعرّفات المتطابقة بتتحدّث).\n• الأفضل تعمله على حساب جديد فاضي.\n\nتكمّل؟")){ ev.target.value=""; return; }
    try{ toast("جاري الاسترجاع…"); const out = await api("POST","/restore",{ backup }); toast("تم الاسترجاع ✓ ("+(out.restored||0)+" عنصر)"); }
    catch(e){ toast(errMsg(e)); ev.target.value=""; return; }
    ev.target.value=""; S.view="home"; render();
  }

