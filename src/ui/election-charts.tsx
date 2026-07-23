'use client'

import { useMemo, useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from 'recharts'
import { PARTY_COLOR_HEX, PARTY_FLAGS } from './party-vars'
import type { RegionWithData } from '@/types/election'

interface Props { regions: RegionWithData[] }

type ChartView = 'income-malay' | 'income-chinese' | 'composition' | 'poverty'

const CHART_LABELS: Record<ChartView, string> = {
  'income-malay': 'Pendapatan vs % Melayu',
  'income-chinese': 'Pendapatan vs % Cina',
  'composition': 'Komposisi Kaum mengikut Parti',
  'poverty': 'Kemiskinan vs Pendapatan',
}

const partyHex = PARTY_COLOR_HEX

export default function ElectionCharts({ regions }: Props) {
  const [view, setView] = useState<ChartView>('income-malay')

  const scatterData = useMemo(() => {
    const incMap = new Map<string, string>()
    for (const r of regions) {
      const inc = r.candidates?.find(c => c.role === 'penyandang')
      if (inc) incMap.set(r.code, inc.party)
    }
    return regions.map(r => ({
      code: r.code,
      name: r.name,
      party: incMap.get(r.code) || 'Unknown',
      malay: r.demographics.malay,
      chinese: r.demographics.chinese,
      indian: r.demographics.indian,
      income: r.demographics.medianIncome || 0,
      poverty: r.demographics.poverty || 0,
      totalElectors: r.demographics.totalElectors || 0,
    })).filter(d => d.income > 0)
  }, [regions])

  const barData = useMemo(() => {
    const groups: Record<string, { party: string; malay: number[]; chinese: number[]; indian: number[]; count: number }> = {}
    for (const r of regions) {
      const inc = r.candidates?.find(c => c.role === 'penyandang')
      const p = inc?.party || 'Unknown'
      if (!groups[p]) groups[p] = { party: p, malay: [], chinese: [], indian: [], count: 0 }
      groups[p].malay.push(r.demographics.malay)
      groups[p].chinese.push(r.demographics.chinese)
      groups[p].indian.push(r.demographics.indian)
      groups[p].count++
    }
    return Object.values(groups).map(g => ({
      party: g.party,
      'Melayu': Math.round(g.malay.reduce((a, b) => a + b, 0) / g.malay.length),
      'Cina': Math.round(g.chinese.reduce((a, b) => a + b, 0) / g.chinese.length),
      'India': Math.round(g.indian.reduce((a, b) => a + b, 0) / g.indian.length),
      count: g.count,
    })).sort((a, b) => b.count - a.count)
  }, [regions])

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const d = payload[0].payload
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-[11px] leading-relaxed">
        <div className="font-bold text-gray-800">{d.code} — {d.name}</div>
        <div className="text-gray-500">Penyandang: {d.party}</div>
        <div className="text-gray-600">Pendapatan: RM{d.income?.toLocaleString() || '-'}</div>
        <div className="text-gray-600">Melayu: {d.malay}% · Cina: {d.chinese}% · India: {d.indian}%</div>
        {d.poverty != null && <div className="text-gray-600">Kemiskinan: {d.poverty}%</div>}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-serif text-[15px] font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Analisis Demografi
        </h2>
        <span className="text-[11px] text-gray-400">{regions.length} DUN</span>
      </div>

      {/* Chart tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-1 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
        {(Object.entries(CHART_LABELS) as [ChartView, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setView(key)}
            className={`text-[10px] font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${
              view === key ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart content */}
      <div className="p-4" style={{ height: 380 }}>
        {view === 'composition' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="party" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
              <Bar dataKey="Melayu" stackId="a" fill="#dc2626" />
              <Bar dataKey="Cina" stackId="a" fill="#2563eb" />
              <Bar dataKey="India" stackId="a" fill="#ea580c" />
            </BarChart>
          </ResponsiveContainer>
        ) : view === 'poverty' ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="income" name="Pendapatan" tick={{ fontSize: 10 }} domain={[3000, 7500]} tickFormatter={v => `RM${v/1000}k`} label={{ value: 'Median Income (RM)', position: 'bottom', fontSize: 10, offset: 10 }} />
              <YAxis dataKey="poverty" name="Kemiskinan" tick={{ fontSize: 10 }} domain={[0, 8]} tickFormatter={v => `${v}%`} label={{ value: 'Kadar Kemiskinan (%)', angle: -90, position: 'insideLeft', fontSize: 10, offset: 0 }} />
              <ZAxis dataKey="totalElectors" range={[40, 400]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData.filter(d => d.poverty > 0)}>
                {scatterData.filter(d => d.poverty > 0).map((d, i) => (
                  <Cell key={i} fill={partyHex[d.party] || '#6b7280'} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          // Scatter: income vs malay/chinese
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="income" name="Pendapatan" tick={{ fontSize: 10 }} domain={[3000, 7500]} tickFormatter={v => `RM${v/1000}k`} label={{ value: 'Median Income (RM)', position: 'bottom', fontSize: 10, offset: 10 }} />
              <YAxis dataKey={view === 'income-malay' ? 'malay' : 'chinese'} name={view === 'income-malay' ? 'Melayu' : 'Cina'} tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} label={{ value: `${view === 'income-malay' ? '% Melayu' : '% Cina'}`, angle: -90, position: 'insideLeft', fontSize: 10, offset: 0 }} />
              <ZAxis dataKey="totalElectors" range={[40, 400]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData}>
                {scatterData.map((d, i) => (
                  <Cell key={i} fill={partyHex[d.party] || '#6b7280'} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30">
        {[...new Set(scatterData.map(d => d.party))].filter(Boolean).map(party => {
          const count = scatterData.filter(d => d.party === party).length
          return (
            <div key={party} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-medium text-gray-600">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: partyHex[party] || '#6b7280' }} />
              {party} <span className="text-gray-400">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
