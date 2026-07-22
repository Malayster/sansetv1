import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'
import Date from '@/ui/modules/blog/date'
import NewsGridClient from '@/ui/modules/blog.grid.client'

type Post = {
	_id: string
	title?: string
	excerpt?: string
	publishDate?: string
	mainImage?: any
	slug?: string
	categories?: Array<{ _id: string; title: string; slug: string; color?: string }>
	tags?: string[]
}

export default async function BlogGrid({
	heading,
	perPage = 12,
	categoryFilter,
}: {
	heading?: string
	perPage?: number
	categoryFilter?: { _ref: string }
	_key?: string
	_type?: string
}) {
	const blogDir = `/${ROUTES.blog}/`
	const params: Record<string, any> = { blogDir, perPage }
	if (categoryFilter?._ref) params.categoryFilterRef = categoryFilter._ref

	const posts = await client.fetch<Post[]>(
		groq`*[_type == 'blog.post' && status in ['published', 'approved']${categoryFilter?._ref ? ' && references($categoryFilterRef)' : ''}] | order(publishDate desc) [0...${perPage + 1}]{
	_id, title, excerpt, publishDate,
	'mainImage': metadata.image,
	'slug': metadata.slug.current,
	categories[]->{_id, title, 'slug': slug.current, color},
	tags
}`,
		params,
		{ next: { revalidate: 60 } },
	)

	if (!posts?.length) return null

	const hasMore = posts.length > perPage
	const displayPosts = hasMore ? posts.slice(0, perPage) : posts

	return (
		<section className="section">
			{heading && (
				<h2 className="text-xl font-bold border-l-4 border-merah pl-3 mb-6 uppercase tracking-wide text-foreground">
					{heading}
				</h2>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{displayPosts.map((post) => {
					const postSlug = post.slug ? `${blogDir}${post.slug}` : '#'
					return (
						<article key={post._id} className="group card-hover rounded-lg bg-putih dark:bg-hitam-muda border border-kelabu dark:border-putih/10 overflow-hidden">
							<Link href={postSlug} className="block overflow-hidden">
								{post.mainImage ? (
									<Image
										src={urlFor(post.mainImage).width(400).height(266).url()}
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
								<div className="flex items-center gap-2 text-xs text-kelabu-gelap dark:text-putih/40 mt-2">
									<Date date={post.publishDate} />
								</div>
							</div>
						</article>
					)
				})}
			</div>
			{hasMore && (
				<NewsGridClient
					perPage={perPage}
					categoryFilterRef={categoryFilter?._ref}
					blogDir={blogDir}
				/>
			)}
		</section>
	)
}
