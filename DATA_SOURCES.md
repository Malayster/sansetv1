# DATA SOURCES & PIPELINE — Dashboard Pilihan Raya

> **Tujuan:** Dokumen ini merekodkan sumber data, status integrasi, dan
> langkah-langkah untuk agent masa depan. Jangan edit mock data di `kv.ts`
> secara langsung — guna pipeline di bawah.

---

## Ringkasan Status

| Sumber | Data | Status | Tarikh |
|--------|------|--------|--------|
| **Tindak Malaysia** (GitHub) | Demografi, ekonomi (P001–P222) | ✅ Siap | 2026-07-23 |
| **Wikipedia API** (ms.wikipedia.org) | Demografi etnik, penyandang | ⏳ Sebahagian (12/222) | 2026-07-23 |
| **Open Data SPR** (opendata.spr.gov.my) | Calon, keputusan, peta sempadan | ❌ Belum | — |
| **ElectionData.MY** | Backup dataset | ❌ Belum | — |
| **Peta GeoJSON** (OSM → atifmustaffa) | Sempadan Parlimen & DUN NS | ✅ Siap | 2026-07-23 |

---

## Cara Data Mengalir

```
ElectionData.MY Data Lake (CSV/Parquet)
        ↓
scripts/generate-real-data.py         ← main pipeline (Python)
        ↓
data/kv-output/candidates-real.json   ← REAL candidates, ALL seats
data/kv-output/demographics-real.json ← REAL demographics, P-series
        ↓ (imported via resolveJsonModule)
src/lib/kv.ts → getMockValue() → getMockDemographics()
        ↓
election-sidebar.tsx / election-map.tsx
```

**Fallback chain:**
1. `realCandidatesData` / `realDemographicsData` (imported JSON — ElectionData.MY)
2. `mockDemographics` / `mockSentiment` / `mockComments` (hardcoded in kv.ts)
3. `defaultCandidates` / `defaultDemographics` (fallback constants)

## Fail KV & Data

| Key Prefix | Sumber Utama | Format | Liputan |
|-----------|-------------|--------|---------|
| `candidates:{code}` | **ElectionData.MY** (SPR Open Data) | `data/kv-output/candidates-real.json` | 222 P + 36 N ✅ |
| `demographics:{code}` | **Tindak Malaysia** + **ElectionData.MY** | `data/kv-output/demographics-real.json` + `mockDemographics` | 222 P (real) + 36 N (mock) |
| `sentiment:{code}` | Composite AI (mock/simulasi) | `src/lib/kv.ts` → `mockSentiment` | P001-P004 + N01-N36 |
| `comments:{code}` | Social media scraping | `src/lib/kv.ts` → `mockComments` | P001, P002, N01 |

## Fail Data (CSV Source Files)

| Fail | Sumber | Kandungan |
|------|--------|-----------|
| `data/electiondata-federal-ballots.csv` | lake.electiondata.my | All PRU results 1955-2022 (6,937 rows) |
| `data/electiondata-nsn-ballots.csv` | lake.electiondata.my | All NSN DUN results 1959-2026 (1,183 rows) |
| `data/tindak-parsed.json` | GitHub TindakMalaysia | Demographics + economic for all 222 parl. seats |

---

## Arahan Agent Masa Depan

### Sebelum mula cari data:

1. Baca `DATA_SOURCES.md` ini
2. Cek `data/` untuk fail sedia ada
3. Cek `scripts/generate-real-data.py` — **ini pipeline utama sekarang**
4. Cek `src/lib/kv.ts` — data flow via import JSON

### Untuk regenerate data:

```bash
# 1. Muat turun semula CSVs (jika perlu update)
curl -sL "https://lake.electiondata.my/results_headline/headline_ballots_federal.csv" -o data/electiondata-federal-ballots.csv
curl -sL "https://lake.electiondata.my/results_headline/headline_ballots_state_nsn.csv" -o data/electiondata-nsn-ballots.csv

# 2. Generate real data
python3 scripts/generate-real-data.py

# 3. Data diguna automatik oleh src/lib/kv.ts
```

### Untuk update data sedia ada:
- **Jangan edit `src/lib/kv.ts` `mockCandidates` lagi** (ia telah digantikan dengan import JSON)
- Kalau nak tambah election baru, update `scripts/generate-real-data.py`
- Untuk N-series demographics, edit `mockDemographics` di `src/lib/kv.ts`

---

## Open Data SPR

**URL:** https://opendata.spr.gov.my

Endpoint yang mungkin:
- Keputusan PRU: `/api/result/ge15`
- Sempadan: `/api/boundary/parliament`
- Daftar pemilih: `/api/voters`

> Nota: Open Data SPR mungkin perlukan API key atau login. Jika tiada akses,
> guna Tindak Malaysia sebagai backup.

---

## Wiki Wikipedia (ms)

Format page: `{Nama_Kawasan} (kawasan persekutuan)` untuk Parlimen
Format page: `{Nama_Kawasan} (kawasan negeri)` untuk DUN

API: `https://ms.wikipedia.org/w/api.php`
Library: `axios` (already in package.json)

---

## GeoJSON Boundaries

| Fail | Sumber | Kawasan |
|------|--------|---------|
| `public/geojson/pru_parlimen_polygon.json` | OSM (atifmustaffa/malaysia-geojson) | 32 Parlimen |
| `public/geojson/prn_negeri9_dun_polygon.json` | OSM (atifmustaffa/malaysia-geojson) | 36 DUN NS |

Jika nak ganti dengan data Open Data SPR yang lebih tepat:
1. Muat turun shapefile dari opendata.spr.gov.my
2. Tukar ke GeoJSON guna QGIS / mapshaper / ogr2ogr
3. Simpan di `public/geojson/` dengan nama yang sama

---

## Calon PRN 2026 (Mock vs Realiti)

Data calon PRN 2026 di `kv.ts` adalah **mock** kerana PRN 2026 belum
berlangsung. Nama calon penyandang adalah pemenang PRN 2023 yang sebenar.

Untuk dapatkan data sebenar:
1. Tunggu SPR umumkan senarai calon rasmi
2. Atau dapatkan dari portal berita/SPR pada hari penamaan calon

---

## Party Logo Flags

| Fail | Parti | Format |
|------|-------|--------|
| `/flags/bn.svg` | Barisan Nasional | SVG placeholder |
| `/flags/ph.svg` | Pakatan Harapan | SVG placeholder |
| `/flags/pn.svg` | Perikatan Nasional | SVG placeholder |
| `/flags/gps.svg` | GPS | SVG placeholder |
| `/flags/grs.svg` | GRS | SVG placeholder |
| `/flags/warisan.svg` | Warisan | SVG placeholder |
| `/flags/bebas.svg` | Bebas | SVG placeholder |
| `/flags/negeri-sembilan.svg` | Negeri Sembilan | SVG flag |

> **Nota:** Logo SVG sekarang adalah placeholders (text-based). Untuk production,
> ganti dengan PNG sebenar dari sumber rasmi parti.
