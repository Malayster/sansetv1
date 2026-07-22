import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...36]{
  _id,title,excerpt,publishDate,'img':metadata.image,'slug':metadata.slug.current,
  'cat':categories[0]->{title,color}
}`
const CQ = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`
const bp = `/${ROUTES.blog}/`
type P = any
const R = (c?: string) => c || '#C41E3A'
const A = (d?: string) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return Math.floor(diff / 60000) + ' minit lepas'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lepas'
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' hari lepas'
  return new Date(d).toLocaleDateString('ms')
}
function Img({ p, w, h, prio }: { p: P; w: number; h: number; prio?: boolean }) {
  return p.img ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full object-cover" style={{aspectRatio:`${w}/${h}`}} priority={prio} /> : <div className="bg-gray-100" style={{aspectRatio:`${w}/${h}`}} />
}
function Tag({ p, sz, lk }: { p: P; sz?: string; lk?: boolean }) {
  const s = sz || 'text-[10px]'
  const el = <span className={`${s} font-bold uppercase tracking-wide`} style={{color:R(p.cat?.color)}}>{p.cat?.title}</span>
  return lk !== false && p.cat ? <Link href={`${bp}?category=${p.cat.title}`}>{el}</Link> : p.cat ? el : null
}
function Head({ p, sz }: { p: P; sz?: string }) {
  return <Link href={`${bp}${p.slug}`}><h4 className={`font-serif font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3 ${sz||'text-[13px]'}`}>{p.title}</h4></Link>
}
function Tim({ p }: { p: P }) { const d = A(p.publishDate); if (!d) return null; return <p className="text-[10px] text-gray-400">{d}</p> }
function Sec({ t, h }: { t: string; h?: string }) { return h ? <Link href={h} className="font-serif text-[14px] font-bold text-[#C41E3A] hover:opacity-80">{t}</Link> : <h2 className="font-serif text-[14px] font-bold text-gray-800">{t}</h2> }
const Hr = () => <div className="border-t border-gray-200" />
const MKT = [{ n:'FBMKLCI',v:'1,583.42',c:'+2.18',p:'+0.14%',u:true },{ n:'KLSE Emas',v:'12,488.30',c:'+18.05',p:'+0.14%',u:true },{ n:'USD/MYR',v:'4.28',c:'+0.01',p:'+0.23%',u:true },{ n:'SGD/MYR',v:'3.18',c:'-0.005',p:'-0.16%',u:false },{ n:'Brent Crude',v:'$78.42',c:'-0.85',p:'-1.07%',u:false },{ n:'Emas 999.9',v:'RM 384.50',c:'+1.20',p:'+0.31%',u:true }]

