#!/usr/bin/env node
/**
 * sync-electiondata.mjs
 *
 * Sync election data from ElectionData.MY API (api.electiondata.my/v1) into
 * the local JSON ledgers used by the dashboard:
 *
 *   data/kv-output/historical-results.json   ← seat + lineage (winner per election)
 *   data/kv-output/electiondata-ballots.json ← full ballot per contest (calon + undi)
 *
 * Data flow:
 *   1. GET /v1/seats/dropdown              → all 822 seats (222 parlimen + 600 DUN)
 *   2. For each seat slug:
 *      GET /v1/seats/results?slug=...&lineage=true → seat history (winners only)
 *   3. For each (seat, state, date) in history:
 *      GET /v1/results?seat=&state=&date=  → full ballot (calon + undi)
 *
 * Auth:  Bearer token in ELECTIONDATA_API_KEY env var.
 * Rate:  No rate limit, but we sleep 50ms between requests to be nice.
 *
 * Usage:
 *   ELECTIONDATA_API_KEY=edmy_...  node scripts/sync-electiondata.mjs
 *   ELECTIONDATA_API_KEY=edmy_...  node scripts/sync-electiondata.mjs --state Selangor
 *   ELECTIONDATA_API_KEY=edmy_...  node scripts/sync-electiondata.mjs --type dun
 *   ELECTIONDATA_API_KEY=edmy_...  node scripts/sync-electiondata.mjs --seats 5     (limit for testing)
 *   ELECTIONDATA_API_KEY=edmy_...  node scripts/sync-electiondata.mjs --no-ballots   (skip slow /results calls)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const KV_OUT = path.join(ROOT, 'data', 'kv-output')
const HIST_FILE = path.join(KV_OUT, 'historical-results.json')
const BALLOTS_FILE = path.join(KV_OUT, 'electiondata-ballots.json')
const SEATS_FILE = path.join(KV_OUT, 'electiondata-seats.json')

const API_BASE = 'https://api.electiondata.my/v1'
const API_KEY = process.env.ELECTIONDATA_API_KEY

if (!API_KEY) {
  console.error('✗ ELECTIONDATA_API_KEY env var required.')
  process.exit(1)
}

const SLEEP_MS = 50
const args = process.argv.slice(2)
function arg(name) {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : null
}
const FILTER_STATE = arg('state')   // e.g. "Selangor"
const FILTER_TYPE = arg('type')      // "parlimen" | "dun"
const SEAT_LIMIT = arg('seats') ? parseInt(arg('seats'), 10) : null
const NO_BALLOTS = args.includes('--no-ballots')

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function api(endpoint) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      })
      if (res.status === 429) {
        const wait = 1000 * attempt
        console.warn(`  ⏳ 429, waiting ${wait}ms`)
        await sleep(wait)
        continue
      }
      const text = await res.text()
      if (!res.ok) {
        if (res.status === 404) return null
        throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 200)}`)
      }
      return JSON.parse(text)
    } catch (e) {
      if (attempt === 4) throw e
      await sleep(500 * attempt)
    }
  }
}

// ─── STATE_NAME → SHORT (matches route.ts STATE_TO_SHORT) ───
const STATE_TO_SHORT = {
  Perlis: 'PLS', Kedah: 'KDH', Kelantan: 'KTN',
  Terengganu: 'TRG', 'Pulau Pinang': 'PNG', Perak: 'PRK',
  Pahang: 'PHG', Selangor: 'SGR', 'Negeri Sembilan': 'NSN',
  Melaka: 'MLK', Johor: 'JHR', Sabah: 'SBH', Sarawak: 'SWK',
  'W.P. Kuala Lumpur': 'WPK', 'W.P. Labuan': 'WPL', 'W.P. Putrajaya': 'WPP',
}

/** Parse "P.001 Padang Besar, Perlis" → { code: 'P001', name: 'Padang Besar', state: 'Perlis' } */
function parseSeat(seatStr) {
  // Format: "P.001 Padang Besar, Perlis"  or  "N.01 Ayer Hangat, Kedah"
  const m = seatStr.match(/^([PN])\.0*(\d+)\s+(.+?),\s*(.+)$/)
  if (!m) return null
  const [, type, num, name, state] = m
  const code = `${type}${num.padStart(type === 'P' ? 3 : 2, '0')}`
  return { code, name, state: state.trim() }
}

/** Convert slug → store key. "p001-padang-besar-perlis" → "PLS_P001"; "n01-ayer-hangat-kedah" → "KDH_N01" */
function seatToStoreKey(seatStr) {
  const parsed = parseSeat(seatStr)
  if (!parsed) return null
  const short = STATE_TO_SHORT[parsed.state]
  if (!short) return null
  return `${short}_${parsed.code}`
}

