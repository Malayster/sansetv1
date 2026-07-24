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
    // Get the most recent election with actual vote data (skip 2026 placeholder)
    const electionsWithVotes = r.history?.elections?.filter(e =>
      e.candidates?.some(c => (c.votes || 0) > 0)
    ) || []
    const last = electionsWithVotes.slice(-1)[0]
    const inc = r.candidates?.find(c => c.role === 'penyandang')
    const currParty = inc?.party || last?.winnerParty || ''

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
  <div className="bg-white border border-[#1a1a1a]/10 rounded-xl shadow-sm overflow-hidden">
  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#C41E3A] via-[#FFC107] to-[#1a1a1a]">
  <h3 className="font-bold text-[13px] text-white flex items-center gap-1.5">
  <span className="text-white/80">🎯</span> Swingometer
  </h3>
  <span className="text-[10px] text-white/70">Simulasi: {swing}% undi beralih dari parti sasaran</span>
  </div>

  <div className="p-4 space-y-4">
  {/* Target selector */}
  <div className="flex gap-2">
  {(['all', 'BN', 'PH', 'PN'] as SwingTarget[]).map(t => (
  <button key={t} onClick={() => setTarget(t)}
  className={`text-[10px] font-medium px-3 py-1.5 rounded-full transition-colors ${
  target === t ? 'bg-[#C41E3A] text-white shadow-sm' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/10'
  }`}
  >
  {t === 'all' ? 'Semua Parti' : t}
  </button>
  ))}
  </div>

  {/* Slider */}
  <div>
  <div className="flex justify-between text-[10px] text-[#1a1a1a]/50 mb-1">
  <span>0%</span>
  <span className="font-semibold text-[#1a1a1a]">Ayunan: {swing}%</span>
  <span>30%</span>
  </div>
  <input type="range" min={0} max={30} step={0.5} value={swing}
  onChange={e => setSwing(parseFloat(e.target.value))}
  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#1a1a1a]/10 accent-[#C41E3A] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C41E3A] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
  />
  </div>

  {/* Seat projection */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
  {Object.entries(result.seats).sort(([, a], [, b]) => b - a).map(([party, count]) => {
  const isGov = party === result.maxParty && count >= needed
  return (
  <div key={party} className={`rounded-lg border p-3 text-center ${
  isGov ? 'border-[#C41E3A] bg-[#C41E3A]/5' : 'border-[#1a1a1a]/10 bg-[#1a1a1a]/[0.02]'
  }`}>
  <div className="flex justify-center mb-1">
  <img src={PARTY_FLAGS[party] || '/flags/bebas.svg'} className="w-6 h-auto rounded border border-[#1a1a1a]/10" />
  </div>
  <div className="font-bold text-[14px]" style={{ color: hex[party] || '#6b7280' }}>{count}</div>
  <div className="text-[10px] text-[#1a1a1a]/50">{party}</div>
  {isGov && <div className="text-[9px] text-[#C41E3A] font-bold mt-0.5 uppercase tracking-wider">MAJORITI</div>}
  </div>
  )
  })}
  </div>

  {/* Status */}
  <div className="text-center text-[11px] text-[#1a1a1a]/50 bg-[#1a1a1a]/[0.02] rounded-lg py-2">
  {result.maxCount >= needed ? (
  <span className="text-[#C41E3A] font-bold">
  ✅ {result.maxParty} capai majoriti dengan {result.maxCount}/{result.total} kerusi
  </span>
  ) : (
  <span>
  🏛️ {result.maxParty} perlu <strong className="text-[#1a1a1a]">{needed - result.maxCount} lagi</strong> untuk majoriti ({result.maxCount}/{result.total})
  </span>
  )}
  </div>

  {/* Flipped seats */}
  {result.flipped.length > 0 && (
  <div className="border-t border-[#1a1a1a]/10 pt-3">
  <div className="text-[10px] font-semibold text-[#1a1a1a]/50 uppercase tracking-wider mb-2">
  🔄 Kerusi bertukar ({result.flipped.length})
  </div>
  <div className="flex flex-wrap gap-1.5">
  {result.flipped.map(f => (
  <span key={f.code} className="inline-flex items-center gap-1 text-[9px] bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-full px-2 py-0.5">
  {f.code}
  <span className="font-bold" style={{ color: hex[f.from] }}>{f.from}</span>
  <span className="text-[#1a1a1a]/40">→</span>
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
