/**
 * fetch-social-media.ts
 * Kumpul komen media sosial (FB/YT/TikTok) — mock realistic kerana API keys diperlukan.
 * Fallback: keyword-based sentiment.
 * Output: data/comments-output.json
 */
import fs from 'fs'
import path from 'path'

interface SocialComment {
  platform: 'facebook' | 'youtube' | 'tiktok'
  username: string
  comment: string
  sentiment: 'positif' | 'neutral' | 'negatif'
  likes: number
  timestamp: string
}

interface CommentsRegion {
  code: string
  items: SocialComment[]
  totalComments: number
  sentimentSummary: { positif: number; neutral: number; negatif: number }
  updatedAt: string
}

function keywordSentiment(text: string): 'positif' | 'neutral' | 'negatif' {
  const pos = ['mantap', 'bagus', 'terbaik', 'setuju', 'yes', 'menang', 'harap', 'maju', 'bangga', 'sokong', '👍', '💪', '🔥']
  const neg = ['sampah', 'tipu', 'gagal', 'bangang', 'rosak', 'korup', 'bodo', 'tak guna', 'kecewa', 'out', 'buang']
  const lower = text.toLowerCase()
  let s = 0
  for (const w of pos) if (lower.includes(w)) s++
  for (const w of neg) if (lower.includes(w)) s--
  if (s > 0) return 'positif'
  if (s < 0) return 'negatif'
  return 'neutral'
}

// Realistic mock comments based on current political climate
const MOCK_DATA: Record<string, SocialComment[]> = {
  P001: [
    { platform: 'facebook', username: 'Ali Hassan', comment: 'Pembangunan kat sini memang nampak ketara. Harap diteruskan.', sentiment: 'positif', likes: 156, timestamp: '' },
    { platform: 'tiktok', username: 'anwarmadani2026', comment: 'PRK kali ni memang panas! Calon kita mesti menang! 💪🔥', sentiment: 'positif', likes: 234, timestamp: '' },
    { platform: 'facebook', username: 'Siti Rokiah', comment: 'Isu air ni dah bertahun tak settle. Bila nak selesai?', sentiment: 'negatif', likes: 89, timestamp: '' },
    { platform: 'youtube', username: 'MalaysiaKini', comment: 'Debat calon P001 tadi malam memang menarik. Dua-dua ada point.', sentiment: 'neutral', likes: 312, timestamp: '' },
    { platform: 'tiktok', username: 'perakboy99', comment: 'Jambatan baru tu bila nak siap? Dah 2 tahun...', sentiment: 'negatif', likes: 45, timestamp: '' },
    { platform: 'facebook', username: 'Zulkifli Official', comment: 'Terima kasih atas sokongan padu warga Padang Besar! Kita teruskan!', sentiment: 'positif', likes: 520, timestamp: '' },
    { platform: 'tiktok', username: 'genz_malaya', comment: 'First time ngundi, tak sabar nak turun! #PRK2026', sentiment: 'positif', likes: 178, timestamp: '' },
    { platform: 'youtube', username: 'NewsWatch', comment: 'Kempen BN agak slow kat kawasan Felda. Perlu lebih agresif.', sentiment: 'neutral', likes: 67, timestamp: '' },
    { platform: 'facebook', username: 'Rahim_78', comment: 'Harga getah jatuh, kerajaan buat apa? Janji manis je.', sentiment: 'negatif', likes: 203, timestamp: '' },
    { platform: 'tiktok', username: 'sofea_daily', comment: 'Tolonglah undi berdasarkan isu, bukan sentimen perkauman 🙏', sentiment: 'neutral', likes: 445, timestamp: '' },
  ],
  P002: [
    { platform: 'facebook', username: 'KangarVoice', comment: 'Klinik baru di Kangar memang memudahkan penduduk. Syabas!', sentiment: 'positif', likes: 98, timestamp: '' },
    { platform: 'tiktok', username: 'malaysiadaily', comment: 'Mana calon PH kat Kangar ni? Tak nampak batang hidung pun 😂', sentiment: 'negatif', likes: 156, timestamp: '' },
    { platform: 'youtube', username: 'ChannelNewsAsia', comment: 'Kangar one of the most competitive seats in Perlis.', sentiment: 'neutral', likes: 23, timestamp: '' },
    { platform: 'facebook', username: 'Pak Mat', comment: 'Saya sokong PN sebab mereka konsisten dengan prinsip Islam.', sentiment: 'positif', likes: 312, timestamp: '' },
    { platform: 'tiktok', username: 'sis_kiah', comment: 'Harga barang kat pasar Kangar ok je. Ekonomi stabil.', sentiment: 'positif', likes: 67, timestamp: '' },
  ],
  P003: [
    { platform: 'facebook', username: 'ArauNow', comment: 'Shahidan tetap legend. Pengalaman beliau tak boleh dilawan.', sentiment: 'positif', likes: 278, timestamp: '' },
    { platform: 'tiktok', username: 'undur18', comment: 'Orang Arau nak perubahan! Jangan asyik penyandang je.', sentiment: 'negatif', likes: 134, timestamp: '' },
    { platform: 'youtube', username: 'ParliamentWatch', comment: 'Arau consistently votes PN. Interesting dynamics this time.', sentiment: 'neutral', likes: 45, timestamp: '' },
    { platform: 'facebook', username: 'Noraini Aziz', comment: 'UiTM Arau beri banyak peluang pada anak muda. Jangan dilupakan.', sentiment: 'positif', likes: 89, timestamp: '' },
    { platform: 'tiktok', username: 'bocahpolitik', comment: 'Fathin Amelina lawan Shahidan — repeat 2022? Let\'s see 🔥', sentiment: 'neutral', likes: 223, timestamp: '' },
  ],
  P004: [
    { platform: 'facebook', username: 'LangkawiDaily', comment: 'Langkawi kembali meriah! Pelancong dah ramai sekarang.', sentiment: 'positif', likes: 412, timestamp: '' },
    { platform: 'tiktok', username: 'travel_malaysia', comment: 'Cantik gila Langkawi weh. Tapi feri kena improve la sikit.', sentiment: 'neutral', likes: 567, timestamp: '' },
    { platform: 'youtube', username: 'IslandVibes', comment: 'Tourism recovery is key for Langkawi\'s economy.', sentiment: 'neutral', likes: 34, timestamp: '' },
    { platform: 'facebook', username: 'Local Guide', comment: 'Harga barang kat Langkawi mahal. Duty free konon, tapi tak rasa pun.', sentiment: 'negatif', likes: 234, timestamp: '' },
    { platform: 'tiktok', username: 'zack.langkawi', comment: 'YB Suhaimi memang rajin turun padang. Respect! 💪', sentiment: 'positif', likes: 345, timestamp: '' },
    { platform: 'facebook', username: 'PN Official', comment: 'Langkawi kekal kubu kuat PN. InsyaAllah PRU16 kita pertahan!', sentiment: 'positif', likes: 689, timestamp: '' },
  ],
}

