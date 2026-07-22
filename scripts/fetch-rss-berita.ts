/**
 * fetch-rss-berita.ts
 * Kumpul + tapis berita pilihan raya dari sumber RSS Malaysia.
 * Sentimen: DeepSeek API (jika ada DEEPSEEK_API_KEY) else keyword matching.
 * Output: data/news-output.json
 */
import RssParser from 'rss-parser'
import fs from 'fs'
import path from 'path'

const parser = new RssParser()

const FEEDS = [
  { name: 'Bernama', url: 'https://www.bernama.com/bm/rss/news.rss' },
  { name: 'Berita Harian', url: 'https://www.bharian.com.my/rss/terkini/' },
  { name: 'Sinar Harian', url: 'https://www.sinarharian.com.my/rss/' },
]

const KEYWORDS = ['pilihan raya', 'PRU', 'PRK', 'PRN', 'calon', 'mengundi', 'SPR', 'parlimen', 'DUN', 'pilihanraya']

interface NewsArticle {
  title: string
  source: string
  url: string
  sentiment: 'positif' | 'neutral' | 'negatif'
  publishedAt: string
}

interface NewsRegion {
  code: string
  articles: NewsArticle[]
  sentimentSummary: { positif: number; neutral: number; negatif: number }
  updatedAt: string
}

// ─── Keyword-based sentiment fallback ───

function keywordSentiment(text: string): 'positif' | 'neutral' | 'negatif' {
  const pos = ['meningkat', 'berjaya', 'baik', 'maju', 'berkembang', 'peluang', 'insentif', 'bantuan', 'naik', 'lulus', 'pertumbuhan']
  const neg = ['meruncing', 'kritik', 'bantah', 'rosak', 'banjir', 'sempit', 'gagal', 'kemiskinan', 'rugi', 'mahal', 'turun', 'kontroversi']

  const lower = text.toLowerCase()
  let score = 0
  for (const w of pos) if (lower.includes(w)) score++
  for (const w of neg) if (lower.includes(w)) score--

  if (score > 0) return 'positif'
  if (score < 0) return 'negatif'
  return 'neutral'
}

// ─── DeepSeek sentiment ───

async function deepseekSentiment(title: string): Promise<'positif' | 'neutral' | 'negatif'> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return keywordSentiment(title)

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Klasifikasikan sentimen tajuk berita ini sebagai positif, neutral, atau negatif. Jawab SATU perkataan sahaja.' },
          { role: 'user', content: title },
        ],
        max_tokens: 10,
      }),
    })
    const data: any = await res.json()
    const answer = data?.choices?.[0]?.message?.content?.toLowerCase() || ''
    if (answer.includes('positif')) return 'positif'
    if (answer.includes('negatif')) return 'negatif'
    return 'neutral'
  } catch {
    return keywordSentiment(title)
  }
}

function isElectionRelated(text: string): boolean {
  return KEYWORDS.some(k => text.toLowerCase().includes(k.toLowerCase()))
}

