'use client'

import { useState, useMemo } from 'react'
import { ThemeProvider, ThemeToggle } from '@/ui/dark-mode'
import ElectionDashboard from '@/ui/election-dashboard'
import type { ElectionInfo, RegionWithData } from '@/types/election'
import type { ElectionPackConfig } from '@/lib/region-service'

interface ElectionWithRegions {
  election: ElectionInfo
  regions: RegionWithData[]
  electionPack: ElectionPackConfig | null
}

/** Map PRN state election names to their flag image paths */
const STATE_FLAGS: Record<string, string> = {
  'PRN Negeri Sembilan': '/flags/negeri-sembilan.svg',
  'PRN Selangor':        '/flags/selangor.svg',
  'PRN Pulau Pinang':    '/flags/pulau-pinang.svg',
  'PRN Perak':           '/flags/perak.svg',
  'PRN Pahang':          '/flags/pahang.svg',
  'PRN Kedah':           '/flags/kedah.svg',
  'PRN Kelantan':        '/flags/kelantan.svg',
  'PRN Terengganu':      '/flags/terengganu.svg',
  'PRN Perlis':          '/flags/perlis.svg',
  'PRN Melaka':          '/flags/melaka.svg',
  'PRN Johor':           '/flags/johor.svg',
  'PRN Sabah':           '/flags/sabah.svg',
  'PRN Sarawak':         '/flags/sarawak.svg',
  'PRN Wilayah Persekutuan': '/flags/wilayah-persekutuan.svg',
}

function getFlagPath(name: string): string | undefined {
  return STATE_FLAGS[name] || STATE_FLAGS[name.replace(/\s+\d{4}$/, '')] || undefined
}

export default function ElectionPageClient({
  electionsWithRegions,
}: {
  electionsWithRegions: ElectionWithRegions[]
}) {
  const [index, setIndex] = useState(0)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const current = electionsWithRegions[index]
  const currentFlag = getFlagPath(current.election.electionName)

  // Compute per-election seat stats for switcher preview
  const electionSummaries = useMemo(() =>
    electionsWithRegions.map((el) => {
      const duns = el.electionPack?.dunToParlimen
        ? Object.keys(el.electionPack.dunToParlimen).length
        : el.regions.length

      // Count hot seats
      const panas = el.regions.filter(r =>
        (r.history as any)?._hotSeat === 'sangat_panas'
      ).length
      const panas2 = el.regions.filter(r =>
        (r.history as any)?._hotSeat === 'panas'
      ).length

      return {
        id: el.election._id,
        name: el.election.electionName,
        flag: getFlagPath(el.election.electionName),
        duns,
        sangatPanas: panas,
        panas: panas2,
      }
    }),
  [electionsWithRegions])

  return (
  <ThemeProvider>
  <div>
  {/* ═══════ Header: Flag + Title + Switcher ═══════ */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
    <div className="flex items-center gap-3">
      {currentFlag && (
        <img src={currentFlag} alt={current.election.electionName}
          className="w-12 h-8 rounded object-cover border border-gray-200 shadow-sm shrink-0" />
      )}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-serif text-[24px] sm:text-[28px] font-bold text-gray-800 dark:text-gray-100">
            {current.election.electionName}
          </h1>
          {current.election.electionType === 'prn' && (
            <span className="text-[10px] font-semibold text-white bg-[#C41E3A] px-2 py-0.5 rounded align-middle">
              PRN
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
          {electionSummaries[index]?.duns || '—'} DUN
          {electionSummaries[index]?.sangatPanas > 0 && (
            <span className="text-red-600">🔥 {electionSummaries[index].sangatPanas} sangat panas</span>
          )}
          {electionSummaries[index]?.panas > 0 && (
            <span className="text-amber-600">⚡ {electionSummaries[index].panas} panas</span>
          )}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      <ThemeToggle />
      {electionsWithRegions.length > 1 && (
        <div className="relative">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[12px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors shadow-sm min-w-[180px]"
          >
            {currentFlag && <img src={currentFlag} alt="" className="w-6 h-4 rounded object-cover border border-gray-200" />}
            <span className="flex-1 text-left truncate">{current.election.electionName}</span>
            <svg className="w-3.5 h-3.5 text-gray-400 transition-transform" style={{ transform: switcherOpen ? 'rotate(180deg)' : '' }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {switcherOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSwitcherOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-[280px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2">Pilih Negeri</p>
                </div>
                <div className="max-h-[320px] overflow-y-auto p-1">
                  {electionSummaries.map((s, i) => {
                    const isActive = i === index
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setIndex(i); setSwitcherOpen(false) }}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        {s.flag && <img src={s.flag} alt="" className="w-8 h-5 rounded object-cover border border-gray-200 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {s.name}
                            {isActive && <span className="ml-1.5 text-[10px] text-red-600">✓</span>}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span>{s.duns} DUN</span>
                            {s.sangatPanas > 0 && <span className="text-red-600">🔥{s.sangatPanas}</span>}
                            {s.panas > 0 && <span className="text-amber-600">⚡{s.panas}</span>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  </div>

  <ElectionDashboard election={current.election} regions={current.regions} electionPack={current.electionPack} />
  </div>
  </ThemeProvider>
  )
}
