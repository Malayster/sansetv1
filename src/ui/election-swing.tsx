'use client'

import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { PARTY_COLORS, PARTY_COLOR_HEX, PARTY_FLAGS } from './party-vars'
import type { RegionWithData } from '@/types/election'

const hex = PARTY_COLOR_HEX

export default function ElectionSwing({ regions }: { regions: RegionWithData[] }) {
  const [selectedDun, setSelectedDun] = useState<string | null>(null)

  const swingData = useMemo(() => {
    return regions.map(r => {
      const elections = r.history?.elections?.filter(e => e.year >= 2018) || []
      const sorted = [...elections].sort((a, b) => a.year - b.year)
      const swings: Record<string, { from: number; to: number }> = {}
      for (const e of sorted) {
        for (const c of e.candidates || []) {
          if (!swings[c.party]) swings[c.party] = { from: 0, to: 0 }
          swings[c.party].to = c.percentage || 0
        }
      }
      // Calculate change from first to last
      const changes: { party: string; from: number; to: number; change: number }[] = []
      for (const [party, data] of Object.entries(swings)) {
        changes.push({ party, ...data, change: Math.round((data.to - data.from) * 10) / 10 })
      }
      changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      const inc = r.candidates?.find(c => c.role === 'penyandang')
      return {
        code: r.code,
        name: r.name,
        party: inc?.party || '',
        changes: changes.slice(0, 3),
        lastYear: sorted[sorted.length - 1]?.year || 2023,
        totalChange: changes.reduce((sum, c) => sum + Math.abs(c.change), 0),
      }
    }).filter(d => d.changes.length > 0 && d.totalChange > 0)
      .sort((a, b) => b.totalChange - a.totalChange)
  }, [regions])

  const selected = selectedDun ? swingData.find(d => d.code === selectedDun) : swingData[0]

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-[13px] text-gray-800 flex items-center gap-1.5">
          🔄 Aliran Undi (Swing)
        </h3>
        <span className="text-[10px] text-gray-400">Perubahan % dari PRU 2018 → PRN 2023</span>
      </div>

      {/* DUN selector chips */}
      <div className="flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto">
        {swingData.slice(0, 12).map(d => (
          <button key={d.code} onClick={() => setSelectedDun(d.code)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all border ${
              selectedDun === d.code || (!selectedDun && selected?.code === d.code)
                ? 'bg-gray-800 text-white border-gray-800 shadow-sm' 
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {d.code}
            <span className="opacity-60">{d.party}</span>
          </button>
        ))}
      </div>

      {/* Main swing chart */}
      {selected && (
        <div className="px-4 pb-4" style={{ height: 280 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-[13px] text-gray-800">{selected.code}</span>
            <span className="text-gray-500 text-[11px]">—</span>
            <span className="text-gray-600 text-[11px]">{selected.name}</span>
            <span className={`text-[10px] font-bold ${PARTY_COLORS[selected.party] || 'text-gray-500'}`}>
              <img src={PARTY_FLAGS[selected.party] || '/flags/bebas.svg'} className="w-5 h-auto inline-block rounded border border-gray-300 mr-1" />
              {selected.party}
            </span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={selected.changes} layout="vertical" margin={{ top: 5, right: 60, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} domain={[-30, 30]} />
              <YAxis type="category" dataKey="party" tick={{ fontSize: 11, fontWeight: 600 }} width={50} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-[11px]">
                      <div className="font-bold">{d.party}</div>
                      <div className="text-gray-500">2018: {d.from}% → 2023: {d.to}%</div>
                      <div className={`font-bold ${d.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {d.change >= 0 ? '+' : ''}{d.change}%
                      </div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="from" fill="#e5e7eb" stackId="a" name="PRU 2018" />
              <Bar dataKey="to" stackId="a" name="PRN 2023">
                {selected.changes.map((entry, idx) => (
                  <Cell key={idx} fill={hex[entry.party] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-[10px] text-gray-400 mt-1">
            <span><span className="inline-block w-3 h-2 bg-gray-200 rounded mr-1" />PRU 2018</span>
            <span><span className="inline-block w-3 h-2 bg-blue-500 rounded mr-1" />PRN 2023</span>
          </div>
        </div>
      )}

      {/* Swing legend */}
      <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30">
        <span className="text-[10px] text-gray-500 font-medium mr-1">🔍 Klik DUN untuk lihat aliran undi:</span>
        {swingData.slice(0, 6).map(d => {
          const top = d.changes[0]
          return (
            <span key={d.code} className="text-[9px] bg-white px-2 py-0.5 border border-gray-200 rounded-full text-gray-500">
              {d.code} <span className={top?.change >= 0 ? 'text-emerald-600' : 'text-red-600'}>{top?.change >= 0 ? '▲' : '▼'} {Math.abs(top?.change || 0)}%</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
