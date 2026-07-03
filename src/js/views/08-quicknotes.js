// ===== سكن · مفكّرتنا (quicknotes) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  function qnKey(scope){ return "sakan_qn_" + scope + "_" + (S.code||"local"); }
  function qnLoad(scope){ try{ return JSON.parse(localStorage.getItem(qnKey(scope))||"[]"); }catch(e){ return []; } }
  function qnSave(scope, arr){ try{ localStorage.setItem(qnKey(scope), JSON.stringify(arr)); }catch(e){} }
  // للنوتس الخاصة بيك فقط (scope=private), نستخدم uid أيضاً
  function qnKeyPriv(){ return "sakan_qn_private_" + (S.uid||"me"); }
  function qnLoadPriv(){ try{ return JSON.parse(localStorage.getItem(qnKeyPriv())||"[]"); }catch(e){ return []; } }
  function qnSavePriv(arr){ try{ localStorage.setItem(qnKeyPriv(), JSON.stringify(arr)); }catch(e){} }

  async function renderQuickNotes(){
    S.view="quicknotes"; S.resourceId=null;
    const panel = S.qnPanel || "shared";
    const myName = S.name || "أنا";
    const isShared = panel==="shared";

    el.innerHTML = pageTitle("مفكّرتنا","مساحة خاصة لكل منا — ومساحة مشتركة بيننا.")
    + `<div class="qn-tabs">
        <button class="qn-tab ${panel==='shared'?'on':''}" data-act="qnPanel" data-p="shared">🌿 مشتركة</button>
        <button class="qn-tab ${panel==='private'?'on':''}" data-act="qnPanel" data-p="private">🔒 خاصتي</button>
       </div>
       <div id="qnBody"></div>`;

    // Load notes
    const notes = isShared ? qnLoad("shared") : qnLoadPriv();

    const addCard = `
      <div class="qn-glass">
        <p class="qn-panel-label">${isShared?"📌 ملاحظة مشتركة جديدة":"🔒 ملاحظة خاصة بيك فقط"}</p>
        <div class="qn-add-row">
          <input id="qnTitleInp" class="qn-title-inp" placeholder="${isShared?'عنوان الملاحظة المشتركة…':'عنوان ملاحظتك الخاصة…'}" autocomplete="off">
          <textarea id="qnBodyInp" class="qn-input" placeholder="${isShared?'اكتبوا هنا سوا — هيشوفها الاتنين 🌿':'اكتب هنا حاجة خاصة بيك — مش هيشوفها حد غيرك 🔒'}"></textarea>
        </div>
        <div class="actions"><span class="spacer"></span>
          <button class="btn sm" data-act="qnAdd" data-scope="${panel}">+ أضِف ملاحظة</button>
        </div>
      </div>`;

    const noteCards = notes.length
      ? [...notes].reverse().map(n=>`
          <div class="qn-note">
            <div class="actions" style="align-items:flex-start;gap:6px;margin-bottom:0">
              <div style="flex:1">
                <div class="qn-note-title">${esc(n.title||"بدون عنوان")}</div>
                <div class="qn-note-body" style="margin-top:7px">${esc(n.body||"")}</div>
              </div>
              <button class="qn-del" data-act="qnDel" data-id="${esc(n.id)}" data-scope="${panel}" title="حذف">✕</button>
            </div>
            <div class="qn-note-meta">
              ${isShared?`<span class="qn-badge">👥 مشتركة</span>`:`<span class="qn-badge">🔒 خاصتك</span>`}
              ${n.author?`<span>• ${esc(n.author)}</span>`:""}
              ${n.ts?`<span>• ${new Date(n.ts).toLocaleDateString("ar-EG",{day:"numeric",month:"short",year:"numeric"})}</span>`:""}
            </div>
          </div>`).join("")
      : `<p class="empty" style="text-align:center;padding:28px 0">${isShared?"لسه ما فيش ملاحظات مشتركة — ابدأوا بأول واحدة 🌿":"مساحتك الخاصة فاضية — اكتب حاجة ليك إنت بس 🔒"}</p>`;

    document.getElementById("qnBody").innerHTML = addCard + noteCards;
  }

  function qnDoAdd(scope){
    const title=(document.getElementById("qnTitleInp").value||"").trim();
    const body=(document.getElementById("qnBodyInp").value||"").trim();
    if(!body) return toast("اكتب ملاحظتك الأول");
    const note = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), title:title||"ملاحظة", body, author:S.name||"", ts:Date.now() };
    if(scope==="shared"){
      const arr = qnLoad("shared"); arr.push(note); qnSave("shared", arr);
      toast("أُضيفت للمشترك 🌿");
    } else {
      const arr = qnLoadPriv(); arr.push(note); qnSavePriv(arr);
      toast("حُفظت خاصتك 🔒");
    }
    renderQuickNotes();
  }

  function qnDoDel(id, scope){
    if(!confirm("تمسح الملاحظة دي؟")) return;
    if(scope==="shared"){
      const arr = qnLoad("shared").filter(n=>n.id!==id); qnSave("shared", arr);
    } else {
      const arr = qnLoadPriv().filter(n=>n.id!==id); qnSavePriv(arr);
    }
    S.qnPanel=scope; renderQuickNotes();
  }

