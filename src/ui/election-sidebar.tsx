'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRegionNews } from '@/lib/election'
import type { RegionWithData, CandidateData } from '@/types/election'

const partyNames: Record<string, string> = {
  BN: 'Barisan Nasional', PH: 'Pakatan Harapan', PN: 'Perikatan Nasional',
  GPS: 'GPS', GRS: 'GRS', WARISAN: 'Warisan', Bebas: 'Bebas',
}

function CandidateCard({ c }: { c: CandidateData }) {
  const isIncumbent = c.role === 'penyandang'
  return (
    <div className="flex gap-3 items-start">
      <img
        src={c.partyLogo}
        alt={c.party}
        className="w-[40px] h-[40px] rounded-full object-cover border-2 border-gray-200 flex-shrink-0 bg-gray-100"
        onError={(e) => { (e.target as HTMLImageElement).src = '/flags/bebas.svg' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-gray-800 leading-tight">{c.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-gray-500">{partyNames[c.party] || c.party}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isIncumbent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
            {isIncumbent ? 'Penyandang' : 'Pencabar'}
          </span>
        </div>
        {isIncumbent && c.lastElection && (
          <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-400 bg-gray-50 rounded p-1.5">
            <div><span className="text-gray-500">PRU {c.lastElection.year}</span></div>
            <div><span className="font-bold text-gray-700">{c.lastElection.percentage}%</span></div>
            <div>Undi: <span className="text-gray-600">{c.lastElection.votes.toLocaleString()}</span></div>
            <div>Majoriti: <span className="text-gray-600">{c.lastElection.majority.toLocaleString()}</span></div>
            <div>Pengundi: <span className="text-gray-600">{c.lastElection.totalVoters.toLocaleString()}</span></div>
            <div>Keluar: <span className="text-gray-600">{c.lastElection.turnout}%</span></div>
          </div>
        )}
        {c.profile && (
          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed border-l-2 border-gray-200 pl-2">{c.profile}</p>
        )}
      </div>
    </div>
  )
}

export default function ElectionSidebar({ region }: { region: RegionWithData | null }) {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (region) {
      setLoading(true)
      getRegionNews(region.code, 5).then((articles) => {
        setNews(articles)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [region?.code])

  if (!region) {
    return (
      <div className="border border-gray-200 bg-white rounded p-6 flex items-center justify-center text-center">
        <div className="text-gray-400 text-[12px]">
          <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Klik kawasan pada peta untuk lihat maklumat terperinci.
        </div>
      </div>
    )
  }

  const { sentiment, candidates, demographics, name, code, state, history } = region
  const sortedCandidates = [...candidates].sort((a, b) =>
    a.role === 'penyandang' ? -1 : b.role === 'penyandang' ? 1 : 0,
  )
  const hasIncumbent = candidates.some(c => c.role === 'penyandang')
  // Fallback: use last historical winner if no incumbent
  const lastWinner = !hasIncumbent ? history?.elections?.slice().reverse().find(e => e.winnerParty) : null
  const { malay, chinese, indian, others, medianIncome, gini, poverty } = demographics

  return (
    <div className="border border-gray-200 bg-white rounded">
      {/* Header */}
      <div className="bg-[#C41E3A] text-white px-4 py-3 rounded-t">
        <h2 className="font-serif text-[16px] font-bold">{name}</h2>
        <p className="text-[10px] text-white/70">{code} — {state}</p>
      </div>

      <div className="divide-y divide-gray-100">
        {/* ── 1. Calon Bertanding ── */}
        <div className="p-4">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-3">Calon Bertanding</h3>
          {lastWinner && (
            <div className="text-[10px] text-gray-500 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 mb-3">
              ⚠️ Tiada data penyandang. Pemenang PRN 2023: <span className="font-bold text-gray-700">{lastWinner.winnerParty}</span> ({lastWinner.winner})
            </div>
          )}
          <div className="space-y-3">
            {sortedCandidates.map((c, i) => <CandidateCard key={i} c={c} />)}
          </div>
        </div>

        {/* ── 2. Demografi Kawasan ── */}
        <div className="p-4">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Demografi Kawasan</h3>
          <div className="space-y-1.5">
            {[
              { label: 'Melayu', value: malay, color: 'bg-[#C41E3A]' },
              { label: 'Cina', value: chinese, color: 'bg-amber-500' },
              { label: 'India', value: indian, color: 'bg-gray-500' },
              { label: 'Lain-lain', value: others, color: 'bg-gray-400' },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-16 text-right">{d.label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.value}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 w-8">{d.value}%</span>
              </div>
            ))}
          </div>
          {medianIncome != null && medianIncome > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500">
              <div>Pendapatan Median</div>
              <div className="text-right font-bold text-gray-700">RM{medianIncome.toLocaleString()}</div>
              {poverty != null && (
                <>
                  <div>Kadar Kemiskinan</div>
                  <div className="text-right font-bold text-gray-700">{poverty}%</div>
                </>
              )}
              {gini != null && gini > 0 && (
                <>
                  <div>Pekali Gini</div>
                  <div className="text-right font-bold text-gray-700">{gini.toFixed(3)}</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── 3. Sentimen Semasa ── */}
        <div className="p-4">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Sentimen Semasa</h3>
          {sentiment ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${sentiment.score}%`,
                      backgroundColor: sentiment.score >= 60 ? '#DC2626' : sentiment.score >= 40 ? '#EAB308' : '#6B7280',
                    }}
                  />
                </div>
                <span className="text-[14px] font-bold text-gray-700">{sentiment.score}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold uppercase ${
                  sentiment.label === 'positif' ? 'text-red-600' : sentiment.label === 'negatif' ? 'text-gray-600' : 'text-amber-600'
                }`}>
                  {sentiment.label}
                </span>
                <span className="text-[9px] text-gray-400">· {sentiment.source}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">{sentiment.summary}</p>
              {sentiment.topIssue && (
                <p className="text-[10px] text-gray-400 mt-1">🔍 Isu hangat: <span className="font-medium text-gray-600">{sentiment.topIssue}</span></p>
              )}
              {sentiment.partySentiment && (
                <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                  {Object.entries(sentiment.partySentiment).map(([party, score]) => (
                    <div key={party} className="text-[9px]">
                      <div className="font-bold text-gray-700">{party}</div>
                      <div className="text-gray-400">{score}%</div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-gray-400 mt-1">
                Dikemaskini: {new Date(sentiment.updatedAt).toLocaleString('ms')}
              </p>
            </>
          ) : (
            <div className="text-[11px] text-gray-400 italic py-2">Data sentimen belum tersedia.</div>
          )}
        </div>

        {/* ── 4. Berita Berkaitan ── */}
        <div className="p-4">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Berita Berkaitan</h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {news.map((a) => (
                <Link
                  key={a._id}
                  href={`/berita/${a.slug || ''}`}
                  className="block py-1.5 text-[11px] text-gray-700 hover:text-[#C41E3A] transition-colors leading-snug"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic">Tiada berita untuk kawasan ini.</p>
          )}
        </div>
      </div>
    </div>
  )
}
