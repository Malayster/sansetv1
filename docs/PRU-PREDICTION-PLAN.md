# Pelan: Analisis Ramalan PRU Malaysia (DeepSeek AI)

> **Status:** Perancangan | **Tarikh:** 18 Julai 2026
> **Inspirasi:** [mymp.org.my](https://mymp.org.my/) — data-driven MP tracking & scoring
> **Prompt Engine:** DeepSeek Chat API (`deepseek-chat`)
> **Bahasa:** 100% Bahasa Melayu

---

## 🎯 Objektif

Membina seksyen "Analisis Ramalan PRU-16" di homepage Suara Anak Negeri — menggabungkan **data sebenar kerajaan** (data.gov.my) dengan **analisis AI** (DeepSeek) untuk memberi pembaca gambaran ramalan pilihan raya secara data-driven.

---

## 🗺️ Lokasi di Homepage (Flow)

```
Tagline
  ↓
Hero Featured (1 berita utama + 3 sidebar)
  ↓
Headline Carousel (4 berita)
  ↓
Berita Sensasi Dalam Negeri (5 kad kategori)
  ↓
Berita Terbaru (senarai + sidebar Popular)
  ↓
🆕 ANALISIS RAMALAN PRU-16          ← SEKSYEN BARU
  ↓
Topik Pilihan (grid 4×2)
  ↓
MegaFooter CTA
```

**Fail:** `src/ui/modules/homepage/pru-prediction.tsx` (Client Component)
**Panggilan:** Dalam `src/ui/modules/homepage/index.tsx`, selepas `<section>` Berita Terbaru

---

## 📊 Data Pipeline

### Sumber 1: data.gov.my (API Kerajaan)

| ID Dataset (anggaran) | Perkara | Kekerapan |
|------------------------|---------|-----------|
| `pop_parlimen` | Populasi ikut kawasan Parlimen (2020–2022) | Statik |
| `hies_parlimen` | Pendapatan isi rumah median & min ikut Parlimen (2019–2024) | Statik |
| `kemiskinan_parlimen` | Kadar kemiskinan ikut Parlimen (2019–2024) | Statik |
| `ginilorenz_parlimen` | Gini coefficient (ketidaksamaan) ikut Parlimen | Statik |
| `perbelanjaan_parlimen` | Perbelanjaan bulanan isi rumah ikut Parlimen | Statik |

**API Base:** `https://api.data.gov.my/data-catalogue?id=<dataset>&type=meta`
**Nota:** ID dataset tepat perlu disahkan melalui katalog atau network tab.

### Sumber 2: Data PRU-15 (Manual JSON)

Fail static: `src/data/pru-15-results.json`

```json
{
  "last_updated": "2026-07-18",
  "source": "SPR Malaysia",
  "total_seats": 222,
  "results": {
    "PH": { "seats_won": 82, "leader": "Anwar Ibrahim", "color": "#CC0000" },
    "PN": { "seats_won": 74, "leader": "Muhyiddin Yassin", "color": "#006600" },
    "BN": { "seats_won": 30, "leader": "Ahmad Zahid Hamidi", "color": "#000080" },
    "GPS": { "seats_won": 23, "leader": "Abang Johari", "color": "#8B4513" },
    "GRS": { "seats_won": 6, "leader": "Hajiji Noor", "color": "#4169E1" },
    "WARISAN": { "seats_won": 3, "leader": "Shafie Apdal", "color": "#FF8C00" },
    "BEBAS": { "seats_won": 2, "leader": "—", "color": "#808080" },
    "LAIN": { "seats_won": 2, "leader": "—", "color": "#A9A9A9" }
  },
  "swing_states": [
    { "state": "Selangor", "total": 22, "marginal_seats": 8, "current_lead": "PH" },
    { "state": "Johor", "total": 26, "marginal_seats": 10, "current_lead": "BN" },
    { "state": "Kedah", "total": 15, "marginal_seats": 6, "current_lead": "PN" },
    { "state": "Sabah", "total": 25, "marginal_seats": 12, "current_lead": "GRS" },
    { "state": "Perak", "total": 24, "marginal_seats": 9, "current_lead": "PN" },
    { "state": "Kelantan", "total": 14, "marginal_seats": 3, "current_lead": "PN" }
  ],
  "constituencies": [
    {
      "code": "P001",
      "name": "Padang Besar",
      "state": "Perlis",
      "winner": "PN",
      "majority": 12345,
      "voter_count": 67890
    }
  ]
}
```

### Sumber 3: DeepSeek API

- **Endpoint:** `https://api.deepseek.com/v1/chat/completions`
- **Model:** `deepseek-chat`
- **Auth:** `Authorization: Bearer $DEEPSEEK_API_KEY`
- **Prompt:** BM — minta output JSON berstruktur

### Caching Strategy

```
Sanity Document: pru-prediction
  ├─ _id: "pru-prediction-latest"
  ├─ generatedAt: datetime
  ├─ expiresAt: datetime (+24jam)
  ├─ rawResponse: text (DeepSeek raw)
  └─ parsed: JSON object (kerusi, negeri, mp)
```

**Refresh Logic:**
1. Fetch dari Sanity `pru-prediction-latest`
2. Jika `expiresAt < now()` ATAU document tak wujud → call DeepSeek API
3. Simpan response ke Sanity
4. Papar data dari Sanity (fast, cached)
5. Fallback: jika API down, guna data hardcoded static

---

## 🤖 DeepSeek Prompt (BM)

```
Anda seorang penganalisis politik Malaysia yang pakar dalam pilihan raya.
Berikan analisis ramalan PRU-16 berdasarkan data berikut:

DATA PRU-15:
- PH: 82 kerusi (Anwar Ibrahim)
- PN: 74 kerusi (Muhyiddin Yassin)
- BN: 30 kerusi (Ahmad Zahid Hamidi)
- GPS: 23 kerusi (Abang Johari)
- GRS: 6 kerusi (Hajiji Noor)
- WARISAN: 3 kerusi (Shafie Apdal)
- BEBAS: 2 kerusi
- LAIN-LAIN: 2 kerusi

DATA DEMOGRAFI PARLIMEN (dari data.gov.my):
{paste population + income + poverty data}

BERIKAN OUTPUT DALAM FORMAT JSON SAHAJA (tanpa markdown):
{
  "unjuran_kerusi": {
    "PH": { "min": number, "max": number, "ramalan": number, "ulasan": "string (BM)" },
    "PN": { ... },
    "BN": { ... },
    "GPS": { ... },
    "GRS": { ... },
    "WARISAN": { ... },
    "BEBAS_LAIN": { ... }
  },
  "negeri_tumpuan": [
    {
      "negeri": "string",
      "jumlah_kerusi": number,
      "kerusi_marginal": number,
      "parti_dominan_semasa": "string",
      "ramalan": "string (BM - 2-3 ayat)",
      "faktor_utama": ["string", "string", "string"]
    }
  ],
  "mp_berpengaruh": [
    {
      "nama": "string",
      "parti": "string",
      "kawasan": "string",
      "sebab": "string (BM)"
    }
  ],
  "analisis_ringkasan": "string (BM - 3-4 ayat)",
  "sentimen_semasa": "string (PH_mengukuh | PN_mencabar | BN_pemulihan | tidak_pasti)"
}
```

---

## 🎨 Rekabentuk UI

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  ANALISIS RAMALAN PRU-16  [Lencana: "Dijana AI • Rujukan"]│
│  ──────────────────────────────────────────────────────── │
│                                                           │
│  ┌─────────────────────┐  ┌─────────────────────────────┐ │
│  │ ANALISIS RINGKASAN   │  │ SENTIMEN SEMASA             │ │
│  │ (3-4 ayat naratif)  │  │ PH Mengukuh / PN Mencabar  │ │
│  └─────────────────────┘  └─────────────────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ UNJURAN KERUSI PARLIMEN (Horizontal Bar Chart)        │ │
│  │ PH   ████████████████████░░  85-96 kerusi             │ │
│  │ PN   ██████████████████░░░░  70-82 kerusi             │ │
│  │ BN   ████████░░░░░░░░░░░░░░  28-35 kerusi             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ NEGERI TUMPUAN (Swing States) — grid 3×2              │ │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐               │ │
│  │ │ SELANGOR │ │  JOHOR   │ │  KEDAH   │               │ │
│  │ │ 22 kerusi│ │ 26 kerusi│ │ 15 kerusi│               │ │
│  │ │ 8 marginal│ │10 marginal│ │ 6 marginal│               │ │
│  │ └──────────┘ └──────────┘ └──────────┘               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ MP BERPENGARUH — 3 kad horizontal                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ⚠️ PENAFIAN: Analisis ini dijana oleh AI dan          │ │
│  │ bertujuan untuk rujukan sahaja.                       │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Skema Warna Parti

| Parti | Warna | Tailwind |
|-------|-------|----------|
| PH | `#CC0000` | `bg-merah` |
| PN | `#006600` | `bg-[#006600]` |
| BN | `#000080` | `bg-[#000080]` |
| GPS | `#8B4513` | `bg-[#8B4513]` |
| GRS | `#4169E1` | `bg-[#4169E1]` |
| WARISAN | `#FF8C00` | `bg-[#FF8C00]` |
| BEBAS/LAIN | `#808080` | `bg-kelabu` |

---

## 🔧 Teknikal — Struktur Fail

```
src/
├── data/
│   └── pru-15-results.json              # Static data PRU-15 (222 kerusi)
├── ui/modules/homepage/
│   ├── index.tsx                         # Tambah <PRUPrediction />
│   └── pru-prediction.tsx                # KOMPONEN UTAMA (Client Component)
└── app/api/pru-predict/
    └── route.ts                          # API Route: proxy ke DeepSeek
```

### `/api/pru-predict/route.ts`

```ts
import { NextResponse } from 'next/server'
import pruData from '@/data/pru-15-results.json'

export async function GET() {
  const prompt = buildPrompt(pruData) // bina prompt BM
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })
  const data = await res.json()
  const parsed = JSON.parse(data.choices[0].message.content)
  return NextResponse.json(parsed)
}
```

### `.env.local`

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

---

## 📈 Fasa Pembangunan

### Fasa 1: MVP Static ⏱️ 3-4 jam

- [ ] Cipta `src/data/pru-15-results.json`
- [ ] Setup `/api/pru-predict/route.ts`
- [ ] Bina `pru-prediction.tsx`:
  - [ ] Ringkasan AI + Sentimen Semasa
  - [ ] Unjuran kerusi (bar chart CSS native)
  - [ ] 6 Negeri Tumpuan (card grid)
  - [ ] 3 MP Berpengaruh
  - [ ] Penafian
- [ ] Integrasi ke `homepage/index.tsx`
- [ ] Responsif (mobile stack, tablet grid 2)

### Fasa 2: data.gov.my ⏱️ 2-3 jam

- [ ] Cari ID dataset tepat
- [ ] Fetch data populasi + ekonomi Parlimen
- [ ] Enrich prompt DeepSeek
- [ ] Update JSON output

### Fasa 3: Visualisasi ⏱️ 4-5 jam

- [ ] Peta Parlimen SVG/Leaflet
- [ ] Filter & sort interaktif
- [ ] Animasi transition
- [ ] Sanity CMS admin panel
- [ ] Cron job auto-refresh

---

## ⚠️ Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| DeepSeek output bukan JSON valid | Retry 3×, fallback static data |
| DeepSeek hallucinate data | Label "AI" + penafian. Prompt di-lock ke data PRU-15 |
| API rate limit | Cache 24 jam |
| data.gov.my API down | Fallback static JSON (Fasa 1) |
| Kontroversi politik | Penafian jelas. Guna data & AI neutral |
| Mobile UX sempit | Bar chart pendek, grid 1 column |

---

*Dokumen ini dijana oleh AI (OpenHands) bagi pihak pasukan Suara Anak Negeri.*
