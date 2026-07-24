'use client'

import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { PARTY_COLOR_HEX } from './party-vars'
import type { RegionWithData } from '@/types/election'

interface Props { regions: RegionWithData[] }

type ChartView = 'age' | 'composition'

const CHART_LABELS: Record<ChartView, string> = {
  age: 'Umur Pengundi',
  composition: 'Komposisi Kaum',
}

const partyHex = PARTY_COLOR_HEX

export default function ElectionCharts({ regions }: Props) {
  const [view, setView] = useState<ChartView>('age')

  const dunsWithDemo = useMemo(() =>
    regions.filter(r => r.demographics?.age_18_29 != null)
      .sort((a, b) => a.code.localeCompare(b.code)),
  [regions])

  // Aggregate age averages across all DUNs
  const avgAge = useMemo(() => {
    const n = dunsWithDemo.length
    if (!n) return []
    const sum = (key: string) => dunsWithDemo.reduce((s, r) => s + ((r.demographics as any)[key] || 0), 0)
    return [
      { label: '18-29', val: +(sum('age_18_29') / n).toFixed(1), color: '#C41E3A' },
      { label: '30-39', val: +(sum('age_30_39') / n).toFixed(1), color: '#FFC107' },
      { label: '40-49', val: +(sum('age_40_49') / n).toFixed(1), color: '#1a1a1a' },
      { label: '50-59', val: +(sum('age_50_59') / n).toFixed(1), color: '#666' },
      { label: '60+', val: +(sum('age_60_plus') / n).toFixed(1), color: '#C41E3A' },
    ]
  }, [dunsWithDemo])

  // Aggregate ethnic composition
  const avgComp = useMemo(() => {
    const n = dunsWithDemo.length
    if (!n) return []
    const sum = (key: string) => dunsWithDemo.reduce((s, r) => s + ((r.demographics as any)[key] || 0), 0)
    return [
      { label: 'Melayu', val: +(sum('malay') / n).toFixed(1), color: '#C41E3A' },
      { label: 'Cina', val: +(sum('chinese') / n).toFixed(1), color: '#FFC107' },
      { label: 'India', val: +(sum('indian') / n).toFixed(1), color: '#1a1a1a' },
      { label: 'Lain', val: +(sum('others') / n).toFixed(1), color: '#999' },
    ]
  }, [dunsWithDemo])

  // DUNs with highest young voter %
  const topMuda = useMemo(() =>
    [...dunsWithDemo]
      .map(r => ({ code: r.code, name: r.name, pct: (r.demographics.age_18_29 || 0) + (r.demographics.age_30_39 || 0) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5),
  [dunsWithDemo])

  // DUNs with highest senior %
  const topWarga = useMemo(() =>
    [...dunsWithDemo]
      .map(r => ({ code: r.code, name: r.name, pct: r.demographics.age_60_plus || 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5),
  [dunsWithDemo])

  return (
  <div className="bg-white border border-[#1a1a1a]/10 rounded-lg shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#C41E3A] via-[#FFC107] to-[#1a1a1a]">
      <h2 className="font-serif text-[15px] font-bold text-white flex items-center gap-2">
        <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        Analisis Demografi
      </h2>
      <span className="text-[10px] text-white/70">{dunsWithDemo.length} DUN</span>
    </div>

    <div className="flex gap-1 px-4 pt-3 pb-1 border-b border-[#1a1a1a]/10 overflow-x-auto">
      {Object.entries(CHART_LABELS).map(([key, label]) => (
        <button key={key} onClick={() => setView(key as ChartView)}
          className={`text-[10px] font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-colors ${
            view === key ? 'bg-[#C41E3A] text-white shadow-sm' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/10'
          }`}
        >{label}</button>
      ))}
    </div>

    <div className="p-4">
      {view === 'age' ? (
        <div className="space-y-5">
          {/* Age group bar chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avgAge} margin={{ top: 0, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: '#1a1a1a' }} />
                <YAxis tick={{ fontSize: 10, fill: '#1a1a1a' }} domain={[0, 'auto']} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(val: number) => `${val}%`} />
                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                  {avgAge.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DUNs paling muda */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#C41E3A] mb-2">🏆 5 DUN Paling Muda (18-39)</h4>
            <div className="space-y-1">
              {topMuda.map((d, i) => (
                <div key={d.code} className="flex items-center gap-2 text-[11px]">
                  <span className="w-4 text-[#1a1a1a]/40 font-bold">{i + 1}.</span>
                  <span className="font-semibold text-[#1a1a1a]">{d.code}</span>
                  <span className="text-[#1a1a1a]/60">{d.name}</span>
                  <span className="ml-auto font-bold text-[#C41E3A]">{Math.round(d.pct)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* DUNs paling ramai warga emas */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-2">🏅 5 DUN Paling Ramai Warga Emas (60+)</h4>
            <div className="space-y-1">
              {topWarga.map((d, i) => (
                <div key={d.code} className="flex items-center gap-2 text-[11px]">
                  <span className="w-4 text-[#1a1a1a]/40 font-bold">{i + 1}.</span>
                  <span className="font-semibold text-[#1a1a1a]">{d.code}</span>
                  <span className="text-[#1a1a1a]/60">{d.name}</span>
                  <span className="ml-auto font-bold text-[#1a1a1a]">{Math.round(d.pct)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Ethnic composition pie */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={avgComp} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="val" nameKey="label"
                  label={({ label, val }) => `${label} ${val}%`} labelLine={true}>
                  {avgComp.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(val: number) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Ethnic breakdown legend + values */}
          <div className="grid grid-cols-2 gap-2">
            {avgComp.filter(e => e.val > 0).map(e => (
              <div key={e.label} className="flex items-center gap-2 bg-[#1a1a1a]/[0.02] rounded-lg px-3 py-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: e.color }} />
                <span className="text-[11px] text-[#1a1a1a]/70">{e.label}</span>
                <span className="ml-auto text-[13px] font-bold text-[#1a1a1a]">{e.val}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  )
}
