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
		const body = await req.json()
		const { name, email, message, formId = 'contact' } = body

		if (!name || typeof name !== 'string' || name.trim().length < 2) {
			return NextResponse.json({ error: 'Sila masukkan nama' }, { status: 400 })
		}

		if (!email || !EMAIL_RE.test(email)) {
			return NextResponse.json({ error: 'Sila masukkan emel yang sah' }, { status: 400 })
		}

		if (!message || typeof message !== 'string' || message.trim().length < 10) {
			return NextResponse.json(
				{ error: 'Sila tulis mesej (minimum 10 aksara)' },
				{ status: 400 },
			)
		}

		await sanityClient.create({
			_type: 'form.submission',
			formId,
			name: name.trim(),
			email: email.trim().toLowerCase(),
			message: message.trim(),
			submittedAt: new Date().toISOString(),
		})

		return NextResponse.json({
			ok: true,
			message: 'Mesej anda telah dihantar. Kami akan menghubungi anda segera!',
		})
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error'
		return NextResponse.json({ error: msg }, { status: 500 })
	}
}
