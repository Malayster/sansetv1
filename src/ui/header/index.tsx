import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import NavBar from './navbar'

export default async function Header() {
const site = await getSite()

return (
<header role="banner" className="sticky top-0 z-50 bg-gradient-to-r from-red-700 via-red-600 to-amber-500">
<div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between py-3">
<div className="flex items-center gap-6">
<Logo className="shrink-0 [&_*]:text-black" />
</div>

<div className="flex items-center gap-1">
<NavBar />
</div>

<div className="hidden md:flex items-center gap-3">
<form action="/search" method="GET" className="relative">
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
<input type="search" name="q" placeholder="Cari..." className="w-36 lg:w-44 bg-black/10 placeholder-black/40 text-black text-xs rounded-md py-1.5 pl-7 pr-3 outline-none focus:bg-black/20 border border-black/10 transition" />
</form>
</div>
</div>

	</header>
	)
}
