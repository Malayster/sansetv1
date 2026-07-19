/**
 * Jana Berita — Skrip standalone TANPA Next.js dev server.
 *
 * Gunaan:
 *   node scripts/jana-direct.mjs
 *
 * Aliran: RSS → Dedup → DeepSeek rewrite → Upload gambar → Sanity draft
 */
import 'dotenv-flow/config'

import Parser from 'rss-parser'
import { createClient } from '@sanity/client'

// ── Config ──────────────────────────────────────────────────────────
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ysnx8rnx'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_VERSION = '2026-06-17'
const TOKEN = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN || ''
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''
const TARGET = 15

if (!TOKEN) { console.error('❌ SANITY_API_WRITE_TOKEN hilang'); process.exit(1) }
if (!DEEPSEEK_KEY) { console.error('❌ DEEPSEEK_API_KEY hilang'); process.exit(1) }

const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, token: TOKEN, apiVersion: API_VERSION, useCdn: false })
const parser = new Parser()

// ── RSS Feeds ────────────────────────────────────────────────────────
const FEEDS = [
	// 🇲🇾 Bahasa Melayu
	{ name: 'Utusan Malaysia', url: 'https://www.utusan.com.my/feed', lang: 'bm' },
	{ name: 'Rakyat Post', url: 'https://therakyatpost.com/feed/', lang: 'bm' },
	{ name: 'Borneo Post BM', url: 'https://www.theborneopost.com/feed/', lang: 'bm' },
	{ name: 'Astro Awani', url: 'https://www.astroawani.com/rss/berita', lang: 'bm' },
	{ name: 'Sinar Harian', url: 'https://www.sinarharian.com.my/rss/terkini.xml', lang: 'bm' },
	{ name: 'Berita Harian', url: 'https://www.bharian.com.my/rss/edisi/malaysia.xml', lang: 'bm' },
	// 🇬🇧 English → DeepSeek rewrite ke BM
	{ name: 'Malay Mail', url: 'https://www.malaymail.com/feed/rss', lang: 'en' },
	{ name: 'Free Malaysia Today', url: 'https://www.freemalaysiatoday.com/feed/', lang: 'en' },
	{ name: 'The Sun Daily', url: 'https://thesun.my/rss', lang: 'en' },
	{ name: 'NST', url: 'https://www.nst.com.my/news/nation.rss', lang: 'en' },
	{ name: 'The Star', url: 'https://www.thestar.com.my/rss/News', lang: 'en' },
	{ name: 'The Edge', url: 'https://theedgemarkets.com/feed', lang: 'en' },
	{ name: 'Bernama EN', url: 'https://www.bernama.com/en/rss', lang: 'en' },
]

async function fetchRSS() {
	const all = []
	for (const feed of FEEDS) {
		try {
			const data = await parser.parseURL(feed.url)
			const items = (data.items || []).slice(0, 8)
			for (const item of items) {
				all.push({
					title: item.title || 'Tanpa Tajuk',
					link: item.link || '',
					content: item['content:encoded'] || item.content || item.contentSnippet || '',
					contentSnippet: item.contentSnippet || '',
					source: feed.name,
					lang: feed.lang || "bm",
				})
			}
			console.log(`  📡 ${feed.name}: ${items.length} artikel`)
		} catch (e) {
			console.warn(`  ⚠️  ${feed.name}: ${e.message?.slice(0, 80)}`)
		}
	}
	return all
}

