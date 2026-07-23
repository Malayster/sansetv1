'use client'

import React, { useState } from 'react'
import type { RegionWithData, SeatHistory, HistoricalElectionResult, HistoricalDemographics } from '@/types/election'

const PARTY_COLORS: Record<string, string> = {
  'BN': 'text-red-600', 'PH': 'text-blue-600', 'PN': 'text-green-600',
  'BERSATU': 'text-orange-600',
  'GPS': 'text-purple-600', 'GRS': 'text-orange-600',
  'WARISAN': 'text-yellow-600', 'Bebas': 'text-gray-500',
}

const PARTY_FLAGS: Record<string, string> = {
  'BN': '/flags/bn.webp',
  'PH': '/flags/ph.webp',
  'PN': '/flags/pn.webp',
  'BERSATU': '/flags/bersatu.webp',
  'GPS': '/flags/gps.webp',
  'GRS': '/flags/grs.webp',
  'WARISAN': '/flags/warisan.webp',
  'Bebas': '/flags/bebas.svg',
}

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
      src={src}
      alt={party}
      title={party}
      width={size}
      height={Math.round(size * 0.67)}
      className="inline-block rounded-sm border border-gray-300 object-cover"
      loading="lazy"
    />
  )
}

function HistoryCell({ history, year }: { history?: SeatHistory; year: number }) {
  const election = history?.elections?.find(e => e.year === year)
  if (!election || !election.winner) {
    return <span className="text-gray-200">—</span>
  }
  return (
    <div className="flex flex-col items-center gap-0.5" title={`${election.winner} (${election.winnerParty}) — ${election.majority.toLocaleString()} majoriti`}>
      <PartyFlag party={election.winnerParty} size={16} />
      <span className={`text-[10px] font-bold ${PARTY_COLORS[election.winnerParty] || 'text-gray-500'}`}>
        {election.winnerParty}
      </span>
      <span className="text-[9px] text-gray-400">
        {election.majority > 0 ? `${(election.majority / 1000).toFixed(1)}k` : '-'}
      </span>
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
      <td className="px-3 py-2.5 font-mono text-[11px] text-gray-400 font-bold align-top">
        {region.code}
      </td>
      <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap align-top">
        {sdn}
      </td>
      <td className="px-3 py-2.5 align-top">
        <div className="flex flex-wrap gap-1 max-w-[280px]">
          {candidates.map((c, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                c.role === 'penyandang'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {c.role === 'penyandang' && <span className="text-amber-500 text-[9px]">★</span>}
              <span className="max-w-[100px] truncate" title={c.name}>
                {c.name.split(' ').slice(0, 2).join(' ')}
              </span>
              <span className={`font-bold ${PARTY_COLORS[c.party] || 'text-gray-500'}`}>
                {c.party}
              </span>
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
            <span className={`font-bold text-[11px] ${PARTY_COLORS[incParty] || 'text-gray-500'}`}>
              {incParty}
            </span>
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
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
          {/* Candidates detail */}
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

          {/* Historical results */}
          <div>
            <h4 className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Sejarah Pilihan Raya</h4>
            <div className="space-y-1">
              {hist.elections.filter(e => e.year < 2026).map((e) => (
                <div key={e.year} className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-400 w-8">{e.year}</span>
                  <PartyFlag party={e.winnerParty} size={16} />
                  <span className="font-medium">{e.winner}</span>
                  <span className={`font-bold ${PARTY_COLORS[e.winnerParty] || 'text-gray-500'}`}>{e.winnerParty}</span>
                  <span className="text-gray-400 text-[10px]">
                    ({(e.majority / 1000).toFixed(1)}k majority)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div>
            <h4 className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Demografi Terkini</h4>
            <div className="text-[12px] space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-20">Jumlah Pengundi:</span>
                <span className="font-semibold">{region.demographics.totalElectors?.toLocaleString() || '-'}</span>
              </div>
              <div className="flex gap-3 text-[11px]">
                <span className="text-red-500">Melayu: {region.demographics.malay}%</span>
                <span className="text-orange-500">Cina: {region.demographics.chinese}%</span>
                <span className="text-green-600">India: {region.demographics.indian}%</span>
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

export default function ElectionDunList({
  regions,
}: {
  regions: RegionWithData[]
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const dunRegions = regions
    .filter(r => r.code.startsWith('N'))
    .sort((a, b) => a.code.localeCompare(b.code))

  if (dunRegions.length === 0) return null

  const displayed = showAll ? dunRegions : dunRegions.slice(0, 18)

  const partyTotals: Record<string, number> = {}
  for (const r of dunRegions) {
    const inc = r.candidates.find(c => c.role === 'penyandang')
    if (inc) partyTotals[inc.party] = (partyTotals[inc.party] || 0) + 1
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-[22px] font-bold text-[#111] flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-600 rounded-full inline-block" />
          Senarai DUN N. Sembilan (N01–N36)
          <span className="text-sm font-normal text-gray-400 ml-1">PRN 2026</span>
        </h2>
        <div className="flex gap-3 text-[11px]">
          {Object.entries(partyTotals).sort().map(([party, count]) => (
            <span key={party} className="flex items-center gap-1">
              <PartyFlag party={party} size={14} />
              <span className={`font-semibold ${PARTY_COLORS[party] || ''}`}>{party}</span>
              <span className="text-gray-500">{count}</span>
            </span>
          ))}
        </div>
      </div>

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
            {displayed.map((region) => (
              <React.Fragment key={region.code}>
                <tr
                  className={`border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition-colors ${
                    expanded === region.code ? 'bg-amber-50/30' : ''
                  }`}
                  onClick={() => setExpanded(expanded === region.code ? null : region.code)}
                >
                  <CandidateRow region={region} />
                </tr>
                {expanded === region.code && <ExpandedRow region={region} />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {dunRegions.length > 18 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
        >
          {showAll ? '▲ Ringkaskan' : `▼ Lihat semua ${dunRegions.length} DUN`}
        </button>
      )}

      <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
        Data calon dari SPR (ElectionData.MY). Klik baris untuk butiran penuh calon, sejarah, dan demografi.
        ★ = Penyandang. Logo parti dari <a href="https://spr.gov.my/parti-parti-yang-berdaftar/" className="underline hover:text-gray-600" target="_blank" rel="noopener">SPR</a>.
      </p>
    </div>
  )
}
