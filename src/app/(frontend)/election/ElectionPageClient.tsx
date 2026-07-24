'use client'

import { useState, useMemo } from 'react'
import ElectionDashboard from '@/ui/election-dashboard'
import type { ElectionInfo, RegionWithData } from '@/types/election'
import type { ElectionPackConfig } from '@/lib/region-service'

interface ElectionWithRegions {
  election: ElectionInfo
  regions: RegionWithData[]
  electionPack: ElectionPackConfig | null
}

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

export default function ElectionPageClient({
  electionsWithRegions,
}: {
  electionsWithRegions: ElectionWithRegions[]
}) {
  const [index, setIndex] = useState(0)
  const current = electionsWithRegions[index]

  const summaries = useMemo(() =>
    electionsWithRegions.map(el => ({
      id: el.election._id,
      name: el.election.electionName,
      short: el.election.electionName.replace('PRN ', ''),
      duns: el.electionPack?.dunToParlimen
        ? Object.keys(el.electionPack.dunToParlimen).length
        : el.regions.length,
    })),
  [electionsWithRegions])

  return (
  <div className="max-w-7xl mx-auto px-4 py-6">
    {/* ═══════ BIG TITLE ═══════ */}
    <div className="text-center mb-6">
      <h1 className="font-serif text-[28px] sm:text-[34px] font-black text-gray-900 tracking-tight">
        PUSAT PILIHAN RAYA
      </h1>
      <p className="text-[11px] text-gray-400 mt-1">
        Data dianalisis selari dengan <a href="https://electiondata.my" target="_blank" className="text-red-600 hover:underline">electiondata.my</a>
      </p>
    </div>

    {/* ═══════ Flat State Switcher ═══════ */}
    <div className="flex items-center justify-center gap-1.5 mb-6 flex-wrap">
      {electionsWithRegions.map((el, i) => {
        const flag = STATE_FLAGS[el.election.electionName]
        const active = i === index
        return (
          <button
            key={el.election._id}
            onClick={() => setIndex(i)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              active
                ? 'bg-[#C41E3A] text-white shadow-sm ring-1 ring-red-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            {flag && (
              <img src={flag} alt=""
                className="w-5 h-3.5 rounded object-cover border border-gray-200 shrink-0" />
            )}
            {summaries[i].short}
          </button>
        )
      })}
    </div>

    <ElectionDashboard election={current.election} regions={current.regions} electionPack={current.electionPack} />
  </div>
  )
}
