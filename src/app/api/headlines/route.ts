import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const headlines = await client.fetch<string[]>(
			groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...15].title`
		)
		return NextResponse.json({ headlines })
	} catch {
		return NextResponse.json({ headlines: [] })
	}
}
