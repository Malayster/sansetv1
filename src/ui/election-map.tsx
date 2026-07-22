'use client'

import { useEffect, useState, useCallback } from 'react'
import type { RegionWithData } from '@/types/election'

const partyColors: Record<string, string> = {
  BN: '#000080', PH: '#E21118', PN: '#031F73', GPS: '#FFD700',
  WARISAN: '#1E90FF', GRS: '#FF4500', Bebas: '#808080',
}

function regionColor(r: RegionWithData): string {
  if (r.predictions && r.predictions.length > 0) {
    return partyColors[r.predictions[0].party] || '#C41E3A'
  }
  if (r.sentiment?.score != null) {
    const s = r.sentiment.score
    if (s >= 60) return '#22c55e'
    if (s >= 40) return '#eab308'
    return '#ef4444'
  }
  return '#94a3b8'
}

export default function ElectionMap({
  regions,
  selected,
  onSelect,
}: {
  regions: RegionWithData[]
  selected: RegionWithData | null
  onSelect: (r: RegionWithData) => void
}) {
  // Compute bounding box
  const lngs = regions.map((r) => r.lng)
  const lats = regions.map((r) => r.lat)
  const minLng = Math.min(...lngs) - 0.5
  const maxLng = Math.max(...lngs) + 0.5
  const minLat = Math.min(...lats) - 0.5
  const maxLat = Math.max(...lats) + 0.5

  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100
  const toY = (lat: number) => 100 - ((lat - minLat) / (maxLat - minLat)) * 100

  return (
    <div className="border border-gray-200 bg-white rounded p-2">
      <svg viewBox="0 0 100 100" className="w-full h-[500px]">
        {/* Malaysia outline (simplified) */}
        <rect x={toX(99.5)} y={toY(7)} width={toX(104.5) - toX(99.5)} height={toY(1) - toY(7)} rx="8" fill="#e2e8f0" />
        <rect x={toX(100)} y={toY(7)} width={toX(103) - toX(100)} height={toY(2) - toY(7)} rx="5" fill="#e2e8f0" />

        {/* Region dots */}
        {regions.map((r) => {
          const isSel = selected?.code === r.code
          return (
            <g key={r.code} onClick={() => onSelect(r)} className="cursor-pointer">
              <circle
                cx={toX(r.lng)}
                cy={toY(r.lat)}
                r={isSel ? 2.5 : 1.5}
                fill={regionColor(r)}
                stroke={isSel ? '#000' : '#fff'}
                strokeWidth={isSel ? 0.5 : 0.2}
                className="hover:opacity-80 transition-opacity"
              />
              {isSel && (
                <text x={toX(r.lng)} y={toY(r.lat) - 0.5} textAnchor="middle" className="text-[1.5px] fill-black font-bold">
                  {r.code}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-2 mt-2 px-1">
        {regions.slice(0, 8).map((r) => (
          <button
            key={r.code}
            onClick={() => onSelect(r)}
            className={`text-[10px] px-2 py-0.5 border rounded transition-colors ${
              selected?.code === r.code
                ? 'bg-[#C41E3A] text-white border-[#C41E3A]'
                : 'border-gray-200 hover:border-gray-400 text-gray-600'
            }`}
          >
            {r.code} {r.name}
          </button>
        ))}
        {regions.length > 8 && (
          <span className="text-[10px] text-gray-400 self-center">+{regions.length - 8} lagi</span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 px-1 text-[9px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" /> Positif</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#eab308] inline-block" /> Neutral</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" /> Negatif</span>
      </div>
    </div>
  )
}
