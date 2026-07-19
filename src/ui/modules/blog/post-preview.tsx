import Image from 'next/image'
import { ROUTES } from '@/lib/env'
import { cn } from '@/lib/utils'
import type { BlogCategory, BlogPost, Person } from '@/sanity/types'
import Eyebrow from '@/ui/eyebrow'
import Img from '@/ui/img'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import Byline from './byline'
import Categories from './categories'
import Date from './date'

export default function ({
	post,
	className,
}: {
	post: BlogPost & { isFeatured?: boolean }
} & React.ComponentProps<'li'>) {
	return (
		<li className={cn('group relative', className)}>
			<figure className="bg-foreground/5 relative aspect-video overflow-hidden rounded-lg">
				{post.metadata?.image ? (
					<Img
						className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
						image={post.metadata?.image}
						width={400}
						alt={post.title ?? ''}
					/>
				) : (
					<Image
						src={`/api/og?slug=${ROUTES.blog}/${post.metadata?.slug?.current}&invert=1`}
						className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
						alt={post.title ?? ''}
						width={400}
						height={(400 * 9) / 16}
					/>
				)}

				{post.isFeatured && (
					<Eyebrow
						className="text-background bg-merah/80 m-2 absolute top-0 left-0 px-2 py-0.5 text-xs font-bold uppercase rounded-sm backdrop-blur"
						value="Featured"
					/>
				)}
			</figure>

			<div className="mt-3 space-y-2">
				<Categories
					categories={post.categories as unknown as BlogCategory[]}
					className="flex flex-wrap gap-1"
				/>

				<SanityLink
					className="block leading-snug text-current after:absolute after:inset-0 hover:text-merah transition-colors"
					link={{ type: 'internal', internal: post } as unknown as SanityLinkType}
				>
					<h3 className="font-bold text-sm line-clamp-2 group-hover:text-merah transition-colors">
						{post.title}
					</h3>
				</SanityLink>

				<div className="flex items-center gap-3 text-xs text-putih/50">
					<Date date={post.publishDate} />
					<Byline author={post.author as unknown as Person} />
				</div>
			</div>
		</li>
	)
}
