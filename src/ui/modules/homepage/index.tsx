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
function CatTag({ p, sz }: { p: P; sz?: string }) {
  return p.cat?.title ? <span className={`${sz||'text-[10px]'} font-bold uppercase tracking-widest text-[#C41E3A]`}>{p.cat.title}</span> : null
}
function ArtLink({ p, sz, cl }: { p: P; sz?: string; cl?: string }) {
  return <Link href={`${bp}${p.slug}`} className={`font-serif font-bold leading-snug text-[#1a1a1a] hover:text-[#C41E3A] transition-colors ${cl||''} ${sz||'text-[13px]'}`}>{p.title}</Link>
}
function Tim({ p }: { p: P }) { const d = A(p.publishDate); if (!d) return null; return <p className="text-[9px] text-gray-400 mt-0.5">{d}</p> }
function Sec({ t, h }: { t: string; h?: string }) {
  return h
    ? <Link href={h} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#C41E3A] border-b-2 border-[#C41E3A] pb-1 hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors">{t}</Link>
    : <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#C41E3A] border-b-2 border-[#C41E3A] pb-1">{t}</span>
}

const MKT = [
  { n:'FBMKLCI', v:'1,583.42', c:'+2.18', p:'+0.14%', u:true },
  { n:'USD/MYR', v:'4.28', c:'+0.01', p:'+0.23%', u:true },
  { n:'SGD/MYR', v:'3.18', c:'-0.005', p:'-0.16%', u:false },
  { n:'Brent Crude', v:'$78.42', c:'-0.85', p:'-1.07%', u:false },
  { n:'Emas 999.9', v:'RM 384.50', c:'+1.20', p:'+0.31%', u:true },
]

