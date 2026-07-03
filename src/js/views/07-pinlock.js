// ===== سكن · قفل الـ PIN (pinlock) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  function renderPinLock(){
    S.view="pinlock";
    document.body.classList.add("pre-auth");
    const bg = document.getElementById("app");

    const step = S.pinStep || "lock";
    const who  = S.pinWho;  // "m" | "d" | null

    // ---- Who-select (first time, no device owner set) ----
    if(step==="whoselect" || (!who && step==="lock")){
      S.pinStep="whoselect";
      const svg1 = getNameSVG("d");
      const svg2 = getNameSVG("m");
      bg.innerHTML = `<div class="pin-screen">
        <div class="pin-logo">سكن</div>
        <p class="pin-sub">من بيستخدم الجهاز ده؟</p>
        <div class="pin-who-select">
          <button class="pin-who-btn ${S.pinWhoSel==='d'?'sel':''}" data-act="pinWhoSel" data-w="d">
            ${svg1||'<span class="pin-who-name" style="font-size:28px;font-family:ThmanyahSerifDisplay,serif">ضحى</span>'}
            <span class="pin-who-name">ضحى</span>
          </button>
          <button class="pin-who-btn ${S.pinWhoSel==='m'?'sel':''}" data-act="pinWhoSel" data-w="m">
            ${svg2||'<span class="pin-who-name" style="font-size:28px;font-family:ThmanyahSerifDisplay,serif">مصطفى</span>'}
            <span class="pin-who-name">مصطفى</span>
          </button>
        </div>
        ${S.pinWhoSel?`<button class="auth-btn" style="max-width:340px" data-act="pinWhoConfirm">تأكيد</button>`:""}
        <p class="pin-hint" style="margin-top:18px"><a href="#" data-act="pinSkip">تخطّي القفل وادخل مباشرة ←</a></p>
      </div>`;
      return;
    }

    // ---- Setup flow: enter PIN twice ----
    if(step==="setup1" || step==="setup2"){
      const label = step==="setup1" ? "أنشئ كود PIN جديد (٤ أرقام)" : "أكّد الكود تاني";
      const svg   = getNameSVG(who);
      const entry = S.pinEntry||"";
      bg.innerHTML = `<div class="pin-screen">
        <div class="pin-logo">سكن</div>
        ${svg?`<div class="pin-name-svg">${svg}</div>`:""}
        <div class="pin-card">
          <p class="pin-setup-label">${label}</p>
          <div class="pin-dots" id="pinDots">
            ${[0,1,2,3].map(i=>`<div class="pin-dot${i<entry.length?' fill':''}"></div>`).join("")}
          </div>
          <div class="pin-grid">${pinGridHTML()}</div>
          <p class="pin-err" id="pinErr"></p>
        </div>
        <p class="pin-hint" style="margin-top:18px"><a href="#" data-act="pinSkip">تخطّي الإعداد</a></p>
      </div>`;
      return;
    }

    // ---- Lock screen: enter PIN to unlock ----
    const svg  = getNameSVG(who);
    const name = who==="m" ? "مصطفى" : who==="d" ? "ضحى" : "";
    const entry = S.pinEntry||"";
    bg.innerHTML = `<div class="pin-screen">
      <div class="pin-logo">سكن</div>
      ${svg?`<div class="pin-name-svg">${svg}</div>`:""}
      <div class="pin-card">
        <p class="pin-setup-label" style="margin-bottom:8px">أهلًا${name?" "+name:""}، ادخل الكود</p>
        <div class="pin-dots" id="pinDots">
          ${[0,1,2,3].map(i=>`<div class="pin-dot${i<entry.length?' fill':''}"></div>`).join("")}
        </div>
        <div class="pin-grid">${pinGridHTML()}</div>
        <p class="pin-err" id="pinErr"></p>
      </div>
      <p class="pin-hint" style="margin-top:18px"><a href="#" data-act="pinForgot">نسيت الكود؟</a></p>
    </div>`;
  }

  function pinGridHTML(){
    const keys = ["١","٢","٣","٤","٥","٦","٧","٨","٩","","٠","⌫"];
    return keys.map((k,i)=>{
      if(k==="") return `<div></div>`;
      if(k==="⌫") return `<button class="pin-key del" data-act="pinKey" data-k="del">⌫</button>`;
      const digit = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"].indexOf(k).toString();
      return `<button class="pin-key" data-act="pinKey" data-k="${digit}">${k}</button>`;
    }).join("");
  }

  function pinUpdateDots(entry){
    const dots = document.querySelectorAll(".pin-dot");
    dots.forEach((d,i)=>{ d.classList.toggle("fill", i<entry.length); });
  }

  function pinShakeDots(){
    const dots = document.querySelectorAll(".pin-dot");
    dots.forEach(d=>{ d.classList.add("shake"); setTimeout(()=>d.classList.remove("shake"),500); });
  }

  function pinHandleKey(k){
    const step = S.pinStep||"lock";
    if(k==="del"){ S.pinEntry=(S.pinEntry||"").slice(0,-1); pinUpdateDots(S.pinEntry); return; }
    S.pinEntry=(S.pinEntry||"")+k;
    pinUpdateDots(S.pinEntry);
    if(S.pinEntry.length<4) return;

    // ---- 4 digits entered ----
    const pin = S.pinEntry;
    S.pinEntry="";

    if(step==="setup1"){
      S.pinSetup1=pin; S.pinStep="setup2"; renderPinLock(); return;
    }
    if(step==="setup2"){
      if(pin!==S.pinSetup1){
        pinShakeDots();
        const e=document.getElementById("pinErr"); if(e) e.textContent="الكودان مش متطابقَين، حاول تاني";
        S.pinStep="setup1"; S.pinSetup1="";
        setTimeout(()=>renderPinLock(),700); return;
      }
      localStorage.setItem(PIN_KEY, pinHash(pin));
      document.body.classList.remove("pre-auth");
      S.pinStep="lock"; S.view="home"; render(); return;
    }
    if(step==="lock"){
      if(pinCorrect(pin)){
        document.body.classList.remove("pre-auth");
        S.pinStep="lock"; S.view="home"; render(); return;
      }
      pinShakeDots();
      const e=document.getElementById("pinErr"); if(e) e.textContent="كود غلط — حاول تاني";
      setTimeout(()=>pinUpdateDots(""),700);
    }
  }

  // ========== QuickNotes (مفكّرتنا) ==========
  // localStorage helpers — بتشتغل من غير backend
