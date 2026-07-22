'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ElectionSidebar from '@/ui/election-sidebar'
import type { ElectionInfo, RegionWithData } from '@/types/election'

const ElectionMap = dynamic(() => import('@/ui/election-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded flex items-center justify-center text-gray-400">Memuatkan peta...</div>,
})

export default function ElectionDashboard({
  election,
  regions,
}: {
  election: ElectionInfo
  regions: RegionWithData[]
}) {
  const [selected, setSelected] = useState<RegionWithData | null>(null)

  return (
    <div>
      {election.electionDate && (
        <p className="text-[11px] text-gray-400 -mt-3 mb-4">
          Tarikh mengundi: {new Date(election.electionDate).toLocaleDateString('ms', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}

      {/* State Summary Bar */}
      {election.states && election.states.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {election.states.map((s) => (
            <div key={s.name} className="bg-gray-50 border border-gray-200 px-3 py-1.5 text-[11px]">
              <span className="font-bold">{s.name}</span>{' '}
              <span className="text-gray-500">{s.party}</span>{' '}
              <span className="font-semibold">{s.seats}</span>
              {s.result && <span className="text-gray-400 ml-1">({s.result})</span>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ElectionMap regions={regions} selected={selected} onSelect={setSelected} />
        </div>
        <ElectionSidebar region={selected} />
      </div>
    </div>
  )
}
