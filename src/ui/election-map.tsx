'use client'

import { memo, useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import type { RegionWithData } from '@/types/election'

const partyColors: Record<string, string> = {
  BN: '#000080', PH: '#E21118', PN: '#031F73', GPS: '#FFD700',
  WARISAN: '#1E90FF', GRS: '#FF4500', Bebas: '#808080',
}

function regionColor(r: RegionWithData): string {
  if (r.candidates && r.candidates.length > 0) {
    return partyColors[r.candidates[0].party] || '#C41E3A'
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
  const [geoUrl, setGeoUrl] = useState(`/geojson/${polygonPath(geoJsonFile)}`)
  const colorMap: Record<string, string> = {}
  for (const r of regions) colorMap[r.code] = regionColor(r)

  useEffect(() => {
    setGeoUrl(`/geojson/${polygonPath(geoJsonFile)}`)
  }, [geoJsonFile])

  // Compute center for the selected region's geo
  const allLngs = regions.map(r => r.lng)
  const allLats = regions.map(r => r.lat)
  const centerLng = (Math.min(...allLngs) + Math.max(...allLngs)) / 2
  const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2

  return (
    <div className="border border-gray-200 bg-white rounded overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [centerLng, centerLat], scale: regions.length <= 36 ? 2800 : 800 }}
        style={{ width: '100%', height: '500px' }}
      >
        <ZoomableGroup zoom={1} maxZoom={4}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = geo.properties.code as string
                const isSel = selected?.code === code
                const fill = colorMap[code] || '#94a3b8'
                return (
                  <Geography
                    key={code}
                    geography={geo}
                    fill={fill}
                    stroke={isSel ? '#000' : '#fff'}
                    strokeWidth={isSel ? 1.5 : 0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#C41E3A', outline: 'none', cursor: 'pointer' },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => {
                      const region = regions.find(r => r.code === code)
                      if (region) onSelect(region)
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

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
