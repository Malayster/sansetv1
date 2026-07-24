'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PARTY_COLOR_HEX } from './party-vars'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionWithData } from '@/types/election'

const partyColors = PARTY_COLOR_HEX

function regionColor(r: RegionWithData): string {
  const inc = r.candidates?.find(c => c.role === 'penyandang')
  if (inc) return partyColors[inc.party] || '#6b7280'
  const last = r.history?.elections?.filter(e => e.winnerParty).slice(-1)[0]
  if (last?.winnerParty) return partyColors[last.winnerParty] || '#6b7280'
  return '#e5e7eb'
}

function polygonPath(f: string): string {
  return f.replace('.json', '_polygon.json')
}

function getParties(regions: RegionWithData[]): string[] {
  const set = new Set<string>()
  for (const r of regions) {
    const inc = r.candidates?.find(c => c.role === 'penyandang')
    if (inc) set.add(inc.party)
    else {
      const last = r.history?.elections?.slice().reverse().find(e => e.winnerParty)
      if (last) set.add(last.winnerParty)
    }
  }
  return Array.from(set)
}

const ElectionMap = memo(function ElectionMap({
  regions, selected, onSelect, geoJsonFile,
}: {
  regions: RegionWithData[]; selected: RegionWithData | null; onSelect: (r: RegionWithData) => void; geoJsonFile: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.GeoJSON | null>(null)
  const [geoData, setGeoData] = useState<any>(null)
  const geoUrl = useMemo(() => `/geojson/${polygonPath(geoJsonFile)}`, [geoJsonFile])
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => { fetch(geoUrl).then(r => r.json()).then(setGeoData).catch(() => setGeoData(null)) }, [geoUrl])

  const colorMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const r of regions) m[r.code] = regionColor(r)
    return m
  }, [regions])

  const styleFn = useCallback((f: any) => {
    const code = f?.properties?.code as string
    const c = colorMap[code] || '#f3f4f6'
    const sel = selected?.code === code
    return {
      fillColor: c,
      fillOpacity: sel ? 0.92 : 0.7,
      color: sel ? '#C41E3A' : '#cbd5e1',
      weight: sel ? 2.5 : 1,
    }
  }, [colorMap, selected])

  useEffect(() => {
    if (!containerRef.current || !geoData || mapRef.current) return
    const map = L.map(containerRef.current, {
      attributionControl: false, zoomControl: false,
      scrollWheelZoom: true, doubleClickZoom: true, dragging: true,
      zoomSnap: 0.5, zoomDelta: 0.5,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const layer = L.geoJSON(geoData, {
      style: styleFn,
      onEachFeature: (f, l) => {
        const code = f.properties.code as string
        const p = l as L.Path
        p.on('click', () => {
          const r = regions.find(x => x.code === code)
          if (r) onSelect(r)
        })
        p.on('mouseover', (e: L.LeafletMouseEvent) => {
          setHoveredCode(code)
          setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
          p.setStyle({ fillOpacity: 0.92, color: '#C41E3A', weight: 2.5 })
          p.bringToFront()
        })
        p.on('mousemove', (e: L.LeafletMouseEvent) => setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY }))
        p.on('mouseout', () => {
          setHoveredCode(null)
          const sel = selected?.code === code
          p.setStyle({
            fillOpacity: sel ? 0.92 : 0.7,
            color: sel ? '#C41E3A' : '#cbd5e1',
            weight: sel ? 2.5 : 1,
          })
        })
      },
    }).addTo(map)
    layerRef.current = layer
    const bounds = layer.getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 })

    // Code labels
    layer.eachLayer((l: any) => {
      const code = l.feature?.properties?.code as string
      const coords = l.getCenter?.()
      if (coords) {
        const icon = L.divIcon({
          html: `<div class="text-[8px] font-bold text-gray-500 bg-white/70 px-0.5 rounded shadow-sm whitespace-nowrap">${code}</div>`,
          className: '',
          iconSize: [50, 12],
          iconAnchor: [25, 6],
        })
        L.marker(coords, { icon, interactive: false }).addTo(map)
      }
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null; layerRef.current = null }
  }, [geoData, styleFn, regions, onSelect, selected])

  // Re-style on selection change
  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.eachLayer((l: any) => {
      const code = l.feature?.properties?.code as string
      if (!code) return
      const sel = selected?.code === code
      l.setStyle({
        fillColor: colorMap[code] || '#f3f4f6',
        fillOpacity: sel ? 0.92 : 0.7,
        color: sel ? '#C41E3A' : '#cbd5e1',
        weight: sel ? 2.5 : 1,
      })
    })
  }, [selected, colorMap])

  const hoveredRegion = useMemo(() => {
    if (!hoveredCode) return null
    return regions.find(r => r.code === hoveredCode)
  }, [hoveredCode, regions])

  const parties = useMemo(() => getParties(regions), [regions])

  return (
  <div className="relative bg-white border border-gray-200 rounded overflow-hidden">
    <div ref={containerRef} className="w-full h-[420px]" />

    {hoveredRegion && (
      <div className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-[11px] pointer-events-none" style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}>
        <div className="font-bold text-gray-800">{hoveredRegion.code} — {hoveredRegion.name}</div>
        <div className="text-gray-500">
          {hoveredRegion.candidates?.find(c => c.role === 'penyandang')?.party || 'Tiada penyandang'}
        </div>
      </div>
    )}

    <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm">
      {parties.map(p => (
        <div key={p} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: partyColors[p] || '#6b7280' }} />
          <span className="text-[10px] text-gray-600">{p}</span>
        </div>
      ))}
    </div>
  </div>
  )
})

export default ElectionMap
