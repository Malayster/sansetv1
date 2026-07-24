import { Metadata } from 'next'
import { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import { getActiveElections, getElectionRegions } from '@/lib/election-server'
import { getKVValue, getHistoricalResults } from '@/lib/kv'
import ElectionPageClient from './ElectionPageClient'
import type { ElectionInfo, RegionWithData } from '@/types/election'
import type { ElectionPackConfig } from '@/lib/region-service'

export const metadata: Metadata = {
  title: 'Pusat Pilihan Raya — Suara Anak Negeri',
  description: 'Peta interaktif, sentimen, ramalan, dan berita pilihan raya terkini.',
}

export const revalidate = 120

// ─── Lookup: Sanity electionName → config folder ID ───
const STATE_FOLDER_MAP: Record<string, string> = {
  'Negeri Sembilan': 'prn-ns-2026',
  'Selangor':        'prn-selangor-2026',
  'Pulau Pinang':    'prn-penang-2026',
  'Perak':           'prn-perak-2026',
  'Pahang':          'prn-pahang-2026',
  'Kedah':           'prn-kedah-2026',
  'Kelantan':        'prn-kelantan-2026',
  'Terengganu':      'prn-terengganu-2026',
  'Perlis':          'prn-perlis-2026',
  'Melaka':          'prn-melaka-2026',
  'Johor':           'prn-johor-2026',
  'Sabah':           'prn-sabah-2026',
  'Sarawak':         'prn-sarawak-2026',
  'Wilayah Persekutuan': 'prn-wp-2026',
}

// ─── Lookup: state name → short prefix for demographics-dun.json keys (e.g. "NSN_N01") ───
const STATE_PREFIX_MAP: Record<string, string> = {
  'Negeri Sembilan': 'NSN',
  'Selangor':        'SGR',
  'Pulau Pinang':    'PNG',
  'Perak':           'PRK',
  'Pahang':          'PHG',
  'Kedah':           'KDH',
  'Kelantan':        'KTN',
  'Terengganu':      'TRG',
  'Perlis':          'PLS',
  'Melaka':          'MLK',
  'Johor':           'JHR',
  'Sabah':           'SBH',
  'Sarawak':         'SWK',
  'Wilayah Persekutuan': 'WPK',
}

/** Extract state name from "PRN Negeri Sembilan" → "Negeri Sembilan" */
function extractStateName(electionName: string): string | null {
  // Remove "PRN " prefix, remove trailing year like " 2026"
  const name = electionName.replace(/^PRN\s+/i, '').replace(/\s+\d{4}$/, '').trim()
  if (STATE_PREFIX_MAP[name]) return name
  // Also try direct match
  if (STATE_PREFIX_MAP[electionName]) return electionName
  return null
}

/** Load Election Pack config using reliable lookup */
function loadElectionPackConfig(election: ElectionInfo): ElectionPackConfig | null {
  try {
    // Try folder map first (for PRN state elections)
    const stateName = extractStateName(election.electionName)
    if (stateName && STATE_FOLDER_MAP[stateName]) {
      const fp = path.join(process.cwd(), 'data', 'elections', STATE_FOLDER_MAP[stateName], 'config.json')
      if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf-8'))
    }
  } catch {}
  return null
}

/** Load demographics-dun.json and index by (prefix, code) */
function loadDunDemographics(): Record<string, any> {
  try {
    const fp = path.join(process.cwd(), 'data', 'kv-output', 'demographics-dun.json')
    if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {}
  return {}
}

/** Load demographics-parlimen.json for parliament-level fallback */
function loadParlimenDemographics(): Record<string, any> {
  try {
    const fp = path.join(process.cwd(), 'data', 'kv-output', 'demographics-parlimen.json')
    if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {}
  return {}
}

/** Load hot-seats.json for Kerusi Panas analysis */
function loadHotSeats(): Record<string, any> {
  try {
    const fp = path.join(process.cwd(), 'data', 'kv-output', 'hot-seats.json')
    if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {}
  return {}
}

async function loadRegionsWithData(election: ElectionInfo): Promise<RegionWithData[]> {
  const regions = await getElectionRegions(election.geoJsonFile)
  const historicalData = getHistoricalResults()
  const dunDemo = loadDunDemographics()
  const parlDemo = loadParlimenDemographics()
  const hotSeatsData = loadHotSeats()

  // Determine state prefix for this election
  const stateName = extractStateName(election.electionName)
  const prefix = stateName ? STATE_PREFIX_MAP[stateName] : null

  // Load election pack config for dunToParlimen mapping
  const pack = loadElectionPackConfig(election)

  return Promise.all(
    regions.map(async (region) => {
      const [sentiment, candidates] = await Promise.all([
        getKVValue(process.env.CF_KV_NAMESPACE_ID || 'mock', `sentiment:${region.code}`),
        getKVValue(process.env.CF_KV_NAMESPACE_ID || 'mock', `candidates:${region.code}`),
      ])

      // Lookup DUN-level demographics
      let demographics: RegionWithData['demographics']
      const dunKey = prefix ? `${prefix}_${region.code}` : null
      const dunData = dunKey ? dunDemo[dunKey] : null

      if (dunData) {
        demographics = {
          malay: dunData.malay ?? 55,
          chinese: dunData.chinese ?? 25,
          indian: dunData.indian ?? 10,
          others: (dunData.orang_asli ?? 0) + (dunData.others ?? 5),
          orang_asli: dunData.orang_asli ?? undefined,
          totalElectors: dunData.total_voters ?? undefined,
        }
      } else {
        // Fallback: parliament-level data (split per DUN)
        const parlCode = pack?.dunToParlimen?.[region.code]
        const parlData = parlCode ? parlDemo[parlCode] as Record<string, any> | undefined : null
        if (parlData && parlCode) {
          const dunCount = pack?.parlimenInfo?.[parlCode]?.dunCount || 1
          demographics = {
            malay: parlData.malay ?? 55,
            chinese: parlData.chinese ?? 25,
            indian: parlData.indian ?? 10,
            others: parlData.others ?? 5,
            totalElectors: parlData.totalElectors ? Math.round(parlData.totalElectors / dunCount) : undefined,
          }
        } else {
          demographics = { malay: 60, chinese: 25, indian: 10, others: 5 }
        }
      }

      // Historical + hot seat data: try STATE_CODE and simple code
      const prefixedCode = prefix ? `${prefix}_${region.code}` : null
      const history = (historicalData as Record<string, any>)[region.code]
        || (prefixedCode && (historicalData as Record<string, any>)[prefixedCode])
        || undefined

      const hotSeat = (hotSeatsData as Record<string, any>)[region.code]
        || (prefixedCode && (hotSeatsData as Record<string, any>)[prefixedCode])
        || undefined

      // Attach hot seat classification
      const enhancedHistory = history ? { ...history } : undefined
      if (enhancedHistory && hotSeat) {
        enhancedHistory._hotSeat = hotSeat.status || null
        enhancedHistory._hotSeatLabel = hotSeat.label || null
        enhancedHistory._hotSeatRecentMajority = hotSeat.majority || null
        enhancedHistory._hotSeatRecentYear = hotSeat.year || null
      }

      return {
        ...region,
        sentiment,
        candidates: candidates || [],
        demographics,
        history: enhancedHistory,
      }
    }),
  )
}

export default async function ElectionPage() {
  const elections = await getActiveElections()

  if (elections.length === 0) {
    return (
      <main className="max-w-[1180px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center py-20">
          <h1 className="font-serif text-[28px] font-bold text-[#C41E3A] mb-4">Pusat Pilihan Raya</h1>
          <p className="text-gray-500">Tiada pilihan raya aktif buat masa ini. Sila semak semula nanti.</p>
        </div>
      </main>
    )
  }

  // Pre-load regions for all active elections
  let electionsWithRegions = await Promise.all(
    elections.map(async (el) => ({
      election: el,
      regions: await loadRegionsWithData(el),
      electionPack: loadElectionPackConfig(el),
    })),
  )

  // Sort: PRN (state elections) before PRU (general elections) so Negeri Sembilan is default
  electionsWithRegions.sort((a, b) => {
    if (a.election.electionType === 'prn' && b.election.electionType !== 'prn') return -1
    if (a.election.electionType !== 'prn' && b.election.electionType === 'prn') return 1
    return 0
  })

  return (
    <main className="max-w-[1180px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Suspense fallback={<div className="text-center py-10 text-[13px] text-gray-400">Memuatkan dashboard...</div>}><ElectionPageClient electionsWithRegions={electionsWithRegions} /></Suspense>
    </main>
  )
}