export default async function Homepage() {
  const [posts, cats, pod] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
    client.fetch<P|null>(PQ, {}, { next: { revalidate: 300 } })
  ])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const p = posts

  return (
  <div className="max-w-[1180px] mx-auto px-3 sm:px-6">

    {/* ═══════ MARKET DATA BAR ═══════ */}
    <div className="flex items-center gap-4 sm:gap-6 py-2.5 border-b border-gray-200 overflow-x-auto text-[10px] sm:text-[11px]">
      <span className="font-bold uppercase tracking-wider text-[#C41E3A] shrink-0">Pasaran</span>
      {MKT.map(m => (
        <div key={m.n} className="flex items-center gap-1.5 shrink-0">
          <span className="font-semibold text-[#1a1a1a]/70">{m.n}</span>
          <span className="font-bold text-[#1a1a1a]">{m.v}</span>
          <span className={`font-medium ${m.u ? 'text-emerald-700' : 'text-red-600'}`}>{m.p}</span>
        </div>
      ))}
    </div>

    {/* ═══════ HERO: 3-COL LAYOUT ═══════ */}
    <section className="grid lg:grid-cols-[1fr_300px] gap-6 py-5">
      {/* Main column: hero story + 2 below */}
      <div className="space-y-4">
        <article>
          <Link href={`${bp}${p[0].slug}`} className="block overflow-hidden mb-2"><Img p={p[0]} w={740} h={416} prio /></Link>
          <CatTag p={p[0]} sz="text-[10px]" />
          <Link href={`${bp}${p[0].slug}`}>
            <h1 className="font-serif text-[22px] sm:text-[26px] lg:text-[30px] font-bold leading-tight text-[#1a1a1a] hover:text-[#C41E3A] transition-colors mt-1">{p[0].title}</h1>
          </Link>
          {p[0].excerpt && <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1 leading-relaxed line-clamp-2">{p[0].excerpt}</p>}
          <Tim p={p[0]} />
        </article>
        {/* 2 articles side by side */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          {p.slice(1,3).map(a => (
            <article key={a._id}>
              <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={360} h={203} /></Link>
              <CatTag p={a} sz="text-[9px]" />
              <ArtLink p={a} sz="text-[14px]" cl="line-clamp-2 mt-0.5 block" />
              <Tim p={a} />
            </article>
          ))}
        </div>
      </div>

      {/* Sidebar: latest headlines + podcast */}
      <aside className="space-y-5">
        {/* Berita Terkini */}
        <div>
          <Sec t="Terkini" />
          <div className="mt-2 divide-y divide-gray-100">
            {p.slice(3,12).map((a, i) => (
              <div key={a._id} className="flex items-start gap-2 py-2 first:pt-0">
                <span className="shrink-0 w-5 h-5 rounded bg-[#1a1a1a]/5 text-[9px] font-bold text-[#1a1a1a]/40 flex items-center justify-center">{i+1}</span>
                <div className="min-w-0">
                  <Link href={`${bp}${a.slug}`} className="text-[11px] sm:text-[12px] leading-snug text-[#1a1a1a]/80 hover:text-[#C41E3A] transition-colors line-clamp-2 font-medium">{a.title}</Link>
                  <Tim p={a} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Podcast card */}
        {pod && (
          <div className="bg-[#1a1a1a] rounded-lg p-4 flex gap-3 items-center">
            {pod.img && (
              <Link href={`${bp}${pod.slug}`} className="shrink-0">
                <Image src={urlFor(pod.img).width(80).height(80).url()} alt="" width={80} height={80} className="rounded-md object-cover" />
              </Link>
            )}
            <div className="min-w-0">
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#F5C842]">Podcast</span>
              <Link href={`${bp}${pod.slug}`} className="text-[11px] leading-snug text-white hover:text-[#F5C842] transition-colors line-clamp-2 block mt-0.5 font-medium">{pod.title}</Link>
            </div>
          </div>
        )}
      </aside>
    </section>

    {/* ═══════ EDITOR'S PICKS ═══════ */}
    <section className="py-5 border-t border-gray-200">
      <Sec t="Pilihan Editor" h={bp} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
        {p.slice(12,16).map(a => (
          <article key={a._id}>
            <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={360} h={203} /></Link>
            <CatTag p={a} sz="text-[9px]" />
            <ArtLink p={a} sz="text-[12px]" cl="line-clamp-2 mt-0.5 block" />
            <Tim p={a} />
          </article>
        ))}
      </div>
    </section>

    {/* ═══════ BISNES + OPINI ═══════ */}
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 py-5 border-t border-gray-200">
      <section>
        <Sec t="Bisnes" h={bp} />
        <div className="grid grid-cols-2 gap-4 mt-3">
          {p.slice(16,20).map(a => (
            <article key={a._id}>
              <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={360} h={203} /></Link>
              <CatTag p={a} sz="text-[9px]" />
              <ArtLink p={a} sz="text-[12px]" cl="line-clamp-2 mt-0.5 block" />
              <Tim p={a} />
            </article>
          ))}
        </div>
      </section>
      <section>
        <Sec t="Opini" h={bp} />
        <div className="grid grid-cols-2 gap-4 mt-3">
          {p.slice(20,24).map(a => (
            <article key={a._id}>
              <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={360} h={203} /></Link>
              <CatTag p={a} sz="text-[9px]" />
              <ArtLink p={a} sz="text-[12px]" cl="line-clamp-2 mt-0.5 block" />
              <Tim p={a} />
            </article>
          ))}
        </div>
      </section>
    </div>

    {/* ═══════ TRENDING TOPICS ═══════ */}
    <section className="py-5 border-t border-gray-200">
      <Sec t="Topik Trending" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-3">
        {cats.slice(0,4).map(c => {
          const arts = posts.filter(a => a.cat?.title === c.title).slice(0,4)
          if (!arts.length) return null
          return (
            <div key={c._id}>
              <Link href={`${bp}?category=${c.slug}`} className="font-serif text-[14px] font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors">{c.title}</Link>
              <div className="mt-2 space-y-2">
                {arts.slice(0,3).map(a => (
                  <Link key={a._id} href={`${bp}${a.slug}`} className="block text-[11px] leading-snug text-[#1a1a1a]/70 hover:text-[#C41E3A] transition-colors pb-2 border-b border-gray-100 last:border-0">{a.title}</Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>

    {/* ═══════ BERITA MENGIKUT NEGERI ═══════ */}
    <section className="py-5 border-t border-gray-200">
      <Sec t="Berita Mengikut Negeri" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-3">
        {['Johor','Kedah','Kelantan','Melaka','N.Sembilan','Pahang','P.Pinang','Perak','Sabah','Sarawak','Selangor','Terengganu','KL'].map(state => {
          const arts = posts.filter(a => a.cat?.title === state || a.title?.toLowerCase().includes(state.toLowerCase())).slice(0,2)
          return (
            <div key={state}>
              <Link href={`${bp}?location=${state.toLowerCase()}`} className="font-serif text-[12px] font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors">{state}</Link>
              {arts.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {arts.map(a => (
                    <Link key={a._id} href={`${bp}${a.slug}`} className="block text-[10px] leading-snug text-[#1a1a1a]/60 hover:text-[#C41E3A] transition-colors">{a.title}</Link>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-gray-400 italic mt-1">Tiada berita</p>
              )}
            </div>
          )
        })}
      </div>
    </section>

    {/* ═══════ #PILIHANRAYA BANNER ═══════ */}
    <section className="py-5 border-t border-gray-200">
      <div className="bg-gradient-to-r from-[#C41E3A] via-[#C41E3A] to-[#1a1a1a] rounded-lg p-5 sm:p-6 text-center">
        <span className="font-serif text-[22px] sm:text-[26px] font-bold text-white">#<span className="text-[#F5C842]">PILIHAN</span>RAYA</span>
        <p className="text-[11px] text-white/70 mt-1">Liputan eksklusif pilihan raya di Malaysia</p>
        <Link href="/election" className="inline-block mt-2.5 px-5 py-1.5 bg-[#F5C842] text-[#1a1a1a] text-[11px] font-bold rounded hover:bg-white transition-colors">Dashboard PRU16 →</Link>
      </div>
    </section>

    {/* ═══════ CTA ═══════ */}
    <section className="py-6 text-center border-t border-gray-200">
      <h2 className="font-serif text-[15px] font-bold text-[#1a1a1a]">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Link href={bp} className="px-4 py-1.5 text-[11px] font-semibold text-white bg-[#C41E3A] rounded hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/tentang" className="px-4 py-1.5 text-[11px] font-semibold text-[#C41E3A] border border-[#C41E3A] rounded hover:bg-[#C41E3A] hover:text-white transition-colors">Tentang Kami</Link>
      </div>
    </section>

  </div>
  )
}