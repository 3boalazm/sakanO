
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
