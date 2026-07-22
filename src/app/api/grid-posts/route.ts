import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(req: Request) {
	try {
		const { page, perPage, categoryFilterRef } = await req.json()
		const skip = (page - 1) * perPage
		const catFilter = categoryFilterRef
			? '&& references($categoryFilterRef)'
			: ''

		const posts = await client.fetch(
			groq`*[_type == 'blog.post' && status in ['published', 'approved']${catFilter}] | order(publishDate desc) [${skip}...${skip + perPage}]{
				_id, title, excerpt, publishDate,
				'mainImage': metadata.image,
				'slug': metadata.slug.current,
				categories[]->{_id, title, 'slug': slug.current, color}
			}`,
			categoryFilterRef ? { categoryFilterRef } : {},
		)

		return NextResponse.json({ posts })
	} catch {
		return NextResponse.json({ posts: [] })
	}
}
