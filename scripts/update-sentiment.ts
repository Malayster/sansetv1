/**
 * Cron update script — regenerates sentiment & prediction data
 * for all parliament regions and pushes to Cloudflare KV.
 *
 * Runs every 6h via GitHub Actions (.github/workflows/update-sentiment.yml)
 *
 * Usage: npx tsx scripts/update-sentiment.ts
 */

// ═══════════════════════════════════════════════════════════
// CF KV CONFIG
// ═══════════════════════════════════════════════════════════
const ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || ''
const API_TOKEN =
  process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || ''
const NS_ID = process.env.CF_KV_NAMESPACE_ID || ''

if (!ACCOUNT_ID || !API_TOKEN || !NS_ID) {
  console.error('❌ Missing CF env vars.')
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

const SENT = {
  pos: [
    'Projek pembangunan terkini meningkatkan keyakinan pengundi.',
    'Populariti tinggi calon penyandang di kawasan ini.',
    'Janji manifesto yang menarik perhatian pengundi muda.',
    'Infrastruktur bertambah baik sejak PRU lepas.',
    'Sokongan padu dari akar umbi memberi kelebihan.',
  ],
  neu: [
    'Sentimen bercampur — isu kos sara hidup membimbangkan pengundi.',
    'Pengundi masih belum membuat keputusan muktamad.',
    'Tiada isu besar yang mendominasi kawasan ini.',
    'Pengundi menilai manifesto dengan teliti.',
  ],
  neg: [
    'Sentimen negatif akibat skandal rasuah tempatan.',
    'Janji-janji tidak ditunaikan menyebabkan kekecewaan.',
    'Isu banjir dan bencana alam menjejaskan sokongan.',
    'Kempen pembangkang yang agresif mengubah landskap.',
  ],
}

const PRED_FACTORS = [
  'Pengalaman', 'Sokongan belia', 'Undi protes',
  'Populariti penyandang', 'Gelombang perubahan',
  'Isu kos sara hidup', 'Sentimen agama', 'Projek pembangunan',
  'Skandal rasuah', 'Undi etnik', 'Sokongan jentera parti',
  'Janji manifesto', 'Debat awam', 'Media sosial',
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

function genSentiment() {
  const score = rng(30, 80)
  let label: string, summary: string
  if (score >= 60) { label = 'positif'; summary = pick(SENT.pos) }
  else if (score >= 40) { label = 'neutral'; summary = pick(SENT.neu) }
  else { label = 'negatif'; summary = pick(SENT.neg) }
  return { score, label, summary, updatedAt: new Date().toISOString() }
}

function genPredictions() {
  const count = rng(2, 3)
  const parties = pickN(PARTIES, count)
  let remaining = 100
  return parties.map((party, i) => {
    const last = i === parties.length - 1
    const rate = last ? remaining : rng(
      Math.max(15, remaining - 60 * (parties.length - i)),
      remaining - (parties.length - i - 1) * 15,
    )
    remaining -= rate
    return {
      candidateName: pick(CANDIDATE_POOL),
      party,
      winRate: rate,
      factors: pickN(PRED_FACTORS, 2).join(', '),
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

async function listKVKeys(prefix: string): Promise<string[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NS_ID}/keys?prefix=${encodeURIComponent(prefix)}`,
    { headers: { Authorization: `Bearer ${API_TOKEN}` } },
  )
  const body = (await res.json().catch(() => ({}))) as any
  return (body.result || []).map((k: any) => k.name)
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log(`🔄 Cron update started at ${new Date().toISOString()}\n`)

  // Discover existing region codes from KV keys
  const keys = await listKVKeys('sentiment:')
  const codes = keys.map((k: string) => k.replace('sentiment:', ''))

  if (codes.length === 0) {
    console.log('⚠️  No KV keys found. Run seed-kv.ts first.')
    process.exit(0)
  }

  console.log(`📍 Found ${codes.length} regions in KV\n`)

  let ok = 0
  let fail = 0

  for (const code of codes) {
    const sent = genSentiment()
    const pred = genPredictions()

    const sOk = await putKV(`sentiment:${code}`, sent)
    const pOk = await putKV(`prediction:${code}`, pred)

    if (sOk && pOk) {
      ok++
      console.log(`  ✅ ${code} → score=${sent.score}% ${sent.label} | top: ${pred[0]?.party} ${pred[0]?.winRate}%`)
    } else {
      fail++
      console.log(`  ❌ ${code} FAILED`)
    }

    await new Promise((r) => setTimeout(r, 150))
  }

  console.log(`\n✅ Done! ${ok} updated, ${fail} failed at ${new Date().toISOString()}`)
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
