// ===== سكن · رحلتي (myjourney) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderMyJourney(){
    S.view="myjourney"; S.resourceId=null;
    el.innerHTML = pageTitle("رحلتي 🌿","خطواتك إنت بس — مش بيشوفها حد غيرك.")
      + `<div id="jrnBody"><div class="empty">…تحميل</div></div>`;

    let data;
    try { data = await api("GET","/journey"); }
    catch(e){ document.getElementById("jrnBody").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; return; }

    const { events, myId } = data;
    if(!events.length){
      document.getElementById("jrnBody").innerHTML=`<div class="empty" style="padding:40px">لسه مفيش رحلة. ابدأ بإضافة مورد أو متابعة محتوى 🌱</div>`;
      return;
    }

    // ── Icon & label per action (method + path) ──
    function evIcon(e){
      const p = e.path || []; const t = e.title ? ` · ${e.title}` : "";
      const k = (p[0]||"") + (p[2] ? "/"+p[2] : "");
      const MAP = {
        "resources":{ico:"📚",txt:"أضفت موردًا"+t}, "resources/full":{ico:"📚",txt:"أضفت موردًا"+t},
        "resources/progress":{ico:"▶️",txt:"حدّثت تقدّمك في مادة"+t}, "resources/priority":{ico:"⭐",txt:"غيّرت أولوية مادة"+t},
        "resources/category":{ico:"🏷️",txt:"غيّرت تصنيف مادة"+t}, "resources/notes":{ico:"📝",txt:"حفظت ملاحظة"+t},
        "resources/summary":{ico:"🤖",txt:"ولّدت ملخصًا"+t}, "resources/questions":{ico:"💬",txt:"أضفت أسئلة نقاش"+t},
        "questions/responses":{ico:"✍️",txt:"أجبت على سؤال"}, "questions/reveal":{ico:"👀",txt:"كشفت إجابات سؤال"}, "questions/force-reveal":{ico:"👀",txt:"كشفت إجابات سؤال"},
        "decisions":{ico:"⚡",txt:"سجّلت قرارًا"}, "decisions/confirm":{ico:"🤝",txt:"أكّدت قرارًا"}, "decisions/reviewed":{ico:"🔁",txt:"راجعت قرارًا"},
        "tasks":{ico:"🗒️",txt:"أضفت مهمة"}, "tasks/toggle":{ico:"✔️",txt:"بدّلت حالة مهمة"}, "tasks/delete":{ico:"🗑️",txt:"حذفت مهمة"},
        "budget":{ico:"💰",txt:"أضفت بند ميزانية"}, "budget/pay":{ico:"💵",txt:"سجّلت دفعة"}, "budget/delete":{ico:"🗑️",txt:"حذفت بند ميزانية"},
        "shopping":{ico:"🛒",txt:"أضفت للمشتريات"}, "shopping/toggle":{ico:"✔️",txt:"بدّلت صنف مشتريات"}, "shopping/delete":{ico:"🗑️",txt:"حذفت صنف مشتريات"},
        "messages":{ico:"💌",txt:"بعت رسالة في الشات"}, "messages/edit":{ico:"✏️",txt:"عدّلت رسالة"}, "messages/delete":{ico:"🗑️",txt:"حذفت رسالة"},
        "wishes":{ico:"🌠",txt:"أضفت أمنية"}, "wishes/toggle":{ico:"✔️",txt:"حدّثت أمنية"}, "wishes/delete":{ico:"🗑️",txt:"حذفت أمنية"},
        "gratitude":{ico:"🤲",txt:"أضفت امتنانًا"}, "gratitude/delete":{ico:"🗑️",txt:"حذفت امتنانًا"},
        "capsules":{ico:"📨",txt:"ختمت رسالة مؤجّلة"}, "mood":{ico:"🌤️",txt:"حدّثت مزاجك"},
        "safespace":{ico:"🕊️",txt:"أضفت لصندوق التفاهم"}, "safespace/addressed":{ico:"✅",txt:"اتكلمتوا في موضوع"},
        "keys":{ico:"🗝️",txt:"أضفت مفتاحًا"}, "keys/delete":{ico:"🗑️",txt:"حذفت مفتاحًا"},
        "charter":{ico:"📜",txt:"أضفت لميثاقكم"}, "charter/delete":{ico:"🗑️",txt:"حذفت من الميثاق"},
        "focus":{ico:"📌",txt:"غيّرت مادتكم الحالية"}, "focus/clear":{ico:"📌",txt:"أزلت التركيز"},
        "journey/seed":{ico:"🌱",txt:"استوردت المنهج"},
      };
      return MAP[k] || MAP[p[0]] || {ico:"🔔",txt:"نشاط في السايت"};
    }

    // ── Group by day ──
    function dayLabel(ts){
      const d = new Date(ts);
      const today = new Date(); today.setHours(0,0,0,0);
      const yd = new Date(today); yd.setDate(yd.getDate()-1);
      if(d >= today) return "اليوم";
      if(d >= yd)    return "أمس";
      return d.toLocaleDateString("ar-EG",{weekday:"long",month:"long",day:"numeric"});
    }

    // ── Render timeline ──
    let html = "";
    let lastDay = null;

    events.forEach(e=>{
      const day = dayLabel(e.createdAt);
      if(day !== lastDay){
        if(lastDay !== null) html += `</div>`;
        html += `<div class="jrn-day-label">${day}</div><div class="jrn-group">`;
        lastDay = day;
      }
      const {ico,txt} = evIcon(e);
      // رحلتي = أنا بس — مفيش حاجة من الطرف الآخر هنا
      const who    = "أنا";
      const whoClr = "var(--primary)";
      const time   = new Date(e.createdAt).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"});
      html += `
        <div class="jrn-item ${e.isMine?'mine':'partner'}">
          <div class="jrn-ico">${ico}</div>
          <div class="jrn-body">
            <span class="jrn-who" style="color:${whoClr}">${who}</span>
            <span class="jrn-txt">${esc(txt)}</span>
            <span class="jrn-time">${time}</span>
          </div>
        </div>`;
    });
    if(lastDay !== null) html += `</div>`;

    document.getElementById("jrnBody").innerHTML = html;
  }


