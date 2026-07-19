'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CATS = [
	{ href: '/', label: 'Beranda' },
	{ href: '/berita?category=nasional', label: 'Nasional' },
	{ href: '/berita?category=politik', label: 'Politik' },
	{ href: '/berita?category=ekonomi', label: 'Ekonomi' },
	{ href: '/berita?category=dunia', label: 'Dunia' },
	{ href: '/berita?category=teknologi', label: 'Teknologi' },
	{ href: '/berita?category=sukan', label: 'Sukan' },
	{ href: '/berita?category=pendidikan', label: 'Pendidikan' },
]

export default function StickyNav() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 160)
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	return (
		<div
			className={`sticky top-0 z-40 bg-hitam border-b border-merah transition-all duration-300 ${
				visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
			}`}
		>
			<nav className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
				{CATS.map((cat) => (
					<Link
						key={cat.href}
						href={cat.href}
						className="text-xs font-semibold uppercase tracking-wide text-putih/80 hover:text-merah px-3 py-1.5 transition-colors whitespace-nowrap"
					>
						{cat.label}
					</Link>
				))}
			</nav>
		</div>
	)
}
