'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import ElectionSidebar from '@/ui/election-sidebar'
import ElectionDunList from '@/ui/election-dun-list'
import { PARTY_COLOR_HEX } from '@/ui/party-vars'
import type { ElectionInfo, RegionWithData } from '@/types/election'
import type { ElectionPackConfig } from '@/lib/region-service'

const ElectionMap = dynamic(() => import('@/ui/election-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[420px] bg-gray-100 animate-pulse rounded border border-gray-200 flex items-center justify-center text-gray-400 text-[12px]">Memuatkan peta...</div>,
})

export default function ElectionDashboard({
  election, regions, electionPack,
}: {
  election: ElectionInfo; regions: RegionWithData[]; electionPack: ElectionPackConfig | null
}) {
  const [selected, setSelected] = useState<RegionWithData | null>(null)
  const searchParams = useSearchParams()

  // Handle shareable DUN link
  useEffect(() => {
    const dun = searchParams?.get('dun')
    if (dun) {
      const r = regions.find(x => x.code === dun.toUpperCase())
      if (r) setSelected(r)
    }
  }, [searchParams, regions])

  useEffect(() => {
    if (selected) {
      const url = new URL(window.location.href)
      url.searchParams.set('dun', selected.code)
      window.history.replaceState({}, '', url.toString())
    }
  }, [selected])

  // Party breakdown
  const partyBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of regions) {
      const inc = r.candidates?.find(c => c.role === 'penyandang')
      const p = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty || 'Lain'
      counts[p] = (counts[p] || 0) + 1
    }
    return Object.entries(counts).sort(([, a], [, b]) => b - a)
  }, [regions])

  return (
  <div>
  {/* Tarikh */}
  {election.electionDate && (
    <p className="text-[11px] text-gray-400 mb-4">
      📅 Mengundi: {new Date(election.electionDate).toLocaleDateString('ms', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  )}

  {/* ═══════ Party Breakdown Bar ═══════ */}
  <div className="flex items-center gap-3 mb-4 flex-wrap">
    {partyBreakdown.map(([party, count]) => (
      <div key={party} className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: PARTY_COLOR_HEX[party] || '#6b7280' }} />
        <span className="text-[11px] font-semibold text-gray-700">{party}</span>
        <span className="text-[11px] text-gray-500">{count}</span>
      </div>
    ))}
    <span className="text-[11px] text-gray-400 ml-auto">{regions.length} DUN</span>
  </div>

  {/* ═══════ Map + Sidebar ═══════ */}
  <div className={`grid gap-4 mb-4 ${selected ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
    <div className={selected ? 'lg:col-span-2' : ''}>
      <ElectionMap
        regions={regions}
        selected={selected}
        onSelect={setSelected}
        geoJsonFile={election.geoJsonFile || ''}
      />
    </div>
    <ElectionSidebar region={selected} />
  </div>

  {/* ═══════ DUN List ═══════ */}
  <ElectionDunList regions={regions} />
  </div>
  )
}
