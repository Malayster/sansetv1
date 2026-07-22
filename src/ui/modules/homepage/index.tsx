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
  if (m < 60) return m + ' minit lalu'; const h = Math.floor(m / 60)
  if (h < 24) return h + ' jam lalu'; const dy = Math.floor(h / 24)
  if (dy < 7) return dy + ' hari lalu'
  return new Date(d).toLocaleDateString('ms-MY', { month: 'long', day: 'numeric' })
}

/* ── reusable sub-components ── */
function HeroImg({ p }: { p: P }) {
  return p.img ? <Image src={urlFor(p.img).width(720).height(400).url()} alt="" width={720} height={400} className="w-full object-cover" style={{ aspectRatio: '16/9' }} priority />
    : <div className="bg-gray-100 flex items-center justify-center text-gray-400" style={{ aspectRatio: '16/9' }}>Tiada Imej</div>
}
function GridImg({ p, w, h }: { p: P; w?: number; h?: number }) {
  return p.img ? <Image src={urlFor(p.img).width(w || 340).height(h || 190).url()} alt="" width={w || 340} height={h || 190} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
    : <div className="bg-gray-100" style={{ aspectRatio: '16/9' }} />
}
function ThumbImg({ p }: { p: P }) {
  return p.img ? <Image src={urlFor(p.img).width(100).height(66).url()} alt="" width={100} height={66} className="w-[100px] h-[66px] object-cover shrink-0" />
    : <div className="w-[100px] h-[66px] bg-gray-100 shrink-0" />
}
function Cat({ p, sz }: { p: P; sz?: string }) {
  return p.cat ? <Link href={`${bp}?category=${p.cat.title}`} className={`${sz || 'text-[10px]'} font-bold uppercase tracking-wide`} style={{ color: R(p.cat.color) }}>{p.cat.title}</Link> : null
}
function CatS({ p }: { p: P }) { return p.cat ? <span className="text-[10px] font-bold uppercase" style={{ color: R(p.cat.color) }}>{p.cat.title}</span> : null }
function Head({ p, sz, cls }: { p: P; sz?: string; cls?: string }) {
  return <Link href={`${bp}${p.slug}`}><h3 className={`font-serif font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3 ${sz || 'text-[13px]'} ${cls || ''}`}>{p.title}</h3></Link>
}
function Time({ p }: { p: P }) { return <p className="text-[10px] text-gray-400 mt-0.5">{A(p.publishDate)}</p> }
function Sec({ title }: { title: string }) { return <h2 className="font-serif text-[#C41E3A] font-bold text-base mb-3">{title}</h2> }

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t] = posts

  return <div className="max-w-7xl mx-auto px-4 md:px-6">

    {/* ══════════ HERO ══════════ */}
    <section className="grid lg:grid-cols-[1fr_300px] gap-5 py-5">
      <article>
        <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-2"><HeroImg p={a} /></Link>
        <Cat p={a} sz="text-[11px]" />
        <Link href={`${bp}${a.slug}`}><h1 className="font-serif text-[22px] md:text-[26px] font-bold leading-tight mt-1 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{a.title}</h1></Link>
        {a.excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{a.excerpt}</p>}
        <Time p={a} />
      </article>
      <div className="flex flex-col gap-3">{ [b,c,d].map(p => (
        <article key={p._id} className="flex gap-2.5 group">
          <Link href={`${bp}${p.slug}`}><ThumbImg p={p} /></Link>
          <div className="min-w-0"><CatS p={p} /><Head p={p} sz="text-[13px]" /><Time p={p} /></div>
        </article>
      ))}</div>
    </section>

    {/* ══════════ 4-CARD ══════════ */}
    <div className="border-t border-gray-200" />
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
      { [e,f,g,h].map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1.5"><GridImg p={p} /></Link>
          <CatS p={p} /><Head p={p} /><Time p={p} />
        </article>
      ))}</section>

    {/* ══════════ FEATURE ══════════ */}
    {i && <><div className="border-t border-gray-200" />
    <section className="grid lg:grid-cols-[1fr_300px] gap-5 py-4">
      <article>
        <Link href={`${bp}${i.slug}`} className="block overflow-hidden mb-2"><HeroImg p={i} /></Link>
        <Cat p={i} sz="text-[11px]" />
        <Link href={`${bp}${i.slug}`}><h2 className="font-serif text-[18px] md:text-[20px] font-bold leading-tight mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{i.title}</h2></Link>
        {i.excerpt && <p className="text-[13px] text-gray-500 mt-1.5">{i.excerpt}</p>}<Time p={i} />
      </article>
      <div className="flex flex-col gap-3">{ [j,k].filter(Boolean).map(p => (
        <article key={p._id} className="flex gap-2.5 group">
          <Link href={`${bp}${p.slug}`}><ThumbImg p={p} /></Link>
          <div className="min-w-0"><CatS p={p} /><Head p={p} /><Time p={p} /></div>
        </article>
      ))}</div>
    </section></>}

    {/* ══════════ EDITOR'S PICKS ══════════ */}
    <div className="border-t border-gray-200" />
    <section className="py-4">
      <Sec title="Pilihan Editor" />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          {l && <article className="mb-4">
            <Link href={`${bp}${l.slug}`} className="block overflow-hidden mb-2"><HeroImg p={l} /></Link>
            <Cat p={l} sz="text-[11px]" />
            <Link href={`${bp}${l.slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{l.title}</h3></Link>
            <Time p={l} />
          </article>}
          <div className="grid md:grid-cols-3 gap-4">
            { [m,n,o].filter(Boolean).map(p => (
              <article key={p._id} className="group">
                <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1.5"><GridImg p={p} /></Link>
                <CatS p={p} /><Head p={p} /><Time p={p} />
              </article>
            ))}</div>
        </div>
        <aside>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Berita Terkini</h3>
          <div className="divide-y divide-gray-100">
            {posts.slice(4, 12).map(p => (
              <Link key={p._id} href={`${bp}${p.slug}`} className="block py-1.5 text-[12px] text-gray-700 hover:text-[#C41E3A] transition-colors leading-snug">{p.title}</Link>
            ))}</div>
        </aside>
      </div>
    </section>

    {/* ══════════ POPULAR ══════════ */}
    <div className="border-t border-gray-200" />
    <section className="py-4">
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          <Sec title="Paling Popular" />
          <div className="divide-y divide-gray-100">
            {posts.slice(0, 10).map((p, i) => (
              <article key={p._id} className="group flex gap-3 py-2 first:pt-0 last:pb-0">
                <span className="text-xl font-bold text-gray-200 leading-none w-6 shrink-0">{i + 1}</span>
                <div className="min-w-0"><CatS p={p} /><Head p={p} /><Time p={p} /></div>
              </article>
            ))}</div>
        </div>
        <aside>
          <Sec title="Topik Trending" />
          <div className="flex flex-wrap gap-1.5">
            {cats.map(c => (
              <Link key={c._id} href={`${bp}?category=${c.slug}`} className="px-2.5 py-1 text-[10px] bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c.title}</Link>
            ))}</div>
        </aside>
      </div>
    </section>

    {/* ══════════ CTA ══════════ */}
    <div className="border-t border-gray-200" />
    <section className="py-6 text-center">
      <h2 className="font-serif text-base font-bold text-[#111] mb-1.5">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-sm text-gray-500 mb-3 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2.5">
        <Link href={`${bp}`} className="px-4 py-1.5 text-xs font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">📰 Baca Berita</Link>
        <Link href="/hubungi" className="px-4 py-1.5 text-xs font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">💬 Hubungi Kami</Link>
      </div>
    </section>
  </div>
}
