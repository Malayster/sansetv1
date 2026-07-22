/**
 * input-survey.ts
 * Struktur KV untuk input manual data survei dari pusat penyelidikan.
 * Usage: npx tsx scripts/input-survey.ts [--write]
 * Output: data/survey-template.json
 */
import fs from 'fs'
import path from 'path'

interface SurveyEntry {
  source: string       // 'Merdeka Center' | 'Ilham Center' | 'INVOKE' | 'EMIR'
  date: string         // '2026-07-20'
  sampleSize: number
  parties: { name: string; percentage: number }[]
  issues: { topic: string; importance: number }[]
  notes: string
  updatedAt: string
}

const TEMPLATE: Record<string, SurveyEntry> = {
  P001: {
    source: 'Merdeka Center',
    date: '2026-07-20',
    sampleSize: 500,
    parties: [
      { name: 'BN', percentage: 48 },
      { name: 'PH', percentage: 32 },
      { name: 'PN', percentage: 18 },
    ],
    issues: [
      { topic: 'Ekonomi', importance: 45 },
      { topic: 'Infrastruktur', importance: 28 },
      { topic: 'Pekerjaan', importance: 18 },
    ],
    notes: 'Survei dijalankan 20-22 Julai 2026. Margin ralat ±4%.',
    updatedAt: new Date().toISOString(),
  },
  P002: {
    source: 'Ilham Center',
    date: '2026-07-18',
    sampleSize: 400,
    parties: [
      { name: 'PN', percentage: 52 },
      { name: 'PH', percentage: 28 },
      { name: 'BN', percentage: 20 },
    ],
    issues: [
      { topic: 'Kesihatan', importance: 38 },
      { topic: 'Pendidikan', importance: 25 },
      { topic: 'Perumahan', importance: 22 },
    ],
    notes: 'Survei dalam talian. Responden majoriti bandar.',
    updatedAt: new Date().toISOString(),
  },
  P003: {
    source: 'INVOKE Malaysia',
    date: '2026-07-15',
    sampleSize: 350,
    parties: [
      { name: 'PN', percentage: 58 },
      { name: 'PH', percentage: 25 },
      { name: 'BN', percentage: 17 },
    ],
    issues: [
      { topic: 'Belia & Pekerjaan', importance: 40 },
      { topic: 'Pendidikan Tinggi', importance: 30 },
      { topic: 'Agama', importance: 20 },
    ],
    notes: 'Survei fokus kepada pengundi muda (18-35 tahun).',
    updatedAt: new Date().toISOString(),
  },
  P004: {
    source: 'EMIR Research',
    date: '2026-07-10',
    sampleSize: 450,
    parties: [
      { name: 'PN', percentage: 62 },
      { name: 'PH', percentage: 22 },
      { name: 'BN', percentage: 16 },
    ],
    issues: [
      { topic: 'Pelancongan', importance: 48 },
      { topic: 'Kos Sara Hidup', importance: 32 },
      { topic: 'Pengangkutan', importance: 15 },
    ],
    notes: 'Survei bersemuka dengan penduduk tempatan.',
    updatedAt: new Date().toISOString(),
  },
}

async function main() {
  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const kvReady: Record<string, SurveyEntry> = {}
  for (const [code, entry] of Object.entries(TEMPLATE)) {
    kvReady[`survey:${code}`] = entry
  }

  const outPath = path.join(outDir, 'survey-template.json')
  fs.writeFileSync(outPath, JSON.stringify(kvReady, null, 2))

  console.log('Survey KV template generated.\n')
  for (const [code, entry] of Object.entries(TEMPLATE)) {
    const topParty = entry.parties.sort((a, b) => b.percentage - a.percentage)[0]
    console.log(`  ${code}: ${entry.source} | ${entry.sampleSize} samples | ${topParty.name} leads at ${topParty.percentage}%`)
  }
  console.log(`\nOutput → ${outPath}`)
  console.log('\n💡 To edit: modify data/survey-template.json, then push to KV.')
  console.log('💡 To fill from Sanity Studio: create "survey" document type with above schema.')
}

main().catch(console.error)
