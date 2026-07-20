import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { NextRequest, NextResponse } from 'next/server'

const sanityClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token: process.env.SANITY_API_WRITE_TOKEN,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
	try {
		const { email, source = 'footer' } = await req.json()

		if (!email || !EMAIL_RE.test(email)) {
			return NextResponse.json(
				{ error: 'Sila masukkan emel yang sah' },
				{ status: 400 },
			)
		}

		const existing = await sanityClient.fetch(
			`count(*[_type == "newsletter.subscriber" && email == $email])`,
			{ email },
		)

		if (existing > 0) {
			return NextResponse.json({ ok: true, message: 'Anda telah melanggan sebelum ini!' })
		}

		await sanityClient.create({
			_type: 'newsletter.subscriber',
			email,
			source,
			status: 'subscribed',
			subscribedAt: new Date().toISOString(),
		})

		if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
			const dc = process.env.MAILCHIMP_API_KEY.split('-')[1] || 'us1'
			await fetch(
				`https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
				{
					method: 'POST',
					headers: {
						Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email_address: email,
						status: 'subscribed',
					}),
				},
			).catch(() => {})
		}

		return NextResponse.json({ ok: true, message: 'Terima kasih! Anda berjaya melanggan.' })
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error'
		return NextResponse.json({ error: msg }, { status: 500 })
	}
}