// ── Dedup ───────────────────────────────────────────────────────────
function normUrl(u) {
	try { const x = new URL(u.trim()); return `${x.host}${x.pathname}`.replace(/\/+$/, '').toLowerCase() } catch { return '' }
}
function normTokens(t) {
	return new Set(t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3))
}
async function loadExisting() {
	const docs = await client.fetch(`*[_type == "blog.post"]{ "su": coalesce(sourceUrl,""), "ti": coalesce(title,""), "sl": coalesce(metadata.slug.current,"") }`)
	return { urls: new Set(docs.map(d => normUrl(d.su)).filter(Boolean)), tokens: docs.map(d => normTokens(`${d.ti} ${d.sl}`)) }
}
function isDup(a, { urls, tokens }) {
	const u = normUrl(a.link)
	if (u && urls.has(u)) return true
	const at = normTokens(a.title)
	if (at.size >= 4) for (const ex of tokens) { let o = 0; for (const t of at) if (ex.has(t)) o++; if (o / at.size > 0.8) return true }
	return false
}

// ── DeepSeek ────────────────────────────────────────────────────────
const SYS = `Anda wartawan profesional Malaysia untuk portal Suara Anak Negeri.
Tulis semula artikel dalam Bahasa Malaysia 100%. Gaya profesional, ringkas, padat.
Kekalkan fakta asal. Hasilkan JSON:
{"title":"tajuk BM maks120","description":"ringkasan 1-2 ayat maks250","categories":["kat1","kat2"],"imageKeywords":"2-3 kata Inggeris","body":[{"style":"normal","_type":"block","children":[{"text":"perenggan...","_type":"span","marks":[]}],"markDefs":[]}]}
Kategori sah: nasional, politik, ekonomi, dunia, teknologi, sukan, pendidikan, hiburan, kesihatan, gaya-hidup, bisnes, alam-sekitar. Pilih 2-3. 3-5 perenggan.`

async function rewrite(title, content, source) {
	const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_KEY}` },
		body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: SYS }, { role: 'user', content: `Sumber:${source}\nTajuk:${title}\nKandungan:${content.slice(0, 3000)}` }], temperature: 0.7, max_tokens: 2048 }),
	})
	if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${(await res.text()).slice(0, 120)}`)
	const d = await res.json()
	const t = d.choices?.[0]?.message?.content || ''
	const m = t.match(/\{[\s\S]*\}/)
	if (!m) throw new Error('DeepSeek tiada JSON sah')
	const a = JSON.parse(m[0])
	a.slug = a.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().slice(0, 80)
	return a
}

// ── Image Upload ─────────────────────────────────────────────────────
async function uploadImg(kw) {
	try {
		let buf
		for (const u of [`https://loremflickr.com/800/600/${encodeURIComponent(kw.replace(/\s+/g, ','))}`, `https://loremflickr.com/800/600/${encodeURIComponent(kw.split(' ')[0])}`]) {
			try { const r = await fetch(u, { signal: AbortSignal.timeout(8000) }); if (r.ok) { buf = await r.arrayBuffer(); if (buf.byteLength > 1000) break } } catch { continue }
		}
		if (!buf || buf.byteLength <= 1000) buf = await (await fetch('https://picsum.photos/800/600', { signal: AbortSignal.timeout(5000) })).arrayBuffer()
		const asset = await client.assets.upload('image', Buffer.from(buf), { filename: `${kw.replace(/\s+/g, '-').slice(0, 60)}.jpg`, contentType: 'image/jpeg' })
		return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
	} catch (e) { console.warn(`    ⚠️  Imej: ${e.message?.slice(0, 60)}`); return null }
}

// ── Categories ──────────────────────────────────────────────────────
const catCache = new Map()
async function resolveCats(names) {
	const key = names.join('|')
	if (catCache.has(key)) return catCache.get(key)
	const all = await client.fetch(`*[_type == "blog.category"]{title,_id}`)
	const refs = []
	for (const n of names) { const m = all.find(c => c.title.toLowerCase() === n.toLowerCase()); if (m) refs.push({ _key: `cat-${refs.length}`, _type: 'reference', _ref: m._id, _weak: true }) }
	if (!refs.length && all.length) refs.push({ _key: 'cat-0', _type: 'reference', _ref: all[0]._id, _weak: true })
	catCache.set(key, refs)
	return refs
}

