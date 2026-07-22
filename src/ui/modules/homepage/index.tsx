import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const FEATURED_QUERY = groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...20]{
  _id, title, excerpt, publishDate, readTime,
  'mainImage': metadata.image,
  'slug': metadata.slug.current,
  'category': categories[0]->{title, color},
  author->{name}
}`

const CATEGORIES_QUERY = groq`*[_type == 'blog.category']|order(title)[0...12]{_id, title, 'slug': slug.current, color}`

type P = { _id: string; title?: string; excerpt?: string; publishDate?: string; readTime?: number; mainImage?: any; slug?: string; category?: { title: string; color?: string } }
type C = { _id: string; title: string; slug: string; color?: string }

function timeAgo(d?: string) {
  if (!d) return ''
  const ms = Date.now() - new Date(d).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 60) return m + ' minit lalu'
  const h = Math.floor(m / 60)
  if (h < 24) return h + ' jam lalu'
  const days = Math.floor(h / 24)
  if (days < 7) return days + ' hari lalu'
  return new Date(d).toLocaleDateString('ms-MY', { month: 'long', day: 'numeric' })
}

export default async function Homepage() {
  const blogDir = `/${ROUTES.blog}/`
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(FEATURED_QUERY, {}, { next: { revalidate: 60 } }),
    client.fetch<C[]>(CATEGORIES_QUERY, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400"><h2 className="text-2xl font-bold mb-4">Tiada Berita</h2></div>

  const hero = posts[0]
  const sub = posts.slice(1, 4)
  const grid = posts.slice(4, 10)
  const popular = posts.slice(0, 10)
  const catColor = (c?: string) => c || '#C41E3A'

  return (<>
    {/* ===== HERO: main col + right sidebar ===== */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-5">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <article>
          <Link href={hero.slug ? `${blogDir}${hero.slug}` : '#'} className="block overflow-hidden mb-3">
            {hero.mainImage ? (
              <Image src={urlFor(hero.mainImage).width(640).height(360).url()} alt={hero.title ?? ''} width={640} height={360} className="w-full aspect-video object-cover" priority />
            ) : <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400">Tiada Imej</div>}
          </Link>
          {hero.category && <Link href={`/${ROUTES.blog}?category=${hero.category.title}`} className="text-[11px] font-bold uppercase tracking-wide" style={{ color: catColor(hero.category.color) }}>{hero.category.title}</Link>}
          <Link href={hero.slug ? `${blogDir}${hero.slug}` : '#'}>
            <h1 className="text-[22px] md:text-2xl font-bold leading-tight mt-1 text-[#1A1A1A] hover:text-[#C41E3A] transition-colors line-clamp-3">{hero.title}</h1>
          </Link>
          {hero.excerpt && <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{hero.excerpt}</p>}
          <p className="text-xs text-gray-400 mt-2">{timeAgo(hero.publishDate)}</p>
        </article>

        <div className="flex flex-col gap-4">
          {sub.map(p => (
            <article key={p._id} className="flex gap-3 group">
              <Link href={p.slug ? `${blogDir}${p.slug}` : '#'} className="shrink-0">
                {p.mainImage ? <Image src={urlFor(p.mainImage).width(110).height(72).url()} alt="" width={110} height={72} className="w-[110px] h-[72px] object-cover" />
                : <div className="w-[110px] h-[72px] bg-gray-100" />}
              </Link>
              <div className="min-w-0">
                {p.category && <span className="text-[10px] font-bold uppercase" style={{ color: catColor(p.category.color) }}>{p.category.title}</span>}
                <Link href={p.slug ? `${blogDir}${p.slug}` : '#'}><h3 className="text-sm font-bold leading-snug mt-0.5 text-[#1A1A1A] group-hover:text-[#C41E3A] transition-colors line-clamp-3">{p.title}</h3></Link>
                <p className="text-[11px] text-gray-400 mt-1">{timeAgo(p.publishDate)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* ===== 3-COLUMN GRID ===== */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-5">
      <div className="border-t border-gray-200 pt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#C41E3A] font-bold text-xl">Berita Terkini</h2>
          <Link href={`/${ROUTES.blog}`} className="text-xs font-medium text-gray-500 hover:text-[#C41E3A]">Lagi Berita →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grid.map(p => (
            <article key={p._id} className="group">
              <Link href={p.slug ? `${blogDir}${p.slug}` : '#'} className="block overflow-hidden mb-2">
                {p.mainImage ? <Image src={urlFor(p.mainImage).width(400).height(225).url()} alt={p.title ?? ''} width={400} height={225} className="w-full aspect-video object-cover" />
                : <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Tiada Imej</div>}
              </Link>
              {p.category && <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: catColor(p.category.color) }}>{p.category.title}</span>}
              <Link href={p.slug ? `${blogDir}${p.slug}` : '#'}><h3 className="text-base font-bold leading-snug mt-1 text-[#1A1A1A] group-hover:text-[#C41E3A] transition-colors line-clamp-3">{p.title}</h3></Link>
              <p className="text-[11px] text-gray-400 mt-1.5">{timeAgo(p.publishDate)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* ===== KATEGORI ===== */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-5">
      <div className="border-t border-gray-200 pt-5">
        <h2 className="text-[#C41E3A] font-bold text-xl mb-3">Kategori</h2>
        <div className="flex flex-wrap gap-2">
          {cats.map(c => (
            <Link key={c._id} href={`/${ROUTES.blog}?category=${c.slug}`} className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c.title}</Link>
          ))}
        </div>
      </div>
    </section>

    {/* ===== PALING POPULAR ===== */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-5">
      <div className="border-t border-gray-200 pt-5">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <h2 className="text-[#C41E3A] font-bold text-xl mb-4">Paling Popular</h2>
            <div className="divide-y divide-gray-100">
              {popular.map((p, i) => (
                <article key={p._id} className="group flex gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="text-2xl font-bold text-gray-200 leading-none w-7 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    {p.category && <span className="text-[10px] font-bold uppercase" style={{ color: catColor(p.category.color) }}>{p.category.title}</span>}
                    <Link href={p.slug ? `${blogDir}${p.slug}` : '#'}><h3 className="text-sm font-bold leading-snug text-[#1A1A1A] group-hover:text-[#C41E3A] transition-colors line-clamp-2">{p.title}</h3></Link>
                    <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(p.publishDate)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="text-[#C41E3A] font-bold text-xl mb-4">Topik Trending</h2>
            <div className="flex flex-wrap gap-2">
              {cats.map(c => (
                <Link key={c._id} href={`/${ROUTES.blog}?category=${c.slug}`} className="px-3 py-1.5 text-[11px] bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c.title}</Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>

    {/* ===== CTA ===== */}
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
      <div className="border-t border-gray-200 pt-8 text-center">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href={`/${ROUTES.blog}`} className="px-5 py-2 text-sm font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">📰 Baca Berita</Link>
          <Link href="/hubungi" className="px-5 py-2 text-sm font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">💬 Hubungi Kami</Link>
        </div>
      </div>
    </section>
  </>)
}
