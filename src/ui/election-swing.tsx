'use client'

import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PARTY_COLOR_HEX, PARTY_FLAGS } from './party-vars'
import type { RegionWithData } from '@/types/election'

// THEME: hitam #1a1a1a · kuning #FFC107 · merah #C41E3A · putih #ffffff
const hex = PARTY_COLOR_HEX

export default function ElectionSwing({ regions }: { regions: RegionWithData[] }) {
  const [selectedDun, setSelectedDun] = useState<string | null>(null)

  const swingData = useMemo(() => {
    return regions.map(r => {
      const elections = r.history?.elections?.filter(e =>
        e.year >= 2018 && e.candidates?.some(c => (c.votes || 0) > 0)
      ) || []
      const sorted = [...elections].sort((a, b) => a.year - b.year)
      if (sorted.length < 2) return { code: r.code, name: r.name, changes: [], firstYear: 0, lastYear: 0, totalChange: 0 }

      const first = sorted[0]; const last = sorted[sorted.length - 1]
      const firstMap: Record<string, number> = {}
      const lastMap: Record<string, number> = {}
      for (const c of first.candidates || []) firstMap[c.party] = c.percentage || 0
      for (const c of last.candidates || []) lastMap[c.party] = c.percentage || 0

      const changes: { party: string; from: number; to: number; change: number }[] = []
      for (const [party, to] of Object.entries(lastMap)) {
        if (firstMap[party] != null && firstMap[party] !== to) {
          changes.push({ party, from: firstMap[party], to, change: Math.round((to - firstMap[party]) * 10) / 10 })
        }
      }
      changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      const inc = r.candidates?.find(c => c.role === 'penyandang')
      return {
        code: r.code, name: r.name,
        party: inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty || '',
        changes: changes.slice(0, 5),
        firstYear: first.year, lastYear: last.year,
        totalChange: changes.reduce((sum, c) => sum + Math.abs(c.change), 0),
      }
    }).filter(d => d.changes.length > 0 && d.totalChange > 0)
      .sort((a, b) => b.totalChange - a.totalChange)
  }, [regions])

  const selected = selectedDun ? swingData.find(d => d.code === selectedDun) : swingData[0]
  const xMax = selected ? Math.ceil(Math.max(...selected.changes.map(c => Math.abs(c.change)), 5) / 5) * 5 : 30

  return (
  <div className="bg-white border border-[#1a1a1a]/10 rounded-xl shadow-sm overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#C41E3A] via-[#FFC107] to-[#1a1a1a]">
      <h3 className="font-bold text-[13px] text-white flex items-center gap-1.5">
        <span className="text-white/80">🔄</span> Aliran Undi (Swing)
      </h3>
      <span className="text-[10px] text-white/70">
        Perubahan % dari {selected?.firstYear || '—'} → {selected?.lastYear || '—'}
      </span>
    </div>

    {/* Dropdown + chips row */}
    <div className="px-4 pt-3 pb-2 space-y-2">
      {/* Dropdown Pilih DUN */}
      <select
        value={selectedDun || ''}
        onChange={e => setSelectedDun(e.target.value || null)}
        className="w-full text-[11px] font-medium px-3 py-2 rounded-lg border border-[#1a1a1a]/10 bg-white text-[#1a1a1a] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C41E3A]/30 focus:border-[#C41E3A]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px',
        }}
      >
        <option value="">Pilih DUN...</option>
        {swingData.map(d => (
          <option key={d.code} value={d.code}>{d.code} — {d.name} ({d.party})</option>
        ))}
      </select>

      {/* Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {swingData.slice(0, 12).map(d => {
          const isActive = selectedDun === d.code || (!selectedDun && selected?.code === d.code)
          return (
            <button key={d.code} onClick={() => setSelectedDun(d.code)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all shrink-0 border ${
                isActive
                  ? 'bg-[#C41E3A] text-white border-[#C41E3A] shadow-sm'
                  : 'bg-white text-[#1a1a1a]/50 border-[#1a1a1a]/10 hover:border-[#C41E3A]/30 hover:text-[#C41E3A]'
              }`}
            >
              {d.code}
              <span className={isActive ? 'text-white/70' : 'text-[#1a1a1a]/30'}>{d.party}</span>
            </button>
          )
        })}
      </div>
    </div>

    {/* Main chart */}
    {selected && (
    <div className="px-4 pb-4">
      {/* Selected DUN info header */}
      <div className="flex items-center gap-2 mb-3 bg-[#1a1a1a]/[0.02] rounded-lg px-3 py-2 border border-[#1a1a1a]/5">
        <span className="font-bold text-[14px] text-[#1a1a1a]">{selected.code}</span>
        <span className="text-[#1a1a1a]/20 text-[11px]">|</span>
        <span className="text-[12px] text-[#1a1a1a]/60">{selected.name}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <img src={PARTY_FLAGS[selected.party] || '/flags/bebas.svg'}
            className="w-5 h-auto rounded border border-[#1a1a1a]/10" />
          <span className="text-[11px] font-bold" style={{ color: hex[selected.party] || '#1a1a1a' }}>{selected.party}</span>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={selected.changes} layout="vertical" margin={{ top: 0, right: 60, left: 44, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#1a1a1a' }} tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} domain={[-xMax, xMax]} />
            <YAxis type="category" dataKey="party" tick={{ fontSize: 11, fontWeight: 600, fill: '#1a1a1a' }} width={42} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const d = payload[0].payload
              return (
                <div className="bg-white border border-[#1a1a1a]/10 rounded-lg shadow-lg px-3 py-2 text-[11px]">
                  <div className="font-bold text-[#1a1a1a]">{d.party}</div>
                  <div className="text-[#1a1a1a]/50">{selected.firstYear}: {d.from}% → {selected.lastYear}: {d.to}%</div>
                  <div className="font-bold" style={{ color: d.change >= 0 ? (hex[d.party] || '#C41E3A') : '#1a1a1a' }}>
                    {d.change >= 0 ? '+' : ''}{d.change}%
                  </div>
                </div>
              )
            }} />
            <Bar dataKey="change" name="Perubahan %" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {selected.changes.map((entry, idx) => (
                <Cell key={idx} fill={entry.change >= 0 ? (hex[entry.party] || '#C41E3A') : '#e5e5e5'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 text-[10px] text-[#1a1a1a]/40 mt-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#DC2626' }} /> naik (warna parti)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#e5e5e5] inline-block" /> turun (kelabu)</span>
      </div>
    </div>
    )}

    {/* Bottom legend — DUN cepat */}
    <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-[#1a1a1a]/10 bg-[#FFC107]/5">
      <span className="text-[10px] text-[#1a1a1a]/50 font-medium mr-1">🔍 Klik DUN untuk lihat aliran undi:</span>
      {swingData.slice(0, 6).map(d => {
        const top = d.changes[0]
        return (
          <button key={d.code} onClick={() => setSelectedDun(d.code)}
            className="inline-flex items-center gap-1 text-[9px] bg-white px-2 py-0.5 border border-[#1a1a1a]/10 rounded-full text-[#1a1a1a]/50 hover:border-[#C41E3A]/30 transition-colors"
          >
            {d.code}
            <span className={top?.change >= 0 ? 'font-medium' : 'text-[#1a1a1a]/40'} style={{ color: top?.change >= 0 ? (hex[d.party] || '#C41E3A') : undefined }}>
              {top?.change >= 0 ? '▲' : '▼'} {Math.abs(top?.change || 0)}%
            </span>
          </button>
        )
      })}
    </div>
  </div>
  )
}
