import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const Q = groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...20]{
  _id, title, excerpt, publishDate, readTime,
  'mainImage': metadata.image, 'slug': metadata.slug.current,
  'category': categories[0]->{title, color}
}`
const CQ = groq`*[_type == 'blog.category']|order(title)[0...12]{_id, title, 'slug': slug.current, color}`
type P = any
const R = (c?: string) => c || '#C41E3A'
const A = (d?: string) => {
  if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return m + 'm'; const h = Math.floor(m / 60)
  if (h < 24) return h + 'h'; const dy = Math.floor(h / 24)
  if (dy < 7) return dy + 'd'
  return new Date(d).toLocaleDateString('ms-MY', { month: 'short', day: 'numeric' })
}

export default async function Homepage() {
  const bp = `/${ROUTES.blog}/`
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const all = posts

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 font-sans">
      {/* ====== HERO ====== */}
      <section className="grid lg:grid-cols-[1fr_300px] gap-4 py-4 border-b border-gray-200">
        <article>
          <Link href={`${bp}${all[0].slug}`} className="block overflow-hidden mb-2">
            {all[0].mainImage ? <Image src={urlFor(all[0].mainImage).width(720).height(400).url()} alt="" width={720} height={400} className="w-full object-cover" style={{ aspectRatio: '16/9' }} priority />
            : <div className="bg-gray-100 flex items-center justify-center text-gray-400" style={{ aspectRatio: '16/9' }}>Tiada Imej</div>}
          </Link>
          {all[0].category && <Link href={`${bp}?category=${all[0].category.title}`} className="text-[11px] font-bold uppercase tracking-wide" style={{ color: R(all[0].category.color) }}>{all[0].category.title}</Link>}
          <Link href={`${bp}${all[0].slug}`}><h1 className="font-['Noto_Serif',Georgia,serif] text-[20px] md:text-[24px] font-bold leading-tight mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{all[0].title}</h1></Link>
          {all[0].excerpt && <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">{all[0].excerpt}</p>}
          <p className="text-[11px] text-gray-400 mt-1.5">{A(all[0].publishDate)}</p>
        </article>
        <div className="flex flex-col gap-3">
          {all.slice(1, 4).map(p => (
            <article key={p._id} className="flex gap-2.5 group">
              <Link href={`${bp}${p.slug}`} className="shrink-0">
                {p.mainImage ? <Image src={urlFor(p.mainImage).width(100).height(66).url()} alt="" width={100} height={66} className="w-[100px] h-[66px] object-cover" />
                : <div className="w-[100px] h-[66px] bg-gray-100" />}
              </Link>
              <div className="min-w-0">
                {p.category && <span className="text-[10px] font-bold uppercase" style={{ color: R(p.category.color) }}>{p.category.title}</span>}
                <Link href={`${bp}${p.slug}`}><h3 className="text-[13px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-2">{p.title}</h3></Link>
                <p className="text-[10px] text-gray-400 mt-0.5">{A(p.publishDate)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ====== 4-CARD ROW ====== */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-gray-200">
        {all.slice(4, 8).map(p => (
          <article key={p._id} className="group">
            <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1.5">
              {p.mainImage ? <Image src={urlFor(p.mainImage).width(320).height(180).url()} alt="" width={320} height={180} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
              : <div className="bg-gray-100" style={{ aspectRatio: '16/9' }} />}
            </Link>
            {p.category && <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: R(p.category.color) }}>{p.category.title}</span>}
            <Link href={`${bp}${p.slug}`}><h3 className="text-[13px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{p.title}</h3></Link>
            <p className="text-[10px] text-gray-400 mt-0.5">{A(p.publishDate)}</p>
          </article>
        ))}
      </section>

      {/* ====== EDITOR'S PICKS ====== */}
      <section className="py-4 border-b border-gray-200">
        <h2 className="font-['Noto_Serif',Georgia,serif] text-[#C41E3A] font-bold text-base mb-3">Pilihan Editor</h2>
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          <div>
            {all[8] && (
              <article className="mb-4">
                <Link href={`${bp}${all[8].slug}`} className="block overflow-hidden mb-2">
                  {all[8].mainImage ? <Image src={urlFor(all[8].mainImage).width(720).height(400).url()} alt="" width={720} height={400} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
                  : <div className="bg-gray-100" style={{ aspectRatio: '16/9' }} />}
                </Link>
                {all[8].category && <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: R(all[8].category.color) }}>{all[8].category.title}</span>}
                <Link href={`${bp}${all[8].slug}`}><h3 className="text-[15px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors">{all[8].title}</h3></Link>
                <p className="text-[11px] text-gray-400 mt-1">{A(all[8].publishDate)}</p>
              </article>
            )}
            <div className="grid md:grid-cols-3 gap-4">
              {all.slice(9, 12).map(p => (
                <article key={p._id} className="group">
                  <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1.5">
                    {p.mainImage ? <Image src={urlFor(p.mainImage).width(320).height(180).url()} alt="" width={320} height={180} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
                    : <div className="bg-gray-100" style={{ aspectRatio: '16/9' }} />}
                  </Link>
                  {p.category && <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: R(p.category.color) }}>{p.category.title}</span>}
                  <Link href={`${bp}${p.slug}`}><h3 className="text-[13px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{p.title}</h3></Link>
                  <p className="text-[10px] text-gray-400 mt-0.5">{A(p.publishDate)}</p>
                </article>
              ))}
            </div>
          </div>
          <aside>
            <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Berita Terkini</h3>
            <div className="divide-y divide-gray-100">
              {all.slice(4, 12).map(p => (
                <Link key={p._id} href={`${bp}${p.slug}`} className="block py-1.5 text-[12px] text-gray-700 hover:text-[#C41E3A] transition-colors leading-snug">{p.title}</Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ====== BISNES ====== */}
      <section className="py-4 border-b border-gray-200">
        <h2 className="font-['Noto_Serif',Georgia,serif] text-[#C41E3A] font-bold text-base mb-3">Berita Bisnes</h2>
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          {all[12] && (
            <article>
              <Link href={`${bp}${all[12].slug}`} className="block overflow-hidden mb-2">
                {all[12].mainImage ? <Image src={urlFor(all[12].mainImage).width(720).height(400).url()} alt="" width={720} height={400} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
                : <div className="bg-gray-100" style={{ aspectRatio: '16/9' }} />}
              </Link>
              {all[12].category && <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: R(all[12].category.color) }}>{all[12].category.title}</span>}
              <Link href={`${bp}${all[12].slug}`}><h3 className="text-[15px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors">{all[12].title}</h3></Link>
              {all[12].excerpt && <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">{all[12].excerpt}</p>}
              <p className="text-[11px] text-gray-400 mt-1">{A(all[12].publishDate)}</p>
            </article>
          )}
          <div className="flex flex-col gap-3">
            {all.slice(13, 16).map(p => (
              <article key={p._id} className="flex gap-2.5 group">
                <Link href={`${bp}${p.slug}`} className="shrink-0">
                  {p.mainImage ? <Image src={urlFor(p.mainImage).width(100).height(66).url()} alt="" width={100} height={66} className="w-[100px] h-[66px] object-cover" />
                  : <div className="w-[100px] h-[66px] bg-gray-100" />}
                </Link>
                <div className="min-w-0">
                  {p.category && <span className="text-[10px] font-bold uppercase" style={{ color: R(p.category.color) }}>{p.category.title}</span>}
                  <Link href={`${bp}${p.slug}`}><h3 className="text-[13px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-2">{p.title}</h3></Link>
                  <p className="text-[10px] text-gray-400 mt-0.5">{A(p.publishDate)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ====== POPULAR + TRENDING ====== */}
      <section className="py-4 border-b border-gray-200">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4">
          <div>
            <h2 className="font-['Noto_Serif',Georgia,serif] text-[#C41E3A] font-bold text-base mb-3">Paling Popular</h2>
            <div className="divide-y divide-gray-100">
              {all.slice(0, 10).map((p, i) => (
                <article key={p._id} className="group flex gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="text-xl font-bold text-gray-200 leading-none w-6 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    {p.category && <span className="text-[10px] font-bold uppercase" style={{ color: R(p.category.color) }}>{p.category.title}</span>}
                    <Link href={`${bp}${p.slug}`}><h3 className="text-[13px] font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-2">{p.title}</h3></Link>
                    <p className="text-[10px] text-gray-400 mt-0.5">{A(p.publishDate)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="font-['Noto_Serif',Georgia,serif] text-[#C41E3A] font-bold text-base mb-3">Topik Trending</h2>
            <div className="flex flex-wrap gap-1.5">
              {cats.map(c => (
                <Link key={c._id} href={`/${ROUTES.blog}?category=${c.slug}`} className="px-2.5 py-1 text-[10px] bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c.title}</Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-6 text-center">
        <h2 className="text-base font-bold text-[#111] mb-1.5">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
        <p className="text-sm text-gray-500 mb-3 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif.</p>
        <div className="flex items-center justify-center gap-2.5">
          <Link href={`/${ROUTES.blog}`} className="px-4 py-1.5 text-xs font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link>
          <Link href="/hubungi" className="px-4 py-1.5 text-xs font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link>
        </div>
      </section>
    </div>
  )
}
