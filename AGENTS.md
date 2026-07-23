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
- **Open Data SPR** — `opendata.spr.gov.my` (Next.js app, CSV download)

Data pipeline: `scripts/generate-real-data.py` → `data/kv-output/*.json` → `src/lib/kv.ts` (imported via resolveJsonModule)

<!-- END:election-data-sources -->
