import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'

const QUERY = groq`*[_type == 'electionInfo' && isActive == true][0]{
	electionName, date, electionType,
	states[]{name, party, seats, result}
}`

type ElectionData = {
	electionName: string
	electionDate?: string
	electionType?: string
	states?: Array<{ name: string; party: string; seats: number; result: string }>
}

const PARTY_COLORS: Record<string, string> = {
	PH: '#E01931',
	BN: '#000080',
	PN: '#008080',
	GPS: '#FF6600',
	GRS: '#00BFFF',
	WARISAN: '#FF1493',
	BEBAS: '#808080',
}

export default async function ElectionWidget({
	heading,
}: {
	heading?: string
	_key?: string
	_type?: string
}) {
	const data = await client.fetch<ElectionData | null>(QUERY, {}, { next: { revalidate: 300 } })

	if (!data) return null

	const states = data.states || []
	const totalSeats = states.reduce((sum, s) => sum + s.seats, 0)

	if (states.length === 0) return null

	const barHeight = 28
	const barGap = 8
	const chartWidth = 600
	const chartHeight = states.length * (barHeight + barGap) + 10
	const labelWidth = 100
	const maxSeats = Math.max(...states.map((s) => s.seats), 1)

	return (
		<section className="section">
			{heading && (
				<h2 className="text-xl font-bold border-l-4 border-emas pl-3 mb-6 uppercase tracking-wide text-foreground">
					{heading}
				</h2>
			)}

			<div className="bg-putih dark:bg-hitam-muda border border-kelabu dark:border-putih/10 rounded-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-bold text-lg text-foreground">{data.electionName}</h3>
						{data.electionDate && (
							<p className="text-xs text-kelabu-gelap dark:text-putih/50 mt-1">
								{new Date(data.electionDate).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}
								{data.electionType === 'pru' ? ' • Parlimen' : ' • DUN'}
							</p>
						)}
					</div>
					<div className="text-right text-xs text-kelabu-gelap dark:text-putih/50">
						Jumlah: <span className="font-bold text-foreground">{totalSeats} kerusi</span>
					</div>
				</div>

				{/* Static SVG bar chart */}
				<div className="overflow-x-auto no-scrollbar">
					<svg
						viewBox={`0 0 ${chartWidth} ${chartHeight}`}
						width={chartWidth}
						height={chartHeight}
						className="w-full max-w-full"
						aria-label={`${data.electionName} — Agihan Kerusi`}
					>
						{states.map((s, i) => {
							const y = i * (barHeight + barGap) + 5
							const barMaxWidth = chartWidth - labelWidth - 60
							const barW = Math.max((s.seats / maxSeats) * barMaxWidth, 10)
							const color = PARTY_COLORS[s.party] || '#808080'
							return (
								<g key={s.name}>
									<text
										x={labelWidth - 8}
										y={y + barHeight / 2 + 4}
										textAnchor="end"
										className="fill-kelabu-gelap dark:fill-putih/60 text-xs"
										fontSize="11"
									>
										{s.name}
									</text>
									<rect
										x={labelWidth}
										y={y}
										width={barW}
										height={barHeight}
										fill={color}
										rx="3"
									/>
									<text
										x={labelWidth + barW + 6}
										y={y + barHeight / 2 + 4}
										className="fill-foreground"
										fontSize="11"
										fontWeight="bold"
									>
										{s.seats}
									</text>
									<text
										x={labelWidth + barW + 6}
										y={y + barHeight / 2 + 18}
										className="fill-kelabu-gelap dark:fill-putih/40"
										fontSize="9"
									>
										{s.party}
									</text>
								</g>
							)
						})}
					</svg>
				</div>

				{/* Party legend */}
				<div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-kelabu dark:border-putih/10">
					{Object.entries(PARTY_COLORS).map(([party, color]) => {
						const hasParty = states.some((s) => s.party === party)
						if (!hasParty) return null
						return (
							<span key={party} className="inline-flex items-center gap-1.5 text-xs text-kelabu-gelap dark:text-putih/50">
								<span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
								{party}
							</span>
						)
					})}
				</div>
			</div>
		</section>
	)
}
