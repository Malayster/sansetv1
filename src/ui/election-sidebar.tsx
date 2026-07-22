'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRegionNews } from '@/lib/election'
import type { RegionWithData } from '@/types/election'

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

  const { sentiment, predictions, name, code, state } = region

  return (
    <div className="border border-gray-200 bg-white rounded">
      {/* Header */}
      <div className="bg-[#C41E3A] text-white px-4 py-3 rounded-t">
        <h2 className="font-serif text-[16px] font-bold">{name}</h2>
        <p className="text-[10px] text-white/70">{code} — {state}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Sentiment */}
        {sentiment ? (
          <div>
            <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Sentimen Pengundi</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${sentiment.score}%`,
                    backgroundColor: sentiment.score >= 60 ? '#22c55e' : sentiment.score >= 40 ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-[14px] font-bold text-gray-700">{sentiment.score}%</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[10px] font-bold uppercase ${
                sentiment.label === 'positif' ? 'text-emerald-600' : sentiment.label === 'negatif' ? 'text-red-600' : 'text-amber-600'
              }`}>
                {sentiment.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">{sentiment.summary}</p>
            <p className="text-[9px] text-gray-400 mt-1">
              Dikemaskini: {new Date(sentiment.updatedAt).toLocaleString('ms')}
            </p>
          </div>
        ) : (
          <div className="text-[11px] text-gray-400 italic py-2">Data sentimen belum tersedia.</div>
        )}

        {/* Predictions */}
        {predictions && predictions.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">Ramalan Calon</h3>
            <div className="space-y-2">
              {predictions.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div>
                      <span className="text-[12px] font-bold text-gray-800">{p.candidateName}</span>
                      <span className="text-[9px] text-gray-400 ml-1">({p.party})</span>
                    </div>
                    <span className="text-[12px] font-bold text-gray-700">{p.winRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C41E3A] rounded-full"
                      style={{ width: `${p.winRate}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">{p.factors}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related News */}
        <div className="border-t border-gray-100 pt-4">
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
