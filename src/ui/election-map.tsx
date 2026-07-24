'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const lastElection = r.history?.elections?.filter(e => e.winnerParty).slice(-1)[0]
  if (lastElection?.winnerParty) return partyColors[lastElection.winnerParty] || '#6b7280'
  return '#e5e7eb'
}

function polygonPath(f: string): string {
  return f.replace('.json', '_polygon.json')
}

/** Unique years from history for historical coloring */
function getAvailableYears(regions: RegionWithData[]): number[] {
  const years = new Set<number>()
  for (const r of regions) {
    for (const e of r.history?.elections || []) {
      if (e.year) years.add(e.year)
    }
  }
  return Array.from(years).sort((a, b) => b - a)
}

const HOT_THRESHOLDS: Record<string, { color: string; label: string }> = {
  sangat_panas: { color: '#DC2626', label: 'Sangat Panas' },
  panas: { color: '#F97316', label: 'Panas' },
  marginal: { color: '#FBBF24', label: 'Marginal' },
  selamat: { color: '#22C55E', label: 'Selamat' },
}

const ElectionMap = memo(function ElectionMap({
  regions, selected, onSelect, geoJsonFile, activeYear,
}: {
  regions: RegionWithData[]; selected: RegionWithData | null; onSelect: (r: RegionWithData) => void; geoJsonFile: string; activeYear?: number | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.GeoJSON | null>(null)
  const codeLabelsRef = useRef<L.Marker[]>([])
  const [geoData, setGeoData] = useState<any>(null)
  const geoUrl = useMemo(() => `/geojson/${polygonPath(geoJsonFile)}`, [geoJsonFile])
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [clickedRegion, setClickedRegion] = useState<RegionWithData | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'party' | 'hotseat'>('party')
  const [selectedParty, setSelectedParty] = useState<string | null>(null)

  useEffect(() => { fetch(geoUrl).then(r => r.json()).then(setGeoData).catch(() => setGeoData(null)) }, [geoUrl])

  const availableYears = useMemo(() => getAvailableYears(regions), [regions])
  const [histYear, setHistYear] = useState<number | null>(null)

  // Reset clicked when regions change (state switch)
  useEffect(() => { setClickedRegion(null); setSearch('') }, [geoJsonFile])

  const colorMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const r of regions) {
      if (viewMode === 'party') {
        m[r.code] = regionColor(r, histYear)
      } else {
        // Hot seat coloring
        const hs = (r.history as any)?._hotSeat
        const c = HOT_THRESHOLDS[hs as string]
        m[r.code] = c?.color || '#e5e7eb'
      }
    }
    return m
  }, [regions, histYear, viewMode])

  // Filter regions by search + party
  const filteredCodes = useMemo(() => {
    let filtered = regions
    if (search) {
      const q = search.toUpperCase()
      filtered = filtered.filter(r => r.code.toUpperCase().includes(q) || r.name.toUpperCase().includes(q))
    }
    if (selectedParty) {
      filtered = filtered.filter(r => {
        const inc = r.candidates?.find(c => c.role === 'penyandang')
        const party = inc?.party || r.history?.elections?.slice().reverse().find(e => e.winnerParty)?.winnerParty
        return party === selectedParty
      })
    }
    return new Set(filtered.map(r => r.code))
  }, [regions, search, selectedParty])

  // Style function that respects filter
  const getStyle = useCallback((f: any) => {
    const code = f?.properties?.code as string
    const isFiltered = filteredCodes.has(code)
    const baseColor = colorMap[code] || '#f3f4f6'
    return {
      fillColor: baseColor,
      fillOpacity: isFiltered ? 0.7 : 0.2,
      color: isFiltered ? '#cbd5e1' : '#e5e7eb',
      weight: isFiltered ? 1.2 : 0.5,
    }
  }, [colorMap, filteredCodes])

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
      style: getStyle,
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
          p.setStyle({ fillOpacity: 0.92, color: '#C41E3A', weight: 2.5 })
          p.bringToFront()
        })
        p.on('mousemove', (e: L.LeafletMouseEvent) => setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY }))
        p.on('mouseout', () => {
          setHoveredCode(null)
          const sel = selected?.code === code || clickedRegion?.code === code
          p.setStyle({
            fillOpacity: sel ? 0.92 : (filteredCodes.has(code) ? 0.7 : 0.2),
            color: sel ? '#C41E3A' : (filteredCodes.has(code) ? '#cbd5e1' : '#e5e7eb'),
            weight: sel ? 2.5 : (filteredCodes.has(code) ? 1.2 : 0.5),
          })
        })
      },
    }).addTo(map)

    // Code labels
    const labels: L.Marker[] = []
    layer.eachLayer((ly: any) => {
      const code = ly.feature?.properties?.code as string
      if (ly.getBounds) {
        const c = ly.getBounds().getCenter()
        const m = L.marker(c, {
          icon: L.divIcon({
            className: '',
            html: `<span style="font-family:Inter,sans-serif;font-size:8px;font-weight:700;color:rgba(0,0,0,0.25);white-space:nowrap;pointer-events:none;transform:translate(-50%,-50%);letter-spacing:0.3px">${code}</span>`,
            iconSize: [0, 0], iconAnchor: [0, 0],
          }),
          interactive: false,
        }).addTo(map)
        labels.push(m)
      }
    })
    codeLabelsRef.current = labels

    map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 10 })
    mapRef.current = map; layerRef.current = layer
    return () => { map.remove(); mapRef.current = null; layerRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData])

  // Update styles when colorMap/filteredCodes changes
  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.eachLayer((ly: any) => {
      const code = ly.feature?.properties?.code as string
      const h = code === clickedRegion?.code || code === selected?.code
      ly.setStyle({
        fillColor: colorMap[code] || '#f3f4f6',
        fillOpacity: h ? 0.92 : (filteredCodes.has(code) ? 0.7 : 0.2),
        color: h ? '#C41E3A' : (filteredCodes.has(code) ? '#cbd5e1' : '#e5e7eb'),
        weight: h ? 2.5 : (filteredCodes.has(code) ? 1.2 : 0.5),
      })
    })
  }, [colorMap, filteredCodes, clickedRegion, selected])

  const hoveredRegion = hoveredCode ? regions.find(r => r.code === hoveredCode) : null
  const incParty = clickedRegion?.candidates?.find(c => c.role === 'penyandang')?.party
  const flagSrc = incParty ? PARTY_FLAGS[incParty] : null
  const hotSeat = clickedRegion ? (clickedRegion.history as any)?._hotSeatLabel : null

  return (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    {/* ═══ Enhanced Tooltip ═══ */}
    {hoveredRegion && (
      <div style={{
        position: 'fixed', zIndex: 9999, pointerEvents: 'none',
        left: tooltipPos.x + 14 + 'px', top: tooltipPos.y - 12 + 'px',
        background: '#fff', color: '#1e293b', padding: '10px 16px', borderRadius: '10px',
        fontSize: '0.85rem', fontWeight: 500, border: '1px solid #e2e8f0',
        boxShadow: '0 12px 32px rgba(0,0,0,0.12)', lineHeight: 1.4, whiteSpace: 'nowrap',
      }}>
        <div style={{ fontWeight: 600, color: '#0f172a' }}>{hoveredRegion.code} — {hoveredRegion.name}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          {(() => {
            const inc = hoveredRegion.candidates?.find(c => c.role === 'penyandang')
            if (inc) {
              return <><span style={{ fontWeight: 600, color: partyColors[inc.party] || '#64748b' }}>{inc.party}</span> · {inc.name}</>
            }
            const last = hoveredRegion.history?.elections?.filter(e => e.winnerParty).slice(-1)[0]
            return last ? <><span style={{ fontWeight: 600 }}>{last.winnerParty}</span> · {last.winner}</> : 'Tiada data'
          })()}
        </div>
        {(() => {
          const hs = (hoveredRegion.history as any)?._hotSeatLabel
          if (hs) return <div style={{ fontSize:'0.65rem', marginTop:3, color:'#DC2626' }}>{hs}</div>
        })()}
      </div>
    )}

    {/* ═══ Map Controls Bar ═══ */}
    <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#C41E3A] via-[#FFC107] to-[#1a1a1a] flex-wrap">
      <h2 className="font-serif text-[13px] font-bold text-white flex items-center gap-1.5 mr-auto">
        <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Peta
      </h2>

      {/* Search — full width on mobile */}
      <div className="relative order-last sm:order-none w-full sm:w-auto mt-1 sm:mt-0">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari DUN..."
          className="w-full sm:w-[160px] text-[11px] px-2.5 py-1.5 border border-white/20 rounded-lg bg-white/10 focus:bg-white/20 focus:ring-1 focus:ring-white/50 focus:border-white/50 outline-none text-white placeholder:text-white/50"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-[10px]">✕</button>}
      </div>

      {/* View mode toggle */}
      <div className="flex bg-white/20 rounded p-0.5">
        <button onClick={() => setViewMode('party')}
          className={`px-2 py-1 text-[9px] font-medium rounded transition-all ${viewMode === 'party' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-white/80 hover:text-white'}`}
        >Parti</button>
        <button onClick={() => setViewMode('hotseat')}
          className={`px-2 py-1 text-[9px] font-medium rounded transition-all ${viewMode === 'hotseat' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-white/80 hover:text-white'}`}
        >🔥</button>
      </div>

      {viewMode === 'party' && availableYears.length > 0 && (
        <select value={histYear || ''} onChange={e => setHistYear(e.target.value ? Number(e.target.value) : null)}
          className="text-[10px] border border-white/20 rounded px-2 py-1 bg-white/10 text-white max-w-[100px]"
        >
          <option value="">Penyandang</option>
          {availableYears.map(y => <option key={y} value={y}>PRN {y}</option>)}
        </select>
      )}
    </div>

    {/* Map container */}
    <div ref={containerRef} style={{ width: '100%', height: '400px', position: 'relative' }} />

    {/* ═══ Clicked Region Detail Bar ═══ */}
    {clickedRegion && (
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3 min-w-0">
          {flagSrc && <img src={flagSrc} alt={incParty || ''} className="w-8 h-auto rounded object-cover border border-gray-300 shrink-0" />}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-gray-800">{clickedRegion.code}</span>
              <span className="text-gray-500">—</span>
              <span className="font-medium text-[13px] text-gray-700 truncate">{clickedRegion.name}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
              {incParty && <span className={`font-bold ${PARTY_COLORS[incParty] || 'text-gray-500'}`}>{incParty}</span>}
              {hotSeat && <span className="text-red-600 font-medium">{hotSeat}</span>}
              <span>{clickedRegion.demographics.totalElectors?.toLocaleString() || '—'} pengundi</span>
            </div>
          </div>
        </div>
        <button onClick={() => setClickedRegion(null)} className="text-[11px] text-gray-400 hover:text-gray-600 font-medium shrink-0 ml-2">Tutup ✕</button>
      </div>
    )}

    {/* ═══ Legend — Click to Filter by Party ═══ */}
    <div className="border-t border-gray-100 bg-gray-50/30">
      <div className="px-4 pt-2 pb-2">
        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Klik parti untuk tapis</span>
      </div>
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {/* All button */}
        <button onClick={() => { setSelectedParty(null); setSearch('') }}
          className={`flex items-center gap-1 px-2.5 py-1 border rounded-full text-[10px] font-medium transition-all ${
            !selectedParty ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
          }`}
        >
          Semua <span className="opacity-70">{regions.length}</span>
        </button>
        {Object.entries(partyColors).map(([partyKey, c]) => {
          const count = regions.filter(r => {
            const inc = r.candidates?.find(x => x.role === 'penyandang')
            const p = inc?.party || r.history?.elections?.filter(e => e.winnerParty).slice(-1)[0]?.winnerParty
            return p === partyKey
          }).length
          if (!count) return null
          const isActive = selectedParty === partyKey
          return (
            <button key={partyKey} onClick={() => setSelectedParty(isActive ? null : partyKey)}
              className={`flex items-center gap-1 px-2.5 py-1 border rounded-full text-[10px] font-medium transition-all ${
                isActive ? 'border-gray-800 text-gray-800 bg-gray-100' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
              {partyKey} <span className="text-gray-400">{count}</span>
            </button>
          )
        })}
      </div>
      {/* Hotseat legend */}
      {viewMode === 'hotseat' && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {Object.entries(HOT_THRESHOLDS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1 text-[9px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: val.color }} />
              {val.label}
            </div>
          ))}
        </div>
      )}
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
