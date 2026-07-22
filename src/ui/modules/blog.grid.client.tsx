'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Post = {
	_id: string
	title?: string
	excerpt?: string
	publishDate?: string
	mainImage?: { asset?: { _ref: string } }
	slug?: string
	categories?: Array<{ _id: string; title: string; slug: string; color?: string }>
}

type Props = {
	perPage: number
	categoryFilterRef?: string
	blogDir: string
}

export default function NewsGridClient({ perPage, categoryFilterRef, blogDir }: Props) {
	const [items, setItems] = useState<Post[]>([])
	const [page, setPage] = useState(2) // start at page 2 (page 1 already server-rendered)
	const [loading, setLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)

	const loadMore = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch('/api/grid-posts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ page, perPage, categoryFilterRef }),
			})
			const data = await res.json()
			if (data.posts?.length) {
				setItems((prev) => [...prev, ...data.posts])
				setPage((p) => p + 1)
				if (data.posts.length < perPage) setHasMore(false)
			} else {
				setHasMore(false)
			}
		} catch {
			// silent fail
		} finally {
			setLoading(false)
		}
	}, [page, perPage, categoryFilterRef])

	return (
		<>
			{items.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
					{items.map((post) => {
						const postSlug = post.slug ? `${blogDir}${post.slug}` : '#'
						return (
							<article key={post._id} className="group card-hover rounded-lg bg-putih dark:bg-hitam-muda border border-kelabu dark:border-putih/10 overflow-hidden">
								<Link href={postSlug} className="block overflow-hidden">
									{post.mainImage ? (
										<Image
											src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${post.mainImage.asset?._ref?.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`}
											alt={post.title ?? ''}
											width={400}
											height={266}
											className="w-full aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									) : (
										<div className="w-full aspect-[3/2] bg-abu dark:bg-hitam flex items-center justify-center text-kelabu-gelap text-xs">
											Tiada Imej
										</div>
									)}
								</Link>
								<div className="p-4">
									<div className="flex flex-wrap gap-1.5 mb-2">
										{post.categories?.slice(0, 2).map((cat) => (
											<Link
												key={cat._id}
												href={`/kategori/${cat.slug}`}
												className="text-[10px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5 text-putih"
												style={{ backgroundColor: cat.color || 'var(--color-merah)' }}
											>
												{cat.title}
											</Link>
										))}
									</div>
									<Link href={postSlug}>
										<h3 className="font-bold text-sm leading-snug line-clamp-3 group-hover:text-merah transition-colors">
											{post.title}
										</h3>
									</Link>
									{post.publishDate && (
										<p className="text-xs text-kelabu-gelap dark:text-putih/40 mt-2">
											{new Date(post.publishDate).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}
										</p>
									)}
								</div>
							</article>
						)
					})}
				</div>
			)}
			{hasMore && (
				<div className="text-center mt-8">
					<button
						onClick={loadMore}
						disabled={loading}
						className="action-outline px-8 py-3 text-sm font-bold uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<span className="flex items-center gap-2">
								<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
								</svg>
								Memuat...
							</span>
						) : (
							'Muat Lagi'
						)}
					</button>
				</div>
			)}
		</>
	)
}
