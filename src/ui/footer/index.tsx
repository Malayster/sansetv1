import { PortableText } from 'next-sanity'
import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import CustomHTML from '@/ui/modules/custom-html'
import NewsletterForm from '@/ui/newsletter-form'
import SocialNavigation from '@/ui/social-navigation'
import Navigation from './navigation'

export default async function Footer() {
  const site = await getSite()
  return (
    <footer className="bg-[#1A1A1A] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Col 1 — Logo + blurb */}
          <div className="max-md:text-center md:col-span-2">
            <Logo className="[&_img]:h-[2lh] mb-3" variant="dark" />
            {site?.footer?.blurb && (
              <div className="prose text-sm text-gray-400 max-w-sm">
                <PortableText value={site.footer.blurb} components={{ types: { 'custom-html': ({ value }) => <CustomHTML {...value} /> } }} />
              </div>
            )}
            <SocialNavigation className="social [&_svg]:size-lh link flex items-center gap-4 mt-4 max-md:justify-center [&_a]:text-gray-400 [&_a]:hover:text-white" />
          </div>
          {/* Col 2 — Kategori */}
          <div className="max-md:text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Kategori</h4>
            <Navigation />
          </div>
          {/* Col 3 — Hubungi */}
          <div className="max-md:text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Hubungi</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="mailto:redaksi@suara-anaknegeri.com" className="block hover:text-white transition-colors">redaksi@suara-anaknegeri.com</a>
              <a href="tel:+60312345678" className="block hover:text-white transition-colors">+603-1234 5678</a>
              <p>No. 1, Jalan Media, 50000 KL</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="max-w-md mx-auto text-center space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Langgan Newsletter</h4>
            <p className="text-gray-500 text-xs">Dapatkan berita terkini terus ke inbox anda.</p>
            <NewsletterForm source="footer" />
          </div>
        </div>

        {/* Footer text + copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          {site?.footerText && <p className="text-gray-600 text-xs text-center mb-4 italic">{site.footerText}</p>}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <a href="/" className="hover:text-white transition-colors">Beranda</a>
            <a href="/tentang" className="hover:text-white transition-colors">Tentang</a>
            <a href="/redaksi" className="hover:text-white transition-colors">Redaksi</a>
            <a href="/pedoman-media-siber" className="hover:text-white transition-colors">Pedoman Media Siber</a>
            <a href="/dasar-privasi" className="hover:text-white transition-colors">Privasi</a>
          </div>
          <div className="[&_a]:link text-center mt-4 text-xs text-gray-600 [&_a]:text-gray-500 [&_a]:hover:text-white">
            <PortableText value={site?.copyright ?? []} />
          </div>
        </div>
      </div>
    </footer>
  )
}
