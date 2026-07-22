import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'
import { Module } from '@/ui/modules'
import Date from '@/ui/modules/blog/date'

const QUERY = groq`*[_type == 'blog.post' && featured == true && status in ['published', 'approved']]|order(publishDate desc)[0]{
	title,
	'mainImage': metadata.image,
	excerpt,
	publishDate,
	categories[]->{_id, title, 'slug': slug.current, color},
	'metadata': metadata{slug}
}`

type Post = {
	title?: string
	mainImage?: any
	excerpt?: string
	publishDate?: string
	categories?: Array<{ _id: string; title: string; slug: string; color?: string }>
	metadata?: { slug?: { current?: string } }
}

export default async function HeroFeatured({
	heading,
	...props
}: {
	heading?: string
	_key?: string
	_type?: string
}) {
	const post = await client.fetch<Post | null>(QUERY, {}, { next: { revalidate: 60 } })

	if (!post) return null

	const blogDir = `/${ROUTES.blog}/`
	const slug = `${blogDir}${post.metadata?.slug?.current ?? ''}`

	return (
		<Module _key={props._key} _type={props._type} as="section" className="section">
			{heading && (
				<h2 className="text-xl font-bold border-l-4 border-merah pl-3 mb-6 uppercase tracking-wide text-foreground">
					{heading}
				</h2>
			)}
			<article className="relative overflow-hidden rounded-lg shadow-md group">
				{post.mainImage ? (
					<Image
						src={urlFor(post.mainImage).width(1200).height(600).url()}
						alt={post.title ?? ''}
						width={1200}
						height={600}
						sizes="100vw"
						className="w-full max-h-[60vh] object-cover group-hover:scale-105 transition-transform duration-700"
						priority
					/>
				) : (
					<div className="w-full aspect-[2/1] bg-hitam-muda flex items-center justify-center text-putih/40 text-sm">
						Tiada Imej
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-hitam/95 via-hitam/30 to-transparent" />
				<div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
					<div className="flex flex-wrap gap-2 mb-3">
						{post.categories?.slice(0, 3).map((cat) => (
							<Link
								key={cat._id}
								href={`/kategori/${cat.slug}`}
								className="text-xs font-semibold uppercase tracking-wider text-putih px-2 py-0.5 rounded-sm"
								style={{ backgroundColor: cat.color || 'var(--color-merah)' }}
							>
								{cat.title}
							</Link>
						))}
					</div>
					<Link href={slug}>
						<h1 className="text-putih font-bold text-2xl md:text-4xl leading-tight line-clamp-3 hover:underline">
							{post.title}
						</h1>
					</Link>
					{post.excerpt && (
						<p className="text-putih/70 text-sm md:text-base mt-3 line-clamp-2 max-w-2xl">
							{post.excerpt}
						</p>
					)}
					<div className="flex items-center gap-3 mt-4">
						<span className="text-putih/50 text-xs">
							<Date date={post.publishDate} /> MYT
						</span>
						<Link
							href={slug}
							className="inline-flex items-center gap-1 text-putih bg-merah hover:bg-merah-gelap px-4 py-2 text-sm font-semibold rounded-sm transition-colors"
						>
							Baca Penuh
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
						</Link>
					</div>
				</div>
			</article>
		</Module>
	)
}
