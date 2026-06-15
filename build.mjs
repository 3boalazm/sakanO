// build.mjs — Sakan bundler
// Reassembles the deployable SPA from modular source:
//   src/css/*  +  src/js/app.js  +  src/js/pwa.js  ->  src/index.html
// then bakes src/index.html -> lib/page.js (base64) which the server serves.
//
// Workflow:  edit files under src/css and src/js, then:  npm run build
// (index.html and lib/page.js are generated artifacts — do not edit them by hand.)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const r = (...p) => join(ROOT, ...p);

const TOK_CSS = '/*__SAKAN_CSS__*/';
const TOK_APP = '/*__SAKAN_APP__*/';
const TOK_PWA = '/*__SAKAN_PWA__*/';

// 1) assemble CSS in declared order
const cssOrder = JSON.parse(readFileSync(r('src/css/_order.json'), 'utf8'));
const css = cssOrder.map((f) => readFileSync(r('src/css', f), 'utf8')).join('');

// 2) read JS modules
const appJs = readFileSync(r('src/js/app.js'), 'utf8');
const pwaJs = readFileSync(r('src/js/pwa.js'), 'utf8');

// 3) inject into template
const tmpl = readFileSync(r('src/index.template.html'), 'utf8');
const html = tmpl
  .replace(TOK_CSS, css)
  .replace(TOK_APP, appJs)
  .replace(TOK_PWA, pwaJs);
writeFileSync(r('src/index.html'), html);

// 4) bake page.js (base64) — this is what the Node/Vercel server returns for "/"
const b64 = Buffer.from(html, 'utf8').toString('base64');
const page = '// Auto-generated from src/index.html.\nexport const PAGE = Buffer.from("' + b64 + '", "base64").toString("utf8");\n';
writeFileSync(r('lib/page.js'), page);

// 5) self-verify round trip
const back = Buffer.from(b64, 'base64').toString('utf8');
if (back !== html) { console.error('FATAL: page.js round-trip mismatch'); process.exit(1); }

console.log(`build ok — index.html ${html.length} chars, css ${css.length}, app.js ${appJs.length}, pwa.js ${pwaJs.length}`);
