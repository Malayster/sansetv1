import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

/* ─── Queries ─── */
const POSTS_Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...48]{
  _id,title,excerpt,publishDate,'img':metadata.image,'slug':metadata.slug.current,
  'cat':categories[0]->{title,color},'author':authors[0]->{name}
}`
const CATS_Q = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`
const BP = `/${ROUTES.blog}/`

/* ─── Constants ─── */
const G = '#f51416'      // --g-color
const C = '#031934'      // --body-fcolor

type P = any

/* ─── Helpers ─── */
function ago(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'j'
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd'
  return new Date(d).toLocaleDateString('ms', { day:'numeric', month:'short' })
}

function Im({ p, w, h }: { p: P; w: number; h: number }) {
  return p.img
    ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full h-full object-cover" />
    : <div className="w-full h-full bg-gray-200" />
}

/* ─── Components ─── */

function Cat({ c, ov }: { c?: string; ov?: boolean }) {
  if (!c) return null
  /* ov = overlay pill on image */
  if (ov) return <span className="absolute bottom-3 left-3 z-10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white leading-none" style={{background:G}}>{c}</span>
  /* inline text cat */
  return <span className="text-[11px] font-semibold uppercase tracking-wide" style={{color:G}}>{c}</span>
}

function Heading({ t, l }: { t: string; l?: string }) {
  return (
    <div className="flex items-center justify-between pb-[5px] mb-4" style={{borderBottom:'1px solid #e5e7eb'}}>
      <h2 className="text-[15px] font-bold uppercase tracking-wide" style={{color:C}}>{t}</h2>
      {l && <Link href={l} className="text-[10px] font-bold uppercase tracking-wider" style={{color:G}}>Lebih &rarr;</Link>}
    </div>
  )
}

function ArticleCard({ p: x }: { p: P }) {
  return (
    <article>
      <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'360/220'}}>
        <Im p={x} w={360} h={220} />
        <Cat c={x.cat?.title} ov />
      </Link>
      <Cat c={x.cat?.title} />
      <Link href={`${BP}${x.slug}`} className="block text-[13px] font-bold leading-snug mt-1 hover:opacity-60 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
      <span className="text-[9px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
    </article>
  )
}

