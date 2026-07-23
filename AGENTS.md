<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:election-data-sources -->

# Data Sources: ALWAYS check DATA_SOURCES.md first

Before fetching or modifying any election data, read `DATA_SOURCES.md` in the project root. It documents:

- **Tindak Malaysia** — 25 GitHub repos with demographics, historical results, GeoJSON maps
  - `General-Election-Data`: demographics + economic data (CSV)
  - `HISTORICAL-ELECTION-RESULTS`: complete election results 1955-2026 (1,962 commits!)
  - `Negeri-Sembilan-Maps`: DUN/Parliament GeoJSON boundaries
- **ElectionData.MY** — Data lake with Parquet/CSV for all PRU + PRN results
- **Wikipedia (ms)** — Demografi etnik per-DUN via `action=raw`, pie chart parsing
- **Open Data SPR** — `opendata.spr.gov.my` (Next.js app, CSV download)

Data pipeline: `scripts/generate-real-data.py` → `data/kv-output/*.json` → `src/lib/kv.ts` (imported via resolveJsonModule)

## Demografi Terkini per-DUN

Demografi etnik per DUN (34/36 seat) datang dari **Wikipedia Bahasa Melayu**:
- `scripts/fetch-dun-wiki.py` → `data/kv-output/dun-wiki-demographics.json`
- Scrapes `action=raw` wikitext → extracts Pie Chart label/value → ethnic %
- Juga dapat pemilih berdaftar per tahun dari `{{MASelec/total|Pemilih berdaftar|X}}`
- Ekonomi (medianIncome, gini, poverty) dari Tindak Parliament-level → mapping DUN→P

**Nota:** Seats N13 (Sikamat) & N16 (Seri Menanti) tiada pie chart — guna fallback 55/25/15/5.

## Cara Update Demografi

```bash
# 1. Scrape semula dari Wikipedia
python3 scripts/fetch-dun-wiki.py

# 2. Regenerate data pipeline
python3 scripts/generate-real-data.py
```

<!-- END:election-data-sources -->

<!-- BEGIN:architecture-election-pack -->

# 🏗️ Architecture: Election Pack + RegionService

## Konsep

Setiap pilihan raya (PRN/PRU) ada **Election Pack** — satu folder dalam `data/elections/{id}/`:

```
data/elections/
  prn-ns-2026/
    config.json       ← mapping DUN→PAR, GeoJSON, metadata
    (future: results.json, candidates.json)
```

**RegionService** (`src/lib/region-service.ts`) — abstraction layer yang auto-handle DUN↔PAR:

```
┌──────────────────────────────────────┐
│    UI Components                     │
│  (map, swing, compare, charts...)    │
├──────────────────────────────────────┤
│         RegionService                │
│  .getRegions('dun')                  │  ← DUN-level (N01-N36)
│  .getRegions('parlimen')             │  ← PAR-level, auto-aggregated
│  .loadConfig() → ElectionPackConfig  │
├──────────────────────────────────────┤
│  data/elections/{id}/config.json     │
│  data/kv-output/*.json               │
│  Sanity (future adapter)             │
└──────────────────────────────────────┘
```

## Level Switcher (Client-side)

`election-dashboard.tsx` ada toggle **DUN** ↔ **Parlimen**:
- **DUN**: data asal per-DUN (N01-N36)
- **Parlimen**: aggregation dari DUN → kumpul ikut parlimen
  - `seatCounts`: parti dengan penyandang terbanyak
  - `dominantParty`: parti dominan
  - `lat/lng`: centroid purata
  - Tuang semua candidates ke PAR level

## Status GeoJSON & Election Pack

| State | DUN | PAR | GeoJSON ✅ | Config Template ✅ |
|---|---|---|---|---|
| Perlis | 15 | 3 | 2026-07-24 | prn-perlis-template |
| Kedah | 37 | 16 | 2026-07-24 | prn-kedah-template |
| Kelantan | 45 | 14 | 2026-07-24 | prn-kelantan-template |
| Terengganu | 33 | 9 | 2026-07-24 | prn-terengganu-template |
| Penang | 41 | 14 | 2026-07-24 | prn-penang-template |
| Perak | 59 | 24 | 2026-07-24 | prn-perak-template |
| Pahang | 43 | 15 | 2026-07-24 | prn-pahang-template |
| Selangor | 56 | 22 | 2026-07-24 | prn-selangor-template |
| **Negeri Sembilan** | **36** | **8** | **2026-07-23** | **prn-ns-2026 ✅ ACTIVE** |
| Melaka | 28 | 6 | 2026-07-24 | prn-melaka-template |
| Johor | 58 | 29 | 2026-07-24 | prn-johor-template |
| Sabah | 75 | 27 | 2026-07-24 | prn-sabah-template |
| Sarawak | ❌ | ❌ | 404 Not Found | ❌ |
| WP KL/Putra/Labuan | 1 | 1 | 2026-07-24 | prn-wp-template |

