import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { NextResponse } from 'next/server'
import { fetchRSSArticles } from '@/lib/rss'
import { rewriteArticle } from '@/lib/deepseek'
import { uploadImageToSanity } from '@/lib/image-upload'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET() {
	return runJana()
}

export async function POST() {
	return runJana()
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
		const articles = await fetchRSSArticles(undefined, 3)
		console.log(`[Jana Berita] ${articles.length} artikel dari RSS`)

		const existingTitles = await writeClient.fetch(
			`*[_type == "blog.post" && aiGenerated == true].title`
		)
		const existingSet = new Set(
			existingTitles.map((t: string) => t.toLowerCase().trim())
		)

		const newArticles = articles.filter(
			(a) => !existingSet.has(a.title.toLowerCase().trim())
		)

		console.log(
			`[Jana Berita] ${newArticles.length} artikel baru (${articles.length - newArticles.length} duplikat)`
		)

		for (const article of newArticles.slice(0, 5)) {
			try {
				const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN || ''
				console.log(`[Jana Berita] Menjana: ${article.title.slice(0, 60)}...`)
				const rewritten = await rewriteArticle(
					article.title,
					article.contentSnippet || article.content,
					article.source,
				)

				const categoryRefs = await resolveCategories(writeClient, rewritten.categories)

				console.log(`[Jana Berita] Muat naik gambar: ${rewritten.imageKeywords || 'generic'}...`)
				const image = rewritten.imageKeywords
					? await uploadImageToSanity(rewritten.imageKeywords, token)
					: null

				const doc = {
					_type: 'blog.post',
					title: rewritten.title,
					content: rewritten.body.map((b: any, i: number) => ({ ...b, _key: b._key || `block-${Date.now()}-${i}` })),
					publishDate: new Date().toISOString().split('T')[0],
					status: 'pending',
					aiGenerated: true,
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
				results.push({
					source: article.source,
					title: rewritten.title,
					status: 'created',
				})

				await new Promise((r) => setTimeout(r, 1500))
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Unknown'
				console.error(`[Jana Berita] Gagal: ${article.title}`, msg)
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
