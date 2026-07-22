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
const PQ = groq`*[_type=='blog.post' && status in ['published','approved'] && 'Podcast' in categories[]->title]|order(publishDate desc)[0]{
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
function Sec({ t, h }: { t: string; h?: string }) { return h ? <Link href={h} className="bg-[#C41E3A] text-white px-4 py-2 font-serif text-[22px] font-bold tracking-wide hover:bg-[#A01830] transition-colors inline-block">{t}</Link> : <h2 className="bg-[#C41E3A] text-white px-4 py-2 font-serif text-[22px] font-bold tracking-wide inline-block">{t}</h2> }
const Hr = () => <div className="border-t border-gray-200" />
const MKT = [{ n:'FBMKLCI',v:'1,583.42',c:'+2.18',p:'+0.14%',u:true },{ n:'KLSE Emas',v:'12,488.30',c:'+18.05',p:'+0.14%',u:true },{ n:'USD/MYR',v:'4.28',c:'+0.01',p:'+0.23%',u:true },{ n:'SGD/MYR',v:'3.18',c:'-0.005',p:'-0.16%',u:false },{ n:'Brent Crude',v:'$78.42',c:'-0.85',p:'-1.07%',u:false },{ n:'Emas 999.9',v:'RM 384.50',c:'+1.20',p:'+0.31%',u:true }]

export default async function Homepage() {
  const [posts, cats, pod] = await Promise.all([client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }), client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }), client.fetch<P|null>(PQ, {}, { next: { revalidate: 300 } })])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const p = posts
  return <div className="max-w-[1180px] mx-auto px-0">

    {/* ═══════ HERO 3-COL ═══════ */}
    <section className="grid lg:grid-cols-[1fr_300px_300px] gap-5 py-3">
      <div className="p-0 flex flex-col">
        <article>
          <Link href={`${bp}${p[0].slug}`} className="block overflow-hidden mb-1"><Img p={p[0]} w={620} h={349} prio /></Link>
          <Tag p={p[0]} sz="text-[11px]" />
          <Link href={`${bp}${p[0].slug}`}><h1 className="font-serif text-[22px] md:text-[26px] font-bold leading-tight text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3 mt-0.5">{p[0].title}</h1></Link>
          {p[0].excerpt && <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{p[0].excerpt}</p>}
          <Tim p={p[0]} />
        </article>
        {/* 2 articles below main headline */}
        <div className="grid grid-cols-2 gap-0 mt-2 pt-2 border-t border-gray-100">
          {p.slice(1,3).map(a => (
            <article key={a._id}>
              <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1"><Img p={a} w={294} h={165} /></Link>
              <Tag p={a} lk={false} /><Head p={a} sz="text-[13px]" /><Tim p={a} />
            </article>
          ))}
        </div>
      </div>
      {/* COL 2 — 2 thumbnails */}
      <div className="flex flex-col gap-5">
        {p.slice(3,5).map(a => (
          <article key={a._id} className="p-0">
            <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1"><Img p={a} w={294} h={260} /></Link>
            <Tag p={a} lk={false} /><Head p={a} sz="text-[13px]" /><Tim p={a} />
          </article>
        ))}
      </div>
      <div className="p-2">
        <div className="mb-2 bg-[#C41E3A] p-4 text-center">
          <span className="font-bold text-[20px] text-white"><span className="text-[#F5C842]">#PILIHAN</span>RAYA</span>
          <p className="text-[10px] text-white/80 mt-1">Liputan eksklusif pilihan raya di Malaysia</p>
          <Link href={`${bp}?category=PilihanRaya`} className="text-[10px] font-bold text-[#F5C842] hover:underline">Ikuti ›</Link>
        </div>
        <div className="flex items-center gap-1 mb-1"><Sec t="BERITA TERKINI" h={bp} /></div>
        {p.slice(5,15).map((a,i) => (
          <div key={a._id} className="flex items-start gap-0 py-[3px] border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 w-4">{i+1}</span>
            <div className="min-w-0"><Link href={`${bp}${a.slug}`} className="text-[11px] text-gray-800 leading-snug line-clamp-0 hover:text-[#C41E3A] transition-colors">{a.title}</Link><Tim p={a} /></div>
          </div>
        ))}
        {pod && <div className="mt-2 bg-black text-white p-3 flex gap-2 items-center">
          {pod.img && <Link href={`${bp}${pod.slug}`} className="shrink-0"><Img p={pod} w={80} h={80} /></Link>}
          <div className="min-w-0">
            <span className="text-[8px] font-bold uppercase text-[#F5C842]">Podcast</span>
            <Link href={`${bp}${pod.slug}`} className="text-[10px] leading-snug text-white hover:text-[#F5C842] transition-colors line-clamp-2 block mt-0.5">{pod.title}</Link>
          </div>
        </div>}
      </div>
    </section>

    {/* ═══════ EDITOR'S PICKS + BISNES ═══════ */}
    <div className="flex flex-col gap-2">
      <div>
        <Sec t="Pilihan Editor" h={bp} />
          <div className="grid md:grid-cols-4 gap-1 mt-1">
            {p.slice(5,9).map(a => (
              <article key={a._id} className="p-0">
                <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-0.5"><Img p={a} w={293} h={165} /></Link>
                <Tag p={a} lk={false} /><Head p={a} sz="text-[12px]" /><Tim p={a} />
              </article>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <Sec t="Berita Bisnes Terkini" h={bp} />
          <div className="grid md:grid-cols-4 gap-1 mt-1">
            {p.slice(9,13).map(a => (
              <article key={a._id} className="p-0">
                <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-0.5"><Img p={a} w={293} h={165} /></Link>
                <Tag p={a} lk={false} /><Head p={a} sz="text-[12px]" /><Tim p={a} />
              </article>
            ))}
          </div>
        </div>
    </div>

    {/* ═══════ SPOTLIGHT + OPINION (merged) ═══════ */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 py-3">
      <div className="p-0 flex flex-col gap-2">
        <div>
          <div className="flex items-center gap-0 mb-1"><span className="bg-[#C41E3A] px-2 py-3 text-[10px] text-white uppercase font-bold">Sorotan</span><Sec t="Konflik Global" /></div>
          <div className="grid md:grid-cols-4 gap-1">
            {p.slice(14,18).map(a => (
              <article key={a._id} className="p-0">
                <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-0.5"><Img p={a} w={293} h={165} /></Link>
                <Link href={`${bp}${a.slug}`} className="text-[12px] text-gray-800 leading-snug line-clamp-0 hover:text-[#C41E3A] transition-colors">{a.title}</Link><Tim p={a} />
              </article>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <Sec t="Opini" h={bp} />
          <div className="grid md:grid-cols-4 gap-1 mt-1">
            {p.slice(18,22).map(a => (
              <article key={a._id} className="p-0">
                <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-0.5"><Img p={a} w={293} h={165} /></Link>
                <Tag p={a} sz="text-[10px]" lk={false} />
                <Link href={`${bp}${a.slug}`}><h4 className="font-serif font-bold leading-snug text-[13px] text-[#111] hover:text-[#C41E3A] transition-colors">{a.title}</h4></Link>
              </article>
            ))}
          </div>
        </div>
      </div>
      <aside className="p-2">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 pb-0.5 border-b-2 border-[#C41E3A] inline-block">Paling Baca</h3>
        {p.slice(6,12).map((a,i) => (<div key={a._id} className="flex items-start gap-0 py-[3px] border-b border-gray-100 last:border-b-0"><span className="font-serif text-[24px] font-bold text-[#C41E3A]/20 leading-none">{i+1}</span><div className="min-w-0"><Tag p={a} sz="text-[9px]" /><Link href={`${bp}${a.slug}`} className="text-[12px] leading-snug font-serif text-gray-800 hover:text-[#C41E3A] transition-colors line-clamp-2">{a.title}</Link></div></div>))}
      </aside>
    </div>

    {/* ═══════ LIFE & ARTS ═══════ */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 py-3">
      <div className="p-2">
        <Sec t="Gaya Hidup & Seni" h={bp} />
        <div className="grid md:grid-cols-4 gap-1 mt-1">
          {p.slice(22,26).map(a => (
            <article key={a._id} className="p-0">
              <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-0.5"><Img p={a} w={293} h={165} /></Link>
              <Tag p={a} lk={false} /><Head p={a} sz="text-[12px]" /><Tim p={a} />
            </article>
          ))}
        </div>
      </div>
      <aside className="p-2">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 pb-0.5 border-b-2 border-[#C41E3A] inline-block">Data Pasaran</h3>
        <div className="divide-y divide-gray-100">{MKT.map(m => (<div key={m.n} className="flex items-center justify-between py-1 px-1"><span className="text-[10px] text-gray-700">{m.n}</span><div className="text-right"><div className="text-[10px] font-semibold text-gray-900">{m.v}</div><div className={`text-[9px] font-medium ${m.u?'text-emerald-700':'text-red-600'}`}>{m.c} ({m.p})</div></div></div>))}</div>
        <p className="text-[8px] text-gray-400 mt-0.5">* Data tertangguh 15 minit</p>
      </aside>
    </div>

    {/* ═══════ TRENDING TOPICS full-width 4-col ═══════ */}
    <section className="p-2">
      <h2 className="font-serif text-[14px] font-bold text-gray-800 mb-1">Topik Trending</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1">
        {cats.slice(0,4).map(c => { const arts = posts.filter(a => a.cat?.title === c.title).slice(0,4); if (!arts.length) return null; return <div key={c._id} className="p-0">{arts[0]?.img ? <Link href={`${bp}${arts[0].slug}`} className="block overflow-hidden mb-0.5"><Img p={arts[0]} w={293} h={165} /></Link> : null}<Link href={`${bp}?category=${c.slug}`} className="font-serif text-[13px] font-bold text-[#111] hover:text-[#C41E3A] transition-colors">{c.title}</Link><div className="mt-0.5 divide-y divide-gray-100">{arts.slice(0,3).map(a => (<Link key={a._id} href={`${bp}${a.slug}`} className="block py-3 text-[10px] text-gray-600 hover:text-[#C41E3A] transition-colors leading-snug">{a.title}</Link>))}</div></div>})}
      </div>
    </section>

    {/* ═══════ NEWS BY LOCATION full-width 4-col ═══════ */}
    <section className="p-2">
      <h2 className="font-serif text-[14px] font-bold text-gray-800 mb-1">Berita Mengikut Negeri</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1">
        {['Johor','Kedah','Kelantan','Melaka','N.Sembilan','Pahang','P.Pinang','Perak','Perlis','Sabah','Sarawak','Selangor','Terengganu'].map(state => { const arts = posts.filter(a => a.cat?.title === state || a.title?.toLowerCase().includes(state.toLowerCase())).slice(0,2); return <div key={state} className="p-0">{arts[0]?.img ? <Link href={`${bp}${arts[0].slug}`} className="block overflow-hidden mb-0.5"><Img p={arts[0]} w={293} h={165} /></Link> : null}<Link href={`${bp}?location=${state.toLowerCase()}`} className="font-serif text-[12px] font-bold text-[#111] hover:text-[#C41E3A] transition-colors">{state}</Link>{arts.length > 0 ? <div className="mt-0.5 divide-y divide-gray-100">{arts.map(a => <Link key={a._id} href={`${bp}${a.slug}`} className="block py-3 text-[10px] text-gray-600 hover:text-[#C41E3A] transition-colors leading-snug">{a.title}</Link>)}</div> : <p className="text-[9px] text-gray-400 italic mt-0.5">Tiada berita</p>}</div>})}
      </div>
    </section>

    {/* ═══════ SPONSORED CONTENT ═══════ */}
    <section className="p-2">
      <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Kandungan Tajaan</span><span className="text-[8px] text-gray-400">Tentang Kandungan Tajaan</span></div>
      <div className="grid md:grid-cols-3 gap-1">{p.slice(26,29).map(a => (<article key={a._id} className="p-0"><Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-0.5"><Img p={a} w={380} h={214} /></Link><Tag p={a} sz="text-[10px]" /><Head p={a} sz="text-[12px]" /></article>))}</div>
    </section>

    {/* CTA */}
    <section className="p-3 text-center mt-0.5">
      <h2 className="font-serif text-[14px] font-bold text-[#111] mb-0.5">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[10px] text-gray-500 mb-1.5 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-0">
        <Link href={bp} className="px-3 py-1 text-[10px] font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/hubungi" className="px-3 py-1 text-[10px] font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link>
      </div>
    </section>
  </div>
}