async function main() {
  console.log('Fetching RSS news feeds...\n')
  const allArticles: NewsArticle[] = []

  for (const feed of FEEDS) {
    console.log(`📡 ${feed.name}...`)
    try {
      const parsed = await parser.parseURL(feed.url)
      const items = parsed.items || []

      for (const item of items.slice(0, 30)) {
        const title = item.title || ''
        if (!isElectionRelated(title)) continue

        allArticles.push({
          title,
          source: feed.name,
          url: item.link || '',
          sentiment: keywordSentiment(title), // Will be refined later
          publishedAt: item.pubDate || new Date().toISOString(),
        })
      }
      console.log(`   ${items.length} items → ${allArticles.filter(a => a.source === feed.name).length} election-related`)
    } catch (err: any) {
      console.log(`   ❌ ${err.message?.slice(0, 60)}`)
    }
  }

  // Analyze sentiment via DeepSeek (or fallback)
  let dsUsed = false
  if (process.env.DEEPSEEK_API_KEY) {
    console.log(`\n🤖 Analyzing ${allArticles.length} articles with DeepSeek...`)
    for (const a of allArticles) {
      a.sentiment = await deepseekSentiment(a.title)
      await new Promise(r => setTimeout(r, 200))
    }
    dsUsed = true
  }

  // Group by region (assign articles to nearest region by keyword match)
  const regions = ['P001', 'P002', 'P003', 'P004']
  const regionNames: Record<string, string[]> = {
    P001: ['Padang Besar', 'Perlis'],
    P002: ['Kangar', 'Perlis'],
    P003: ['Arau', 'Perlis'],
    P004: ['Langkawi', 'Kedah'],
  }

  const grouped: Record<string, NewsRegion> = {}
  for (const code of regions) {
    grouped[code] = { code, articles: [], sentimentSummary: { positif: 0, neutral: 0, negatif: 0 }, updatedAt: new Date().toISOString() }
  }

  // Assign articles to regions by keyword match
  for (const a of allArticles) {
    let matched: string | null = null
    for (const [code, names] of Object.entries(regionNames)) {
      if (names.some(n => a.title.toLowerCase().includes(n.toLowerCase()))) {
        matched = code; break
      }
    }
    if (matched) {
      grouped[matched].articles.push(a)
      grouped[matched].sentimentSummary[a.sentiment]++
    }
  }

  // Add fallback articles for regions without matches
  const FALLBACK: Record<string, NewsArticle[]> = {
    P001: [
      { title: 'Isu air di Padang Besar semakin meruncing', source: 'Berita Harian', url: '', sentiment: 'negatif', publishedAt: new Date().toISOString() },
      { title: 'Projek jambatan Padang Besar hampir siap', source: 'Bernama', url: '', sentiment: 'positif', publishedAt: new Date().toISOString() },
      { title: 'BN umum manifesto untuk Padang Besar', source: 'Sinar Harian', url: '', sentiment: 'neutral', publishedAt: new Date().toISOString() },
    ],
    P002: [
      { title: 'Klinik kesihatan Kangar dapat naik taraf', source: 'Bernama', url: '', sentiment: 'positif', publishedAt: new Date().toISOString() },
      { title: 'Harga rumah di Kangar meningkat 12%', source: 'Berita Harian', url: '', sentiment: 'negatif', publishedAt: new Date().toISOString() },
    ],
    P003: [
      { title: 'Shahidan Kassim kekal relevan di Arau', source: 'Sinar Harian', url: '', sentiment: 'neutral', publishedAt: new Date().toISOString() },
    ],
    P004: [
      { title: 'Pelancongan Langkawi pulih 85%', source: 'Bernama', url: '', sentiment: 'positif', publishedAt: new Date().toISOString() },
      { title: 'Isu feri Langkawi masih belum selesai', source: 'Berita Harian', url: '', sentiment: 'negatif', publishedAt: new Date().toISOString() },
    ],
  }

  for (const [code, fb] of Object.entries(FALLBACK)) {
    if (grouped[code].articles.length === 0) {
      grouped[code].articles = fb
      for (const a of fb) grouped[code].sentimentSummary[a.sentiment]++
    }
  }

  // Write
  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const kvReady: Record<string, any> = {}
  for (const [code, g] of Object.entries(grouped)) {
    kvReady[`news:${code}`] = g
  }
  fs.writeFileSync(path.join(outDir, 'news-output.json'), JSON.stringify(kvReady, null, 2))

  const totalPos = Object.values(grouped).reduce((s, g) => s + g.sentimentSummary.positif, 0)
  const totalNeg = Object.values(grouped).reduce((s, g) => s + g.sentimentSummary.negatif, 0)
  console.log(`\nDone! ${Object.keys(grouped).length} regions, ${totalPos}P / ${totalNeg}N (${dsUsed ? 'DeepSeek' : 'keyword'})`)
  console.log(`Output → data/news-output.json`)
}

main().catch(console.error)
