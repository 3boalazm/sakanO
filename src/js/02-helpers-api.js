  // ---------- helpers ----------
  const el = document.getElementById("app");
  const esc = (s)=> String(s==null?"":s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2600); }

  async function api(method, path, body){
    const res = await fetch(API()+path, {
      method,
      headers: Object.assign({"content-type":"application/json"}, S.token?{authorization:"Bearer "+S.token}:{}),
      body: body? JSON.stringify(body): undefined,
    });
    let data=null; try{ data = await res.json(); }catch(e){}
    if(!res.ok){
      const code = data && data.error ? data.error.code : ("HTTP_"+res.status);
      if((code==="UNAUTHENTICATED" || res.status===401) && S.token){
        S.token=null; S.code=null; save(); closeFab(); S.view="onboarding"; render(); toast("انتهت الجلسة — سجّل دخولك تاني");
      }
      const e=new Error(code); e.code=code; e.data=data; throw e;
    }
    return data;
  }
  function errMsg(e){
    const m = {
      FIREBASE_ENV_MISSING:"الخادم غير مهيّأ بعد (متغيّر البيئة ناقص).",
      QUESTION_LOCKED:"السؤال أُغلق بعد الكشف ولا يمكن تعديل الإجابة.",
      STATE_CONFLICT:"لا يمكن الكشف قبل أن تجيبا كلاكما.",
      NO_REVEALED_QUESTION:"اكشفا سؤالًا واحدًا على الأقل قبل تسجيل القرار.",
      NO_QUESTIONS_LINKED:"اختر سؤالًا واحدًا على الأقل للقرار.",
      INVALID_CODE:"الكود غير صحيح أو مُستخدَم.",
      PAIR_FULL:"هذا الميثاق مكتمل بطرفين بالفعل.",
      UNAUTHENTICATED:"انتهت الجلسة، سجّل الدخول من جديد.",
      BAD_CREDENTIALS:"الإيميل أو الباسوورد غلط.",
      EMAIL_TAKEN:"الإيميل ده مستخدم بالفعل — جرّب تسجيل الدخول.",
      ONLY_CREATOR:"إعادة توليد الكود متاحة لمنشئ الميثاق بس (اللي بدأ المساحة).",
      BAD_BACKUP:"ملف النسخة مش صالح أو تالف.",
      BAD_EMAIL:"اكتب إيميل صحيح.",
      WEAK_PASSWORD:"الباسوورد لازم ٤ حروف على الأقل.",
      ALREADY_OPEN:"الرسالة اتبعتت أو وصل تاريخها — مش هينفع تتعدّل.",
      BAD_DATE:"تاريخ غير صالح.",
      EMPTY:"اكتب حاجة الأول.",
    };
    return m[e.code] || ("حدث خطأ: "+(e.code||"غير معروف"));
  }
  function save(){
    if(S.token) localStorage.setItem("sakan_token",S.token); else localStorage.removeItem("sakan_token");
    if(S.code) localStorage.setItem("sakan_code",S.code); else localStorage.removeItem("sakan_code");
    if(S.name) localStorage.setItem("sakan_name",S.name); else localStorage.removeItem("sakan_name");
    if(S.email) localStorage.setItem("sakan_email",S.email); else localStorage.removeItem("sakan_email");
  }
  function titleFromUrl(u){
    try{
      const m = u.match(/[?&]list=([\w-]+)/); if(m) return "قائمة تشغيل · "+m[1].slice(0,8);
      const v = u.match(/(?:youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|[?&]v=)([\w-]{6,})/); if(v) return "فيديو · "+v[1];
    }catch(e){}
    return u.length>44 ? u.slice(0,44)+"…" : u;
  }
  function logout(){
    localStorage.removeItem("sakan_token"); localStorage.removeItem("sakan_code");
    localStorage.removeItem("sakan_name"); localStorage.removeItem(PIN_KEY); localStorage.removeItem(PIN_WHO);
    S.token=S.code=S.name=null; S.pinEntry=""; S.pinWho=null;
    S.view="onboarding"; closeDrawer(); closeFab(); render();
  }

