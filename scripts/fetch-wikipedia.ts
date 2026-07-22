/**
 * fetch-wikipedia.ts
 * Ambil demografi + penyandang dari Wikipedia API Malaysia.
 * Output: data/wikipedia-demographics.json
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const WIKI = 'https://ms.wikipedia.org/w/api.php'

const REGIONS: { code: string; name: string }[] = [
  { code: 'P001', name: 'Padang Besar' }, { code: 'P002', name: 'Kangar' },
  { code: 'P003', name: 'Arau' }, { code: 'P004', name: 'Langkawi' },
  { code: 'P005', name: 'Jerlun' }, { code: 'P006', name: 'Kubang Pasu' },
  { code: 'P007', name: 'Padang Terap' }, { code: 'P008', name: 'Pokok Sena' },
  { code: 'N01', name: 'Chennah' }, { code: 'N02', name: 'Pertang' },
  { code: 'N03', name: 'Sungai Lui' }, { code: 'N04', name: 'Klawang' },
]

interface WikiData {
  code: string; name: string
  demographics: { malay: number; chinese: number; indian: number; others: number } | null
  incumbent: { name: string; party: string } | null
  source: string
}

async function wikiSearch(title: string): Promise<string | null> {
  const { data } = await axios.get(WIKI, {
    params: { action: 'query', format: 'json', list: 'search', srsearch: title, srlimit: 3 }, timeout: 10000,
  })
  return data?.query?.search?.[0]?.title || null
}

async function wikiExtract(title: string): Promise<string | null> {
  const { data } = await axios.get(WIKI, {
    params: { action: 'query', format: 'json', prop: 'extracts', titles: title, explaintext: 1 }, timeout: 15000,
  })
  const pages = data?.query?.pages || {}
  return (Object.values(pages) as any[])[0]?.extract || null
}

function parseEthnicity(text: string) {
  const p = (re: RegExp) => { const m = text.match(re); return m ? parseFloat(m[1]) : 0 }
  const malay = p(/[Mm]elayu[^0-9]*?(\d+\.?\d*)\s*%/m)
  const chinese = p(/[Cc]ina[^0-9]*?(\d+\.?\d*)\s*%/m)
  const indian = p(/[Ii]ndia[^0-9]*?(\d+\.?\d*)\s*%/m)
  const others = p(/[Ll]ain[^0-9]*?(\d+\.?\d*)\s*%/m) || p(/[Bb]umiputera[^.]+?(\d+\.?\d*)\s*%/m)
  if (malay + chinese + indian + others >= 50) return { malay, chinese, indian, others }
  return null
}

function parseIncumbent(text: string) {
  for (const re of [
    /[Pp]enyandang.*?ialah\s+(.+?)(?:\(([^)]+)\)|\s*(?:\.|,))/s,
    /[Dd]iwakili oleh\s+(.+?)(?:\(([^)]+)\)|\.|,)/,
    /[Aa]hli Parlimen.*?ialah\s+(.+?)(?:\(([^)]+)\)|\.|,)/,
  ]) {
    const m = text.match(re)
    if (m) return { name: m[1].trim().replace(/\s+/g, ' '), party: m[2]?.trim() || '' }
  }
  return null
}

async function fetchRegion(r: { code: string; name: string }): Promise<WikiData> {
  const result: WikiData = { code: r.code, name: r.name, demographics: null, incumbent: null, source: '' }
  const pageTitle = await wikiSearch(`${r.name} kawasan persekutuan`)
  if (!pageTitle) { console.log(`  ${r.code} ${r.name}: page not found`); return result }
  result.source = `https://ms.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`
  const text = await wikiExtract(pageTitle)
  if (!text) { console.log(`  ${r.code} ${r.name}: no extract`); return result }
  result.demographics = parseEthnicity(text)
  result.incumbent = parseIncumbent(text)
  console.log(`  ${r.code} ${r.name}: demo=${result.demographics ? 'YES' : 'NO'}, inc=${result.incumbent?.name || 'N/A'}`)
  return result
}

async function main() {
  console.log('Fetching Wikipedia data...\n')
  const results: WikiData[] = []
  for (let i = 0; i < REGIONS.length; i++) {
    console.log(`[${i + 1}/${REGIONS.length}] ${REGIONS[i].code} ${REGIONS[i].name}`)
    results.push(await fetchRegion(REGIONS[i]))
    await new Promise((r) => setTimeout(r, 500))
  }
  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'wikipedia-demographics.json'), JSON.stringify(results, null, 2))
  console.log(`\nDone! ${results.length} regions → data/wikipedia-demographics.json`)
}

main().catch(console.error)
