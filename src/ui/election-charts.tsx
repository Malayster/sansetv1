'use client'

import { useMemo, useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from 'recharts'
import { PARTY_COLOR_HEX, PARTY_FLAGS } from './party-vars'
import type { RegionWithData } from '@/types/election'

interface Props { regions: RegionWithData[] }

type ChartView = 'income-malay' | 'income-chinese' | 'composition' | 'poverty' | 'age'

const CHART_LABELS: Record<ChartView, string> = {
  'income-malay': 'Pendapatan vs % Melayu',
  'income-chinese': 'Pendapatan vs % Cina',
  'composition': 'Komposisi Kaum mengikut Parti',
  'poverty': 'Kemiskinan vs Pendapatan',
  'age': 'Umur Pengundi',
}

const partyHex = PARTY_COLOR_HEX

export default function ElectionCharts({ regions }: Props) {
  const [view, setView] = useState<ChartView>('income-malay')

  // Group DUNs by parliament for scatter charts (avoids overlapping points)
  const parlGrouped = useMemo(() => {
    const map = new Map<string, { parlCode: string, duns: string[], malay: number; chinese: number; indian: number; income: number; poverty: number; electors: number; dominantParty: string }>()
    for (const r of regions) {
      const parlCode = (r.demographics as any)?._parlCode || 'Unknown'
      if (!map.has(parlCode)) {
        map.set(parlCode, {
          parlCode,
          duns: [],
          malay: r.demographics.malay || 0,
          chinese: r.demographics.chinese || 0,
          indian: r.demographics.indian || 0,
          income: r.demographics.medianIncome || 0,
          poverty: r.demographics.poverty || 0,
          electors: 0,
          dominantParty: '',
        })
      }
      const entry = map.get(parlCode)!
      entry.duns.push(r.code)
      entry.electors += r.demographics.totalElectors || 0
    }
    // Dominant party = party with most incumbents in this parliament
    for (const [, entry] of map) {
      const counts: Record<string, number> = {}
      for (const dunCode of entry.duns) {
        const r = regions.find(x => x.code === dunCode)
        const inc = r?.candidates?.find(c => c.role === 'penyandang')
        const party = inc?.party || 'Unknown'
        counts[party] = (counts[party] || 0) + 1
      }
      entry.dominantParty = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'
    }
    return Array.from(map.values()).filter(e => e.income > 0)
  }, [regions])

  // Composition chart: use parliament-level data
  const compData = useMemo(() => {
    const groups: Record<string, { parl: string; malay: number[]; chinese: number[]; indian: number[]; count: number }> = {}
    for (const p of parlGrouped) {
      if (!groups[p.parlCode]) groups[p.parlCode] = { parl: p.parlCode, malay: [], chinese: [], indian: [], count: 0 }
      groups[p.parlCode].malay.push(p.malay)
      groups[p.parlCode].chinese.push(p.chinese)
      groups[p.parlCode].indian.push(p.indian)
      groups[p.parlCode].count = p.duns.length
    }
    return Object.entries(groups).map(([parl, g]) => ({
      party: parl,
      'Melayu': Math.round(g.malay[0]),
      'Cina': Math.round(g.chinese[0]),
      'India': Math.round(g.indian[0]),
      count: g.count,
    }))
  }, [parlGrouped])

  const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-[11px] leading-relaxed">
  <div className="font-bold text-gray-800">{d.parlCode} — {d.duns?.length || 0} DUN</div>
  <div className="text-gray-500">Dominan: {d.dominantParty || '—'}</div>
  <div className="text-gray-600">Pendapatan: RM{d.income?.toLocaleString() || '-'}</div>
  <div className="text-gray-600">Melayu: {d.malay}% · Cina: {d.chinese}% · India: {d.indian}%</div>
  {d.poverty != null && <div className="text-gray-600">Kemiskinan: {d.poverty}%</div>}
  </div>
  )
  }

  const incomeDomain = useMemo(() => {
    const vals = parlGrouped.map(d => d.income).filter(Boolean)
    if (!vals.length) return [0, 10000]
    const min = Math.floor(Math.min(...vals) / 500) * 500
    const max = Math.ceil(Math.max(...vals) / 500) * 500
    return [min, max]
  }, [parlGrouped])

  const povDomain = useMemo(() => {
    const vals = parlGrouped.map(d => d.poverty).filter(v => v != null && v > 0)
    if (!vals.length) return [0, 10]
    return [0, Math.ceil(Math.max(...vals))]
  }, [parlGrouped])

  return (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
  <h2 className="font-serif text-[15px] font-bold text-gray-800 flex items-center gap-2">
  <svg className="w-4 h-4 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
  Analisis Demografi
  </h2>
  <span className="text-[10px] text-gray-400">Anggaran peringkat Parlimen ({parlGrouped.length} kawasan)</span>
  </div>

  {/* Chart tabs */}
  <div className="flex gap-1 px-4 pt-3 pb-1 border-b border-gray-100 overflow-x-auto">
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
  {view === 'age' ? (
  <div className="h-full overflow-y-auto space-y-2 pr-1">
    {parlGrouped.map(p => {
      // Find a DUN in this parliament for age data
      const sampleDun = p.duns.length > 0 ? regions.find(r => r.code === p.duns[0]) : null
      const age = sampleDun?.demographics
      if (!age?.age_18_29) return null
      const youngPct = age.age_18_29 + age.age_30_39
      return (
        <div key={p.parlCode} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
          <div className="w-10 shrink-0 text-[10px] font-bold text-gray-700">{p.parlCode}</div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              <span>18-29</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${age.age_18_29}%` }} />
              </div>
              <span className="w-7 text-right font-semibold text-gray-600">{age.age_18_29}%</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              <span>30-39</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${age.age_30_39}%` }} />
              </div>
              <span className="w-7 text-right font-semibold text-gray-600">{age.age_30_39}%</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              <span>40-49</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${age.age_40_49}%` }} />
              </div>
              <span className="w-7 text-right font-semibold text-gray-600">{age.age_40_49}%</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              <span>50-59</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${age.age_50_59}%` }} />
              </div>
              <span className="w-7 text-right font-semibold text-gray-600">{age.age_50_59}%</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              <span>60+</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-red-400" style={{ width: `${age.age_60_plus}%` }} />
              </div>
              <span className="w-7 text-right font-semibold text-gray-600">{age.age_60_plus}%</span>
            </div>
          </div>
          <div className="w-16 shrink-0 text-right">
            <span className={`text-[10px] font-bold ${youngPct >= 55 ? 'text-blue-600' : 'text-gray-600'}`}>
              {Math.round(youngPct)}%<br/>
              <span className="text-[8px] font-normal text-gray-400">Muda</span>
            </span>
          </div>
        </div>
      )
    })}
  </div>
  ) : view === 'composition' ? (
  <ResponsiveContainer width="100%" height="100%">
  <BarChart data={compData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
  <XAxis dataKey="party" tick={{ fontSize: 11, fontWeight: 600 }} />
  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
  <Tooltip content={<CustomTooltip />} />
  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
  <Bar dataKey="Melayu" stackId="a" fill="#C41E3A" />
  <Bar dataKey="Cina" stackId="a" fill="#FFC107" />
  <Bar dataKey="India" stackId="a" fill="#1a1a1a" />
  </BarChart>
  </ResponsiveContainer>
  ) : view === 'poverty' ? (
  <ResponsiveContainer width="100%" height="100%">
  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
  <XAxis dataKey="income" name="Pendapatan" tick={{ fontSize: 10 }} domain={incomeDomain} tickFormatter={v => `RM${(v/1000).toFixed(0)}k`} label={{ value: 'Median Income (RM)', position: 'bottom', fontSize: 10, offset: 10 }} />
  <YAxis dataKey="poverty" name="Kemiskinan" tick={{ fontSize: 10 }} domain={povDomain} tickFormatter={v => `${v}%`} label={{ value: 'Kadar Kemiskinan (%)', angle: -90, position: 'insideLeft', fontSize: 10, offset: 0 }} />
  <ZAxis dataKey="duns.length" range={[60, 400]} />
  <Tooltip content={<CustomTooltip />} />
  <Scatter data={parlGrouped.filter(d => d.poverty > 0)} name="Parlimen">
  {parlGrouped.filter(d => d.poverty > 0).map((d, i) => (
  <Cell key={i} fill={partyHex[d.dominantParty] || '#6b7280'} fillOpacity={0.7} />
  ))}
  </Scatter>
  </ScatterChart>
  </ResponsiveContainer>
  ) : (
  // Scatter: income vs malay/chinese
  <ResponsiveContainer width="100%" height="100%">
  <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
  <XAxis dataKey="income" name="Pendapatan" tick={{ fontSize: 10 }} domain={incomeDomain} tickFormatter={v => `RM${(v/1000).toFixed(0)}k`} label={{ value: 'Median Income (RM)', position: 'bottom', fontSize: 10, offset: 10 }} />
  <YAxis dataKey={view === 'income-malay' ? 'malay' : 'chinese'} name={view === 'income-malay' ? 'Melayu' : 'Cina'} tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} label={{ value: `${view === 'income-malay' ? '% Melayu' : '% Cina'}`, angle: -90, position: 'insideLeft', fontSize: 10, offset: 0 }} />
  <ZAxis dataKey="duns.length" range={[60, 400]} />
  <Tooltip content={<CustomTooltip />} />
  <Scatter data={parlGrouped} name="Parlimen">
  {parlGrouped.map((d, i) => (
  <Cell key={i} fill={partyHex[d.dominantParty] || '#6b7280'} fillOpacity={0.7} />
  ))}
  </Scatter>
  </ScatterChart>
  </ResponsiveContainer>
  )}
  </div>

  {/* Legend */}
  <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
  {parlGrouped.map(p => (
  <div key={p.parlCode} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-medium text-gray-600">
  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: partyHex[p.dominantParty] || '#6b7280' }} />
  {p.parlCode} <span className="text-gray-400">{p.duns.length} DUN</span>
  </div>
  ))}
  </div>
  </div>
  )
}
