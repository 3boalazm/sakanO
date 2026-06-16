  async function go(act, node){
    try{
      if(act==="authMode"){ S.authMode=node.dataset.m; renderOnboarding(); return; }
      if(act==="togglePw"){ const i=document.getElementById(node.dataset.for); if(i){ i.type = i.type==="password"?"text":"password"; node.textContent = i.type==="password"?"👁️":"🙈"; } return; }
      if(act==="apiedit"){
        const v = prompt("عنوان الخادم (API base):", API());
        if(v){ localStorage.setItem("sakan_api", v.trim().replace(/\/$/,"")); render(); }
        return;
      }
      if(act==="login"){
        const email=(document.getElementById("emailL").value||"").trim();
        const pw=(document.getElementById("pwL").value||"");
        if(!email||!pw) return toast("اكتب الإيميل والباسوورد");
        const out = await api("POST","/login",{ email, password:pw });
        S.token=out.token; S.code=out.pairCode||null; S.name=out.displayName||null; S.email=email; save(); S.view="home"; render();
        toast("أهلًا بيك تاني 🌿"); return;
      }
      if(act==="create"){
        const name = (document.getElementById("nameC").value||"").trim();
        const email=(document.getElementById("emailC").value||"").trim();
        const pw=(document.getElementById("pwC").value||"");
        if(!email||!pw) return toast("اكتب الإيميل والباسوورد");
        const out = await api("POST","/pair",{ email, password:pw, displayName:name||"أنا" });
        S.token=out.token; S.code=out.pairCode; S.name=out.displayName||name; S.email=email; save(); S.view="home"; render();
        toast("تم إنشاء الميثاق — شارك الكود "+out.pairCode); return;
      }
      if(act==="join"){
        const name=(document.getElementById("nameJ").value||"").trim();
        const code=(document.getElementById("codeJ").value||"").trim().toUpperCase();
        const email=(document.getElementById("emailJ").value||"").trim();
        const pw=(document.getElementById("pwJ").value||"");
        if(!code) return toast("أدخل الكود");
        if(!email||!pw) return toast("اكتب الإيميل والباسوورد");
        const out = await api("POST","/pair/join",{ code, email, password:pw, displayName:name||"أنا" });
        S.token=out.token; S.code=out.pairCode||null; S.name=out.displayName||name; S.email=email; save(); S.view="home"; render();
        toast("انضممت إلى الميثاق"); return;
      }
      if(act==="logout") return logout();
      if(act==="library"){ S.view="library"; S.tab="summary"; render(); return; }

      if(act==="setProg"){ await api("PUT","/resources/"+S.resourceId+"/progress",{ status:node.dataset.val }); renderResource(); return; }
      if(act==="savePos"){ const v=(document.getElementById("posInput")||{}).value||""; await api("PUT","/resources/"+S.resourceId+"/position",{ position:v }); toast("اتسجّلت نقطة التوقّف ⏱"); renderResource(); return; }
      if(act==="clearPos"){ await api("PUT","/resources/"+S.resourceId+"/position",{ position:"" }); toast("اتمسحت نقطة التوقّف"); renderResource(); return; }
      if(act==="sendResMsg"){ const ta=document.getElementById("rcInput"); const v=((ta&&ta.value)||"").trim(); if(!v) return; await api("POST","/resources/"+S.resourceId+"/chat",{ text:v }); if(ta){ ta.value=""; } _rcSig=""; loadResChat(); return; }
      if(act==="delResMsg"){ await api("POST","/resources/"+S.resourceId+"/chat/"+node.dataset.id+"/delete"); _rcSig=""; loadResChat(); return; }
      if(act==="regenCode"){
        if(!confirm("إعادة توليد كود الإقران:\n\n• هتفصل شريكك الحالي وتلغي وصوله (جلساته وحسابه القديم).\n• هيحتاج ينضم من جديد بالكود الجديد.\n• الكود لمرّة واحدة وبيتمسح بعد ما ينضم.\n\nمتأكد إنك عايز تكمّل؟")) return;
        const out=await api("POST","/pair/regenerate",{}); S.code=out.pairCode; save(); toast("اتولّد كود إقران جديد — شاركه مع شريكك للانضمام"); render(); return;
      }
      if(act==="mutabaana"){ S.view="mutabaana"; render(); return; }
      if(act==="setProgId"){ await api("PUT","/resources/"+node.dataset.res+"/progress",{ status:node.dataset.val }); _mtbSig=""; loadMutabaana(); return; }
      if(act==="mtbFilter"){ S.mtbFilter=node.dataset.f; renderMutabaanaBody(_mtbItems); return; }
      if(act==="setPrio"){ await api("PUT","/resources/"+S.resourceId+"/priority",{ priority:node.dataset.val }); toast("اتحدّثت الأولوية"); renderResource(); return; }
      if(act==="setCat"){ await api("PUT","/resources/"+S.resourceId+"/category",{ category:node.dataset.val }); toast("اتحدّث التصنيف"); renderResource(); return; }
      if(act==="setPlaylist"){ S.playlist=node.dataset.pl; renderJourneys(); return; }

      if(act==="addRes"){
        const title=(document.getElementById("rTitle").value||"").trim();
        if(!title) return toast("اكتب عنوان المورد");
        const link=(document.getElementById("rLink").value||"").trim();
        const summary=(document.getElementById("rSummary").value||"").trim();
        const insights=(document.getElementById("rInsights").value||"").trim();
        const questions=(document.getElementById("rQuestions").value||"").trim();
        const applications=(document.getElementById("rApps").value||"").trim();
        await api("POST","/resources/full",{ title, link:link||null, summary, insights, questions, applications });
        toast("أُضيف المورد ✦"); renderLibrary(); return;
      }
      if(act==="copyPrompt"){ try{ await navigator.clipboard.writeText(NB_PROMPT); toast("اتنسخ البرومت ✦"); }catch(e){ toast("منعرفش ننسخ — حدّده يدوي"); } return; }
      if(act==="copyAppUrl"){ try{ await navigator.clipboard.writeText(APP_URL); toast("اتنسخ رابط التطبيق"); }catch(e){} return; }
      if(act==="importBulk"){
        const lines=(document.getElementById("bulk").value||"").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
        if(!lines.length) return toast("الصق رابطًا واحدًا على الأقل");
        node.disabled=true; const orig=node.textContent;
        const q=lines.slice(); let done=0, ok=0;
        async function worker(){ while(q.length){ const link=q.shift(); try{ await api("POST","/resources",{ title:titleFromUrl(link), link }); ok++; }catch(e){} done++; node.textContent="…"+done+"/"+lines.length; } }
        await Promise.all(Array.from({length:Math.min(4,lines.length)}, worker));   // 4 at a time → أسرع بكتير
        node.disabled=false; node.textContent=orig;
        toast("تم استيراد "+ok+" من "+lines.length+" — تقدر تعيد تسميتها لاحقًا");
        renderLibrary(); return;
      }
      if(act==="open" || node?.dataset.open){ S.resourceId=node.dataset.open; S.view="resource"; S.tab="summary"; render(); return; }

      if(act==="genSummary"){ await api("POST","/resources/"+S.resourceId+"/summary"); toast("تم توليد الملخص"); renderResource(); return; }
      if(act==="goDiscuss"){ S.tab="discussion"; renderResource(); return; }
      if(act==="genQuestions"){ await api("POST","/resources/"+S.resourceId+"/questions/generate"); toast("تم توليد الأسئلة"); renderResource(); return; }
      if(act==="addQ"){ const txt=(document.getElementById("qNew").value||"").trim(); if(!txt) return toast("اكتب السؤال"); await api("POST","/resources/"+S.resourceId+"/questions",{text:txt}); renderResource(); return; }

      if(act==="saveAns"){
        const q=node.dataset.q; const box=document.querySelector(`.q[data-q="${q}"] .myans`);
        const text=(box.value||"").trim(); if(!text) return toast("اكتب إجابتك");
        await api("PUT","/questions/"+q+"/responses",{text}); toast("حُفظت إجابتك"); renderResource(); return;
      }
      if(act==="reveal"){ await api("POST","/questions/"+node.dataset.q+"/reveal"); toast("انكشفت الإجابتان"); renderResource(); return; }
      if(act==="force"){ if(confirm("الكشف الآن قبل أن يجيب الطرف الآخر؟")){ await api("POST","/questions/"+node.dataset.q+"/force-reveal"); renderResource(); } return; }

      if(act==="createDec"){
        const statement=(document.getElementById("dStmt").value||"").trim();
        if(!statement) return toast("اكتب صياغة القرار");
        const questionIds=[...document.querySelectorAll(".dq:checked")].map(x=>x.value);
        if(!questionIds.length) return toast("اختر سؤالًا واحدًا على الأقل");
        const context=(document.getElementById("dContext").value||"").trim();
        const category=(document.querySelector("#dCat button.on")||{}).dataset?.cat || "general";
        const reviewDate=(document.getElementById("dReview").value||"").trim();
        await api("POST","/decisions",{ resourceId:S.resourceId, statement, questionIds, context:context||null, category, reviewDate:reviewDate||null });
        toast("سُجّل القرار كمسودّة"); renderResource(); return;
      }
      if(act==="confirm"){ await api("POST","/decisions/"+node.dataset.d+"/confirm"); toast("سُجّلت موافقتك"); renderResource(); return; }

      // ---- navigation to new pages ----
      if(act==="home"){ S.view="home"; render(); return; }
      if(act==="journeys"){ S.view="journeys"; render(); return; }
      if(act==="discussions"){ S.view="discussions"; render(); return; }
      if(act==="decisionlog"){ S.view="decisionlog"; render(); return; }
      if(act==="connect"){ S.view="connect"; render(); return; }
      if(act==="myjourney"){ S.view="myjourney"; render(); return; }

      // ---- PIN Lock actions ----
      if(act==="pinKey"){ pinHandleKey(node.dataset.k); return; }
      if(act==="pinWhoSel"){ S.pinWhoSel=node.dataset.w; renderPinLock(); return; }
      if(act==="pinWhoConfirm"){
        const w=S.pinWhoSel; if(!w) return;
        localStorage.setItem(PIN_WHO,w); S.pinWho=w; S.pinWhoSel=null;
        // Check if PIN already set
        if(localStorage.getItem(PIN_KEY)){ S.pinStep="lock"; renderPinLock(); }
        else { S.pinStep="setup1"; S.pinEntry=""; renderPinLock(); }
        return;
      }
      if(act==="pinSkip"){
        // Skip without setting PIN — go straight home
        localStorage.removeItem(PIN_KEY); localStorage.removeItem(PIN_WHO);
        document.body.classList.remove("pre-auth");
        S.pinStep="lock"; S.view="home"; render(); return;
      }
      if(act==="pinForgot"){
        if(!confirm("هتتطلع من الجلسة وتعيد تسجيل الدخول — تكمل؟")) return;
        logout(); return;
      }
      if(act==="clearPin"){
        if(!confirm("هتشيل قفل الـ PIN — أي حد ممسك الموبايل يقدر يدخل. متأكد؟")) return;
        localStorage.removeItem(PIN_KEY); localStorage.removeItem(PIN_WHO);
        S.pinWho=null; toast("اتشال القفل"); renderSettings(); return;
      }
      if(act==="setupPin"){
        // Called from Settings
        S.pinStep="setup1"; S.pinEntry=""; S.pinSetup1="";
        S.view="pinlock"; renderPinLock(); return;
      }
      if(act==="quicknotes"){ S.view="quicknotes"; S.qnPanel="shared"; render(); return; }
      if(act==="qnPanel"){ S.qnPanel=node.dataset.p; renderQuickNotes(); return; }
      if(act==="qnAdd"){ qnDoAdd(node.dataset.scope||"shared"); return; }
      if(act==="qnDel"){ qnDoDel(node.dataset.id, node.dataset.scope||"shared"); return; }
      if(act==="charter"){ S.view="charter"; render(); return; }

      if(act==="addCharter"){ const k=node.dataset.kind; const inp=document.getElementById("ch_"+k); const t=(inp&&inp.value||"").trim(); if(!t) return toast("اكتب حاجة الأول"); await api("POST","/charter",{kind:k,text:t}); renderCharter(); return; }
      if(act==="delCharter"){ await api("POST","/charter/"+node.dataset.id+"/delete"); renderCharter(); return; }
      if(act==="addKey"){ const k=node.dataset.kind; const inp=document.getElementById(k==='soothe'?"keySoothe":"keyAnnoy"); const t=(inp&&inp.value||"").trim(); if(!t) return toast("اكتب مفتاح"); await api("POST","/keys",{kind:k,text:t}); renderConnect(); return; }
      if(act==="delKey"){ await api("POST","/keys/"+node.dataset.id+"/delete"); renderConnect(); return; }
      if(act==="setFocus"){ await api("PUT","/focus",{resourceId:S.resourceId}); toast("بقت مادتنا دلوقتي 📌"); renderResource(); return; }
      if(act==="clearFocus"){ await api("POST","/focus/clear"); renderHome(); return; }
      if(act==="addGratHome"){ const inp=document.getElementById("homeGrat"); const t=(inp&&inp.value||"").trim(); if(!t) return toast("اكتب نعمة"); await api("POST","/gratitude",{text:t}); if(inp) inp.value=""; toast("أضفناها للامتنان 🌿"); return; }

      // ---- phase 5: connection ----
      if(act==="setMood"){ await api("PUT","/mood",{value:node.dataset.v}); renderConnect(); return; }
      if(act==="addWish"){ const t=(document.getElementById("wText").value||"").trim(); if(!t) return toast("اكتب الأمنية"); await api("POST","/wishes",{text:t}); renderConnect(); return; }
      if(act==="toggleWish"){ await api("POST","/wishes/"+node.dataset.id+"/toggle"); renderConnect(); return; }
      if(act==="delWish"){ await api("POST","/wishes/"+node.dataset.id+"/delete"); renderConnect(); return; }
      if(act==="addGrat"){ const t=(document.getElementById("gText").value||"").trim(); if(!t) return toast("اكتب امتنانك"); await api("POST","/gratitude",{text:t}); renderConnect(); return; }
      if(act==="delGrat"){ await api("POST","/gratitude/"+node.dataset.id+"/delete"); renderConnect(); return; }
      if(act==="addCapsule"){ const c=(document.getElementById("capContent").value||"").trim(); if(!c) return toast("اكتب رسالتك"); const d=(document.getElementById("capDate").value||"").trim(); await api("POST","/capsules",{content:c,openDate:d||null}); toast("خُتمت الرسالة"); renderConnect(); return; }
      if(act==="addSafe"){ const topic=(document.getElementById("safeTopic").value||"").trim(); if(!topic) return toast("اكتب الموضوع"); await api("POST","/safespace",{topic,feeling:(document.getElementById("safeFeel").value||"").trim(),need:(document.getElementById("safeNeed").value||"").trim()}); toast("أُضيف للصندوق"); renderConnect(); return; }
      if(act==="safeAddressed"){ await api("POST","/safespace/"+node.dataset.id+"/addressed"); renderConnect(); return; }
      if(act==="seedCurriculum"){ const r=await api("POST","/journey/seed"); toast(r.already? "المنهج مستورد بالفعل" : "تم استيراد "+r.seeded+" موردًا"); renderJourneys(); return; }

      // ---- notes ----
      if(act==="saveSharedNote"){ await api("PUT","/resources/"+S.resourceId+"/notes",{scope:"shared",content:document.getElementById("sharedNote").value}); toast("حُفظت الملاحظة المشتركة"); return; }
      if(act==="savePrivateNote"){ await api("PUT","/resources/"+S.resourceId+"/notes",{scope:"private",content:document.getElementById("privNote").value}); toast("حُفظت ملاحظتك الخاصة"); return; }

      // ---- review a decision ----
      if(act==="reviewDec"){ await api("POST","/decisions/"+node.dataset.d+"/reviewed"); toast("سُجّلت المراجعة"); if(S.view==="resource") renderResource(); else renderDecisionLog(); return; }
      if(act==="tasks"){ S.view="tasks"; render(); return; }
      if(act==="budget"){ S.view="budget"; render(); return; }
      if(act==="shopping"){ S.view="shopping"; render(); return; }
      if(act==="settings"){ S.view="settings"; render(); return; }
      if(act==="chat"){ S.view="chat"; render(); return; }
      if(act==="sendMsg"){
        const ta=document.getElementById("chatInput"); const t=(ta&&ta.value||"").trim();
        if(!t) return;
        if(ta){ ta.value=""; ta.style.height=""; }
        try{
          if(S.chatEdit){ const id=S.chatEdit; S.chatEdit=null; await api("POST","/messages/"+id+"/edit",{ text:t }); }
          else { await api("POST","/messages",{ text:t, replyTo: S.chatReply?S.chatReply.id:null }); }
          S.chatReply=null; _chatSig=""; renderComposer(); await loadChat();
        }catch(e){ if(ta) ta.value=t; toast(errMsg(e)); }
        return;
      }
      if(act==="chatMenu"){ S.chatMenu = (S.chatMenu===node.dataset.id)?null:node.dataset.id; renderChatMsgs(_chatMsgs, _chatPartnerRead, false); return; }
      if(act==="chatReply"){ const m=_chatMsgs.find(x=>x.id===node.dataset.id); if(m) S.chatReply={id:m.id,text:m.text}; S.chatMenu=null; renderChatMsgs(_chatMsgs,_chatPartnerRead,false); renderComposer(); return; }
      if(act==="chatCopy"){ const m=_chatMsgs.find(x=>x.id===node.dataset.id); try{ await navigator.clipboard.writeText(m?m.text:""); toast("اتنسخت الرسالة"); }catch(_){ toast("منعرفش ننسخ"); } S.chatMenu=null; renderChatMsgs(_chatMsgs,_chatPartnerRead,false); return; }
      if(act==="chatEditStart"){ S.chatEdit=node.dataset.id; S.chatReply=null; S.chatMenu=null; renderChatMsgs(_chatMsgs,_chatPartnerRead,false); renderComposer(); return; }
      if(act==="chatDelete"){ S.chatMenu=null; await api("POST","/messages/"+node.dataset.id+"/delete"); _chatSig=""; await loadChat(); return; }
      if(act==="chatCancelCompose"){ S.chatReply=null; S.chatEdit=null; renderComposer(); return; }
      if(act==="doDrawerSearch"){ const v=(document.getElementById("dwSearch")||{}).value||""; S.searchQ=v.trim(); S.view="search"; closeDrawer(); render(); return; }
      if(act==="search"){ S.view="search"; render(); return; }

      // ---- tasks ----
      if(act==="addTask"){
        const title=(document.getElementById("tTitle").value||"").trim(); if(!title) return toast("اكتب المهمة");
        const owner=(document.querySelector("#tOwner button.on")||{}).dataset?.own || "both";
        const due=(document.getElementById("tDue").value||"").trim();
        await api("POST","/tasks",{title,owner,due:due||null}); toast("أُضيفت المهمة"); renderTasks(); return;
      }
      if(act==="toggleTask"){ await api("POST","/tasks/"+node.dataset.id+"/toggle"); reloadTasks(); return; }
      if(act==="delTask"){ await api("POST","/tasks/"+node.dataset.id+"/delete"); reloadTasks(); return; }

      // ---- budget ----
      if(act==="addBudget"){
        const label=(document.getElementById("bLabel").value||"").trim(); if(!label) return toast("اكتب اسم البند");
        const cat=(document.getElementById("bCat").value||"").trim();
        const planned=parseFloat(document.getElementById("bPlanned").value)||0;
        await api("POST","/budget",{label,cat:cat||null,planned}); toast("أُضيف البند"); renderBudget(); return;
      }
      if(act==="payBudget"){ const amt=parseFloat(prompt("قيمة الدفعة:","0"))||0; if(!amt) return; await api("POST","/budget/"+node.dataset.id+"/pay",{amount:amt}); reloadBudget(); return; }
      if(act==="delBudget"){ await api("POST","/budget/"+node.dataset.id+"/delete"); reloadBudget(); return; }

      // ---- shopping ----
      if(act==="addShop"){ const text=(document.getElementById("sText").value||"").trim(); if(!text) return toast("اكتب الصنف"); await api("POST","/shopping",{text}); renderShopping(); return; }
      if(act==="toggleShop"){ await api("POST","/shopping/"+node.dataset.id+"/toggle"); reloadShopping(); return; }
      if(act==="delShop"){ await api("POST","/shopping/"+node.dataset.id+"/delete"); reloadShopping(); return; }

      // ---- settings: export ----
      if(act==="doBackup"){
        try{
          toast("جاري التحضير…");
          const out = await api("GET","/backup");
          const blob = new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
          const link = document.createElement("a"); link.href=URL.createObjectURL(blob);
          link.download = "sakan-backup-"+new Date().toISOString().slice(0,10)+".json"; link.click();
          URL.revokeObjectURL(link.href); toast("اتنزّلت النسخة الاحتياطية ✓");
        }catch(e){ toast(errMsg(e)); }
        return;
      }
      if(act==="doRestore"){ const rf=document.getElementById("restoreFile"); if(rf) rf.click(); return; }
    }catch(e){
      if(e.code==="UNAUTHENTICATED"){ toast(errMsg(e)); return logout(); }
      toast(errMsg(e));
    }
  }

  // ---------- events ----------
  document.body.addEventListener("click",(ev)=>{
    const dw = ev.target.closest("[data-dw]");
    if(dw){ ev.preventDefault(); if(dw.dataset.dw==="open") openDrawer(); else closeDrawer(); return; }
    const ds = ev.target.closest("[data-dwsec]");
    if(ds){ ds.classList.toggle("collapsed"); const g=ds.nextElementSibling; if(g) g.classList.toggle("collapsed"); return; }
    const th = ev.target.closest("[data-set-theme]");
    if(th){ applyTheme(th.dataset.setTheme); return; }
    const a = ev.target.closest("[data-act]");
    if(a){ ev.preventDefault(); if(a.closest("#drawer")) closeDrawer(); return go(a.dataset.act, a); }
    const t = ev.target.closest("[data-tab]");
    if(t){ S.tab=t.dataset.tab; renderResource(); return; }
    const open = ev.target.closest("[data-open]");
    if(open){ S.resourceId=open.dataset.open; S.view="resource"; S.tab="summary"; render(); return; }
    const oq = ev.target.closest("[data-openq]");
    if(oq){ S.resourceId=oq.dataset.openq; S.view="resource"; S.tab="discussion"; render(); return; }
    const cat = ev.target.closest("[data-cat]");
    if(cat){ [...cat.parentElement.children].forEach(x=>x.classList.toggle("on", x===cat)); return; }
  });

  document.getElementById("foot").innerHTML = "سكن · مساحتنا إحنا الاتنين — خاصّة بطبيعتها، من غير مشاركة عامة.";

  // نبضة الحضور: تحدّث آخر ظهوري وتجيب ظهور شريكي (كل ٢٥ث، وتقف لو التطبيق مخفي)
  async function heartbeat(){
    if(!S.token) return;
    try{ S.presence = await api("POST","/presence",{}); renderPresence(); }catch(_){}
  }
  heartbeat();
  setInterval(()=>{ if(document.visibilityState!=="hidden") heartbeat(); }, 25000);
  document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") heartbeat(); });

  render();
})();


})();
