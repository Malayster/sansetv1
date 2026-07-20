import { PortableText } from 'next-sanity'
import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import CustomHTML from '@/ui/modules/custom-html'
import NewsletterForm from '@/ui/newsletter-form'
import SocialNavigation from '@/ui/social-navigation'
import Navigation from './navigation'

export default async function () {
	const site = await getSite()
	const blurb = site?.footer?.blurb

	return (
		<footer className="bg-hitam text-putih border-t-2 border-merah mt-auto">
			<div className="section space-y-8 py-12">
				<div className="grid gap-8 max-md:grid-cols-1 md:grid-cols-3">
					{/* Column 1: Logo + Description */}
					<div className="flex flex-col items-center gap-3 max-md:text-center md:items-start">
						<Logo className="[&_img]:h-[2lh]" variant="dark" />
						{blurb && (
							<div className="prose text-sm text-putih/70">
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
						<SocialNavigation className="social [&_svg]:size-lh link flex items-center gap-4 max-md:justify-center [&_a]:text-putih/70 [&_a]:hover:text-merah" />
					</div>

					{/* Column 2: Navigation links */}
					<div className="max-md:text-center">
						<h4 className="text-merah text-sm font-bold uppercase mb-3">Kategori</h4>
						<Navigation />
					</div>

					{/* Column 3: Contact & Links */}
					<div className="max-md:text-center space-y-3">
						<h4 className="text-merah text-sm font-bold uppercase mb-3">Hubungi</h4>
						<div className="flex flex-col items-center gap-2 md:items-start">
							<a href="/tentang" className="text-putih/60 hover:text-merah text-sm transition-colors">
								Tentang Kami
							</a>
							<a href="/redaksi" className="text-putih/60 hover:text-merah text-sm transition-colors">
								Redaksi
							</a>
							<a href="/pedoman-media-siber" className="text-putih/60 hover:text-merah text-sm transition-colors">
								Pedoman Media Siber
							</a>
						</div>
					</div>
				</div>

									{/* Newsletter */}
					<div className="border-t border-putih/10 pt-8 mb-8">
						<div className="max-w-md mx-auto text-center space-y-3">
							<h4 className="text-merah text-sm font-bold uppercase">
								📬 Langgan Newsletter
							</h4>
							<p className="text-putih/50 text-xs">
								Dapatkan berita terkini terus ke inbox anda. Tiada spam.
							</p>
							<NewsletterForm source="footer" />
						</div>
					</div>

					{/* Bottom bar */}
				<div className="border-t border-putih/10 pt-6 text-center text-xs text-putih/40">
					<div className="flex flex-wrap items-center justify-center gap-3 mb-1">
						<a href="/" className="hover:text-merah transition-colors">Beranda</a>
						<a href="/tentang" className="hover:text-merah transition-colors">Tentang</a>
						<a href="/redaksi" className="hover:text-merah transition-colors">Redaksi</a>
						<a href="/pedoman-media-siber" className="hover:text-merah transition-colors">Pedoman Media Siber</a>
					</div>
					<div className="[&_a]:link text-center mt-3 [&_a]:text-merah/70 [&_a]:hover:text-merah">
						<PortableText value={site?.copyright ?? []} />
					</div>
				</div>
			</div>
		</footer>
	)
}