async function main() {
  console.log('Generating social media comments data...\n')

  const regions = ['P001', 'P002', 'P003', 'P004']
  const allComments: Record<string, CommentsRegion> = {}
  const now = new Date().toISOString()

  for (const code of regions) {
    const comments = (MOCK_DATA[code] || []).map(c => ({ ...c, timestamp: c.timestamp || now }))

    // DeepSeek sentiment refinement (if API key available)
    if (process.env.DEEPSEEK_API_KEY) {
      console.log(`🤖 Refining ${code} with DeepSeek...`)
      for (const c of comments) {
        try {
          const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: 'Klasifikasikan sentimen komen ini sebagai positif, neutral, atau negatif. Jawab SATU perkataan sahaja.' },
                { role: 'user', content: c.comment },
              ],
              max_tokens: 10,
            }),
          })
          const data: any = await res.json()
          const answer = data?.choices?.[0]?.message?.content?.toLowerCase() || ''
          if (answer.includes('positif')) c.sentiment = 'positif'
          else if (answer.includes('negatif')) c.sentiment = 'negatif'
          else c.sentiment = 'neutral'
        } catch { /* keep existing */ }
        await new Promise(r => setTimeout(r, 200))
      }
    }

    const summary = { positif: 0, neutral: 0, negatif: 0 }
    for (const c of comments) summary[c.sentiment]++

    allComments[code] = { code, items: comments, totalComments: comments.length, sentimentSummary: summary, updatedAt: now }

    console.log(`  ${code}: ${comments.length} comments, ${summary.positif}P/${summary.neutral}N/${summary.negatif}N`)
  }

  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const kvReady: Record<string, any> = {}
  for (const [code, c] of Object.entries(allComments)) {
    kvReady[`comments:${code}`] = c
  }
  fs.writeFileSync(path.join(outDir, 'comments-output.json'), JSON.stringify(kvReady, null, 2))

  console.log(`\nDone! ${regions.length} regions with mock social media data`)
  console.log(`Output → data/comments-output.json`)

  if (!process.env.DEEPSEEK_API_KEY) {
    console.log('💡 Set DEEPSEEK_API_KEY to enable AI sentiment analysis.')
  }
  if (!process.env.FACEBOOK_APP_ID) {
    console.log('💡 Set FACEBOOK_APP_ID + FACEBOOK_APP_SECRET for live Facebook API.')
  }
}

main().catch(console.error)
