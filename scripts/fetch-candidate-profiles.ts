/**
 * fetch-candidate-profiles.ts
 * Cari profil calon dari Wikipedia Malaysia (jika ada).
 * Output: data/candidate-profiles.json
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const WIKI = 'https://ms.wikipedia.org/w/api.php'

interface Profile {
  name: string
  profile: string
  wikipediaUrl: string
}

async function wikiSearch(title: string): Promise<{ title: string; url: string } | null> {
  try {
    const { data } = await axios.get(WIKI, {
      params: { action: 'query', format: 'json', list: 'search', srsearch: title, srlimit: 1 }, timeout: 10000,
    })
    const hit = data?.query?.search?.[0]
    if (!hit) return null
    return { title: hit.title, url: `https://ms.wikipedia.org/wiki/${encodeURIComponent(hit.title)}` }
  } catch { return null }
}

async function wikiSummary(title: string): Promise<string> {
  try {
    const { data } = await axios.get(WIKI, {
      params: { action: 'query', format: 'json', prop: 'extracts', titles: title, explaintext: 1, exintro: 1 }, timeout: 15000,
    })
    const pages = data?.query?.pages || {}
    return (Object.values(pages) as any[])[0]?.extract?.slice(0, 300) || ''
  } catch { return '' }
}

// Candidates from mock data for P001-P004, N01-N04
const CANDIDATES = [
  'Zulkifli Ismail', 'Mohd Saat Musa', 'Rohaizat Zainal',
  'Zakri Hassan', 'Abdul Rashid',
  'Shahidan Kassim', 'Fathin Amelina',
  'Mohd Suhaimi Abdullah', 'Zambry Abd Kadir',
  'Ahmad Razak', 'Farid Iskandar',
  'Siti Aminah',
  'Ismail bin Kassim',
  'Noraini Hassan',
]

async function main() {
  console.log('Fetching candidate profiles from Wikipedia...\n')
  const profiles: Record<string, Profile> = {}
  const unique = [...new Set(CANDIDATES)]

  for (let i = 0; i < unique.length; i++) {
    const name = unique[i]
    console.log(`[${i + 1}/${unique.length}] ${name}`)
    const hit = await wikiSearch(name)
    if (hit) {
      const summary = await wikiSummary(hit.title)
      profiles[name] = { name, profile: summary.slice(0, 250), wikipediaUrl: hit.url }
      console.log(`  → ${hit.title} (${summary.length} chars)`)
    } else {
      profiles[name] = { name, profile: '', wikipediaUrl: '' }
      console.log(`  → not found`)
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'candidate-profiles.json'), JSON.stringify(profiles, null, 2))
  const found = Object.values(profiles).filter(p => p.wikipediaUrl).length
  console.log(`\nDone! ${found}/${unique.length} candidates with profiles → data/candidate-profiles.json`)
}

main().catch(console.error)
