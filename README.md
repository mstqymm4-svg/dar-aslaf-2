# 📚 دار العلوم (DAR UL ULOOM) — المكتبة الإسلامية الرقمية

منصة رقمية متكاملة للكتب والبحوث الإسلامية بصيغة PDF، المحاضرات والفيديوهات وقنوات اليوتيوب العلمية، مع نظام إدارة محتوى متقدم ومصادقة مستخدمين ووضع العمل دون اتصال بالإنترنت (Offline Mode).

---

## 🌟 الميزات الرئيسية
- **المكتبة الرقمية**: تصفح، بحث، وفلترة الكتب الإسلامية مع عارض PDF متقدم وتحميل للقراءة دون اتصال.
- **المرئيات والمحاضرات**: مكتبة فيديوهات وقنوات دعوية مع دعم YouTube IFrame وoEmbed التلقائي.
- **مصادقة آمنة ومستقلة**: تسجيل دخول وإنشاء حسابات عبر JWT مع نظام أدوار (مستخدم / مدير / مشرف عام).
- **لوحة تحكم وإدارة المحتوى**: إضافة وتعديل الكتب، الفيديوهات، القنوات، التصنيفات، والمؤلفين.
- **مركز تحكم المطورين (`/dev`)**: تخصيص الخطوط، الألوان، الثيمات، النسخ الاحتياطي، وإدارة النظام (رمز الدخول الافتراضي: `42891`).
- **طبقة بيانات مزدوجة ومرنة**:
  - تعمل بالكامل مع الخادم المستقل (Express + Prisma + PostgreSQL).
  - تعمل تلقائياً دون خادم في وضع Offline عبر IndexedDB والتخزين المحلي، فلا يتوقف التطبيق أبداً.

---

## 🏗️ هيكلية المشروع

```
DAR-AS-SALAF/
├── src/                     # الواجهة الأمامية (React + Vite + TailwindCSS)
│   ├── api/                 # عميل API المتوافق
│   ├── components/          # مكونات واجهة المستخدم
│   ├── lib/                 # طبقة البيانات والواجهات (dataSource, offlineSync, auth)
│   │   ├── api/             # استدعاءات REST API المستقلة
│   │   ├── dataSource.js    # واجهة التبديل الذكي بين الـ API والـ IndexedDB
│   │   └── AuthContext.jsx  # سياق المصادقة وإدارة الجلسات
│   └── pages/               # صفحات التطبيق (Home, Books, Videos, Admin, Login, ...)
├── backend/                 # الخادم المستقل (Node.js + Express + TypeScript + Prisma)
│   ├── prisma/              # مخطط قاعدة البيانات (schema.prisma) وبيانات البداية (seed.ts)
│   ├── src/                 # مسارات ووحدات تحكم الـ API (Auth, Books, Videos, Users, ...)
│   └── uploads/             # مجلد تخزين الملفات والكتب المرفوعة محلياً
└── public/                  # أيقونات PWA والملفات الثابتة
```

---

## 🚀 التشغيل المحلي (Local Development)

### 1. تثبيت الاعتماديات
```bash
# تثبيت اعتماديات الواجهة الأمامية
npm install

# تثبيت اعتماديات الخادم الخلفي
cd backend
npm install
cd ..
```

### 2. إعداد متغيرات البيئة
- قم بإنشاء ملف `.env` في المجلد الرئيسي:
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_INDEPENDENT_API=true
```
- قم بإنشاء ملف `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dar_al_uloom?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800
```

### 3. إعداد قاعدة البيانات وتوليد المخطط
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

> **حساب المشرف الافتراضي بعد الـ Seed:**
> - البريد الإلكتروني: `admin@dar-al-uloom.com`
> - كلمة المرور: `Admin@123456`

### 4. تشغيل التطبيق
```bash
# تشغيل الخادم الخلفي (في نافذة Terminal 1)
npm run server
# أو: cd backend && npm run dev

# تشغيل الواجهة الأمامية (في نافذة Terminal 2)
npm run dev
```

افتح المتصفح على: `http://localhost:5173`

---

## 🌐 النشر على الإنترنت (Deployment)

### أولاً: نشر الواجهة الأمامية (Vercel أو Netlify)
1. اربط مستودع GitHub بـ Vercel / Netlify.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. أضف متغير البيئة:
   - `VITE_API_URL`: رابط الخادم الخلفي بعد نشره (مثال: `https://api.yourdomain.com/api`).
   - `VITE_USE_INDEPENDENT_API`: `true`.

### ثانياً: نشر الخادم وقاعدة البيانات (Render أو Railway أو VPS)
1. **قاعدة البيانات**: أنشئ قاعدة بيانات PostgreSQL مجانية على Neon.tech أو Supabase أو Railway، واحصل على `DATABASE_URL`.
2. **الخادم الخلفي**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run prisma:deploy && npm start`
   - اضبط متغيرات البيئة كما في `backend/.env.example`.
