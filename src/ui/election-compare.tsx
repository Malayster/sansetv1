'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PARTY_FLAGS, PARTY_COLORS, PARTY_COLOR_HEX } from './party-vars'
import type { RegionWithData } from '@/types/election'

const hex = PARTY_COLOR_HEX

function partyShortName(party: string): string {
  const map: Record<string, string> = { BERSATU: 'BTU' }
  return map[party] || party
}

function DunCard({
  code, region, lastElection,
}: {
  code: string
  region?: RegionWithData
  lastElection?: any
}) {
  const inc = region?.candidates?.find(c => c.role === 'penyandang')
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-3 py-2">
        <div className="font-bold text-[13px]">{code}</div>
        <div className="text-[11px] opacity-80">{region?.name || '—'}</div>
      </div>
      {region ? (
        <div className="p-3 space-y-2 text-[11px]">
          <div className="flex items-center gap-2">
            {inc && <img src={PARTY_FLAGS[inc.party] || '/flags/bebas.svg'} className="w-6 h-auto rounded border border-gray-300" />}
            <div>
              <div className="font-semibold text-gray-800">{inc?.name || '—'}</div>
              <span className={`font-bold text-[10px] ${PARTY_COLORS[inc?.party || ''] || 'text-gray-500'}`}>{inc?.party || '—'}</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2 grid grid-cols-2 gap-1">
            <div className="text-gray-500">Majoriti</div>
            <div className="font-bold text-right">{lastElection?.majority?.toLocaleString() || '—'}</div>
            <div className="text-gray-500">Keluar Undi</div>
            <div className="font-bold text-right">{lastElection?.turnout || '—'}%</div>
            <div className="text-gray-500">Pengundi</div>
            <div className="font-bold text-right">{region?.demographics?.totalElectors?.toLocaleString() || '—'}</div>
          </div>
          <div className="border-t border-gray-100 pt-2">
            <div className="text-[9px] text-gray-400 mb-1">Demografi</div>
            <div className="flex gap-2 text-[10px]">
              <span className="text-red-600">M: {region?.demographics?.malay}%</span>
              <span className="text-amber-600">C: {region?.demographics?.chinese}%</span>
              <span className="text-gray-600">I: {region?.demographics?.indian}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-[11px] text-gray-400 text-center">Tiada data</div>
      )}
    </div>
  )
}

