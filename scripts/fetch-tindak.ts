/**
 * fetch-tindak.ts
 * Download + parse TindakMalaysia/General-Election-Data CSVs.
 * Output: data/tindak-parsed.json
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const BASE_RAW = 'https://raw.githubusercontent.com/TindakMalaysia/General-Election-Data/faa0dc18fd17eab8eee18c0ae1577319e9fe6a0e'

const FILES = [
  '2025%20ELECTORAL%20DEMOGRAPHICS/MALAYSIA_AUGUST_2025_PARLIAMENT_COMPOSITION.csv',
  'ECONOMIC_DATA_BY_CONSTITUENCY/KEY%20ECONOMIC%20DATA%20BY%20PARLIAMENTARY%20SEAT%20(2022).csv',
]

interface TindakRow {
  code: string            // e.g. "P001"
  state: string
  name: string
  totalElectors: number
  ageGroups: { '18-20': number; '21-29': number; '30-39': number; '40-49': number; '50-59': number; '60-69': number; '70-79': number; '80-89': number; '90+': number }
  maleElectors: number
  femaleElectors: number
  winningParty: string
  ethnicity: string
  medianIncome: number
  meanIncome: number
  gini: number
  poverty: number
}

function parseCode(raw: string): string {
  return raw.replace(/^P\.\s*/, 'P').replace(/^N\.\s*/, 'N').trim()
}

function csvToRows(text: string): string[][] {
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')))
}

async function main() {
  console.log('Fetching Tindak Malaysia data...\n')

  // Download both CSVs
  const csvData: Record<string, string[][]> = {}
  for (const file of FILES) {
    const url = `${BASE_RAW}/${file}`
    const name = file.split('/').pop()!
    console.log(`Download: ${name}`)
    const { data } = await axios.get(url, { timeout: 20000, responseType: 'text' })
    csvData[name] = csvToRows(data)
    console.log(`  ${csvData[name].length} rows`)
  }

  // Parse demographics
  const demoName = 'MALAYSIA_AUGUST_2025_PARLIAMENT_COMPOSITION.csv'
  const demoRows = csvData[demoName]
  const demogMap: Record<string, any> = {}

  for (let i = 1; i < demoRows.length; i++) {
    const r = demoRows[i]
    if (r.length < 15) continue
    const code = parseCode(r[2])
    demogMap[code] = {
      totalElectors: parseInt(r[4], 10) || 0,
      ageGroups: {
        '18-20': parseInt(r[8], 10) || 0, '21-29': parseInt(r[9], 10) || 0,
        '30-39': parseInt(r[10], 10) || 0, '40-49': parseInt(r[11], 10) || 0,
        '50-59': parseInt(r[12], 10) || 0, '60-69': parseInt(r[13], 10) || 0,
        '70-79': parseInt(r[14], 10) || 0, '80-89': parseInt(r[15], 10) || 0,
        '90+': parseInt(r[16], 10) || 0,
      },
      maleElectors: parseInt(r[17], 10) || 0,
      femaleElectors: parseInt(r[18], 10) || 0,
    }
  }

  // Parse economic data
  const econName = 'KEY%20ECONOMIC%20DATA%20BY%20PARLIAMENTARY%20SEAT%20(2022).csv'
  const econRows = csvData[econName]
  const econMap: Record<string, any> = {}

  for (let i = 1; i < econRows.length; i++) {
    const r = econRows[i]
    if (r.length < 10) continue
    const code = parseCode(r[2])
    econMap[code] = {
      winningParty: r[4]?.trim() || '',
      ethnicity: r[6]?.trim() || '',
      medianIncome: parseInt(r[7]?.replace(/\D/g, ''), 10) || 0,
      meanIncome: parseInt(r[8]?.replace(/\D/g, ''), 10) || 0,
      gini: parseFloat(r[9]) || 0,
      poverty: parseFloat(r[10]) || 0,
    }
  }

  // Merge
  const merged: Record<string, TindakRow> = {}
  const allCodes = new Set([...Object.keys(demogMap), ...Object.keys(econMap)])

  for (const code of allCodes) {
    const d = demogMap[code] || {}
    const e = econMap[code] || {}
    // Get name/state from first economics row
    const demoRow = demoRows.slice(1).find(r => parseCode(r[2]) === code)
    merged[code] = {
      code,
      state: demoRow?.[1] || '',
      name: demoRow?.[3] || '',
      totalElectors: d.totalElectors || 0,
      ageGroups: d.ageGroups || {},
      maleElectors: d.maleElectors || 0,
      femaleElectors: d.femaleElectors || 0,
      winningParty: e.winningParty || '',
      ethnicity: e.ethnicity || '',
      medianIncome: e.medianIncome || 0,
      meanIncome: e.meanIncome || 0,
      gini: e.gini || 0,
      poverty: e.poverty || 0,
    }
  }

  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'tindak-parsed.json'), JSON.stringify(merged, null, 2))

  console.log(`\nDone! ${Object.keys(merged).length} parliament seats parsed`)
  console.log(`Output → data/tindak-parsed.json`)

  // Show sample
  for (const code of ['P001', 'P002', 'P003', 'P004']) {
    const m = merged[code]
    if (!m) continue
    console.log(`  ${code} ${m.name}: ${m.totalElectors.toLocaleString()} voters | ${m.winningParty} | RM${m.medianIncome} median | ${m.poverty}% poverty`)
  }
}

main().catch(console.error)
