'use client'

import { useEffect, useState, useRef } from 'react'

type Stats = {
	totalViews: number
	totalPosts: number
	totalCategories: number
}

function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
	const [count, setCount] = useState(0)
	const ref = useRef<HTMLSpanElement>(null)
	const started = useRef(false)

	useEffect(() => {
		const el = ref.current
		if (!el || started.current) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					started.current = true
					const start = performance.now()
					const animate = (now: number) => {
						const elapsed = now - start
						const progress = Math.min(elapsed / duration, 1)
						const eased = 1 - Math.pow(1 - progress, 3)
						setCount(Math.floor(eased * target))
						if (progress < 1) requestAnimationFrame(animate)
					}
					requestAnimationFrame(animate)
				}
			},
			{ threshold: 0.3 },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [target, duration])

	return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function StatsBar() {
	const [stats, setStats] = useState<Stats | null>(null)

	useEffect(() => {
		fetch('/api/analytics')
			.then((r) => r.json())
			.then((d) => setStats({ totalViews: d.today?.totalViews || 0, totalPosts: d.totalPosts || 60, totalCategories: d.categories?.length || 12 }))
			.catch(() => setStats({ totalViews: 621, totalPosts: 60, totalCategories: 12 }))
	}, [])

	const items = [
		{ label: 'Artikel Diterbitkan', value: stats?.totalPosts ?? 0, icon: '📰', suffix: '' },
		{ label: 'Kategori Berita', value: stats?.totalCategories ?? 0, icon: '🏷️', suffix: '' },
		{ label: 'Pembaca Hari Ini', value: stats?.totalViews ?? 0, icon: '👁️', suffix: '' },
		{ label: 'Kemaskini Terkini', value: 24, icon: '🕐', suffix: '/7' },
	]

	return (
		<section className="bg-gradient-to-r from-hitam via-hitam-muda to-hitam text-putih">
			<div className="section max-w-7xl mx-auto px-4 md:px-8 py-8">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
					{items.map((item) => (
						<div key={item.label} className="text-center">
							<div className="text-2xl mb-1">{item.icon}</div>
							<div className="text-2xl md:text-3xl font-bold text-merah tabular-nums">
								<AnimatedNumber target={item.value} />
								{item.suffix}
							</div>
							<div className="text-xs md:text-sm text-putih/50 mt-1">{item.label}</div>
						</div>
					))}
				</div>
				<p className="text-center text-putih/20 text-xs mt-6 tracking-widest uppercase">
					Jambatan Suara Rakyat — Mengulas Tuntas Tanpa Tapisan
				</p>
			</div>
		</section>
	)
}
