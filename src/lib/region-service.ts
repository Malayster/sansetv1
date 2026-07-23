/**
 * RegionService — unified API layer for DUN ↔ Parlimen data
 *
 * Architecture (Pilihan Bijak):
 *   1. Election Pack (file-based config in data/elections/{id}/)
 *   2. JSON adapter (reads kv-output/*.json)
 *   3. Future: Sanity adapter via same interface
 *
 * Usage:
 *   const svc = new RegionService('prn-ns-2026')
 *   const duns = await svc.getRegions('dun')
 *   const parlimen = await svc.getRegions('parlimen')
 */

import fs from 'fs'
import path from 'path'
import realHistoricalResults from '../../data/kv-output/historical-results.json'
import realDemographicsData from '../../data/kv-output/demographics-real.json'
import realCandidatesData from '../../data/kv-output/candidates-real.json'
import type { RegionWithData, CandidateData, HistoricalElectionResult } from '@/types/election'

// ─── Types ─────────────────────────────────────────────

export interface ElectionPackConfig {
  electionId: string
  name: string
  level: 'dun' | 'parlimen'
  parentLevel?: 'parlimen'
  geoJson: string
  state: string
  dunToParlimen: Record<string, string>
  parlimenInfo: Record<string, { name: string; dunCount: number }>
  demographicsSource: string
  createdAt: string
  dataSources: Record<string, string>
}

export interface ParlimenAggregated {
  code: string           // P126
  name: string           // Jelebu
  state: string
  dunCount: number
  duns: string[]         // ['N01','N02','N03','N04']
  dominantParty: string
  seatCounts: Record<string, number>
  candidates: CandidateData[]
  demographics: RegionWithData['demographics']
  history?: { elections: HistoricalElectionResult[] }
}

// ─── Service ───────────────────────────────────────────

export class RegionService {
  private config: ElectionPackConfig | null = null

  constructor(private electionId: string) {}

  /** Load config file from data/elections/{id}/config.json */
  async loadConfig(): Promise<ElectionPackConfig> {
    if (this.config) return this.config
    const fp = path.join(process.cwd(), 'data', 'elections', this.electionId, 'config.json')
    const raw = fs.readFileSync(fp, 'utf-8')
    this.config = JSON.parse(raw) as ElectionPackConfig
    return this.config
  }

  /** Load regions with candidates, history, demographics for this election */
  async loadRegions(): Promise<RegionWithData[]> {
    const cfg = await this.loadConfig()
    const geoFile = cfg.geoJson.replace('.json', '_polygon.json')
    const geoPath = path.join(process.cwd(), 'public', 'geojson', geoFile)
    const raw = fs.readFileSync(geoPath, 'utf-8')
    const data = JSON.parse(raw)

    const candidatesMap = realCandidatesData as Record<string, CandidateData[]>
    const histMap = realHistoricalResults as Record<string, { elections: HistoricalElectionResult[] }>
    const demoMap = realDemographicsData as Record<string, any>

    return data.features.map((f: any) => {
      const code: string = f.properties.code
      const parlCode = cfg.dunToParlimen[code] || code
      const parlDemo = demoMap[parlCode]
      const dunCount = cfg.parlimenInfo[parlCode]?.dunCount || 1

      return {
        code,
        name: f.properties.name,
        state: f.properties.state || cfg.state,
        lat: f.properties.lat ?? 0,
        lng: f.properties.lng ?? 0,
        candidates: candidatesMap[code] || [],
        sentiment: null,
        demographics: {
          malay: parlDemo?.malay ?? 55,
          chinese: parlDemo?.chinese ?? 25,
          indian: parlDemo?.indian ?? 12,
          others: parlDemo?.others ?? 5,
          medianIncome: parlDemo?.medianIncome,
          gini: parlDemo?.gini,
          poverty: parlDemo?.poverty,
          totalElectors: parlDemo?.totalElectors
            ? Math.round(parlDemo.totalElectors / dunCount)
            : undefined,
          maleElectors: parlDemo?.maleElectors
            ? Math.round(parlDemo.maleElectors / dunCount)
            : undefined,
          femaleElectors: parlDemo?.femaleElectors
            ? Math.round(parlDemo.femaleElectors / dunCount)
            : undefined,
        },
        history: histMap[code],
      }
    })
  }

  /** Get regions at specified level */
  async getRegions(level: 'dun' | 'parlimen'): Promise<RegionWithData[]> {
    const duns = await this.loadRegions()
    if (level === 'dun') return duns
    return this.aggregateToParliament(duns)
  }

  /** Aggregate DUN-level data → Parliament-level */
  private aggregateToParliament(duns: RegionWithData[]): RegionWithData[] {
    const cfg = this.config!
    const groups = new Map<string, RegionWithData & { _dunCount: number }>()

    for (const dun of duns) {
      const parlCode = cfg.dunToParlimen[dun.code]
      if (!parlCode) continue

      if (!groups.has(parlCode)) {
        const info = cfg.parlimenInfo[parlCode]
        groups.set(parlCode, {
          code: parlCode,
          name: info?.name || parlCode,
          state: dun.state,
          lat: dun.lat,
          lng: dun.lng,
          candidates: [],
          sentiment: null,
          demographics: { ...dun.demographics },
          history: undefined as any,
          _dunCount: 0,
        })
      }

      const g = groups.get(parlCode)!
      g._dunCount++
      g.candidates.push(...dun.candidates)
    }

    return Array.from(groups.values()).map(g => {
      // Dominant party = party with most seats (penyandang)
      const seatCounts: Record<string, number> = {}
      for (const c of g.candidates) {
        if (c.role === 'penyandang') {
          seatCounts[c.party] = (seatCounts[c.party] || 0) + 1
        }
      }
      const sorted = Object.entries(seatCounts).sort(([, a], [, b]) => b - a)
      const dominantParty = sorted[0]?.[0] || ''

      // Add _parlCode marker for chart grouping
      const demo = g.demographics as any
      demo._parlCode = g.code
      demo._dunCount = g._dunCount
      demo._dominantParty = dominantParty

      return {
        ...g,
        _dunCount: undefined,
      }
    }).sort((a, b) => a.code.localeCompare(b.code))
  }
}
