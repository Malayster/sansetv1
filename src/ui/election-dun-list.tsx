'use client'

import React, { useState, useMemo } from 'react'
import type { RegionWithData, SeatHistory } from '@/types/election'
import { PARTY_COLORS, PARTY_FLAGS } from './party-vars'

const NSN_DUN_NAMES: Record<string, string> = {
  'N01': 'Chennah', 'N02': 'Pertang', 'N03': 'Sungai Lui', 'N04': 'Klawang',
  'N05': 'Serting', 'N06': 'Palong', 'N07': 'Jeram Padang', 'N08': 'Bahau',
  'N09': 'Lenggeng', 'N10': 'Nilai', 'N11': 'Lobak', 'N12': 'Temiang',
  'N13': 'Sikamat', 'N14': 'Ampangan', 'N15': 'Juasseh', 'N16': 'Seri Menanti',
  'N17': 'Senaling', 'N18': 'Pilah', 'N19': 'Johol', 'N20': 'Labu',
  'N21': 'Bukit Kepayang', 'N22': 'Rahang', 'N23': 'Mambau', 'N24': 'Seremban Jaya',
  'N25': 'Paroi', 'N26': 'Chembong', 'N27': 'Rantau', 'N28': 'Kota',
  'N29': 'Chuah', 'N30': 'Lukut', 'N31': 'Bagan Pinang', 'N32': 'Linggi',
  'N33': 'Sri Tanjung', 'N34': 'Gemas', 'N35': 'Gemencheh', 'N36': 'Repah',
}

function PartyFlag({ party, size = 18 }: { party: string; size?: number }) {
  const src = PARTY_FLAGS[party] || '/flags/bebas.svg'
  return (
    <img
      src={src} alt={party} title={party}
      width={size} height={Math.round(size * 0.67)}
      className="inline-block rounded-sm border border-gray-300 object-cover"
      loading="lazy"
    />
  )
}

function HistoryCell({ history, year }: { history?: SeatHistory; year: number }) {
  const election = history?.elections?.find(e => e.year === year)
  if (!election || !election.winner) return <span className="text-gray-200">—</span>
  return (
    <div className="flex flex-col items-center gap-0.5" title={`${election.winner} (${election.winnerParty}) — ${election.majority.toLocaleString()} majoriti`}>
      <PartyFlag party={election.winnerParty} size={16} />
      <span className={`text-[10px] font-bold ${PARTY_COLORS[election.winnerParty] || 'text-gray-500'}`}>{election.winnerParty}</span>
      <span className="text-[9px] text-gray-400">{election.majority > 0 ? `${(election.majority / 1000).toFixed(1)}k` : '-'}</span>
    </div>
  )
}

function CandidateRow({ region }: { region: RegionWithData }) {
  const candidates = region.candidates || []
  const incName = candidates.find(c => c.role === 'penyandang')
  const incParty = incName?.party || ''
  const sdn = NSN_DUN_NAMES[region.code] || region.name
  const hist = region.history

  return (
    <>
      <td className="px-3 py-2.5 font-mono text-[11px] text-gray-400 font-bold align-top">{region.code}</td>
      <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap align-top">{sdn}</td>
      <td className="px-3 py-2.5 align-top">
        <div className="flex flex-wrap gap-1 max-w-[280px]">
          {candidates.map((c, i) => (
            <span key={i}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                c.role === 'penyandang' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {c.role === 'penyandang' && <span className="text-amber-500 text-[9px]">★</span>}
              <span className="max-w-[100px] truncate" title={c.name}>{c.name.split(' ').slice(0, 2).join(' ')}</span>
              <span className={`font-bold ${PARTY_COLORS[c.party] || 'text-gray-500'}`}>{c.party}</span>
            </span>
          ))}
        </div>
      </td>
      <td className="text-center px-2 py-2.5 align-top"><HistoryCell history={hist} year={2008} /></td>
      <td className="text-center px-2 py-2.5 align-top"><HistoryCell history={hist} year={2013} /></td>
      <td className="text-center px-2 py-2.5 align-top"><HistoryCell history={hist} year={2018} /></td>
      <td className="text-center px-2 py-2.5 align-top"><HistoryCell history={hist} year={2023} /></td>
      <td className="text-center px-3 py-2.5 align-top">
        {incParty ? (
          <div className="flex flex-col items-center gap-0.5">
            <PartyFlag party={incParty} size={18} />
            <span className={`font-bold text-[11px] ${PARTY_COLORS[incParty] || 'text-gray-500'}`}>{incParty}</span>
          </div>
        ) : <span className="text-gray-300">—</span>}
      </td>
    </>
  )
}

