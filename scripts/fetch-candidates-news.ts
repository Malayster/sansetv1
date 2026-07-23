#!/usr/bin/env -S npx tsx
/**
 * fetch-candidates-news.ts
 * ========================================================
 * 🚨 KEUTAMAAN MUTLAK 🚨
 * Cari calon SEMASA dari SEMUA parti untuk PRN 2026
 * melalui portal berita utama Malaysia.
 * ========================================================
 *
 * Portal yang disokong:
 *   1. Malaysiakini    (malaysiakini.com)
 *   2. Utusan Malaysia  (utusan.com.my)
 *   3. Sinar Harian     (sinarharian.com.my)
 *   4. Harakahdaily     (harakahdaily.net)
 *   5. BH Online        (bharian.com.my)
 *   6. Astro Awani      (astroawani.com)
 *
 * Output: data/candidates-news-2026.json
 *
 * Usage:
 *   npx tsx scripts/fetch-candidates-news.ts
 *
 * Untuk update calon sedia ada:
 *   npx tsx scripts/fetch-candidates-news.ts --merge
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

// ─── Configuration ───
const DATA_DIR = path.resolve('data')
const OUTPUT_FILE = path.join(DATA_DIR, 'candidates-news-2026.json')
const MERGE_FILE = path.join(DATA_DIR, 'kv-output', 'candidates-real.json')

interface NewsCandidate {
  name: string
  party: string
  seatCode: string | null
  seatName: string | null
  role: 'penyandang' | 'pencabar' | null
  source: string
  sourceUrl: string
  profile: string
  age?: number
  isIncumbent?: boolean
  previousParty?: string
}

interface NewsPortal {
  name: string
  baseUrl: string
  searchUrl: (query: string) => string
  searchHandler: (html: string, portal: NewsPortal) => NewsCandidate[]
}

// ─── Search queries — all parties ───
const SEARCH_QUERIES = [
  // PRN 2026 Negeri Sembilan — all coalitions
  'PRN 2026 Negeri Sembilan calon',
  'PRN 2026 Negeri Sembilan BN calon',
  'PRN 2026 Negeri Sembilan PH calon',
  'PRN 2026 Negeri Sembilan PN calon',
  'PRN Negeri Sembilan 2026 calon bertanding',
  'Pilihan Raya Negeri Negeri Sembilan 2026 calon',
  // Per party / coalition
  'Barisan Nasional calon PRN Negeri Sembilan 2026',
  'Pakatan Harapan calon PRN Negeri Sembilan 2026',
  'Perikatan Nasional calon PRN Negeri Sembilan 2026',
  // Specific seat announcements
  'N.01 Chennah calon',
  'N.27 Rantau calon',
  'N.13 Sikamat calon',
  'UMNO calon Negeri Sembilan 2026',
  'PAS calon Negeri Sembilan 2026',
  'PKR calon Negeri Sembilan 2026',
  'DAP calon Negeri Sembilan 2026',
  'Amanah calon Negeri Sembilan 2026',
  'Bersatu calon Negeri Sembilan 2026',
  'Tok Mat PRN 2026',
  'Aminuddin Harun PRN 2026',
  'MB Negeri Sembilan PRN 2026',
  // General
  'senarai calon PRN 2026',
  'calon PRN 2026 diumum',
]

// ─── Portal definitions with search handlers ───
const PORTALS: NewsPortal[] = [
  {
    name: 'Malaysiakini',
    baseUrl: 'https://www.malaysiakini.com',
    searchUrl: (q: string) => `https://www.malaysiakini.com/search?q=${encodeURIComponent(q)}&type=news`,
    searchHandler: (html, portal) => {
      const $ = cheerio.load(html)
      const candidates: NewsCandidate[] = []
      // Malaysiakini article list
      $('article h2 a, .news-headline a, .article-title a').each((_, el) => {
        const text = $(el).text().trim()
        const href = $(el).attr('href') || ''
        const url = href.startsWith('http') ? href : `${portal.baseUrl}${href}`
        extractCandidatesFromText(text, portal.name, url, candidates)
      })
      return candidates
    },
  },
  {
    name: 'Utusan Malaysia',
    baseUrl: 'https://www.utusan.com.my',
    searchUrl: (q: string) => `https://www.utusan.com.my/?s=${encodeURIComponent(q)}`,
    searchHandler: (html, portal) => {
      const $ = cheerio.load(html)
      const candidates: NewsCandidate[] = []
      $('article h2 a, .post-title a, .entry-title a').each((_, el) => {
        const text = $(el).text().trim()
        const href = $(el).attr('href') || ''
        const url = href.startsWith('http') ? href : `${portal.baseUrl}${href}`
        extractCandidatesFromText(text, portal.name, url, candidates)
      })
      return candidates
    },
  },
  {
    name: 'Sinar Harian',
    baseUrl: 'https://www.sinarharian.com.my',
    searchUrl: (q: string) => `https://www.sinarharian.com.my/search?q=${encodeURIComponent(q)}`,
    searchHandler: (html, portal) => {
      const $ = cheerio.load(html)
      const candidates: NewsCandidate[] = []
      $('article h2 a, .article-title a, .title a').each((_, el) => {
        const text = $(el).text().trim()
        const href = $(el).attr('href') || ''
        const url = href.startsWith('http') ? href : `${portal.baseUrl}${href}`
        extractCandidatesFromText(text, portal.name, url, candidates)
      })
      return candidates
    },
  },
  {
    name: 'Harakahdaily',
    baseUrl: 'https://harakahdaily.net',
    searchUrl: (q: string) => `https://harakahdaily.net/?s=${encodeURIComponent(q)}`,
    searchHandler: (html, portal) => {
      const $ = cheerio.load(html)
      const candidates: NewsCandidate[] = []
      $('article h2 a, .post-title a, .entry-title a, h3 a').each((_, el) => {
        const text = $(el).text().trim()
        const href = $(el).attr('href') || ''
        const url = href.startsWith('http') ? href : `${portal.baseUrl}${href}`
        extractCandidatesFromText(text, portal.name, url, candidates)
      })
      return candidates
    },
  },
  {
    name: 'BH Online',
    baseUrl: 'https://www.bharian.com.my',
    searchUrl: (q: string) => `https://www.bharian.com.my/search?q=${encodeURIComponent(q)}`,
    searchHandler: (html, portal) => {
      const $ = cheerio.load(html)
      const candidates: NewsCandidate[] = []
      $('article h2 a, .field-content a, .views-field-title a').each((_, el) => {
        const text = $(el).text().trim()
        const href = $(el).attr('href') || ''
        const url = href.startsWith('http') ? href : `https://www.bharian.com.my${href}`
        extractCandidatesFromText(text, portal.name, url, candidates)
      })
      return candidates
    },
  },
  {
    name: 'Astro Awani',
    baseUrl: 'https://www.astroawani.com',
    searchUrl: (q: string) => `https://www.astroawani.com/search?q=${encodeURIComponent(q)}`,
    searchHandler: (html, portal) => {
      const $ = cheerio.load(html)
      const candidates: NewsCandidate[] = []
      $('article h2 a, .title a, .article-title a').each((_, el) => {
        const text = $(el).text().trim()
        const href = $(el).attr('href') || ''
        const url = href.startsWith('http') ? href : `${portal.baseUrl}${href}`
        extractCandidatesFromText(text, portal.name, url, candidates)
      })
      return candidates
    },
  },
]

// ─── Known party keywords ───
const PARTY_KEYWORDS: Record<string, string> = {
  'BN': 'BN', 'barisan nasional': 'BN', 'umno': 'BN', 'mca': 'BN', 'mic': 'BN',
  'PH': 'PH', 'pakatan harapan': 'PH', 'pkr': 'PH', 'keadilan': 'PH',
  'dap': 'PH', 'amanah': 'PH', 'upko': 'PH',
  'PN': 'PN', 'perikatan nasional': 'PN', 'pas': 'PN', 'bersatu': 'PN', 'ppbm': 'PN',
  'gps': 'GPS', 'gabungan parti sarawak': 'GPS',
  'grs': 'GRS', 'gabungan rakyat sabah': 'GRS',
  'warisan': 'WARISAN',
  'bebas': 'Bebas',
}

// ─── Regex patterns ───
const CANDIDATE_PATTERNS = [
  // "calon [party] [name]", "[name] calon [party]"
  /\bcalon\s+(?:[A-Za-z\s]+)?\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\b/gsi,
  // "[name] akan bertanding" / "[name] bertanding"
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s+(?:akan\s+)?bertanding\b/gsi,
  // "[name] diumum sebagai calon"
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s+diumum\s+(?:sebagai\s+)?calon\b/gsi,
  // "mencalonkan [name]"
  /\bmencalonkan\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\b/gsi,
  // "[name] kekal" / "[name] digugurkan" 
  /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\s+(?:kekal|digugurkan|diganti)\b/gsi,
  // "penyandang [seat] [name]"
  /\bpenyandang\s+(?:\S+\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})\b/gsi,
]

const SEAT_PATTERNS = [
  /N\.?\s*(\d{1,2})/gi,
  /P\.?\s*(\d{3})/gi,
]

function extractParty(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(PARTY_KEYWORDS)) {
    if (lower.includes(key.toLowerCase())) return val
  }
  return null
}

function extractSeatCode(text: string): string | null {
  const m = text.match(/N\.?\s*(\d{2})\b/i)
  if (m) return `N${m[1].padStart(2, '0')}`
  const m2 = text.match(/P\.?\s*(\d{3})\b/i)
  if (m2) return `P${m2[1]}`
  return null
}

function extractCandidatesFromText(
  text: string,
  source: string,
  sourceUrl: string,
  candidates: NewsCandidate[]
) {
  const party = extractParty(text)
  const seatCode = extractSeatCode(text)
  let seatName: string | null = null
  const seatMatch = text.match(/N\.?\s*\d{2}\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
  if (seatMatch) seatName = seatMatch[1].trim()

  for (const pattern of CANDIDATE_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const m of matches) {
      const name = m[1]?.trim()
      if (name && name.length > 3 && name.length < 60) {
        const isIncumbent = text.toLowerCase().includes('penyandang') || text.toLowerCase().includes('kekal')
        // Check if this is really a candidate name (not common words)
        const skipWords = ['diumum', 'sebagai', 'kekal', 'digugurkan', 'bertanding', 'mencalonkan', 'akan']
        if (skipWords.some(w => name.toLowerCase() === w)) continue

        const exists = candidates.some(c => c.name.includes(name) || name.includes(c.name))
        if (!exists) {
          candidates.push({
            name: name.replace(/\s+/g, ' ').trim(),
            party: party || 'Unknown',
            seatCode,
            seatName,
            role: isIncumbent ? 'penyandang' : null,
            source,
            sourceUrl,
            profile: text.slice(0, 200),
            isIncumbent,
          })
        }
      }
    }
  }
}

// ─── Fetch article content for more candidates ───
async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    const { data } = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SuaraAnakNegeri/1.0)' } })
    const $ = cheerio.load(data)
    // Remove unwanted elements
    $('script, style, nav, footer, header, .ads, .comments').remove()
    return $('article, .content, .post-content, .entry-content, .story-content').text().trim().slice(0, 5000)
  } catch {
    return null
  }
}

// ─── Load existing candidates for merge ───
function loadExisting(): Record<string, any[]> {
  try {
    return JSON.parse(fs.readFileSync(MERGE_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

// ─── Main ───
async function main() {
  const shouldMerge = process.argv.includes('--merge')
  console.log('═'.repeat(70))
  console.log('  🚨 FETCH CANDIDATES FROM NEWS PORTALS 🚨')
  console.log('  PRN 2026 — Semua parti, semua portal')
  console.log('═'.repeat(70))

  const allCandidates: NewsCandidate[] = []
  let totalRequests = 0
  let successfulRequests = 0

  for (const portal of PORTALS) {
    console.log(`\n📰 ${portal.name} (${portal.baseUrl})`)
    console.log('─'.repeat(50))

    for (const query of SEARCH_QUERIES) {
      const url = portal.searchUrl(query)

      try {
        const { data: html } = await axios.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        })
        totalRequests++
        successfulRequests++

        const found = portal.searchHandler(html, portal)
        for (const c of found) {
          const exists = allCandidates.some(ex =>
            ex.name.toLowerCase() === c.name.toLowerCase() && ex.source === c.source
          )
          if (!exists) allCandidates.push(c)
        }

        if (found.length > 0) {
          console.log(`  ✓ "${query.slice(0, 50)}..." → ${found.length} calon ditemui`)
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 1500))
      } catch (err: any) {
        totalRequests++
        console.log(`  ✗ "${query.slice(0, 50)}..." → ${err.message?.slice(0, 60) || 'error'}`)
        await new Promise(r => setTimeout(r, 3000))
      }
    }
  }

  console.log(`\n${'═'.repeat(70)}`)
  console.log(`📊 Ringkasan:`)
  console.log(`   Permintaan: ${successfulRequests}/${totalRequests} berjaya`)
  console.log(`   Calon ditemui: ${allCandidates.length}`)
  console.log(`   Sumber: ${[...new Set(allCandidates.map(c => c.source))].join(', ')}`)

  // Deduplicate by name
  const deduped = new Map<string, NewsCandidate>()
  for (const c of allCandidates) {
    const key = c.name.toLowerCase()
    if (!deduped.has(key)) deduped.set(key, c)
  }
  const uniqueCandidates = [...deduped.values()]
  console.log(`   Unik: ${uniqueCandidates.length} calon`)

  // Group by party
  const byParty: Record<string, NewsCandidate[]> = {}
  for (const c of uniqueCandidates) {
    if (!byParty[c.party]) byParty[c.party] = []
    byParty[c.party].push(c)
  }
  for (const [party, cands] of Object.entries(byParty).sort()) {
    console.log(`   ${party}: ${cands.length} calon`)
  }

  // ─── Try to fetch article content for more details ───
  console.log(`\n📖 Mengambil kandungan artikel untuk calon...`)
  let enriched = 0
  for (let i = 0; i < uniqueCandidates.length; i++) {
    const c = uniqueCandidates[i]
    if (c.sourceUrl && !c.profile) {
      const content = await fetchArticleContent(c.sourceUrl)
      if (content) {
        c.profile = content.slice(0, 500)
        enriched++
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    if ((i + 1) % 10 === 0) console.log(`   ${i + 1}/${uniqueCandidates.length} diproses...`)
  }
  console.log(`   ${enriched} artikel berjaya diambil`)

  // ─── Merge with existing data if --merge ───
  if (shouldMerge) {
    console.log(`\n🔀 Merging dengan data sedia ada...`)
    const existing = loadExisting()
    let updated = 0

    for (const [code, cands] of Object.entries(existing)) {
      for (const cand of cands) {
        const newsMatch = uniqueCandidates.find(nc =>
          cand.name.toLowerCase().includes(nc.name.toLowerCase()) ||
          nc.name.toLowerCase().includes(cand.name.toLowerCase())
        )
        if (newsMatch && newsMatch.profile) {
          cand.profile = newsMatch.profile.slice(0, 300)
          ;(cand as any).newsSource = newsMatch.source
          ;(cand as any).newsUrl = newsMatch.sourceUrl
          updated++
        }
      }
    }

    fs.writeFileSync(MERGE_FILE, JSON.stringify(existing, null, 2))
    // Also write merged copy
    const mergedPath = path.join(DATA_DIR, 'kv-output', 'candidates-news-merged.json')
    fs.writeFileSync(mergedPath, JSON.stringify(existing, null, 2))
    console.log(`   ${updated} calon diupdate dengan data dari portal berita`)
    console.log(`   → ${mergedPath}`)
  }

  // ─── Write output ───
  const output = {
    metadata: {
      fetchedAt: new Date().toISOString(),
      source: 'Malaysiakini, Utusan Malaysia, Sinar Harian, Harakahdaily, BH Online, Astro Awani',
      queriesCount: SEARCH_QUERIES.length,
      totalCandidatesFound: allCandidates.length,
      uniqueCandidates: uniqueCandidates.length,
    },
    candidates: uniqueCandidates.sort((a, b) => a.name.localeCompare(b.name)),
    byParty,
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2))
  console.log(`\n📁 Output → ${OUTPUT_FILE}`)

  // ─── Print sample ───
  console.log(`\n📋 Sample calon:`)
  for (const c of uniqueCandidates.slice(0, 15)) {
    const name = c.name.padEnd(30)
    const party = c.party.padEnd(4)
    const seat = (c.seatCode || 'N/A').padEnd(5)
    console.log(`   ${name} | ${party} | ${seat} | ${c.source}`)
  }

  console.log(`\n✅ Selesai!`)
  console.log(`\n⚠️  ARAHAN UNTUK AGENT MASA DEPAN:`)
  console.log(`   Jalankan: npx tsx scripts/fetch-candidates-news.ts --merge`)
  console.log(`   untuk update data calon dengan profil dari portal berita.`)
}

main().catch(console.error)
