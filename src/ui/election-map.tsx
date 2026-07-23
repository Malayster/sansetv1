'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { PARTY_FLAGS, PARTY_COLORS, PARTY_COLOR_HEX } from './party-vars'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionWithData } from '@/types/election'

const partyColors = PARTY_COLOR_HEX

function regionColor(r: RegionWithData, year?: number | null): string {
  if (year && r.history?.elections) {
    const election = r.history.elections.find(e => e.year === year)
    if (election?.winnerParty) return partyColors[election.winnerParty] || '#6b7280'
  }
  const inc = r.candidates?.find(c => c.role === 'penyandang')
  if (inc) return partyColors[inc.party] || '#6b7280'
  // Fallback: use last historical winner
  const lastElection = r.history?.elections?.slice(-1)[0]
  if (lastElection?.winnerParty) return partyColors[lastElection.winnerParty] || '#6b7280'
  return '#e5e7eb'
}

function polygonPath(f: string): string {
  return f.replace('.json', '_polygon.json')
}

const ElectionMap = memo(function ElectionMap({
  regions, selected, onSelect, geoJsonFile, activeYear,
}: {
  regions: RegionWithData[]; selected: RegionWithData | null; onSelect: (r: RegionWithData) => void; geoJsonFile: string; activeYear?: number | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.GeoJSON | null>(null)
  const [geoData, setGeoData] = useState<any>(null)
  const geoUrl = useMemo(() => `/geojson/${polygonPath(geoJsonFile)}`, [geoJsonFile])
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [clickedRegion, setClickedRegion] = useState<RegionWithData | null>(null)

  useEffect(() => { fetch(geoUrl).then(r => r.json()).then(setGeoData).catch(() => setGeoData(null)) }, [geoUrl])

  const colorMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const r of regions) m[r.code] = regionColor(r, activeYear)
    return m
  }, [regions, activeYear])

  useEffect(() => {
    if (!containerRef.current || !geoData || mapRef.current) return
    const map = L.map(containerRef.current, {
      attributionControl: false, zoomControl: false,
      scrollWheelZoom: true, doubleClickZoom: true, dragging: true,
      zoomSnap: 0.5, zoomDelta: 0.5,
    })
    const bg = document.createElement('div')
    bg.style.cssText = 'position:absolute;inset:0;background:#f1f5f9;z-index:-1'
    containerRef.current.appendChild(bg)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const layer = L.geoJSON(geoData, {
      style: (f) => ({
        fillColor: colorMap[f?.properties?.code as string] || '#f3f4f6',
        fillOpacity: 0.7, color: '#cbd5e1', weight: 1.2,
      }),
      onEachFeature: (f, l) => {
        const code = f.properties.code as string
        const p = l as L.Path
        p.on('click', () => {
          const r = regions.find(x => x.code === code)
          if (r) { setClickedRegion(r); onSelect(r) }
        })
        p.on('mouseover', (e: L.LeafletMouseEvent) => {
          setHoveredCode(code)
          setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
          p.setStyle({ fillOpacity: 0.92, color: '#C41E3A', weight: 2.5 }); p.bringToFront()
        })
        p.on('mousemove', (e: L.LeafletMouseEvent) => setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY }))
        p.on('mouseout', () => {
          setHoveredCode(null)
          const sel = selected?.code === code || clickedRegion?.code === code
          p.setStyle({ fillOpacity: sel ? 0.92 : 0.7, color: sel ? '#C41E3A' : '#cbd5e1', weight: sel ? 2.5 : 1.2 })
        })
      },
    }).addTo(map)

    layer.eachLayer((ly: any) => {
      const code = ly.feature?.properties?.code as string
      if (ly.getBounds) {
        const c = ly.getBounds().getCenter()
        L.marker(c, {
          icon: L.divIcon({ className: '', html: `<span style="font-family:Inter,sans-serif;font-size:8px;font-weight:700;color:rgba(0,0,0,0.25);white-space:nowrap;pointer-events:none;transform:translate(-50%,-50%);letter-spacing:0.3px">${code}</span>`, iconSize: [0, 0], iconAnchor: [0, 0] }),
          interactive: false,
        }).addTo(map)
      }
    })

    map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 10 })
    mapRef.current = map; layerRef.current = layer
    return () => { map.remove(); mapRef.current = null; layerRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData])

  useEffect(() => {
    if (!layerRef.current) return
    const target = clickedRegion?.code || selected?.code
    layerRef.current.eachLayer((ly: any) => {
      const c = ly.feature?.properties?.code as string
      const h = c === target
      ly.setStyle({ fillOpacity: h ? 0.92 : 0.7, color: h ? '#C41E3A' : '#cbd5e1', weight: h ? 2.5 : 1.2 })
    })
  }, [clickedRegion, selected])

  const hoveredRegion = hoveredCode ? regions.find(r => r.code === hoveredCode) : null
  const incParty = clickedRegion?.candidates?.find(c => c.role === 'penyandang')?.party
  const flagSrc = incParty ? PARTY_FLAGS[incParty] : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {hoveredRegion && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          left: tooltipPos.x + 14 + 'px', top: tooltipPos.y - 12 + 'px',
          background: '#fff', color: '#1e293b', padding: '10px 16px', borderRadius: '10px',
          fontSize: '0.85rem', fontWeight: 500, border: '1px solid #e2e8f0',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)', lineHeight: 1.4, whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{hoveredRegion.code} — {hoveredRegion.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            {hoveredRegion.candidates?.find(c => c.role === 'penyandang')?.party || 'Tiada data'}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <h2 className="font-serif text-[15px] font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Peta Kawasan
        </h2>
        <span className="text-[11px] text-gray-400">{regions.length} DUN · Klik untuk detail</span>
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '400px', position: 'relative' }} />

      {clickedRegion && (
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            {flagSrc && <img src={flagSrc} alt={incParty || ''} className="w-8 h-auto rounded object-cover border border-gray-300" />}
            <div>
              <span className="font-bold text-[14px] text-gray-800">{clickedRegion.code}</span>
              <span className="text-gray-500 mx-1.5">—</span>
              <span className="font-medium text-[13px] text-gray-700">{clickedRegion.name}</span>
              {incParty && <span className={`ml-2 text-[11px] font-bold ${PARTY_COLORS[incParty] || 'text-gray-500'}`}>({incParty})</span>}
            </div>
          </div>
          <button onClick={() => setClickedRegion(null)} className="text-[11px] text-gray-400 hover:text-gray-600 font-medium">Tutup ✕</button>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
        {Object.entries(partyColors).map(([party, c]) => {
          const count = regions.filter(r => r.candidates?.find(x => x.role === 'penyandang')?.party === party).length
          if (!count) return null
          return (
            <div key={party} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-medium text-gray-600">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
              {party} <span className="text-gray-400">{count}</span>
            </div>
          )
        })}
      </div>

      <style jsx global>{`
        .leaflet-control-zoom { border: none !important; display: flex !important; flex-direction: column !important; gap: 4px !important; }
        .leaflet-control-zoom a { background: #fff !important; color: #64748b !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; width: 34px !important; height: 34px !important; line-height: 34px !important; font-size: 16px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; }
        .leaflet-control-zoom a:hover { background: #f8fafc !important; color: #0f172a !important; }
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  )
})

export default ElectionMap
