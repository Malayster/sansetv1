import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'

const QUERY = groq`*[_type == 'economicData'] | order(lastUpdated desc) {
	_id, title, value, change, isPositive, type, lastUpdated
}`

type EcoData = {
	_id: string
	title: string
	value: string
	change?: string
	isPositive: boolean
	type: string
	lastUpdated?: string
}

const TYPE_LABELS: Record<string, string> = {
	bskl: 'Bursa / Ringgit',
	fdi: 'Pelaburan (FDI)',
	projekPerumahan: 'Perumahan',
}

export default async function EconomyBoxes({
	heading,
}: {
	heading?: string
	_key?: string
	_type?: string
}) {
	const data = await client.fetch<EcoData[]>(QUERY, {}, { next: { revalidate: 120 } })

	if (!data?.length) return null

	return (
		<section className="section">
			{heading && (
				<h2 className="text-xl font-bold border-l-4 border-hijau-zamrud pl-3 mb-6 uppercase tracking-wide text-foreground">
					{heading}
				</h2>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{data.map((item) => (
					<div
						key={item._id}
						className="bg-putih dark:bg-hitam-muda border border-kelabu dark:border-putih/10 rounded-lg p-5 flex flex-col gap-2"
					>
						<div className="flex items-center justify-between">
							<span className="text-[10px] font-semibold uppercase tracking-wider text-kelabu-gelap dark:text-putih/40">
								{TYPE_LABELS[item.type] || item.type}
							</span>
							{item.change && (
								<span
									className={`text-xs font-semibold tabular-nums flex items-center gap-0.5 ${
										item.isPositive ? 'text-hijau-zamrud' : 'text-merah'
									}`}
								>
									{item.isPositive ? '▲' : '▼'} {item.change}
								</span>
							)}
						</div>
						<div className="text-2xl font-bold text-foreground tabular-nums">
							{item.value}
						</div>
						<div className="text-sm text-kelabu-gelap dark:text-putih/60">
							{item.title}
						</div>
						{item.lastUpdated && (
							<div className="text-[10px] text-kelabu-gelap dark:text-putih/30 mt-auto">
								{new Date(item.lastUpdated).toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	)
}
