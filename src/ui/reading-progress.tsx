'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY
			const docHeight = document.documentElement.scrollHeight - window.innerHeight
			setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
		}
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<div className="fixed top-0 left-0 right-0 z-50 h-[3px]">
			<div
				className="h-full bg-gradient-to-r from-merah via-merah to-kuning transition-[width] duration-150 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	)
}
