'use client'

import { useMemo } from 'react'
import { PARTY_COLOR_HEX, PARTY_FLAGS } from './party-vars'
import type { RegionWithData } from '@/types/election'

const hex = PARTY_COLOR_HEX

/** Arrange seats in a horseshoe/semi-circle pattern */
function arrangeSeats(count: number): { row: number; col: number }[] {
  const seats: { row: number; col: number }[] = []
  // 6 rows, increasing width: 5, 7, 9, 9, 7, 5 = 42 capacity (we have 36)
  const rowLayout = [5, 7, 9, 9, 7, 5]
  let i = 0
  for (let row = 0; row < rowLayout.length; row++) {
    const cols = rowLayout[row]
    for (let col = 0; col < cols; col++) {
      if (i >= count) break
      seats.push({ row, col })
      i++
    }
    if (i >= count) break
  }
  return seats
}

export default function SemiCircleView({ regions }: { regions: RegionWithData[] }) {
  const seatData = useMemo(() => {
    const sorted = [...regions].sort((a, b) => {
      const aP = a.candidates?.find(c => c.role === 'penyandang')?.party || ''
      const bP = b.candidates?.find(c => c.role === 'penyandang')?.party || ''
      // Group by party, then by code
      if (aP !== bP) return aP.localeCompare(bP)
      return a.code.localeCompare(b.code)
    })
    const positions = arrangeSeats(sorted.length)
    return sorted.map((r, i) => ({
      ...r,
      ...positions[i] || { row: 0, col: 0 },
      party: r.candidates?.find(c => c.role === 'penyandang')?.party || 'Bebas',
    }))
  }, [regions])

  const rowLabels = ['Baris 1', 'Baris 2', 'Baris 3', 'Baris 4', 'Baris 5', 'Baris 6']

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const s of seatData) c[s.party] = (c[s.party] || 0) + 1
    return c
  }, [seatData])

  const maxRow = Math.max(...seatData.map(s => s.row))

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-[13px] text-gray-800 flex items-center gap-1.5">
          🏛️ Dewan Undangan Negeri
        </h3>
        <span className="text-[10px] text-gray-400">{regions.length} kerusi</span>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="flex flex-col items-center gap-1 min-w-[400px]">
          {Array.from({ length: maxRow + 1 }).map((_, row) => {
            const rowSeats = seatData.filter(s => s.row === row)
            if (!rowSeats.length) return null
            return (
              <div key={row} className="flex justify-center gap-1">
                {rowSeats.map((seat) => (
                  <div
                    key={seat.code}
                    title={`${seat.code} — ${seat.name} (${seat.party})`}
                    className="group relative"
                  >
                    <div
                      className="w-[28px] h-[28px] rounded-md cursor-pointer transition-all duration-150 hover:scale-125 hover:shadow-md border border-white/30"
                      style={{ background: hex[seat.party] || '#6b7280' }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none shadow-lg">
                        {seat.code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 justify-center">
        {Object.entries(counts).sort(([, a], [, b]) => b - a).map(([party, count]) => (
          <div key={party} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: hex[party] || '#6b7280' }} />
            <span className="text-[11px] font-medium text-gray-700">{party}</span>
            <span className="text-[11px] text-gray-500">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