// ─── MAIN ──────────────────────────────────────────────────
async function main() {
  console.log('══════════════════════════════════════════════════')
  console.log('  ElectionData.MY → local JSON sync')
  console.log('══════════════════════════════════════════════════')
  if (FILTER_STATE) console.log(`  Filter state:  ${FILTER_STATE}`)
  if (FILTER_TYPE)  console.log(`  Filter type:   ${FILTER_TYPE}`)
  if (SEAT_LIMIT)   console.log(`  Seat limit:    ${SEAT_LIMIT}`)
  if (NO_BALLOTS)   console.log(`  Skipping full ballots (--no-ballots)`)
  console.log('')

  // Step 1: Load seats dropdown
  console.log('▶ Step 1: Fetching seats dropdown...')
  const dropdown = await api('/seats/dropdown')
  if (!dropdown?.seats) {
    console.error('✗ Failed to fetch dropdown', dropdown)
    process.exit(1)
  }
  fs.writeFileSync(SEATS_FILE, JSON.stringify(dropdown, null, 2))
  console.log(`  Saved ${dropdown.seats.length} seats → ${path.relative(ROOT, SEATS_FILE)}`)

  let seats = dropdown.seats
  if (FILTER_TYPE) seats = seats.filter(s => s.type === FILTER_TYPE)
  if (FILTER_STATE) seats = seats.filter(s => s.seat.endsWith(`, ${FILTER_STATE}`))
  if (SEAT_LIMIT) seats = seats.slice(0, SEAT_LIMIT)

  const nPara = seats.filter(s => s.type === 'parlimen').length
  const nDun = seats.filter(s => s.type === 'dun').length
  console.log(`  Will sync ${seats.length} seats (${nPara} parlimen, ${nDun} DUN)`)

  // Load existing ledger so we merge rather than overwrite
  const historical = fs.existsSync(HIST_FILE)
    ? JSON.parse(fs.readFileSync(HIST_FILE, 'utf8'))
    : {}
  const ballotsRaw = fs.existsSync(BALLOTS_FILE)
    ? JSON.parse(fs.readFileSync(BALLOTS_FILE, 'utf8'))
    : {}
  const contestsFetched = new Set(Object.keys(ballotsRaw))

  let seatsOK = 0, seatsSkip = 0
  let ballotsFetchCount = 0, ballotsCacheHits = 0

  // Step 2: Per-seat seat history (winners only, with lineage)
  console.log('\n▶ Step 2: Fetching seat histories (lineage=true)...')
  for (let i = 0; i < seats.length; i++) {
    const s = seats[i]
    const key = seatToStoreKey(s.seat)
    if (!key) {
      console.warn(`  ✗ Cannot parse seat: "${s.seat}"`)
      seatsSkip++
      continue
    }
    const parsed = parseSeat(s.seat)
    process.stdout.write(`  [${i + 1}/${seats.length}] ${key} ${parsed.name} (${s.type})... `)

    let seatResults
    try {
      seatResults = await api(`/seats/results?slug=${encodeURIComponent(s.slug)}&lineage=true`)
    } catch (e) {
      console.warn(`✗ ${e.message}`)
      seatsSkip++
      await sleep(SLEEP_MS)
      continue
    }
    if (!seatResults?.results) {
      console.warn('✗ no results')
      seatsSkip++
      await sleep(SLEEP_MS)
      continue
    }

    // Transform into our ledger entry
    const elections = []
    for (const r of seatResults.results) {
      if (!r.election_name) continue  // skip boundary-change events
      elections.push({
        electionName: r.election_name,
        year: parseInt(String(r.date).slice(0, 4), 10) || null,
        date: r.date,
        seat: r.seat,
        state: r.state,
        winner: {
          name: r.name,
          party: r.party,
          partyUid: r.party_uid,
          coalition: r.coalition,
          coalitionUid: r.coalition_uid,
          majority: r.majority,
          majorityPerc: r.majority_perc,
          voterTurnout: r.voter_turnout,
          voterTurnoutPerc: r.voter_turnout_perc,
        },
      })
    }
    elections.sort((a, b) => (b.year || 0) - (a.year || 0))

    historical[key] = {
      code: parsed.code,
      name: parsed.name,
      state: parsed.state,
      source: 'ElectionData.MY',
      slug: s.slug,
      type: s.type,
      elections,
    }
    seatsOK++
    console.log(`✓ ${elections.length} elections`)

    // Step 3: For each contest, fetch full ballot (if not cached)
    if (!NO_BALLOTS) {
      for (const e of elections) {
        const contestKey = `${key}__${e.electionName}__${e.date}`
        if (contestsFetched.has(contestKey)) {
          ballotsCacheHits++
          continue
        }
        const seatParam = e.seat  // e.g. "P.001 Padang Besar"
        try {
          const ballotResp = await api(
            `/results?seat=${encodeURIComponent(seatParam)}&state=${encodeURIComponent(e.state)}&date=${e.date}`
          )
          if (ballotResp?.ballot) {
            ballotsRaw[contestKey] = {
              seat: e.seat,
              state: e.state,
              date: e.date,
              electionName: e.electionName,
              ballot: ballotResp.ballot,
              stats: ballotResp.stats?.[0] || null,
            }
            ballotsFetchCount++
          }
        } catch (err) {
          console.warn(`    ballot ✗ ${e.electionName} ${e.date}: ${err.message}`)
        }
        await sleep(SLEEP_MS)
      }
    }

    await sleep(SLEEP_MS)

    // Periodic save (every 20 seats) so we don't lose progress
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(HIST_FILE, JSON.stringify(historical, null, 2))
      if (!NO_BALLOTS) fs.writeFileSync(BALLOTS_FILE, JSON.stringify(ballotsRaw, null, 2))
    }
  }

  // Final save
  fs.writeFileSync(HIST_FILE, JSON.stringify(historical, null, 2))
  fs.writeFileSync(BALLOTS_FILE, JSON.stringify(ballotsRaw, null, 2))

  console.log('\n══════════════════════════════════════════════════')
  console.log('  ✓ Sync complete')
  console.log(`  Seats synced:    ${seatsOK} (${seatsSkip} skipped)`)
  console.log(`  Ballots fetched: ${ballotsFetchCount} (${ballotsCacheHits} cache hits)`)
  console.log(`  Historical:      ${path.relative(ROOT, HIST_FILE)}`)
  console.log(`  Ballots:         ${path.relative(ROOT, BALLOTS_FILE)}`)
  console.log(`  Seats cache:     ${path.relative(ROOT, SEATS_FILE)}`)
  console.log('══════════════════════════════════════════════════')
}

main().catch(e => {
  console.error('FATAL:', e)
  process.exit(1)
})