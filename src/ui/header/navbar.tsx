'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

type SubItem = { label: string; href: string }
type MenuItem = { label: string; href?: string; columns?: { title: string; items: SubItem[] }[] }

const MSIAN_STATES: SubItem[] = [
  { label: 'Johor', href: '/tag/johor' }, { label: 'Kedah', href: '/tag/kedah' },
  { label: 'Kelantan', href: '/tag/kelantan' }, { label: 'Melaka', href: '/tag/melaka' },
  { label: 'N.Sembilan', href: '/tag/negeri-sembilan' }, { label: 'Pahang', href: '/tag/pahang' },
  { label: 'P.Pinang', href: '/tag/pulau-pinang' }, { label: 'Perak', href: '/tag/perak' },
  { label: 'Perlis', href: '/tag/perlis' }, { label: 'Sabah', href: '/tag/sabah' },
  { label: 'Sarawak', href: '/tag/sarawak' }, { label: 'Selangor', href: '/tag/selangor' },
  { label: 'Terengganu', href: '/tag/terengganu' },
]

const menuItems: MenuItem[] = [
  { label: 'Utama', href: '/' },
  { label: 'Dunia', columns: [
    { title: 'Malaysia', items: MSIAN_STATES.slice(0, 7) },
    { title: 'Malaysia', items: MSIAN_STATES.slice(7) },
    { title: 'ASEAN', items: [
      { label: 'Indonesia', href: '/tag/indonesia' }, { label: 'Singapura', href: '/tag/singapura' },
      { label: 'Thailand', href: '/tag/thailand' }, { label: 'Filipina', href: '/tag/filipina' },
      { label: 'Vietnam', href: '/tag/vietnam' }, { label: 'Myanmar', href: '/tag/myanmar' },
      { label: 'Kemboja', href: '/tag/kemboja' }, { label: 'Laos', href: '/tag/laos' },
      { label: 'Brunei', href: '/tag/brunei' }, { label: 'Timor Leste', href: '/tag/timor-leste' },
    ]},
    { title: 'Antarabangsa', items: [
      { label: 'Asia Pasifik', href: '/tag/asia-pasifik' }, { label: 'Timur Tengah', href: '/tag/timur-tengah' },
      { label: 'Eropah', href: '/tag/eropah' }, { label: 'Amerika', href: '/tag/amerika' },
      { label: 'Afrika', href: '/tag/afrika' }, { label: 'China', href: '/tag/china' },
      { label: 'Jepun', href: '/tag/jepun' }, { label: 'Korea Selatan', href: '/tag/korea-selatan' },
      { label: 'India', href: '/tag/india' }, { label: 'Australia', href: '/tag/australia' },
    ]},
  ]},
  { label: 'Trending', columns: [
    { title: 'Topik Hangat', items: [
      { label: 'Ketegangan Iran', href: '/tag/iran' }, { label: 'Inflasi', href: '/tag/inflasi' },
      { label: 'Pentadbiran Trump', href: '/tag/trump' }, { label: 'AI', href: '/tag/ai' },
      { label: 'EV', href: '/tag/ev' }, { label: 'Rantaian Bekalan', href: '/tag/rantaian-bekalan' },
      { label: 'Taiwan', href: '/tag/taiwan' }, { label: 'Bank Negara', href: '/tag/bnm' },
      { label: 'Imigresen', href: '/tag/imigresen' }, { label: 'ESG', href: '/tag/esg' },
      { label: 'Penjelasan', href: '/tag/penjelasan' },
    ]},
  ]},
  { label: 'Ekonomi', columns: [
    { title: 'Pasaran', items: [
      { label: 'Ekuiti', href: '/tag/ekuiti' }, { label: 'Mata Wang', href: '/tag/mata-wang' },
      { label: 'Bon', href: '/tag/bon' }, { label: 'Komoditi', href: '/tag/komoditi' },
    ]},
    { title: 'Industri', items: [
      { label: 'Semikonduktor', href: '/tag/semikonduktor' }, { label: 'Automotif', href: '/tag/automotif' },
      { label: 'Tenaga', href: '/tag/tenaga' }, { label: 'Pengangkutan', href: '/tag/pengangkutan' },
      { label: 'Peruncitan', href: '/tag/peruncitan' }, { label: 'Pelancongan', href: '/tag/pelancongan' },
    ]},
    { title: 'Kewangan', items: [
      { label: 'Perbankan', href: '/tag/perbankan' }, { label: 'Insurans', href: '/tag/insurans' },
      { label: 'Pelaburan', href: '/tag/pelaburan' }, { label: 'Minyak & Gas', href: '/tag/minyak-gas' },
    ]},
  ]},
  { label: 'Pasaran', columns: [
    { title: 'Indeks', items: [
      { label: 'FBMKLCI', href: '/tag/fbmklci' }, { label: 'KLSE Emas', href: '/tag/klse-emas' },
      { label: 'Ringgit/USD', href: '/tag/ringgit-usd' }, { label: 'Minyak Sawit', href: '/tag/minyak-sawit' },
    ]},
    { title: 'Kewangan', items: [
      { label: 'Bon', href: '/tag/bon' }, { label: 'Komoditi', href: '/tag/komoditi' },
      { label: 'Hartanah', href: '/tag/hartanah' }, { label: 'IPO', href: '/tag/ipo' },
    ]},
  ]},
  { label: 'Teknologi', columns: [
    { title: 'Teknologi', items: [
      { label: '#teknologiAsia', href: '/tag/teknologi-asia' }, { label: 'Semikonduktor', href: '/tag/semikonduktor' },
      { label: 'Permulaan', href: '/tag/permulaan' }, { label: 'Kripto', href: '/tag/kripto' },
      { label: 'AI & Sains', href: '/tag/sains' }, { label: 'Gajet', href: '/tag/gajet' },
    ]},
  ]},
  { label: 'Politik', columns: [
    { title: 'Malaysia', items: MSIAN_STATES.slice(0, 7) },
    { title: 'Malaysia', items: MSIAN_STATES.slice(7) },
    { title: 'Topik', items: [
      { label: 'Kerajaan', href: '/tag/kerajaan' }, { label: 'Parlimen', href: '/tag/parlimen' },
      { label: 'Pilihan Raya', href: '/tag/pilihan-raya' }, { label: 'Rasuah', href: '/tag/rasuah' },
      { label: 'Mahkamah', href: '/tag/mahkamah' }, { label: 'Jenayah', href: '/tag/jenayah' },
    ]},
    { title: 'Antarabangsa', items: [
      { label: 'China', href: '/tag/china' }, { label: 'Jepun', href: '/tag/jepun' },
      { label: 'Korea Selatan', href: '/tag/korea-selatan' }, { label: 'India', href: '/tag/india' },
      { label: 'AS', href: '/tag/amerika' }, { label: 'Timur Tengah', href: '/tag/timur-tengah' },
    ]},
  ]},
  { label: 'Ciri-ciri', columns: [
    { title: 'Sorotan', items: [
      { label: 'Dagang Asia', href: '/tag/dagang-asia' }, { label: 'Wang ASEAN', href: '/tag/wang-asean' },
      { label: 'Dasar Asia', href: '/tag/dasar-asia' },
    ]},
    { title: 'Visual', items: [
      { label: 'Datawatch', href: '/tag/datawatch' }, { label: 'Infografik', href: '/tag/infografik' },
      { label: 'Video', href: '/tag/video' }, { label: 'Foto', href: '/tag/foto' },
    ]},
  ]},
  { label: 'Pendapat', columns: [
    { title: 'Pendapat', items: [
      { label: 'Pilihan Editor', href: '/tag/pilihan-editor' }, { label: 'Pandangan Tamu', href: '/tag/pandangan' },
      { label: 'Rencana', href: '/kategori/rencana' },
    ]},
  ]},
  { label: 'Hidup & Seni', columns: [
    { title: 'Gaya Hidup', items: [
      { label: 'Kehidupan', href: '/tag/kehidupan' }, { label: 'Makanan', href: '/tag/makanan' },
      { label: 'Pelancongan', href: '/tag/pelancongan' }, { label: 'Kesihatan', href: '/tag/kesihatan' },
    ]},
    { title: 'Seni', items: [
      { label: 'Seni', href: '/tag/seni' }, { label: 'Buku', href: '/tag/buku' },
    ]},
  ]},
  { label: 'Tonton & Dengar', columns: [
    { title: 'Media', items: [
      { label: 'Podcast', href: '/tag/podcast' }, { label: 'Video', href: '/tag/video' },
      { label: 'Foto', href: '/tag/foto' },
    ]},
  ]},
]

