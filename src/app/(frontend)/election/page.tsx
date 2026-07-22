import { Metadata } from 'next'
import { getActiveElection, getElectionRegions } from '@/lib/election'
import { getKVValue } from '@/lib/kv'
import ElectionDashboard from '@/ui/election-dashboard'
import type { RegionWithData } from '@/types/election'

export const metadata: Metadata = {
  title: 'Pusat Pilihan Raya — Suara Anak Negeri',
  description: 'Peta interaktif, sentimen, ramalan, dan berita pilihan raya terkini.',
}

export const revalidate = 120

export default async function ElectionPage() {
  const election = await getActiveElection()
  const regions = await getElectionRegions()

  const regionsWithData: RegionWithData[] = await Promise.all(
    regions.map(async (region) => {
      const sentiment = await getKVValue(
        process.env.CF_KV_NAMESPACE_ID || 'mock',
        `sentiment:${region.code}`,
      )
      const predictions = await getKVValue(
        process.env.CF_KV_NAMESPACE_ID_PREDICTIONS || 'mock',
        `prediction:${region.code}`,
      )
      return { ...region, sentiment, predictions }
    }),
  )

  return (
    <main className="max-w-[1180px] mx-auto px-4 py-6">
      {election ? (
        <ElectionDashboard election={election} regions={regionsWithData} />
      ) : (
        <div className="text-center py-20">
          <h1 className="font-serif text-[28px] font-bold text-[#C41E3A] mb-4">Pusat Pilihan Raya</h1>
          <p className="text-gray-500">Tiada pilihan raya aktif buat masa ini. Sila semak semula nanti.</p>
        </div>
      )}
    </main>
  )
}