> **Note:** DUN counts from DM (Daerah Mengundi) data may differ slightly from official SPR numbers due to boundary reclassification. The DM data is authoritative from SPR/EC.

## Status Historical Results (Tindak Malaysia HISTORICAL-ELECTION-RESULTS)

| Pilihan Raya | Year | Level | Coverage | Source File |
|---|---|---|---|---|
| PRU | 2022 | PARLIMEN | 222 | MALAYSIA_2022_PARLIAMENT_RESULTS.csv |
| PRU | 2022 | DUN | 117 (4 negeri) | MALAYSIA_2022_DUN_RESULTS.csv |
| PRN6 | 2023 | DUN | 245 (6 negeri) | MALAYSIA_PRN6_2023_ELECTION_RESULTS.csv |
| PRN Johor | 2022 & 2026 | DUN | 56 | JOHOR_2022 + 2026_JOHOR_DUN_RESULTS.csv |
| PRN Melaka | 2021 | DUN | 28 | MELAKA_2021_ELECTION_RESULTS.csv |
| PRN Sarawak | 2021 | DUN | 82 | SARAWAK_2021_ELECTION_RESULTS.csv |
| PRN Sabah | 2020 & 2025 | DUN | 73 | SABAH_2020 + 2025_SABAH_DUN_RESULTS.csv |
| PRU | 2018 | PAR + DUN | 727 | MALAYSIA_2018_*.csv |
| PRU | 2013 | PAR + DUN | 726 | MALAYSIA_2013_*.csv |
| PRU | 2008 | PARLIMEN | 214 | MALAYSIA_2008_PARLIAMENT_RESULTS.csv |
| PRU | 2004 | PARLIMEN | 202 | MALAYSIA_2004_PARLIAMENT_RESULTS.csv |
| PRU | 1999 | PARLIMEN | 192 | MALAYSIA_1999_PARLIAMENT_RESULTS.csv |
| PRU | 1995 | PAR + DUN | 565 | MALAYSIA_1995_*.csv |

**Script:** `python3 scripts/fetch-historical-results.py` (idempotent, re-runnable)

**Storage format** — Data keyed by code in `historical-results.json`:
- PARLIMEN: `P001`, `P002`, ... `P222`
- DUN (single-state files): `N01`, ... (Johor/Sarawak/dll)
- DUN (multi-state files): `{STATE_SHORT}_N01`, e.g., `KDH_N01`, `SGR_N01`
- NS original data: `NSN_N01`, ... `NSN_N36`

**Missing data (not yet uploaded by Tindak Malaysia):**
- PRU 2008, 2004, 1999 DUN results (PARLIMEN saja tersedia)

## Admin Panel (T7)

**URL:** `/admin/election-data` (linked from `/admin/dashboard`)

**API:** `GET/PUT /api/admin/election`
- `GET /api/admin/election` → list all negeri + DUN/PAR counts
- `GET /api/admin/election?state=nsn` → all DUN regions + existing data
- `GET /api/admin/election?code=P001` → single region
- `PUT /api/admin/election` → simpan calon/peratusan/demografi

**Validation guardrails (server-side):**
- Nama calon & parti diperlukan
- Parti tak boleh duplikat dalam sama election
- Jumlah peratusan undi mesti ~100% (jika ada percentage)
- Calon `won` mesti undi tertinggi (jika ada `votes`)

**UI alur:**
1. Pick negeri → lihat senarai DUN (dengan search)
2. Klik DUN → lihat calon sedia + Edit
3. Histori pilihan raya terkini
4. Simpan → validation → JSON static

**Mode simpan:** Local JSON (`data/kv-output/*.json` — gitignored)
- `candidates-real.json` → senarai calon per code
- `historical-results.json` → sejarah undi (anti-duplikat)
- `economic-demographics.json` → demografi & ekonomi

> Admin panel menulis ke fail JSON local. Untuk deployment Vercel,
> perlu integrate KV (T8) atau gunakan write endpoint di Sanity.

## KV Integration (T8)

**Read-through:** API baca dari KV dulu; kalau gagal/empty, fallback ke JSON static.
**Write-mirror:** PUT request → validation → tulis JSON → mirror ke KV.

