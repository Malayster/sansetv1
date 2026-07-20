import { trackImpression, trackClick } from '@/lib/ad-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const { campaignId, type } = await req.json()

		if (!campaignId || !['impression', 'click'].includes(type)) {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
		}

		if (type === 'impression') await trackImpression(campaignId)
		if (type === 'click') await trackClick(campaignId)

		return NextResponse.json({ ok: true })
	} catch {
		return NextResponse.json({ ok: false }, { status: 500 })
	}
}
