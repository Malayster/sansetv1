import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const POSTS_Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...48]{
  _id,title,excerpt,publishDate,'img':metadata.image,'slug':metadata.slug.current,
  'cat':categories[0]->{title,color}
}`
const CATS_Q = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`
const BP = `/${ROUTES.blog}/`
const G = '#f51416'
const C = '#031934'
type P = any

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
    : <div className="w-full h-full bg-gray-100" />
}

function CatOver({ c }: { c?: string }) {
  if (!c) return null
  return <span className="absolute bottom-3 left-3 z-10 px-2 py-1 text-[10px] leading-none font-bold uppercase tracking-wide text-white" style={{background:G}}>{c}</span>
}
function CatIn({ c }: { c?: string }) {
  if (!c) return null
  return <span className="text-[10px] font-semibold uppercase tracking-wide" style={{color:G}}>{c}</span>
}

function SectionH({ t, link }: { t: string; link?: string }) {
  return (
    <div className="flex items-center justify-between pb-[5px] mb-5" style={{borderBottom:'1px solid rgba(136,136,136,0.15)'}}>
      <h2 className="text-[16px] sm:text-[21px] font-bold" style={{color:C}}>{t}</h2>
      {link && <Link href={link} className="text-[10px] font-bold uppercase tracking-wider" style={{color:G}}>Lebih &rarr;</Link>}
    </div>
  )
}

const B = 'rgba(136,136,136,0.13)'

