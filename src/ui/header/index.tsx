import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import NavBar from './navbar'
import ThemeToggle from '@/ui/theme-toggle'

export default async function Header() {
	const site = await getSite()

	return (
		<header role="banner" className="sticky top-0 z-50 bg-gradient-to-r from-hitam via-merah-gelap to-emas">
			<div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between py-2.5">
				<div className="flex items-center gap-6">
					<Logo className="shrink-0 [&_*]:text-putih" variant="dark" />
				</div>

				<div className="flex items-center gap-1">
					<NavBar />
				</div>

				<div className="hidden md:flex items-center gap-3">
					<form action="/search" method="GET" className="relative">
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-putih/40">
							<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
						</svg>
						<input
							type="search"
							name="q"
							placeholder="Cari artikel..."
							className="w-36 lg:w-48 bg-putih/10 placeholder-putih/40 text-putih text-xs rounded-md py-1.5 pl-7 pr-3 outline-none focus:bg-putih/20 border border-putih/10 transition"
						/>
					</form>
					<ThemeToggle />
				</div>
			</div>
		</header>
	)
}
