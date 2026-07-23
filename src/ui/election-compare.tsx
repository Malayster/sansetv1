'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { PARTY_FLAGS, PARTY_COLORS, PARTY_COLOR_HEX } from './party-vars'
import type { RegionWithData } from '@/types/election'

const hex = PARTY_COLOR_HEX

export default function ElectionCompare({ regions }: { regions: RegionWithData[] }) {
  const [a, setA] = useState('N01')
  const [b, setB] = useState('N10')

  const regionA = useMemo(() => regions.find(r => r.code === a), [regions, a])
  const regionB = useMemo(() => regions.find(r => r.code === b), [regions, b])

  const historyData = useMemo(() => {
    if (!regionA?.history || !regionB?.history) return []
    const years = [...new Set([...regionA.history.elections, ...regionB.history.elections].map(e => e.year))].sort()
    return years.map(y => ({
      year: y,
      [a]: regionA.history?.elections?.find(e => e.year === y)?.winnerParty || '-',
      [b]: regionB.history?.elections?.find(e => e.year === y)?.winnerParty || '-',
    }))
  }, [regionA, regionB, a, b])

  const incA = regionA?.candidates?.find(c => c.role === 'penyandang') || (regionA?.history?.elections?.slice().reverse().find(e => e.winnerParty) ? { party: regionA!.history!.elections!.slice().reverse().find(e => e.winnerParty)!.winnerParty!, name: regionA.history!.elections!.slice().reverse().find(e => e.winnerParty)!.winner || '' } as any : undefined)
  const incB = regionB?.candidates?.find(c => c.role === 'penyandang') || (regionB?.history?.elections?.slice().reverse().find(e => e.winnerParty) ? { party: regionB!.history!.elections!.slice().reverse().find(e => e.winnerParty)!.winnerParty!, name: regionB.history!.elections!.slice().reverse().find(e => e.winnerParty)!.winner || '' } as any : undefined)
  const lastA = regionA?.history?.elections?.slice(-1)[0]
  const lastB = regionB?.history?.elections?.slice(-1)[0]

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-[13px] text-gray-800 flex items-center gap-1.5">
          ⚖️ Perbandingan DUN
        </h3>
      </div>

      <div className="p-4">
        {/* Picker */}
        <div className="grid grid-cols-2 gap-4 mb-4">
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
        <div className="grid grid-cols-2 gap-4">
          {/* DUN A */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2">
              <div className="font-bold text-[13px]">{a}</div>
              <div className="text-[11px] opacity-80">{regionA?.name}</div>
            </div>
            <div className="p-3 space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                {incA && <img src={PARTY_FLAGS[incA.party] || '/flags/bebas.svg'} className="w-6 h-auto rounded border border-gray-300" />}
                <div>
                  <div className="font-semibold text-gray-800">{incA?.name || '-'}</div>
                  <span className={`font-bold text-[10px] ${PARTY_COLORS[incA?.party || ''] || 'text-gray-500'}`}>{incA?.party || '-'}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 grid grid-cols-2 gap-1">
                <div className="text-gray-500">Majoriti</div>
                <div className="font-bold text-right">{lastA?.majority?.toLocaleString() || '-'}</div>
                <div className="text-gray-500">Keluar Undi</div>
                <div className="font-bold text-right">{lastA?.turnout || '-'}%</div>
                <div className="text-gray-500">Pengundi</div>
                <div className="font-bold text-right">{regionA?.demographics.totalElectors?.toLocaleString() || '-'}</div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                <div className="text-[9px] text-gray-400 mb-1">Demografi</div>
                <div className="flex gap-2 text-[10px]">
                  <span className="text-red-500">M: {regionA?.demographics.malay}%</span>
                  <span className="text-blue-500">C: {regionA?.demographics.chinese}%</span>
                  <span className="text-orange-500">I: {regionA?.demographics.indian}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* DUN B */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2">
              <div className="font-bold text-[13px]">{b}</div>
              <div className="text-[11px] opacity-80">{regionB?.name}</div>
            </div>
            <div className="p-3 space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                {incB && <img src={PARTY_FLAGS[incB.party] || '/flags/bebas.svg'} className="w-6 h-auto rounded border border-gray-300" />}
                <div>
                  <div className="font-semibold text-gray-800">{incB?.name || '-'}</div>
                  <span className={`font-bold text-[10px] ${PARTY_COLORS[incB?.party || ''] || 'text-gray-500'}`}>{incB?.party || '-'}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 grid grid-cols-2 gap-1">
                <div className="text-gray-500">Majoriti</div>
                <div className="font-bold text-right">{lastB?.majority?.toLocaleString() || '-'}</div>
                <div className="text-gray-500">Keluar Undi</div>
                <div className="font-bold text-right">{lastB?.turnout || '-'}%</div>
                <div className="text-gray-500">Pengundi</div>
                <div className="font-bold text-right">{regionB?.demographics.totalElectors?.toLocaleString() || '-'}</div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                <div className="text-[9px] text-gray-400 mb-1">Demografi</div>
                <div className="flex gap-2 text-[10px]">
                  <span className="text-red-500">M: {regionB?.demographics.malay}%</span>
                  <span className="text-blue-500">C: {regionB?.demographics.chinese}%</span>
                  <span className="text-orange-500">I: {regionB?.demographics.indian}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History comparison line */}
        {historyData.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Sejarah Parti Menang</div>
            <div className="flex gap-2">
              {historyData.map(h => (
                <div key={h.year} className="flex-1 text-center bg-gray-50 rounded-lg border border-gray-200 p-2">
                  <div className="text-[9px] text-gray-400">{h.year}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`text-[10px] font-bold ${PARTY_COLORS[(h as any)[a]] || 'text-gray-500'}`}>{(h as any)[a]}</span>
                    <span className="text-[8px] text-gray-300">vs</span>
                    <span className={`text-[10px] font-bold ${PARTY_COLORS[(h as any)[b]] || 'text-gray-500'}`}>{(h as any)[b]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
