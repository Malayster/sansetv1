import { Metadata } from 'next'
import { getActiveElections, getElectionRegions } from '@/lib/election'
import { getKVValue } from '@/lib/kv'
import ElectionPageClient from './ElectionPageClient'
import type { ElectionInfo, RegionWithData } from '@/types/election'

export const metadata: Metadata = {
  title: 'Pusat Pilihan Raya — Suara Anak Negeri',
  description: 'Peta interaktif, sentimen, ramalan, dan berita pilihan raya terkini.',
}

export const revalidate = 120

async function loadRegionsWithData(election: ElectionInfo): Promise<RegionWithData[]> {
  const regions = await getElectionRegions(election.geoJsonFile)
  return Promise.all(
    regions.map(async (region) => {
      const [sentiment, predictions] = await Promise.all([
        getKVValue(process.env.CF_KV_NAMESPACE_ID || 'mock', `sentiment:${region.code}`),
        getKVValue(process.env.CF_KV_NAMESPACE_ID_PREDICTIONS || 'mock', `prediction:${region.code}`),
      ])
      return { ...region, sentiment, predictions }
    }),
  )
}

export default async function ElectionPage() {
  const elections = await getActiveElections()

  if (elections.length === 0) {
    return (
      <main className="max-w-[1180px] mx-auto px-4 py-6">
        <div className="text-center py-20">
          <h1 className="font-serif text-[28px] font-bold text-[#C41E3A] mb-4">Pusat Pilihan Raya</h1>
          <p className="text-gray-500">Tiada pilihan raya aktif buat masa ini. Sila semak semula nanti.</p>
        </div>
      </main>
    )
  }

  // Pre-load regions for all active elections
  const electionsWithRegions = await Promise.all(
    elections.map(async (el) => ({
      election: el,
      regions: await loadRegionsWithData(el),
    })),
  )

  return (
    <main className="max-w-[1180px] mx-auto px-4 py-6">
      <ElectionPageClient electionsWithRegions={electionsWithRegions} />
    </main>
  )
}
