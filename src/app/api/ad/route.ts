import { getAd } from '@/lib/ad-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const position = searchParams.get('position') || 'banner'
	const category = searchParams.get('category') || undefined

	const ad = await getAd(position, category)
	if (!ad) return NextResponse.json(null)

	return NextResponse.json(ad)
}
