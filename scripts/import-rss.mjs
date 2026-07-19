import Parser from 'rss-parser'
import {createClient} from '@sanity/client'

const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''
const PROJECT_ID = 'ysnx8rnx'
const DATASET = 'production'

if (!TOKEN) {
  console.error('Set SANITY_EDITOR_TOKEN env var')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2025-04-26',
  useCdn: false,
})

const CATEGORIES = {
  'politik': 'Politik',
  'nasional': 'Nasional',
  'ekonomi': 'Ekonomi',
  'pendidikan': 'Pendidikan',
  'lingkungan': 'Lingkungan',
  'teknologi': 'Teknologi',
  'sukan': 'Sukan',
  'dunia': 'Dunia',
  'hiburan': 'Hiburan',
  'rencana': 'Rencana',
  'opini': 'Opini',
  'kesihatan': 'Kesihatan',
}

const FEEDS = [
  // Each feed fetched once; category auto-assigned by keyword matching
  {url: 'https://therakyatpost.com/feed/'},
  {url: 'https://www.malaymail.com/feed/rss'},
  {url: 'https://www.theborneopost.com/feed/'},
  {url: 'https://thesun.my/rss'},
  {url: 'https://www.freemalaysiatoday.com/feed/'},
]

const KEYWORDS = {
  'politik': ['politik', 'menteri', 'parlimen', 'dewan', 'pilihan raya', 'wakil rakyat', 'umno', 'pas', 'pkr', 'amanah', 'dap', 'kerajaan', 'pembangkang', 'mb ', 'ketua menteri', 'agong', 'sultan'],
  'nasional': ['malaysia', 'johor', 'kedah', 'kelantan', 'melaka', 'negeri sembilan', 'pahang', 'perak', 'perlis', 'pulau pinang', 'sabah', 'sarawak', 'selangor', 'terengganu', 'kl ', 'kuala lumpur', 'putrajaya', 'pdrm', 'polis'],
  'ekonomi': ['ekonomi', 'ringgit', 'cukai', 'gst', 'sst', 'saham', 'bursa', 'eksport', 'import', 'inflasi', 'harga', 'minyak', 'kelapa sawit', 'perniagaan', 'pelaburan'],
  'teknologi': ['teknologi', 'digital', 'ai ', 'artificial intelligence', 'siber', '5g', 'telekomunikasi', 'startup', 'aplikasi', 'malware', 'data', 'robot'],
  'sukan': ['sukan', 'bola sepak', 'badminton', 'hoki', 'f1 ', 'moto', 'olimpik', 'pemain', 'stadium', 'kejohanan', 'liga'],
  'dunia': ['dunia', 'antarabangsa', 'china', 'us ', ' amerika', 'indonesia', 'thailand', 'singapura', 'brunei', 'vietnam', 'myanmar', 'jepun', 'korea', 'bangladesh', 'eropah', 'perang', 'konflik'],
  'pendidikan': ['pendidikan', 'sekolah', 'universiti', 'pelajar', 'guru', 'upsr', 'spm', 'stpm', 'ipt', 'kementerian pendidikan'],
  'kesihatan': ['kesihatan', 'hospital', 'penyakit', 'virus', 'doktor', 'ubat', 'vaksin', 'kkm', 'klinik'],
  'hiburan': ['hiburan', 'artis', 'filem', 'drama', 'muzik', 'selebriti', 'konsert'],
  'lingkungan': ['alam sekitar', 'banjir', 'cuaca', 'iklim', 'hutan', 'pencemaran'],
  'rencana': ['rencana', 'pandangan', 'analisis', 'ulasan', 'komentar'],
  'opini': ['opini', 'surat', 'pembaca'],
}

function detectCategory(title, description) {
  const text = (title + ' ' + (description || '')).toLowerCase()
  let best = {category: 'nasional', score: 0}
  for (const [cat, keywords] of Object.entries(KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw)) score++
    }
    if (score > best.score) best = {category: cat, score}
  }
  return best.score > 0 ? best.category : 'nasional'
}

const parser = new Parser({
  headers: {'User-Agent': 'Mozilla/5.0 (compatible; SuaraAnakNegeri/1.0)'},
  customFields: {item: ['description', 'content:encoded']},
})

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)
}

function toPortableText(html) {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .substring(0, 1000)

  const paragraphs = text.split(/\n+/).filter((p) => p.trim())
  return paragraphs.map((p) => ({
    _type: 'block',
    style: 'normal',
    children: [{_type: 'span', text: p, marks: []}],
  }))
}

async function ensureCategories() {
  const existing = await client.fetch(`*[_type == "blog.category"].title`)
  for (const [key, title] of Object.entries(CATEGORIES)) {
    if (!existing.includes(title)) {
      await client.create({
        _type: 'blog.category',
        _id: `category-${key}`,
        title,
        slug: {_type: 'slug', current: key},
      })
      console.log(`✅ Category: ${title}`)
    }
  }
}

async function articleExists(slug) {
  const result = await client.fetch(
    `count(*[_type == "blog.post" && metadata.slug.current == $slug])`,
    {slug},
  )
  return result > 0
}

async function importFeed(feed) {
  try {
    console.log(`📡 ${feed.url}`)
    const data = await parser.parseURL(feed.url)
    const items = (data.items || []).slice(0, 15)
    let imported = 0

    for (const item of items) {
      const title = item.title?.trim() || 'Tanpa Tajuk'
      const slug = slugify(title).substring(0, 60)

      if (await articleExists(slug)) {
        continue
      }

      const content = item['content:encoded'] || item.content || item.contentSnippet || ''
      const bodyText = toPortableText(content)
      const description = item.contentSnippet || ''
      const category = detectCategory(title, description)

      try {
        await client.create({
          _type: 'blog.post',
          title,
          status: 'pending',
          publishDate: item.isoDate
            ? item.isoDate.split('T')[0]
            : new Date().toISOString().split('T')[0],
          content: bodyText,
          metadata: {
            _type: 'metadata',
            title,
            slug: {_type: 'slug', current: slug},
            description: description.substring(0, 160),
            noIndex: false,
          },
          categories: [
            {
              _type: 'reference',
              _ref: `category-${category}`,
              _weak: true,
            },
          ],
        })
        console.log(`  ✅ [${category}] ${title.substring(0, 55)}`)
        imported++
      } catch (err) {
        console.log(`  ❌ ${title.substring(0, 40)}: ${err.message.split('\n')[0]}`)
      }
    }
    return imported
  } catch (err) {
    console.log(`  ❌ ${err.message.split('\n')[0]}`)
    return 0
  }
}

async function main() {
  if (!TOKEN) {
    console.error('Set SANITY_EDITOR_TOKEN env')
    process.exit(1)
  }

  console.log('🏷️  Creating categories...\n')
  await ensureCategories()

  console.log('\n📡 Importing RSS feeds...\n')
  let total = 0
  for (const feed of FEEDS) {
    total += await importFeed(feed)
  }

  const count = await client.fetch(`count(*[_type == "blog.post"])`)
  console.log(`\n🎉 Imported: ${total} new | Total in Sanity: ${count}`)
}

main()
