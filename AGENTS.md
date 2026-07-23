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
