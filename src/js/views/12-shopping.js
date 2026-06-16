// ===== سكن · المشتريات (shopping) =====
// جزء من الـ IIFE المشترك (لا import/export). الترتيب محفوظ في js/_js_order.json
  async function renderShopping(){
    S.view="shopping"; S.resourceId=null;
    el.innerHTML = pageTitle("قائمة المشتريات","قائمة حيّة لبيتنا — الشطب بيظهر للاتنين.") + `
      <div class="card tight"><div class="row"><label>الصنف</label><input id="sText" type="text" placeholder="حليب، بيض، إصلاح سباكة…"></div>
        <button class="btn" data-act="addShop">أضِف</button></div>
      <div id="sList"><div class="empty">…تحميل</div></div>`;
    await reloadShopping();
  }
  async function reloadShopping(){
    try{
      const items = await api("GET","/shopping");
      const list = document.getElementById("sList");
      list.innerHTML = items.length ? items.map(s=>`
        <div class="card tight"><div class="actions" style="justify-content:space-between">
          <div style="display:flex;align-items:center;gap:10px"><button class="btn ${s.done?'':'ghost'} sm" data-act="toggleShop" data-id="${esc(s.id)}">${s.done?'✓':'○'}</button>
          <span style="${s.done?'text-decoration:line-through;opacity:.6':''}">${esc(s.text)}</span></div>
          <button class="linkbtn" data-act="delShop" data-id="${esc(s.id)}">حذف</button></div></div>`).join("")
        : `<div class="empty">القائمة فاضية. أضيفوا اللي البيت محتاجه.</div>`;
    }catch(e){ document.getElementById("sList").innerHTML=`<div class="empty">${esc(errMsg(e))}</div>`; }
  }

