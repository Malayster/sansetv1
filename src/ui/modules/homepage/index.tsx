import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

/* ═══════════════════════ QUERIES ═══════════════════════ */
const POSTS_Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...48]{
  _id,title,excerpt,publishDate,'img':metadata.image,'slug':metadata.slug.current,
  'cat':categories[0]->{title,color}
}`
const CATS_Q = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`
const BP = `/${ROUTES.blog}/`

/* ═══════════════════════ CONSTANTS ═══════════════════════ */
const G = '#f51416'
const C = '#031934'
const B = 'rgba(136,136,136,0.13)'

type P = any

/* ═══════════════════════ HELPERS ═══════════════════════ */
function ago(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'j'
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd'
  return new Date(d).toLocaleDateString('ms', { day:'numeric', month:'short', year:'numeric' })
}

function Img({ p, w, h }: { p: P; w: number; h: number }) {
  return p.img
    ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full h-full object-cover" />
    : <div className="w-full h-full bg-gray-100" />
}

function Cat({ c, ov, s }: { c?: string; ov?: boolean; s?: string }) {
  if (!c) return null
  if (ov) return <span className={`absolute bottom-3 left-3 z-10 px-2 py-1 ${s||'text-[10px]'} leading-none font-bold uppercase tracking-wide text-white`} style={{background:G}}>{c}</span>
  return <span className={`${s||'text-[11px]'} font-bold uppercase tracking-wide`} style={{color:G}}>{c}</span>
}

function SectionHeading({ t }: { t: string }) {
  return (
    <div className="flex items-center gap-3 mb-5" style={{borderBottom:'1px solid '+B,paddingBottom:5}}>
      <span style={{display:'inline-block',width:15,height:14,transform:'skewX(-15deg)',borderRight:'4px solid '+G,borderLeft:'7px solid '+G}} />
      <h2 className="text-[18px] sm:text-[21px] font-bold" style={{color:C}}>{t}</h2>
    </div>
  )
}

/* ═══════════════════════ CARDS ═══════════════════════ */
function ACard({ p: x }: { p: P }) {
  return (
    <article>
      <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'360/220'}}>
        <Img p={x} w={360} h={220} />
        <Cat c={x.cat?.title} ov />
      </Link>
      <Cat c={x.cat?.title} />
      <Link href={`${BP}${x.slug}`} className="block text-[13px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
      <span className="text-[11px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
    </article>
  )
}

function SCard({ p: x }: { p: P }) {
  return (
    <article>
      <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'300/200'}}>
        <Img p={x} w={300} h={200} />
        <Cat c={x.cat?.title} ov s="text-[9px]" />
      </Link>
      <Link href={`${BP}${x.slug}`} className="block text-[11px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
    </article>
  )
}

