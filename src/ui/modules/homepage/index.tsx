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
const H = '#09365e'
const T = 'rgba(3,25,52,0.5)'
type P = any

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

/* ── Foxiz exact components ── */

/** Category pill — absolute overlay on images */
function CatO({ c, s }: { c?: string; s?: string }) {
  return c ? <span className="absolute bottom-3 left-3 z-10 px-2 py-1 leading-none text-white font-semibold uppercase tracking-wide" style={{background:G,fontSize: s ? Number(s) : 11}}>{c}</span> : null
}
/** Category — inline red text */
function CatI({ c, s }: { c?: string; s?: string }) {
  return c ? <span className="font-semibold uppercase tracking-wide" style={{color:G,fontSize: s ? Number(s) : 12}}>{c}</span> : null
}
/** Section heading with skewed red bar + border-bottom — exact Foxiz */
function SectionHeader({ t }: { t: string }) {
  const s = {display:'inline-block',width:15,height:14,transform:'skewX(-15deg)',borderRight:'4px solid '+G,borderLeft:'7px solid '+G}
  return (
    <div className="flex items-center gap-3 mb-4 pb-[5px]" style={{borderBottom:'1px solid rgba(136,136,136,0.15)'}}>
      <span style={s} />
      <h2 className="text-[18px] sm:text-[21px] font-bold leading-[1.4]" style={{fontFamily:'"Inter Tight",sans-serif',color:H}}>{t}</h2>
    </div>
  )
}
/** Standard article card — 360×220 */
function ACard({ p: x }: { p: P }) {
  return (
    <article>
      <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'360/220'}}>
        <Img p={x} w={360} h={220} /><CatO c={x.cat?.title} />
      </Link>
      <CatI c={x.cat?.title} />
      <Link href={`${BP}${x.slug}`} className="block font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C,fontSize:13,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
      <span className="text-[11px] mt-0.5 block" style={{color:T,fontFamily:'"Roboto Condensed",sans-serif'}}>{ago(x.publishDate)}</span>
    </article>
  )
}
/** Small card — 300×200 */
function SCard({ p: x }: { p: P }) {
  return (
    <article>
      <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'300/200'}}>
        <Img p={x} w={300} h={200} /><CatO c={x.cat?.title} s={10} />
      </Link>
      <Link href={`${BP}${x.slug}`} className="block font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C,fontSize:12,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
    </article>
  )
}

