import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'

const TICKER_QUERY = groq`*[_type == 'site'][0].tickerItems[]-> {
	title,
	value,
	change,
	isPositive
}`

export default async function TickerBar() {
	const items = await client.fetch<Array<{
		title: string
		value: string
		change?: string
		isPositive: boolean
	}>>(TICKER_QUERY, {}, { next: { revalidate: 120 } })

	if (!items?.length) return null

	// Duplicate items for seamless scroll
	const tickerItems = [...items, ...items]

	return (
		<div className="bg-hitam-muda dark:bg-[#1a1a1a] border-b border-putih/10 overflow-hidden h-[34px] flex items-center">
			<div className="animate-marquee flex items-center gap-8 whitespace-nowrap hover:[animation-play-state:paused]">
				{tickerItems.map((item, i) => (
					<div key={i} className="flex items-center gap-2 text-xs shrink-0">
						<span className="text-putih/50 font-medium">{item.title}</span>
						<span className="text-putih/90 font-semibold tabular-nums">{item.value}</span>
						{item.change && (
							<span
								className={`font-semibold tabular-nums ${
									item.isPositive ? 'text-hijau-zamrud' : 'text-merah'
								}`}
							>
								{item.isPositive ? '▲' : '▼'} {item.change}
							</span>
						)}
						<span className="text-putih/20 mx-2">|</span>
					</div>
				))}
			</div>
		</div>
	)
}
