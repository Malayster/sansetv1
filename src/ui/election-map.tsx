'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionWithData } from '@/types/election'

// === Roblox / n8n Neon Palette ===
const partyColors: Record<string, string> = {
  BN: '#00BFFF', PH: '#FF1744', PN: '#00E676', GPS: '#FFD600',
  WARISAN: '#448AFF', GRS: '#FF6D00', Bebas: '#B0BEC5',
}
const GLOW_COLORS: Record<string, string> = {
  BN: '#00BFFF', PH: '#FF5252', PN: '#69F0AE', GPS: '#FFEA00',
  WARISAN: '#82B1FF', GRS: '#FF9100', Bebas: '#CFD8DC',
}

function regionColor(r: RegionWithData): string {
  if (r.candidates && r.candidates.length > 0) {
    const hasResults = r.candidates.some(c => c.lastElection?.votes || c.lastElection?.percentage)
    if (hasResults) {
      let winner = r.candidates[0]
      let best = winner.lastElection?.votes ?? winner.lastElection?.percentage ?? -1
      for (const c of r.candidates) {
        const v = c.lastElection?.votes ?? c.lastElection?.percentage ?? -1
        if (v > best) { best = v; winner = c }
      }
      return partyColors[winner.party] || '#E040FB'
    }
    return '#37474F'
  }
  if (r.sentiment?.score != null) {
    const s = r.sentiment.score
    if (s >= 60) return '#00E676'
    if (s >= 40) return '#FFD600'
    return '#FF1744'
  }
  return '#37474F'
}

function polygonPath(geoJsonFile: string): string {
  return geoJsonFile.replace('.json', '_polygon.json')
}

