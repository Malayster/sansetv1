# Suara Anak Negeri — Pelan, Rancangan & Sejarah Perbualan

> Disimpan: 2026-07-19

---

## 📋 Keperluan Asal (Original Requirements)

1. **suaraanaknegeri.com** — bina sepenuhnya dalam Bahasa Malaysia
2. **Left/Right sidebars** — di Himpunan Berita dan frontpage
3. **Category blocks** — paparan berita ikut kategori
4. **Election prediction** — module ramalan pilihan raya
5. **Top navigation** — navigasi utama
6. **Semua artikel mesti ada gambar**
7. **Approval restricted** — user/admin sahaja, tiada auto-approve
8. **Rewrite AI** — semua artikel mesti ditulis semula oleh AI (DeepSeek), bukan copy-paste dari RSS

---

## ✅ Selesai (Completed)

### 1. Fix Approve Button Crash
- **Commit:** `7e428d6`
- **Isu:** Button "Luluskan" crash — `Cannot read properties of undefined (reading 'length')`
- **Punca:** `useDocumentOperation` mengakses `.length` pada `id` yang undefined
- **Fix:** Ganti dengan `fetch('/api/approve')` secara direct
- **Fail:** `src/sanity/structure/approveAction.ts`

### 2. Sidebar Kiri + Kanan di Himpunan Berita
- **Commit:** `8de6fb4`
- **Schema:** Tambah `leftSidebar` dan `rightSidebar` fields (type `sidebar`) dalam `page.ts` schema
- **Frontend:** `[[...slug]]/page.tsx` — layout grid sidebars + content guna komponen `Sidebar` sedia ada
- **Config:** Sidebar dikonfigurasi melalui Sanity page document (modules: Callout, HTML, Table of Contents)

### 3. Sidebar Kiri + Kanan di Frontpage
- **Commit:** `b364318`
- **Implementasi:** `homepage/index.tsx` — fetch page document dengan sidebar fields, render left/right sidebars
- **Default:** Kalau sidebar kosong di Sanity, fallback ke sidebar default (Kategori, Berita Terkini, Paling Popular, Galeri, Tag)

### 4. Category Filtering (`/berita?category=X`)
- **Commit:** `d212118`
- **Page:** `/berita?category=dunia` dan semua kategori berfungsi
- **Mekanisme:** `nuqs` `useQueryState('category')` sync URL param dengan filter UI
- **Filter:** `PaginatedPosts` client-side filter — `post.categories?.some(c => c.slug?.current === category)`
- **Top nav:** Semua link navigasi guna `?category=X` format
- **Tambahan:** `blog-post-list` module — category prop threading untuk future use

### 5. FooterContent Unknown Field Warning
- **Commit:** `83c269b`
- **Isu:** Warning "Unknown field `footerContent`" dalam Sanity Studio
- **Fix:** Tambah field `footerContent` sebagai deprecated/hidden dalam `site.ts` schema

### 6. Build Fix — Slug `%2F` Error
- **Commit:** `83c269b`
- **Isu:** `generateStaticParams` prepend `/` pada slug menyebabkan route `/%2F...`
- **Fix:** Tanggalkan prefix `/` — guna `metadata.slug.current` terus

---

## ⚠️ Masih Aktif / Perlu Perhatian

### TK-6: Upload/Delete/Edit Gambar di Sanity Studio
- **Status:** Belum selesai
- **Issue:** User tak boleh upload, delete, atau edit gambar dalam Sanity Studio
- **Kemungkinan punca:** CORS, permissions, atau `sanity-plugin-media` config

### Election Prediction Module
- **Status:** Belum mula
- **Perlu:** Design spec dengan user

### Category Blocks (custom blocks per category)
- **Status:** Belum mula
- **Perlu:** Design spec dengan user

### Rewrite AI Pipeline
- **Status:** Pipeline wujud (`Jana Berita` + `Tulis Semula AI`) tapi artikel sedia ada tak melalui pipeline
- **Pemerhatian:** Badan artikel dalam BM, tapi tajuk masih English. Field `aiGenerated` missing pada artikel lama.
- **API Routes:**
  - `POST /api/tulis-semula` — rewrite satu artikel (guna DeepSeek)
  - `GET /api/jana-berita` — bulk import dari RSS + rewrite
- **Perlu:** Bulk rewrite semua artikel sedia ada ATAU user trigger manual satu-satu

---

## 🗂️ Struktur Kod Penting

| Fail | Fungsi |
|------|--------|
| `src/sanity/schemaTypes/documents/blog.post.ts` | Schema artikel (aiGenerated, status, categories) |
| `src/sanity/schemaTypes/documents/page.ts` | Schema page (leftSidebar, rightSidebar) |
| `src/sanity/schemaTypes/documents/site.ts` | Site settings (footerContent deprecated) |
| `src/app/(frontend)/[[...slug]]/page.tsx` | Page catch-all — sidebar layout |
| `src/app/(frontend)/berita/[slug]/page.tsx` | Individual article page |
| `src/ui/modules/blog/blog-index/` | Himpunan Berita (FilterList, PaginatedPosts, store) |
| `src/ui/modules/blog/blog-post-list.tsx` | Blog post list module |
| `src/ui/modules/blog/filter.tsx` | Category filter button (client component) |
| `src/ui/modules/blog/filter-list.tsx` | Category filter list (server component) |
| `src/ui/modules/index.tsx` | ModulesResolver — routing modules ke components |
| `src/ui/homepage/index.tsx` | Frontpage renderer |
| `src/app/api/approve/route.ts` | Approve API endpoint |
| `src/app/api/tulis-semula/route.ts` | Single article rewrite API |
| `src/app/api/jana-berita/route.ts` | Bulk RSS import + rewrite API |
| `src/lib/deepseek.ts` | DeepSeek API client — rewriteArticle() |
| `src/sanity/structure/approveAction.ts` | Sanity document action "Luluskan" |

---

## 🔑 API Keys & Environment

- `DEEPSEEK_API_KEY` — untuk rewrite artikel
- `SANITY_API_WRITE_TOKEN` — untuk write ke Sanity
- `SANITY_API_READ_TOKEN` — untuk read dari Sanity

---

## 📝 Sejarah Perbualan Penting

1. **User:** "Fix Approve button crash" → Selesai `7e428d6`
2. **User:** "Masukkan left dan right sidebar pada Himpunan Berita dan frontpage" → Selesai `8de6fb4`, `b364318`
3. **User:** "http://localhost:3000/berita?category=dunia mana selesai lagi" → Dijelaskan: kategori filtering dah berfungsi guna `nuqs` + `useQueryState`
4. **User:** "Aku nak rest, kamu makin terlebih pandai buat kerja tanpa ikut arahan" → Diberhentikan, tunggu arahan
5. **User:** "Semua post artikel adalah copy paste? Mana rewrite?" → Dijelaskan: badan artikel BM, tajuk English. Pipeline wujud tapi artikel lama tak dikemaskini
6. **User:** "Unknown field footerContent" → Selesai `83c269b`
7. **User:** Error stack `Cannot read properties of undefined (reading 'length')` → Dijelaskan: cache browser, rebuild + incognito

---

## 🚀 Server

- **Frontend:** `http://localhost:3000`
- **Sanity Studio:** `http://localhost:3000/admin`
- **Start:** `npx next build && npx next start --port 3000`
