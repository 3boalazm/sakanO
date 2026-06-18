// ===== سكن · رحلتي (myjourney) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderMyJourney(){
    S.view="myjourney"; S.resourceId=null;
    if(!S.jrnWho) S.jrnWho="mine";
    el.innerHTML = pageTitle("رحلتنا 🌿","خطوات كلٍّ منكما — اختَر العمود اللي تشوفه.")
      + `<div class="themesw" id="jrnWho" role="group" style="border-radius:12px;margin:4px 0 14px">
           <button type="button" data-act="jrnWho" data-w="mine"    class="${S.jrnWho==='mine'?'on':''}"    style="width:auto;padding:7px 16px">رحلتي</button>
           <button type="button" data-act="jrnWho" data-w="partner" class="${S.jrnWho==='partner'?'on':''}" style="width:auto;padding:7px 16px">رحلة شريكي</button>
         </div>
         <div id="jrnBody"><div class="empty">…تحميل</div></div>`;

    let data;
    try { data = await api("GET","/journey"); }
    catch(e){ document.getElementById("jrnBody").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; return; }

    S._jrn = data; // { mine, partner, myId, partnerId }
    renderJourneyPanel();
  }

  // ── Destination: أين يروح الكليك لكل حدث ──
  function jrnDest(e){
    const p = e.path || [];
    const r0 = p[0], r1 = p[1], r2 = p[2];
    // أي حاجة على مورد بعينه → افتح صفحة المورد
    if(r0 === 'resources' && r1 && !['full','progress','priority','category','notes','summary','questions'].includes(r1)){
      return { act:'openq', rid:r1 };  // نفتح المورد مباشرة
    }
    if(r0 === 'resources' && r1 && r2){
      return { act:'resource', rid:r1, tab: r2==='questions'?'discussion':'summary' };
    }
    if(r0 === 'resources' && r1){
      return { act:'resource', rid:r1 };
    }
    // أسئلة / مناقشات
    if(r0 === 'questions'){
      return { act:'nav', view:'discussions' };
    }
    // شات رئيسي
    if(r0 === 'messages'){
      return { act:'nav', view:'chat' };
    }
    // قرارات
    if(r0 === 'decisions'){
      return { act:'nav', view:'decisionlog' };
    }
    // مهام
    if(r0 === 'tasks'){
      return { act:'nav', view:'tasks' };
    }
    // ميزانية
    if(r0 === 'budget'){
      return { act:'nav', view:'budget' };
    }
    // مشتريات
    if(r0 === 'shopping'){
      return { act:'nav', view:'shopping' };
    }
    // الاتصال (أمنيات / امتنان / كبسولات / مفاتيح / مزاج / صندوق تفاهم / ميثاق)
    if(['wishes','gratitude','capsules','keys','mood','safespace','charter'].includes(r0)){
      return { act:'nav', view:'connect' };
    }
    return null; // مفيش تنقل (حذف / seed / غيره)
  }

  // ── Icon & label per action (method + path) ──
  function jrnIcon(e){
    const p = e.path || []; const t = e.title ? ` · ${e.title}` : "";
    const k = (p[0]||"") + (p[2] ? "/"+p[2] : "");
    const MAP = {
      "resources":{ico:"📚",txt:"أضاف موردًا"+t}, "resources/full":{ico:"📚",txt:"أضاف موردًا"+t},
      "resources/progress":{ico:"▶️",txt:"حدّث تقدّمه في مادة"+t}, "resources/priority":{ico:"⭐",txt:"غيّر أولوية مادة"+t},
      "resources/category":{ico:"🏷️",txt:"غيّر تصنيف مادة"+t}, "resources/notes":{ico:"📝",txt:"حفظ ملاحظة"+t},
      "resources/summary":{ico:"🤖",txt:"ولّد ملخصًا"+t}, "resources/questions":{ico:"💬",txt:"أضاف أسئلة نقاش"+t},
      "questions":{ico:"💬",txt:"فتح موضوع نقاش"}, "questions/responses":{ico:"✍️",txt:"أجاب على سؤال"}, "questions/reveal":{ico:"👀",txt:"كشف إجابات سؤال"}, "questions/force-reveal":{ico:"👀",txt:"كشف إجابات سؤال"},
      "decisions":{ico:"⚡",txt:"سجّل قرارًا"}, "decisions/confirm":{ico:"🤝",txt:"أكّد قرارًا"}, "decisions/reviewed":{ico:"🔁",txt:"راجع قرارًا"},
      "tasks":{ico:"🗒️",txt:"أضاف مهمة"}, "tasks/toggle":{ico:"✔️",txt:"بدّل حالة مهمة"}, "tasks/delete":{ico:"🗑️",txt:"حذف مهمة"},
      "budget":{ico:"💰",txt:"أضاف بند ميزانية"}, "budget/pay":{ico:"💵",txt:"سجّل دفعة"}, "budget/delete":{ico:"🗑️",txt:"حذف بند ميزانية"},
      "shopping":{ico:"🛒",txt:"أضاف للمشتريات"}, "shopping/toggle":{ico:"✔️",txt:"بدّل صنف مشتريات"}, "shopping/delete":{ico:"🗑️",txt:"حذف صنف مشتريات"},
      "messages":{ico:"💌",txt:"بعت رسالة في الشات"}, "messages/edit":{ico:"✏️",txt:"عدّل رسالة"}, "messages/delete":{ico:"🗑️",txt:"حذف رسالة"},
      "wishes":{ico:"🌠",txt:"أضاف أمنية"}, "wishes/toggle":{ico:"✔️",txt:"حدّث أمنية"}, "wishes/delete":{ico:"🗑️",txt:"حذف أمنية"},
      "gratitude":{ico:"🤲",txt:"أضاف امتنانًا"}, "gratitude/delete":{ico:"🗑️",txt:"حذف امتنانًا"},
      "capsules":{ico:"📨",txt:"ختم رسالة مؤجّلة"}, "capsules/open":{ico:"💌",txt:"بعت رسالة مؤجّلة"}, "capsules/convert":{ico:"🔁",txt:"غيّر طريقة فتح رسالة"}, "capsules/delete":{ico:"🗑️",txt:"حذف رسالة مؤجّلة"}, "mood":{ico:"🌤️",txt:"حدّث مزاجه"},
      "safespace":{ico:"🕊️",txt:"أضاف لصندوق التفاهم"}, "safespace/addressed":{ico:"✅",txt:"اتكلمتوا في موضوع"},
      "keys":{ico:"🗝️",txt:"أضاف مفتاحًا"}, "keys/delete":{ico:"🗑️",txt:"حذف مفتاحًا"},
      "charter":{ico:"📜",txt:"أضاف لميثاقكم"}, "charter/delete":{ico:"🗑️",txt:"حذف من الميثاق"},
      "focus":{ico:"📌",txt:"غيّر مادتكم الحالية"}, "focus/clear":{ico:"📌",txt:"أزال التركيز"},
      "journey/seed":{ico:"🌱",txt:"استورد المنهج"},
    };
    return MAP[k] || MAP[p[0]] || {ico:"🔔",txt:"نشاط في السايت"};
  }

  function jrnDayLabel(ts){
    const d = new Date(ts);
    const today = new Date(); today.setHours(0,0,0,0);
    const yd = new Date(today); yd.setDate(yd.getDate()-1);
    if(d >= today) return "اليوم";
    if(d >= yd)    return "أمس";
    return d.toLocaleDateString("ar-EG",{weekday:"long",month:"long",day:"numeric"});
  }

  function renderJourneyPanel(){
    const data = S._jrn || {mine:[],partner:[]};
    const mineSel = S.jrnWho!=="partner";
    const events = mineSel ? (data.mine||[]) : (data.partner||[]);
    const body = document.getElementById("jrnBody");
    if(!body) return;

    if(!mineSel && !data.partnerId){
      body.innerHTML = `<div class="empty" style="padding:40px">لسه مفيش شريك مقترن بالميثاق.</div>`; return;
    }
    if(!events.length){
      body.innerHTML = `<div class="empty" style="padding:40px">${mineSel?"لسه مفيش رحلة. ابدأ بإضافة مورد أو متابعة محتوى 🌱":"شريكك لسه مبدأش نشاطه."}</div>`;
      return;
    }

    let html=""; let lastDay=null;
    events.forEach(e=>{
      const day = jrnDayLabel(e.createdAt);
      if(day !== lastDay){
        if(lastDay !== null) html += `</div>`;
        html += `<div class="jrn-day-label">${day}</div><div class="jrn-group">`;
        lastDay = day;
      }
      const {ico,txt} = jrnIcon(e);
      const dest = jrnDest(e);
      const who    = mineSel ? "أنا" : "شريكي";
      const whoClr = mineSel ? "var(--primary)" : "var(--accent)";
      const time   = new Date(e.createdAt).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"});
      const destAttr = dest ? `data-jdest='${JSON.stringify(dest)}'` : '';
      const cursor   = dest ? 'cursor:pointer;' : '';
      html += `
        <div class="jrn-item ${mineSel?'mine':'partner'}" ${destAttr} style="${cursor}">
          <div class="jrn-ico">${ico}</div>
          <div class="jrn-body">
            <span class="jrn-who" style="color:${whoClr}">${who}</span>
            <span class="jrn-txt">${esc(txt)}</span>
            <span class="jrn-time">${time}</span>
            ${dest?'<span class="jrn-arrow">›</span>':''}
          </div>
        </div>`;
    });
    if(lastDay !== null) html += `</div>`;
    body.innerHTML = html;
  }