export default async function Homepage() {
  const [a, cats] = await Promise.all([
    client.fetch<P[]>(POSTS_Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CATS_Q, {}, { next: { revalidate: 300 } }),
  ])
  if (!a.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, ...tt] = a

  return (
  <div className="mx-auto text-[15px]" style={{maxWidth:1300,color:C}}>

    {/* ████████████████████████████████████████████████████████████████████████████████
       BAR TRENDING (merah) — macam Foxiz .elementor-element-a73be22
       ████████████████████████████████████████████████████████████████████████████████ */}
    <div className="flex items-center gap-0 px-5 overflow-x-auto text-[13px] font-medium" style={{background:G,color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.25)'}}>
      {['Home','Read History','Economy','Global Security','Pages','Blog'].map(t => (
        <Link key={t} href="#" className="shrink-0 px-4 py-2.5 hover:opacity-70 transition-opacity" style={{borderRight:'1px solid rgba(255,255,255,0.2)'}}>{t}</Link>
      ))}
    </div>

    {/* ████████████████████████████████████████████████████████████████████████████████
       HERO  3-col layout (Foxiz .elementor-e165b28)
       LEFT = feature (67%) + middle (list), RIGHT = Most Read (25%)
       ████████████████████████████████████████████████████████████████████████████████ */}
    <div className="px-5 pt-8 pb-2 flex flex-col lg:flex-row gap-10">
      {/* Left group — 75% */}
      <div className="lg:w-[73%] flex flex-col lg:flex-row gap-10">
        {/* Feature — 67% of left */}
        <div className="lg:w-[67%]">
          <article>
            <Link href={`${BP}${p1.slug}`} className="block relative overflow-hidden mb-3" style={{aspectRatio:'860/573'}}>
              <Im p={p1} w={860} h={573} />
              <Cat c={p1.cat?.title} ov />
            </Link>
            <div className="mb-[5px]"><Cat c={p1.cat?.title} /></div>
            <Link href={`${BP}${p1.slug}`}>
              <h1 className="text-[22px] sm:text-[28px] lg:text-[34px] font-bold leading-tight hover:opacity-60 transition-opacity" style={{color:C}}>{p1.title}</h1>
            </Link>
            {p1.excerpt && <p className="text-[13px] mt-2 leading-relaxed line-clamp-2 text-gray-500">{p1.excerpt}</p>}
            <span className="text-[11px] text-gray-400 mt-2 block">{ago(p1.publishDate)}</span>
            {/* divider line */}
            <div className="w-[250px] h-[3px] mt-3" style={{background:G}} />
          </article>
        </div>
        {/* Middle — 2 list articles */}
        <div className="lg:w-[33%] space-y-6">
          {[p2, p3].map(x => (
            <article key={x._id}>
              <Link href={`${BP}${x.slug}`} className="flex gap-4 items-start">
                <div className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
                  <Im p={x} w={120} h={80} />
                </div>
                <div className="min-w-0">
                  <Cat c={x.cat?.title} />
                  <h3 className="text-[14px] font-bold leading-snug mt-0.5 hover:opacity-60 transition-opacity line-clamp-3" style={{color:C}}>{x.title}</h3>
                  <span className="text-[10px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
                </div>
              </Link>
            </article>
          ))}
          {/* 3rd row: Global Trade Wars */}
          <article>
            <Link href={`${BP}${p4.slug}`} className="flex gap-4 items-start">
              <div className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
                <Im p={p4} w={120} h={80} />
              </div>
              <div className="min-w-0">
                <Cat c={p4.cat?.title} />
                <h3 className="text-[14px] font-bold leading-snug mt-0.5 hover:opacity-60 transition-opacity line-clamp-3" style={{color:C}}>{p4.title}</h3>
                <span className="text-[10px] text-gray-400 mt-1 block">{ago(p4.publishDate)}</span>
              </div>
            </Link>
          </article>
        </div>
      </div>

      {/* RIGHT sidebar — Most Read (25%) — macam Foxiz Most Read */}
      <aside className="lg:w-[27%]">
        <div style={{borderLeft:'1px solid rgba(136,136,136,0.13)',paddingLeft:20}}>
          <h3 className="text-[18px] font-bold mb-4" style={{color:C}}><span style={{borderRight:'4px solid '+G,borderLeft:'7px solid '+G,height:14,display:'inline-block',width:15,marginRight:8,transform:'skewX(-15deg)'}} />Most Read</h3>
          <div className="space-y-0">
            {[p5, p6, p7, p8, p9, p10].filter(Boolean).map((x, idx) => (
              <div key={x._id} className="flex items-start gap-3 py-3" style={{borderBottom:'1px solid rgba(136,136,136,0.13)'}}>
                <span className="shrink-0 w-7 h-7 flex items-center justify-center text-[12px] font-bold text-white leading-none" style={{background:G,borderRadius:5}}>{idx+1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`${BP}${x.slug}`} className="text-[12px] leading-snug font-bold hover:opacity-60 transition-opacity line-clamp-2 block" style={{color:C}}>{x.title}</Link>
                </div>
              </div>
            ))}
          </div>
          {/* iklan */}
          <div className="mt-5 text-center">
            <div className="text-[10px] text-gray-400 mb-2">- Advertisement -</div>
            <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">Ad</div>
          </div>
        </div>
      </aside>
    </div>

    {/* ████████████████████████████████████████████████████████████████████████████████
       NEWSLETTER — macam Foxiz #newsletter
       ████████████████████████████████████████████████████████████████████████████████ */}
    <div className="px-5 py-6 flex items-center gap-8 border-t border-gray-200" style={{borderLeft:'10px solid '+G,margin:'0 20px',borderRadius:5}}>
      <img src="https://foxiz.io/morningnews/wp-content/uploads/sites/6/2025/05/dark-logo.png" alt="" className="h-10 w-auto hidden sm:block" />
      <div className="flex-1">
        <p className="text-[13px] leading-relaxed text-gray-600">Subscribe to our newsletter for real-time updates on new articles, tips, and exclusive insights.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <input type="email" placeholder="Your email address" className="px-4 py-2 text-[13px] border border-gray-300 outline-none w-[200px]" />
        <button className="px-5 py-2 text-[13px] font-bold text-white" style={{background:G}}>Subscribe</button>
      </div>
    </div>

    {/* ████████████████████████████████████████████████████████████████████████████████
       FEATURED STORIES — 4-col grid
       ████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-8 pb-2">
      <Heading t="Featured Stories" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[p11, p12, p13, p14].filter(Boolean).map(x => <ArticleCard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ████████████████████████████████████████████████████████████████████████████████
       QUICK LINKS — pill-style tags (macam Foxiz qlink qlayout-2)
       ████████████████████████████████████████████████████████████████████████████████ */}
    <div className="px-5 py-4 border-t border-gray-200 flex flex-wrap items-center gap-2 text-[13px]">
      <span className="font-bold text-gray-500 mr-2">Quick Links:</span>
      {['Opinion','Economic','Featured','Global Affairs','Climate Change','Renewable Energy','Politics','Research'].map(t => (
        <Link key={t} href="#" className="px-3 py-1.5 text-gray-600 hover:text-white font-medium transition-colors" style={{background:'#f3f4f6',borderRadius:3}}>{t}</Link>
      ))}
    </div>

    {/* ████████████████████████████████████████████████████████████████████████████████
       JUST IN + kategori tags row
       ████████████████████████████████████████████████████████████████████████████████ */}
    <div className="px-5 pt-8">
      <Heading t="Just In" />
      {/* List: 1 featured + 2 overlay */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Feature list */}
        <div className="lg:w-1/2 space-y-4">
          {tt.slice(0,3).filter(Boolean).map((x, i) => (
            <div key={x._id} className="flex gap-4 items-center pb-4" style={{borderBottom:'1px solid rgba(136,136,136,0.13)'}}>
              <div className="shrink-0 w-[100px] overflow-hidden" style={{aspectRatio:'100/67'}}>
                <Im p={x} w={100} h={67} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{color:G}}>Global Security</span>
                <h3 className="text-[15px] font-bold leading-snug mt-0.5 hover:opacity-60 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</h3>
              </div>
            </div>
          ))}
        </div>
        {/* Overlay cards */}
        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tt.slice(3,6).filter(Boolean).map(x => (
            <Link key={x._id} href={`${BP}${x.slug}`} className="relative block overflow-hidden" style={{aspectRatio:'420/280'}}>
              <Im p={x} w={420} h={280} />
              <div className="absolute inset-0 flex items-end p-4" style={{background:'linear-gradient(to top, rgba(3,25,52,0.9) 0%, rgba(3,25,52,0.5) 50%, transparent 100%)'}}>
                <h3 className="text-white text-[14px] font-bold leading-snug line-clamp-2">{x.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>

    {/* ████████████████████████████████████████████████████████████████████████████████
       WHAT TO READ
       ████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-8">
      <Heading t="What to Read" />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Overlay feature */}
        <div className="lg:w-1/2 relative overflow-hidden" style={{aspectRatio:'860/573',border:'1px solid rgba(136,136,136,0.2)'}}>
          <Link href={`${BP}${tt[6]?.slug||'#'}`} className="block h-full">
            <Im p={tt[6]||p15} w={860} h={573} />
            <div className="absolute inset-0 flex items-end p-6" style={{background:'linear-gradient(to top, rgba(3,25,52,0.95) 0%, rgba(3,25,52,0.7) 50%, transparent 100%)'}}>
              <div>
                <span className="px-3 py-1 text-[11px] font-bold uppercase text-white" style={{background:G}}>World</span>
                <h3 className="text-white text-[18px] font-bold leading-snug mt-2 line-clamp-2">{tt[6]?.title||'Peace Talks Fail'}</h3>
              </div>
            </div>
          </Link>
        </div>
        {/* 4-grid right */}
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          {tt.slice(7,11).filter(Boolean).map(x => <ArticleCard key={x._id} p={x} />)}
        </div>
      </div>
    </section>

    {/* ████████████████████████████████████████████████████████████████████████████████
       THE LATEST — 5-col
       ████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-8">
      <Heading t="The Latest" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tt.slice(11,16).filter(Boolean).map(x => <ArticleCard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ████████████████████████████████████████████████████████████████████████████████
       CTA — background image
       ████████████████████████████████████████████████████████████████████████████████ */}
    <section className="mx-5 my-8 rounded-lg overflow-hidden relative" style={{background:'linear-gradient(135deg, #0a1628, #1a2744)',minHeight:200}}>
      <div className="flex items-center justify-between p-10 relative z-10">
        <div className="max-w-[720px]">
          <h2 className="text-white text-[28px] sm:text-[36px] font-bold leading-tight">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
          <p className="text-gray-300 text-[14px] mt-2 italic">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
        </div>
        <Link href={BP} className="shrink-0 px-10 py-3 text-[15px] font-semibold text-white rounded-lg" style={{background:G,borderRadius:'5px 20px 5px 5px'}}>Baca Berita</Link>
      </div>
    </section>

    {/* ████████████████████████████████████████████████████████████████████████████████
       MORE NEWS — list with thumbnail
       ████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-8">
      <Heading t="More News" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
        {tt.slice(16,26).filter(Boolean).map(x => (
          <div key={x._id} className="flex gap-4 py-4 items-center" style={{borderBottom:'1px solid rgba(136,136,136,0.13)'}}>
            <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
              <Im p={x} w={120} h={80} />
            </Link>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{color:G}}>{x.cat?.title||'Berita'}</span>
              <h3 className="text-[14px] font-bold leading-snug mt-0.5 hover:opacity-60 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</h3>
              <span className="text-[10px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ████████████████████████████████████████████████████████████████████████████████
       KATEGORI tags
       ████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 py-6 mt-6" style={{borderTop:'1px solid #e5e7eb'}}>
      <h3 className="text-[14px] font-bold uppercase tracking-wide text-gray-500 pb-3">Kategori</h3>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c._id} href={`${BP}?category=${c.slug}`}
            className="px-3 py-1.5 text-gray-600 text-[12px] font-medium transition-colors hover:text-white" style={{background:'#f3f4f6',borderRadius:3}}
          >{c.title}</Link>
        ))}
      </div>
      <style>{`.px-3\\.py-1\\.5:hover{background:${G}!important;color:#fff!important}`}</style>
    </section>

  </div>
  )
}