const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

interface DeepSeekMessage {
	role: 'system' | 'user' | 'assistant'
	content: string
}

export interface RewrittenArticle {
	title: string
	slug: string
	description: string
	imageKeywords: string
	body: any[]
	categories: string[]
}

const SYSTEM_PROMPT = `Anda seorang wartawan profesional Malaysia menulis untuk portal Suara Anak Negeri. Tugas anda:

1. Tulis semula artikel yang diberi dalam Bahasa Malaysia 100% (tiada Bahasa Indonesia, tiada Bahasa Inggeris).
2. Gunakan gaya penulisan berita profesional - ringkas, padat, dan tepat.
3. Kekalkan fakta penting dari sumber asal.
4. Hasilkan dalam format JSON berikut:

{
  "title": "Tajuk berita dalam BM (maks 120 aksara)",
  "description": "Ringkasan 1-2 ayat dalam BM (maks 250 aksara)",
  "categories": ["kategori1", "kategori2"],
  "imageKeywords": "2-3 kata kunci Bahasa Inggeris untuk carian gambar",
  "body": [
    {"style": "normal", "_type": "block", "children": [{"text": "Perenggan pertama...", "_type": "span", "marks": []}], "markDefs": []},
    {"style": "normal", "_type": "block", "children": [{"text": "Perenggan kedua...", "_type": "span", "marks": []}], "markDefs": []}
  ]
}

Kategori yang sah: nasional, politik, ekonomi, dunia, teknologi, sukan, pendidikan, hiburan, kesihatan, gaya-hidup, bisnes, alam-sekitar. Pilih 2-3 paling sesuai.
Tulis 3-5 perenggan sahaja.
Untuk imageKeywords, berikan kata kunci carian gambar dalam Bahasa Inggeris (contoh: "malaysia economy growth" atau "football world cup final").`;

export async function rewriteArticle(
	title: string,
	content: string,
	source: string,
): Promise<RewrittenArticle> {
	if (!DEEPSEEK_API_KEY) {
		throw new Error('DEEPSEEK_API_KEY tidak dikonfigurasi')
	}

	const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
		},
		body: JSON.stringify({
			model: 'deepseek-chat',
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{
					role: 'user',
					content: `Sumber: ${source}\nTajuk asal: ${title}\nKandungan:\n${content.slice(0, 3000)}`,
				},
			],
			temperature: 0.7,
			max_tokens: 2048,
		}),
	})

	if (!response.ok) {
		const err = await response.text()
		throw new Error(`DeepSeek API error ${response.status}: ${err}`)
	}

	const data = await response.json()
	const text = data.choices?.[0]?.message?.content || ''

	// Extract JSON from the response
	const jsonMatch = text.match(/\{[\s\S]*\}/)
	if (!jsonMatch) {
		throw new Error('DeepSeek tidak mengembalikan JSON yang sah')
	}

	const article: RewrittenArticle = JSON.parse(jsonMatch[0])

	// Generate slug from title
	article.slug = article.title
		.toLowerCase()
		.replace(/[^a-z0-9\u0600-\u06FF\u00C0-\u024F\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim()
		.slice(0, 80)

	return article
}
