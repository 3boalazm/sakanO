// ===== سكن · نقاش المورد (resource chat) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  function renderResChat(){
    const t = document.getElementById("tab"); if(!t) return;
    t.innerHTML = `<div class="card" style="padding:10px">
        <div id="rcScroll" style="height:min(46vh,400px);overflow-y:auto;padding:4px 6px"><div class="empty">…تحميل</div></div>
        <div style="display:flex;gap:8px;align-items:flex-end;margin-top:8px">
          <textarea id="rcInput" placeholder="اكتب نقاشك حول الحلقة دي…" rows="1" style="flex:1;resize:none;min-height:44px;max-height:130px"></textarea>
          <button class="btn accent" data-act="sendResMsg" style="flex:none">إرسال</button>
        </div></div>`;
    const ta = document.getElementById("rcInput");
    if(ta){ ta.addEventListener("keydown",(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); go("sendResMsg", ta); } }); }
    _rcSig = "";
    loadResChat();
    if(_rcPoll) clearInterval(_rcPoll);
    _rcPoll = setInterval(()=>{ if(S.view!=="resource" || S.tab!=="chat"){ clearInterval(_rcPoll); _rcPoll=null; return; } loadResChat(); }, 8000);
  }
  async function loadResChat(){
    const rid = S.resourceId; if(!rid) return;
    let res;
    try{ res = await api("GET","/resources/"+rid+"/chat"); }
    catch(e){ const b=document.getElementById("rcScroll"); if(b) b.innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; return; }
    const msgs = (res&&res.items)||[];
    const sig = msgs.map(m=>`${m.id}:${m.deleted?1:0}`).join(",");
    const box = document.getElementById("rcScroll"); if(!box) return;
    if(sig===_rcSig && box.dataset.ready) return;
    const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 90;
    _rcSig = sig; _rcMsgs = msgs;
    renderResChatMsgs(msgs, atBottom);
  }
  function renderResChatMsgs(msgs, stick){
    const box = document.getElementById("rcScroll"); if(!box) return;
    if(!msgs.length){ box.innerHTML = `<div class="empty">لسه مفيش نقاش حول الحلقة دي — ابدأ إنت 🌿</div>`; box.dataset.ready="1"; return; }
    const meBg = "linear-gradient(135deg,var(--brand-mid,#1a5d47),var(--brand-deep,#0e3b2e))";
    let html="";
    for(const m of msgs){
      const mine = !!m.mine;
      const hh = new Date(m.createdAt).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"});
      const bub = mine ? `background:${meBg};color:#fff;margin-inline-end:auto;border-end-start-radius:5px` : `background:var(--card-2,#f1ede1);color:var(--ink);margin-inline-start:auto;border-end-end-radius:5px`;
      const body = m.deleted ? `<i style="opacity:.7">🚫 محذوفة</i>` : esc(m.text);
      const del = (mine && !m.deleted) ? ` · <button class="linkbtn" data-act="delResMsg" data-id="${esc(m.id)}" style="font-size:10.5px;opacity:.75">حذف</button>` : "";
      html += `<div style="display:flex;margin:4px 0"><div style="max-width:82%;padding:8px 12px;border-radius:16px;${bub};box-shadow:var(--shadow-sm,0 1px 3px rgba(0,0,0,.08))">
        <div style="white-space:pre-wrap;word-break:break-word;font-size:14.5px;line-height:1.55">${body}</div>
        <div style="font-size:10.5px;opacity:.65;text-align:left;margin-top:3px">${hh}${del}</div>
      </div></div>`;
    }
    box.innerHTML = html; box.dataset.ready="1";
    if(stick) box.scrollTop = box.scrollHeight;
  }

  // ---------- بحث شامل في كل حاجة ----------
