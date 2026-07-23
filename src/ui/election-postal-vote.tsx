'use client'

interface PostalData {
  election: string
  cat1A: number
  cat1B: number
  cat1C: number
  absent: number | string
}

const POSTAL_DATA: PostalData[] = [
  { election: 'PRN N. Sembilan (2026)', cat1A: 12669, cat1B: 343, cat1C: 251, absent: 'N/A' },
  { election: 'PRU-15 (2022)', cat1A: 299097, cat1B: 48109, cat1C: 15739, absent: 2741 },
  { election: 'PRN Johor (2022)', cat1A: 28421, cat1B: 7814, cat1C: 118, absent: 376 },
  { election: 'PRN Selangor/NS/PK/KT (2023)', cat1A: 87666, cat1B: 7972, cat1C: 4705, absent: 1727 },
]

export default function PostalVotePanel() {
  const ns = POSTAL_DATA[0]
  const total = typeof ns.absent === 'number' ? ns.cat1A + ns.cat1B + ns.cat1C + ns.absent : ns.cat1A + ns.cat1B + ns.cat1C

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-[13px] text-gray-800 dark:text-gray-100 flex items-center gap-1.5 mb-3">
        📬 Undi Pos — N. Sembilan (2026)
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2.5 text-center">
          <div className="text-[18px] font-bold text-blue-700 dark:text-blue-300">{ns.cat1A.toLocaleString()}</div>
          <div className="text-[9px] text-blue-500 dark:text-blue-400 mt-0.5 leading-tight">Kategori 1A<br/><span className="text-[8px] opacity-70">Petugas SPR/Polis/Tentera</span></div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2.5 text-center">
          <div className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300">{ns.cat1B.toLocaleString()}</div>
          <div className="text-[9px] text-emerald-500 dark:text-emerald-400 mt-0.5 leading-tight">Kategori 1B<br/><span className="text-[8px] opacity-70">Pengundi Luar Negara</span></div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2.5 text-center">
          <div className="text-[18px] font-bold text-amber-700 dark:text-amber-300">{ns.cat1C.toLocaleString()}</div>
          <div className="text-[9px] text-amber-500 dark:text-amber-400 mt-0.5 leading-tight">Kategori 1C<br/><span className="text-[8px] opacity-70">Agensi Kerajaan</span></div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Jumlah Pengundi Pos</span>
        <span className="text-[15px] font-bold text-gray-800 dark:text-gray-100">{total.toLocaleString()}</span>
      </div>

      <details className="group">
        <summary className="text-[10px] text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform">▶</span> Perbandingan Pilihan Raya Lain
        </summary>
        <div className="mt-2 space-y-1">
          {POSTAL_DATA.slice(1).map(d => {
            const t = typeof d.absent === 'number' ? d.cat1A + d.cat1B + d.cat1C + d.absent : d.cat1A + d.cat1B + d.cat1C
            return (
              <div key={d.election} className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 py-1 px-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded">
                <span>{d.election}</span>
                <span className="font-medium text-gray-600 dark:text-gray-300">{t.toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      </details>

      <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 leading-tight">
        Sumber: <a href="https://github.com/TindakMalaysia/General-Election-Data" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">TindakMalaysia</a> · SPR
      </p>
    </div>
  )
}
