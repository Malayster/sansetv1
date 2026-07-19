import { trackPageView, trackSearch } from '@/lib/analytics'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { type, slug, title, categories, query } = body

		if (type === 'pageview') {
			await trackPageView(slug, title, categories || [])
		} else if (type === 'search') {
			await trackSearch(query)
		}

		return NextResponse.json({ ok: true })
	} catch {
		return NextResponse.json({ ok: false }, { status: 500 })
	}
}
