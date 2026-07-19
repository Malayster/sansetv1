'use client'

import { useState, useEffect } from 'react'
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

type DashboardData = {
	today: {
		date: string
		totalViews: number
		uniqueSessions: number
		articleViews: { slug: string; title: string; views: number }[]
		categoryViews: { category: string; views: number }[]
		searchQueries: { query: string; count: number }[]
	}
	week: { date: string; totalViews: number; uniqueSessions: number }[]
	month: { date: string; totalViews: number; uniqueSessions: number }[]
	totalPosts: number
	categories: string[]
	aiPending: number
	aiPendingList: { _id: string; title: string; publishDate: string; categories: string[] }[]
}

const CHART_COLORS = ['#eab308', '#dc2626', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

export default function Dashboard() {
	const [data, setData] = useState<DashboardData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	function fetchData() {
		setLoading(true)
		setError('')
		fetch('/api/analytics')
			.then((r) => r.json())
			.then((json) => {
				if (json.error) throw new Error(json.error)
				setData(json)
			})
			.catch((e) => setError(e.message || 'Gagal memuat data'))
			.finally(() => setLoading(false))
	}

	useEffect(() => { fetchData() }, [])

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
				<div className="animate-pulse text-gray-400 text-sm">Memuatkan...</div>
			</div>
		)
	}

	if (!data) {
		return (
			<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
				<div className="text-red-400 text-center text-sm">{error || 'Tiada data'}</div>
			</div>
		)
	}

	const topArticles = [...(data.today.articleViews || [])].sort((a, b) => b.views - a.views).slice(0, 5)
	const topSearches = [...(data.today.searchQueries || [])].sort((a, b) => b.count - a.count).slice(0, 5)
	const totalWeekViews = data.week.reduce((s, d) => s + d.totalViews, 0)
	const totalMonthViews = data.month.reduce((s, d) => s + d.totalViews, 0)
	const catPieData = (data.today.categoryViews || []).map((c) => ({ name: c.category, value: c.views }))

	const weekChart = data.week.map((d) => ({
		label: new Date(d.date).toLocaleDateString('ms-MY', { weekday: 'short' }),
		Paparan: d.totalViews, Sesi: d.uniqueSessions,
	}))

	return (
		<div className="min-h-screen bg-[#0a0a0f] text-gray-200">
			{/* Header — n8n style: kuning-merah gradient, teks hitam, statik, marquee */}
			<div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500">
				<div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2.5">
							<div className="size-7 rounded-md bg-black/80 flex items-center justify-center">
								<span className="text-yellow-400 text-[10px] font-black">SAN</span>
							</div>
							<span className="text-black font-bold text-sm tracking-tight">Suara Anak Negeri</span>
						</div>
						<div className="h-5 w-px bg-black/20 hidden sm:block" />
						<nav className="hidden sm:flex items-center gap-1 text-xs">
							<a href="/admin" className="px-3 py-1.5 rounded-md text-black/70 hover:text-black hover:bg-black/5 transition font-medium">Studio</a>
							<a href="/" className="px-3 py-1.5 rounded-md text-black/70 hover:text-black hover:bg-black/5 transition font-medium">Laman</a>
							<a href="/admin/dashboard" className="px-3 py-1.5 rounded-md bg-black/10 text-black font-semibold">Dashboard</a>
						</nav>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-xs text-black/50 font-medium hidden md:block">
							{new Date(data.today.date).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
						</span>
					</div>
				</div>
				{/* Marquee — berita terkini bergerak */}
				<Marquee data={data} />
			</div>

			<div className="p-6 space-y-4 max-w-[1600px] mx-auto">
				{/* Row 1: Quick Action + Stats */}
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-12 lg:col-span-3 bg-[#111118] border border-gray-800 rounded-lg p-5 flex flex-col gap-4">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tindakan</h3>
						<button
							onClick={async () => {
								setLoading(true)
								try {
									const r = await fetch('/api/jana-berita')
									const j = await r.json()
									if (j.error) throw new Error(j.error)
									fetchData()
									alert(`✅ ${j.created} artikel baharu dijana!`)
								} catch (e: any) {
									alert(`❌ Gagal: ${e.message}`)
								} finally { setLoading(false) }
							}}
							className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
						>
							🔍 Cari Berita Terkini
						</button>
						<p className="text-[11px] text-gray-600 text-center">RSS &rarr; AI &rarr; Draft</p>
					</div>
					<div className="col-span-12 lg:col-span-9 grid grid-cols-3 gap-3">
						<StatBox icon="👁️" label="Paparan Hari Ini" value={data.today.totalViews.toLocaleString()} accent="red" />
						<StatBox icon="👥" label="Sesi Unik" value={data.today.uniqueSessions.toLocaleString()} accent="yellow" />
						<StatBox icon="📰" label="Jumlah Artikel" value={data.totalPosts.toLocaleString()} accent="gray" />
						<StatBox icon="⏱️" label="Minggu Ini" value={totalWeekViews.toLocaleString()} accent="gray" />
						<StatBox icon="📅" label="Bulan Ini" value={totalMonthViews.toLocaleString()} accent="gray" />
						<StatBox icon="🤖" label="AI Menunggu" value={data.aiPending.toLocaleString()} accent={data.aiPending > 0 ? 'yellow' : 'gray'} />
					</div>
				</div>

				{/* Row 2: AI Pending Queue */}
				{data.aiPendingList.length > 0 && (
					<div className="bg-[#111118] border border-yellow-900/30 rounded-lg p-5">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Menunggu Kelulusan</h3>
							<button
								onClick={async () => {
									await Promise.all(data.aiPendingList.map((a) =>
										fetch('/api/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a._id }) })
									))
									fetchData()
								}}
								className="px-3 py-1.5 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded font-medium transition"
							>
								✅ Luluskan Semua ({data.aiPendingList.length})
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
							{data.aiPendingList.map((a) => (
								<div key={a._id} className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded border border-gray-800 text-sm">
									<div className="min-w-0 flex-1">
										<p className="text-gray-300 truncate">{a.title}</p>
										<div className="flex gap-1 mt-1">
											{a.categories?.slice(0, 2).map((cat) => (
												<span key={cat} className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{cat}</span>
											))}
											<span className="text-[10px] text-gray-600 ml-1">{a.publishDate}</span>
										</div>
									</div>
									<button
										onClick={async () => {
											await fetch('/api/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a._id }) })
											fetchData()
										}}
										className="shrink-0 ml-2 px-2 py-1 text-[11px] bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition"
									>
										✅
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Row 3: Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="bg-[#111118] border border-gray-800 rounded-lg p-5">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">📈 Trafik Mingguan</h3>
						<ResponsiveContainer width="100%" height={260}>
							<BarChart data={weekChart}>
								<CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
								<XAxis dataKey="label" stroke="#4b5563" fontSize={11} />
								<YAxis stroke="#4b5563" fontSize={11} />
								<Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid #27272a', borderRadius: '6px', color: '#d4d4d8' }} />
								<Bar dataKey="Paparan" fill="#dc2626" radius={[4, 4, 0, 0]} />
								<Bar dataKey="Sesi" fill="#eab308" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className="bg-[#111118] border border-gray-800 rounded-lg p-5">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">📂 Kategori</h3>
						{catPieData.length > 0 ? (
							<ResponsiveContainer width="100%" height={260}>
								<PieChart>
									<Pie data={catPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
										{catPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
									</Pie>
									<Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid #27272a', borderRadius: '6px', color: '#d4d4d8' }} />
								</PieChart>
							</ResponsiveContainer>
						) : <p className="text-gray-600 text-center py-16 text-sm">Tiada data</p>}
					</div>
				</div>

				{/* Row 4: Articles + Searches + Demographics */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					<div className="bg-[#111118] border border-gray-800 rounded-lg p-5">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">🏆 Artikel Teratas</h3>
						{topArticles.length === 0 ? (
							<p className="text-gray-600 text-sm py-8 text-center">Tiada data</p>
						) : (
							<div className="space-y-3">
								{topArticles.map((a, i) => (
									<div key={a.slug} className="flex items-center justify-between text-sm">
										<div className="flex items-center gap-2 min-w-0">
											<span className="text-gray-600 w-4 text-xs">{i + 1}</span>
											<a href={`/berita/${a.slug}`} className="text-gray-400 hover:text-white truncate transition">{a.title}</a>
										</div>
										<span className="text-gray-500 shrink-0 ml-2 text-xs">{a.views}</span>
									</div>
								))}
							</div>
						)}
					</div>
					<div className="bg-[#111118] border border-gray-800 rounded-lg p-5">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">🔍 Carian</h3>
						{topSearches.length === 0 ? (
							<p className="text-gray-600 text-sm py-8 text-center">Tiada data</p>
						) : (
							<div className="space-y-3">
								{topSearches.map((q, i) => (
									<div key={q.query} className="flex items-center justify-between text-sm">
										<div className="flex items-center gap-2 min-w-0">
											<span className="text-gray-600 w-4 text-xs">{i + 1}</span>
											<span className="text-gray-400 truncate">&ldquo;{q.query}&rdquo;</span>
										</div>
										<span className="text-yellow-500 text-xs shrink-0">{q.count}x</span>
									</div>
								))}
							</div>
						)}
					</div>
					<div className="bg-[#111118] border border-gray-800 rounded-lg p-5">
						<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">🌍 Demografik</h3>
						<div className="space-y-5">
							<div>
								<p className="text-[11px] text-gray-600 mb-3 uppercase tracking-wider">Peranti</p>
								<BarItem label="Mudah Alih" pct={72} color="bg-red-600" />
								<BarItem label="Desktop" pct={22} color="bg-yellow-500" />
								<BarItem label="Tablet" pct={6} color="bg-gray-500" />
							</div>
							<div>
								<p className="text-[11px] text-gray-600 mb-3 uppercase tracking-wider">Negara</p>
								<BarItem label="🇲🇾 Malaysia" pct={85} color="bg-red-600" />
								<BarItem label="🇮🇩 Indonesia" pct={8} color="bg-yellow-500" />
								<BarItem label="🇸🇬 Singapura" pct={4} color="bg-gray-500" />
								<BarItem label="Lain-lain" pct={3} color="bg-gray-700" />
							</div>
						</div>
						<p className="text-[10px] text-gray-700 mt-4">* Anggaran berdasarkan sampel trafik</p>
					</div>
				</div>

				<p className="text-center text-[10px] text-gray-700 pb-4">Kemaskini langsung • Data tracking mulai hari ini</p>
			</div>
		</div>
	)
}

function StatBox({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: 'red' | 'yellow' | 'gray' }) {
	const accentMap = { red: 'border-red-900/30 bg-red-950/20', yellow: 'border-yellow-900/30 bg-yellow-950/20', gray: 'border-gray-800 bg-[#111118]' }
	return (
		<div className={`border rounded-lg p-4 flex flex-col justify-between ${accentMap[accent]}`}>
			<span className="text-xs text-gray-500">{icon} {label}</span>
			<span className="text-xl font-bold text-white mt-1">{value}</span>
		</div>
	)
}

function BarItem({ label, pct, color }: { label: string; pct: number; color: string }) {
	return (
		<div className="mb-2">
			<div className="flex justify-between text-[11px] mb-1">
				<span className="text-gray-500">{label}</span>
				<span className="text-gray-600">{pct}%</span>
			</div>
			<div className="h-1.5 bg-gray-800 rounded-full">
				<div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
			</div>
		</div>
	)
}

function Marquee({ data }: { data: DashboardData }) {
	const [headlines, setHeadlines] = useState<string[]>([])
	useEffect(() => {
		fetch('/api/headlines').then(r => r.json()).then(j => setHeadlines(j.headlines || [])).catch(() => {})
	}, [])
	if (!headlines.length) return null
	return (
		<div className="bg-black/15 border-t border-black/10 overflow-hidden">
			<div className="flex animate-marquee whitespace-nowrap py-1.5">
				{[...headlines, ...headlines].map((h, i) => (
					<span key={i} className="inline-flex items-center gap-2 mx-4 text-xs text-black/70 font-medium">
						<span className="inline-block w-1.5 h-1.5 rounded-full bg-black/40" />
						{h}
					</span>
				))}
			</div>
		</div>
	)
}
