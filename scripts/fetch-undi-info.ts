/**
 * fetch-undi-info.ts
 * Scrape data dari undi.info (jika boleh). Skip jika gagal (Cloudflare).
 * Output: data/undi-info-raw.json
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const REGIONS = [
  'P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008',
]

async function tryFetch(code: string): Promise<any> {
  try {
    const url = `https://undi.info/parlimen/${code}`
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 SuaraAnakNegeri/1.0' },
      maxRedirects: 3,
    })
    return { code, status: 'success', dataLength: data.length }
  } catch (err: any) {
    return { code, status: 'failed', error: err.message?.slice(0, 80) }
  }
}

async function main() {
  console.log('Fetching undi.info data (optional)...\n')
  const results: any[] = []

  for (const code of REGIONS) {
    console.log(`Trying ${code}...`)
    const r = await tryFetch(code)
    console.log(`  ${r.status}`)
    results.push(r)
    if (r.status !== 'success') {
      console.log('\n⚠️  undi.info blocked (Cloudflare). Skipping further attempts.\n')
      break
    }
    await new Promise((res) => setTimeout(res, 2000))
  }

  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'undi-info-raw.json')
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(`Results → ${outPath}`)
}

main().catch(console.error)
