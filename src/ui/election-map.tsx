'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionWithData } from '@/types/election'

// === n8n-inspired palette — muted, sophisticated, works on dark bg ===
const partyColors: Record<string, string> = {
  BN: '#60a5fa',    // blue-400
  PH: '#f87171',    // red-400
  PN: '#34d399',    // emerald-400
  GPS: '#fbbf24',   // amber-400
  WARISAN: '#a78bfa', // violet-400
  GRS: '#fb923c',   // orange-400
  Bebas: '#9ca3af',  // gray-400
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
      return partyColors[winner.party] || '#a78bfa'
    }
    return '#1e293b'
  }
  if (r.sentiment?.score != null) {
    const s = r.sentiment.score
    if (s >= 60) return '#34d399'
    if (s >= 40) return '#fbbf24'
    return '#f87171'
  }
  return '#1e293b'
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
  const selectedLayerRef = useRef<L.Path | null>(null)
  const [geoData, setGeoData] = useState<any>(null)
  const geoUrl = useMemo(() => `/geojson/${polygonPath(geoJsonFile)}`, [geoJsonFile])
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [clickedRegion, setClickedRegion] = useState<RegionWithData | null>(null)

  useEffect(() => {
    fetch(geoUrl).then(r => r.json()).then(setGeoData).catch(() => setGeoData(null))
  }, [geoUrl])

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
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
    })

    // Dark background (matching n8n deep bg)
    const bgDiv = document.createElement('div')
    bgDiv.style.cssText = 'position:absolute;inset:0;background:#0a0a0f;z-index:-1'
    containerRef.current.appendChild(bgDiv)

    // Subtle dot-grid overlay
    const gridDiv = document.createElement('div')
    gridDiv.style.cssText = `
      position:absolute;inset:0;z-index:-1;
      background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 24px 24px;
    `
    containerRef.current.appendChild(gridDiv)

    // Clean zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const geoJsonLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const code = feature?.properties?.code as string
        const fill = colorMap[code] || '#1e293b'
        return {
          fillColor: fill,
          fillOpacity: 0.65,
          color: 'rgba(255,255,255,0.12)',
          weight: 1.5,
          opacity: 1,
        }
      },
      onEachFeature: (feature, layer) => {
        const code = feature.properties.code as string
        const pathLayer = layer as L.Path

        pathLayer.on('click', (e: L.LeafletMouseEvent) => {
          const r = regions.find(x => x.code === code)
          if (r) {
            setClickedRegion(r)
            onSelect(r)
          }
        })

        pathLayer.on('mouseover', (e: L.LeafletMouseEvent) => {
          setHoveredCode(code)
          setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
          pathLayer.setStyle({
            fillOpacity: 0.85,
            color: 'rgba(255,255,255,0.6)',
            weight: 2,
          })
          pathLayer.bringToFront()
        })

        pathLayer.on('mousemove', (e: L.LeafletMouseEvent) => {
          setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
        })

        pathLayer.on('mouseout', () => {
          setHoveredCode(null)
          const isSelected = selected?.code === code || clickedRegion?.code === code
          if (isSelected) {
            pathLayer.setStyle({
              fillOpacity: 0.85,
              color: '#a78bfa',
              weight: 2.5,
            })
          } else {
            pathLayer.setStyle({
              fillOpacity: 0.65,
              color: 'rgba(255,255,255,0.12)',
              weight: 1.5,
            })
          }
        })
      },
    }).addTo(map)

    // Subtle labels on polygons
    geoJsonLayer.eachLayer((layer: any) => {
      const code = layer.feature?.properties?.code as string
      if (layer.getBounds) {
        const center = layer.getBounds().getCenter()
        const labelIcon = L.divIcon({
          className: 'n8n-label',
          html: `<span class="n8n-label-text">${code.replace('P', '')}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })
        L.marker(center, { icon: labelIcon, interactive: false }).addTo(map)
      }
    })

    map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20], maxZoom: 8 })
    mapRef.current = map
    layerRef.current = geoJsonLayer

    // If there was a pre-selected region, highlight it
    if (selected) {
      geoJsonLayer.eachLayer((layer: any) => {
        if (layer.feature?.properties?.code === selected.code) {
          selectedLayerRef.current = layer as L.Path
          layer.setStyle({ fillOpacity: 0.85, color: '#a78bfa', weight: 2.5 })
        }
      })
    }

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData])

  // Update highlight when selected or clickedRegion changes
  useEffect(() => {
    if (!layerRef.current) return
    const targetCode = clickedRegion?.code || selected?.code
    layerRef.current.eachLayer((layer: any) => {
      const code = layer.feature?.properties?.code as string
      const isHighlighted = code === targetCode
      layer.setStyle({
        fillOpacity: isHighlighted ? 0.85 : 0.65,
        color: isHighlighted ? '#a78bfa' : 'rgba(255,255,255,0.12)',
        weight: isHighlighted ? 2.5 : 1.5,
      })
    })
  }, [clickedRegion, selected])

  const hoveredRegion = hoveredCode ? regions.find(r => r.code === hoveredCode) : null

  return (
    <div>
      {/* Tooltip */}
      {hoveredRegion && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          left: tooltipPos.x + 14 + 'px', top: tooltipPos.y - 12 + 'px',
          background: 'rgba(15,15,25,0.95)', color: '#e2e8f0',
          padding: '8px 14px', borderRadius: '8px',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          fontWeight: 500, fontSize: '0.8rem',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          lineHeight: 1.4,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 600, color: '#fff', marginBottom: 2 }}>
            {hoveredRegion.code} — {hoveredRegion.name}
          </div>
          <div style={{ color: colorMap[hoveredRegion.code] || '#9ca3af', fontSize: '0.75rem' }}>
            {hoveredRegion.state}
            {hoveredRegion.candidates?.[0] && ` · ${hoveredRegion.candidates[0].party}`}
          </div>
        </div>
      )}

      {/* Map card */}
      <div style={{
        background: '#0d0d14',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
      }}>
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 style={{
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            fontSize: '1rem', fontWeight: 600, color: '#e2e8f0',
            display: 'flex', alignItems: 'center', gap: '10px',
            letterSpacing: '-0.01em',
            margin: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Peta Kawasan PRU
          </h2>
          <div style={{
            fontSize: '0.75rem', color: '#64748b',
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            fontWeight: 400, letterSpacing: '0.01em',
          }}>
            {regions.length} kawasan
          </div>
        </div>

        {/* Map container */}
        <div ref={containerRef} style={{ width: '100%', height: '500px', position: 'relative' }} />

        {/* Info bar */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          fontSize: '0.78rem', color: '#64748b',
        }}>
          <span>🖱️ Klik kawasan untuk lihat maklumat</span>
          {clickedRegion && (
            <span style={{ color: '#94a3b8' }}>
              Dipilih: <strong style={{ color: colorMap[clickedRegion.code] || '#a78bfa' }}>{clickedRegion.code}</strong>
            </span>
          )}
        </div>

        {/* Info panel (shown when region selected) */}
        {clickedRegion && (
          <div style={{
            margin: '0 24px 20px',
            padding: '20px',
            background: 'rgba(15,15,25,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: colorMap[clickedRegion.code] || '#1e293b',
                  display: 'inline-block', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.1)',
                }} />
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>
                    {clickedRegion.code} — {clickedRegion.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                    {clickedRegion.state}
                  </div>
                </div>
              </div>
              <button onClick={() => setClickedRegion(null)} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e2e8f0' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8' }}
              >
                Tutup
              </button>
            </div>
            {clickedRegion.candidates?.[0] && (
              <div style={{
                marginTop: '16px', padding: '12px 14px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `${colorMap[clickedRegion.code] || '#a78bfa'}20`,
                  border: `2px solid ${colorMap[clickedRegion.code] || '#a78bfa'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700,
                  color: colorMap[clickedRegion.code] || '#a78bfa',
                }}>
                  {clickedRegion.candidates[0].party.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.88rem' }}>
                    {clickedRegion.candidates[0].name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colorMap[clickedRegion.code] || '#a78bfa' }}>
                    {clickedRegion.candidates[0].party}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex', gap: '6px', justifyContent: 'center',
          flexWrap: 'wrap', padding: '0 24px 20px',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        }}>
          {Object.entries(partyColors).map(([party, color]) => (
            <div key={party} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '20px',
              fontSize: '0.72rem', fontWeight: 500,
              color: '#94a3b8',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '2px',
                background: color, display: 'inline-block',
              }} />
              {party}
            </div>
          ))}
        </div>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .n8n-label {
          background: none !important;
          border: none !important;
        }
        .n8n-label-text {
          font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          white-space: nowrap;
          pointer-events: none;
          transform: translate(-50%, -50%);
          letter-spacing: 0.02em;
        }
        .leaflet-control-zoom {
          border: none !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
        }
        .leaflet-control-zoom a {
          background: rgba(15,15,25,0.85) !important;
          color: #94a3b8 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 8px !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          font-size: 16px !important;
          font-weight: 400 !important;
          text-align: center !important;
          backdrop-filter: blur(8px) !important;
          transition: all 0.15s !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(30,30,50,0.9) !important;
          color: #fff !important;
          border-color: rgba(167,139,250,0.3) !important;
        }
        /* Hide leaflet tile attribution */
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  )
})

export default ElectionMap