// ── Retry ────────────────────────────────────────────────────────────
async function retry(fn, max = 3, ms = 2000) { let e; for (let i = 1; i <= max; i++) { try { return await fn() } catch (err) { e = err; if (i < max) { console.log(`    ↻ Retry ${i}/${max}`); await new Promise(r => setTimeout(r, ms * i)) } } } throw e }

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
	const t0 = Date.now()
	console.log('\n🚀 JANA BERITA — Standalone Pipeline')
	console.log(`   Target: ${TARGET} artikel unik\n`)

	console.log('📡 Mengambil RSS...')
	const articles = await fetchRSS()
	console.log(`   Total RSS: ${articles.length}\n`)

	console.log('🔍 Menyemak duplikat...')
	const ex = await loadExisting()
	const unique = articles.filter(a => !isDup(a, ex))
	console.log(`   Unik: ${unique.length} | Duplikat disaring: ${articles.length - unique.length}\n`)

	const target = Math.min(TARGET, unique.length)
	if (!target) { console.log('⚠️  Tiada artikel unik.'); process.exit(0) }
	console.log(`🎯 Sasaran: ${target}\n`)

	let created = 0, failed = 0
	const results = []

	for (let i = 0; i < target; i++) {
		const a = unique[i]
		const tag = `[${i + 1}/${target}]`
		try {
			console.log(`${tag} 🔄 ${a.title.slice(0, 60)}`)
			console.log(`    Sumber: ${a.source}`)

			const rw = await retry(() => rewrite(a.title, a.contentSnippet || a.content, a.source))
			console.log(`    ✏️  BM: ${rw.title.slice(0, 60)}`)

			let img = null
			if (rw.imageKeywords) { img = await retry(() => uploadImg(rw.imageKeywords), 2, 3000); if (img) console.log('    🖼️  Gambar OK') }

			const cats = await resolveCats(rw.categories || [])

			await client.create({
				_type: 'blog.post', title: rw.title,
				content: (rw.body || []).map((b, idx) => ({ ...b, _key: b._key || `b-${Date.now()}-${idx}` })),
				publishDate: new Date().toISOString().split('T')[0], status: 'pending', aiGenerated: true,
				sourceUrl: a.link || undefined, sourceName: a.source || undefined,
				categories: cats,
				metadata: { title: rw.title, description: rw.description || '', slug: { _type: 'slug', current: rw.slug || '' }, ...(img ? { image: img } : {}) },
			})

			created++
			console.log(`    ✅ Dicipta (${created}/${target})`)

			const u = normUrl(a.link); if (u) ex.urls.add(u)
			ex.tokens.push(normTokens(`${rw.title} ${rw.slug || ''}`))
			results.push({ source: a.source, title: rw.title, status: 'created' })
		} catch (e) {
			failed++
			console.log(`    ❌ ${e.message?.slice(0, 100)}`)
			results.push({ source: a.source, title: a.title, status: 'failed', error: e.message?.slice(0, 120) })
		}
		if (i < target - 1) await new Promise(r => setTimeout(r, 1500))
	}

	const sec = ((Date.now() - t0) / 1000).toFixed(0)
	console.log(`\n${'═'.repeat(50)}`)
	console.log(`✅ JANA SELESAI — ${sec}s`)
	console.log(`   Dicipta: ${created} | Gagal: ${failed} | Sasaran: ${target}`)
	console.log(`${'═'.repeat(50)}`)

	if (results.length) { console.log('\n📋:') ; for (const r of results) console.log(`   ${r.status === 'created' ? '🆕' : '⚠️'} [${r.source}] ${r.title.slice(0, 65)}${r.error ? ` — ${r.error}` : ''}`) }

	const total = await client.fetch(`count(*[_type == "blog.post" && status == "pending"])`)
	console.log(`\n📊 Total pending di Sanity: ${total}`)
}

main().catch(e => { console.error('❌', e.message || e); process.exit(1) })