export default async function Homepage() {
  const [all, cats] = await Promise.all([
    client.fetch<P[]>(POSTS_Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CATS_Q, {}, { next: { revalidate: 300 } }),
  ])
  if (!all.length) return <div className="mx-auto px-4 py-16 text-center" style={{maxWidth:1300,color:C}}>Tiada Berita</div>
  const [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,...tt] = all
  const TAGS = ['Opinion','Economic','Featured','Global Affairs','Climate Change','Renewable Energy','Politics','Research']

  return <>
  <style>{`header,nav:first-of-type,footer{display:none!important}main{min-height:0!important;padding:0!important;margin:0!important;max-width:100%!important}`}</style>
  <div className="mx-auto" style={{maxWidth:1340,color:C,fontSize:17,fontFamily:'"Roboto Condensed",Arial,Helvetica,sans-serif'}}>

    {/* ─────── DARK NAV top bar ─────── */}
    <div className="flex items-center justify-between px-5 py-[11px]" style={{background:'#031934',color:'#fff'}}>
      <div className="flex items-center gap-8">
        <span className="text-[22px] font-black tracking-tight" style={{fontFamily:'"Inter Tight",sans-serif'}}>Suara<span style={{color:G}}>Anak</span>Negeri</span>
        <div className="hidden lg:flex items-center gap-0 font-bold" style={{fontSize:17,fontFamily:'"Inter Tight",sans-serif'}}>
          {['Home','Read History','Economy','Global Security','Pages','Blog'].map((t,i) => (
            <Link key={t} href={i===0?'/':'#'} className="px-[13px] py-1 hover:opacity-70 transition-opacity">{t}</Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <div className="px-3 py-[5px]" style={{background:G,borderRadius:3}}>
          <Link href="#" className="text-[12px] font-bold uppercase tracking-wide">Newsletter</Link>
        </div>
      </div>
    </div>

    {/* ─────── SECONDARY NAV (Home Read History Economy Travel Global Security ...) ─────── */}
    <div className="hidden lg:flex items-center gap-0 px-5 font-bold" style={{background:'#031934',color:'rgba(255,255,255,0.7)',fontSize:16,fontFamily:'"Inter Tight",sans-serif',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
      {['Home','Read History','Economy','Travel','Global Security','Global Affairs','World','Technology','Login','Blog','Contact'].map((t,i) => (
        <Link key={t} href={i===0?'/':'#'} className="px-[12px] py-[7px] hover:text-white transition-opacity">{t}</Link>
      ))}
      <div className="ml-auto flex items-center gap-2 px-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>
    </div>

    {/* ─────── TRENDING BAR ─────── */}
    <div className="flex items-center gap-0 overflow-x-auto font-semibold text-white uppercase tracking-wide" style={{background:G,fontSize:12,fontFamily:'"Roboto Condensed",sans-serif'}}>
      <span className="shrink-0 flex items-center gap-1.5 px-4 py-[9px]">🔥 <span className="font-bold">Trending</span></span>
      {TAGS.map(t => (
        <Link key={t} href="#" className="shrink-0 px-3 py-[9px] hover:opacity-70 transition-opacity" style={{borderRight:'1px solid rgba(255,255,255,0.2)'}}>{t}</Link>
      ))}
    </div>

    {/* ─────── HERO SECTION ─────── */}
    <div className="flex flex-col lg:flex-row gap-8 px-5 pt-[30px] pb-5">
      {/* LEFT */}
      <div className="lg:w-[73%]">
        {/* Feature big + list row */}
        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          {/* Feature */}
          <div className="lg:w-[55%]">
            <article>
              <Link href={`${BP}${p1.slug}`} className="block relative overflow-hidden mb-3" style={{aspectRatio:'860/573'}}>
                <Img p={p1} w={860} h={573} /><CatO c={p1.cat?.title} />
              </Link>
              <CatI c={p1.cat?.title} />
              <Link href={`${BP}${p1.slug}`}>
                <h1 className="font-black leading-[1.125] mt-1 hover:opacity-70 transition-opacity" style={{color:H,fontSize:26,fontFamily:'"Inter Tight",sans-serif'}}>{p1.title}</h1>
              </Link>
              <span className="text-[13px] mt-2 block" style={{color:T,fontFamily:'"Roboto Condensed",sans-serif'}}>{ago(p1.publishDate)}</span>
            </article>
          </div>
          {/* List 2 articles */}
          <div className="lg:w-[45%] space-y-4">
            {[p2,p3].filter(Boolean).map((x,i) => (
              <div key={x._id} className="flex gap-4 items-start pb-4" style={{borderBottom:i<1?'1px solid rgba(136,136,136,0.13)':'none'}}>
                <Link href={`${BP}${x.slug}`} className="shrink-0 w-[130px] overflow-hidden" style={{aspectRatio:'130/86'}}>
                  <Img p={x} w={130} h={86} />
                </Link>
                <div className="min-w-0 flex-1">
                  <CatI c={x.cat?.title} />
                  <Link href={`${BP}${x.slug}`} className="block font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-3" style={{color:C,fontSize:14,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
                  <span className="text-[13px] mt-0.5 block" style={{color:T}}>{ago(x.publishDate)}</span>
                </div>
              </div>
            ))}
            {p4 && (
              <Link href={`${BP}${p4.slug}`} className="flex gap-4 items-start">
                <div className="shrink-0 w-[130px] overflow-hidden" style={{aspectRatio:'130/86'}}>
                  <Img p={p4} w={130} h={86} />
                </div>
                <div className="min-w-0 flex-1">
                  <CatI c={p4.cat?.title} />
                  <span className="block font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-3" style={{color:C,fontSize:14,fontFamily:'"Inter Tight",sans-serif'}}>{p4.title}</span>
                  <span className="text-[13px] mt-0.5 block" style={{color:T}}>{ago(p4.publishDate)}</span>
                </div>
              </Link>
            )}
          </div>
        </div>
        {/* 4 articles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[p5,p6,p7,p8].filter(Boolean).map(x => (
            <article key={x._id}>
              <Link href={`${BP}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'330/220'}}>
                <Img p={x} w={330} h={220} /><CatO c={x.cat?.title} s={10} />
              </Link>
              <CatI c={x.cat?.title} s={11} />
              <Link href={`${BP}${x.slug}`} className="block font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C,fontSize:13,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
              <span className="text-[12px] mt-0.5 block" style={{color:T}}>{ago(x.publishDate)}</span>
            </article>
          ))}
        </div>
      </div>
      {/* RIGHT — Most Read */}
      <aside className="lg:w-[27%]" style={{borderLeft:'1px solid rgba(136,136,136,0.13)',paddingLeft:20}}>
        <div className="flex items-center gap-2 mb-4">
          <span style={{display:'inline-block',width:15,height:14,transform:'skewX(-15deg)',borderRight:'4px solid '+G,borderLeft:'7px solid '+G}} />
          <h3 className="text-[20px] font-bold leading-[1.4]" style={{fontFamily:'"Inter Tight",sans-serif',color:H}}>Most Read</h3>
        </div>
        {[p9,p10,p11,p12,p13,p14].filter(Boolean).map((x,i) => (
          <div key={x._id} className="flex items-start gap-3 py-3" style={{borderBottom:'1px solid rgba(136,136,136,0.13)'}}>
            <span className="shrink-0 w-[26px] h-[26px] flex items-center justify-center text-[12px] font-bold text-white leading-none" style={{background:G,borderRadius:3}}>{i+1}</span>
            <div className="min-w-0 flex-1">
              <Link href={`${BP}${x.slug}`} className="text-[12px] font-bold leading-snug hover:opacity-70 transition-opacity line-clamp-2 block" style={{color:C,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
            </div>
          </div>
        ))}
        <div className="mt-6 text-center">
          <div className="text-[11px] mb-2" style={{color:T}}>- Advertisement -</div>
          <div className="w-full" style={{aspectRatio:'300/250'}}>
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[11px]" style={{color:T}}>Ad</div>
          </div>
        </div>
      </aside>
    </div>

    {/* ─────── NEWSLETTER ─────── */}
    <div className="mx-5 mb-6 flex items-center gap-5 p-4 border" style={{borderLeft:'10px solid '+G,borderColor:'rgba(136,136,136,0.2)',borderRadius:5}}>
      <p className="flex-1 text-[15px] leading-relaxed" style={{color:T}}>Subscribe to our newsletter for real-time updates on new articles, tips, and exclusive insights.</p>
      <div className="flex gap-2 shrink-0">
        <input type="email" placeholder="Your email address" className="px-4 py-[9px] text-[14px] border border-gray-300 outline-none w-[180px]" style={{fontFamily:'"Roboto Condensed",sans-serif'}} />
        <button className="px-5 py-[9px] text-[14px] font-bold text-white" style={{background:G,borderRadius:3,fontFamily:'"Inter Tight",sans-serif'}}>Subscribe</button>
      </div>
    </div>

    {/* ─────── FEATURED STORIES ─────── */}
    <section className="px-5 pt-1 pb-5">
      <SectionHeader t="Featured Stories" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[p15,...tt.slice(0,3)].filter(Boolean).map(x => <ACard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ─────── 6-COL GRID ─────── */}
    <section className="px-5 pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tt.slice(3,9).filter(Boolean).map(x => <SCard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ─────── QUICK LINKS ─────── */}
    <div className="mx-5 py-[10px] flex flex-wrap items-center gap-1.5" style={{borderTop:'1px solid rgba(136,136,136,0.13)'}}>
      <span className="font-bold mr-2" style={{color:T,fontSize:13}}>Quick Links:</span>
      {TAGS.map(t => (
        <Link key={t} href="#" className="px-3 py-[6px] text-[13px] font-medium transition-colors hover:text-white" style={{background:'#f3f4f6',borderRadius:3,color:C}}>{t}</Link>
      ))}
    </div>

    {/* ─────── JUST IN ─────── */}
    <section className="mx-5 my-6 p-5" style={{border:'1px solid rgba(136,136,136,0.13)',borderRadius:10}}>
      <SectionHeader t="Just In" />
      {/* 1 featured */}
      <div className="flex gap-5 items-center pb-5 mb-5" style={{borderBottom:'1px solid rgba(136,136,136,0.13)'}}>
        <Link href={`${BP}${tt[9]?.slug||'#'}`} className="shrink-0 w-[220px] overflow-hidden" style={{aspectRatio:'220/146'}}>
          <Img p={tt[9]||p1} w={220} h={146} />
        </Link>
        <div className="min-w-0 flex-1">
          <CatI c={tt[9]?.cat?.title} />
          <Link href={`${BP}${tt[9]?.slug||'#'}`} className="block font-bold leading-snug mt-1 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C,fontSize:16,fontFamily:'"Inter Tight",sans-serif'}}>{tt[9]?.title||'Berita'}</Link>
          <span className="text-[12px] mt-1 block" style={{color:T}}>{tt[9]?.publishDate?ago(tt[9].publishDate):''}</span>
        </div>
      </div>
      {/* divider */}
      <div className="mb-4" style={{height:7,background:'repeating-linear-gradient(90deg,rgba(136,136,136,0.25) 0,rgba(136,136,136,0.25) 1px,transparent 1px,transparent 8px)'}} />
      {/* 3 overlay */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tt.slice(10,13).filter(Boolean).map(x => (
          <Link key={x._id} href={`${BP}${x.slug}`} className="relative block overflow-hidden" style={{aspectRatio:'420/280'}}>
            <Img p={x} w={420} h={280} />
            <div className="absolute inset-0 flex items-end p-4" style={{background:'linear-gradient(to top,rgba(3,25,52,0.95) 0%,rgba(3,25,52,0.6) 50%,transparent 100%)'}}>
              <h3 className="text-white font-bold leading-snug line-clamp-2" style={{fontSize:14,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* ─────── BUSINESS ─────── */}
    <section className="px-5 pb-4">
      <SectionHeader t="Business" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tt.slice(13,17).filter(Boolean).map(x => (
          <div key={x._id} className="flex gap-4 items-start pb-4" style={{borderBottom:'1px solid rgba(136,136,136,0.13)'}}>
            <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
              <Img p={x} w={120} h={80} />
            </Link>
            <div className="min-w-0 flex-1">
              <CatI c={x.cat?.title} />
              <Link href={`${BP}${x.slug}`} className="block font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C,fontSize:14,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
              <span className="text-[12px] mt-0.5 block" style={{color:T}}>{ago(x.publishDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
    <div className="mx-5 mb-3" style={{height:7,background:'repeating-linear-gradient(90deg,rgba(136,136,136,0.25) 0,rgba(136,136,136,0.25) 1px,transparent 1px,transparent 8px)'}} />

    {/* ─────── CIRCULAR ARTICLES ─────── */}
    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tt.slice(17,20).filter(Boolean).map(x => (
        <div key={x._id} className="flex items-center gap-3">
          <Link href={`${BP}${x.slug}`} className="shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-gray-100">
            <Img p={x} w={60} h={60} />
          </Link>
          <div className="min-w-0">
            <Link href={`${BP}${x.slug}`} className="block font-bold leading-snug hover:opacity-70 transition-opacity line-clamp-2" style={{color:C,fontSize:12,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
            <CatI c={x.cat?.title} />
          </div>
        </div>
      ))}
    </div>

    {/* ─────── AD 1 ─────── */}
    <div className="px-5 py-3 text-center">
      <div className="text-[11px] mb-2" style={{color:T}}>- Advertisement -</div>
      <div className="mx-auto" style={{maxWidth:728,aspectRatio:'728/90'}}>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[11px]" style={{color:T}}>Ad Banner</div>
      </div>
    </div>

    {/* ─────── WHAT TO READ ─────── */}
    <section className="px-5 pt-2 pb-4">
      <SectionHeader t="What to Read" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 relative overflow-hidden" style={{border:'1px solid rgba(136,136,136,0.13)'}}>
          <Link href={`${BP}${tt[20]?.slug||'#'}`} className="block relative" style={{aspectRatio:'860/573'}}>
            <Img p={tt[20]||p1} w={860} h={573} />
            <div className="absolute inset-0 flex items-end p-5" style={{background:'linear-gradient(to top,rgba(3,25,52,0.95) 0%,rgba(3,25,52,0.6) 50%,transparent 100%)'}}>
              <div>
                <span className="px-3 py-1 text-[11px] font-bold uppercase text-white" style={{background:'rgba(0,0,0,0.3)'}}>{tt[20]?.cat?.title||'Berita'}</span>
                <h3 className="text-white font-bold leading-snug mt-2 line-clamp-2" style={{fontSize:17,fontFamily:'"Inter Tight",sans-serif'}}>{tt[20]?.title||'Berita'}</h3>
              </div>
            </div>
          </Link>
        </div>
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          {tt.slice(21,25).filter(Boolean).map(x => <ACard key={x._id} p={x} />)}
        </div>
      </div>
    </section>

    {/* ─────── AD 2 ─────── */}
    <div className="px-5 py-2 text-center">
      <div className="text-[11px] mb-2" style={{color:T}}>- Advertisement -</div>
      <div className="mx-auto" style={{maxWidth:728,aspectRatio:'728/90'}}>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[11px]" style={{color:T}}>Ad Banner</div>
      </div>
    </div>

    {/* ─────── THE LATEST ─────── */}
    <section className="px-5 pt-3 pb-4">
      <SectionHeader t="The Latest" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tt.slice(25,30).filter(Boolean).map(x => <ACard key={x._id} p={x} />)}
      </div>
    </section>

    {/* ─────── CTA ─────── */}
    <section className="mx-5 my-6 flex items-center justify-between p-8 sm:p-10 text-white" style={{background:'linear-gradient(135deg,#0f1a2e,#1a2a44)',borderRadius:10,minHeight:180}}>
      <div className="max-w-[700px]">
        <h2 className="font-black leading-tight" style={{fontSize:28,fontFamily:'"Inter Tight",sans-serif'}}>Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
        <p className="text-[15px] mt-2 italic max-w-[500px]" style={{color:'rgba(255,255,255,0.8)',fontFamily:'"Roboto Condensed",sans-serif'}}>Ikuti berita terkini, analisis mendalam, dan laporan eksklusif.</p>
      </div>
      <Link href={BP} className="shrink-0 px-8 py-3 text-[14px] font-bold text-white" style={{background:G,borderRadius:'5px 20px 5px 5px',fontFamily:'"Inter Tight",sans-serif'}}>Baca Berita &rarr;</Link>
    </section>

    {/* ─────── MORE NEWS ─────── */}
    <section className="px-5 pb-6">
      <SectionHeader t="More News" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
        {tt.slice(30,40).filter(Boolean).map(x => (
          <div key={x._id} className="flex gap-4 py-4 items-center" style={{borderBottom:'1px solid rgba(136,136,136,0.13)'}}>
            <Link href={`${BP}${x.slug}`} className="shrink-0 w-[120px] overflow-hidden" style={{aspectRatio:'120/80'}}>
              <Img p={x} w={120} h={80} />
            </Link>
            <div className="min-w-0 flex-1">
              <CatI c={x.cat?.title} />
              <Link href={`${BP}${x.slug}`} className="block font-bold leading-snug mt-0.5 hover:opacity-70 transition-opacity line-clamp-2" style={{color:C,fontSize:14,fontFamily:'"Inter Tight",sans-serif'}}>{x.title}</Link>
              <span className="text-[12px] mt-0.5 block" style={{color:T}}>{ago(x.publishDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ─────── KATEGORI ─────── */}
    <section className="px-5 py-6" style={{borderTop:'1px solid #e5e7eb'}}>
      <h3 className="text-[13px] font-bold uppercase tracking-wide pb-3" style={{color:T}}>Kategori</h3>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c._id} href={`${BP}?category=${c.slug}`}
            className="px-3 py-[6px] text-[13px] font-medium transition-colors hover:text-white" style={{background:'#f3f4f6',borderRadius:3,color:C}}
          >{c.title}</Link>
        ))}
      </div>
    </section>

  </div>
  </>
}