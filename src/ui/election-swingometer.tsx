'use client'

import { useState, useMemo } from 'react'
import { PARTY_COLOR_HEX, PARTY_FLAGS } from './party-vars'
import type { RegionWithData } from '@/types/election'

const hex = PARTY_COLOR_HEX

type SwingTarget = 'all' | 'BN' | 'PH' | 'PN'

export default function Swingometer({ regions }: { regions: RegionWithData[] }) {
  const [swing, setSwing] = useState(0)
  const [target, setTarget] = useState<SwingTarget>('all')

  const result = useMemo(() => {
  const counts: Record<string, number> = {}
  const details: { code: string; name: string; from: string; to: string; flipped: boolean }[] = []

  for (const r of regions) {
    const last = r.history?.elections?.slice(-1)[0]
    const inc = r.candidates?.find(c => c.role === 'penyandang')
    const currParty = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty || ''

    if (!last || !currParty || !last.candidates?.length) {
      counts[currParty] = (counts[currParty] || 0) + 1
      continue
    }

    // Total votes in this DUN
    const totalVotes = last.candidates.reduce((sum, c) => sum + (c.votes || 0), 0)
    if (totalVotes === 0) {
      counts[currParty] = (counts[currParty] || 0) + 1
      continue
    }

    let newParty = currParty
    let flipped = false

    if (target === 'all' || target === currParty) {
      // Find target candidate and best competitor (not the target)
      const targetCandidate = last.candidates.find(c => c.party === currParty)
      const competitors = last.candidates.filter(c => c.party !== currParty)
      const bestCompetitor = competitors.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]

      if (targetCandidate && bestCompetitor && (targetCandidate.votes || 0) > 0) {
        const voteGap = (targetCandidate.votes || 0) - (bestCompetitor.votes || 0)
        const swingVotes = totalVotes * (swing / 100)
        if (swingVotes > voteGap) {
          newParty = bestCompetitor.party
          flipped = true
        }
      }
    }

    counts[newParty] = (counts[newParty] || 0) + 1
    if (flipped) {
      details.push({ code: r.code, name: r.name, from: currParty, to: newParty, flipped })
    }
  }

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
  return {
    seats: counts,
    flipped: details.sort((a, b) => a.code.localeCompare(b.code)),
    maxParty: sorted[0]?.[0] || '',
    maxCount: sorted[0]?.[1] || 0,
    total: regions.length,
  }
  }, [regions, swing, target])

  const needed = Math.floor(regions.length / 2) + 1

  return (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
  <h3 className="font-bold text-[13px] text-gray-800 flex items-center gap-1.5">
  🎯 Swingometer
  </h3>
  <span className="text-[10px] text-gray-400">Simulasi: {swing}% undi beralih dari parti sasaran</span>
  </div>

  <div className="p-4 space-y-4">
  {/* Target selector */}
  <div className="flex gap-2">
  {(['all', 'BN', 'PH', 'PN'] as SwingTarget[]).map(t => (
  <button key={t} onClick={() => setTarget(t)}
  className={`text-[10px] font-medium px-3 py-1.5 rounded-full transition-colors ${
  target === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }`}
  >
  {t === 'all' ? 'Semua Parti' : t}
  </button>
  ))}
  </div>

  {/* Slider */}
  <div>
  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
  <span>0%</span>
  <span className="font-semibold text-gray-700">Ayunan: {swing}%</span>
  <span>30%</span>
  </div>
  <input type="range" min={0} max={30} step={0.5} value={swing}
  onChange={e => setSwing(parseFloat(e.target.value))}
  className="w-full h-2 rounded-full appearance-none cursor-pointer
  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-800 [&::-webkit-slider-thumb]:shadow-md
  [&::-webkit-slider-thumb]:cursor-pointer
  bg-gray-200 accent-gray-800"
  />
  </div>

  {/* Seat projection */}
  <div className="grid grid-cols-3 gap-2">
  {Object.entries(result.seats).sort(([, a], [, b]) => b - a).map(([party, count]) => {
  const isGov = party === result.maxParty && count >= needed
  return (
  <div key={party} className={`rounded-lg border p-3 text-center ${
  isGov ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
  }`}>
  <div className="flex justify-center mb-1">
  <img src={PARTY_FLAGS[party] || '/flags/bebas.svg'} className="w-6 h-auto rounded border border-gray-300" />
  </div>
  <div className="font-bold text-[14px]" style={{ color: hex[party] || '#6b7280' }}>{count}</div>
  <div className="text-[10px] text-gray-500">{party}</div>
  {isGov && <div className="text-[9px] text-red-600 font-bold mt-0.5">MAJORITI</div>}
  </div>
  )
  })}
  </div>

  {/* Status */}
  <div className="text-center text-[11px] text-gray-500 bg-gray-50 rounded-lg py-2">
  {result.maxCount >= needed ? (
  <span className="text-red-600 font-bold">
  ✅ {result.maxParty} capai majoriti dengan {result.maxCount}/{result.total} kerusi
  </span>
  ) : (
  <span>
  🏛️ {result.maxParty} perlu <strong>{needed - result.maxCount} lagi</strong> untuk majoriti ({result.maxCount}/{result.total})
  </span>
  )}
  </div>

  {/* Flipped seats */}
  {result.flipped.length > 0 && (
  <div className="border-t border-gray-100 pt-3">
  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
  🔄 Kerusi bertukar ({result.flipped.length})
  </div>
  <div className="flex flex-wrap gap-1.5">
  {result.flipped.map(f => (
  <span key={f.code} className="inline-flex items-center gap-1 text-[9px] bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
  {f.code}
  <span className="font-bold" style={{ color: hex[f.from] }}>{f.from}</span>
  <span className="text-gray-400">→</span>
  <span className="font-bold" style={{ color: hex[f.to] }}>{f.to}</span>
  </span>
  ))}
  </div>
  </div>
  )}
  </div>
  </div>
  )
}
