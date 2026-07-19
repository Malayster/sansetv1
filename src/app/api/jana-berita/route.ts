import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { NextResponse } from 'next/server'
import { fetchRSSArticles } from '@/lib/rss'
import { rewriteArticle } from '@/lib/deepseek'
import { uploadImageToSanity } from '@/lib/image-upload'

export const runtime = 'nodejs'
export const maxDuration = 300

// Sasaran jumlah artikel unik yang akan dicipta setiap janaan.
const TARGET_ARTICLES = 15

export async function GET() {
	return runJana()
}

export async function POST() {
	return runJana()
}

/** Longgokan kata kunci ternormal daripada teks (lowercase, buang tanda baca, pecah perkataan). */
function normalizeTokens(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)
			.filter((w) => w.length > 3),
	)
}

/** Pecahan URL ke path bersih (buang query/trailing slash) untuk padanan dedup stabil. */
function normalizeUrl(url: string): string {
	try {
		const u = new URL(url.trim())
		return `${u.host}${u.pathname}`.replace(/\/+$/, '').toLowerCase()
	} catch {
		return ''
	}
}

/** Cuba semula fungsi async sehingga `maxAttempts` kali dengan backoff antara percubaan. */
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, delayMs = 2000): Promise<T> {
	let lastErr: unknown
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn()
		} catch (err) {
			lastErr = err
			const msg = err instanceof Error ? err.message : String(err)
			console.warn(`[Jana Berita] Retry ${attempt}/${maxAttempts}: ${msg.slice(0, 120)}`)
			if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, delayMs * attempt))
		}
	}
	throw lastErr
}

async function runJana() {
	const writeClient = createClient({
		projectId,
		dataset,
		apiVersion,
		useCdn: false,
		token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN,
	})

	const results: { source: string; title: string; status: string; error?: string }[] = []
	let totalCreated = 0

	try {
		console.log('[Jana Berita] Mengambil RSS...')
		const articles = await fetchRSSArticles(undefined, 8)
		console.log(`[Jana Berita] ${articles.length} artikel dari RSS`)

		// --- Dedup berlapis: semak SEMUA blog.post sedia ada ---
		// Ambil URL sumber + tajuk + slug sedia ada untuk bandingan
		const existing = await writeClient.fetch<{
			sourceUrl: string | null
			title: string | null
			'slug': string | null
		}[]>(
			`*[_type == "blog.post"]{
				"sourceUrl": coalesce(sourceUrl, ""),
				"title": coalesce(title, ""),
				"slug": coalesce(metadata.slug.current, "")
			}`
		)

		const existingUrls = new Set(
			existing.map((d) => normalizeUrl(d.sourceUrl || '')).filter(Boolean)
		)
		const existingTokens = existing.map((d) => normalizeTokens(`${d.title || ''} ${d.slug || ''}`))

		const isDuplicate = (a: { link: string; title: string }): boolean => {
			// 1) URL sumber tepat (paling kuat)
			const normUrl = normalizeUrl(a.link || '')
			if (normUrl && existingUrls.has(normUrl)) return true

			// 2) Longgokan kata kunci bertindih tinggi (>80%)
			const tokens = normalizeTokens(a.title)
			if (tokens.size >= 4) {
				for (const ex of existingTokens) {
					let overlap = 0
					for (const t of tokens) if (ex.has(t)) overlap++
					if (overlap / tokens.size > 0.8) return true
				}
			}
			return false
		}

		const newArticles = articles.filter((a) => !isDuplicate(a))
		console.log(
			`[Jana Berita] ${newArticles.length} artikel unik (${articles.length - newArticles.length} duplikat disaring)`
		)

		const target = Math.min(TARGET_ARTICLES, newArticles.length)
		console.log(`[Jana Berita] Sasaran: ${target} artikel`)

		for (let i = 0; i < target; i++) {
			const article = newArticles[i]
			try {
				const token =
					process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN || ''
				console.log(
					`[Jana Berita] [${i + 1}/${target}] Menjana: ${article.title.slice(0, 60)}...`
				)

				const rewritten = await withRetry(() =>
					rewriteArticle(
						article.title,
						article.contentSnippet || article.content,
						article.source,
					)
				)

				const categoryRefs = await resolveCategories(writeClient, rewritten.categories)

				console.log(
					`[Jana Berita] [${i + 1}/${target}] Muat naik gambar: ${rewritten.imageKeywords || 'generic'}...`
				)
				const image = rewritten.imageKeywords
					? await withRetry(() => uploadImageToSanity(rewritten.imageKeywords, token))
					: null

				const doc = {
					_type: 'blog.post',
					title: rewritten.title,
					content: rewritten.body.map((b: any, idx: number) => ({
						...b,
						_key: b._key || `block-${Date.now()}-${idx}`,
					})),
					publishDate: new Date().toISOString().split('T')[0],
					status: 'pending',
					aiGenerated: true,
					sourceUrl: article.link || undefined,
					sourceName: article.source || undefined,
					categories: categoryRefs,
					metadata: {
						title: rewritten.title,
						description: rewritten.description,
						slug: { _type: 'slug', current: rewritten.slug },
						...(image ? { image } : {}),
					},
				}

				await writeClient.create(doc)
				totalCreated++
				// Daftar terus agar artikel dalam batch sama tak pendua antara satu sama lain
				const normUrl = normalizeUrl(article.link || '')
				if (normUrl) existingUrls.add(normUrl)
				existingTokens.push(normalizeTokens(`${rewritten.title} ${rewritten.slug}`))
				results.push({
					source: article.source,
					title: rewritten.title,
					status: 'created',
				})

				await new Promise((r) => setTimeout(r, 1500))
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Unknown'
				console.error(`[Jana Berita] [${i + 1}/${target}] Gagal: ${article.title}`, msg)
				results.push({
					source: article.source,
					title: article.title,
					status: 'failed',
					error: msg.slice(0, 200),
				})
			}
		}
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown'
		console.error('[Jana Berita] Gagal:', msg)
		return NextResponse.json({ error: msg }, { status: 500 })
	}

	return NextResponse.json({
		total: results.length,
		created: totalCreated,
		failed: results.length - totalCreated,
		target: TARGET_ARTICLES,
		results,
	})
}

async function resolveCategories(
	client: ReturnType<typeof createClient>,
	names: string[],
): Promise<{ _type: 'reference'; _ref: string; _weak?: boolean }[]> {
	const allCategories = await client.fetch(
		`*[_type == "blog.category"]{title, _id}`
	)

	const refs: { _key: string; _type: 'reference'; _ref: string; _weak?: boolean }[] = []
	for (const name of names) {
		const match = allCategories.find(
			(c: { title: string; _id: string }) =>
				c.title.toLowerCase() === name.toLowerCase()
		)
		if (match) {
			refs.push({ _key: `cat-${refs.length}`, _type: 'reference', _ref: match._id, _weak: true })
		}
	}

	if (refs.length === 0 && allCategories.length > 0) {
		refs.push({
			_key: 'cat-0',
			_type: 'reference',
			_ref: allCategories[0]._id,
			_weak: true,
		})
	}

	return refs
}
