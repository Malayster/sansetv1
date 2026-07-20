import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { rewriteArticle } from '@/lib/deepseek'
import { uploadImageToSanity } from '@/lib/image-upload'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: Request) {
	const { id, title, content, publishDate } = await req.json()

	if (!id || !title || !content) {
		return NextResponse.json({ error: 'id, title, dan content diperlukan' }, { status: 400 })
	}

	const writeClient = createClient({
		projectId, dataset, apiVersion, useCdn: false,
		token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN,
	})

	try {
		const bodyText = content
			.map((b: any) => b.children?.map((c: any) => c.text).join(' ') || '')
			.join('\n')
			.slice(0, 5000)

		const rewritten = await rewriteArticle(title, bodyText, 'Tulis Semula AI')

		const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN || ''
		const image = rewritten.imageKeywords
			? await uploadImageToSanity(rewritten.imageKeywords, token)
			: null

		await writeClient
			.patch(id)
			.set({
				title: rewritten.title,
				content: rewritten.body.map((b: any, idx: number) => ({
					...b,
					_key: b._key || `block-${Date.now()}-${idx}`,
				})),
				status: 'pending',
				'metadata.title': rewritten.title,
				'metadata.description': rewritten.description,
				'metadata.slug': { _type: 'slug', current: rewritten.slug },
				...(image ? { 'metadata.image': image } : {}),
			})
			.commit()

		return NextResponse.json({ success: true, title: rewritten.title, imageUploaded: !!image })
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown'
		console.error('[Tulis Semula] Gagal:', msg)
		return NextResponse.json({ error: msg }, { status: 500 })
	}
}
