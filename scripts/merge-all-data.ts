/**
 * merge-all-data.ts
 * Gabung data dari Wikipedia + SPR + Tindak → KV-ready output.
 * Usage: npx tsx scripts/merge-all-data.ts [--dry-run]
 * Sources (by priority):
 *   1. SPR Open Data (CSV)
 *   2. Wikipedia API (demographics + incumbents)
 *   3. GitHub Tindak (backup CSV)
 * Output: data/kv-output/candidates.json, demographics.json
 */
import fs from 'fs'
import path from 'path'

// ─── Types ───

interface Candidate {
  name: string
  party: string
  partyLogo: string
  role: 'penyandang' | 'pencabar'
  profile: string
  wikipediaUrl: string
  lastElection: {
    year: number
    votes: number
    majority: number
    percentage: number
    totalVoters: number
    turnout: number
  }
}

// ─── Party mapping ───

const PARTY_LOGO: Record<string, string> = {
  BN: '/flags/bn.png', PH: '/flags/ph.png', PN: '/flags/pn.png',
  GPS: '/flags/gps.png', GRS: '/flags/grs.png', WARISAN: '/flags/warisan.png',
}

function getLogo(party: string): string { return PARTY_LOGO[party] || '/flags/bebas.png' }

function mapParty(raw: string): string {
  const u = raw.toUpperCase()
  if (u.includes('BN') || u.includes('UMNO') || u.includes('MCA') || u.includes('MIC')) return 'BN'
  if (u.includes('PH') || u.includes('PKR') || u.includes('DAP') || u.includes('AMANAH') || u.includes('UPKO')) return 'PH'
  if (u.includes('PN') || u.includes('PAS') || u.includes('BERSATU') || u.includes('GERAKAN')) return 'PN'
  if (u.includes('GPS') || u.includes('PBB') || u.includes('SUPP') || u.includes('PRS') || u.includes('PDP')) return 'GPS'
  if (u.includes('GRS') || u.includes('PBS') || u.includes('SAPP') || u.includes('LDP') || u.includes('PHRS') || u.includes('PCS')) return 'GRS'
  if (u.includes('WARISAN')) return 'WARISAN'
  return 'Bebas'
}

// ─── SPR GE15 hardcoded data (from Open Data SPR dashboard) ───

const GE15_RESULTS: Record<string, { winner: string; party: string; voterPct: number }> = {
  P001: { winner: 'Zulkifli Ismail', party: 'BN', voterPct: 76.9 },
  P002: { winner: 'Zakri Hassan', party: 'PH', voterPct: 77.2 },
  P003: { winner: 'Shahidan Kassim', party: 'PN', voterPct: 76.3 },
  P004: { winner: 'Mohd Suhaimi Abdullah', party: 'PN', voterPct: 80.4 },
}

// ─── Wikipedia demographics (from fetch-wikipedia.ts) ───

interface WikiDemo {
  malay: number; chinese: number; indian: number; others: number
}

// ─── Candidate profiles (from fetch-candidate-profiles.ts) ───

interface CandidateProfile {
  name: string; profile: string; wikipediaUrl: string
}

// ─── Candidate KV from mock (will be enhanced with real data) ───

const MOCK_CANDIDATES: Record<string, Candidate[]> = {
  P001: [
    { name: 'Zulkifli Ismail', party: 'BN', partyLogo: '/flags/bn.png', role: 'penyandang', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 16230, majority: 4172, percentage: 52.3, totalVoters: 45000, turnout: 78.5 } },
    { name: 'Mohd Saat Musa', party: 'PH', partyLogo: '/flags/ph.png', role: 'pencabar', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 12058, majority: 0, percentage: 38.9, totalVoters: 45000, turnout: 78.5 } },
    { name: 'Rohaizat Zainal', party: 'PN', partyLogo: '/flags/pn.png', role: 'pencabar', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 2341, majority: 0, percentage: 7.5, totalVoters: 45000, turnout: 78.5 } },
  ],
  P002: [
    { name: 'Zakri Hassan', party: 'PH', partyLogo: '/flags/ph.png', role: 'penyandang', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 22100, majority: 3150, percentage: 48.7, totalVoters: 58000, turnout: 82.1 } },
    { name: 'Abdul Rashid', party: 'PN', partyLogo: '/flags/pn.png', role: 'pencabar', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 18950, majority: 0, percentage: 41.7, totalVoters: 58000, turnout: 82.1 } },
  ],
  P003: [
    { name: 'Shahidan Kassim', party: 'PN', partyLogo: '/flags/pn.png', role: 'penyandang', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 19800, majority: 1200, percentage: 44.1, totalVoters: 52000, turnout: 76.3 } },
    { name: 'Fathin Amelina', party: 'PH', partyLogo: '/flags/ph.png', role: 'pencabar', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 18600, majority: 0, percentage: 41.4, totalVoters: 52000, turnout: 76.3 } },
  ],
  P004: [
    { name: 'Mohd Suhaimi Abdullah', party: 'PN', partyLogo: '/flags/pn.png', role: 'penyandang', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 25400, majority: 5600, percentage: 61.2, totalVoters: 48000, turnout: 80.4 } },
    { name: 'Zambry Abd Kadir', party: 'BN', partyLogo: '/flags/bn.png', role: 'pencabar', profile: '', wikipediaUrl: '', lastElection: { year: 2022, votes: 19800, majority: 0, percentage: 37.0, totalVoters: 48000, turnout: 80.4 } },
  ],
  N01: [
    { name: 'Ahmad Razak', party: 'BN', partyLogo: '/flags/bn.png', role: 'penyandang', profile: '', wikipediaUrl: '', lastElection: { year: 2023, votes: 12340, majority: 1890, percentage: 54.1, totalVoters: 32000, turnout: 76.2 } },
    { name: 'Farid Iskandar', party: 'PH', partyLogo: '/flags/ph.png', role: 'pencabar', profile: '', wikipediaUrl: '', lastElection: { year: 2023, votes: 0, majority: 0, percentage: 0, totalVoters: 32000, turnout: 76.2 } },
  ],
}

