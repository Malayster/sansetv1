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
  const flag = STATE_FLAGS[current.election.electionName]

  const summaries = useMemo(() =>
    electionsWithRegions.map(el => ({
      id: el.election._id,
      name: el.election.electionName,
      duns: el.electionPack?.dunToParlimen
        ? Object.keys(el.electionPack.dunToParlimen).length
        : el.regions.length,
    })),
  [electionsWithRegions])

  return (
  <div>
    {/* ═══════ Minimal Header ═══════ */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        {flag && (
          <img src={flag} alt={current.election.electionName}
            className="w-10 h-7 rounded object-cover border border-gray-200 shrink-0" />
        )}
        <div>
          <h1 className="font-serif text-[20px] font-bold text-gray-800 flex items-center gap-2">
            {current.election.electionName}
            {current.election.electionType === 'prn' && (
              <span className="text-[9px] font-semibold text-white bg-[#C41E3A] px-1.5 py-0.5 rounded">PRN</span>
            )}
          </h1>
          <p className="text-[11px] text-gray-400">{summaries[index]?.duns || '—'} DUN</p>
        </div>
      </div>

      {electionsWithRegions.length > 1 && (
        <div className="flex gap-1">
          {electionsWithRegions.map((el, i) => (
            <button
              key={el.election._id}
              onClick={() => setIndex(i)}
              className={`text-[10px] font-medium px-2.5 py-1.5 rounded transition-colors ${
                i === index
                  ? 'bg-[#C41E3A] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {STATE_FLAGS[el.election.electionName] && (
                <img src={STATE_FLAGS[el.election.electionName]} alt=""
                  className="w-5 h-3.5 rounded object-cover border border-gray-200 inline-block mr-1 align-middle" />
              )}
              {el.election.electionName.replace('PRN ', '')}
            </button>
          ))}
        </div>
      )}
    </div>

    <ElectionDashboard election={current.election} regions={current.regions} electionPack={current.electionPack} />
  </div>
  )
}
