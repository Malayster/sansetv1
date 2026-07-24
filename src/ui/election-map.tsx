'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { PARTY_COLOR_HEX } from './party-vars'
import type { RegionWithData } from '@/types/election'

const partyColors = PARTY_COLOR_HEX

/** Convert [lng, lat] rings to SVG path d string */
function ringsToPath(rings: number[][][]): string {
  return rings.map(ring =>
    ring.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z'
  ).join(' ')
}

function regionParty(r: RegionWithData): string {
  const inc = r.candidates?.find(c => c.role === 'penyandang')
  if (inc) return inc.party
  const last = r.history?.elections?.filter(e => e.winnerParty).slice(-1)[0]
  return last?.winnerParty || ''
}

const ElectionMap = memo(function ElectionMap({
  regions, selected, onSelect, geoJsonFile,
}: {
  regions: RegionWithData[]; selected: RegionWithData | null; onSelect: (r: RegionWithData) => void; geoJsonFile: string
}) {
  const [geoData, setGeoData] = useState<any>(null)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetch(`/geojson/${geoJsonFile.replace('.json', '_polygon.json')}`)
      .then(r => r.json()).then(setGeoData).catch(() => setGeoData(null))
  }, [geoJsonFile])

  const { paths, viewBox } = useMemo(() => {
    if (!geoData?.features) return { paths: [], viewBox: '0 0 100 100' }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    const result: { code: string; name: string; d: string; party: string }[] = []

    for (const f of geoData.features) {
      const props = f.properties || {}
      const code: string = props.code || ''
      const r = regions.find(x => x.code === code)
      const party = r ? regionParty(r) : ''
      const coords = f.geometry?.coordinates
      if (!coords) continue

      let d = ''
      if (f.geometry.type === 'Polygon') {
        d = ringsToPath(coords)
        for (const ring of coords) {
          for (const p of ring) {
            if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0]
            if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]
          }
        }
      } else if (f.geometry.type === 'MultiPolygon') {
        d = coords.map(poly => ringsToPath(poly)).join(' ')
        for (const poly of coords) {
          for (const ring of poly) {
            for (const p of ring) {
              if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0]
              if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]
            }
          }
        }
      }
      if (d) result.push({ code, name: props.name || code, d, party })
    }

    const padX = Math.max((maxX - minX) * 0.06, 0.01)
    const padY = Math.max((maxY - minY) * 0.06, 0.01)
    return {
      paths: result,
      viewBox: `${minX - padX} ${minY - padY} ${maxX - minX + padX * 2} ${maxY - minY + padY * 2}`,
    }
  }, [geoData, regions])

  const hoveredRegion = useMemo(() => {
    if (!hoveredCode) return null
    return regions.find(r => r.code === hoveredCode)
  }, [hoveredCode, regions])

  // Compute height from viewBox aspect ratio
  const vb = viewBox.split(' ').map(Number)
  const aspect = vb[2] / vb[3]
  const H = Math.round(800 / aspect)

  return (
  <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
    <svg
      viewBox={viewBox}
      width="100%"
      height={Math.min(H, 600)}
      preserveAspectRatio="xMidYMid meet"
      className="block bg-slate-50"
    >
      {paths.map(p => {
        const isSel = selected?.code === p.code
        const isHov = hoveredCode === p.code
        return (
          <path
            key={p.code}
            d={p.d}
            fill={partyColors[p.party] || '#e5e7eb'}
            fillOpacity={isSel ? 0.92 : isHov ? 0.88 : 0.65}
            stroke={isSel || isHov ? '#C41E3A' : '#cbd5e1'}
            strokeWidth={isSel ? 2.5 : isHov ? 2 : 0.8}
            className="transition-[fill-opacity,stroke] duration-150 cursor-pointer"
            onMouseMove={e => { setHoveredCode(p.code); setTooltipPos({ x: e.clientX, y: e.clientY }) }}
            onMouseLeave={() => setHoveredCode(null)}
            onClick={() => { const r = regions.find(x => x.code === p.code); if (r) onSelect(r) }}
          />
        )
      })}
    </svg>

    {/* Tooltip */}
    {hoveredRegion && (
      <div className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-[11px] pointer-events-none" style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}>
        <div className="font-bold text-gray-800">{hoveredRegion.code} — {hoveredRegion.name}</div>
        <div className="text-gray-500">{regionParty(hoveredRegion) || 'Tiada penyandang'}</div>
      </div>
    )}

    {/* Legend */}
    <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm">
      {Array.from(new Set(paths.map(p => p.party).filter(Boolean))).map(p => (
        <div key={p} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: partyColors[p] || '#6b7280' }} />
          <span className="text-[10px] text-gray-600">{p}</span>
        </div>
      ))}
    </div>
  </div>
  )
})

export default ElectionMap
