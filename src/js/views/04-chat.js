// ===== سكن · شاتنا — الشات العائم (chat) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function loadChat(){
    let res;
    try{ res = await api("GET","/messages"); }
    catch(e){ const b=document.getElementById("chatScroll"); if(b) b.innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; return; }
    const msgs = (res&&res.items)||[]; const partnerRead=(res&&res.partnerRead)||0;
    _chatPartnerRead = partnerRead;
    const sig = msgs.map(m=>`${m.id}:${m.edited?1:0}:${m.deleted?1:0}`).join(",")+"|"+partnerRead;
    const box = document.getElementById("chatScroll");
    if(!(sig===_chatSig && box && box.dataset.ready)){
      const atBottom = box ? (box.scrollHeight - box.scrollTop - box.clientHeight < 90) : true;
      _chatSig = sig;
      renderChatMsgs(msgs, partnerRead, atBottom);
    }
    api("POST","/messages/read",{}).catch(()=>{});   // علّم إني قريت (يظهر ✓✓ عند الشريك)
  }
  function renderChatMsgs(msgs, partnerRead, stick){
    const box = document.getElementById("chatScroll"); if(!box) return;
    _chatMsgs = msgs;
    if(!msgs.length){ box.innerHTML = `<div class="empty">لسه مفيش رسايل — ابدأ إنت 🌿</div>`; box.dataset.ready="1"; return; }
    const meBg = "linear-gradient(135deg,var(--brand-mid,#1a5d47),var(--brand-deep,#0e3b2e))";
    const dayLabel = (ts)=>{ const d=new Date(ts); const t=new Date(); t.setHours(0,0,0,0); const y=new Date(t); y.setDate(y.getDate()-1); if(d>=t) return "اليوم"; if(d>=y) return "أمس"; return d.toLocaleDateString("ar-EG",{day:"numeric",month:"long"}); };
    let html=""; let lastDay=null;
    for(const m of msgs){
      const day = dayLabel(m.createdAt);
      if(day!==lastDay){ html += `<div style="text-align:center;margin:12px 0 6px"><span style="background:var(--card-2,#eee);color:var(--muted);font-size:11.5px;padding:3px 12px;border-radius:99px">${day}</span></div>`; lastDay=day; }
      const mine = !!m.mine;
      const hh = new Date(m.createdAt).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"});
      const ticks = (mine && !m.deleted) ? (m.createdAt<=partnerRead ? "✓✓" : "✓") : "";
      const bub = mine ? `background:${meBg};color:#fff;margin-inline-end:auto;border-end-start-radius:5px` : `background:var(--card-2,#f1ede1);color:var(--ink);margin-inline-start:auto;border-end-end-radius:5px`;
      const reply = m.replyText ? `<div style="border-inline-start:3px solid ${mine?'rgba(255,255,255,.6)':'var(--brand-gold,#c9a14a)'};padding-inline-start:7px;margin-bottom:4px;font-size:12.5px;opacity:.85;white-space:pre-wrap;word-break:break-word">${esc(m.replyText)}</div>` : "";
      const body = m.deleted ? `<i style="opacity:.7">🚫 رسالة محذوفة</i>` : esc(m.text);
      html += `<div style="display:flex;margin:4px 0">
        <div data-act="chatMenu" data-id="${esc(m.id)}" style="cursor:pointer;max-width:80%;padding:8px 12px;border-radius:16px;${bub};box-shadow:var(--shadow-sm,0 1px 3px rgba(0,0,0,.08))">
          ${reply}
          <div style="white-space:pre-wrap;word-break:break-word;font-size:14.5px;line-height:1.55">${body}</div>
          <div style="font-size:10.5px;opacity:.65;text-align:left;margin-top:3px">${(m.edited&&!m.deleted)?"عُدّلت · ":""}${hh}${ticks?(" "+ticks):""}</div>
        </div></div>`;
      if(S.chatMenu===m.id && !m.deleted){
        const btn=(a,lbl)=>`<button class="btn soft sm" data-act="${a}" data-id="${esc(m.id)}" style="width:auto;padding:0 10px">${lbl}</button>`;
        html += `<div style="display:flex;gap:6px;flex-wrap:wrap;${mine?'justify-content:flex-start':'justify-content:flex-end'};margin:-1px 0 7px">${btn("chatReply","↩️ رد")}${btn("chatCopy","📋 نسخ")}${mine?btn("chatEditStart","✏️ تعديل"):""}${mine?btn("chatDelete","🗑️ حذف"):""}</div>`;
      }
    }
    box.innerHTML = html; box.dataset.ready="1";
    if(stick) box.scrollTop = box.scrollHeight;
  }
  function renderComposer(){
    const c = document.getElementById("chatComposer"); if(!c) return;
    let banner="";
    if(S.chatEdit){ banner = `<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);padding:4px 6px;border-inline-start:3px solid var(--brand-gold,#c9a14a);margin-bottom:6px">✏️ تعديل رسالة<span class="spacer" style="flex:1"></span><button class="linkbtn" data-act="chatCancelCompose">إلغاء</button></div>`; }
    else if(S.chatReply){ banner = `<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);padding:4px 6px;border-inline-start:3px solid var(--brand-gold,#c9a14a);margin-bottom:6px">↩️ ردًا على: <span style="opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%">${esc((S.chatReply.text||"").slice(0,60))}</span><span class="spacer" style="flex:1"></span><button class="linkbtn" data-act="chatCancelCompose">إلغاء</button></div>`; }
    c.innerHTML = banner + `<div style="display:flex;gap:8px;align-items:flex-end">
        <textarea id="chatInput" placeholder="اكتب رسالة…" rows="1" style="flex:1;resize:none;min-height:44px;max-height:130px"></textarea>
        <button class="btn accent" data-act="sendMsg" style="flex:none">${S.chatEdit?"حفظ":"إرسال"}</button></div>`;
    const ta = document.getElementById("chatInput");
    if(ta){
      if(S.chatEdit){ const m=_chatMsgs.find(x=>x.id===S.chatEdit); if(m) ta.value=m.text; }
      ta.addEventListener("keydown",(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); go("sendMsg", ta); } });
      ta.focus();
    }
  }
  function renderChat(){
    S.view="chat"; S.resourceId=null; S.chatReply=null; S.chatEdit=null; S.chatMenu=null;
    el.innerHTML = pageTitle("شاتنا","مساحة خاصة بينك وبين شريكك — زيّ الشات العادي، بتتحدّث تلقائيًا 🌿")
      + `<div id="chatPresence" class="card tight" style="display:flex;align-items:center;font-size:13px;margin-bottom:10px;padding:8px 12px"></div>`
      + `<div class="card" style="padding:10px">
          <div id="chatScroll" style="height:min(58vh,460px);overflow-y:auto;padding:4px 6px"><div class="empty">…تحميل</div></div>
          <div id="chatComposer" style="margin-top:8px"></div>
        </div>`;
    _chatSig = "";
    renderComposer();
    renderChatPresence();
    loadChat();
    _chatPoll = setInterval(()=>{ if(S.view!=="chat"){ clearInterval(_chatPoll); _chatPoll=null; return; } loadChat(); }, 10000);
  }

  // ---------- دردشة المورد: نقاش حرّ خاص بكل حلقة/فيديو ----------
