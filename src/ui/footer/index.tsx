import { PortableText } from 'next-sanity'
import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import CustomHTML from '@/ui/modules/custom-html'
import NewsletterForm from '@/ui/newsletter-form'
import SocialNavigation from '@/ui/social-navigation'
import Navigation from './navigation'

export default async function Footer() {
  const site = await getSite()
  const blurb = site?.footer?.blurb

  return (
    <footer className="bg-[#000000] text-white border-t-[3px] border-[#F5A623] mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* 4 columns */}
        <div className="grid gap-8 max-md:grid-cols-1 md:grid-cols-4">
          {/* Col 1: Tentang Kami */}
          <div className="flex flex-col items-center gap-3 max-md:text-center md:items-start">
            <Logo className="[&_img]:h-[2lh]" variant="dark" />
            {blurb && (
              <div className="prose text-sm text-white/70">
                <PortableText
                  value={blurb}
                  components={{
                    types: {
                      'custom-html': ({ value }) => <CustomHTML {...value} />,
                    },
                  }}
                />
              </div>
            )}
            <SocialNavigation className="social [&_svg]:size-lh link flex items-center gap-4 max-md:justify-center [&_a]:text-[#C41E3A] [&_a]:hover:text-[#F5A623]" />
          </div>

          {/* Col 2: Kategori */}
          <div className="max-md:text-center">
            <h4 className="text-[#F5A623] text-sm font-bold uppercase mb-4 tracking-wide">Kategori</h4>
            <Navigation />
          </div>

          {/* Col 3: Hubungi */}
          <div className="max-md:text-center space-y-3">
            <h4 className="text-[#F5A623] text-sm font-bold uppercase mb-4 tracking-wide">Hubungi</h4>
            <div className="flex flex-col items-center gap-2 md:items-start text-sm text-white/60">
              <a href="mailto:redaksi@suara-anaknegeri.com" className="hover:text-[#F5A623] transition-colors">redaksi@suara-anaknegeri.com</a>
              <a href="tel:+60312345678" className="hover:text-[#F5A623] transition-colors">+603-1234 5678</a>
              <span>No. 1, Jalan Media, 50000 Kuala Lumpur</span>
            </div>
          </div>

          {/* Col 4: Ikuti Kami */}
          <div className="max-md:text-center space-y-3">
            <h4 className="text-[#F5A623] text-sm font-bold uppercase mb-4 tracking-wide">Ikuti Kami</h4>
            <div className="flex flex-col items-center gap-2 md:items-start text-sm">
              <a href="/tentang" className="text-white/60 hover:text-[#F5A623] transition-colors">Tentang Kami</a>
              <a href="/redaksi" className="text-white/60 hover:text-[#F5A623] transition-colors">Redaksi</a>
              <a href="/pedoman-media-siber" className="text-white/60 hover:text-[#F5A623] transition-colors">Pedoman Media Siber</a>
              <a href="/dasar-privasi" className="text-white/60 hover:text-[#F5A623] transition-colors">Dasar Privasi</a>
              <a href="/iklan" className="text-white/60 hover:text-[#F5A623] transition-colors">Pengiklanan</a>
            </div>
          </div>
        </div>

        {/* Footer text disclaimer */}
        {site?.footerText && (
          <div className="border-t border-white/10 mt-10 pt-6 text-center">
            <p className="text-white/40 text-xs italic">{site.footerText}</p>
          </div>
        )}

        {/* Newsletter */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="max-w-md mx-auto text-center space-y-3">
            <h4 className="text-[#F5A623] text-sm font-bold uppercase tracking-wide">{'\U0001F4EC'} Langgan Newsletter</h4>
            <p className="text-white/50 text-xs">Dapatkan berita terkini terus ke inbox anda. Tiada spam.</p>
            <NewsletterForm source="footer" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
            <a href="/" className="hover:text-[#F5A623] transition-colors">Beranda</a>
            <a href="/tentang" className="hover:text-[#F5A623] transition-colors">Tentang</a>
            <a href="/redaksi" className="hover:text-[#F5A623] transition-colors">Redaksi</a>
            <a href="/pedoman-media-siber" className="hover:text-[#F5A623] transition-colors">Pedoman Media Siber</a>
          </div>
          <div className="[&_a]:link text-center mt-3 [&_a]:text-[#C41E3A]/70 [&_a]:hover:text-[#F5A623]">
            <PortableText value={site?.copyright ?? []} />
          </div>
        </div>
      </div>
    </footer>
  )
}
