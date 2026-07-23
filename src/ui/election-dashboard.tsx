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
import { AnimatedCounter } from '@/ui/animated-counter'
import { useTheme } from '@/ui/dark-mode'
import type { ElectionInfo, RegionWithData } from '@/types/election'

const ElectionMap = dynamic(() => import('@/ui/election-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[480px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-[12px]">Memuatkan peta...</div>,
})

type Tab = 'peta' | 'senarai' | 'analisis' | 'swing' | 'banding' | 'dewan' | 'simulasi'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'peta', label: 'Peta', icon: '🗺️' },
  { key: 'senarai', label: 'DUN', icon: '📋' },
  { key: 'analisis', label: 'Analisis', icon: '📊' },
  { key: 'swing', label: 'Swing', icon: '🔄' },
  { key: 'banding', label: 'Banding', icon: '⚖️' },
  { key: 'dewan', label: 'Dewan', icon: '🏛️' },
  { key: 'simulasi', label: 'Simulasi', icon: '🎯' },
]

const TIMELINE_YEARS = [2008, 2013, 2018, 2023, 2026]

export default function ElectionDashboard({
  election, regions,
}: {
  election: ElectionInfo; regions: RegionWithData[]
}) {
  const [selected, setSelected] = useState<RegionWithData | null>(null)
  const [tab, setTab] = useState<Tab>('peta')
  const [timelineYear, setTimelineYear] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const { theme } = useTheme()

  // Handle shareable DUN link
  useEffect(() => {
    const dun = searchParams?.get('dun')
    if (dun) {
      const r = regions.find(x => x.code === dun.toUpperCase())
      if (r) { setSelected(r); setTab('peta') }
    }
  }, [searchParams, regions])

  useEffect(() => {
    if (selected && tab === 'peta') {
      const url = new URL(window.location.href)
      url.searchParams.set('dun', selected.code)
      window.history.replaceState({}, '', url.toString())
    }
  }, [selected, tab])

  const dunRegions = useMemo(() =>
    regions.filter(r => r.code.startsWith('N')).sort((a, b) => a.code.localeCompare(b.code)),
  [regions])

  const containerClass = theme === 'dark'
    ? 'dark bg-gray-900 text-gray-100 min-h-screen'
    : 'bg-transparent'

  return (
    <div className={containerClass}>
      {election.electionDate && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-3 mb-4">
          📅 Tarikh mengundi: {new Date(election.electionDate).toLocaleDateString('ms', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}

      {/* ═══════ Executive Summary ═══════ */}
      <ExecutiveSummary regions={dunRegions} />

      {/* ═══════ Insights Row ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <MajorityTracker regions={dunRegions} />
        <KeyRaces regions={dunRegions} />
      </div>

      {/* ═══════ Timeline Slider ═══════ */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            📈 Garis Masa Pilihan Raya
          </h3>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {timelineYear ? `Peta menunjukkan pemenang PRU ${timelineYear}` : 'Peta: Penyandang Semasa'}
          </span>
        </div>
        <div className="flex gap-2">
          {TIMELINE_YEARS.map(y => {
            const isHistorical = y < 2026
            const isActive = timelineYear === y
            const isCurrent = !timelineYear && y === 2026
            const isSelected = isActive || isCurrent
            return (
              <button key={y} onClick={() => setTimelineYear(isActive ? null : y)}
                className={`flex-1 text-center py-2 px-3 rounded-lg text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-[#C41E3A] text-white shadow-sm'
                    : isHistorical
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-gray-50 dark:bg-gray-750 text-gray-400 dark:text-gray-500'
                }`}
              >
                {y}
                {y === 2026 && !timelineYear && <span className="ml-1 text-[9px] opacity-70">(kini)</span>}
                {isActive && <span className="ml-1">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══════ Tab Navigation ═══════ */}
      <div className="flex gap-1 mb-4 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl w-fit shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
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
            <ElectionMap regions={regions} selected={selected} onSelect={setSelected} geoJsonFile={election.geoJsonFile || 'pru_parlimen.json'} activeYear={timelineYear} />
          </div>
          <ElectionSidebar region={selected} />
        </div>
      )}

      {tab === 'senarai' && <ElectionDunList regions={dunRegions} />}
      {tab === 'analisis' && <ElectionCharts regions={dunRegions} />}
      {tab === 'swing' && <ElectionSwing regions={dunRegions} />}
      {tab === 'banding' && <ElectionCompare regions={dunRegions} />}
      {tab === 'dewan' && <SemiCircleView regions={dunRegions} />}
      {tab === 'simulasi' && <Swingometer regions={dunRegions} />}
    </div>
  )
}
