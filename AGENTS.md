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
