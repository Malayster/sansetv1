import Link from 'next/link'

const DUMMY: Mkt[] = [
  { name: 'FBMKLCI', value: '1,583.42', change: '+2.18', pct: '+0.14%', dir: 'up' },
  { name: 'KLSE Emas', value: '12,488.30', change: '+18.05', pct: '+0.14%', dir: 'up' },
  { name: 'USD/MYR', value: '4.28', change: '+0.01', pct: '+0.23%', dir: 'up' },
  { name: 'SGD/MYR', value: '3.18', change: '-0.005', pct: '-0.16%', dir: 'down' },
  { name: 'Brent Crude', value: '$78.42', change: '-0.85', pct: '-1.07%', dir: 'down' },
  { name: 'Emas 999.9', value: 'RM 384.50', change: '+1.20', pct: '+0.31%', dir: 'up' },
]
type Mkt = { name: string; value: string; change: string; pct: string; dir: 'up' | 'down' }

const colors = (d: 'up' | 'down') => d === 'up' ? 'text-emerald-700' : 'text-red-600'

export function MarketData({ full }: { full?: boolean }) {
  return <section>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-[13px] font-bold text-gray-800 font-serif">Data Pasaran</h3>
      <Link href="/pasaran" className="text-[10px] text-[#C41E3A] font-bold hover:underline">Lihat semua ›</Link>
    </div>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 border-t border-b border-gray-200 py-3">
      {DUMMY.map(m => (
        <div key={m.name} className="text-center">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{m.name}</div>
          <div className="text-[13px] font-bold text-gray-900">{m.value}</div>
          <div className={`text-[10px] font-semibold mt-0.5 ${colors(m.dir)}`}>
            {m.change} ({m.pct})
          </div>
        </div>
      ))}
    </div>
    <p className="text-[9px] text-gray-400 mt-1.5">* Data tertangguh sekurang-kurangnya 15 minit</p>
  </section>
}