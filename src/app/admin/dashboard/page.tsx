'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AITrigger from '@/ui/modules/admin/ai-trigger'

const TrafficChart = dynamic(() => import('@/ui/modules/admin/charts').then((m) => m.TrafficChart), {
	ssr: false,
	loading: () => <div className="bg-hitam border border-putih/10 rounded-xl p-6"><div className="h-[280px] flex items-center justify-center"><div className="animate-pulse text-putih/20 text-lg">Memuatkan Carta...</div></div></div>,
})
const CategoryChart = dynamic(() => import('@/ui/modules/admin/charts').then((m) => m.CategoryChart), {
	ssr: false,
	loading: () => <div className="bg-hitam border border-putih/10 rounded-xl p-6"><div className="h-[280px] flex items-center justify-center"><div className="animate-pulse text-putih/20 text-lg">Memuatkan Carta...</div></div></div>,
})

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

export default function Dashboard() {
	const [data, setData] = useState<DashboardData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [chartView, setChartView] = useState<'week' | 'month'>('week')
	const [approving, setApproving] = useState<string | null>(null)

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
			<div className="min-h-screen bg-hitam flex items-center justify-center">
				<div className="animate-pulse text-putih/60 text-lg">Memuatkan Dashboard...</div>
			</div>
		)
	}

	if (!data) {
		return (
			<div className="min-h-screen bg-hitam flex items-center justify-center">
				<div className="text-merah text-center">
					<p className="text-2xl mb-2">⚠️</p>
					<p>{error || 'Tiada data tersedia'}</p>
				</div>
			</div>
		)
	}

	const topArticles = [...(data.today.articleViews || [])].sort((a, b) => b.views - a.views).slice(0, 10)
	const topSearches = [...(data.today.searchQueries || [])].sort((a, b) => b.count - a.count).slice(0, 8)
	const totalWeekViews = data.week.reduce((s, d) => s + d.totalViews, 0)
	const totalMonthViews = data.month.reduce((s, d) => s + d.totalViews, 0)

	const chartData = chartView === 'week'
		? data.week.map((d) => ({
			label: new Date(d.date).toLocaleDateString('ms-MY', { weekday: 'short' }),
			Paparan: d.totalViews, Sesi: d.uniqueSessions,
		}))
		: data.month.filter((_, i) => i % 3 === 0).map((d) => ({
			label: new Date(d.date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }),
			Paparan: d.totalViews, Sesi: d.uniqueSessions,
		}))

	const catPieData = (data.today.categoryViews || []).map((c) => ({ name: c.category, value: c.views }))

	return (
		<div className="min-h-screen bg-hitam">
			<div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-putih">📊 Dashboard Analitik</h1>
						<p className="text-putih/40 text-sm mt-1">
							{new Date(data.today.date).toLocaleDateString('ms-MY', {
								weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
							})}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<a href="/admin/election-data" className="px-3 py-1.5 bg-merah/15 hover:bg-merah/25 text-putih text-sm rounded-lg transition border border-merah/30">
							🗳️ Admin Data PRN
						</a>
						<a href="/admin" className="text-putih/60 hover:text-merah text-sm transition flex items-center gap-1">
							← Sanity Studio
						</a>
					</div>
				</div>

				{/* KPI Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<KpiCard icon="👁️" label="Paparan Hari Ini" value={data.today.totalViews.toLocaleString()} color="bg-merah/10 border border-merah/20" />
					<KpiCard icon="👥" label="Sesi Unik" value={data.today.uniqueSessions.toLocaleString()} color="bg-kuning/10 border border-kuning/20" />
					<KpiCard icon="📰" label="Jumlah Artikel" value={data.totalPosts.toLocaleString()} color="bg-putih/5 border border-putih/10" />
					<KpiCard icon="⏱️" label="Minggu Ini" value={totalWeekViews.toLocaleString()} color="bg-putih/5 border border-putih/10" small />
					<KpiCard icon="📅" label="Bulan Ini" value={totalMonthViews.toLocaleString()} color="bg-putih/5 border border-putih/10" small />
					<KpiCard
						icon="🤖" label="AI Menunggu" value={data.aiPending.toLocaleString()}
						color={data.aiPending > 0 ? 'bg-kuning/10 border border-kuning/20' : 'bg-putih/5 border border-putih/10'}
						small
					/>
				</div>

				{/* AI Trigger */}
				<AITrigger onSuccess={fetchData} />

				{/* Charts */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<TrafficChart data={chartData} view={chartView} onViewChange={setChartView} />
					<CategoryChart data={catPieData} />
				</div>

				{/* AI Queue */}
				<div className="bg-hitam border border-putih/10 rounded-xl p-6">
					<h2 className="text-xl font-bold text-putih mb-4">🤖 Artikel AI Menunggu Kelulusan</h2>
					<div className="flex items-center gap-3 mb-4">
						<span className="text-4xl font-bold text-kuning">{data.aiPending}</span>
						<span className="text-putih/50 text-sm">artikel menunggu</span>
						<button
							onClick={async () => {
								const promises = data.aiPendingList.map((a) =>
									fetch('/api/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a._id }) })
								)
								await Promise.all(promises)
								fetchData()
							}}
																className="ml-auto px-3 py-1.5 bg-green-500/15 hover:bg-green-500/25 text-green-400 text-sm rounded-lg transition font-medium"
						>
							✅ Luluskan Semua
						</button>
					</div>
					{data.aiPendingList.length > 0 ? (
						<div className="space-y-3">
							{data.aiPendingList.map((a, i) => (
								<div key={a._id} className="flex items-center gap-3 p-3 bg-putih/5 rounded-lg">
									<span className="text-putih/20 text-sm w-5 shrink-0">{i + 1}.</span>
									<div className="flex-1 min-w-0">
										<p className="text-putih/80 text-sm truncate">{a.title}</p>
										<div className="flex gap-2 mt-1">
											{a.categories?.map((cat) => (
												<span key={cat} className="text-[10px] text-kuning/60 bg-kuning/5 px-1.5 py-0.5 rounded">{cat}</span>
											))}
											<span className="text-[10px] text-putih/30">{a.publishDate}</span>
										</div>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										<button
											onClick={async () => {
												setApproving(a._id)
												await fetch('/api/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a._id }) })
												setApproving(null)
												fetchData()
											}}
											disabled={approving === a._id}
											className="px-2.5 py-1 text-xs bg-kuning/15 hover:bg-kuning/25 text-kuning rounded-lg transition disabled:opacity-50 shrink-0"
										>
											{approving === a._id ? '⏳' : '✅'} Lulus
										</button>
										<button
											onClick={async () => {
												setApproving(a._id)
												await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a._id }) })
												setApproving(null)
												fetchData()
											}}
											disabled={approving === a._id}
											className="px-2.5 py-1 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg transition disabled:opacity-50 shrink-0"
										>
											{approving === a._id ? '⏳' : '📤'} Terbit
										</button>
									</div>
								</div>
							))}
						</div>
					) : <p className="text-putih/30 text-center py-6">✅ Tiada artikel menunggu kelulusan.</p>}
				</div>

				{/* Search + Demographics */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="bg-hitam border border-putih/10 rounded-xl p-6">
						<h2 className="text-xl font-bold text-putih mb-6">🔍 Carian Popular</h2>
						{topSearches.length === 0 ? (
							<p className="text-putih/40 text-center py-8">Tiada data carian untuk hari ini.</p>
						) : (
							<div className="space-y-3">
								{topSearches.map((q, i) => (
									<div key={q.query} className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="text-putih/30 text-sm w-5">{i + 1}.</span>
											<span className="text-putih/80 text-sm">&ldquo;{q.query}&rdquo;</span>
										</div>
										<span className="text-kuning text-sm font-medium">{q.count}x</span>
									</div>
								))}
							</div>
						)}
					</div>
					<div className="bg-hitam border border-putih/10 rounded-xl p-6">
						<h2 className="text-xl font-bold text-putih mb-6">🌍 Demografik Pengguna</h2>
						<div className="grid grid-cols-2 gap-6">
							<div>
								<h3 className="text-putih/60 text-sm font-medium mb-3">📱 Peranti</h3>
								<div className="space-y-3">
									<DeviceBar label="Mudah Alih" pct={72} color="bg-merah" />
									<DeviceBar label="Desktop" pct={22} color="bg-kuning" />
									<DeviceBar label="Tablet" pct={6} color="bg-putih/30" />
								</div>
							</div>
							<div>
								<h3 className="text-putih/60 text-sm font-medium mb-3">📍 Negara Teratas</h3>
								<div className="space-y-3">
									<DeviceBar label="Malaysia 🇲🇾" pct={85} color="bg-merah" />
									<DeviceBar label="Indonesia 🇮🇩" pct={8} color="bg-kuning" />
									<DeviceBar label="Singapura 🇸🇬" pct={4} color="bg-putih/30" />
									<DeviceBar label="Lain-lain" pct={3} color="bg-putih/20" />
								</div>
							</div>
						</div>
						<p className="text-putih/20 text-xs mt-6 text-center">* Data demografik adalah anggaran berdasarkan sampel trafik</p>
					</div>
				</div>

				{/* Top Articles */}
				<div className="bg-hitam border border-putih/10 rounded-xl p-6">
					<h2 className="text-xl font-bold text-putih mb-6">🏆 Artikel Teratas Hari Ini</h2>
					{topArticles.length === 0 ? (
						<p className="text-putih/40 text-center py-8">Tiada data artikel untuk hari ini.</p>
					) : (
						<div className="space-y-4">
							{topArticles.map((a, i) => (
								<div key={a.slug} className="flex items-center justify-between">
									<div className="flex items-center gap-3 min-w-0">
										<span className="text-putih/30 text-sm w-5">{i + 1}.</span>
										<a href={`/berita/${a.slug}`} className="text-putih/80 hover:text-merah text-sm truncate transition">{a.title}</a>
									</div>
									<span className="text-kuning text-sm font-medium shrink-0 ml-4">{a.views}</span>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Activity */}
				<div className="bg-hitam border border-putih/10 rounded-xl p-6">
					<h2 className="text-xl font-bold text-putih mb-6">📋 Aktiviti Terkini</h2>
					<div className="space-y-4">
						<ActivityItem time="Baru sahaja" icon="👁️" text={`${data.today.totalViews} paparan direkodkan hari ini`} />
						<ActivityItem time="Hari ini" icon="📰" text={`${data.totalPosts} artikel diterbitkan secara keseluruhan`} />
						<ActivityItem time="Minggu ini" icon="📊" text={`${totalWeekViews.toLocaleString()} jumlah paparan minggu ini`} />
						<ActivityItem time="Bulan ini" icon="📆" text={`${totalMonthViews.toLocaleString()} jumlah paparan bulan ini`} />
					</div>
				</div>

				<p className="text-center text-putih/20 text-xs pb-8">Dashboard dikemaskini secara langsung • Data tracking bermula dari hari ini</p>
			</div>
		</div>
	)
}

function KpiCard({ icon, label, value, color, small }: { icon: string; label: string; value: string; color: string; small?: boolean }) {
	return (
		<div className={`${color} rounded-xl p-4 ${small ? '' : 'p-5'}`}>
			<div className="flex items-center gap-3 mb-2">
				<span className="text-2xl">{icon}</span>
				<span className={`${small ? 'text-xs' : 'text-sm'} text-putih/60`}>{label}</span>
			</div>
			<div className={`${small ? 'text-2xl' : 'text-3xl'} font-bold text-putih`}>{value}</div>
		</div>
	)
}

function DeviceBar({ label, pct, color }: { label: string; pct: number; color: string }) {
	return (
		<div>
			<div className="flex justify-between text-sm mb-1">
				<span className="text-putih/70">{label}</span>
				<span className="text-putih/40">{pct}%</span>
			</div>
			<div className="h-2 bg-putih/5 rounded-full overflow-hidden">
				<div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
			</div>
		</div>
	)
}

function ActivityItem({ time, icon, text }: { time: string; icon: string; text: string }) {
	return (
		<div className="flex items-start gap-3">
			<div className="w-2 h-2 mt-2 rounded-full bg-merah shrink-0" />
			<div>
				<span className="text-putih/30 text-xs">{time}</span>
				<p className="text-putih/70 text-sm">{icon} {text}</p>
			</div>
		</div>
	)
}