function ExpandedRow({ region }: { region: RegionWithData }) {
  const hist = region.history
  const candidates = region.candidates || []
  if (!hist) return null
  return (
    <tr className="bg-gray-50 border-b border-gray-200">
      <td colSpan={8} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Calon PRN 2026</h4>
            <div className="space-y-1">
              {candidates.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px]">
                  <PartyFlag party={c.party} size={16} />
                  <span className={c.role === 'penyandang' ? 'font-semibold' : ''}>{c.name}</span>
                  <span className={`font-bold ${PARTY_COLORS[c.party] || 'text-gray-500'}`}>{c.party}</span>
                  {c.role === 'penyandang' && <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded">Penyandang</span>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Sejarah Pilihan Raya</h4>
            <div className="space-y-1">
              {hist.elections.filter(e => e.year < 2026).map((e) => (
                <div key={e.year} className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-400 w-8">{e.year}</span>
                  <PartyFlag party={e.winnerParty} size={16} />
                  <span className="font-medium">{e.winner}</span>
                  <span className={`font-bold ${PARTY_COLORS[e.winnerParty] || 'text-gray-500'}`}>{e.winnerParty}</span>
                  <span className="text-gray-400 text-[10px]">({(e.majority / 1000).toFixed(1)}k majority)</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Demografi Terkini</h4>
            <div className="text-[12px] space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-20">Jumlah Pengundi:</span>
                <span className="font-semibold">{region.demographics.totalElectors?.toLocaleString() || '-'}</span>
              </div>
              <div className="flex gap-3 text-[11px]">
                <span className="text-red-600">Melayu: {region.demographics.malay}%</span>
                <span className="text-amber-600">Cina: {region.demographics.chinese}%</span>
                <span className="text-gray-600">India: {region.demographics.indian}%</span>
                <span className="text-gray-400">Lain: {region.demographics.others}%</span>
              </div>
              <div className="flex gap-3 text-[11px]">
                <span>Median Income: <span className="font-semibold">RM{region.demographics.medianIncome?.toLocaleString() || '-'}</span></span>
                <span>GINI: <span className="font-semibold">{region.demographics.gini?.toFixed(3) || '-'}</span></span>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function ElectionDunList({ regions }: { regions: RegionWithData[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [partyFilter, setPartyFilter] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)

  // Compute party totals from all regions
  const partyTotals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const r of regions) {
      const inc = r.candidates.find(c => c.role === 'penyandang')
      if (inc) t[inc.party] = (t[inc.party] || 0) + 1
    }
    return t
  }, [regions])

  // Filter & search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return regions.filter(r => {
      const sdn = NSN_DUN_NAMES[r.code] || r.name
      const matchesSearch = !q ||
        sdn.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.candidates.some(c => c.name.toLowerCase().includes(q))
      const inc = r.candidates.find(c => c.role === 'penyandang')
      const matchesParty = partyFilter === 'all' || inc?.party === partyFilter
      return matchesSearch && matchesParty
    })
  }, [regions, search, partyFilter])

  const displayed = showAll ? filtered : filtered.slice(0, 18)

  if (regions.length === 0) return null

  const partyList = Object.keys(partyTotals).sort()

  return (
    <div className="mt-8">
      {/* Header + Party Totals */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-serif text-[22px] font-bold text-[#111] flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block" />
          Senarai DUN N. Sembilan (N01–N36)
          <span className="text-sm font-normal text-gray-400 ml-1">PRN 2026</span>
          <span className="text-[11px] text-gray-400 font-normal ml-1">({filtered.length} dipaparkan)</span>
        </h2>
        <div className="flex gap-3 text-[11px] flex-wrap">
          {partyList.map(party => (
            <span key={party} className="flex items-center gap-1">
              <PartyFlag party={party} size={14} />
              <span className={`font-semibold ${PARTY_COLORS[party] || ''}`}>{party}</span>
              <span className="text-gray-500">{partyTotals[party]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setShowAll(false) }}
            placeholder="Cari DUN atau nama calon..."
            className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <select
          value={partyFilter} onChange={e => { setPartyFilter(e.target.value); setShowAll(false) }}
          className="text-[12px] border border-gray-300 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
        >
          <option value="all">Semua Parti</option>
          {partyList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {search && (
          <button onClick={() => setSearch('')} className="text-[11px] text-gray-400 hover:text-gray-600 px-2">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-[12px] border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-[11px]">
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[60px]">Kod</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500 w-[130px]">Nama DUN</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-500">Calon PRN 2026</th>
              <th className="text-center px-2 py-2 font-semibold text-gray-500 w-[72px]">PRU 2008</th>
              <th className="text-center px-2 py-2 font-semibold text-gray-500 w-[72px]">PRU 2013</th>
              <th className="text-center px-2 py-2 font-semibold text-gray-500 w-[72px]">PRU 2018</th>
              <th className="text-center px-2 py-2 font-semibold text-gray-500 w-[72px]">PRN 2023</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-500 w-[65px]">Penyandang</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-[12px]">Tiada DUN sepadan dengan carian &quot;{search}&quot;</td></tr>
            ) : (
              displayed.map((region) => (
                <React.Fragment key={region.code}>
                  <tr
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/80 cursor-pointer transition-colors ${expanded === region.code ? 'bg-amber-50/30' : ''}`}
                    onClick={() => setExpanded(expanded === region.code ? null : region.code)}
                  >
                    <CandidateRow region={region} />
                  </tr>
                  {expanded === region.code && <ExpandedRow region={region} />}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 18 && (
        <button onClick={() => setShowAll(!showAll)}
          className="mt-2 text-[11px] text-red-600 hover:text-red-700 font-medium"
        >
          {showAll ? '▲ Ringkaskan' : `▼ Lihat semua ${filtered.length} DUN`}
        </button>
      )}

      <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
        Data calon dari SPR (ElectionData.MY). Klik baris untuk butiran penuh calon, sejarah, dan demografi.
        ★ = Penyandang. Logo parti dari <a href="https://spr.gov.my/parti-parti-yang-berdaftar/" className="underline hover:text-gray-600" target="_blank" rel="noopener">SPR</a>.
      </p>
    </div>
  )
}
