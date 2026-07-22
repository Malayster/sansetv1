'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionWithData } from '@/types/election'

// === Roblox Cartoon Palette (bold, saturated, kid-friendly) ===
const partyColors: Record<string, string> = {
  BN: '#4FC3F7', PH: '#FF6B6B', PN: '#81C784', GPS: '#FFD54F',
  WARISAN: '#7986CB', GRS: '#FF8A65', Bebas: '#B0BEC5',
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
      return partyColors[winner.party] || '#CE93D8'
    }
    return '#CFD8DC'
  }
  if (r.sentiment?.score != null) {
    const s = r.sentiment.score
    if (s >= 60) return '#81C784'
    if (s >= 40) return '#FFD54F'
    return '#FF6B6B'
  }
  return '#CFD8DC'
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

  // Initialise Leaflet map — NO tiles, just solid background
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

    // Set solid pastel background (no tiles)
    const bgDiv = document.createElement('div')
    bgDiv.style.cssText = 'position:absolute;inset:0;background:#bae8ff;z-index:-1'
    containerRef.current.appendChild(bgDiv)

    // Custom zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const geoJsonLayer = L.geoJSON(geoData, {
      style: (feature) => {
        const code = feature?.properties?.code as string
        const fill = colorMap[code] || '#CFD8DC'
        return {
          fillColor: fill,
          fillOpacity: 1,
          color: '#000',
          weight: 5,
          opacity: 1,
          lineJoin: 'round',
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
            color: '#000',
            weight: 6,
          })
        })

        pathLayer.on('mousemove', (e: L.LeafletMouseEvent) => {
          setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
        })

        pathLayer.on('mouseout', () => {
          setHoveredCode(null)
          pathLayer.setStyle({ fillOpacity: 1, color: '#000', weight: 5 })
        })
      },
    }).addTo(map)

    // Add labels via Leaflet tooltips (always-on)
    geoJsonLayer.eachLayer((layer: any) => {
      const feature = layer.feature
      const code = feature?.properties?.code as string
      const name = feature?.properties?.name || code
      if (layer.getBounds) {
        const center = layer.getBounds().getCenter()
        const labelIcon = L.divIcon({
          className: 'cartoon-label',
          html: `<div class="cartoon-label-text">${code}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })
        L.marker(center, { icon: labelIcon, interactive: false }).addTo(map)
      }
    })

    map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20], maxZoom: 8 })
    mapRef.current = map
    layerRef.current = geoJsonLayer

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [geoData])

  // Update styles when selected changes
  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.setStyle(((feature: any) => {
      const code = feature?.properties?.code as string
      const fill = colorMap[code] || '#CFD8DC'
      return {
        fillColor: fill,
        fillOpacity: 1,
        color: '#000',
        weight: 5,
        opacity: 1,
        lineJoin: 'round',
      }
    }) as L.StyleFunction)
  }, [colorMap])

  const hoveredRegion = hoveredCode ? regions.find(r => r.code === hoveredCode) : null

  return (
    <div>
      {/* Tooltip */}
      {hoveredRegion && (
        <div style={{
          position: 'fixed', zIndex: 9999, pointerEvents: 'none',
          left: tooltipPos.x + 12 + 'px', top: tooltipPos.y - 10 + 'px',
          background: '#000', color: '#fff', padding: '6px 14px',
          borderRadius: '12px', fontFamily: "'Nunito', sans-serif",
          fontWeight: 900, fontSize: '0.85rem',
          border: '3px solid #fff', boxShadow: '4px 4px 0px #000',
        }}>
          {hoveredRegion.name}
        </div>
      )}

      {/* Map card */}
      <div style={{
        background: '#fff', border: '6px solid #000',
        boxShadow: '10px 10px 0px #000', borderRadius: '24px',
        overflow: 'hidden', maxWidth: '900px',
      }}>
        {/* Map panel */}
        <div style={{
          background: '#bae8ff', borderBottom: '6px solid #000',
          padding: '25px 25px 10px', position: 'relative', overflow: 'hidden',
        }}>
          <h2 style={{
            fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem',
            marginBottom: '12px', textShadow: '3px 3px 0px #fff',
            color: '#000', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            📍 Peta Kawasan PRU
          </h2>

          <div ref={containerRef} style={{ width: '100%', height: '480px', position: 'relative' }} />

          {/* Floating decorations */}
          <div style={{
            position: 'absolute', top: '15px', right: '20px',
            fontSize: '2rem', opacity: 0.6, pointerEvents: 'none',
            lineHeight: 1.4, textAlign: 'right',
          }}>
            ☁️<br />⭐<br />☁️
          </div>

          <div style={{
            fontWeight: 900, marginTop: '12px', padding: '10px',
            background: '#ffeaa7', border: '4px solid #000',
            borderRadius: '14px', textAlign: 'center',
            boxShadow: '4px 4px 0px #000', fontFamily: "'Nunito', sans-serif",
          }}>
            🖱️ Klik mana-mana kawasan untuk lihat maklumat
          </div>
        </div>

        {/* Info panel (shown when region selected) */}
        {clickedRegion && (
          <div style={{
            margin: '15px 25px', padding: '15px',
            background: '#fff', border: '5px solid #000',
            borderRadius: '16px', boxShadow: '5px 5px 0px #000',
            fontFamily: "'Nunito', sans-serif",
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem' }}>
                {clickedRegion.code} — {clickedRegion.name}
              </span>
              <span style={{
                width: '30px', height: '30px',
                border: '4px solid #000', borderRadius: '8px',
                display: 'inline-block',
                background: colorMap[clickedRegion.code] || '#CFD8DC',
              }} />
            </div>
            {clickedRegion.candidates?.[0] && (
              <p style={{ fontWeight: 700, marginTop: '8px', fontSize: '1rem' }}>
                {clickedRegion.candidates[0].party} · {clickedRegion.candidates[0].name}
              </p>
            )}
            <button onClick={() => setClickedRegion(null)} style={{
              marginTop: '10px', background: '#ff6b6b', border: '4px solid #000',
              borderRadius: '12px', padding: '6px 18px', fontWeight: 900,
              cursor: 'pointer', boxShadow: '3px 3px 0px #000',
              fontFamily: "'Nunito', sans-serif",
            }}>
              Tutup ✕
            </button>
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex', gap: '20px', justifyContent: 'center',
          flexWrap: 'wrap', padding: '15px 25px 20px',
          fontFamily: "'Nunito', sans-serif", fontWeight: 900,
        }}>
          {Object.entries(partyColors).slice(0, 5).map(([party, color]) => (
            <div key={party} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '24px', height: '24px',
                background: color, border: '3px solid #000', borderRadius: '6px',
                display: 'inline-block',
              }} />
              <span>{party}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cartoon label styles injected once */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');

        .cartoon-label {
          background: none !important;
          border: none !important;
        }
        .cartoon-label-text {
          font-family: 'Fredoka One', cursive;
          font-size: 11px;
          color: #000;
          text-shadow: 1px 1px 0px rgba(255,255,255,0.8);
          white-space: nowrap;
          pointer-events: none;
          transform: translate(-50%, -50%);
        }
        .leaflet-control-zoom a {
          background: #fff !important;
          color: #000 !important;
          border: 3px solid #000 !important;
          border-radius: 10px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 28px !important;
          font-size: 18px !important;
          font-weight: 900 !important;
          font-family: 'Nunito', sans-serif !important;
          box-shadow: 3px 3px 0px #000 !important;
          margin-bottom: 6px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #ffeaa7 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
        }
      `}</style>
    </div>
  )
})

export default ElectionMap
