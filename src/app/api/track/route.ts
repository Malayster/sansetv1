import { trackPageView, trackSearch } from '@/lib/analytics'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { type, slug, title, categories, query } = body

		if (type === 'pageview') {
			let cats = categories || []

			// Auto-resolve categories from Sanity if not provided
			if (cats.length === 0 && slug && slug !== '/') {
				try {
					const postCategories = await client.fetch<string[]>(
						groq`*[_type == 'blog.post' && metadata.slug.current == $slug][0]{
							'categories': categories[]->title
						}.categories`,
						{ slug },
					)
					if (postCategories) cats = postCategories
				} catch {}
			}

			await trackPageView(slug, title, cats)
		} else if (type === 'search') {
			await trackSearch(query)
		}

		return NextResponse.json({ ok: true })
	} catch {
		return NextResponse.json({ ok: false }, { status: 500 })
	}
}
