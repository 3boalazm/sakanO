# بنية مشروع سكن (بعد إعادة التنظيم)

التطبيق SPA مبني على Vanilla JS + Node/Firebase، ويُخدَّم كصفحة واحدة من السيرفر
(الـ HTML والـ CSS والـ JS تُحقَن داخل وثيقة واحدة وقت البناء). إعادة التنظيم دي
فصلت المصدر إلى فولدرات واضحة مع خطوة بناء (build) تعيد تجميعه.

## الشجرة

```
sakanO-main/
├── api/                      ← مدخل Vercel (serverless)
│   └── [[...path]].js
├── lib/                      ← طبقة الـ APIs + قاعدة البيانات + منطق العمل
│   ├── handler.js            خريطة المسارات (routing)
│   ├── services.js           منطق الإقران/المكتبة/الكشف/القرارات + بذرة المنهج (CURRICULUM)
│   ├── firebase.js           تهيئة Firebase Admin
│   ├── content.js            المحتوى المنسَّق (ملخصات/أسئلة)
│   ├── page.js               (مُولَّد) نسخة base64 من index.html — هذا ما يخدمه السيرفر
│   ├── fonts.js · sm.js · ai.js · fakeFirestore.js
│
├── src/
│   ├── index.template.html   ← القالب: يحتوي فتحات {{CSS}} / {{APP}} / {{PWA}}
│   ├── index.html            ← (مُولَّد) الحزمة النهائية — لا تُعدَّل يدويًا
│   ├── css/                  ← فولدر الستايلنج
│   │   ├── _order.json        ترتيب دمج ملفات الـ CSS
│   │   ├── 01-base-theme.css  الخطوط + متغيّرات الثيمات (فاتح/داكن/OLED) + العناصر الأساسية
│   │   ├── 02-nav-controls.css الهامبرجر + كويك أكسيس + محوّل البلاي‑ليست + رؤوس التصنيفات
│   │   ├── 03-drawer.css       الدرج الجانبي (تقسيم زي زاد)
│   │   ├── 04-auth.css         شاشة الدخول الفخمة (تتضمّن صورة الخلفية)
│   │   ├── 05-quicknotes.css   المفكّرة
│   │   ├── 06-pin-lock.css     قفل PIN للجهاز
│   │   └── 07-journey.css      رحلتي
│   ├── js/                   ← فولدر الـ JS (تطبيق الـ SPA مقسوم لأجزاء نصية مرتّبة)
│   │   ├── _js_order.json      ترتيب دمج الأجزاء (مصدر الحقيقة للترتيب)
│   │   ├── 01-config-state.js  الإعداد + كائن الحالة S + قفل الـ PIN
│   │   ├── 02-helpers-api.js   esc · toast · api() · errMsg · save · logout
│   │   ├── 03-ui-shell.js      الدرج (renderDrawer) + الهيدر (renderBar) + الثيم + الشات العائم
│   │   ├── views/              ← كل صفحة من المنيو في ملف خاص بيها (أجزاء من نفس الـ IIFE)
│   │   │   ├── 01-core.js         الحالة المشتركة + موجّه render() + مساعدات عامة
│   │   │   ├── 02-journeys.js     قوائمنا   · 03-mutabaana.js متابعتنا
│   │   │   ├── 04-chat.js         شاتنا     · 05-resource-chat.js نقاش المورد
│   │   │   ├── 06-search.js       البحث     · 07-pinlock.js قفل الـ PIN
│   │   │   ├── 08-quicknotes.js   مفكّرتنا   · 09-home.js الرئيسية
│   │   │   ├── 10-tasks.js        المهام    · 11-budget.js الميزانية · 12-shopping.js المشتريات
│   │   │   ├── 13-settings.js     الإعدادات · 14-onboarding.js الدخول/الإنشاء
│   │   │   ├── 15-library.js      المكتبة + تفاصيل المورد · 16-decisions.js قرارات المورد
│   │   │   ├── 17-myjourney.js    رحلتي     · 18-discussions.js كل المناقشات
│   │   │   └── 19-decisionlog.js  سجلّ القرارات · 20-connect-charter.js تواصلنا + ميثاقنا
│   │   ├── 05-app-main.js      go() + مستمع الأحداث + الإقلاع (يغلق الـ IIFE)
│   │   └── pwa.js             تسجيل service-worker + نافذة التثبيت
│   ├── manifest.json · sw.js · icons/ · media/
│
├── build.mjs                 ← أداة البناء
├── server.js                 ← مدخل Node/Railway
├── vercel.json · firestore.rules · storage.rules · *.md
```

## سير العمل (Workflow)

عدّل المصدر فقط داخل `src/css/*` و أجزاء `src/js/*` (حسب `_js_order.json`) و `src/js/pwa.js`، ثم:

```bash
npm run build      # = node build.mjs
```

أداة البناء:
1. تدمج ملفات `src/css/*` بالترتيب المذكور في `_order.json`.
2. تدمج أجزاء الـ JS بالترتيب المذكور في `_js_order.json` نصيًا (join بدون فواصل) — فالناتج مطابق بايت‑ببايت لملف واحد؛ الـ IIFE يفتح في الجزء الأول ويُغلق في الأخير. ثم تحقن الـ CSS وناتج الـ JS و `pwa.js` داخل `index.template.html`.
3. تكتب `src/index.html` (الحزمة).
4. تُحوّلها base64 وتكتب `lib/page.js` (هذا ما يخدمه السيرفر فعليًا).
5. تتحقّق من سلامة الـ round-trip وتفشل إن حدث أي اختلاف.

> ملاحظة مهمة: `src/index.html` و `lib/page.js` ملفّات **مُولَّدة**؛ أي تعديل يدوي
> عليها سيُمحى عند أول `npm run build`. عدّل دائمًا الـ css/js ثم ابنِ.

## ملاحظة عن «صفحات HTML منفصلة»

التطبيق منشور كـ SPA يحتفظ بحالته في الذاكرة، والملاحة بين الواجهات تتم بالنقر
(`data-act`) لا بإعادة تحميل الصفحة، كما أن وضع الـ PWA/أوفلاين يعتمد على وثيقة واحدة.
لذلك تم الفصل على مستوى **المصدر** (css/js منظّمة + بناء يجمعها) مع إبقاء وثيقة خدمة
واحدة، بدل تحويلها إلى صفحات `.html` مستقلة بإعادة تحميل كاملة — تحويلٌ كان سيكسر
الحالة المشتركة والـ PWA وسرعة الانتقال. لو مطلوب فعلًا MPA كامل، يمكن تنفيذه كخطوة
لاحقة منفصلة.
