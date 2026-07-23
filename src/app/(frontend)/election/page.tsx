import { Metadata } from 'next'
import { Suspense } from 'react'
import { getActiveElections, getElectionRegions } from '@/lib/election-server'
import { getKVValue, getMockDemographics, getHistoricalResults } from '@/lib/kv'
import ElectionPageClient from './ElectionPageClient'
import type { ElectionInfo, RegionWithData } from '@/types/election'

export const metadata: Metadata = {
  title: 'Pusat Pilihan Raya — Suara Anak Negeri',
  description: 'Peta interaktif, sentimen, ramalan, dan berita pilihan raya terkini.',
}

export const revalidate = 120

async function loadRegionsWithData(election: ElectionInfo): Promise<RegionWithData[]> {
  const regions = await getElectionRegions(election.geoJsonFile)
  const historicalData = getHistoricalResults()
  return Promise.all(
    regions.map(async (region) => {
      const [sentiment, candidates] = await Promise.all([
        getKVValue(process.env.CF_KV_NAMESPACE_ID || 'mock', `sentiment:${region.code}`),
        getKVValue(process.env.CF_KV_NAMESPACE_ID || 'mock', `candidates:${region.code}`),
      ])
      return {
        ...region,
        sentiment,
        candidates: candidates || [],
        demographics: getMockDemographics(region.code),
        history: (historicalData as Record<string, any>)[region.code] || undefined,
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
