'use client'

import { useState } from 'react'
import { ThemeProvider, ThemeToggle } from '@/ui/dark-mode'
import { AnimatedCounter } from '@/ui/animated-counter'
import ElectionDashboard from '@/ui/election-dashboard'
import type { ElectionInfo, RegionWithData } from '@/types/election'

interface ElectionWithRegions {
  election: ElectionInfo
  regions: RegionWithData[]
}

/** Map PRN state election names to their flag image paths */
const STATE_FLAGS: Record<string, string> = {
  'PRN Negeri Sembilan': '/flags/negeri-sembilan.svg',
}

export default function ElectionPageClient({
  electionsWithRegions,
}: {
  electionsWithRegions: ElectionWithRegions[]
}) {
  const [index, setIndex] = useState(0)
  const current = electionsWithRegions[index]
  const flagPath = STATE_FLAGS[current.election.electionName]

  return (
    <ThemeProvider>
      <div>
        {/* Header with dropdown */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {flagPath && (
              <img
                src={flagPath}
                alt={current.election.electionName}
                className="w-12 h-8 rounded object-cover border border-gray-200 shadow-sm"
              />
            )}
            <div>
              <h1 className="font-serif text-[28px] font-bold text-gray-800 dark:text-gray-100">
                {current.election.electionName}
                {current.election.electionType === 'prn' && (
                  <span className="ml-2 text-xs font-semibold text-white bg-emerald-600 px-2 py-0.5 rounded align-middle">
                    PRN
                  </span>
                )}
              </h1>
              {current.election.summary && (
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">{current.election.summary}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {electionsWithRegions.length > 1 && (
              <select
                value={current.election._id}
                onChange={(e) => {
                  const i = electionsWithRegions.findIndex((el) => el.election._id === e.target.value)
                  if (i !== -1) setIndex(i)
                }}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 min-w-[200px]"
              >
                {electionsWithRegions.map((el) => (
                  <option key={el.election._id} value={el.election._id}>
                    {el.election.electionName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <ElectionDashboard election={current.election} regions={current.regions} />
      </div>
    </ThemeProvider>
  )
}
