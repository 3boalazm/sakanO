// ===== سكن · الدخول/الإنشاء (onboarding) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  function authField(ico, id, type, ph, val, eye){
    return `<div class="auth-field"><span class="af-ico">${ico}</span>`
      + `<input id="${id}" type="${type}" ${type==='email'?'inputmode="email"':''} placeholder="${ph}" value="${val||''}">`
      + (eye?`<button class="af-eye" data-act="togglePw" data-for="${id}" aria-label="إظهار">👁️</button>`:'')
      + `</div>`;
  }
  function renderOnboarding(){
    const mode = S.authMode || "login";
    const em = esc(S.email||"");
    const tabs = `<div class="auth-tabs">
      <button class="auth-tab ${mode==='login'?'on':''}" data-act="authMode" data-m="login">تسجيل الدخول</button>
      <button class="auth-tab ${mode!=='login'?'on':''}" data-act="authMode" data-m="signup">حساب جديد</button></div>`;
    let body;
    if(mode==="login"){
      body = authField("📧","emailL","email","الإيميل",em)
        + authField("🔒","pwL","password","الباسوورد","",true)
        + `<button class="auth-btn" data-act="login">دخول</button>`
        + `<p class="auth-hint">أول مرة معانا؟ <a href="#" data-act="authMode" data-m="signup">اعمل حساب جديد</a></p>`;
    } else if(mode==="join"){
      body = `<p class="auth-hint" style="margin:0 0 12px">معاك كود من شريكك؟ ادخل بياناتك وانضم لنفس الميثاق.</p>`
        + authField("🙂","nameJ","text","اسمك (مثلًا: ضحى)")
        + authField("🔑","codeJ","text","كود الميثاق")
        + authField("📧","emailJ","email","الإيميل")
        + authField("🔒","pwJ","password","الباسوورد","",true)
        + `<button class="auth-btn ghost" data-act="join">انضمام للميثاق</button>`
        + `<p class="auth-hint"><a href="#" data-act="authMode" data-m="signup">← رجوع لإنشاء حساب جديد</a></p>`;
    } else { // signup (first time, partner A)
      body = `<p class="auth-hint" style="margin:0 0 12px">ابدأ مساحتكم، وهتاخد كود تشاركه مع شريكك لينضم.</p>`
        + authField("🙂","nameC","text","اسمك (مثلًا: مصطفى)")
        + authField("📧","emailC","email","الإيميل")
        + authField("🔒","pwC","password","باسوورد (٤ حروف على الأقل)","",true)
        + `<button class="auth-btn" data-act="create">إنشاء ميثاقنا</button>`
        + `<p class="auth-hint">معاك كود شريكك؟ <a href="#" data-act="authMode" data-m="join">انضم بيه</a></p>`;
    }
    el.innerHTML = `<div class="auth">
      <div class="auth-brand"><div class="auth-logo">سكن</div><p class="auth-tag">مساحتنا إحنا الاتنين بس — نتعلّم، نتناقش، ونتفق.</p></div>
      <div class="auth-card">${tabs}${body}</div>
      <p class="auth-foot">خاصّة بطبيعتها · من غير مشاركة عامة 🌿</p>
      <button class="linkbtn auth-api" data-act="apiedit">تغيير عنوان الخادم</button>
    </div>`;
  }

