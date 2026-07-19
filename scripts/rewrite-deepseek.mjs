import {createClient} from '@sanity/client'

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''
const TOKEN = process.env.SANITY_EDITOR_TOKEN || ''
const PROJECT_ID = 'ysnx8rnx'
const DATASET = 'production'

if (!TOKEN) {
  console.error('Set SANITY_EDITOR_TOKEN env var')
  process.exit(1)
}
if (!DEEPSEEK_KEY) {
  console.error('Set DEEPSEEK_API_KEY env var')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: '2025-04-26',
  useCdn: false,
})

const SYSTEM_PROMPT = `Kamu adalah penulis berita profesional Malaysia. Tugas kamu:
1. Baca artikel berita yang diberikan.
2. Tulis semula SEPENUHNYA dalam Bahasa Malaysia dengan gaya kewartawanan yang segar dan original.
3. Kekalkan SEMUA fakta, angka, nama, dan maksud asal — cuma ubah struktur ayat, pilihan kata, dan gaya penulisan.
4. Jangan tambah atau buang sebarang fakta.
5. Hasil MESTI 100% berbeza dari segi susunan kata dan ayat, tapi maksud tetap sama.
6. Format output sebagai plain text, bukan markdown.`

async function rewriteWithDeepSeek(title, content) {
  const text = content.map(block => {
    if (block._type === 'block' && block.children) {
      return block.children.map(c => c.text || '').join('')
    }
    return ''
  }).join('\n\n')

  const input = `TAJUK: ${title}\n\nKANDUNGAN ASAL:\n${text.substring(0, 4000)}`

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {role: 'system', content: SYSTEM_PROMPT},
        {role: 'user', content: input},
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API error ${res.status}: ${err.substring(0, 200)}`)
  }

  const json = await res.json()
  return json.choices[0].message.content
}

function toPortableText(text) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
  return paragraphs.map(p => ({
    _type: 'block',
    style: 'normal',
    children: [{_type: 'span', text: p.trim(), marks: []}],
  }))
}

async function main() {
  const posts = await client.fetch(`*[_type == "blog.post" && status == "pending"]{
    _id, title, content, publishDate
  }`)
  console.log(`📰 ${posts.length} artikel perlu di-rewrite\n`)

  let done = 0
  for (const post of posts) {
    try {
      console.log(`🔄 Rewriting: ${post.title.substring(0, 60)}...`)
      const newText = await rewriteWithDeepSeek(post.title, post.content || [])
      const newContent = toPortableText(newText)

      await client.patch(post._id).set({
        content: newContent,
        status: 'draft',
      }).commit()

      done++
      console.log(`  ✅ Done (${done}/${posts.length})`)
    } catch (err) {
      console.log(`  ❌ ${err.message.split('\n')[0]}`)
    }

    // Rate limit — 1 request per second
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n🎉 Selesai! ${done} artikel berjaya di-rewrite`)
}

main().catch(e => console.error(e.message))
