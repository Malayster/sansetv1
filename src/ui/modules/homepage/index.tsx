import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const QUERY = groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...20]{
  _id, title, excerpt, publishDate, readTime,
  'mainImage': metadata.image,
  'slug': metadata.slug.current,
  'category': categories[0]->{title, color},
  author->{name}
}`
const CATS_Q = groq`*[_type == 'blog.category']|order(title)[0...12]{_id, title, 'slug': slug.current, color}`
type P = any
function cc(c?: string) { return c || '#C41E3A' }
function ta(d?: string) {
  if (!d) return ''
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return m + ' minit lalu'
  const h = Math.floor(m / 60); if (h < 24) return h + ' jam lalu'
  const dy = Math.floor(h / 24); if (dy < 7) return dy + ' hari lalu'
  return new Date(d).toLocaleDateString('ms-MY', { month: 'long', day: 'numeric' })
}
function Img({ p, w, h, ar, prio }: { p: P; w: number; h: number; ar?: string; prio?: boolean }) {
  if (!p.mainImage) return <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] ${ar || 'aspect-video'}`}>Tiada Imej</div>
  return <Image src={urlFor(p.mainImage).width(w).height(h).url()} alt={p.title ?? ''} width={w} height={h} className={`w-full object-cover ${ar || 'aspect-video'}`} priority={prio} />
}
function Cat({ p, sz }: { p: P; sz?: string }) {
  if (!p.category) return null
  return <Link href={`/${ROUTES.blog}?category=${p.category.title}`} className={`font-bold uppercase tracking-wide hover:opacity-80 ${sz || 'text-[10px]'}`} style={{ color: cc(p.category.color) }}>{p.category.title}</Link>
}
function Title({ p, sz, cls, to }: { p: P; sz?: string; cls?: string; to?: string }) {
  return <Link href={to || `/${ROUTES.blog}/${p.slug}`}><h3 className={`font-bold leading-snug text-[#1A1A1A] hover:text-[#C41E3A] transition-colors line-clamp-3 ${sz || 'text-sm'} ${cls || ''}`}>{p.title}</h3></Link>
}
function Time({ p }: { p: P }) { return <p className="text-[11px] text-gray-400">{ta(p.publishDate)}</p> }

function SecH({ title }: { title: string }) { return <h2 className="text-[#C41E3A] font-bold text-lg mb-4">{title}</h2> }
function Div() { return <div className="border-t border-gray-200 my-5" /> }
function Thumb({ p }: { p: P }) {
  return <Link href={`/${ROUTES.blog}/${p.slug}`} className="shrink-0">
    {p.mainImage ? <Image src={urlFor(p.mainImage).width(110).height(72).url()} alt="" width={110} height={72} className="w-[110px] h-[72px] object-cover" />
    : <div className="w-[110px] h-[72px] bg-gray-100" />}
  </Link>
}