export default async function Homepage() {
  const [all, cats] = await Promise.all([
    client.fetch<P[]>(POSTS_Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CATS_Q, {}, { next: { revalidate: 300 } }),
  ])
  if (!all.length) return <div className="max-w-[1300px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,...tt] = all

  return (
  <div className="mx-auto" style={{maxWidth:1300,color:C,fontSize:15}}>

    {/* ========== 🔥 TRENDING BAR (red bg) ========== */}
    <div className="flex items-center gap-0 px-5 overflow-x-auto font-medium text-white" style={{background:G,fontSize:13}}>
      <span className="shrink-0 flex items-center gap-1 px-4 py-2.5 text-white/70 font-bold uppercase tracking-wider"><span>🔥</span>Trending</span>
      {['Opinion','Economic','Featured','Global Affairs','Climate Change','Renewable Energy','Politics','Research'].map(t => (
        <Link key={t} href="#" className="shrink-0 px-3 py-2.5 text-white/80 hover:text-white transition-opacity" style={{borderRight:'1px solid rgba(255,255,255,0.2)'}}>{t}</Link>
      ))}
    </div>

    {/* ========== HERO (3-col: feature + list + Most Read) ========== */}
    <div className="flex flex-col lg:flex-row gap-10 px-5 pt-8 pb-4" style={{borderBottom:'1px solid #e5e7eb'}}>

      {/* LEFT 75% */}
      <div className="lg:w-[73%] flex flex-col lg:flex-row gap-8">

        {/* Feature 67% */}
        <div className="lg:w-[67%]">
          <article>
            <Link href={`${BP}${p1.slug}`} className="block relative overflow-hidden mb-3" style={{aspectRatio:'860/573'}}>
              <Im p={p1} w={860} h={573} />
              <CatOver c={p1.cat?.title} />
            </Link>
            <div className="mb-[3px]"><CatIn c={p1.cat?.title} /></div>
            <Link href={`${BP}${p1.slug}`}>
              <h1 className="text-[22px] sm:text-[28px] lg:text-[34px] font-bold leading-tight hover:opacity-70 transition-opacity" style={{color:C}}>{p1.title}</h1>
            </Link>
            <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-500">
              <span>{ago(p1.publishDate)}</span>
            </div>
            <div className="w-[250px] h-[3px] mt-3" style={{background:G}} />
          </article>
        </div>

        {/* List 33% */}
        <div className="lg:w-[33%] space-y-5">
          {[p3,p4,p5].filter(Boolean).map(x => (
            <div key={x._id} className="flex gap-4 items-start pb-5" style={{borderBottom:'1px solid '+B}}>
              <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
                <Im p={x} w={120} h={80} />
              </Link>
              <div className="min-w-0 flex-1">
                <CatIn c={x.cat?.title} />
                <Link href={`${BP}${x.slug}`} className="block text-[14px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-3" style={{color:C}}>{x.title}</Link>
                <span className="text-[10px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT 25% — Most Read */}
      <aside className="lg:w-[27%]" style={{borderLeft:'1px solid '+B,paddingLeft:24}}>
        <div className="flex items-center gap-2 mb-5">
          <span style={{display:'inline-block',width:15,height:14,transform:'skewX(-15deg)',borderRight:'4px solid '+G,borderLeft:'7px solid '+G}} />
          <h3 className="text-[18px] sm:text-[21px] font-bold" style={{color:C}}>Most Read</h3>
        </div>
        {[p6,p7,p8,p9,p10,p11].filter(Boolean).map((x,i) => (
          <div key={x._id} className="flex items-start gap-3 py-3" style={{borderBottom:'1px solid '+B}}>
            <span className="shrink-0 w-7 h-7 flex items-center justify-center text-[12px] font-bold text-white" style={{background:G,borderRadius:4}}>{i+1}</span>
            <div className="min-w-0 flex-1">
              <Link href={`${BP}${x.slug}`} className="text-[12px] font-bold leading-snug hover:opacity-70 transition-opacity line-clamp-2 block" style={{color:C}}>{x.title}</Link>
            </div>
          </div>
        ))}
        <div className="mt-6 text-center">
          <div className="text-[10px] text-gray-400 mb-2">- Advertisement -</div>
          <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">Ad</div>
        </div>
      </aside>
    </div>

    {/* ========== NEWSLETTER ========== */}
    <div className="mx-5 my-6 flex items-center gap-6 p-4 border border-gray-200" style={{borderLeft:'10px solid '+G,borderRadius:5}}>
      <img src="https://foxiz.io/morningnews/wp-content/uploads/sites/6/2025/05/dark-logo.png" alt="" className="h-10 w-auto hidden sm:block" />
      <p className="flex-1 text-[13px] leading-relaxed text-gray-600">Subscribe to our newsletter for real-time updates on new articles, tips, and exclusive insights.</p>
      <div className="flex gap-2 shrink-0">
        <input type="email" placeholder="Your email address" className="px-4 py-2 text-[13px] border border-gray-300 outline-none w-[180px]" />
        <button className="px-5 py-2 text-[13px] font-bold text-white" style={{background:G,borderRadius:3}}>Subscribe</button>
      </div>
    </div>

    {/* ========== FEATURED STORIES (4-col) ========== */}
    <section className="px-5 pt-2 pb-4">
      <SectionH t="Featured Stories" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[p12,p13,p14,p15].filter(Boolean).map(x => (
          <ArticleCard key={x._id} p={x} />
        ))}
      </div>
    </section>

    {/* ========== 6-COL GRID (Global Security / Travel) ========== */}
    <section className="px-5 pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tt.slice(0,6).filter(Boolean).map(x => <MiniCard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ========== QUICK LINKS ========== */}
    <div className="mx-5 py-4 flex flex-wrap items-center gap-2 text-[13px]" style={{borderTop:'1px solid '+B}}>
      <span className="font-bold text-gray-400 mr-1">Quick Links:</span>
      {['Opinion','Economic','Featured','Global Affairs','Climate Change','Renewable Energy','Politics','Research'].map(t => (
        <Link key={t} href="#" className="px-3 py-1.5 text-gray-600 text-[12px] font-medium transition-colors hover:text-white" style={{background:'#f3f4f6',borderRadius:3}}>{t}</Link>
      ))}
    </div>

    {/* ========== JUST IN ========== */}
    <section className="px-5 pt-6">
      <SectionH t="Just In" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 space-y-4">
          {tt.slice(6,9).filter(Boolean).map(x => (
            <div key={x._id} className="flex gap-4 items-start pb-4" style={{borderBottom:'1px solid '+B}}>
              <Link href={`${BP}${x.slug}`} className="shrink-0 w-[100px] overflow-hidden" style={{aspectRatio:'100/67'}}>
                <Im p={x} w={100} h={67} />
              </Link>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{color:G}}>{x.cat?.title||'Berita'}</span>
                <Link href={`${BP}${x.slug}`} className="block text-[14px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:w-1/2 grid grid-cols-3 gap-3">
          {tt.slice(9,12).filter(Boolean).map(x => (
            <Link key={x._id} href={`${BP}${x.slug}`} className="relative block overflow-hidden" style={{aspectRatio:'420/280'}}>
              <Im p={x} w={420} h={280} />
              <div className="absolute inset-0 flex items-end p-3" style={{background:'linear-gradient(to top, rgba(3,25,52,0.95) 0%, rgba(3,25,52,0.6) 50%, transparent 100%)'}}>
                <h3 className="text-white text-[13px] font-bold leading-snug line-clamp-2">{x.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ========== BUSINESS — 2-col list ========== */}
    <section className="px-5 pt-8">
      <SectionH t="Business" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tt.slice(12,16).filter(Boolean).map(x => (
          <div key={x._id} className="flex gap-4 items-start" style={{borderBottom:'1px solid '+B,paddingBottom:16}}>
            <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
              <Im p={x} w={120} h={80} />
            </Link>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{color:G}}>{x.cat?.title||'Berita'}</span>
              <Link href={`${BP}${x.slug}`} className="block text-[14px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
              <span className="text-[10px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ========== CIRCULAR AVATAR ARTICLES ========== */}
    <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tt.slice(16,19).filter(Boolean).map(x => (
        <div key={x._id} className="flex items-center gap-3">
          <Link href={`${BP}${x.slug}`} className="shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden">
            <Im p={x} w={60} h={60} />
          </Link>
          <div className="min-w-0">
            <Link href={`${BP}${x.slug}`} className="block text-[12px] font-bold leading-snug hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
            <span className="text-[10px] uppercase tracking-wide" style={{color:G}}>{x.cat?.title||'Berita'}</span>
          </div>
        </div>
      ))}
    </div>

    {/* ========== AD ========== */}
    <div className="px-5 py-3 text-center">
      <div className="text-[10px] text-gray-400 mb-2">- Advertisement -</div>
      <div className="w-full aspect-[8/1] bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 mx-auto max-w-[728px]">Ad Banner</div>
    </div>

    {/* ========== WHAT TO READ ========== */}
    <section className="px-5 pt-6">
      <SectionH t="What to Read" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 relative overflow-hidden" style={{border:'1px solid '+B}}>
          <Link href={`${BP}${tt[19]?.slug||'#'}`} className="block relative" style={{aspectRatio:'860/573'}}>
            <Im p={tt[19]||tt[0]} w={860} h={573} />
            <div className="absolute inset-0 flex items-end p-6" style={{background:'linear-gradient(to top, rgba(3,25,52,0.95) 0%, rgba(3,25,52,0.7) 50%, transparent 100%)'}}>
              <div>
                <span className="px-3 py-1 text-[11px] font-bold uppercase text-white" style={{background:G}}>{tt[19]?.cat?.title||'Berita'}</span>
                <h3 className="text-white text-[17px] font-bold leading-snug mt-2 line-clamp-2">{tt[19]?.title||'Berita'}</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          {tt.slice(20,24).filter(Boolean).map(x => <ArticleCard key={x._id} p={x} />)}
        </div>
      </div>
    </section>

    {/* ========== THE LATEST — 5-col ========== */}
    <section className="px-5 pt-8">
      <SectionH t="The Latest" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tt.slice(24,29).filter(Boolean).map(x => <ArticleCard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ========== CTA ========== */}
    <section className="mx-5 my-6 flex items-center justify-between p-8 sm:p-10 text-white" style={{background:'linear-gradient(135deg,#0f1a2e,#1a2a44)',borderRadius:10,minHeight:160}}>
      <div className="max-w-[600px]">
        <h2 className="text-[22px] sm:text-[30px] font-bold leading-tight">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
        <p className="text-gray-300 text-[14px] mt-2 italic max-w-[500px]">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      </div>
      <Link href={BP} className="shrink-0 px-8 py-3 text-[14px] font-semibold text-white" style={{background:G,borderRadius:'5px 20px 5px 5px'}}>Baca Berita &rarr;</Link>
    </section>

    {/* ========== MORE NEWS — 2-col list ========== */}
    <section className="px-5 pt-4 pb-6">
      <SectionH t="More News" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
        {tt.slice(29,39).filter(Boolean).map(x => (
          <div key={x._id} className="flex gap-4 py-4 items-center" style={{borderBottom:'1px solid '+B}}>
            <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
              <Im p={x} w={120} h={80} />
            </Link>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{color:G}}>{x.cat?.title||'Berita'}</span>
              <Link href={`${BP}${x.slug}`} className="block text-[14px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
              <span className="text-[10px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ========== KATEGORI ========== */}
    <section className="px-5 py-6" style={{borderTop:'1px solid #e5e7eb'}}>
      <h3 className="text-[14px] font-bold uppercase tracking-wide text-gray-500 pb-3">Kategori</h3>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c._id} href={`${BP}?category=${c.slug}`}
            className="px-3 py-1.5 text-gray-600 text-[12px] font-medium transition-colors hover:text-white" style={{background:'#f3f4f6',borderRadius:3}}
          >{c.title}</Link>
        ))}
      </div>
    </section>

  </div>
  )
}

/* ─── Reusable card components ─── */

function ArticleCard({ p: x }: { p: P }) {
  return (
    <article>
      <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'360/220'}}>
        <Im p={x} w={360} h={220} />
        <CatOver c={x.cat?.title} />
      </Link>
      <CatIn c={x.cat?.title} />
      <Link href={`${BP}${x.slug}`} className="block text-[13px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
      <span className="text-[10px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
    </article>
  )
}

function MiniCard({ p: x }: { p: P }) {
  return (
    <article>
      <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'300/200'}}>
        <Im p={x} w={300} h={200} />
        <CatOver c={x.cat?.title} />
      </Link>
      <CatIn c={x.cat?.title} />
      <Link href={`${BP}${x.slug}`} className="block text-[12px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
    </article>
  )
}