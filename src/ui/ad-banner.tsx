'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { AdCampaign } from '@/lib/ad-server'

export default function AdBanner({
	position,
	category,
}: {
	position: string
	category?: string
}) {
	const [ad, setAd] = useState<AdCampaign | null>(null)
	const [tracked, setTracked] = useState(false)

	useEffect(() => {
		const params = new URLSearchParams({ position })
		if (category) params.set('category', category)

		fetch(`/api/ad?${params.toString()}`)
			.then((r) => r.json())
			.then((data) => {
				if (data?._id) setAd(data)
			})
			.catch(() => {})
	}, [])

	useEffect(() => {
		if (ad && !tracked) {
			setTracked(true)
			fetch('/api/ad/track', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ campaignId: ad._id, type: 'impression' }),
			}).catch(() => {})
		}
	}, [ad, tracked])

	const handleClick = () => {
		if (!ad) return
		fetch('/api/ad/track', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ campaignId: ad._id, type: 'click' }),
		}).catch(() => {})
	}

	if (!ad) return null

	const imgUrl = ad.image?.asset?.url
	if (!imgUrl) return null

	if (position === 'banner') {
		return (
			<div className="my-6 text-center">
				<a
					href={ad.link}
					target="_blank"
					rel="noopener noreferrer sponsored"
					onClick={handleClick}
				>
					<Image
						src={`${imgUrl}?w=728&h=90&fit=max&auto=format`}
						alt={ad.title}
						className="mx-auto rounded max-w-full h-auto"
						width={728}
						height={90}
					/>
				</a>
			</div>
		)
	}

	if (position === 'sidebar') {
		return (
			<div className="border border-kelabu/60 rounded-lg overflow-hidden bg-abu/30">
				<div className="text-center py-3 px-4">
					<span className="text-[10px] text-kelabu-gelap uppercase tracking-widest mb-2 inline-block">
						Iklan
					</span>
					<a
						href={ad.link}
						target="_blank"
						rel="noopener noreferrer sponsored"
						onClick={handleClick}
					>
						<Image
							src={`${imgUrl}?w=300&h=250&fit=max&auto=format`}
							alt={ad.title}
							className="mx-auto rounded"
							width={300}
							height={250}
						/>
					</a>
				</div>
			</div>
		)
	}

	if (position === 'inline') {
		return (
			<div className="my-8 text-center">
				<span className="text-[10px] text-kelabu-gelap uppercase tracking-widest block mb-1">
					Iklan
				</span>
				<a
					href={ad.link}
					target="_blank"
					rel="noopener noreferrer sponsored"
					onClick={handleClick}
				>
					<Image
						src={`${imgUrl}?w=600&h=200&fit=max&auto=format`}
						alt={ad.title}
						className="mx-auto rounded max-w-full h-auto"
						width={600}
						height={200}
					/>
				</a>
			</div>
		)
	}

	if (position === 'sticky-footer') {
		return (
			<div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-kelabu/30 shadow-lg md:hidden">
				<div className="flex items-center justify-between px-3 py-2">
					<span className="text-[9px] text-kelabu-gelap uppercase">Iklan</span>
					<button
						className="text-kelabu-gelap text-lg leading-none"
						onClick={() => setAd(null)}
					>
						×
					</button>
				</div>
				<a
					href={ad.link}
					target="_blank"
					rel="noopener noreferrer sponsored"
					onClick={handleClick}
					className="block"
				>
					<Image
						src={`${imgUrl}?w=320&h=50&fit=max&auto=format`}
						alt={ad.title}
						className="mx-auto"
						width={320}
						height={50}
					/>
				</a>
			</div>
		)
	}

	return null
}
