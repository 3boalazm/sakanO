
(function(){
  'use strict';

  // ── Register Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[سكن] SW registered:', reg.scope);
          // Check for updates every 60s when app is open
          setInterval(() => reg.update(), 60_000);
          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast(worker);
              }
            });
          });
        })
        .catch(err => console.warn('[سكن] SW error:', err));

      // When new SW takes over — reload
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });
  }

  // ── Install prompt (Add to Home Screen — بيتثبّت زي أي تطبيق) ──
  let deferredPrompt = null;
  const INSTALL_DISMISS_KEY = 'sakan_install_dismissed_at';
  const INSTALL_DISMISS_DAYS = 14;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  const wasRecentlyDismissed = () => {
    const t = Number(localStorage.getItem(INSTALL_DISMISS_KEY) || 0);
    return t && (Date.now() - t) < INSTALL_DISMISS_DAYS * 86400000;
  };

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone() && !wasRecentlyDismissed()) showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallBanner();
    try { localStorage.removeItem(INSTALL_DISMISS_KEY); } catch {}
  });

  function hideInstallBanner() {
    const el = document.getElementById('pwa-install-banner');
    if (el) el.remove();
  }

  function showInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'pwa-install-banner';
    bar.style.cssText = [
      'position:fixed;left:14px;right:14px;bottom:calc(14px + var(--sab,0px));max-width:420px;margin:0 auto',
      'background:linear-gradient(135deg,#1e3a2f,#2a5c42);color:#f4ecd6',
      'border:1px solid rgba(201,161,74,.5);border-radius:18px',
      'padding:10px;font-family:ThmanyahSans,Tajawal,sans-serif',
      'display:flex;align-items:center;gap:10px;z-index:9998',
      'box-shadow:0 12px 32px rgba(0,0,0,.4);direction:rtl',
    ].join(';');
    bar.innerHTML = `
      <button data-x aria-label="إغلاق"
        style="flex:none;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.25);
               background:rgba(255,255,255,.08);color:#f4ecd6;font-size:14px;cursor:pointer;line-height:1;padding:0">✕</button>
      <button data-install
        style="flex:1;min-width:0;display:flex;align-items:center;gap:10px;background:none;border:none;
               color:inherit;text-align:start;cursor:pointer;padding:4px;font:inherit">
        <span style="flex:1;min-width:0">
          <span style="display:block;font-weight:800;font-size:14.5px">ثبّت سكن على تليفونك</span>
          <span style="display:block;font-size:12px;color:rgba(244,236,214,.8);margin-top:2px">📴 بيفتح بسرعة وشغال من غير نت</span>
        </span>
        <img src="/icons/icon-96x96.png" alt="" width="44" height="44"
          style="flex:none;width:44px;height:44px;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.35)">
      </button>
    `;
    bar.querySelector('[data-x]').addEventListener('click', () => {
      hideInstallBanner();
      try { localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now())); } catch {}
    });
    bar.querySelector('[data-install]').addEventListener('click', async () => {
      if (!deferredPrompt) { hideInstallBanner(); return; }
      const p = deferredPrompt;
      deferredPrompt = null;
      p.prompt();
      try { await p.userChoice; } catch {}
      hideInstallBanner();
    });
    document.body.appendChild(bar);
  }

  // ── Update toast ──
  function showUpdateToast(worker) {
    const existing = document.getElementById('pwa-update-toast');
    if (existing) return;
    const toast = document.createElement('div');
    toast.id = 'pwa-update-toast';
    toast.style.cssText = [
      'position:fixed;bottom:calc(24px + var(--sab,0px));left:50%;transform:translateX(-50%)',
      'background:linear-gradient(135deg,#1e3a2f,#2a5c42);color:#f4ecd6',
      'border:1px solid rgba(201,161,74,.5);border-radius:16px',
      'padding:12px 20px;font-family:ThmanyahSans,Tajawal,sans-serif;font-size:14px',
      'display:flex;align-items:center;gap:12px;z-index:9999',
      'box-shadow:0 8px 32px rgba(0,0,0,.4);direction:rtl',
    ].join(';');
    toast.innerHTML = `
      <span>🌿 تحديث جديد لسكن جاهز</span>
      <button onclick="this.closest('#pwa-update-toast').remove()" 
        style="background:rgba(255,255,255,.1);border:1px solid rgba(201,161,74,.4);
               color:#e6c97a;border-radius:10px;padding:5px 14px;cursor:pointer;
               font-family:inherit;font-size:13px;font-weight:700">تحديث</button>
    `;
    toast.querySelector('button').addEventListener('click', () => {
      worker.postMessage({ type: 'SKIP_WAITING' });
      toast.remove();
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 12_000);
  }


})();
