import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'

type Achievement = {
	_id: string
	title: string
	value: string
	icon: string
	link?: string
}

export default async function GovernmentAchievements({
	heading,
	limit = 3,
}: {
	heading?: string
	limit?: number
	_key?: string
	_type?: string
}) {
	const items = await client.fetch<Achievement[]>(
		groq`*[_type == 'governmentAchievement'] | order(order asc)[0...$limit]{_id, title, value, icon, link}`,
		{ limit },
		{ next: { revalidate: 300 } },
	)

	if (!items?.length) return null

	return (
		<section className="section">
			{heading && (
				<h2 className="text-xl font-bold border-l-4 border-emas pl-3 mb-6 uppercase tracking-wide text-foreground">
					{heading}
				</h2>
			)}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{items.map((item) => (
					<Link
						key={item._id}
						href={item.link || '#'}
						className={`group block bg-abu dark:bg-hitam-muda rounded-lg p-6 border border-emas/30 hover:border-emas transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${!item.link ? 'pointer-events-none' : ''}`}
					>
						<div className="text-3xl mb-3">{item.icon || '📊'}</div>
						<div className="text-2xl font-bold text-emas mb-1">{item.value}</div>
						<div className="text-sm text-kelabu-gelap dark:text-putih/60 group-hover:text-foreground transition-colors">
							{item.title}
						</div>
					</Link>
				))}
			</div>
		</section>
	)
}
