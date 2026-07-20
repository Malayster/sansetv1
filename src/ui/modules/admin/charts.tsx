'use client'

import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const CHART_COLORS = ['#eab308', '#dc2626', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

type ChartData = { label: string; Paparan: number; Sesi: number }[]
type PieData = { name: string; value: number }[]

export function TrafficChart({
	data,
	view,
	onViewChange,
}: {
	data: ChartData
	view: 'week' | 'month'
	onViewChange: (v: 'week' | 'month') => void
}) {
	return (
		<div className="bg-hitam border border-putih/10 rounded-xl p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold text-putih">📈 Trafik</h2>
				<div className="flex gap-2">
					<button onClick={() => onViewChange('week')} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${view === 'week' ? 'bg-merah text-putih' : 'text-putih/40 hover:text-putih'}`}>Mingguan</button>
					<button onClick={() => onViewChange('month')} className={`px-3 py-1 rounded-lg text-xs font-medium transition ${view === 'month' ? 'bg-merah text-putih' : 'text-putih/40 hover:text-putih'}`}>Bulanan</button>
				</div>
			</div>
			<ResponsiveContainer width="100%" height={280}>
				<BarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
					<XAxis dataKey="label" stroke="#64748b" fontSize={11} />
					<YAxis stroke="#64748b" fontSize={11} />
					<Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
					<Bar dataKey="Paparan" fill="#dc2626" radius={[4, 4, 0, 0]} />
					<Bar dataKey="Sesi" fill="#eab308" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}

export function CategoryChart({ data }: { data: PieData }) {
	return (
		<div className="bg-hitam border border-putih/10 rounded-xl p-6">
			<h2 className="text-xl font-bold text-putih mb-4">📂 Kategori</h2>
			{data.length > 0 ? (
				<ResponsiveContainer width="100%" height={280}>
					<PieChart>
						<Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
							{data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
						</Pie>
						<Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			) : <p className="text-putih/40 text-center py-16">Tiada data kategori.</p>}
		</div>
	)
}
