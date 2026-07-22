/**
 * fetch-wikipedia.ts
 * Scrape data dari Wikipedia Malaysia untuk setiap kawasan Parlimen.
 * Output: data/wikipedia-raw.json
 */
import * as cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const BASE = 'https://ms.wikipedia.org/wiki'

// 32 Parlimen + 36 DUN N9
const REGIONS: { code: string; name: string; type: 'parlimen' | 'dun' }[] = [
  // PRU-16 Parlimen
  { code: 'P001', name: 'Padang Besar', type: 'parlimen' },
  { code: 'P002', name: 'Kangar', type: 'parlimen' },
  { code: 'P003', name: 'Arau', type: 'parlimen' },
  { code: 'P004', name: 'Langkawi', type: 'parlimen' },
  // ... truncated for demo — build all 32 P codes
  // PRN N9 DUN
  { code: 'N01', name: 'Chennah', type: 'dun' },
  { code: 'N02', name: 'Pertang', type: 'dun' },
  { code: 'N03', name: 'Sungai Lui', type: 'dun' },
  { code: 'N04', name: 'Klawang', type: 'dun' },
]

interface WikiResult {
  code: string
  name: string
  incumbent: { name: string; party: string } | null
  candidates: { name: string; party: string; votes: number; percentage: number }[]
  demographics: { malay: number; chinese: number; indian: number; others: number } | null
  source: string
  fetchedAt: string
}

async function fetchRegion(code: string, name: string, type: 'parlimen' | 'dun'): Promise<WikiResult> {
  const suffix = type === 'parlimen' ? '_(kawasan_Parlimen)' : '_(kawasan_negeri)'
  const url = `${BASE}/${encodeURIComponent(name)}${suffix}`
  const result: WikiResult = {
    code, name,
    incumbent: null,
    candidates: [],
    demographics: null,
    source: url,
    fetchedAt: new Date().toISOString(),
  }

  try {
    const { data } = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'SuaraAnakNegeri/1.0' } })
    const $ = cheerio.load(data)

    // ── Incumbent from infobox ──
    const infobox = $('.infobox')
    if (infobox.length) {
      infobox.find('tr').each((_, row) => {
        const th = $(row).find('th').text().trim()
        const td = $(row).find('td').text().trim()
        if (/penyandang|wakil/i.test(th) && td) {
          const match = td.match(/(.+?)\s*\(([^)]+)\)/)
          if (match) result.incumbent = { name: match[1].trim(), party: match[2].trim() }
          else result.incumbent = { name: td, party: '' }
        }
      })
    }

    // ── Demographics from infobox ──
    // Wikipedia usually has a "Kaum" or "Etnik" row with percentages
    infobox.find('tr').each((_, row) => {
      const th = $(row).find('th').text().trim().toLowerCase()
      const td = $(row).find('td').text().trim()
      if (/etnik|kaum|bumiputera/i.test(th)) {
        // Parse percentages: "Melayu 86.5%, Cina 9.2%, India 3.1%, Lain-lain 1.2%"
        const malay = td.match(/[Mm]elayu[^\d]*(\d+\.?\d*)%?/)
        const chinese = td.match(/[Cc]ina[^\d]*(\d+\.?\d*)%?/)
        const indian = td.match(/[Ii]ndia[^\d]*(\d+\.?\d*)%?/)
        const others = td.match(/[Ll]ain[^\d]*(\d+\.?\d*)%?/)
        if (malay || chinese || indian) {
          result.demographics = {
            malay: malay ? parseFloat(malay[1]) : 0,
            chinese: chinese ? parseFloat(chinese[1]) : 0,
            indian: indian ? parseFloat(indian[1]) : 0,
            others: others ? parseFloat(others[1]) : 0,
          }
        }
      }
    })

    // ── Election history tables ──
    // Look for tables with "parti" and "undi" headers
    $('table.wikitable').each((_, table) => {
      const headers: string[] = []
      $(table).find('tr').first().find('th').each((_, th) => headers.push($(th).text().trim().toLowerCase()))

      const partyIdx = headers.findIndex(h => /parti/i.test(h))
      const candidateIdx = headers.findIndex(h => /calon/i.test(h))
      const votesIdx = headers.findIndex(h => /undi|jumlah/i.test(h))

      if (partyIdx >= 0) {
        $(table).find('tr').slice(1).each((_, row) => {
          const cells = $(row).find('td')
          if (cells.length < 2) return
          const party = partyIdx >= 0 ? $(cells[partyIdx]).text().trim() : ''
          const name = candidateIdx >= 0 ? $(cells[candidateIdx]).text().trim() : ''
          const votesText = votesIdx >= 0 ? $(cells[votesIdx]).text().trim() : '0'
          const clean = votesText.replace(/[^\d]/g, '')
          const votes = parseInt(clean, 10) || 0
          if (party && votes > 0) {
            result.candidates.push({ name: name || party, party, votes, percentage: 0 })
          }
        })
      }
    })

    // Calculate percentages
    const totalVotes = result.candidates.reduce((s, c) => s + c.votes, 0)
    for (const c of result.candidates) {
      c.percentage = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 1000) / 10 : 0
    }

    console.log(`  OK ${code} ${name}: ${result.candidates.length} candidates, incumbent=${result.incumbent?.name || 'N/A'}, demog=${result.demographics ? 'YES' : 'NO'}`)
  } catch (err: any) {
    console.log(`  FAIL ${code} ${name}: ${err.message?.slice(0, 80)}`)
  }

  return result
}

async function main() {
  console.log('Fetching Wikipedia data...\n')
  const results: WikiResult[] = []
  for (let i = 0; i < REGIONS.length; i++) {
    const r = REGIONS[i]
    console.log(`[${i + 1}/${REGIONS.length}] ${r.code} ${r.name}`)
    results.push(await fetchRegion(r.code, r.name, r.type))
    // Rate limiting
    await new Promise((res) => setTimeout(res, 1000))
  }

  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'wikipedia-raw.json')
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(`\nDone! ${results.length} regions → ${outPath}`)
}

main().catch(console.error)
