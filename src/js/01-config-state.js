
(function(){
  "use strict";
"use strict";

(function(){
  "use strict";

  // ---------- config ----------
  const DEFAULT_API = (location.protocol === "http:" || location.protocol === "https:")
    ? location.origin.replace(/\/$/, "") + "/api"
    : "https://sakan-md.vercel.app/api";
  const API = () => localStorage.getItem("sakan_api") || DEFAULT_API;

  // PIN Lock helpers
  const PIN_KEY   = "sakan_pin";          // hashed PIN per device
  const PIN_WHO   = "sakan_pin_who";      // "m" or "d" — who locked this device
  const PIN_TOKEN = "sakan_token";        // session token
  function pinHash(p){ let h=0; for(let i=0;i<p.length;i++) h=((h<<5)-h)+p.charCodeAt(i)|0; return h.toString(36); }
  const hasPinSetup = () => !!localStorage.getItem(PIN_KEY) && !!localStorage.getItem(PIN_TOKEN);
  const pinCorrect  = (p)=> pinHash(p)===localStorage.getItem(PIN_KEY);
  const devWho      = () => localStorage.getItem(PIN_WHO)||null;

  // ---------- روابط منفصلة لكل صفحة عبر الـ hash (بدون أي تغيير في السيرفر) ----------
  // الـ hash (اللي بعد #) بيفضل جوه المتصفح وميوصلش للسيرفر خالص — فآمن 100% ومش هيأثر
  // على أي API call أو أي routing موجود، وبرضه بيدي كل صفحة رابط حقيقي تتحفظ/تتبعت.
  const ROUTE_VIEWS = ["home","chat","mutabaana","journeys","library","discussions",
    "decisionlog","charter","connect","quicknotes","tasks","budget","shopping","settings","engagement","myjourney","search"];
  function parseHash(){
    const h = (location.hash||"").replace(/^#\/?/,"");
    if(!h) return null;
    const parts = h.split("/");
    if(parts[0]==="resource" && parts[1]) return { view:"resource", resourceId:parts[1], tab:parts[2]||"summary" };
    if(ROUTE_VIEWS.indexOf(parts[0])>=0) return { view:parts[0] };
    return null;
  }
  function hashFor(view, resourceId, tab){
    if(view==="resource" && resourceId) return "#/resource/"+resourceId+(tab?("/"+tab):"");
    if(ROUTE_VIEWS.indexOf(view)>=0) return "#/"+view;
    return "#/home";
  }
  const _pendingHash = parseHash();   // الرابط اللي المستخدم كان طالبه فعلاً (لو فيه) — نستخدمه بعد تسجيل الدخول/فك القفل
  function landingAfterAuth(){
    if(_pendingHash && _pendingHash.view==="resource" && _pendingHash.resourceId){
      S.view="resource"; S.resourceId=_pendingHash.resourceId; S.tab=_pendingHash.tab||"summary"; return;
    }
    if(_pendingHash && _pendingHash.view && ROUTE_VIEWS.indexOf(_pendingHash.view)>=0){
      S.view=_pendingHash.view; return;
    }
    S.view="home";
  }
  const _hasToken = !!localStorage.getItem("sakan_token");
  const _hasPin   = !!localStorage.getItem(PIN_KEY);
  const _initHash = (_hasToken && !_hasPin) ? parseHash() : null;
  const _initView = !_hasToken ? "onboarding" : (_hasPin ? "pinlock" : (_initHash ? _initHash.view : "home"));

  const S = {
    token: _hasToken ? localStorage.getItem("sakan_token") : null,
    code:  localStorage.getItem("sakan_code")  || null,
    name:  localStorage.getItem("sakan_name")  || null,
    email: localStorage.getItem("sakan_email") || null,
    view: _initView,
    resourceId: (_initHash && _initHash.resourceId) || null,
    tab: (_initHash && _initHash.tab) || "summary",
    detail: null, responses: {}, presence: null, updates: null, fabOpen: false,
    pinEntry: "", pinStep: "lock",  // lock | setup1 | setup2 | whoselect
    pinWho: devWho(),               // "m"=مصطفى "d"=ضحى
    pinSetup1: "",                  // first entry in setup flow
  };

  const STATE_AR = {
    not_started:"لم يبدأ", in_progress:"قيد العمل", completed:"مكتمل",
    open:"بانتظار ردّ كلٍّ مننا", answered_by_one:"ردّ واحد مننا", ready_to_reveal:"جاهز للكشف",
    revealed:"مكشوف", decided:"تقرّر", draft:"مسودّة", confirmed:"مؤكَّد", revisited:"قيد المراجعة",
  };

