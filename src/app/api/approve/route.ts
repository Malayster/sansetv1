import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	const { id } = await req.json()
	if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

	const client = createClient({
		projectId,
		dataset,
		apiVersion,
		useCdn: false,
		token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN,
	})

	try {
		await client.patch(id).set({ status: 'approved' }).commit()
		return NextResponse.json({ ok: true })
	} catch (e) {
		return NextResponse.json({ error: String(e) }, { status: 500 })
	}
}
