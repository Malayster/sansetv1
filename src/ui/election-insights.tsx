'use client'

import { useMemo } from 'react'
import { PARTY_COLORS, PARTY_COLOR_HEX, PARTY_FLAGS } from './party-vars'
import { AnimatedCounter } from './animated-counter'
import type { RegionWithData } from '@/types/election'

const hex = PARTY_COLOR_HEX

export function ExecutiveSummary({ regions }: { regions: RegionWithData[] }) {
  const stats = useMemo(() => {
  const total = regions.length
  const parties = new Set(regions.map(r => {
  const inc = r.candidates?.find(c => c.role === 'penyandang')
  return inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty || ''
  }).filter(Boolean))
  const counts: Record<string, number> = {}
  let topParty = '', topCount = 0, topTotalVotes = 0, topMajority = 0
  for (const r of regions) {
  const inc = r.candidates?.find(c => c.role === 'penyandang')
  const party = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty || ''
  if (party) {
  counts[party] = (counts[party] || 0) + 1
  if (counts[party] > topCount) { topCount = counts[party]; topParty = party }
  }
  const last = r.history?.elections?.slice(-1)[0]
  if (last) { topTotalVotes += last.majority || 0; topMajority++ }
  }
  return { total, partyCount: parties.size, topParty, topCount, avgMajority: topMajority > 0 ? Math.round(topTotalVotes / topMajority) : 0 }
  }, [regions])

  const cards = [
  { label: 'Jumlah DUN', plain: String(stats.total), icon: '🗳️', color: 'from-red-600 to-red-700', animValue: stats.total, animDecimals: 0 },
  { label: 'Parti Bertanding', plain: String(stats.partyCount), icon: '🏛️', color: 'from-gray-800 to-gray-900', animValue: stats.partyCount, animDecimals: 0 },
  { label: 'Parti Terbesar', plain: stats.topParty, sub: `${stats.topCount} kerusi`, icon: '👑', color: 'from-amber-500 to-yellow-600' },
  { label: 'Purata Majoriti', plain: stats.avgMajority.toLocaleString(), icon: '📊', color: 'from-red-500 to-amber-500', animValue: stats.avgMajority, animDecimals: 0 },
  ] as any[]

  return (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
  {cards.map(c => (
  <div key={c.label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${c.color} p-3 sm:p-4 text-white shadow-lg`}>
  <div className="absolute top-0 right-0 text-3xl sm:text-4xl opacity-20 select-none">{c.icon}</div>
  <div className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider opacity-80">{c.label}</div>
  <div className="text-[20px] sm:text-[26px] font-bold mt-0.5 leading-tight">
  {c.animValue != null ? (
  <AnimatedCounter value={c.animValue} decimals={c.animDecimals} prefix={c.animPrefix} suffix={c.animSuffix} />
  ) : c.plain}
  </div>
  {c.sub && <div className="text-[10px] sm:text-[11px] opacity-80 mt-0.5">{c.sub}</div>}
  </div>
  ))}
  </div>
  )
}

export function MajorityTracker({ regions }: { regions: RegionWithData[] }) {
  const { seats, total, needed, maxCount } = useMemo(() => {
  const counts: Record<string, number> = {}
  for (const r of regions) {
  const inc = r.candidates?.find(c => c.role === 'penyandang')
  const party = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty
  if (party) counts[party] = (counts[party] || 0) + 1
  }
  const t = regions.length
  const n = Math.floor(t / 2) + 1
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
  return { seats: counts as Record<string, number>, total: t, needed: n, maxCount: sorted[0]?.[1] || 0 }
  }, [regions])

  return (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
  <div className="flex items-center justify-between mb-3">
  <h3 className="font-bold text-[13px] text-gray-800 flex items-center gap-1.5">
  🏛️ Matematik Dewan
  </h3>
  <span className="text-[10px] bg-red-600 text-white font-semibold px-2 py-0.5 rounded-full">
  {maxCount}/{total} — perlu {needed - maxCount > 0 ? `${needed - maxCount} lagi` : '✅ Capai'}
  </span>
  </div>
  <div className="space-y-2">
  {Object.entries(seats).sort(([, a], [, b]) => b - a).map(([party, count]) => {
  const pct = count / total * 100
  return (
  <div key={party}>
  <div className="flex justify-between text-[11px] mb-0.5">
  <span className="font-semibold flex items-center gap-1.5">
  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: hex[party] || '#6b7280' }} />
  {party}
  </span>
  <span className="text-gray-500">{count} kerusi <span className="text-gray-400">({Math.round(pct)}%)</span></span>
  </div>
  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: hex[party] || '#6b7280' }} />
  </div>
  </div>
  )
  })}
  </div>
  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-500">
  <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden flex">
  <div className="h-full bg-red-600 rounded-l-full" style={{ width: `${(maxCount / total) * 100}%` }} />
  <div className="h-full bg-amber-400" style={{ width: `${((needed - maxCount) / total) * 100}%` }} />
  <div className="h-full bg-gray-300 rounded-r-full" style={{ width: `${((total - needed) / total) * 100}%` }} />
  </div>
  <span className="font-medium">{needed - maxCount > 0 ? `Perlu ${needed - maxCount} lagi untuk majoriti mudah` : 'Sudah capai majoriti'}</span>
  </div>
  </div>
  )
}

export function KeyRaces({ regions }: { regions: RegionWithData[] }) {
  const hotSeats = useMemo(() => {
  return regions
  .map(r => {
  const last = r.history?.elections?.slice(-1)[0]
  const inc = r.candidates?.find(c => c.role === 'penyandang')
  const fallbackParty = r.history?.elections?.slice().reverse().find(e => e.winnerParty)
  const party = inc?.party || fallbackParty?.winnerParty || ''
  const incumbent = inc?.name || fallbackParty?.winner || ''
  if (!last || !party) return null
  return {
  code: r.code,
  name: r.name,
  party,
  incumbent,
  majority: last.majority || 0,
  year: last.year,
  flag: PARTY_FLAGS[party] || '/flags/bebas.svg',
  }
  })
  .filter((s): s is NonNullable<typeof s> => s !== null)
  .sort((a, b) => a.majority - b.majority)
  .slice(0, 6)
  }, [regions])

  if (!hotSeats.length) return null

  return (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
  <div className="flex items-center justify-between mb-3">
  <h3 className="font-bold text-[13px] text-gray-800 flex items-center gap-1.5">
  🔥 Kerusi Panas
  </h3>
  <span className="text-[10px] text-gray-400">Majoriti paling tipis</span>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
  {hotSeats.map(s => {
  const isTight = s.majority < 1000
  const isWarning = s.majority < 3000
  return (
  <div key={s.code} className={`rounded-lg border p-2.5 ${isTight ? 'border-red-300 bg-red-50/60' : isWarning ? 'border-amber-300 bg-amber-50/40' : 'border-gray-100 bg-gray-50/50'}`}>
  <div className="flex items-center justify-between mb-1">
  <span className="font-bold text-[11px] text-gray-800">{s.code}</span>
  {isTight && <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">TIGHT</span>}
  {!isTight && isWarning && <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">WATCH</span>}
  </div>
  <div className="text-[11px] font-medium text-gray-700 truncate">{s.name}</div>
  <div className="flex items-center gap-1.5 mt-1.5">
  <img src={s.flag} alt={s.party} className="w-5 h-auto rounded border border-gray-300" />
  <span className={`text-[10px] font-bold ${PARTY_COLORS[s.party] || 'text-gray-500'}`}>{s.party}</span>
  </div>
  <div className="mt-1 text-[10px] text-gray-500">
  Majoriti: <span className={`font-bold ${isTight ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-700'}`}>{s.majority.toLocaleString()}</span>
  </div>
  <div className="text-[9px] text-gray-400">PRN {s.year}</div>
  </div>
  )
  })}
  </div>
  </div>
  )
}
