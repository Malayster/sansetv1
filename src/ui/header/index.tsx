import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import MobileToggle from './mobile-toggle'
import Navigation from './navigation'

export default async function Header() {
const site = await getSite()

return (
<header role="banner" className="bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500">
<div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between py-3">
<div className="flex items-center gap-6">
<Logo className="shrink-0 [&_*]:text-black" />
<MobileToggle />
</div>

<div className="hidden md:flex items-center gap-1">
<Navigation />
</div>

<div className="hidden md:flex items-center gap-3">
<form action="/search" method="GET" className="relative">
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
<input type="search" name="q" placeholder="Cari..." className="w-36 lg:w-44 bg-black/10 placeholder-black/40 text-black text-xs rounded-md py-1.5 pl-7 pr-3 outline-none focus:bg-black/20 border border-black/10 transition" />
</form>
</div>
</div>

<MarqueeBar />
</header>
)
}

async function MarqueeBar() {
const { client } = await import('@/sanity/lib/client')
const { groq } = await import('next-sanity')
const headlines = await client.fetch<string[]>(
groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...15].title`
).catch(() => [] as string[])

if (!headlines.length) return null

return (
<div className="bg-black/10 border-t border-black/10 overflow-hidden">
<div className="flex animate-marquee whitespace-nowrap py-1.5 text-xs text-black/60 font-medium">
{[...headlines, ...headlines].map((h, i) => (
<span key={i} className="inline-flex items-center gap-2 mx-4">
<span className="inline-block w-1 h-1 rounded-full bg-black/30" />
{h}
</span>
))}
</div>
</div>
)
}
