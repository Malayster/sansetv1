# 🗞️ Suara Anak Negeri

**Portal berita Malaysia 100% Bahasa Melayu** — Jambatan Suara Rakyat.

Dibina dengan **Next.js 16 + Sanity v6 + DeepSeek V3 AI** untuk penjanaan dan kelulusan berita automatik sepenuhnya.

---

## 📋 Ciri Utama

| Ciri | Status |
|------|--------|
| Portal berita penuh (frontpage, artikel, kategori) | ✅ 60+ artikel BM |
| Sanity Studio CMS | ✅ Admin panel CMS |
| Dashboard analitik | ✅ Trafik, KPI, chart, carian trending |
| AI jana berita (DeepSeek V3) | ✅ RSS rewrite 100% BM |
| Auto-gambar setiap artikel | ✅ Fetch + upload Sanity CDN |
| Kelulusan 1-klik | ✅ Dashboard tanpa Sanity login |
| Sidebar trending + popular | ✅ TERGEMPAR, Berita Popular |
| Build production | ✅ 139 halaman, 0 errors |

---

## 🏗️ Arkitektur

### Stack Teknologi
| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| CMS | Sanity v6.5.0 (headless) |
| AI | DeepSeek V3 (deepseek-chat) |
| Analitik | Custom Sanity-based tracking |
| Charts | Recharts |
| RSS | rss-parser |

### Struktur Direktori
```
src/
├── app/
│   ├── (frontend)/        # Halaman awam
│   ├── (studio)/admin/    # Sanity Studio CMS
│   ├── admin/dashboard/   # Dashboard analitik + AI
│   └── api/
│       ├── analytics/     # API data trafik harian
│       ├── approve/       # API luluskan artikel
│       ├── jana-berita/   # API pipeline AI generate
│       └── track/         # API tracking paparan
├── lib/
│   ├── deepseek.ts        # DeepSeek V3 rewrite engine
│   ├── rss.ts             # RSS parser (4 sumber)
│   ├── image-upload.ts    # Fetch + upload gambar
│   └── analytics.ts       # Tracking enjin
├── sanity/                # 50+ schema types + queries
└── ui/                    # React komponen
    ├── header/            # Navigasi utama
    ├── footer/
    ├── modules/
    │   ├── blog/          # Artikel, preview, sidebar
    │   ├── admin/         # AI trigger
    │   ├── homepage/
    │   └── search/
    └── ...
```

---

## 🤖 Pipeline AI Jana Berita

### 7 Langkah Auto-Generate

1. **Admin klik** 🔍 Cari Berita Terkini di dashboard
2. **Fetch RSS** dari 4 sumber: Bernama, Malaysiakini, Utusan, BH
3. **Filter duplikat** — semak tajuk sedia ada di Sanity
4. **DeepSeek V3 rewrite** — tajuk BM, 3-5 perenggan, kategori, imageKeywords
5. **Fetch gambar** dari LoremFlickr (free) → **upload ke Sanity CDN**
6. **Simpan** ke Sanity: status=pending, aiGenerated=true, metadata.image
7. **Admin klik** ✅ Luluskan → artikel + gambar muncul di frontpage

### API Endpoints

| Endpoint | Kegunaan |
|----------|----------|
| GET/POST `/api/jana-berita` | Trigger pipeline AI generate |
| POST `/api/approve` | Luluskan artikel ({id}) |
| GET `/api/analytics` | Data dashboard |
| POST `/api/track` | Rekod paparan |

---

## 🛠️ Setup

### Requirements
- Node.js 18+, Sanity project (ysnx8rnx), DeepSeek API key (sk-...)

### .env.local
```
NEXT_PUBLIC_SANITY_PROJECT_ID=ysnx8rnx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...
SANITY_API_WRITE_TOKEN=...
DEEPSEEK_API_KEY=sk-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Commands
```
npm install          # Install deps
npm run dev          # localhost:3000 (dev)
npm run build        # Production build
npm start            # localhost:3000 (production)
```

---

## 🚧 11 Masalah & Halangan Dihadapi

### 1. Sanity Missing keys error (insert)
Gagal insert artikel ke Sanity. **Fix:** Auto-generate _key untuk setiap block + reference.

### 2. React unique key warning (homepage)
Kategori sidebar tanpa key. **Fix:** Tambah _id dalam GROQ projection.

### 3. Sanity Studio TextContainer key warning
Bug internal @sanity/ui v6.5.0. **Status:** Belum selesai — harmless, tunggu Sanity fix.

### 4. Artikel AI tak boleh Publish
Tiada button publish untuk AI articles. **Fix:** Tukar createOrReplace ke create(). Tambah custom document action.

### 5. Artikel approved tak muncul frontpage
GROQ hanya filter status=published. **Fix:** Update query ke status in [published, approved].

### 6. Dashboard tunjuk 0 AI Menunggu
Data dashboard tak refresh. **Fix:** Hard refresh browser.

### 7. Preview artikel crash JSON parse error
Presentation preview query filter. **Fix:** Buang status filter dari [slug]/page.tsx.

### 8. npm install timeout
Clean reinstall lambat. **Fix:** Sabar 3-5 minit.

### 9. Dev server Turbopack lambat
First compile lambat. **Fix:** Guna production mode untuk demo.

### 10. Button Luluskan Sanity tak boleh test
Studio perlu login. **Fix:** Bina button di dashboard — tanpa Studio login.

### 11. Tiada gambar pada artikel AI
Pipeline asal tak include gambar. **Fix:** Tambah imageKeywords ke DeepSeek prompt → fetch LoremFlickr → upload Sanity → attach metadata.image.

---

## 📊 Progress

### ✅ Selesai
Portal berita, Sanity CMS, Dashboard analitik, AI pipeline (RSS→DeepSeek→Sanity), Auto-gambar, Button Luluskan dashboard, Frontpage approved articles, Sidebar, Mobile responsive, 139 halaman 0 errors

### 🔄 Dalam Progress
- TASK-001: News layout sidebars + PRU election prediction block
- Sanity TextContainer warning (tunggu upstream fix)

### 📅 Akan Datang
PRU election block, Komen pembaca, Newsletter, Dark mode, Multi-author

---

## 🗂️ Skema blog.post

| Field | Type | Keterangan |
|-------|------|------------|
| title | string | Tajuk artikel |
| content | block[] | Portable text + inline images |
| publishDate | date | Tarikh terbit |
| status | enum | draft/pending/approved/published |
| aiGenerated | boolean | Dijana AI |
| categories | reference[] | Kategori |
| metadata | object | SEO + featured image |

### Status Flow
draft → pending → approved → published (approved = diluluskan dari dashboard)

---

## 🔑 Kunci API

| Key | Kegunaan |
|-----|----------|
| DEEPSEEK_API_KEY | DeepSeek V3 rewrite artikel |
| SANITY_API_WRITE_TOKEN | Tulis ke Sanity |
| SANITY_API_READ_TOKEN | Baca dari Sanity |

---

## 👨‍💻 Developer Notes

### Tambah RSS source (src/lib/rss.ts)
```
{ name: 'Sumber Baru', url: 'https://example.com/rss' }
```

### Debug pipeline
```
curl -X POST http://localhost:3000/api/jana-berita
```

### Query Sanity
```
curl "https://ysnx8rnx.api.sanity.io/v2025-07-18/data/query/production?query=*[_type==\"blog.post\"&&aiGenerated==true]{_id,title,status}"
```

---

*Dokumentasi dijana oleh OpenHands AI bagi pihak Suara Anak Negeri — 18 Julai 2026*
