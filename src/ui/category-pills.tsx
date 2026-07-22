import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'

const CATEGORIES_QUERY = groq`*[_type == 'blog.category'] | order(title asc) {
	title,
	'slug': slug.current,
	color
}`

export default async function CategoryPills() {
	const categories = await client.fetch<Array<{
		title: string
		slug: string
		color?: string
	}>>(CATEGORIES_QUERY, {}, { next: { revalidate: 300 } })

	if (!categories?.length) return null

	return (
		<nav className="bg-hitam dark:bg-bg-dark border-b border-putih/10 overflow-x-auto no-scrollbar">
			<div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-1 py-1.5">
				{categories.map((cat) => (
					<Link
						key={cat.slug}
						href={`/kategori/${cat.slug}`}
						className="shrink-0 px-3 py-1 text-xs font-semibold rounded-full transition-colors"
						style={{
							backgroundColor: cat.color ? `${cat.color}18` : undefined,
							color: cat.color || undefined,
						}}
					>
						{cat.title}
					</Link>
				))}
			</div>
		</nav>
	)
}
