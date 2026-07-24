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
  loading: () => <div className="w-full h-[420px] bg-gray-100 animate-pulse rounded flex items-center justify-center text-gray-400 text-[12px]">Memuatkan peta...</div>,
})

export default function ElectionDashboard({
  election, regions, electionPack,
}: {
  election: ElectionInfo; regions: RegionWithData[]; electionPack: ElectionPackConfig | null
}) {
  const [selected, setSelected] = useState<RegionWithData | null>(null)
  const searchParams = useSearchParams()

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

  // Normalize geoJsonFile for map: Sanity may have invalid filename
  const FE = { 'PRN Negeri Sembilan':'prn_nsn_dun.json','PRN Selangor':'prn_sgr_dun.json','PRN Pulau Pinang':'prn_png_dun.json','PRN Perak':'prn_prk_dun.json','PRN Pahang':'prn_phg_dun.json','PRN Kedah':'prn_kdh_dun.json','PRN Kelantan':'prn_ktn_dun.json','PRN Terengganu':'prn_trg_dun.json','PRN Perlis':'prn_pls_dun.json','PRN Melaka':'prn_mlk_dun.json','PRN Johor':'prn_jhr_dun.json','PRN Sabah':'prn_sbh_dun.json','PRN Sarawak':'prn_swk_dun.json','PRN Wilayah Persekutuan':'prn_wpk_dun.json' } as Record<string,string>
  const mapGeoJson = election.geoJsonFile || FE[election.electionName] || ''

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
  <div className="px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
    {/* Tarikh */}
    {election.electionDate && (
      <p className="text-[11px] text-[#1a1a1a]/40 mb-3 sm:mb-4">
        📅 Mengundi: {new Date(election.electionDate).toLocaleDateString('ms', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    )}

    {/* Party breakdown — horizontal scroll on mobile */}
    <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1 -mx-3 sm:mx-0 px-3 sm:px-0">
      {partyBreakdown.map(([party, count]) => (
        <div key={party} className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0 inline-block" style={{ background: PARTY_COLOR_HEX[party] || '#6b7280' }} />
          <span className="text-[11px] font-semibold text-[#1a1a1a]">{party}</span>
          <span className="text-[11px] text-[#1a1a1a]/50">{count}</span>
        </div>
      ))}
      <span className="text-[11px] text-[#1a1a1a]/40 ml-auto shrink-0">{regions.length} DUN</span>
    </div>

    {/* ═══════ Map + Panel — stack on mobile, side-by-side from tablet ═══════ */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* Map */}
      <div className="md:col-span-2">
        <ElectionMap
          regions={regions}
          selected={selected}
          onSelect={setSelected}
          geoJsonFile={mapGeoJson}
        />
      </div>

      {/* DUN Panel */}
      {selected ? (
        <div className="md:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#1a1a1a]">{selected.code} — {selected.name}</span>
            <button onClick={() => setSelected(null)} className="text-[10px] text-[#1a1a1a]/40 hover:text-[#1a1a1a]/60 transition-colors">✕ tutup</button>
          </div>
          <ElectionSidebar region={selected} />
        </div>
      ) : (
        <div className="md:col-span-3 border border-[#1a1a1a]/10 rounded-lg bg-white shadow-sm">
          <div className="p-3 border-b border-[#1a1a1a]/10">
            <select
              value=""
              onChange={(e) => {
                const r = regions.find(x => x.code === e.target.value)
                if (r) setSelected(r)
              }}
              className="w-full text-[12px] rounded-lg border border-[#1a1a1a]/10 px-3 py-2.5 bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/30 focus:border-[#C41E3A] appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px',
              }}
            >
              <option value="">Pilih DUN...</option>
              {regions.map(r => (
                <option key={r.code} value={r.code}>{r.code} — {r.name}</option>
              ))}
            </select>
          </div>
          <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto">
            <ElectionDunList regions={regions} />
          </div>
        </div>
      )}
    </div>

    {/* ═══════ Additional widgets — n8n-style responsive grid ═══════ */}
    <div className="space-y-3 sm:space-y-4">
      {/* Charts + PostalVote */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="md:col-span-2 space-y-3 sm:space-y-4">
          <ElectionCharts regions={regions} />
        </div>
        <div className="space-y-3 sm:space-y-4">
          <PostalVotePanel />
        </div>
      </div>

      {/* Swing + Banding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <ElectionSwing regions={regions} />
        <ElectionCompare regions={regions} />
      </div>

      {/* SemiCircle + Swingometer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <SemiCircleView regions={regions} />
        <Swingometer regions={regions} />
      </div>

      {/* Insights */}
      <ExecutiveSummary regions={regions} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <MajorityTracker regions={regions} />
        <KeyRaces regions={regions} />
      </div>
    </div>
  </div>
  )
}
