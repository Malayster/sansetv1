'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsTracker() {
	const pathname = usePathname()
	const tracked = useRef<Set<string>>(new Set())

	useEffect(() => {
		if (tracked.current.has(pathname)) return
		tracked.current.add(pathname)

		const slug = pathname.startsWith('/berita/')
			? pathname.replace('/berita/', '')
			: pathname

		fetch('/api/track', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'pageview',
				slug,
				title: document.title,
				categories: [],
			}),
		}).catch(() => {})
	}, [pathname])

	return null
}
