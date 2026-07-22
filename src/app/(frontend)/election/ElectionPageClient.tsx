'use client'

import { useState } from 'react'
import ElectionDashboard from '@/ui/election-dashboard'
import type { ElectionInfo, RegionWithData } from '@/types/election'

interface ElectionWithRegions {
  election: ElectionInfo
  regions: RegionWithData[]
}

export default function ElectionPageClient({
  electionsWithRegions,
}: {
  electionsWithRegions: ElectionWithRegions[]
}) {
  const [index, setIndex] = useState(0)
  const current = electionsWithRegions[index]

  return (
    <div>
      {/* Header with dropdown */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-[28px] font-bold text-[#111]">{current.election.electionName}</h1>
          {current.election.summary && (
            <p className="text-[13px] text-gray-500 mt-1">{current.election.summary}</p>
          )}
        </div>
        {electionsWithRegions.length > 1 && (
          <select
            value={current.election._id}
            onChange={(e) => {
              const i = electionsWithRegions.findIndex((el) => el.election._id === e.target.value)
              if (i !== -1) setIndex(i)
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white min-w-[200px]"
          >
            {electionsWithRegions.map((el) => (
              <option key={el.election._id} value={el.election._id}>
                {el.election.electionName}
              </option>
            ))}
          </select>
        )}
      </div>

      <ElectionDashboard election={current.election} regions={current.regions} />
    </div>
  )
}