const ElectionMap = memo(function ElectionMap({
  regions,
  selected,
  onSelect,
  geoJsonFile,
}: {
  regions: RegionWithData[]
  selected: RegionWithData | null
  onSelect: (r: RegionWithData) => void
  geoJsonFile: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.GeoJSON | null>(null)
  const [geoData, setGeoData] = useState<any>(null)
  const geoUrl = useMemo(() => `/geojson/${polygonPath(geoJsonFile)}`, [geoJsonFile])

  useEffect(() => {
    fetch(geoUrl).then(r => r.json()).then(setGeoData).catch(() => setGeoData(null))
  }, [geoUrl])

  const colorMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const r of regions) m[r.code] = regionColor(r)
    return m
  }, [regions])

  useEffect(() => {
    if (!containerRef.current || !geoData || mapRef.current) return

    const map = L.map(containerRef.current, {
      attributionControl: false,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 13,
      subdomains: 'abcd',
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const geoJsonLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const code = feature?.properties?.code as string
        const isSel = selected?.code === code
        const fill = colorMap[code] || '#37474F'
        const glow = GLOW_COLORS[Object.keys(partyColors).find(k => partyColors[k] === fill) || ''] || fill
        return {
          fillColor: fill,
          fillOpacity: isSel ? 0.55 : 0.35,
          color: isSel ? '#E040FB' : glow,
          weight: isSel ? 3 : 1.2,
          opacity: isSel ? 1 : 0.6,
          dashArray: isSel ? '' : '4 2',
        }
      },
      onEachFeature: (feature, layer) => {
        const code = feature.properties.code as string
        const region = regions.find(r => r.code === code)
        const pathLayer = layer as L.Path

        pathLayer.bindTooltip(
          `<div style="text-align:center">
            <div style="font-weight:bold;color:#E040FB;font-size:13px">${code}</div>
            <div style="color:#ccc;font-size:11px">${feature.properties.name || code}</div>
            ${region?.candidates?.[0] ? `<div style="color:#aaa;font-size:10px;margin-top:2px">${region.candidates[0].party} · ${region.candidates[0].name}</div>` : ''}
          </div>`,
          { sticky: true, direction: 'top', offset: [0, -8], opacity: 0.95,
            className: 'roblox-tooltip' }
        )

        pathLayer.on('click', () => {
          const r = regions.find(x => x.code === code)
          if (r) onSelect(r)
        })
      },
    }).addTo(map)

    map.fitBounds(geoJsonLayer.getBounds(), { padding: [30, 30], maxZoom: 9 })
    mapRef.current = map
    layerRef.current = geoJsonLayer

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [geoData])

  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.setStyle(((feature: any) => {
      const code = feature?.properties?.code as string
      const isSel = selected?.code === code
      const fill = colorMap[code] || '#37474F'
      const glow = GLOW_COLORS[Object.keys(partyColors).find(k => partyColors[k] === fill) || ''] || fill
      return {
        fillColor: fill,
        fillOpacity: isSel ? 0.55 : 0.35,
        color: isSel ? '#E040FB' : glow,
        weight: isSel ? 3 : 1.2,
        opacity: isSel ? 1 : 0.6,
        dashArray: isSel ? '' : '4 2',
      }
    }) as L.StyleFunction)
  }, [selected, colorMap])

  return (
    <div className="border border-[#2a2a4a] bg-[#0d0d1a] rounded-lg overflow-hidden shadow-[0_0_20px_rgba(224,64,251,0.15)]">
      <div ref={containerRef} style={{ width: '100%', height: '520px' }} />

      {selected && (
        <div className="px-3 py-1.5 bg-[#1a1a2e] border-t border-[#2a2a4a] flex items-center gap-3 text-[11px]">
          <span className="text-[#E040FB] font-bold">{selected.code}</span>
          <span className="text-gray-300">{selected.name}</span>
          {selected.candidates?.[0] && (
            <>
              <span className="text-gray-500">|</span>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: colorMap[selected.code] || '#37474F', boxShadow: `0 0 6px ${colorMap[selected.code] || '#37474F'}` }} />
              <span className="text-gray-400">{selected.candidates[0].party}</span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 p-2 bg-[#0d0d1a] border-t border-[#2a2a4a]">
        {regions.slice(0, 8).map((r) => (
          <button
            key={r.code}
            onClick={() => onSelect(r)}
            className={`text-[10px] px-2.5 py-1 rounded font-mono transition-all duration-150 ${
              selected?.code === r.code
                ? 'bg-[#E040FB] text-white shadow-[0_0_8px_rgba(224,64,251,0.5)]'
                : 'bg-[#1a1a2e] text-gray-400 border border-[#2a2a4a] hover:border-[#E040FB] hover:text-[#E040FB]'
            }`}
          >
            {r.code}
          </button>
        ))}
        {regions.length > 8 && (
          <span className="text-[10px] text-gray-500 self-center ml-1">+{regions.length - 8}</span>
        )}
      </div>

      <div className="flex items-center gap-4 px-3 py-2 bg-[#1a1a2e] text-[10px] font-mono border-t border-[#2a2a4a]">
        {Object.entries(partyColors).slice(0, 5).map(([party, color]) => (
          <span key={party} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="text-gray-400">{party}</span>
          </span>
        ))}
      </div>

      <style jsx global>{`
        .roblox-tooltip {
          background: #1a1a2e !important;
          border: 1px solid #E040FB !important;
          border-radius: 8px !important;
          color: #fff !important;
          font-family: monospace !important;
          font-size: 11px !important;
          padding: 6px 10px !important;
          box-shadow: 0 0 14px rgba(224,64,251,0.3) !important;
        }
        .roblox-tooltip::before {
          border-top-color: #E040FB !important;
        }
        .leaflet-control-zoom a {
          background: #1a1a2e !important;
          color: #E040FB !important;
          border: 1px solid #2a2a4a !important;
          border-radius: 6px !important;
          width: 30px !important;
          height: 30px !important;
          line-height: 28px !important;
          font-size: 16px !important;
          font-weight: bold !important;
          font-family: monospace !important;
        }
        .leaflet-control-zoom a:hover {
          background: #E040FB !important;
          color: #0d0d1a !important;
        }
      `}</style>
    </div>
  )
})

export default ElectionMap
