'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import ElectionSidebar from '@/ui/election-sidebar'
import ElectionDunList from '@/ui/election-dun-list'
import ElectionCharts from '@/ui/election-charts'
import ElectionSwing from '@/ui/election-swing'
import ElectionCompare from '@/ui/election-compare'
import { ExecutiveSummary, MajorityTracker, KeyRaces } from '@/ui/election-insights'
import type { ElectionInfo, RegionWithData } from '@/types/election'

const ElectionMap = dynamic(() => import('@/ui/election-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[480px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-[12px]">Memuatkan peta...</div>,
})

type Tab = 'peta' | 'senarai' | 'analisis' | 'swing' | 'banding'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'peta', label: 'Peta Interaktif', icon: '🗺️' },
  { key: 'senarai', label: 'Senarai DUN', icon: '📋' },
  { key: 'analisis', label: 'Analisis', icon: '📊' },
  { key: 'swing', label: 'Aliran Undi', icon: '🔄' },
  { key: 'banding', label: 'Bandingkan', icon: '⚖️' },
]

export default function ElectionDashboard({
  election,
  regions,
}: {
  election: ElectionInfo
  regions: RegionWithData[]
}) {
  const [selected, setSelected] = useState<RegionWithData | null>(null)
  const [tab, setTab] = useState<Tab>('peta')

  const dunRegions = useMemo(() => regions.filter(r => r.code.startsWith('N')).sort((a, b) => a.code.localeCompare(b.code)), [regions])

  return (
    <div>
      {election.electionDate && (
        <p className="text-[11px] text-gray-400 -mt-3 mb-4">
          📅 Tarikh mengundi: {new Date(election.electionDate).toLocaleDateString('ms', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}

      {/* ═══════ HER0: Executive Summary ═══════ */}
      <ExecutiveSummary regions={dunRegions} />

      {/* ═══════ Insights Row: Majority + Key Races ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <MajorityTracker regions={dunRegions} />
        <KeyRaces regions={dunRegions} />
      </div>

      {/* ═══════ Tab Navigation ═══════ */}
      <div className="flex gap-1 mb-4 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl w-fit shadow-sm border border-gray-200/50">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium rounded-lg transition-all duration-200 ${
              tab === t.key
                ? 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════ Tab Content ═══════ */}
      {tab === 'peta' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ElectionMap regions={regions} selected={selected} onSelect={setSelected} geoJsonFile={election.geoJsonFile || 'pru_parlimen.json'} />
          </div>
          <ElectionSidebar region={selected} />
        </div>
      )}

      {tab === 'senarai' && <ElectionDunList regions={dunRegions} />}

      {tab === 'analisis' && (
        <div className="space-y-4">
          <ElectionCharts regions={dunRegions} />
        </div>
      )}

      {tab === 'swing' && <ElectionSwing regions={dunRegions} />}

      {tab === 'banding' && <ElectionCompare regions={dunRegions} />}
    </div>
  )
}