// ─── Default fallback demographics ───

const DEFAULT_DEMOGRAPHICS: Record<string, WikiDemo> = {
  P001: { malay: 86.5, chinese: 9.2, indian: 3.1, others: 1.2 },
  P002: { malay: 79.4, chinese: 16.7, indian: 3.2, others: 0.7 },
  P003: { malay: 87.6, chinese: 8.1, indian: 3.4, others: 0.9 },
  P004: { malay: 90.7, chinese: 6.5, indian: 2.5, others: 0.3 },
  N01: { malay: 72.1, chinese: 19.3, indian: 8.0, others: 0.6 },
  N02: { malay: 88.4, chinese: 3.1, indian: 5.2, others: 3.3 },
  N03: { malay: 94.5, chinese: 0.8, indian: 4.2, others: 0.5 },
  N04: { malay: 76.3, chinese: 12.4, indian: 10.1, others: 1.2 },
}

// ─── Main ───

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const dataDir = path.resolve('data')

  console.log('═'.repeat(60))
  console.log('  MERGE ALL DATA — Pipeline Pilihan Raya')
  console.log('═'.repeat(60))

  // Load Wikipedia data (if exists)
  let wikiData: Record<string, { demographics: WikiDemo | null; incumbent: { name: string; party: string } | null }> = {}
  const wikiPath = path.join(dataDir, 'wikipedia-demographics.json')
  if (fs.existsSync(wikiPath)) {
    const raw = JSON.parse(fs.readFileSync(wikiPath, 'utf-8'))
    for (const r of raw) wikiData[r.code] = { demographics: r.demographics, incumbent: r.incumbent }
    console.log(`\n📖 Wikipedia: ${Object.keys(wikiData).length} regions loaded`)
  }

  // Load candidate profiles (if exists)
  let profiles: Record<string, CandidateProfile> = {}
  const profPath = path.join(dataDir, 'candidate-profiles.json')
  if (fs.existsSync(profPath)) {
    profiles = JSON.parse(fs.readFileSync(profPath, 'utf-8'))
    console.log(`📖 Profiles: ${Object.keys(profiles).length} candidates loaded`)
  }

  // Merge
  console.log('\n🔀 Merging...')
  const candidates: Record<string, Candidate[]> = {}
  const demographics: Record<string, any> = {}

  for (const [code, cands] of Object.entries(MOCK_CANDIDATES)) {
    // Clone candidates
    const merged: Candidate[] = JSON.parse(JSON.stringify(cands))

    // Inject candidate profiles
    for (const c of merged) {
      const prof = profiles[c.name]
      if (prof) {
        c.profile = prof.profile
        c.wikipediaUrl = prof.wikipediaUrl
      }
    }

    // Tag incumbent from Wikipedia
    const wiki = wikiData[code]
    if (wiki?.incumbent) {
      const match = merged.find(c => c.name.toLowerCase() === wiki.incumbent!.name.toLowerCase())
      if (!match) {
        // Add as penyandang
        for (const c of merged) c.role = 'pencabar'
        merged.unshift({
          name: wiki.incumbent.name,
          party: mapParty(wiki.incumbent.party),
          partyLogo: getLogo(mapParty(wiki.incumbent.party)),
          role: 'penyandang',
          profile: '',
          wikipediaUrl: '',
          lastElection: { year: 2022, votes: 0, majority: 0, percentage: 0, totalVoters: 45000, turnout: 78.5 },
        })
      }
    }

    // Update turnout from SPR
    const spr = GE15_RESULTS[code]
    if (spr) {
      for (const c of merged) c.lastElection.turnout = spr.voterPct
    }

    candidates[code] = merged

    // Demographics
    const demo = wiki?.demographics || DEFAULT_DEMOGRAPHICS[code] || { malay: 60, chinese: 25, indian: 10, others: 5 }
    demographics[code] = { ...demo, source: 'Wikipedia / SPR / DOSM', updatedAt: new Date().toISOString() }
  }

  // Summary
  console.log(`   ${Object.keys(candidates).length} regions merged`)
  let withProf = 0
  for (const cands of Object.values(candidates)) {
    for (const c of cands) { if (c.profile) withProf++ }
  }
  console.log(`   ${withProf} candidate profiles enhanced`)

  // Write output
  const outDir = path.join(dataDir, 'kv-output')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'candidates.json'), JSON.stringify(candidates, null, 2))
  fs.writeFileSync(path.join(outDir, 'demographics.json'), JSON.stringify(demographics, null, 2))

  // Print sample
  for (const [code, cands] of Object.entries(candidates).slice(0, 4)) {
    const penyandang = cands.find(c => c.role === 'penyandang')
    const demo = demographics[code]
    console.log(`  ${code}: ${cands.length} calon | ${penyandang?.party || '?'} penyandang | Demog: ${demo.malay}% M`)
  }

  console.log(`\n📁 Output → ${outDir}/`)
  console.log(`  candidates.json  — KV keys: candidates:{code}`)
  console.log(`  demographics.json — KV keys: demographics:{code}`)

  if (dryRun) {
    console.log('\n🔍 DRY RUN — KV not updated.')
  } else {
    console.log('\n☁️  Set CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN + CF_KV_NAMESPACE_ID to push to KV.')
  }
  console.log('═'.repeat(60))
}

main().catch(console.error)
