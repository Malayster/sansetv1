import { PortableText } from 'next-sanity'
import { cn } from '@/lib/utils'
import { getSite } from '@/sanity/lib/queries'
import type { Cta } from '@/sanity/types'
import CTAList from '@/ui/cta-list'
import Logo from '@/ui/logo'
import CustomHTML from '@/ui/modules/custom-html'
import SocialNavigation from '@/ui/social-navigation'
import css from './header.module.css'
import MobileToggle from './mobile-toggle'
import Navigation from './navigation'
import Wrapper from './wrapper'
import StickyNav from './sticky-nav'

export default async function () {
	const site = await getSite()

	return (
		<Wrapper className="header-gradient border-b-2 border-merah">
			{/* Top Bar */}
			<div className="bg-hitam hidden md:block">
				<div className="section flex items-center justify-between py-1.5 text-xs text-putih/80 max-w-7xl mx-auto px-4 md:px-8">
					<div className="flex items-center gap-4">
						<a href="/terbaru" className="text-putih/90 hover:text-putih transition-colors font-medium uppercase tracking-wide text-[10px]">Terbaru</a>
						<span className="text-putih/30">|</span>
						<a href="/terpopuler" className="text-putih/90 hover:text-putih transition-colors font-medium uppercase tracking-wide text-[10px]">Terpopuler</a>
						<span className="text-putih/30">|</span>
						<a href="/foto-video" className="text-putih/90 hover:text-putih transition-colors font-medium uppercase tracking-wide text-[10px]">Foto &amp; Video</a>
					</div>
					<div className="flex items-center gap-3">
						<SocialNavigation className="flex items-center gap-2 [&_svg]:size-3.5 [&_a]:text-putih/80 [&_a]:hover:text-putih [&_a]:transition-colors" />
						<a href="https://wa.me/6281248468287?text=Hallo+SuaraAnakNegeri" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-putih/80 hover:text-green-400 transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
							WhatsApp
						</a>
					</div>
				</div>
			</div>

			<div className={cn(css.root, 'section grid items-center gap-x-6 py-4')}>
				<div className="flex items-center gap-4 [grid-area:top]">
					<Logo className="shrink-0" />
					<MobileToggle />
				</div>

				{/* Search with date */}
				<div className="[grid-area:search] max-md:hidden">
					<form action="/search" method="GET" className="relative">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-kelabu-gelap"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
						<input type="search" name="q" placeholder="Cari berita..." className="search-input pl-8" />
					</form>
				</div>

				<Navigation />
			</div>

			<StickyNav />
		</Wrapper>
	)
}
