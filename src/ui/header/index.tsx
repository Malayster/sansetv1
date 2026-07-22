import { getSite } from '@/sanity/lib/queries'
import NavBar from './navbar'
import Link from 'next/link'

export default async function Header() {
  const site = await getSite()
  const title = site?.title || 'Suara Anak Negeri'

  return (
    <header role="banner" className="sticky top-0 z-50 bg-[#13314f]">
      {/* Top row: logo centered, search + login + subscribe right */}
      <div className="max-w-[1180px] mx-auto px-4 md:px-0 flex items-center justify-between h-[64px]">
        {/* Left: empty spacer for balance */}
        <div className="w-[100px]" />

        {/* Center: Logo */}
        <Link href="/" className="flex-1 flex justify-center">
          <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-white">{title}</span>
        </Link>

        {/* Right: search + login + subscribe */}
        <div className="flex items-center gap-3">
          <Link href="/search" aria-label="Cari" className="text-white hover:text-[#F5C842] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 25 25">
              <path fill="currentColor" fillRule="evenodd" d="M19.256 17.143c1.294-1.714 2.013-3.714 2.013-6C21.269 5.57 16.813 1 11.206 1 5.6 1 1 5.571 1 11.143c0 5.571 4.6 10.143 10.206 10.143 2.3 0 4.457-.715 6.038-2l4.312 4.285c.288.286.719.429 1.006.429.288 0 .72-.143 1.007-.429.575-.571.575-1.428 0-2l-4.313-4.428zm-8.05 1.143c-4.025 0-7.331-3.143-7.331-7.143s3.306-7.286 7.331-7.286 7.332 3.286 7.332 7.286c0 4-3.307 7.143-7.332 7.143z"/>
            </svg>
          </Link>
          <Link href="/login" className="text-[11px] text-white/80 hover:text-white font-medium transition-colors hidden md:block">Log Masuk</Link>
          <Link href="/iklan" className="text-[11px] font-bold text-white bg-[#C41E3A] hover:bg-[#A01830] px-3 py-1.5 uppercase tracking-wide transition-colors">Langgan</Link>
        </div>
      </div>

      {/* Slim nav bar — 11 items with mega-menu dropdowns */}
      <NavBar />
    </header>
  )
}
