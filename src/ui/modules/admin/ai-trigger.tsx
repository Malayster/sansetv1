'use client'

import { useState, useCallback } from 'react'

interface Props {
	onSuccess?: () => void
}

export default function AITrigger({ onSuccess }: Props) {
	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<{
		created: number
		failed: number
		results: { source: string; title: string; status: string; error?: string }[]
	} | null>(null)
	const [error, setError] = useState('')

	const handleJana = useCallback(async () => {
		setLoading(true)
		setError('')
		setResult(null)
		try {
			const res = await fetch('/api/jana-berita', { method: 'POST' })
			const json = await res.json()
			if (!res.ok) throw new Error(json.error || 'Gagal menjana berita')
			setResult(json)
			onSuccess?.()
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Ralat tidak diketahui')
		} finally {
			setLoading(false)
		}
	}, [onSuccess])

	return (
		<div className="bg-hitam border border-putih/10 rounded-xl p-6 mb-8">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-xl font-bold text-putih">🤖 Jana Berita AI</h2>
					<p className="text-putih/40 text-sm mt-0.5">
						Sedut berita terkini dari Bernama, Malaysiakini, Utusan &amp; Berita
						Harian
					</p>
				</div>
				<button
					onClick={handleJana}
					disabled={loading}
					className="px-5 py-2.5 bg-kuning hover:bg-kuning/80 disabled:opacity-50 disabled:cursor-not-allowed text-hitam font-bold rounded-xl text-sm transition flex items-center gap-2"
				>
					{loading ? (
						<>
							<span className="animate-spin">⏳</span> Menjana...
						</>
					) : (
						<>
							<span>🔍</span> Cari Berita Terkini
						</>
					)}
				</button>
			</div>

			{error && (
				<div className="bg-merah/10 border border-merah/30 rounded-lg p-3 mb-3 text-merah text-sm">
					⚠️ {error}
				</div>
			)}

			{result && (
				<div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-green-400 text-lg">✅</span>
						<span className="text-putih font-medium">
							{result.created} artikel berjaya dijana, {result.failed} gagal
						</span>
					</div>
					{result.results
						?.filter((r) => r.status === 'created')
						.map((r, i) => (
							<div key={i} className="text-putih/60 text-xs ml-7">
								📰 {r.title?.slice(0, 80)}...{' '}
								<span className="text-putih/30">({r.source})</span>
							</div>
						))}
					<a
						href="/admin"
						target="_blank"
						className="inline-block mt-3 text-kuning text-sm hover:underline"
					>
						Urus di Sanity Studio →
					</a>
				</div>
			)}

			{!result && !error && (
				<div className="text-putih/20 text-xs py-2">
					Klik butang di atas untuk robot AI menyedut berita terkini dari 4
					sumber RSS, menulis semula dalam Bahasa Malaysia, dan menyimpan sebagai
					draf di Sanity.
				</div>
			)}
		</div>
	)
}
