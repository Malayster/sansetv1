import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...20]{
  _id,title,excerpt,publishDate,'img':metadata.image,'slug':metadata.slug.current,
  'cat':categories[0]->{title,color}
}`
const CQ = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`
const bp = `/${ROUTES.blog}/`
type P = any
const R = (c?: string) => c || '#C41E3A'
const A = (d?: string) => {
  if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return m + ' minutes ago'; const h = Math.floor(m / 60)
  if (h < 24) return h + ' hours ago'; const dy = Math.floor(h / 24)
  if (dy < 7) return dy + ' days ago'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

/* ── reusable sub-components ── */
function Img({ p, w, h, prio }: { p: P; w: number; h: number; prio?: boolean }) {
  return p.img ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full object-cover" style={{ aspectRatio: `${w}/${h}` }} priority={prio} />
    : <div className="bg-gray-100" style={{ aspectRatio: `${w}/${h}` }} />
}
function Tag({ p, sz }: { p: P; sz?: string }) {
  return p.cat ? <Link href={`${bp}?category=${p.cat.title}`} className={`${sz||'text-[10px]'} font-bold uppercase tracking-wide`} style={{color:R(p.cat.color)}}>{p.cat.title}</Link> : null
}
function TagS({ p }: { p: P }) { return p.cat ? <span className="text-[10px] font-bold uppercase" style={{color:R(p.cat.color)}}>{p.cat.title}</span> : null }
function Head({ p, sz, cls }: { p: P; sz?: string; cls?: string }) {
  return <Link href={`${bp}${p.slug}`}><h3 className={`font-serif font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3 ${sz||'text-[13px]'} ${cls||''}`}>{p.title}</h3></Link>
}
function Tim({ p }: { p: P }) { return <p className="text-[10px] text-gray-400 mt-0.5">{A(p.publishDate)}</p> }
function Sec({ title }: { title: string }) { return <h2 className="font-serif text-[#C41E3A] font-bold text-base mb-3">{title}</h2> }
function Div() { return <div className="border-t border-gray-200" /> }

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const p = posts

  return <div className="max-w-7xl mx-auto px-4 md:px-6">

    {/* ═══ WEEKDAY TOP STORIES (Hero) ═══ */}
    <section className="grid lg:grid-cols-[1fr_300px] gap-5 py-5">
      {/* Main article (slot-1) */}
      <article>
        <Link href={`${bp}${p[0].slug}`} className="block overflow-hidden mb-2"><Img p={p[0]} w={620} h={349} prio /></Link>
        <div className="mb-2"><Tag p={p[0]} sz="text-[11px]" /></div>
        <Link href={`${bp}${p[0].slug}`}><h1 className="font-serif text-[22px] md:text-[26px] font-bold leading-tight mt-1 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{p[0].title}</h1></Link>
        {p[0].excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{p[0].excerpt}</p>}
        <Tim p={p[0]} />
      </article>
      {/* Sidebar articles (slots 3,4,5,6 = 4 articles) */}
      <div className="flex flex-col gap-3">
        {p.slice(1,5).map(a => (
          <article key={a._id} className="flex gap-2.5 group">
            <Link href={`${bp}${a.slug}`} className="shrink-0">{a.img ? <Image src={urlFor(a.img).width(100).height(66).url()} alt="" width={100} height={66} className="w-[100px] h-[66px] object-cover" /> : <div className="w-[100px] h-[66px] bg-gray-100" />}</Link>
            <div className="min-w-0"><TagS p={a} /><Head p={a} sz="text-[13px]" /><Tim p={a} /></div>
          </article>
        ))}
      </div>
    </section>

    {/* ═══ EDITOR'S PICKS ═══ */}
    <Div />
    <section className="py-4">
      <Sec title="Pilihan Editor" />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          {/* Spotlight card (slot-1) */}
          <article className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="sm:w-[304px] shrink-0">
              <Link href={`${bp}${p[5].slug}`} className="block overflow-hidden"><Img p={p[5]} w={304} h={171} /></Link>
            </div>
            <div>
              <Tag p={p[5]} sz="text-[11px]" />
              <Link href={`${bp}${p[5].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{p[5].title}</h3></Link>
              {p[5].excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{p[5].excerpt}</p>}
              <Tim p={p[5]} />
            </div>
          </article>
          {/* Section cards (slots 2,3,4) */}
          <div className="grid md:grid-cols-3 gap-4">
            {p.slice(6, 9).map(a => (
              <article key={a._id} className="group">
                <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={293} h={165} /></Link>
                <TagS p={a} /><Head p={a} /><Tim p={a} />
              </article>
            ))}
          </div>
        </div>
        {/* Latest Headlines sidebar */}
        <aside>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b-2 border-[#C41E3A] pb-1 inline-block">Berita Terkini</h3>
          <div className="divide-y divide-gray-100">
            {posts.slice(4, 13).map(a => (
              <Link key={a._id} href={`${bp}${a.slug}`} className="block py-2 text-[12px] text-gray-700 hover:text-[#C41E3A] transition-colors leading-snug">{a.title}</Link>
            ))}
          </div>
        </aside>
      </div>
    </section>

    {/* ═══ LATEST BUSINESS NEWS ═══ */}
    <Div />
    <section className="py-4">
      <Sec title="Berita Bisnes" />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          <article className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="sm:w-[304px] shrink-0">
              <Link href={`${bp}${p[9].slug}`} className="block overflow-hidden"><Img p={p[9]} w={304} h={171} /></Link>
            </div>
            <div>
              <Tag p={p[9]} sz="text-[11px]" />
              <Link href={`${bp}${p[9].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{p[9].title}</h3></Link>
              {p[9].excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{p[9].excerpt}</p>}
              <Tim p={p[9]} />
            </div>
          </article>
          <div className="grid md:grid-cols-3 gap-4">
            {p.slice(10, 13).map(a => (
              <article key={a._id} className="group">
                <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={293} h={165} /></Link>
                <TagS p={a} /><Head p={a} /><Tim p={a} />
              </article>
            ))}
          </div>
        </div>
        <aside>
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">Iklan</div>
        </aside>
      </div>
    </section>

    {/* ═══ OPINION ═══ */}
    <Div />
    <section className="py-4">
      <Sec title="Opini" />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          {/* Spotlight opinion (slot-1) */}
          <article className="mb-5">
            <Link href={`${bp}${p[13].slug}`} className="block overflow-hidden mb-2"><Img p={p[13]} w={512} h={288} /></Link>
            <span className="text-[10px] font-bold uppercase text-gray-400">Opini</span>
            <Link href={`${bp}${p[13].slug}`}><h3 className="font-serif text-[18px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{p[13].title}</h3></Link>
            {p[13].excerpt && <p className="text-[13px] text-gray-500 mt-1.5">{p[13].excerpt}</p>}
          </article>
          {/* Opinion cards (slots 2,3,4) */}
          <div className="divide-y divide-gray-100">
            {p.slice(14, 17).map(a => (
              <article key={a._id} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">👤</div>
                <div className="min-w-0">
                  <TagS p={a} />
                  <Link href={`${bp}${a.slug}`}><h4 className="font-serif font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors">{a.title}</h4></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
        {/* Most Read sidebar */}
        <aside>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b-2 border-[#C41E3A] pb-1 inline-block">Paling Popular</h3>
          <div className="divide-y divide-gray-100">
            {p.slice(0, 6).map((a, i) => (
              <Link key={a._id} href={`${bp}${a.slug}`} className="block py-2 text-[12px] text-gray-700 hover:text-[#C41E3A] transition-colors leading-snug">{a.title}</Link>
            ))}
          </div>
        </aside>
      </div>
    </section>

    {/* ═══ LIFE & ARTS ═══ */}
    <Div />
    <section className="py-4">
      <Sec title="Gaya Hidup" />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          <article className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="sm:w-[304px] shrink-0">
              <Link href={`${bp}${p[17].slug}`} className="block overflow-hidden"><Img p={p[17]} w={304} h={171} /></Link>
            </div>
            <div>
              <Tag p={p[17]} sz="text-[11px]" />
              <Link href={`${bp}${p[17].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{p[17].title}</h3></Link>
              {p[17].excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{p[17].excerpt}</p>}
              <Tim p={p[17]} />
            </div>
          </article>
          <div className="grid md:grid-cols-3 gap-4">
            {p.slice(18, 20).map(a => (
              <article key={a._id} className="group">
                <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={293} h={165} /></Link>
                <TagS p={a} /><Head p={a} /><Tim p={a} />
              </article>
            ))}
          </div>
        </div>
        <aside>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b-2 border-[#C41E3A] pb-1 inline-block">Topik Trending</h3>
          <div className="flex flex-wrap gap-1.5">
            {cats.map(c => (
              <Link key={c._id} href={`${bp}?category=${c.slug}`} className="px-2.5 py-1 text-[10px] bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c.title}</Link>
            ))}
          </div>
        </aside>
      </div>
    </section>

    {/* ═══ TRENDING TOPICS ═══ */}
    <Div />
    <section className="py-4">
      <Sec title="Topik Trending" />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cats.slice(0, 8).map(c => (
          <div key={c._id} className="bg-gray-50 p-3">
            <Link href={`${bp}?category=${c.slug}`} className="font-serif text-sm font-bold text-[#111] hover:text-[#C41E3A] transition-colors">{c.title}</Link>
            <div className="mt-2 divide-y divide-gray-200">
              {posts.filter(a => a.cat?.title === c.title).slice(0, 2).map(a => (
                <Link key={a._id} href={`${bp}${a.slug}`} className="block py-1.5 text-[11px] text-gray-600 hover:text-[#C41E3A] transition-colors leading-snug">{a.title}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ═══ CTA ═══ */}
    <Div />
    <section className="py-6 text-center">
      <h2 className="font-serif text-base font-bold text-[#111] mb-1.5">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-sm text-gray-500 mb-3 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2.5">
        <Link href={`${bp}`} className="px-5 py-2 text-xs font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/hubungi" className="px-5 py-2 text-xs font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link>
      </div>
    </section>
  </div>
}