export default async function Homepage() {
  const [posts, cats] = await Promise.all([client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }), client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } })])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const p = posts
  return <div className="max-w-[1180px] mx-auto px-4 md:px-0">
    {/* HERO 3-COL */}
    <section className="grid lg:grid-cols-[1fr_300px_300px] gap-5 py-3">
      <article><Link href={`${bp}${p[0].slug}`} className="block overflow-hidden mb-1.5"><Img p={p[0]} w={620} h={349} prio /></Link><Tag p={p[0]} sz="text-[11px]" /><Link href={`${bp}${p[0].slug}`}><h1 className="font-serif text-[22px] md:text-[26px] font-bold leading-tight text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3 mt-0.5">{p[0].title}</h1></Link>{p[0].excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{p[0].excerpt}</p>}<Tim p={p[0]} /></article>
      <div className="flex flex-col gap-2.5">{p.slice(1,5).map(a => (<article key={a._id}><Link href={`${bp}${a.slug}`} className="block overflow-hidden"><Img p={a} w={294} h={165} /></Link><Tag p={a} lk={false} /><Head p={a} sz="text-[13px]" /><Tim p={a} /></article>))}</div>
      <div><div className="flex items-center gap-1 mb-1.5"><svg width="12" height="12" viewBox="0 0 13 13" className="text-[#C41E3A]"><path fill="currentColor" d="M6.5 0a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/><path fill="currentColor" d="M7 3H6v4h4v-.976L7 6z"/></svg><Sec t="Tajuk Utama Terkini" h={bp} /></div>{p.slice(5,19).map((a,i) => (<div key={a._id} className="flex items-start gap-2 py-[5px] border-b border-gray-100"><span className="text-[11px] font-bold text-gray-400 w-4">{i+1}</span><div className="min-w-0"><Link href={`${bp}${a.slug}`} className="text-[11px] text-gray-800 leading-snug line-clamp-2 hover:text-[#C41E3A] transition-colors">{a.title}</Link><Tim p={a} /></div></div>))}</div>
    </section>
    <Hr />
    {/* EDITOR'S PICKS [LEFT | LatestHeadlines RIGHT] */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 py-2">
      <div><Sec t="Pilihan Editor" h={bp} /><article className="flex flex-col sm:flex-row gap-3 mt-1 mb-2"><div className="sm:w-[304px] shrink-0"><Link href={`${bp}${p[5].slug}`} className="block overflow-hidden"><Img p={p[5]} w={304} h={171} /></Link></div><div><Tag p={p[5]} sz="text-[11px]" /><Link href={`${bp}${p[5].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors">{p[5].title}</h3></Link>{p[5].excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{p[5].excerpt}</p>}<Tim p={p[5]} /></div></article><div className="grid md:grid-cols-3 gap-3">{p.slice(6,9).map(a => (<article key={a._id}><Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1"><Img p={a} w={293} h={165} /></Link><Tag p={a} lk={false} /><Head p={a} /><Tim p={a} /></article>))}</div></div>
      <aside><h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 pb-1 border-b-2 border-[#C41E3A] inline-block">Tajuk Utama Terkini</h3>{p.slice(9,18).map(a => (<div key={a._id} className="py-[6px] border-b border-gray-100"><Tag p={a} sz="text-[9px]" /><Link href={`${bp}${a.slug}`} className="text-[11px] text-gray-800 leading-snug line-clamp-2 hover:text-[#C41E3A] transition-colors block">{a.title}</Link><Tim p={a} /></div>))}</aside>
    </div>
    <Hr />
    {/* LATEST BUSINESS [LEFT | Ad RIGHT] */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 py-2">
      <div><Sec t="Berita Bisnes Terkini" h={bp} /><article className="flex flex-col sm:flex-row gap-3 mt-1 mb-2"><div className="sm:w-[304px] shrink-0"><Link href={`${bp}${p[9].slug}`} className="block overflow-hidden"><Img p={p[9]} w={304} h={171} /></Link></div><div><Tag p={p[9]} sz="text-[11px]" /><Link href={`${bp}${p[9].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors">{p[9].title}</h3></Link>{p[9].excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{p[9].excerpt}</p>}<Tim p={p[9]} /></div></article><div className="grid md:grid-cols-3 gap-3">{p.slice(10,13).map(a => (<article key={a._id}><Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1"><Img p={a} w={293} h={165} /></Link><Tag p={a} lk={false} /><Head p={a} /><Tim p={a} /></article>))}</div></div>
      <aside><div className="bg-gray-100 border border-gray-200 h-[250px] flex items-center justify-center"><span className="text-[10px] text-gray-400 uppercase tracking-widest">Iklan</span></div></aside>
    </div>
    <Hr />
    {/* #teknologiAsia BANNER */}
    <section className="bg-[#13334f] text-white py-3 px-4 -mx-4 md:mx-0"><div className="flex items-center justify-between"><div><span className="text-[20px] font-bold">#teknologiAsia</span><p className="text-[11px] text-white/60 mt-0.5">Dekod transformasi teknologi Asia</p></div><Link href={`${bp}?category=Teknologi`} className="text-[10px] font-bold uppercase text-[#F5C842] hover:underline">Terokai ›</Link></div></section>
    <Hr />
    {/* SPOTLIGHT [LEFT | Ad RIGHT] */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 py-2">
      <div><div className="flex items-center gap-2 mb-1.5"><span className="bg-[#C41E3A] px-2 py-0.5 text-[10px] text-white uppercase font-bold">Sorotan</span><Sec t="Konflik Global" /></div><article className="flex flex-col sm:flex-row gap-3 mb-2"><div className="sm:w-[304px] shrink-0"><Link href={`${bp}${p[14].slug}`} className="block overflow-hidden"><Img p={p[14]} w={304} h={171} /></Link></div><div><Link href={`${bp}${p[14].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors">{p[14].title}</h3></Link><p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{p[14].excerpt}</p><Tim p={p[14]} /></div></article><div className="grid md:grid-cols-3 gap-3">{p.slice(15,18).map(a => (<article key={a._id}><Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1"><Img p={a} w={293} h={165} /></Link><Link href={`${bp}${a.slug}`} className="text-[12px] text-gray-800 leading-snug line-clamp-2 hover:text-[#C41E3A] transition-colors">{a.title}</Link><Tim p={a} /></article>))}</div></div>
      <aside><div className="bg-gray-100 border border-gray-200 h-[250px] flex items-center justify-center"><span className="text-[10px] text-gray-400 uppercase tracking-widest">Iklan</span></div></aside>
    </div>
    <Hr />
    {/* DATAWATCH BANNER */}
    <section className="bg-[#13334f] text-white py-3 px-4 -mx-4 md:mx-0"><div className="flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase text-white/60">Datawatch</span><h2 className="font-serif text-[14px] font-bold mt-0.5">Analisis mendalam</h2></div><Link href={bp} className="text-[10px] font-bold uppercase text-[#F5C842] hover:underline">Terokai ›</Link></div></section>
    <Hr />
    {/* OPINION [LEFT | MostRead RIGHT] */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 py-2">
      <div><Sec t="Opini" h={bp} /><article className="mb-2 mt-1"><Link href={`${bp}${p[18].slug}`} className="block overflow-hidden mb-1.5"><Img p={p[18]} w={512} h={288} /></Link><span className="text-[10px] font-bold uppercase text-gray-400">Opini</span><Link href={`${bp}${p[18].slug}`}><h3 className="font-serif text-[18px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors">{p[18].title}</h3></Link>{p[18].excerpt && <p className="text-[12px] text-gray-500 mt-1">{p[18].excerpt}</p>}</article><div className="divide-y divide-gray-100">{p.slice(19,22).map(a => (<article key={a._id} className="flex gap-3 py-2 first:pt-0 group"><div className="min-w-0"><Tag p={a} sz="text-[10px]" /><Link href={`${bp}${a.slug}`}><h4 className="font-serif font-bold leading-snug text-[13px] text-[#111] hover:text-[#C41E3A] transition-colors">{a.title}</h4></Link></div></article>))}</div></div>
      <aside><h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 pb-1 border-b-2 border-[#C41E3A] inline-block">Paling Baca</h3>{p.slice(6,12).map((a,i) => (<div key={a._id} className="flex items-start gap-2 py-[6px] border-b border-gray-100 last:border-b-0"><span className="font-serif text-[28px] font-bold text-[#C41E3A]/20 leading-none">{i+1}</span><div className="min-w-0"><Tag p={a} sz="text-[9px]" /><Link href={`${bp}${a.slug}`} className="text-[13px] leading-snug font-serif text-gray-800 hover:text-[#C41E3A] transition-colors line-clamp-2">{a.title}</Link></div></div>))}</aside>
    </div>
    <Hr />
    {/* INFOGRAPHICS BANNER */}
    <section className="bg-[#13334f] text-white py-3 px-4 -mx-4 md:mx-0"><div className="flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase text-white/60">INFOGRAFIK</span><h2 className="font-serif text-[14px] font-bold mt-0.5">Analisis sepintas lalu</h2></div><Link href={bp} className="text-[10px] font-bold uppercase text-[#F5C842] hover:underline">Terokai ›</Link></div></section>
    <Hr />
    {/* LIFE & ARTS [LEFT | MarketData RIGHT] */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 py-2">
      <div><Sec t="Gaya Hidup & Seni" h={bp} /><article className="flex flex-col sm:flex-row gap-3 mt-1 mb-2"><div className="sm:w-[304px] shrink-0"><Link href={`${bp}${p[22].slug}`} className="block overflow-hidden"><Img p={p[22]} w={304} h={171} /></Link></div><div><Tag p={p[22]} sz="text-[11px]" /><Link href={`${bp}${p[22].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors">{p[22].title}</h3></Link>{p[22].excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{p[22].excerpt}</p>}<Tim p={p[22]} /></div></article><div className="grid md:grid-cols-3 gap-3">{p.slice(23,26).map(a => (<article key={a._id}><Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1"><Img p={a} w={293} h={165} /></Link><Tag p={a} lk={false} /><Head p={a} /><Tim p={a} /></article>))}</div></div>
      <aside><h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 pb-1 border-b-2 border-[#C41E3A] inline-block">Data Pasaran</h3><div className="divide-y divide-gray-100 border border-gray-200">{MKT.map(m => (<div key={m.n} className="flex items-center justify-between py-1.5 px-2"><span className="text-[11px] text-gray-700">{m.n}</span><div className="text-right"><div className="text-[11px] font-semibold text-gray-900">{m.v}</div><div className={`text-[10px] font-medium ${m.u?'text-emerald-700':'text-red-600'}`}>{m.c} ({m.p})</div></div></div>))}</div><p className="text-[9px] text-gray-400 mt-1">* Data tertangguh 15 minit</p></aside>
    </div>
    <Hr />
    {/* TRENDING TOPICS full-width 4-col */}
    <section><h2 className="font-serif text-[14px] font-bold text-gray-800 mb-1.5">Topik Trending</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{cats.slice(0,8).map(c => { const arts = posts.filter(a => a.cat?.title === c.title).slice(0,4); if (!arts.length) return null; return <div key={c._id}>{arts[0]?.img && <Link href={`${bp}${arts[0].slug}`} className="block overflow-hidden mb-1"><Img p={arts[0]} w={293} h={165} /></Link>}<Link href={`${bp}?category=${c.slug}`} className="font-serif text-[14px] font-bold text-[#111] hover:text-[#C41E3A] transition-colors">{c.title}</Link><div className="mt-1 divide-y divide-gray-100">{arts.slice(0,4).map(a => (<Link key={a._id} href={`${bp}${a.slug}`} className="block py-1 text-[11px] text-gray-600 hover:text-[#C41E3A] transition-colors leading-snug">{a.title}</Link>))}</div></div> })}</div></section>
    <Hr />
    {/* NEWS BY LOCATION full-width 4-col */}
    <section><h2 className="font-serif text-[14px] font-bold text-gray-800 mb-1.5">Berita Mengikut Negeri</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{['Johor','Kedah','Kelantan','Melaka','N.Sembilan','Pahang','P.Pinang','Perak','Perlis','Sabah','Sarawak','Selangor','Terengganu'].map(state => { const arts = posts.filter(a => a.cat?.title === state || a.title?.toLowerCase().includes(state.toLowerCase())).slice(0,2); return <div key={state} className="border border-gray-200 p-2.5"><Link href={`${bp}?location=${state.toLowerCase()}`} className="font-serif text-[13px] font-bold text-[#111] hover:text-[#C41E3A] transition-colors">{state}</Link>{arts.length > 0 ? <div className="mt-1 divide-y divide-gray-100">{arts.map(a => <Link key={a._id} href={`${bp}${a.slug}`} className="block py-1 text-[11px] text-gray-600 hover:text-[#C41E3A] transition-colors leading-snug">{a.title}</Link>)}</div> : <p className="text-[10px] text-gray-400 italic mt-1">Tiada berita</p>}</div> })}</div></section>
    <Hr />
    {/* SPONSORED CONTENT */}
    <section><div className="bg-gray-50 border border-gray-200 px-3 py-1.5 mb-2 flex items-center justify-between"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Kandungan Tajaan</span><span className="text-[9px] text-gray-400">Tentang Kandungan Tajaan</span></div><div className="grid md:grid-cols-3 gap-4">{p.slice(26,29).map(a => (<article key={a._id}><Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1"><Img p={a} w={380} h={214} /></Link><Tag p={a} sz="text-[10px]" /><Head p={a} sz="text-[13px]" /><Link href={`${bp}${a.slug}`} className="text-[10px] text-[#C41E3A] font-bold hover:underline mt-0.5 inline-block">Terokai lebih lanjut →</Link></article>))}</div></section>
    <Hr />
    {/* CTA */}
    <section className="py-3 text-center"><h2 className="font-serif text-[15px] font-bold text-[#111] mb-1">Suara Rakyat, Disampaikan Tanpa Tapisan</h2><p className="text-[11px] text-gray-500 mb-2 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p><div className="flex items-center justify-center gap-2"><Link href={bp} className="px-4 py-1.5 text-[11px] font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link><Link href="/hubungi" className="px-4 py-1.5 text-[11px] font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link></div></section>
  </div>
}