export default function ElectionCompare({ regions }: { regions: RegionWithData[] }) {
  const [a, setA] = useState('N01')
  const [b, setB] = useState('N10')

  const regionA = useMemo(() => regions.find(r => r.code === a), [regions, a])
  const regionB = useMemo(() => regions.find(r => r.code === b), [regions, b])

  const lastA = regionA?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).slice(-1)[0]
  const lastB = regionB?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).slice(-1)[0]

  // Vote share trend chart data
  const trendData = useMemo(() => {
    const allYears = new Set<number>()
    regionA?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).forEach(e => allYears.add(e.year))
    regionB?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).forEach(e => allYears.add(e.year))

    const allParties = new Set<string>()
    regionA?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).forEach(e => e.candidates?.forEach(c => allParties.add(c.party)))
    regionB?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).forEach(e => e.candidates?.forEach(c => allParties.add(c.party)))

    return Array.from(allYears).sort().map(year => {
      const row: any = { year }
      const eA = regionA?.history?.elections?.find(e => e.year === year)
      const eB = regionB?.history?.elections?.find(e => e.year === year)
      for (const p of allParties) {
        const pctA = eA?.candidates?.find(c => c.party === p)?.percentage
        const pctB = eB?.candidates?.find(c => c.party === p)?.percentage
        row[`${a}_${p}`] = pctA ?? null
        row[`${b}_${p}`] = pctB ?? null
      }
      return row
    })
  }, [regionA, regionB, a, b])

  const topParties = useMemo(() => {
    const counts: Record<string, number> = {}
    regionA?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).forEach(e =>
      e.candidates?.forEach(c => { counts[c.party] = (counts[c.party] || 0) + (c.percentage || 0) })
    )
    regionB?.history?.elections?.filter(e => e.candidates?.some(c => (c.votes || 0) > 0)).forEach(e =>
      e.candidates?.forEach(c => { counts[c.party] = (counts[c.party] || 0) + (c.percentage || 0) })
    )
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([p]) => p)
  }, [regionA, regionB])

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#C41E3A] via-[#FFC107] to-[#1a1a1a]">
        <h3 className="font-bold text-[13px] text-white flex items-center gap-1.5">
          ⚖️ Perbandingan DUN
        </h3>
      </div>

      <div className="p-3 sm:p-4">
        {/* Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">DUN A</label>
            <select value={a} onChange={e => setA(e.target.value)} className="w-full text-[12px] border border-gray-300 rounded-lg px-3 py-2 bg-white">
              {regions.map(r => <option key={r.code} value={r.code}>{r.code} — {r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">DUN B</label>
            <select value={b} onChange={e => setB(e.target.value)} className="w-full text-[12px] border border-gray-300 rounded-lg px-3 py-2 bg-white">
              {regions.map(r => <option key={r.code} value={r.code}>{r.code} — {r.name}</option>)}
            </select>
          </div>
        </div>

        {/* Side by side cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <DunCard code={a} region={regionA} lastElection={lastA} />
          <DunCard code={b} region={regionB} lastElection={lastB} />
        </div>

        {/* 2026 Candidate comparison */}
        <div className="mb-4">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Calon PRN 2026</div>
          <div className="grid grid-cols-2 gap-4">
            {([regionA, regionB] as (RegionWithData | undefined)[]).map((region, i) => {
              const code = i === 0 ? a : b
              const candidates = region?.candidates || []
              return (
                <div key={code}>
                  {candidates.length > 0 ? (
                    <div className="space-y-1.5">
                      {candidates.map(c => (
                        <div key={c.name} className="flex items-center gap-2 text-[10px] bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
                          {c.role === 'penyandang' && <span className="text-[8px] bg-red-600 text-white px-1 py-0.5 rounded font-bold">★</span>}
                          <img src={PARTY_FLAGS[c.party] || '/flags/bebas.svg'} className="w-4 h-auto rounded border border-gray-300" />
                          <span className="font-medium text-gray-800 flex-1">{c.name}</span>
                          <span className={`font-bold ${PARTY_COLORS[c.party] || 'text-gray-500'}`}>{partyShortName(c.party)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 bg-gray-50 rounded-lg px-3 py-4 text-center border border-gray-100">Tiada senarai calon</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Vote share trend chart */}
        {trendData.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Aliran Peratusan Undi</div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 'auto']} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-[11px]">
                          <div className="font-bold mb-1">{payload[0]?.payload?.year}</div>
                          {payload.map((entry: any) => {
                            const dataKey = entry.dataKey as string
                            const parts = dataKey.split('_')
                            const dunCode = parts[0]
                            const party = parts.slice(1).join('_')
                            return (
                              <div key={dataKey} className="flex items-center gap-1.5">
                                <span className="text-[9px] text-gray-400 w-5">{dunCode}</span>
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: hex[party] || '#6b7280' }} />
                                <span className="font-medium">{party}</span>
                                <span className="text-gray-500 ml-auto">{entry.value != null ? `${entry.value}%` : '—'}</span>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const parts = (value as string).split('_')
                      const code = parts[0]
                      const party = partyShortName(parts.slice(1).join('_') || value)
                      return <span style={{ fontSize: 10 }}>{code} {party}</span>
                    }}
                  />
                  {topParties.map(party => (
                    <Line
                      key={`${a}_${party}`}
                      type="monotone"
                      dataKey={`${a}_${party}`}
                      stroke={hex[party] || '#6b7280'}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      strokeDasharray="4 3"
                      connectNulls
                      name={`${a}_${party}`}
                    />
                  ))}
                  {topParties.map(party => (
                    <Line
                      key={`${b}_${party}`}
                      type="monotone"
                      dataKey={`${b}_${party}`}
                      stroke={hex[party] || '#6b7280'}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      connectNulls
                      name={`${b}_${party}`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 text-[9px] text-gray-400 mt-1">
              <span><span className="inline-block border-b-2 border-dashed border-gray-300 w-4 mr-1" />{a} (garis putus)</span>
              <span><span className="inline-block border-b-2 border-gray-600 w-4 mr-1" />{b} (garis penuh)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