export default async function Homepage() {
  const [all, cats] = await Promise.all([
    client.fetch<P[]>(POSTS_Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CATS_Q, {}, { next: { revalidate: 300 } }),
  ])
  if (!all.length) return <div className="max-w-[1300px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,...tt] = all

  return (
  <div className="mx-auto" style={{maxWidth:1300,color:C,fontSize:16,fontFamily:'system-ui,sans-serif'}}>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       TRENDING BAR — #f51416 background
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <div className="flex items-center gap-0 overflow-x-auto font-semibold text-white uppercase tracking-wide" style={{background:G,fontSize:12}}>
      <span className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-white/70">🔥 <span className="font-bold">Trending</span></span>
      {['Opinion','Economic','Featured','Global Affairs','Climate Change','Renewable Energy','Politics','Research'].map(t => (
        <Link key={t} href="#" className="shrink-0 px-3 py-2.5 text-white/85 hover:text-white transition-opacity" style={{borderRight:'1px solid rgba(255,255,255,0.2)'}}>{t}</Link>
      ))}
    </div>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       HERO SECTION — Foxiz .elementor-2749 .elementor-element-e165b28
       Feature (67%) + List (33%) on LEFT 75% | Most Read (25%) on RIGHT
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <div className="flex flex-col lg:flex-row gap-10 px-5 pt-8 pb-5">

      {/* LEFT 75% — .elementor-element-2f698fd (75%) */}
      <div className="lg:w-[73%] flex flex-col lg:flex-row gap-10">

        {/* FEATURE + LIST 67% — .elementor-element-56b38b4 (67%) */}
        <div className="lg:w-[67%] flex flex-col lg:flex-row gap-8">

          {/* FEATURE — .elementor-element-d43d413 */}
          <div className="lg:w-[60%]">
            <article>
              <Link href={`${BP}${p1.slug}`} className="block relative overflow-hidden mb-3" style={{aspectRatio:'860/573'}}>
                <Img p={p1} w={860} h={573} />
                <Cat c={p1.cat?.title} ov />
              </Link>
              <div className="mb-1"><Cat c={p1.cat?.title} s="text-[12px]" /></div>
              <Link href={`${BP}${p1.slug}`}>
                <h1 className="text-[24px] sm:text-[30px] lg:text-[35px] font-bold leading-[1.25] hover:opacity-70 transition-opacity" style={{color:C}}>{p1.title}</h1>
              </Link>
              <div className="flex items-center gap-2 mt-2 text-[12px]" style={{color:'rgba(3,25,52,0.6)'}}>
                <span>{ago(p1.publishDate)}</span>
              </div>
            </article>
          </div>

          {/* LIST — .elementor-element-7643f77 */}
          <div className="lg:w-[40%] space-y-0">
            {[p2,p3,p4].filter(Boolean).map((x,i) => (
              <div key={x._id} className="flex gap-4 items-start py-4" style={{borderBottom: i<2 ? '1px solid '+B : 'none'}}>
                <Link href={`${BP}${x.slug}`} className="shrink-0 w-[90px] overflow-hidden" style={{aspectRatio:'90/60'}}>
                  <Img p={x} w={90} h={60} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Cat c={x.cat?.title} s="text-[10px]" />
                  <Link href={`${BP}${x.slug}`} className="block text-[13px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-3" style={{color:C}}>{x.title}</Link>
                  <span className="text-[10px] mt-0.5 block" style={{color:'rgba(3,25,52,0.5)'}}>{ago(x.publishDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 ARTICLES — .elementor-element-b43d549 (33%) */}
        <div className="lg:w-[33%] space-y-5">
          {[p5,p6,p7].filter(Boolean).map(x => (
            <article key={x._id}>
              <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'330/220'}}>
                <Img p={x} w={330} h={220} />
                <Cat c={x.cat?.title} ov s="text-[9px]" />
              </Link>
              <Cat c={x.cat?.title} s="text-[10px]" />
              <Link href={`${BP}${x.slug}`} className="block text-[13px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
              <span className="text-[10px] mt-0.5 block" style={{color:'rgba(3,25,52,0.5)'}}>{ago(x.publishDate)}</span>
            </article>
          ))}
        </div>
      </div>

      {/* RIGHT 25% — Most Read .elementor-element-613cd15 */}
      <aside className="lg:w-[27%]" style={{borderLeft:'1px solid '+B,paddingLeft:24}}>
        {/* Heading "Most Read" — .elementor-element-0fab0eb */}
        <div className="flex items-center gap-2 mb-5">
          <span style={{display:'inline-block',width:15,height:14,transform:'skewX(-15deg)',borderRight:'4px solid '+G,borderLeft:'7px solid '+G}} />
          <h3 className="text-[18px] sm:text-[21px] font-bold" style={{color:C}}>Most Read</h3>
        </div>
        {/* List — .elementor-element-b1d9383 */}
        {[p8,p9,p10,p11,p12,p13].filter(Boolean).map((x,i) => (
          <div key={x._id} className="flex items-start gap-3 py-3" style={{borderBottom:'1px solid '+B}}>
            <span className="shrink-0 w-[26px] h-[26px] flex items-center justify-center text-[12px] font-bold text-white leading-none" style={{background:G,borderRadius:5}}>{i+1}</span>
            <div className="min-w-0 flex-1">
              <Link href={`${BP}${x.slug}`} className="text-[12px] font-bold leading-snug hover:opacity-70 transition-opacity line-clamp-2 block" style={{color:C}}>{x.title}</Link>
            </div>
          </div>
        ))}
        {/* Ad — .elementor-element-7507b19 */}
        <div className="mt-5 text-center">
          <div className="text-[10px] mb-2" style={{color:'rgba(3,25,52,0.5)'}}>- Advertisement -</div>
          <div className="w-full overflow-hidden" style={{aspectRatio:'400/340'}}>
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px]" style={{color:'rgba(3,25,52,0.5)'}}>Ad</div>
          </div>
        </div>
      </aside>
    </div>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       NEWSLETTER — .elementor-element-758f01e
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <div className="mx-5 my-5 flex items-center gap-6 p-4 border border-gray-200" style={{borderLeft:'10px solid '+G,borderRadius:5}}>
      <img src="https://foxiz.io/morningnews/wp-content/uploads/sites/6/2025/05/dark-logo.png" alt="" className="h-10 w-auto hidden sm:block opacity-70" />
      <p className="flex-1 text-[14px] leading-relaxed" style={{color:'rgba(3,25,52,0.7)'}}>Subscribe to our newsletter for real-time updates on new articles, tips, and exclusive insights.</p>
      <div className="flex gap-2 shrink-0">
        <input type="email" placeholder="Your email address" className="px-4 py-2 text-[13px] border border-gray-300 outline-none w-[170px]" />
        <button className="px-5 py-2 text-[13px] font-bold text-white" style={{background:G,borderRadius:3}}>Subscribe</button>
      </div>
    </div>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       FEATURED STORIES — .elementor-element-7499e70 + 79cd406 (4-col)
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-3 pb-5">
      <SectionHeading t="Featured Stories" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[p14,p15,...tt.slice(0,2)].filter(Boolean).map(x => <ACard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       6-COL GRID — .elementor-element-b2944e8
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tt.slice(2,8).filter(Boolean).map(x => <SCard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       QUICK LINKS — .elementor-element-4ce4917 (qlayout-2)
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <div className="mx-5 py-3 flex flex-wrap items-center gap-1.5" style={{borderTop:'1px solid '+B}}>
      <span className="font-bold text-[14px] mr-2" style={{color:'rgba(3,25,52,0.5)'}}>Quick Links:</span>
      {['Opinion','Economic','Featured','Global Affairs','Climate Change','Renewable Energy','Politics','Research'].map(t => (
        <Link key={t} href="#" className="px-3 py-1.5 text-[12px] font-medium transition-colors hover:text-white" style={{background:'#f3f4f6',borderRadius:3,color:'rgba(3,25,52,0.7)'}}>{t}</Link>
      ))}
    </div>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       JUST IN — .elementor-element-e0e4b96 (bordered container)
       Heading + 1 list article + divider + 3 overlay articles
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="mx-5 my-6 p-5" style={{border:'1px solid '+B,borderRadius:10}}>
      <SectionHeading t="Just In" />

      {/* 1 list article — .elementor-element-1fe19df */}
      <div className="flex gap-5 items-center pb-5 mb-5" style={{borderBottom:'1px solid '+B}}>
        <Link href={`${BP}${tt[8]?.slug||'#'}`} className="shrink-0 w-[200px] overflow-hidden" style={{aspectRatio:'200/133'}}>
          <Img p={tt[8]||p1} w={200} h={133} />
        </Link>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{color:G}}>{tt[8]?.cat?.title||'Berita'}</span>
          <Link href={`${BP}${tt[8]?.slug||'#'}`} className="block text-[16px] font-bold leading-snug mt-1 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{tt[8]?.title||'Berita'}</Link>
          <span className="text-[11px] mt-1 block" style={{color:'rgba(3,25,52,0.5)'}}>{tt[8]?.publishDate ? ago(tt[8].publishDate) : ''}</span>
        </div>
      </div>

      {/* Divider pattern — .elementor-element-01f33e1 */}
      <div className="mb-5" style={{height:7,background:'repeating-linear-gradient(90deg, rgba(136,136,136,0.25) 0, rgba(136,136,136,0.25) 1px, transparent 1px, transparent 8px)'}} />

      {/* 3 overlay articles — .elementor-element-dc594fc */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tt.slice(9,12).filter(Boolean).map(x => (
          <Link key={x._id} href={`${BP}${x.slug}`} className="relative block overflow-hidden" style={{aspectRatio:'420/280'}}>
            <Img p={x} w={420} h={280} />
            <div className="absolute inset-0 flex items-end p-4" style={{background:'linear-gradient(to top, rgba(3,25,52,0.95) 0%, rgba(3,25,52,0.6) 50%, transparent 100%)'}}>
              <h3 className="text-white text-[14px] font-bold leading-snug line-clamp-2">{x.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       BUSINESS — .elementor-element-aa60198 + 7e31f82 (2-col list)
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-2 pb-4">
      <SectionHeading t="Business" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tt.slice(12,16).filter(Boolean).map(x => (
          <div key={x._id} className="flex gap-4 items-start pb-4" style={{borderBottom:'1px solid '+B}}>
            <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
              <Img p={x} w={120} h={80} />
            </Link>
            <div className="min-w-0 flex-1">
              <Cat c={x.cat?.title} s="text-[10px]" />
              <Link href={`${BP}${x.slug}`} className="block text-[14px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
              <span className="text-[10px] mt-0.5 block" style={{color:'rgba(3,25,52,0.5)'}}>{ago(x.publishDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Divider */}
    <div className="mx-5 mb-3" style={{height:7,background:'repeating-linear-gradient(90deg, rgba(136,136,136,0.25) 0, rgba(136,136,136,0.25) 1px, transparent 1px, transparent 8px)'}} />

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       CIRCULAR AVATAR ARTICLES — .elementor-element-b8211a1 (list-small-3)
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tt.slice(16,19).filter(Boolean).map(x => (
        <div key={x._id} className="flex items-center gap-3">
          <Link href={`${BP}${x.slug}`} className="shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-gray-100">
            <Img p={x} w={60} h={60} />
          </Link>
          <div className="min-w-0">
            <Link href={`${BP}${x.slug}`} className="block text-[12px] font-bold leading-snug hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
            <Cat c={x.cat?.title} s="text-[10px]" />
          </div>
        </div>
      ))}
    </div>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       AD BANNER — .elementor-element-adf5a0f
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <div className="px-5 py-3 text-center">
      <div className="text-[10px] mb-2" style={{color:'rgba(3,25,52,0.5)'}}>- Advertisement -</div>
      <div className="mx-auto overflow-hidden" style={{maxWidth:728,aspectRatio:'728/90'}}>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px]" style={{color:'rgba(3,25,52,0.5)'}}>Ad Banner</div>
      </div>
    </div>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       WHAT TO READ — .elementor-element-02a7fb6 + 5c81bfb
       LEFT 50% gradient overlay + RIGHT 50% 2-col grid
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-5 pb-4">
      <SectionHeading t="What to Read" />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT 50% — .elementor-element-4645042 */}
        <div className="lg:w-1/2 relative overflow-hidden" style={{border:'1px solid '+B}}>
          <Link href={`${BP}${tt[19]?.slug||'#'}`} className="block relative" style={{aspectRatio:'860/573'}}>
            <Img p={tt[19]||p1} w={860} h={573} />
            <div className="absolute inset-0 flex items-end p-5" style={{background:'linear-gradient(to top, #f51416 0%, rgba(245,20,22,0.7) 50%, transparent 100%)'}}>
              <div>
                <span className="px-3 py-1 text-[11px] font-bold uppercase text-white" style={{background: 'rgba(0,0,0,0.3)'}}>{tt[19]?.cat?.title||'Berita'}</span>
                <h3 className="text-white text-[17px] font-bold leading-snug mt-2 line-clamp-2">{tt[19]?.title||'Berita'}</h3>
              </div>
            </div>
          </Link>
        </div>
        {/* RIGHT 50% — .elementor-element-04011f7 */}
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          {tt.slice(20,24).filter(Boolean).map(x => <ACard key={x._id} p={x} />)}
        </div>
      </div>
    </section>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       AD BANNER 2 — .elementor-element-806fe0a
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <div className="px-5 py-2 text-center">
      <div className="text-[10px] mb-2" style={{color:'rgba(3,25,52,0.5)'}}>- Advertisement -</div>
      <div className="mx-auto overflow-hidden" style={{maxWidth:728,aspectRatio:'728/90'}}>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px]" style={{color:'rgba(3,25,52,0.5)'}}>Ad Banner</div>
      </div>
    </div>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       THE LATEST — .elementor-element-cfe7fc1 + 6906381 (5-col)
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-5 pb-4">
      <SectionHeading t="The Latest" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tt.slice(24,29).filter(Boolean).map(x => <ACard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       CTA — .elementor-element-87006b9 (background image)
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="mx-5 my-6 flex items-center justify-between p-8 sm:p-10 text-white overflow-hidden" style={{background:'linear-gradient(135deg,#0f1a2e,#1a2a44)',borderRadius:10,minHeight:180}}>
      <div className="max-w-[700px]">
        <h2 className="text-[24px] sm:text-[36px] font-bold leading-tight">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
        <p className="text-[14px] mt-2 italic max-w-[500px]" style={{color:'rgba(255,255,255,0.8)'}}>Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      </div>
      <Link href={BP} className="shrink-0 px-8 py-3 text-[14px] font-semibold text-white" style={{background:G,borderRadius:'5px 20px 5px 5px'}}>Baca Berita &rarr;</Link>
    </section>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       MORE NEWS — .elementor-element-645b7e6 + 0b1b25a (2-col list, infinite scroll)
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 pt-3 pb-6">
      <SectionHeading t="More News" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
        {tt.slice(29,39).filter(Boolean).map(x => (
          <div key={x._id} className="flex gap-4 py-4 items-center" style={{borderBottom:'1px solid '+B}}>
            <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
              <Img p={x} w={120} h={80} />
            </Link>
            <div className="min-w-0 flex-1">
              <Cat c={x.cat?.title} s="text-[10px]" />
              <Link href={`${BP}${x.slug}`} className="block text-[14px] font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C}}>{x.title}</Link>
              <span className="text-[10px] mt-0.5 block" style={{color:'rgba(3,25,52,0.5)'}}>{ago(x.publishDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ███████████████████████████████████████████████████████████████████████████████████████
       KATEGORI
       ███████████████████████████████████████████████████████████████████████████████████████ */}
    <section className="px-5 py-6" style={{borderTop:'1px solid #e5e7eb'}}>
      <h3 className="text-[14px] font-bold uppercase tracking-wide pb-3" style={{color:'rgba(3,25,52,0.5)'}}>Kategori</h3>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c._id} href={`${BP}?category=${c.slug}`}
            className="px-3 py-1.5 text-[12px] font-medium transition-colors hover:text-white" style={{background:'#f3f4f6',borderRadius:3,color:'rgba(3,25,52,0.7)'}}
          >{c.title}</Link>
        ))}
      </div>
    </section>

  </div>
  )
}