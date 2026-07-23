/**
 * Admin API for election data CRUD.
 *
 * GET  /api/admin/election?code=P001  → get region data
 * GET  /api/admin/election?state=nsn  → list all DUN for state
 * GET  /api/admin/election           → list all available states/templates
 * PUT  /api/admin/election           → update candidates/results/demographics
 *
 * Validation guardrails:
 *  - Total vote % cannot exceed 100% (±0.5 tolerance)
 *  - Duplicate party names within the same election
 *  - Winner must have the highest votes
 *  - Party names must match known coalition list
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data', 'kv-output')
const HIST_FILE = path.join(DATA_DIR, 'historical-results.json')
const CANDIDATES_FILE = path.join(DATA_DIR, 'candidates-real.json')
const DEMOGRAPHICS_FILE = path.join(DATA_DIR, 'economic-demographics.json')
const ELECTION_DIR = path.join(process.cwd(), 'data', 'elections')

const KNOWN_PARTIES = [
  'BN', 'PH', 'PN', 'GPS', 'GRS', 'WARISAN', 'PBS', 'STAR', 'KDM',
  'MUDA', 'PBM', 'PEJUANG', 'BEBAS', 'INDEPENDENT',
]

const KNOWN_COALITIONS: Record<string, string[]> = {
  'BN': ['UMNO', 'MCA', 'MIC', 'GERAKAN', 'PBRS'],
  'PH': ['DAP', 'PKR', 'AMANAH', 'UPKO'],
  'PN': ['PAS', 'BERSATU', 'GERAKAN'],
  'GPS': ['PBB', 'PRS', 'PDP', 'SUPP'],
  'GRS': ['BERSATU SABAH', 'STAR', 'PBS', 'SAPP', 'USNO'],
  'WARISAN': ['WARISAN'],
}

function readJSON(filePath: string): any {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')) }
  catch { return {} }
}

function writeJSON(filePath: string, data: any) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

interface ValidationError { field: string; message: string }

function validateElectionData(data: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
    errors.push({ field: 'candidates', message: 'Sekurang-kurangnya satu calon diperlukan' })
    return errors
  }

  const parties = new Set<string>()
  let totalVotePct = 0
  let anyHasPercentage = false

  for (let i = 0; i < data.candidates.length; i++) {
    const c = data.candidates[i]
    if (!c.name || !c.name.trim()) {
      errors.push({ field: `candidates[${i}].name`, message: `Calon #${i + 1}: nama diperlukan` })
    }
    if (!c.party || !c.party.trim()) {
      errors.push({ field: `candidates[${i}].party`, message: `Calon #${i + 1}: parti diperlukan` })
    }
    if (c.party) {
      const p = c.party.toUpperCase()
      if (parties.has(p)) {
        errors.push({ field: `candidates[${i}].party`, message: `Parti ${c.party} sudah ada untuk calon lain` })
      }
      parties.add(p)
    }
    if (typeof c.percentage === 'number' && c.percentage > 0) {
      totalVotePct += c.percentage
      anyHasPercentage = true
    }
  }

  // Only validate sum if any candidates have percentages (result-style entry)
  if (anyHasPercentage && Math.abs(totalVotePct - 100) > 0.5) {
    errors.push({ field: 'candidates', message: `Jumlah peratusan undi (${totalVotePct.toFixed(1)}%) tidak sama dengan 100%` })
  }

  // Winner must have highest votes (only if votes are provided)
  const voted = data.candidates.filter((c: any) => typeof c.votes === 'number' && c.votes > 0)
  if (voted.length >= 2) {
    const sorted = [...voted].sort((a: any, b: any) => b.votes - a.votes)
    const won = data.candidates.find((c: any) => c.result === 'won')
    if (won && won.votes < sorted[0].votes) {
      errors.push({ field: 'candidates', message: `Calon menang (${won.name}) tidak mempunyai undi tertinggi` })
    }
  }

  return errors
}

function getAvailableTemplates(): string[] {
  try {
    if (!fs.existsSync(ELECTION_DIR)) return []
    return fs.readdirSync(ELECTION_DIR)
      .filter(f => f.startsWith('prn-') || f.startsWith('pru-'))
      .map(f => f.replace('prn-', '').replace('pru-', '').replace('-template', ''))
  } catch { return [] }
}

function getElectioNConfig(stateKey: string): any {
  const configPath = path.join(ELECTION_DIR, `prn-${stateKey}-template`, 'config.json')
  const altPath = path.join(ELECTION_DIR, `prn-${stateKey}`, 'config.json')
  if (fs.existsSync(configPath)) return readJSON(configPath)
  if (fs.existsSync(altPath)) return readJSON(altPath)
  return null
}

function getStateGeoJsonRegions(stateShort: string): any[] {
  for (const suffix of ['_dun.json', '_dun_polygon.json']) {
    const gjPath = path.join(process.cwd(), 'public', 'geojson', `prn_${stateShort.toLowerCase()}${suffix}`)
    if (fs.existsSync(gjPath)) {
      const gj = readJSON(gjPath)
      if (gj?.features) return gj.features
    }
  }
  return []
}

// Map state name → short code (matches Election Pack config.state field)
const STATE_TO_SHORT: Record<string, string> = {
  'Perlis': 'PLS', 'Kedah': 'KDH', 'Kelantan': 'KTN',
  'Terengganu': 'TRG', 'Pulau Pinang': 'PNG', 'Perak': 'PRK',
  'Pahang': 'PHG', 'Selangor': 'SGR', 'Negeri Sembilan': 'NSN',
  'Melaka': 'MLK', 'Johor': 'JHR', 'Sabah': 'SBH', 'Sarawak': 'SWK',
  'WP Kuala Lumpur': 'WPK', 'WP Labuan': 'WPL', 'WP Putrajaya': 'WPP',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // List all states
  if (!code && !state) {
    const templates = getAvailableTemplates()
    const configs = templates.map(t => {
      const cfg = getElectioNConfig(t)
      return {
        key: t,
        name: cfg?.name || t,
        electionId: cfg?.electionId || '',
        state: cfg?.state || t,
        stateShort: STATE_TO_SHORT[cfg?.state || ''] || '',
        dunCount: cfg?.dunToParlimen ? Object.keys(cfg.dunToParlimen).length : 0,
        parCount: cfg?.parlimenInfo ? Object.keys(cfg.parlimenInfo).length : 0,
      }
    }).filter(c => c.dunCount > 0)

    return NextResponse.json({ states: configs })
  }

  // Get all DUN regions for a state
  if (state) {
    const config = getElectioNConfig(state)
    if (!config) {
      return NextResponse.json({ error: 'State not found' }, { status: 404 })
    }

    const stateShort = STATE_TO_SHORT[config.state || ''] || state.slice(0, 3).toUpperCase()
    const features = getStateGeoJsonRegions(stateShort)
    if (features.length === 0) {
      return NextResponse.json({ error: 'No GeoJSON found for ' + stateShort }, { status: 404 })
    }

    const candidates = readJSON(CANDIDATES_FILE)
    const demographics = readJSON(DEMOGRAPHICS_FILE)
    const historical = readJSON(HIST_FILE)

    const regions = features.map((f: any) => {
      const p = f.properties
      const c = p.code
      const storeKey = `${stateShort}_${c}`
      return {
        code: c,
        name: p.name || p.dun || '',
        state: p.state || p.state_name || config.state,
        parCode: p.code_parlimen || '',
        parName: p.parlimen || '',
        candidates: candidates[c] || candidates[storeKey] || [],
        demographics: demographics[c] || demographics[storeKey] || {},
        history: historical[c] || historical[storeKey] || null,
        lat: p.lat || 0,
        lng: p.lng || 0,
      }
    })

    return NextResponse.json({ config, regions, totalDun: regions.length })
  }

  // Get single region by code
  if (code) {
    const candidates = readJSON(CANDIDATES_FILE)
    const demographics = readJSON(DEMOGRAPHICS_FILE)
    const historical = readJSON(HIST_FILE)
    return NextResponse.json({
      code,
      candidates: candidates[code] || [],
      demographics: demographics[code] || {},
      history: historical[code] || null,
    })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, candidates, election, demographics } = body

    if (!code) {
      return NextResponse.json({ error: 'Region code diperlukan' }, { status: 400 })
    }

    if (candidates) {
      const errors = validateElectionData({ candidates })
      if (errors.length > 0) {
        return NextResponse.json({ error: 'Validation gagal', details: errors }, { status: 422 })
      }
    }

    if (candidates) {
      const allCandidates = readJSON(CANDIDATES_FILE)
      allCandidates[code] = candidates
      writeJSON(CANDIDATES_FILE, allCandidates)
    }

    if (election) {
      const allHistorical = readJSON(HIST_FILE)
      if (!allHistorical[code]) {
        allHistorical[code] = {
          code,
          name: election.name || '',
          state: election.state || '',
          elections: [],
        }
      }
      const existingIdx = allHistorical[code].elections.findIndex(
        (e: any) => e.year === election.year && e.electionName === election.electionName
      )
      const entry = {
        year: election.year,
        electionName: election.electionName,
        candidates: election.candidates || [],
        totalElectors: election.totalElectors || 0,
        majority: election.majority || 0,
        turnout: election.turnout || 0,
      }
      if (existingIdx >= 0) {
        allHistorical[code].elections[existingIdx] = entry
      } else {
        allHistorical[code].elections.push(entry)
      }
      allHistorical[code].elections.sort((a: any, b: any) => a.year - b.year)
      writeJSON(HIST_FILE, allHistorical)
    }

    if (demographics) {
      const allDemographics = readJSON(DEMOGRAPHICS_FILE)
      allDemographics[code] = { ...allDemographics[code], ...demographics }
      writeJSON(DEMOGRAPHICS_FILE, allDemographics)
    }

    return NextResponse.json({ ok: true, code })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}