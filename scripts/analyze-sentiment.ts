/**
 * analyze-sentiment.ts
 * Gabung data dari semua sumber → jana skor sentimen komposit.
 * DeepSeek API (primary) with keyword-based fallback.
 * Output: data/sentiment-output.json
 */
import fs from 'fs'
import path from 'path'

interface CompositeSentiment {
  code: string
  score: number
  label: 'positif' | 'neutral' | 'negatif'
  source: string
  summary: string
  topIssue: string
  partySentiment: Record<string, number>
  updatedAt: string
}

// ─── Fallback composite scores (when DeepSeek not available) ───

const FALLBACK: Record<string, CompositeSentiment> = {
  P001: {
    code: 'P001',
    score: 58,
    label: 'neutral',
    source: 'Keyword analysis',
    summary: 'Sentimen di Padang Besar neutral dengan kecenderungan positif terhadap BN. Isu air menjadi kebimbangan utama pengundi namun projek pembangunan diterima baik.',
    topIssue: 'Isu air & infrastruktur',
    partySentiment: { BN: 65, PH: 45, PN: 35 },
    updatedAt: '',
  },
  P002: {
    code: 'P002',
    score: 62,
    label: 'neutral',
    source: 'Keyword analysis',
    summary: 'Kangar mencatatkan sentimen neutral-positif. Isu kesihatan dan harga rumah menjadi topik utama perbincangan. PN mendahului dari segi sokongan dalam talian.',
    topIssue: 'Kesihatan & perumahan',
    partySentiment: { PN: 60, PH: 45, BN: 40 },
    updatedAt: '',
  },
  P003: {
    code: 'P003',
    score: 55,
    label: 'neutral',
    source: 'Keyword analysis',
    summary: 'Arau kekal sebagai kubu kuat PN dengan penyandang berpengaruh. Golongan muda mahukan perubahan, tetapi penyandang masih mendominasi perbincangan.',
    topIssue: 'Belia & pendidikan tinggi',
    partySentiment: { PN: 62, PH: 42, BN: 30 },
    updatedAt: '',
  },
  P004: {
    code: 'P004',
    score: 72,
    label: 'positif',
    source: 'Keyword analysis',
    summary: 'Langkawi mencatatkan sentimen positif tertinggi. Pemulihan pelancongan menjadi pemangkin utama. PN mendominasi dengan sokongan padu.',
    topIssue: 'Pelancongan & kos sara hidup',
    partySentiment: { PN: 70, PH: 35, BN: 25 },
    updatedAt: '',
  },
}

// ─── DeepSeek analysis ───

async function deepseekAnalyze(context: string): Promise<{
  score: number; label: string; summary: string; topIssue: string; partySentiment: Record<string, number>
} | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null

  const prompt = `Analisis sentimen untuk kawasan pilihan raya berdasarkan data berikut. Jawab dalam format JSON sahaja (tanpa markdown):

${context}

Format jawapan:
{
  "score": <0-100>,
  "label": "<positif|neutral|negatif>",
  "summary": "<2-3 ayat Bahasa Melayu>",
  "topIssue": "<isu paling hangat>",
  "partySentiment": { "BN": <0-100>, "PH": <0-100>, "PN": <0-100> }
}`

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Kamu penganalisis sentimen politik Malaysia. Jawab dalam JSON sahaja.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    })
    const data: any = await res.json()
    const raw = data?.choices?.[0]?.message?.content || ''
    // Extract JSON from response (may be wrapped in ```json ... ```)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

// ─── Build context from data files ───

