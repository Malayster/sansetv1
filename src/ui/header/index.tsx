import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import NavBar from './navbar'
import ThemeToggle from '@/ui/theme-toggle'

export default async function Header() {
  const site = await getSite()
  return (
    <header role="banner" className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center h-12 gap-4">
        {/* Logo */}
        <Logo className="shrink-0 mr-2" variant="light" />
        {/* Nav links — inline, same row */}
        <NavBar />
        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">
          <a href="/search" aria-label="Cari" className="text-gray-500 hover:text-[#C41E3A]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </a>
          <ThemeToggle />
          <a href="/iklan" className="text-[11px] font-bold text-white bg-[#C41E3A] hover:bg-[#A01830] px-3 py-1.5 uppercase tracking-wide transition-colors">Langgan</a>
        </div>
      </div>
    </header>
  )
}
