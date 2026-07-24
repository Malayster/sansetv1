'use client'

import { useState, useMemo } from 'react'
import type { RegionWithData } from '@/types/election'
import { PARTY_COLORS, PARTY_FLAGS } from './party-vars'

function PartyFlag({ party, size = 18 }: { party: string; size?: number }) {
  const src = PARTY_FLAGS[party] || '/flags/bebas.svg'
  return (
  <img src={src} alt={party} title={party}
    width={size} height={Math.round(size * 0.67)}
    className="inline-block rounded-sm border border-gray-300 object-cover shrink-0"
    loading="lazy" />
  )
}

export default function ElectionDunList({ regions }: { regions: RegionWithData[] }) {
  const [search, setSearch] = useState('')
  const [partyFilter, setPartyFilter] = useState('')

  const parties = useMemo(() => {
    const set = new Set<string>()
    for (const r of regions) {
      const inc = r.candidates?.find(c => c.role === 'penyandang')
      const p = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty
      if (p) set.add(p)
    }
    return Array.from(set).sort()
  }, [regions])

  const filtered = useMemo(() => {
    let list = regions
    if (search) {
      const q = search.toUpperCase()
      list = list.filter(r => r.code.toUpperCase().includes(q) || r.name.toUpperCase().includes(q))
    }
    if (partyFilter) {
      list = list.filter(r => {
        const inc = r.candidates?.find(c => c.role === 'penyandang')
        const party = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty || ''
        return party === partyFilter
      })
    }
    return list.sort((a, b) => a.code.localeCompare(b.code))
  }, [regions, search, partyFilter])

  if (!regions.length) return null

  return (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    {/* Header + Filter */}
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Senarai DUN</h3>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Cari..."
        className="ml-auto w-[140px] px-2 h-7 text-[11px] bg-gray-50 border border-gray-200 rounded outline-none focus:border-red-300 placeholder:text-gray-400" />
      <select value={partyFilter} onChange={e => setPartyFilter(e.target.value)}
        className="h-7 text-[11px] bg-gray-50 border border-gray-200 rounded outline-none px-1">
        <option value="">Parti</option>
        {parties.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <span className="text-[11px] text-gray-400">{filtered.length}/{regions.length}</span>
    </div>

    {/* Table — 3 columns: Kod | Nama | Penyandang / Parti */}
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-16">Kod</th>
            <th className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nama DUN</th>
            <th className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Penyandang</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => {
            const inc = r.candidates?.find(c => c.role === 'penyandang')
            const incName = inc?.name?.split(' ').slice(0, 2).join(' ') || ''
            const incParty = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty || ''
            return (
              <tr key={r.code} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-[11px] text-gray-400 font-bold">{r.code}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800 text-[12px]">{r.name}</td>
                <td className="px-4 py-2.5">
                  {inc || incParty ? (
                    <div className="flex items-center gap-2">
                      <PartyFlag party={incParty} size={16} />
                      {incName && <span className="text-[11px] font-medium text-gray-700">{incName}</span>}
                      <span className={`text-[10px] font-bold ${PARTY_COLORS[incParty] || 'text-gray-500'}`}>
                        {incParty}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-300 italic">Tiada data</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    {filtered.length === 0 && (
      <div className="text-center py-8 text-[13px] text-gray-400">Tiada DUN ditemui</div>
    )}
  </div>
  )
}