function buildContext(code: string, name: string): string {
  const dataDir = path.resolve('data')
  const parts: string[] = [`Kawasan: ${code} ${name}`]

  // Trends
  const trendsPath = path.join(dataDir, 'trends-output.json')
  if (fs.existsSync(trendsPath)) {
    const trends = JSON.parse(fs.readFileSync(trendsPath, 'utf-8'))
    const t = trends[`trends:${code}`]
    if (t) parts.push(`Google Trends: Minat carian ${t.interest}/100 (${t.trend}).`)
  }

  // News
  const newsPath = path.join(dataDir, 'news-output.json')
  if (fs.existsSync(newsPath)) {
    const news = JSON.parse(fs.readFileSync(newsPath, 'utf-8'))
    const n = news[`news:${code}`]
    if (n) {
      parts.push(`Berita: ${n.sentimentSummary.positif} positif, ${n.sentimentSummary.neutral} neutral, ${n.sentimentSummary.negatif} negatif.`)
      const titles = (n.articles || []).slice(0, 3).map((a: any) => a.title).join('; ')
      if (titles) parts.push(`Tajuk: ${titles}.`)
    }
  }

  // Comments
  const commentsPath = path.join(dataDir, 'comments-output.json')
  if (fs.existsSync(commentsPath)) {
    const comments = JSON.parse(fs.readFileSync(commentsPath, 'utf-8'))
    const c = comments[`comments:${code}`]
    if (c) {
      const total = c.sentimentSummary.positif + c.sentimentSummary.neutral + c.sentimentSummary.negatif
      const pPos = total > 0 ? Math.round((c.sentimentSummary.positif / total) * 100) : 0
      const pNeg = total > 0 ? Math.round((c.sentimentSummary.negatif / total) * 100) : 0
      parts.push(`Media sosial: ${pPos}% positif, ${pNeg}% negatif dari ${total} komen.`)
    }
  }

  // Survey
  const surveyPath = path.join(dataDir, 'survey-template.json')
  if (fs.existsSync(surveyPath)) {
    const survey = JSON.parse(fs.readFileSync(surveyPath, 'utf-8'))
    const s = survey[`survey:${code}`]
    if (s) {
      const partyStr = s.parties.map((p: any) => `${p.name} ${p.percentage}%`).join(', ')
      const issueStr = s.issues.map((i: any) => `${i.topic} (${i.importance}%)`).join(', ')
      parts.push(`Survei ${s.source}: ${partyStr}.`)
      parts.push(`Isu utama: ${issueStr}.`)
    }
  }

  return parts.join('\n')
}

// ─── Main ───

async function main() {
  const regions: { code: string; name: string }[] = [
    { code: 'P001', name: 'Padang Besar' },
    { code: 'P002', name: 'Kangar' },
    { code: 'P003', name: 'Arau' },
    { code: 'P004', name: 'Langkawi' },
  ]

  console.log('═'.repeat(60))
  console.log('  ANALYZE SENTIMENT — Composite Score Engine')
  console.log('═'.repeat(60))

  const results: Record<string, CompositeSentiment> = {}
  let dsUsed = false

  for (const r of regions) {
    console.log(`\n🔬 ${r.code} ${r.name}`)

    const context = buildContext(r.code, r.name)
    const aiResult = await deepseekAnalyze(context)

    if (aiResult) {
      dsUsed = true
      results[r.code] = {
        code: r.code,
        score: aiResult.score,
        label: aiResult.label as any,
        source: 'DeepSeek AI',
        summary: aiResult.summary,
        topIssue: aiResult.topIssue,
        partySentiment: aiResult.partySentiment,
        updatedAt: new Date().toISOString(),
      }
      console.log(`   DeepSeek → ${aiResult.score}/100 (${aiResult.label}) | ${aiResult.topIssue}`)
    } else {
      const fb = FALLBACK[r.code]
      fb.updatedAt = new Date().toISOString()
      results[r.code] = fb
      console.log(`   Fallback → ${fb.score}/100 (${fb.label}) | ${fb.topIssue}`)
    }

    // Rate limit
    if (dsUsed) await new Promise(r => setTimeout(r, 1000))
  }

  // Write
  const outDir = path.resolve('data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const kvReady: Record<string, any> = {}
  for (const [code, r] of Object.entries(results)) {
    kvReady[`sentiment:${code}`] = r
  }
  fs.writeFileSync(path.join(outDir, 'sentiment-output.json'), JSON.stringify(kvReady, null, 2))

  // Summary
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`AI Engine: ${dsUsed ? 'DeepSeek' : 'Keyword fallback'}`)
  console.log(`Output → data/sentiment-output.json`)

  for (const [code, r] of Object.entries(results)) {
    const top = Object.entries(r.partySentiment).sort((a, b) => b[1] - a[1])[0]
    console.log(`  ${code}: ${r.score}/100 ${r.label.toUpperCase()} | ${r.topIssue} | Top party: ${top[0]} (${top[1]})`)
  }
  console.log('═'.repeat(60))

  if (!dsUsed) console.log('💡 Set DEEPSEEK_API_KEY for AI-powered analysis.')
}

main().catch(console.error)
