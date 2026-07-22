/**
 * fetch-tindak.ts
 * Ambil data dari GitHub Tindak Malaysia election data (CSV).
 * Output: data/tindak-raw.json
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'

// Tindak Malaysia GE15 (2022) data in raw CSV
const TINDAK_URLS = [
  'https://raw.githubusercontent.com/tindak/malaysia-election-data/main/ge15/results/parlimen_results.csv',
  'https://raw.githubusercontent.com/tindak/malaysia-election-data/main/ge15/candidates/parlimen_candidates.csv',
]

const PARTY_MAP: Record<string, string> = {
  'BN': 'BN', 'UMNO': 'BN', 'MCA': 'BN', 'MIC': 'BN',
  'PH': 'PH', 'PKR': 'PH', 'DAP': 'PH', 'AMANAH': 'PH',
  'PN': 'PN', 'PAS': 'PN', 'BERSATU': 'PN',
  'WARISAN': 'WARISAN', 'BEBAS': 'Bebas', 'IND': 'Bebas',
}

function mapParty(raw: string): string {
  const u = raw.toUpperCase().trim()
  for (const [k, v] of Object.entries(PARTY_MAP)) {
    if (u.includes(k.toUpperCase())) return v
  }
  return u || 'Bebas'
}

interface TindakRow {
  code: string
  name: string
  candidateName: string
  party: string
  votes: number
  percentage: number
  year: number
}

async function fetchCSV(url: string): Promise<string[][]> {
  const { data } = await axios.get(url, { timeout: 20000, responseType: 'text' })
  return data.split('\n')
    .map((line: string) => line.split(',').map(c => c.replace(/^"|"$/g, '').trim()))
    .filter((row: string[]) => row.length > 1 && row[0] !== '')
}

async function main() {
  console.log('Fetching Tindak Malaysia data...\n')

  const rows: TindakRow[] = []

  for (const url of TINDAK_URLS) {
    try {
      console.log(`Fetching: ${url}`)
      const csv = await fetchCSV(url)
      console.log(`  Got ${csv.length} rows`)

      // Auto-detect header
      const header = csv[0].map(h => h.toLowerCase().trim())
      const codeIdx = header.findIndex(h => /kod|code|parlimen/i.test(h))
      const nameIdx = header.findIndex(h => /nama|name|kawasan/i.test(h))
      const candidateIdx = header.findIndex(h => /calon|candidate/i.test(h))
      const partyIdx = header.findIndex(h => /parti|party/i.test(h))
      const votesIdx = header.findIndex(h => /undi|votes/i.test(h))

      if (partyIdx < 0 || votesIdx < 0) {
        console.log(`  Skipping: header not recognized (headers: ${header.join(', ')})`)
        continue
      }

      for (let i = 1; i < csv.length; i++) {
        const row = csv[i]
        if (row.length < Math.max(partyIdx, votesIdx) + 1) continue
        const code = codeIdx >= 0 ? row[codeIdx] : ''
        const name = nameIdx >= 0 ? row[nameIdx] : ''
        const party = mapParty(row[partyIdx])
        const candidateName = candidateIdx >= 0 ? row[candidateIdx] : row[partyIdx]
        const votes = parseInt(row[votesIdx]?.replace(/\D/g, ''), 10) || 0
        if (votes > 0) {
          rows.push({ code, name, candidateName, party, votes, percentage: 0, year: 2022 })
        }
      }
    } catch (err: any) {
      console.log(`  FAIL: ${err.message?.slice(0, 100)}`)
    }
  }

  // Group by code, calculate percentages
  const byCode: Record<string, TindakRow[]> = {}
  for (const r of rows) {
    if (!r.code) continue
    if (!byCode[r.code]) byCode[r.code] = []
    byCode[r.code].push(r)
  }

  for (const [code, candidates] of Object.entries(byCode)) {
    const total = candidates.reduce((s, c) => s + c.votes, 0)
    for (const c of candidates) {
      c.percentage = total > 0 ? Math.round((c.votes / total) * 1000) / 10 : 0
    }
  }

  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'tindak-raw.json')
  fs.writeFileSync(outPath, JSON.stringify(byCode, null, 2))
  console.log(`\nDone! ${Object.keys(byCode).length} regions → ${outPath}`)
}

main().catch(console.error)