export default function NavBar() {
  const [active, setActive] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const open = useCallback((i: number) => {
    clearTimeout(timeoutRef.current); setActive(i)
  }, [])
  const close = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActive(null), 200)
  }, [])

  useEffect(() => {
    if (active === null) return
    const h = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setActive(null) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [active])

  return (
    <nav ref={navRef} className="bg-[#001f3f] border-t border-white/[0.08]">
      <div className="max-w-[1180px] mx-auto px-4 md:px-0 flex items-center h-[40px] overflow-x-auto scrollbar-none">
        {menuItems.map((item, i) => (
          <div key={item.label} className="relative h-full flex items-center shrink-0 group"
            onMouseEnter={() => item.columns && open(i)} onMouseLeave={close}>
            {item.href ? (
              <Link href={item.href} className={`flex items-center px-3 h-full text-[12px] font-medium whitespace-nowrap transition-colors ${active === i ? 'text-[#F5C842]' : 'text-white/80 hover:text-white'}`}>
                {item.label}
              </Link>
            ) : (
              <button className={`flex items-center gap-1 px-3 h-full text-[12px] font-medium whitespace-nowrap transition-colors ${active === i ? 'text-[#F5C842]' : 'text-white/80 hover:text-white'}`}>
                {item.label}
                <svg className={`w-2.5 h-2.5 transition-transform ${active === i ? 'text-[#F5C842] rotate-180' : 'text-white/40'}`} viewBox="0 0 15 15">
                  <path fill="currentColor" fillRule="evenodd" d="M1.913 4.038L7.5 9.625l5.587-5.587 1.326 1.326L7.5 12.201.587 5.364z"/>
                </svg>
              </button>
            )}
            {item.columns && active === i && (
              <div className="absolute left-0 top-full z-[60] pt-px animate-in fade-in duration-150"
                onMouseEnter={() => clearTimeout(timeoutRef.current)} onMouseLeave={close}>
                <div className="bg-[#0a1628] border border-[#F5C842]/20 shadow-2xl shadow-black/50 min-w-[540px]">
                  <div className="flex p-5 gap-6">
                    {item.columns.map(col => (
                      <div key={col.title} className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F5C842]/70 mb-2">{col.title}</h4>
                        <ul className="space-y-0">
                          {col.items.map(sub => (
                            <li key={sub.label}>
                              <Link href={sub.href} className="block text-[11px] text-white/70 hover:text-[#F5C842] hover:bg-white/5 py-1 px-1 -mx-1 rounded transition-colors" onClick={() => setActive(null)}>{sub.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="h-[2px] bg-gradient-to-r from-[#F5C842] via-[#C41E3A] to-[#F5C842]" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {active !== null && <div className="fixed inset-0 bg-black/30 z-[55]" onClick={() => setActive(null)} />}
    </nav>
  )
}