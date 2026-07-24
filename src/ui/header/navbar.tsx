'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

type SubItem = { label: string; href: string }
type MenuItem = { label: string; href?: string; columns?: { title: string; items: SubItem[] }[] }

const menuItems: MenuItem[] = [
  { label: 'Utama', href: '/' },
  { label: 'Nasional', columns: [
    { title: 'Berita Tempatan', items: [{ label: 'Semasa', href: '/kategori/nasional' },{ label: 'Komuniti', href: '/tag/komuniti' },{ label: 'Pendidikan', href: '/tag/pendidikan' }] },
    { title: 'Politik', items: [{ label: 'Kerajaan', href: '/kategori/politik' },{ label: 'Parlimen', href: '/tag/parlimen' },{ label: 'Pilihan Raya', href: '/tag/pilihan-raya' }] },
    { title: 'Jenayah & Mahkamah', items: [{ label: 'Mahkamah', href: '/tag/mahkamah' },{ label: 'Jenayah', href: '/tag/jenayah' },{ label: 'Kes Rasuah', href: '/tag/rasuah' }] },
    { title: 'Lain-lain', items: [{ label: 'Cuaca & Bencana', href: '/tag/cuaca' },{ label: 'Agama', href: '/tag/agama' },{ label: 'Wawancara Khas', href: '/tag/wawancara' }] },
  ]},
  { label: 'Dunia', columns: [
    { title: 'Antarabangsa', items: [{ label: 'Asia Pasifik', href: '/kategori/dunia' },{ label: 'Timur Tengah', href: '/tag/timur-tengah' },{ label: 'Eropah', href: '/tag/eropah' },{ label: 'Amerika', href: '/tag/amerika' }] },
    { title: 'ASEAN', items: [{ label: 'Indonesia', href: '/tag/indonesia' },{ label: 'Singapura', href: '/tag/singapura' },{ label: 'Thailand', href: '/tag/thailand' },{ label: 'Filipina', href: '/tag/filipina' }] },
  ]},
  { label: 'Bisnes', columns: [
    { title: 'Ekonomi', items: [{ label: 'Pasaran Saham', href: '/kategori/bisnes' },{ label: 'Ringgit', href: '/tag/ringgit' },{ label: 'Belanjawan', href: '/tag/belanjawan' }] },
    { title: 'Kewangan', items: [{ label: 'Perbankan', href: '/tag/perbankan' },{ label: 'Insurans', href: '/tag/insurans' },{ label: 'Pelaburan', href: '/tag/pelaburan' }] },
    { title: 'Industri', items: [{ label: 'Hartanah', href: '/tag/hartanah' },{ label: 'Automotif', href: '/tag/automotif' },{ label: 'Startup', href: '/tag/startup' },{ label: 'Minyak & Gas', href: '/tag/minyak-gas' }] },
  ]},
  { label: 'Sukan', columns: [
    { title: 'Bola Sepak', items: [{ label: 'Liga Malaysia', href: '/kategori/sukan' },{ label: 'Liga Juara-Juara', href: '/tag/uefa' },{ label: 'Piala Dunia', href: '/tag/piala-dunia' },{ label: 'Harimau Malaya', href: '/tag/harimau-malaya' }] },
    { title: 'Sukan Lain', items: [{ label: 'Badminton', href: '/tag/badminton' },{ label: 'E-Sukan', href: '/tag/e-sukan' },{ label: 'MotoGP', href: '/tag/motogp' },{ label: 'Olimpik', href: '/tag/olimpik' }] },
  ]},
  { label: 'Hiburan', columns: [
    { title: 'Hiburan', items: [{ label: 'Filem & Drama', href: '/kategori/hiburan' },{ label: 'Muzik', href: '/tag/muzik' },{ label: 'Selebriti', href: '/tag/selebriti' },{ label: 'Viral', href: '/tag/viral' }] },
    { title: 'Gaya Hidup', items: [{ label: 'Kesihatan', href: '/tag/kesihatan' },{ label: 'Pelancongan', href: '/tag/pelancongan' },{ label: 'Makanan', href: '/tag/makanan' },{ label: 'Fesyen', href: '/tag/fesyen' }] },
    { title: 'Tekno', items: [{ label: 'Gajet', href: '/tag/gajet' },{ label: 'AI & Sains', href: '/tag/sains' },{ label: 'Media Sosial', href: '/tag/media-sosial' }] },
  ]},
  { label: 'Rencana', href: '/kategori/rencana' },
  { label: '🗳️ PRU16', href: '/election' },
]

export default function NavBar() {
  const [active, setActive] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (active === null) return
    const h = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setActive(null) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [active])

  return (
    <nav ref={navRef} className="hidden md:flex items-center h-full gap-0">
      {menuItems.map((item, i) => (
        <div key={item.label} className="relative h-full flex items-center" onMouseEnter={() => item.columns && setActive(i)} onMouseLeave={() => setActive(null)}>
          {item.href ? (
            <Link href={item.href} className="flex items-center px-2.5 h-full text-[12px] text-gray-700 hover:text-[#C41E3A] font-medium transition-colors">{item.label}</Link>
          ) : (
            <button className="flex items-center gap-0.5 px-2.5 h-full text-[12px] text-gray-700 hover:text-[#C41E3A] font-medium transition-colors">
              {item.label}
              <svg className="w-2.5 h-2.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
            </button>
          )}
          {item.columns && active === i && (
            <div className="absolute left-0 top-full pt-1 z-50">
              <div className="bg-white shadow-2xl border border-gray-200 rounded-sm min-w-[480px]">
                <div className="flex p-5 gap-6">
                  {item.columns.map(col => (
                    <div key={col.title} className="flex-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{col.title}</h4>
                      <ul className="space-y-0.5">
                        {col.items.map(sub => (
                          <li key={sub.label}><Link href={sub.href} className="block text-xs text-gray-700 hover:text-[#C41E3A] py-1" onClick={() => setActive(null)}>{sub.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
