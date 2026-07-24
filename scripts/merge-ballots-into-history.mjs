#!/usr/bin/env node
/**
 * scripts/merge-ballots-into-history.mjs
 *
 * Merges detailed ballot data (all candidates, votes, %)
 * from electiondata-ballots.json into historical-results.json
 * so dashboard components (Swing, Swingometer, Perbandingan)
 * have full candidate arrays per election.
 *
 * Also normalises field names to match the HistoricalElectionResult
 * TypeScript interface used by the UI.
 *
 * Run:  node scripts/merge-ballots-into-history.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data', 'kv-output')
const HIST_FILE = path.join(DATA_DIR, 'historical-results.json')
const BALLOTS_FILE = path.join(DATA_DIR, 'electiondata-ballots.json')

// ── Load ──────────────────────────────────────────────────
const historical = JSON.parse(fs.readFileSync(HIST_FILE, 'utf-8'))
const ballots    = JSON.parse(fs.readFileSync(BALLOTS_FILE, 'utf-8'))

console.log(`Loaded: ${Object.keys(historical).length} historical entries, ${Object.keys(ballots).length} ballot contests`)

// ── Backup ────────────────────────────────────────────────
const backup = HIST_FILE.replace('.json', '.bak.json')
fs.writeFileSync(backup, JSON.stringify(historical, null, 2))
console.log(`Backup saved: ${backup}`)

// ── Merge ─────────────────────────────────────────────────
let mergedCount = 0
let totalElectionsWithBallots = 0
let skipNotFound = 0
let skipNoBallot = 0

for (const [storeKey, entry] of Object.entries(historical)) {
  if (!entry.elections || !Array.isArray(entry.elections)) continue

  for (const el of entry.elections) {
    // Construct ballot lookup key: STOREKEY__ELECTIONNAME__DATE
    const ballotKey = `${storeKey}__${el.electionName}__${el.date}`
    const bData = ballots[ballotKey]

    if (!bData) {
      // Try alternate: maybe date format differs
      const altDate = el.date ? el.date.replace(/-/g, '-') : null
      const altKey = altDate ? `${storeKey}__${el.electionName}__${altDate}` : null
      const bAlt = altKey && altKey !== ballotKey ? ballots[altKey] : null
      if (bAlt) {
        enrichElection(el, bAlt, storeKey)
        mergedCount++
      } else {
        skipNoBallot++
      }
      continue
    }

    enrichElection(el, bData, storeKey)
    mergedCount++
  }
}

// ── Fallback: ensure old elections (no ballot data) still have valid fields ──
let fallbackFixed = 0
for (const entry of Object.values(historical)) {
  if (!entry.elections || !Array.isArray(entry.elections)) continue
  for (const el of entry.elections) {
    if (el.candidates) continue // already enriched

    // Ensure winner/winnerParty/majority from historical lineage data
    if (el.winner && typeof el.winner === 'object' && el.winner.name) {
      const w = el.winner
      el.winner = w.name || ''
      el.winnerParty = w.party || w.coalition || ''
      el.majority = el.majority || w.majority || 0
    }
    el.candidates = el.candidates || []
    el.totalVoters = el.totalVoters || 0
    el.turnout = el.turnout || 0
    fallbackFixed++
  }
}

// ── Write ─────────────────────────────────────────────────
fs.writeFileSync(HIST_FILE, JSON.stringify(historical, null, 2))
console.log(`\n✓ Merge complete`)
console.log(`  Elections enriched with ballot data: ${mergedCount}`)
console.log(`  Elections without ballot data (fallback): ${fallbackFixed}`)
console.log(`  Total election entries fixed:           ${mergedCount + fallbackFixed}`)
console.log(`  Written: ${HIST_FILE}`)

// ── Helper ────────────────────────────────────────────────
function enrichElection(el, bData, storeKey) {
  // ── Preserve existing historical winner info ──────────
  const histWinner = el.winner // may be { name, party, coalition, majority, ... }

  // ── Map ballot candidates ─────────────────────────────
  const candidates = (bData.ballot || []).map(c => ({
    name: c.name || '',
    party: c.coalition || c.party || c.party_uid || '',
    partyUid: c.party_uid || '',
    coalition: c.coalition || '',
    votes: c.votes || 0,
    percentage: c.votes_perc != null ? Math.round(c.votes_perc * 100) / 100 : 0,
    result: c.result || 'lost',
  }))

  // ── Winner detection ──────────────────────────────────
  // Prefer ballot "won", fall back to historical winner
  const winnerEntry = candidates.find(c => c.result === 'won')
  const winnerName = winnerEntry?.name  || (histWinner && (histWinner.name || '')) || ''
  const winnerParty = winnerEntry?.party || (histWinner && (histWinner.party || '')) || ''

  // ── Majority & turnout ────────────────────────────────
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes)
  const stat = bData.stats || {}

  const majority = stat.majority != null
    ? stat.majority
    : sorted.length >= 2
      ? sorted[0].votes - sorted[1].votes
      : (histWinner && (histWinner.majority || 0)) || 0

  const totalVoters = stat.voters_total
    || (histWinner && (histWinner.voterTurnout || 0))
    || 0

  const turnoutRaw = stat.voter_turnout_perc != null
    ? stat.voter_turnout_perc
    : (histWinner && (histWinner.voterTurnoutPerc || 0)) || 0
  const turnout = turnoutRaw ? Math.round(turnoutRaw * 100) / 100 : 0

  // ── Write HistoricalElectionResult fields ─────────────
  el.candidates = candidates
  el.winner = winnerName
  el.winnerParty = winnerParty
  el.majority = majority
  el.totalVoters = totalVoters
  el.turnout = turnout
  // Keep original winner object backwards-compat for code that reads it
  delete el._histWinnerBackup

  totalElectionsWithBallots++
}
