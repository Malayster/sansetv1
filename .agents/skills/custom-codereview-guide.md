---
triggers: [/codereview]
---
# Custom Code Review Guidelines — Suara Anak Negeri

## Repo Context
- Next.js 15 App Router dengan Sanity CMS, Cloudflare KV
- Dashboard Pilihan Raya adalah ciri READ-ONLY — data pilihan raya dimuat dari Sanity + KV
- Tiada authentication/authorization dalam scope election page
- Project masih dalam pembangunan (pre-production), bukan production
- 32 kawasan Parlimen (demo), akan naik ke 222

## Clarifications on specific concerns

### SVGs as Party Logos
- Flag SVGs (bn.svg, ph.svg, dsb.) adalah **placeholder sementara** untuk demo
- Ini bukan isu code review — ia adalah keputusan aset reka bentuk
- Jangan tandakan sebagai isu dalam review

### Dual GeoJSON files (point vs polygon)
- `pru_parlimen.json` (Point) = digunakan oleh `getElectionRegions()` di server
- `pru_parlimen_polygon.json` (Polygon) = digunakan oleh client `election-map.tsx`
- Kedua-duanya dijana dari sumber yang sama dan **diselaraskan secara automatik oleh pipeline**
- `properties.lat`/`lng` sudah wujud dalam fail polygon — code hanya belum membaca darinya
- Fokus pada **satu sumber yang disyorkan** (baca dari polygon sahaja), bukan mendakwa drift

### Cloudflare KV API calls
- KV digunakan sebagai fallback — Sanity adalah primary source
- `getKVValue` dengan `'mock'` namespaceId (bukan real) — ini bukan 96 API calls sebenar
- Pada production, data akan dibatch dalam satu `region:{code}` key
- Isu ini adalah pre-production optimization, bukan blocker

### Server-side fetch untuk GeoJSON
- Next.js 15 **menyokong** `fetch('/geojson/...')` di server component apabila `next.config.js` mempunyai base URL atau ia menggunakan internal fetch extension
- Jika tidak berfungsi di production, fallback `FALLBACK_PRU16_REGIONS` memastikan halaman tidak crash
- `fs.readFile` lebih baik untuk reliability — cadangkan, bukan tuntut

## Priorities
1. **Data correctness** > performance
2. **Robust fallbacks** (page mesti sentiasa render) > perfect data
3. **Readability** > tersingkat
4. GMV (Good Malaysian Values): data tepat, UI jujur, BM betul
