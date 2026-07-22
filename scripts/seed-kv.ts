/**
 * Seed script — fills Cloudflare KV with mock sentiment & prediction
 * data for all 32 parliament regions (P001–P032).
 *
 * Usage: npx tsx scripts/seed-kv.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ═══════════════════════════════════════════════════════════
// CF KV CONFIG — reads from env (set in .env.local before running)
// ═══════════════════════════════════════════════════════════
const ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || ''
const API_TOKEN =
  process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || ''
const NS_ID = process.env.CF_KV_NAMESPACE_ID || ''

if (!ACCOUNT_ID || !API_TOKEN || !NS_ID) {
  console.error(
    '❌ Missing env vars. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CF_KV_NAMESPACE_ID',
  )
  process.exit(1)
}

const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NS_ID}/values`

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const PARTIES = ['BN', 'PH', 'PN', 'GPS', 'Bebas'] as const
const CANDIDATE_POOL = [
  'Ahmad Razak', 'Siti Aminah', 'Kumar a/l Muthu', 'Rashid bin Ali',
  'Lim Wei Chen', 'Ismail bin Kassim', 'Noraini Hassan', 'Zulkifli Ahmad',
  'Farid Iskandar', 'Chong Wei Keat', 'Rajendran s/o Muthusamy',
  'Halimah Yusof', 'Tan Sri Johari', 'P. Ramachandran', 'Azlan Shah',
]

const SENTIMENT_FACTORS_POS = [
  'Projek pembangunan terkini meningkatkan keyakinan pengundi.',
  'Populariti tinggi calon penyandang di kawasan ini.',
  'Janji manifesto yang menarik perhatian pengundi muda.',
  'Infrastruktur bertambah baik sejak PRU lepas.',
]
const SENTIMENT_FACTORS_NEU = [
  'Sentimen bercampur — isu kos sara hidup membimbangkan pengundi.',
  'Pengundi masih belum membuat keputusan muktamad.',
  'Tiada isu besar yang mendominasi kawasan ini.',
]
const SENTIMENT_FACTORS_NEG = [
  'Sentimen negatif akibat skandal rasuah tempatan.',
  'Janji-janji tidak ditunaikan menyebabkan kekecewaan.',
  'Isu banjir dan bencana alam menjejaskan sokongan.',
]

const PREDICTION_FACTORS = [
  'Pengalaman', 'Sokongan belia', 'Undi protes',
  'Populariti penyandang', 'Gelombang perubahan',
  'Isu kos sara hidup', 'Sentimen agama', 'Projek pembangunan',
  'Skandal rasuah', 'Undi etnik', 'Sokongan jentera parti',
]

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function generateSentiment() {
  const score = rng(30, 80)
  let label: string, summary: string
  if (score >= 60) {
    label = 'positif'; summary = pick(SENTIMENT_FACTORS_POS)
  } else if (score >= 40) {
    label = 'neutral'; summary = pick(SENTIMENT_FACTORS_NEU)
  } else {
    label = 'negatif'; summary = pick(SENTIMENT_FACTORS_NEG)
  }
  return { score, label, summary, updatedAt: new Date().toISOString() }
}

function generatePredictions() {
  const count = rng(2, 3)
  const parties = pickN(PARTIES, count)
  let remaining = 100
  return parties.map((party, i) => {
    const isLast = i === parties.length - 1
    const rate = isLast ? remaining : rng(Math.max(15, remaining - 60 * (parties.length - i)), remaining - (parties.length - i - 1) * 15)
    remaining -= rate
    return {
      candidateName: pick(CANDIDATE_POOL),
      party,
      winRate: rate,
      factors: pickN(PREDICTION_FACTORS, 2).join(', '),
      generatedAt: new Date().toISOString(),
    }
  })
}

async function putKV(key: string, value: unknown) {
  const res = await fetch(`${KV_BASE}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  })
  const body = await res.json().catch(() => ({}))
  return (body as any).success === true
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  const geoPath = path.resolve('public/geojson/pru_parlimen.json')
  const geojson = JSON.parse(fs.readFileSync(geoPath, 'utf-8'))
  const codes: string[] = geojson.features.map(
    (f: any) => f.properties.code,
  )

  console.log(`🌱 Seeding ${codes.length} regions to CF KV namespace ${NS_ID}...\n`)

  let ok = 0
  let fail = 0

  for (const code of codes) {
    const sent = generateSentiment()
    const pred = generatePredictions()

    const sOk = await putKV(`sentiment:${code}`, sent)
    const pOk = await putKV(`prediction:${code}`, pred)

    if (sOk && pOk) {
      ok++
      console.log(`  ✅ ${code} ${geojson.features.find((f:any)=>f.properties.code===code)?.properties.name.padEnd(20) || ''} score=${sent.score}% ${sent.label}`)
    } else {
      fail++
      console.log(`  ❌ ${code} FAILED`)
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 150))
  }

  console.log(`\n🎉 Done! ${ok} success, ${fail} failed.`)
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
