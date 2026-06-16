
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

  // Initial view logic: token + PIN set → show pin screen; token, no pin → home; no token → onboarding
  const _hasToken = !!localStorage.getItem("sakan_token");
  const _hasPin   = !!localStorage.getItem(PIN_KEY);
  const _initView = !_hasToken ? "onboarding" : (_hasPin ? "pinlock" : "home");

  const S = {
    token: _hasToken ? localStorage.getItem("sakan_token") : null,
    code:  localStorage.getItem("sakan_code")  || null,
    name:  localStorage.getItem("sakan_name")  || null,
    email: localStorage.getItem("sakan_email") || null,
    view: _initView, resourceId: null, tab: "summary",
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

