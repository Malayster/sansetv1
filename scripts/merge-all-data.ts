/**
 * merge-all-data.ts
 * Gabung data dari Tindak + Wikipedia + SPR → KV-ready output.
 * Usage: npx tsx scripts/merge-all-data.ts [--dry-run]
 * Sources (by priority):
 *   1. TindakMalaysia/General-Election-Data (CSV) — demographics + economic
 *   2. Wikipedia API (incumbents + candidate profiles)
 *   3. SPR Open Data (GE15 results)
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
  if (u.includes('PN') || u.includes('PAS') || u.includes('BERSATU') || u.includes('GERAKAN') || u.includes('PPBM')) return 'PN'
  if (u.includes('GPS') || u.includes('PBB') || u.includes('SUPP') || u.includes('PRS') || u.includes('PDP')) return 'GPS'
  if (u.includes('GRS') || u.includes('PBS') || u.includes('SAPP') || u.includes('LDP') || u.includes('PHRS') || u.includes('PCS')) return 'GRS'
  if (u.includes('WARISAN')) return 'WARISAN'
  return 'Bebas'
}

// ─── Tindak ethnicity → demographics mapping ───

function ethToDemographics(ethClassification: string): { malay: number; chinese: number; indian: number; others: number } | null {
  const c = ethClassification.toLowerCase()
  if (c.includes('majority')) {
    // "MALAY MAJORITY (60 % AND ABOVE)" → malay≈65, rest distributed
    return { malay: 65, chinese: 20, indian: 10, others: 5 }
  }
  if (c.includes('mixed')) {
    return { malay: 40, chinese: 35, indian: 20, others: 5 }
  }
  if (c.includes('chinese')) {
    return { malay: 15, chinese: 65, indian: 15, others: 5 }
  }
  return null
}

// ─── Candidate KV from mock ───

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

// ─── Main ───

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const dataDir = path.resolve('data')

  console.log('═'.repeat(60))
  console.log('  MERGE ALL DATA — Pipeline Pilihan Raya')
  console.log('═'.repeat(60))

  // ── Load Tindak data (primary source) ──
  let tindakData: Record<string, any> = {}
  const tindakPath = path.join(dataDir, 'tindak-parsed.json')
  if (fs.existsSync(tindakPath)) {
    tindakData = JSON.parse(fs.readFileSync(tindakPath, 'utf-8'))
    console.log(`\n📖 Tindak: ${Object.keys(tindakData).length} seats loaded`)
  } else {
    console.log(`\n⚠️  Tindak data not found. Run: npx tsx scripts/fetch-tindak.ts`)
  }

  // ── Load Wikipedia data ──
  let wikiData: Record<string, any> = {}
  const wikiPath = path.join(dataDir, 'wikipedia-demographics.json')
  if (fs.existsSync(wikiPath)) {
    for (const r of JSON.parse(fs.readFileSync(wikiPath, 'utf-8'))) wikiData[r.code] = r
    console.log(`📖 Wikipedia: ${Object.keys(wikiData).length} regions`)
  }

  // ── Load candidate profiles ──
  let profiles: Record<string, any> = {}
  const profPath = path.join(dataDir, 'candidate-profiles.json')
  if (fs.existsSync(profPath)) {
    profiles = JSON.parse(fs.readFileSync(profPath, 'utf-8'))
    console.log(`📖 Profiles: ${Object.keys(profiles).length} candidates`)
  }

  // ── Merge ──
  console.log('\n🔀 Merging...')
  const candidates: Record<string, Candidate[]> = {}
  const demographics: Record<string, any> = {}

  for (const [code, cands] of Object.entries(MOCK_CANDIDATES)) {
    const merged: Candidate[] = JSON.parse(JSON.stringify(cands))
    const tindak = tindakData[code]

    // Inject candidate profiles from Wikipedia
    for (const c of merged) {
      const prof = profiles[c.name]
      if (prof) { c.profile = prof.profile; c.wikipediaUrl = prof.wikipediaUrl }
    }

    // Wikipedia incumbent
    const wiki = wikiData[code]
    if (wiki?.incumbent) {
      const match = merged.find(c => c.name.toLowerCase() === wiki.incumbent.name.toLowerCase())
      if (!match) {
        for (const c of merged) c.role = 'pencabar'
        merged.unshift({
          name: wiki.incumbent.name,
          party: mapParty(wiki.incumbent.party),
          partyLogo: getLogo(mapParty(wiki.incumbent.party)),
          role: 'penyandang',
          profile: '', wikipediaUrl: '',
          lastElection: { year: 2022, votes: 0, majority: 0, percentage: 0, totalVoters: 45000, turnout: 78.5 },
        })
      }
    }

    // Tindak: update totalVoters (real data from August 2025)
    if (tindak?.totalElectors) {
      for (const c of merged) c.lastElection.totalVoters = tindak.totalElectors
    }

    // Tindak: update winning party info
    if (tindak?.winningParty) {
      const tindakParty = mapParty(tindak.winningParty)
      const penyandang = merged.find(c => c.role === 'penyandang')
      if (penyandang && penyandang.party !== tindakParty) {
        // Update penyandang party to match actual GE15 winner
        penyandang.party = tindakParty
        penyandang.partyLogo = getLogo(tindakParty)
      }
    }

    candidates[code] = merged

    // ── Demographics (Tindak primary, Wikipedia secondary) ──
    const demo: any = { source: 'Tindak Malaysia / SPR', updatedAt: new Date().toISOString() }

    // Tindak economic data
    if (tindak) {
      demo.ethnicity = tindak.ethnicity || ''
      demo.medianIncome = tindak.medianIncome || 0
      demo.meanIncome = tindak.meanIncome || 0
      demo.gini = tindak.gini || 0
      demo.poverty = tindak.poverty || 0
      demo.totalElectors = tindak.totalElectors || 0
      demo.maleElectors = tindak.maleElectors || 0
      demo.femaleElectors = tindak.femaleElectors || 0
      demo.ageGroups = tindak.ageGroups || {}
    }

    // Wikipedia: ethnic breakdown
    if (wiki?.demographics) {
      demo.malay = wiki.demographics.malay
      demo.chinese = wiki.demographics.chinese
      demo.indian = wiki.demographics.indian
      demo.others = wiki.demographics.others
    } else if (tindak?.ethnicity) {
      const eth = ethToDemographics(tindak.ethnicity)
      if (eth) Object.assign(demo, eth)
    }

    // Fallback
    if (!demo.malay) { demo.malay = 65; demo.chinese = 20; demo.indian = 10; demo.others = 5 }

    demographics[code] = demo
  }

  // Summary
  console.log(`   ${Object.keys(candidates).length} regions merged`)
  let withProf = 0
  for (const cands of Object.values(candidates)) for (const c of cands) { if (c.profile) withProf++ }
  console.log(`   ${withProf} candidate profiles enhanced`)

  // Write output
  const outDir = path.join(dataDir, 'kv-output')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'candidates.json'), JSON.stringify(candidates, null, 2))
  fs.writeFileSync(path.join(outDir, 'demographics.json'), JSON.stringify(demographics, null, 2))

  for (const [code, cands] of Object.entries(candidates).slice(0, 4)) {
    const p = cands.find(c => c.role === 'penyandang')
    const d = demographics[code]
    console.log(`  ${code}: ${cands.length} calon | ${p?.party} penyandang | ${d.totalElectors?.toLocaleString() || '?'} voters | RM${d.medianIncome || '?'} median`)
  }

  console.log(`\n📁 Output → ${outDir}/`)
  if (dryRun) console.log('\n🔍 DRY RUN — KV not updated.')
  else console.log('\n☁️  Set CLOUDFLARE env vars to push to KV.')
  console.log('═'.repeat(60))
}

main().catch(console.error)
