import Link from 'next/link'

// Dummy Malaysian/regional market data (Nikkei-style ticker)
const FBMKLCI: Mkt[] = [
  { name: 'FBMKLCI', value: '1,583.42', change: '+2.18', pct: '+0.14%', dir: 'up' },
  { name: 'KLSE Emas', value: '12,488.30', change: '+18.05', pct: '+0.14%', dir: 'up' },
  { name: 'USD/MYR', value: '4.28', change: '+0.01', pct: '+0.23%', dir: 'up' },
  { name: 'SGD/MYR', value: '3.18', change: '-0.005', pct: '-0.16%', dir: 'down' },
  { name: 'Brent Crude', value: '$78.42', change: '-0.85', pct: '-1.07%', dir: 'down' },
  { name: 'Emas 999.9', value: 'RM 384.50', change: '+1.20', pct: '+0.31%', dir: 'up' },
]
type Mkt = { name: string; value: string; change: string; pct: string; dir: 'up' | 'down' }

export function MarketData() {
  return <div className="flex flex-col">
    <div className="flex items-baseline justify-between border-b-2 border-[#13334f] pb-1 mb-2">
      <h3 className="text-xs font-bold text-[#13334f] uppercase tracking-wider">Data Pasaran</h3>
      <Link href="/pasaran" className="text-[10px] text-[#C41E3A] hover:underline">Lihat semua ›</Link>
    </div>
    <ul className="divide-y divide-gray-100">
      {FBMKLCI.map(m => (
        <li key={m.name} className="flex items-center justify-between py-1.5">
          <span className="text-[11px] text-gray-700">{m.name}</span>
          <div className="text-right">
            <div className="text-[11px] font-semibold text-gray-900">{m.value}</div>
            <div className={`text-[10px] font-medium ${m.dir === 'up' ? 'text-emerald-700' : 'text-red-700'}`}>
              {m.change} <span className="opacity-80">({m.pct})</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
    <p className="text-[9px] text-gray-400 mt-1.5 italic">* Data tertangguh sekurang-kurangnya 15 minit</p>
  </div>
}