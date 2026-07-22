import Link from 'next/link'

const NAV_SECTIONS = [
  { title: 'Tentang Kami', links: [
    { label: 'Tentang Suara Anak Negeri', href: '/tentang' },
    { label: 'Redaksi', href: '/redaksi' },
    { label: 'Kerjaya', href: '/kerjaya' },
    { label: 'Hubungi Kami', href: '/hubungi' },
    { label: 'Iklan & Langganan', href: '/iklan' },
  ]},
  { title: 'Bantuan', links: [
    { label: 'Soalan Lazim', href: '/faq' },
    { label: 'Pedoman Media Siber', href: '/pedoman-media-siber' },
    { label: 'Dasar Privasi', href: '/dasar-privasi' },
    { label: 'Terma & Syarat', href: '/terma' },
    { label: 'Hubungi Sokongan', href: '/hubungi' },
  ]},
  { title: 'Langganan', links: [
    { label: 'Pakej Langganan', href: '/iklan' },
    { label: 'Log Masuk Ahli', href: '/login' },
    { label: 'Buletin', href: '/buletin' },
    { label: 'RSS Feed', href: '/rss' },
  ]},
  { title: 'Komuniti & Acara', links: [
    { label: 'Acara Segera', href: '/acara' },
    { label: 'Komersial', href: '/komersial' },
    { label: 'Kerjasama Editorial', href: '/kerjasama' },
    { label: 'Program Pelatih', href: '/pelatih' },
  ]},
]

const SOCIALS = [
  { label: 'Facebook', svg: 'M9.236 9.529V8.125c0-.528.044-.834.942-.834h1.07V5.625H9.358C7.646 5.625 6.75 6.834 6.75 8.125v1.404H5.25v2h1.5V18h2.486v-6.471h1.662l.226-2H9.236z' },
  { label: 'X', svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.14l4.713 6.231 5.39-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z' },
  { label: 'WhatsApp', svg: 'M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.946-1.587L.057 24z' },
  { label: 'Telegram', svg: 'M9.78 18.654l.39-5.388 9.624-8.694c.42-.39-.09-.58-.66-.23L7.86 14.062l-5.22-1.65c-1.12-.34-1.14-1.16.25-1.71l20.35-7.86c.94-.43 1.86.28 1.5 1.7L20.3 24.6c-.28 1.35-1.1 1.67-2.26 1.05l-6.27-4.628-3.04 2.95-.52.04z' },
  { label: 'Instagram', svg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.265-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  { label: 'YouTube', svg: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
]

export default function Footer() {
  return (
    <footer className="bg-[#001f3f] text-white mt-16">
      {/* Newsletter registration bar */}
      <div className="border-b border-white/10">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold">Daftar Buletin</h3>
            <p className="text-sm text-white/60">Berita terkini terus ke inbox anda.</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="emel@contoh.com" className="flex-1 md:w-72 bg-white/10 border border-white/20 px-3 py-2 text-sm outline-none focus:border-[#C41E3A] transition-colors" />
            <button type="submit" className="bg-[#C41E3A] hover:bg-[#A01830] px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wide">Langgan</button>
          </form>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-10">
        {/* Logo + Social */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight">Suara Anak Negeri</Link>
            <p className="text-xs text-white/50 mt-1 tracking-widest uppercase">Jambatan Suara Rakyat</p>
          </div>
          <nav className="flex items-center gap-3">
            {SOCIALS.map(s => (
              <a key={s.label} href="#" aria-label={s.label} className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C41E3A] flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={s.svg} /></svg>
              </a>
            ))}
          </nav>
        </div>

        {/* 5 navigation columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8 border-t border-white/10 pt-8">
          {NAV_SECTIONS.map(sec => (
            <div key={sec.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">{sec.title}</h4>
              <ul className="space-y-1.5">
                {sec.links.map(l => (
                  <li key={l.label}><Link href={l.href} className="text-[12px] text-white/80 hover:text-white hover:underline transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Muat Turun</h4>
            <ul className="space-y-1.5">
              <li><Link href="#" className="text-[12px] text-white/80 hover:text-white hover:underline transition-colors">App Store</Link></li>
              <li><Link href="#" className="text-[12px] text-white/80 hover:text-white hover:underline transition-colors">Google Play</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/50">
          <p>© 2026 Suara Anak Negeri. Hak cipta terpelihara.</p>
          <div className="flex items-center gap-4">
            <Link href="/dasar-privasi" className="hover:text-white">Privasi</Link>
            <Link href="/terma" className="hover:text-white">Terma</Link>
            <Link href="/pedoman-media-siber" className="hover:text-white">Pedoman Media</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}