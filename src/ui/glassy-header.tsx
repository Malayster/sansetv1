'use client'

import { useEffect, useState } from 'react'

export default function GlassyHeader({ children }: { children: React.ReactNode }) {
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<div
			className={`sticky top-0 z-40 transition-all duration-300 ${
				scrolled
					? 'bg-putih/95 backdrop-blur-md shadow-lg shadow-hitam/5 border-b border-merah/20'
					: 'bg-putih'
			}`}
		>
			{children}
		</div>
	)
}
