'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionWithData } from '@/types/election'

const partyColors: Record<string, string> = {
  BN: '#0033A0', PH: '#E21118', PN: '#0F4C2E', GPS: '#FFD700',
  WARISAN: '#1E90FF', GRS: '#FF4500', Bebas: '#808080',
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
      return partyColors[winner.party] || '#C41E3A'
    }
    return '#94a3b8'
  }
  if (r.sentiment?.score != null) {
    const s = r.sentiment.score
    if (s >= 60) return '#22c55e'
    if (s >= 40) return '#eab308'
    return '#ef4444'
  }
  return '#94a3b8'
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

  // Fetch GeoJSON
  useEffect(() => {
    fetch(geoUrl).then(r => r.json()).then(setGeoData).catch(() => setGeoData(null))
  }, [geoUrl])

  // Colour lookup
  const colorMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const r of regions) m[r.code] = regionColor(r)
    return m
  }, [regions])

  // Initialise Leaflet map
  useEffect(() => {
    if (!containerRef.current || !geoData || mapRef.current) return

    const map = L.map(containerRef.current, {
      attributionControl: false,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 13,
      subdomains: 'abcd',
    }).addTo(map)

    const geoJsonLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const code = feature?.properties?.code as string
        const isSel = selected?.code === code
        return {
          fillColor: colorMap[code] || '#94a3b8',
          fillOpacity: 0.7,
          color: isSel ? '#000' : '#fff',
          weight: isSel ? 2 : 0.5,
        }
      },
      onEachFeature: (feature, layer) => {
        const code = feature.properties.code as string
        const pathLayer = layer as L.Path
        pathLayer.on('click', () => {
          const region = regions.find(r => r.code === code)
          if (region) onSelect(region)
        })
        pathLayer.on('mouseover', () => {
          pathLayer.setStyle({ fillColor: '#C41E3A', fillOpacity: 0.85 })
        })
        pathLayer.on('mouseout', () => {
          const isSel = selected?.code === code
          pathLayer.setStyle({
            fillColor: colorMap[code] || '#94a3b8',
            fillOpacity: 0.7,
            color: isSel ? '#000' : '#fff',
            weight: isSel ? 2 : 0.5,
          })
        })
      },
    }).addTo(map)

    map.fitBounds(geoJsonLayer.getBounds(), { padding: [10, 10] })
    mapRef.current = map
    layerRef.current = geoJsonLayer

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [geoData])

  // Update styles when selected or colorMap changes
  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.setStyle(((feature: any) => {
      const code = feature?.properties?.code as string
      const isSel = selected?.code === code
      return {
        fillColor: colorMap[code] || '#94a3b8',
        fillOpacity: 0.7,
        color: isSel ? '#000' : '#fff',
        weight: isSel ? 2 : 0.5,
      }
    }) as L.StyleFunction)
  }, [selected, colorMap])

  return (
    <div className="border border-gray-200 bg-white rounded overflow-hidden">
      <div ref={containerRef} style={{ width: '100%', height: '500px' }} />

      {/* Quick-select buttons */}
      <div className="flex flex-wrap gap-2 p-2">
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

      {/* Legend */}
      <div className="flex items-center gap-3 px-2 pb-2 text-[9px] text-gray-400">
        {Object.entries(partyColors).slice(0, 5).map(([party, color]) => (
          <span key={party} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
            {party}
          </span>
        ))}
      </div>
    </div>
  )
})

export default ElectionMap
