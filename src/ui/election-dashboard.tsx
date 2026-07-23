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
import { useTheme } from '@/ui/dark-mode'
import PostalVotePanel from '@/ui/election-postal-vote'
import type { ElectionInfo, RegionWithData } from '@/types/election'
import type { ElectionPackConfig } from '@/lib/region-service'

const ElectionMap = dynamic(() => import('@/ui/election-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[480px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-[12px]">Memuatkan peta...</div>,
})

type Tab = 'senarai' | 'analisis' | 'swing' | 'banding' | 'dewan' | 'simulasi'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'senarai', label: 'DUN', icon: '📋' },
  { key: 'analisis', label: 'Analisis', icon: '📊' },
  { key: 'swing', label: 'Swing', icon: '🔄' },
  { key: 'banding', label: 'Banding', icon: '⚖️' },
  { key: 'dewan', label: 'Dewan', icon: '🏛️' },
  { key: 'simulasi', label: 'Simulasi', icon: '🎯' },
]

type ViewLevel = 'dun' | 'parlimen'

export default function ElectionDashboard({
  election, regions, electionPack,
}: {
  election: ElectionInfo; regions: RegionWithData[]; electionPack: ElectionPackConfig | null
}) {
  const [selected, setSelected] = useState<RegionWithData | null>(null)
  const [tab, setTab] = useState<Tab>('senarai')
  const [viewLevel, setViewLevel] = useState<ViewLevel>('dun')
  const searchParams = useSearchParams()
  const { theme } = useTheme()

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

  // ─── PAR aggregation client-side ──────────────────────
  const parlimenRegions = useMemo(() => {
    if (!electionPack?.dunToParlimen) return []
    const group = new Map<string, RegionWithData & { _dunCount: number }>()
    for (const dun of regions) {
      const parlCode = electionPack.dunToParlimen[dun.code]
      if (!parlCode) continue
      const info = electionPack.parlimenInfo?.[parlCode]
      if (!group.has(parlCode)) {
        group.set(parlCode, {
          code: parlCode,
          name: info?.name || parlCode,
          state: dun.state,
          lat: dun.lat,
          lng: dun.lng,
          candidates: [],
          sentiment: null,
          demographics: { ...dun.demographics },
          history: undefined as any,
          _dunCount: 0,
        })
      }
      const g = group.get(parlCode)!
      g._dunCount++
      g.candidates.push(...dun.candidates)
      g.lat = (g.lat + dun.lat) / 2
      g.lng = (g.lng + dun.lng) / 2
    }
    return Array.from(group.values()).map(g => {
      const seatCounts: Record<string, number> = {}
      for (const c of g.candidates) {
        if (c.role === 'penyandang') seatCounts[c.party] = (seatCounts[c.party] || 0) + 1
      }
      const dominant = Object.entries(seatCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || ''
      return {
        ...g,
        demographics: {
          ...g.demographics,
          _parlCode: g.code,
          _dunCount: g._dunCount,
          _dominantParty: dominant,
        },
        _dunCount: undefined,
      }
    }).sort((a, b) => a.code.localeCompare(b.code))
  }, [regions, electionPack])

  const activeRegions = viewLevel === 'parlimen' && parlimenRegions.length > 0
    ? parlimenRegions
    : regions.filter(r => r.code.startsWith('N')).sort((a, b) => a.code.localeCompare(b.code))

  const containerClass = theme === 'dark'
  ? 'dark bg-gray-900 text-gray-100 min-h-screen'
  : 'bg-transparent'

  return (
  <div className={containerClass}>
  {election.electionDate && (
  <p className="text-[11px] text-gray-400 -mt-3 mb-4">
  📅 Tarikh mengundi: {new Date(election.electionDate).toLocaleDateString('ms', { year: 'numeric', month: 'long', day: 'numeric' })}
  </p>
  )}

  {/* Level Switcher + Tab Navigation */}
  <div className="flex items-center gap-3 mb-4 flex-wrap">
    {/* View level toggle — only if election pack available */}
    {electionPack && (
      <div className="flex bg-gray-100/80 rounded-lg p-0.5 border border-gray-200/50 shadow-sm">
        <button onClick={() => setViewLevel('dun')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
            viewLevel === 'dun'
              ? 'bg-[#C41E3A] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🗳️ DUN {regions.filter(r => r.code.startsWith('N')).length}
        </button>
        <button onClick={() => setViewLevel('parlimen')}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
            viewLevel === 'parlimen'
              ? 'bg-[#C41E3A] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏛️ Parlimen {parlimenRegions.length}
        </button>
      </div>
    )}

    {/* Tab bar */}
    <div className="flex gap-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl border border-gray-200/50 overflow-x-auto">
    {TABS.map(t => (
    <button key={t.key} onClick={() => setTab(t.key)}
    className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
    tab === t.key
    ? 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200'
    : 'text-gray-500 hover:text-gray-700:text-gray-200 hover:bg-white/50:bg-gray-700/50'
    }`}
    >
    <span>{t.icon}</span>
    {t.label}
    </button>
    ))}
    </div>
  </div>

  {/* ═══════ Content mengikut Tab ═══════ */}
  <div className="space-y-4">
  {/* 🗺️ Peta Kawasan + Sidebar — semua tab */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">
  <ElectionMap regions={activeRegions} selected={selected} onSelect={setSelected} geoJsonFile={viewLevel === 'parlimen' ? 'pru_parlimen.json' : (election.geoJsonFile || 'pru_parlimen.json')} />
  </div>
  <ElectionSidebar region={selected} />
  </div>

  {/* 📋 Content khusus tab */}
  {tab === 'senarai' && <ElectionDunList regions={activeRegions} />}
  {tab === 'analisis' && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2 space-y-4">
  <ElectionCharts regions={activeRegions} />
  </div>
  <div className="space-y-4">
  <PostalVotePanel />
  </div>
  </div>
  )}
  {tab === 'swing' && <ElectionSwing regions={activeRegions} />}
  {tab === 'banding' && <ElectionCompare regions={activeRegions} />}
  {tab === 'dewan' && <SemiCircleView regions={activeRegions} />}
  {tab === 'simulasi' && <Swingometer regions={activeRegions} />}

  {/* 📊 Insights — semua tab */}
  <ExecutiveSummary regions={activeRegions} />

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <MajorityTracker regions={activeRegions} />
  <KeyRaces regions={activeRegions} />
  </div>
  </div>
  </div>
  )
}
