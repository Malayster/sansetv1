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
| `data/tindak-parsed.json` | TindakMalaysia/General-Election-Data | Demographics + economic for all 222 parl. seats |

---

## SUMBER UTAMA: Tindak Malaysia @ GitHub

**Organisasi:** https://github.com/TindakMalaysia
**25 repositories** — semua data pilihan raya Malaysia dari 1955 hingga kini.

### 1. General-Election-Data ⭐
**URL:** https://github.com/TindakMalaysia/General-Election-Data
**Isi:** Dataset demografi & ekonomi BUKAN keputusan pilihan raya per kawasan.
- Demografi pengikut (2024, 2025) — umur, jantina, etnik
- Data ekonomi per kawasan (Pendapatan, GINI, kemiskinan)
- Saiz kawasan (Parlimen & DUN)
- Peratusan keluar mengundi (2008-2018)
- Undi pos
- **Negeri Sembilan postal voting data added 20 Jul 2026**
- **Format:** CSV
- **Cara guna:** `scripts/fetch-tindak.ts` (existing) atau `scripts/generate-real-data.py`

### 2. HISTORICAL-ELECTION-RESULTS ⭐ (22 stars, updated 22 Jul 2026!)
**URL:** https://github.com/TindakMalaysia/HISTORICAL-ELECTION-RESULTS
**Isi:** Keputusan pilihan raya Malaysia LENGKAP — semua tahun.
- **1,962 commits** — sangat aktif, maintainer utama: daneshchacko
- Liputan: 1955, 1959, 1964, 1969, 1974, 1978, 1982, 1986, 1990, 1995, 1999, 2004, 2008, 2013, 2018, 2022 (Federal)
- Semua PRN negeri: 2023-PRN6 (6 negeri), 2022-Johor, 2021-Melaka, 2021-Sarawak, 2025-Sabah
- **2026-JOHOR-STATE-ELECTIONS** + **2026-NEGERI-SEMBILAN-STATE-ELECTIONS**
- Fail utama untuk PRN 2023 (6 negeri):
  - `MALAYSIA_PRN6_2023_ELECTION_RESULTS.csv` (57 KB) — keputusan penuh
  - `MALAYSIA_PRN6_2023_WINNING_CANDIDATES.csv` (22 KB) — calon menang
  - `MALAYSIA_PRN6_2023_DUN_COMPOSITION.csv` (43 KB) — komposisi DUN
  - `MALAYSIA_PRN6_2023_DUN_CANDIDATE_SEX_BREAKDOWN.csv` — jantina calon
- **Format:** CSV
- **Cara guna:** Muat turun CSV terus dari GitHub, kemudian proses dengan `scripts/generate-real-data.py`

### 3. Peta & Sempadan (Shapefiles/GeoJSON)
Tindak Malaysia ada repositori **per-state** untuk sempadan pilihan raya:

| Negeri | Repo | GeoJSON |
|--------|------|---------|
| **Negeri Sembilan** | [Negeri-Sembilan-Maps](https://github.com/TindakMalaysia/Negeri-Sembilan-Maps) | `Negeri_Sembilan_DUN_2015.geojson` ✅ |
| Selangor | [Selangor-Maps](https://github.com/TindakMalaysia/Selangor-Maps) ⭐22 | |
| Johor | [Johor-Maps](https://github.com/TindakMalaysia/Johor-Maps) | |
| Kedah | [Kedah-Maps](https://github.com/TindakMalaysia/Kedah-Maps) | |
| Kelantan | [Kelantan-Maps](https://github.com/TindakMalaysia/Kelantan-Maps) | |
| Melaka | [Malacca-Maps](https://github.com/TindakMalaysia/Malacca-Maps) | |
| Pahang | [Pahang-Maps](https://github.com/TindakMalaysia/Pahang-Maps) | |
| Penang | [Penang-Maps](https://github.com/TindakMalaysia/Penang-Maps) ⭐5 | |
| Perak | [Perak-Maps](https://github.com/TindakMalaysia/Perak-Maps) | |
| Perlis | [Perlis-Maps](https://github.com/TindakMalaysia/Perlis-Maps) | |
| Sabah | [Sabah-Maps](https://github.com/TindakMalaysia/Sabah-Maps) | |
| Terengganu | [Terengganu-Maps](https://github.com/TindakMalaysia/Terengganu-Maps) | |
| WP KL/Putrajaya/Labuan | [Federal-Territories-Maps](https://github.com/TindakMalaysia/Federal-Territories-Maps) ⭐10 | |

Setiap repositori mengandungi:
- `*_DUN_2015.geojson` — Sempadan DUN (2015 delimitation)
- `*_PAR_2015.geojson` — Sempadan Parlimen (2015 delimitation)
- `*_DM_2015.geojson` — Daerah Mengundi (DM)
- `*_PBT_2015.geojson` — Pihak Berkuasa Tempatan
- Metadata dalam CSV

### 4. Repositori Lain (berguna)

| Repo | Tujuan |
|------|--------|
| [LOCAL-GOVERNMENT-ELECTIONS](https://github.com/TindakMalaysia/LOCAL-GOVERNMENT-ELECTIONS) | Pilihan Raya Kerajaan Tempatan |
| [Historical-Electoral-Demographic-Data](https://github.com/TindakMalaysia/Historical-Electoral-Demographic-Data) | Data demografi pilihan raya bersejarah |
| [Redelineation-Exercises](https://github.com/TindakMalaysia/Redelineation-Exercises) | Dataset persempadanan semula (untuk ERA) |
| [Historical-Redelineation-Exercises-of-Malaysia](https://github.com/TindakMalaysia/Historical-Redelineation-Exercises-of-Malaysia) | Persempadanan semula bersejarah |
| [Historical-Election-Boundaries-ARCHIVED-](https://github.com/TindakMalaysia/Historical-Election-Boundaries-ARCHIVED-) | Sempadan pilihan raya lama 1955-2018 (Unlicense) |
| [National-Election-Results](https://github.com/TindakMalaysia/National-Election-Results) | Score sheets keputusan (Bahasa Melayu) |
| [Election-Results](https://github.com/TindakMalaysia/Election-Results) | Laman web hasil pilihan raya (HTML) |
| [By-Elections](https://github.com/TindakMalaysia/By-Elections) | Keputusan PRK (akan datang) |
| [EC-Redelineation-Proposal-2016](https://github.com/TindakMalaysia/EC-Redelineation-Proposal-2016) | PDF cadangan persempadanan SPR 2016 |

### Cara Muat Turun dari Tindak Malaysia

```bash
# Demografi terkini (raw GitHub)
curl -sL "https://raw.githubusercontent.com/TindakMalaysia/General-Election-Data/master/2025%20ELECTORAL%20DEMOGRAPHICS/MALAYSIA_AUGUST_2025_PARLIAMENT_COMPOSITION.csv" -o data/tindak-2025-demographics.csv

# Ekonomi
curl -sL "https://raw.githubusercontent.com/TindakMalaysia/General-Election-Data/master/ECONOMIC_DATA_BY_CONSTITUENCY/KEY%20ECONOMIC%20DATA%20BY%20PARLIAMENTARY%20SEAT%20(2022).csv" -o data/tindak-2022-economic.csv

# PRN 2023 results (6 negeri)
curl -sL "https://raw.githubusercontent.com/TindakMalaysia/HISTORICAL-ELECTION-RESULTS/main/2023-PRN6-STATE-ELECTIONS/MALAYSIA_PRN6_2023_ELECTION_RESULTS.csv" -o data/tindak-prn6-2023-results.csv
curl -sL "https://raw.githubusercontent.com/TindakMalaysia/HISTORICAL-ELECTION-RESULTS/main/2023-PRN6-STATE-ELECTIONS/MALAYSIA_PRN6_2023_WINNING_CANDIDATES.csv" -o data/tindak-prn6-2023-winners.csv
curl -sL "https://raw.githubusercontent.com/TindakMalaysia/HISTORICAL-ELECTION-RESULTS/main/2023-PRN6-STATE-ELECTIONS/MALAYSIA_PRN6_2023_DUN_COMPOSITION.csv" -o data/tindak-prn6-2023-composition.csv

# GeoJSON Negeri Sembilan (sempadan DUN)
curl -sL "https://raw.githubusercontent.com/TindakMalaysia/Negeri-Sembilan-Maps/main/Negeri-Sembilan_DUN_2015/Negeri_Sembilan_DUN_2015.geojson" -o public/geojson/tindak-ns-dun-2015.geojson

# GE15/PRU 2022 Parlimen results
curl -sL "https://raw.githubusercontent.com/TindakMalaysia/HISTORICAL-ELECTION-RESULTS/main/2022-ELECTION-RESULTS/MALAYSIA_2022_PARLIAMENT_RESULTS.csv" -o data/tindak-ge15-results.csv
```

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