**Env vars untuk enable KV:**
```
CLOUDFLARE_ACCOUNT_ID=...   (atau CF_ACCOUNT_ID)
CLOUDFLARE_API_TOKEN=...    (atau CF_API_TOKEN)
CF_KV_CANDIDATES=ns_id      (namespace ID untuk calon)
CF_KV_RESULTS=ns_id         (namespace ID untuk historical results)
CF_KV_DEMOGRAPHICS=ns_id   (namespace ID untuk demografi)
```

Tanpa env vars, sistem berfungsi dalam **mode local JSON** (cost-efficient).

**KV key:** `{prefix}:__index__` menyimpan keseluruhan ledger sebagai satu value.
3 bacaan instead of N. Untuk per-key granularity, pecah ke `candidates:P001` etc.

**UI badge:**
- "☁️ KV Aktif" (hijau) kalau env vars aktif
- "💾 Local JSON" (kelabu) kalau env vars kosong

## Cara Setup PRN Baru

### 1. Buat Election Pack folder

```bash
# Copy template dari PRN sedia ada
cp -r data/elections/prn-ns-2026 data/elections/prn-selangor-2027
```

### 2. Edit config.json

```json
{
  "electionId": "prn-selangor-2027",
  "name": "PRN Selangor 2027",
  "level": "dun",
  "parentLevel": "parlimen",
  "geoJson": "prn_selangor_dun.json",
  "state": "Selangor",
  "dunToParlimen": {
    "N01": "P092", ...
  },
  "parlimenInfo": {
    "P092": { "name": "Sabak Bernam", "dunCount": 2 },
    ...
  },
  "demographicsSource": "parlimen",
  "dataSources": {
    "demographics": "Tindak Malaysia / DOSM",
    "historicalResults": "ElectionData.MY"
  }
}
```

### 3. Sediakan GeoJSON

Letak file dalam `public/geojson/`:
- `prn_selangor_dun.json` + `prn_selangor_dun_polygon.json`

### 4. Data Pipeline

```bash
# Kalau perlu regenerate data
python3 scripts/generate-real-data.py

# Verify
npx tsx scripts/verify-election.ts prn-selangor-2027
```

### 5. Activate dalam Sanity

Buat dokumen `electionInfo`:
- `electionName`: PRN Selangor 2027
- `electionType`: prn
- `regionType`: dun
- `geoJsonFile`: prn_selangor_dun.json
- `isActive`: true

Dashboard auto-load data dari Sanity + Election Pack.

## Agent Tips

### Agent boleh buat PRN baru dalam 5 minit:

```bash
# 1. Copy folder
cp -r data/elections/prn-ns-2026 data/elections/prn-negeri-baru

# 2. Edit config — update mapping & state name
# (refer Wikipedia / SPR untuk senarai DUN)

# 3. Cari GeoJSON — guna data dari Tindak Malaysia GitHub
# https://github.com/TindakMalaysia/Negeri-Sembilan-Maps

# 4. Activate — create Sanity document via API atau manual
```

## Cronjobs / Automation

Guna OpenHands Automation (port 18001) untuk schedule:
- `GET /api/automation/docs` — automation API spec
- Auth: header `X-Session-API-Key: $OPENHANDS_AUTOMATION_API_KEY`

Cadangan automations:
- **setiap-6-jam**: Refresh data (regenerate pipeline) → rebuild
- **setiap-hari**: Fetch candidate news → merge candidates data
- **semasa-PRN**: Update sentiment analysis

<!-- END:architecture-election-pack -->

<!-- BEGIN:priority-candidate-news -->

# 🚨 KEUTAMAAN MUTLAK: Cari Calon Semasa dari Portal Berita

Sebelum buat apa-apa kerja lain, JALANKAN ini:

```bash
npx tsx scripts/fetch-candidates-news.ts --merge
```

**Mengapa?** Data calon dari SPR/ElectionData.MY hanya ada nama dan parti. Untuk dapatkan:
- Gambar calon (party logo)
- Profil, latar belakang
- Berita terkini tentang calon
- Pengumuman calon dari semua parti (BN, PH, PN)

**Portal yang dicari:**
1. Malaysiakini — malaysiakini.com
2. Utusan Malaysia — utusan.com.my
3. Sinar Harian — sinarharian.com.my
4. Harakahdaily — harakahdaily.net
5. BH Online — bharian.com.my
6. Astro Awani — astroawani.com

Skrip `fetch-candidates-news.ts` akan:
1. Search semua portal dengan 27 queries (semua parti + specific seats)
2. Extract nama calon, parti, kod kerusi dari tajuk berita
3. Ambil kandungan artikel untuk profil calon
4. Merge dengan data sedia ada (guna `--merge`)

**Output:** `data/candidates-news-2026.json` + merge into `data/kv-output/candidates-real.json`

<!-- END:priority-candidate-news -->