export default async function Homepage() {
  const blogDir = `/${ROUTES.blog}/`
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(QUERY, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CATS_Q, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400"><h2>Tiada Berita</h2></div>
  const [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,pp,q,r,s,t] = posts

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">

      {/* ====== HERO: 1 main + 3 sidebar ====== */}
      <section className="grid lg:grid-cols-[1fr_320px] gap-6 py-5">
        <article>
          <Link href={`${blogDir}${a.slug}`} className="block overflow-hidden mb-3"><Img p={a} w={640} h={360} prio /></Link>
          <Cat p={a} sz="text-[11px]" />
          <Link href={`${blogDir}${a.slug}`}><h1 className="text-[22px] md:text-2xl font-bold leading-tight mt-1 text-[#1A1A1A] hover:text-[#C41E3A] transition-colors line-clamp-3">{a.title}</h1></Link>
          {a.excerpt && <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{a.excerpt}</p>}
          <Time p={a} />
        </article>
        <div className="flex flex-col gap-4">
          {[b,c,d].map(p => (
            <article key={p._id} className="flex gap-3 group">
              <Thumb p={p} />
              <div className="min-w-0"><Cat p={p} /><Title p={p} sz="text-sm" /><Time p={p} /></div>
            </article>
          ))}
        </div>
      </section>

      {/* ====== 4-CARD ROW ====== */}
      <Div />
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 py-2">
        {[e,f,g,h].map(p => (
          <article key={p._id} className="group">
            <Link href={`${blogDir}${p.slug}`} className="block overflow-hidden mb-2"><Img p={p} w={294} h={165} /></Link>
            <Cat p={p} /><Title p={p} /><Time p={p} />
          </article>
        ))}
      </section>

      {/* ====== FEATURE + 2 side ====== */}
      {i && <><Div />
      <section className="grid lg:grid-cols-[1fr_320px] gap-6 py-2">
        <article>
          <Link href={`${blogDir}${i.slug}`} className="block overflow-hidden mb-3"><Img p={i} w={640} h={360} /></Link>
          <Cat p={i} sz="text-[11px]" /><Title p={i} sz="text-xl" />
          {i.excerpt && <p className="text-sm text-gray-500 mt-1.5">{i.excerpt}</p>}<Time p={i} />
        </article>
        <div className="flex flex-col gap-4">{[j,k].filter(Boolean).map(p=>(<article key={p._id} className="flex gap-3 group"><Thumb p={p}/><div className="min-w-0"><Cat p={p}/><Title p={p}/><Time p={p}/></div></article>))}</div>
      </section></>}

      {/* ====== EDITOR'S PICKS ====== */}
      <Div /><SecH title="Pilihan Editor" />
      <section className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          {l && (<article className="mb-6">
            <Link href={`${blogDir}${l.slug}`} className="block overflow-hidden mb-2"><Img p={l} w={620} h={349} /></Link>
            <Cat p={l} sz="text-[11px]" /><Title p={l} sz="text-xl" /><Time p={l} />
          </article>)}
          <div className="grid md:grid-cols-3 gap-5">
            {[m,n,o].filter(Boolean).map(p=>(<article key={p._id} className="group"><Link href={`${blogDir}${p.slug}`} className="block overflow-hidden mb-2"><Img p={p} w={293} h={165}/></Link><Cat p={p}/><Title p={p}/><Time p={p}/></article>))}
          </div>
        </div>
        <aside><h3 className="text-sm font-bold text-gray-900 mb-3">Berita Terkini</h3>
          <div className="divide-y divide-gray-100">{posts.slice(0,8).map(p=>(<Link key={p._id} href={`${blogDir}${p.slug}`} className="block py-2 text-xs text-gray-700 hover:text-[#C41E3A] transition-colors">{p.title}</Link>))}</div>
        </aside>
      </section>

      {/* ====== BUSINESS ====== */}
      {pp && <><Div /><SecH title="Berita Bisnes" />
      <section className="grid lg:grid-cols-[1fr_320px] gap-6">
        <article>
          <Link href={`${blogDir}${pp.slug}`} className="block overflow-hidden mb-3"><Img p={pp} w={620} h={349}/></Link>
          <Cat p={pp} sz="text-[11px]"/><Title p={pp} sz="text-xl"/>
          {pp.excerpt && <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{pp.excerpt}</p>}<Time p={pp}/>
        </article>
        <div className="flex flex-col gap-4">{[q,r,s].filter(Boolean).map(p=>(<article key={p._id} className="flex gap-3 group"><Thumb p={p}/><div className="min-w-0"><Cat p={p}/><Title p={p}/><Time p={p}/></div></article>))}</div>
      </section></>}

      {/* ====== POPULAR + TRENDING ====== */}
      <Div />
      <section className="grid lg:grid-cols-[1fr_300px] gap-6 py-2">
        <div><SecH title="Paling Popular" />
          <div className="divide-y divide-gray-100">{posts.slice(0,10).map((p,i)=>(<article key={p._id} className="group flex gap-4 py-3 first:pt-0 last:pb-0"><span className="text-2xl font-bold text-gray-200 leading-none w-7 shrink-0">{i+1}</span><div className="min-w-0"><Cat p={p}/><Title p={p}/><Time p={p}/></div></article>))}</div>
        </div>
        <aside><SecH title="Topik Trending" /><div className="flex flex-wrap gap-2">{cats.map(c=>(<Link key={c._id} href={`/${ROUTES.blog}?category=${c.slug}`} className="px-3 py-1.5 text-[11px] bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c.title}</Link>))}</div></aside>
      </section>

      {/* ====== KATEGORI ====== */}
      <Div /><SecH title="Kategori" />
      <div className="flex flex-wrap gap-2 pb-5">{cats.map(c=>(<Link key={c._id} href={`/${ROUTES.blog}?category=${c.slug}`} className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c.title}</Link>))}</div>

      {/* ====== CTA ====== */}
      <Div />
      <section className="text-center py-8">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href={`/${ROUTES.blog}`} className="px-5 py-2 text-sm font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link>
          <Link href="/hubungi" className="px-5 py-2 text-sm font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link>
        </div>
      </section>
    </div>
  )
}
