'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import ElectionSidebar from '@/ui/election-sidebar'
import ElectionDunList from '@/ui/election-dun-list'
import ElectionCharts from '@/ui/election-charts'
import ElectionSwing from '@/ui/election-swing'
import ElectionCompare from '@/ui/election-compare'
import SemiCircleView from '@/ui/election-semicycle'
import Swingometer from '@/ui/election-swingometer'
import { ExecutiveSummary, MajorityTracker, KeyRaces } from '@/ui/election-insights'
import PostalVotePanel from '@/ui/election-postal-vote'
import { PARTY_COLOR_HEX } from '@/ui/party-vars'
import type { ElectionInfo, RegionWithData } from '@/types/election'
import type { ElectionPackConfig } from '@/lib/region-service'

const ElectionMap = dynamic(() => import('@/ui/election-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[420px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400 text-[12px]">Memuatkan peta...</div>,
})

export default function ElectionDashboard({
  election, regions, electionPack,
}: {
  election: ElectionInfo; regions: RegionWithData[]; electionPack: ElectionPackConfig | null
}) {
  const [selected, setSelected] = useState<RegionWithData | null>(null)
  const searchParams = useSearchParams()

  // Shareable DUN link
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
      <p className="text-[11px] text-gray-400 mb-3">
        📅 Mengundi: {new Date(election.electionDate).toLocaleDateString('ms', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    )}

    {/* Party breakdown */}
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      {partyBreakdown.map(([party, count]) => (
        <div key={party} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0 inline-block" style={{ background: PARTY_COLOR_HEX[party] || '#6b7280' }} />
          <span className="text-[11px] font-semibold text-gray-700">{party}</span>
          <span className="text-[11px] text-gray-500">{count}</span>
        </div>
      ))}
      <span className="text-[11px] text-gray-400 ml-auto">{regions.length} DUN</span>
    </div>

    {/* SVG Map — full width, static */}
    <ElectionMap
      regions={regions}
      selected={selected}
      onSelect={setSelected}
      geoJsonFile={election.geoJsonFile || ''}
    />

    {/* ═══════ KLIK DUN → Extra components ═══════ */}
    {selected && (
      <div className="mt-4 space-y-4">
        {/* Close button */}
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C41E3A]" />
            {selected.code} — {selected.name}
          </h2>
          <button
            onClick={() => setSelected(null)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            ✕ Tutup
          </button>
        </div>

        {/* Sidebar + Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ElectionSidebar region={selected} />
          <div className="lg:col-span-2 space-y-4">
            <ElectionCharts regions={[selected]} />
            <PostalVotePanel />
          </div>
        </div>

        {/* Swing + Banding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ElectionSwing regions={[selected]} />
          <ElectionCompare regions={[selected]} />
        </div>

        {/* SemiCircle + Swingometer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SemiCircleView regions={[selected]} />
          <Swingometer regions={[selected]} />
        </div>

        {/* Insights */}
        <ExecutiveSummary regions={[selected]} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MajorityTracker regions={[selected]} />
          <KeyRaces regions={[selected]} />
        </div>

        {/* DUN List — filtered to selected DUN */}
        <ElectionDunList regions={[selected]} />
      </div>
    )}
  </div>
  )
}
