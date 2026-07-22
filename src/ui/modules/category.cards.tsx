import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'

const QUERY = groq`*[_type == 'blog.category'] | order(title asc) {
	title,
	'slug': slug.current,
	color,
	description
}`

type Category = {
	title: string
	slug: string
	color?: string
	description?: string
}

export default async function CategoryCards({
	heading,
}: {
	heading?: string
	_key?: string
	_type?: string
}) {
	const categories = await client.fetch<Category[]>(QUERY, {}, { next: { revalidate: 300 } })

	if (!categories?.length) return null

	return (
		<section className="section">
			{heading && (
				<h2 className="text-xl font-bold border-l-4 border-merah pl-3 mb-6 uppercase tracking-wide text-foreground">
					{heading}
				</h2>
			)}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{categories.map((cat) => (
					<Link
						key={cat.slug}
						href={`/kategori/${cat.slug}`}
						className="group block rounded-lg p-5 border border-kelabu dark:border-putih/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:bg-putih/5"
						style={{
							borderTopColor: cat.color || undefined,
							borderTopWidth: cat.color ? '3px' : undefined,
						}}
					>
						<h3
							className="font-bold text-sm mb-2 group-hover:underline transition-colors"
							style={{ color: cat.color || undefined }}
						>
							{cat.title}
						</h3>
						{cat.description && (
							<p className="text-xs text-kelabu-gelap dark:text-putih/50 line-clamp-2">
								{cat.description}
							</p>
						)}
					</Link>
				))}
			</div>
		</section>
	)
}
