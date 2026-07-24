import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...48]{
  _id,title,excerpt,publishDate,'img':metadata.image,'slug':metadata.slug.current,
  'cat':categories[0]->{title,color},'author':authors[0]->{name}
}`
const CQ = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`
const bp = `/${ROUTES.blog}/`
const R = '#f51416'
type P = any

function ago(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'j'
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd'
  return new Date(d).toLocaleDateString('ms', { day:'numeric', month:'short' })
}

function Img({ p, w, h, pr }: { p: P; w: number; h: number; pr?: boolean }) {
  return p.img
    ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full h-full object-cover" priority={pr} />
    : <div className="w-full h-full bg-gray-200" />
}

/** For image overlays — red bg pill */
function CatBadge({ c }: { c?: string }) {
  if (!c) return null
  return <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 text-white" style={{background:R}}>{c}</span>
}

/** For inline text — red text only */
function CatText({ c }: { c?: string }) {
  if (!c) return null
  return <span className="text-[10px] font-bold uppercase tracking-wide" style={{color:R}}>{c}</span>
}

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, ...tail] = posts

  return (
  <div className="mx-auto" style={{maxWidth:1180}}>

    {/* ===== TRENDING BAR (red bg) ===== */}
    <div className="flex items-center gap-3 px-4 py-2.5 overflow-x-auto text-[11px] text-white" style={{background:R}}>
      <span className="shrink-0 font-bold uppercase tracking-wider text-white/70">🔥 Trending</span>
      {['Dunia','Politik','Ekonomi','Sukan','Hiburan','Teknologi'].map(t => (
        <Link key={t} href={`${bp}?category=${t.toLowerCase()}`}
          className="shrink-0 text-white/80 hover:text-white font-medium transition-colors"
          style={{borderRight:'1px solid rgba(255,255,255,0.25)'}}
        >{t}</Link>
      ))}
    </div>

    {/* ===== HERO ===== */}
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 px-4 py-6">
      <section className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Feature */}
        <article>
          <Link href={`${bp}${a.slug}`} className="block relative overflow-hidden mb-3" style={{aspectRatio:'740/420'}}>
            <Img p={a} w={740} h={420} pr />
            <span className="absolute bottom-3 left-3"><CatBadge c={a.cat?.title} /></span>
          </Link>
          <CatText c={a.cat?.title} />
          <Link href={`${bp}${a.slug}`}>
            <h1 className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold leading-tight text-[#031934] mt-1.5 hover:opacity-70 transition-opacity">{a.title}</h1>
          </Link>
          {a.excerpt && <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{a.excerpt}</p>}
          <span className="text-[10px] text-gray-400 mt-2 block">{ago(a.publishDate)}</span>
        </article>
        {/* 2 stacked */}
        <aside className="space-y-6">
          {[b, c].map(x => (
            <article key={x._id}>
              <Link href={`${bp}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'340/200'}}>
                <Img p={x} w={340} h={200} />
                <span className="absolute bottom-2 left-2"><CatBadge c={x.cat?.title} /></span>
              </Link>
              <CatText c={x.cat?.title} />
              <Link href={`${bp}${x.slug}`} className="block text-[14px] font-bold leading-snug text-[#031934] hover:opacity-70 transition-opacity line-clamp-2 mt-1">{x.title}</Link>
              <span className="text-[9px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
            </article>
          ))}
        </aside>
      </section>

      {/* Most Read sidebar */}
      <aside>
        <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#031934] mb-4">Paling Dibaca</h3>
        <div className="space-y-0">
          {[d, e, f, g, h, i].filter(Boolean).map((x, idx) => (
            <div key={x._id} className="flex items-start gap-3 py-3 border-b border-gray-200 last:border-0">
              <span className="shrink-0 w-6 h-6 flex items-center justify-center text-[11px] font-bold text-white" style={{background:R, borderRadius:9999}}>{idx+1}</span>
              <div className="min-w-0">
                <Link href={`${bp}${x.slug}`} className="text-[11px] leading-snug font-bold text-[#031934] hover:opacity-70 transition-opacity line-clamp-2 block">{x.title}</Link>
                <span className="text-[9px] text-gray-400 mt-0.5 block">{ago(x.publishDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>

    {/* ===== FEATURED / Pilihan Editor ===== */}
    <section className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4 pb-2" style={{borderBottom:'1px solid #e5e7eb'}}>
        <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#031934]">Pilihan Editor</h2>
        <Link href={bp} className="text-[10px] font-bold uppercase tracking-wider" style={{color:R}}>Lebih &rarr;</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[j, k, l, m].filter(Boolean).map(x => (
          <article key={x._id}>
            <Link href={`${bp}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'360/220'}}>
              <Img p={x} w={360} h={220} />
              <span className="absolute bottom-2 left-2"><CatBadge c={x.cat?.title} /></span>
            </Link>
            <CatText c={x.cat?.title} />
            <Link href={`${bp}${x.slug}`} className="block text-[13px] font-bold leading-snug text-[#031934] hover:opacity-70 transition-opacity line-clamp-2 mt-1">{x.title}</Link>
            <span className="text-[9px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
          </article>
        ))}
      </div>
    </section>

    {/* ===== MAIN 2-COL ===== */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 px-4">

      {/* LEFT */}
      <div className="space-y-6">
        {cats.slice(0,4).map(c => {
          const arts = posts.filter(x => x.cat?.title === c.title)
          if (!arts.length) return null
          return (
            <section key={c._id}>
              <div className="flex items-center justify-between mb-4 pb-2" style={{borderBottom:'1px solid #e5e7eb'}}>
                <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#031934]">{c.title}</h2>
                <Link href={`${bp}?category=${c.slug}`} className="text-[10px] font-bold uppercase tracking-wider" style={{color:R}}>Lebih &rarr;</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {arts.slice(0,4).map(x => (
                  <article key={x._id}>
                    <Link href={`${bp}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'360/220'}}>
                      <Img p={x} w={360} h={220} />
                      <span className="absolute bottom-2 left-2"><CatBadge c={x.cat?.title} /></span>
                    </Link>
                    <CatText c={x.cat?.title} />
                    <Link href={`${bp}${x.slug}`} className="block text-[13px] font-bold leading-snug text-[#031934] hover:opacity-70 transition-opacity line-clamp-2 mt-1">{x.title}</Link>
                    <span className="text-[9px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        {/* Berita Mengikut Negeri */}
        <section>
          <h2 className="text-[15px] font-bold uppercase tracking-wide text-[#031934] mb-4 pb-2" style={{borderBottom:'1px solid #e5e7eb'}}>Mengikut Negeri</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['KL','Selangor','Johor','Sabah','Sarawak','N.Sembilan'].map(state => {
              const arts = posts.filter(x => x.cat?.title === state || x.title?.toLowerCase().includes(state.toLowerCase())).slice(0,2)
              return (
                <div key={state}>
                  <Link href={`${bp}?location=${state.toLowerCase()}`} className="text-[13px] font-bold text-[#031934] hover:opacity-70 transition-opacity">{state}</Link>
                  <div className="mt-1.5 space-y-1">
                    {arts.length > 0 ? arts.map(x => (
                      <Link key={x._id} href={`${bp}${x.slug}`} className="block text-[10px] leading-snug text-gray-600 hover:opacity-70 transition-opacity line-clamp-2">{x.title}</Link>
                    )) : <p className="text-[9px] text-gray-400 italic">Tiada berita</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* RIGHT */}
      <aside className="space-y-6">
        {/* Popular */}
        <div>
          <h3 className="text-[15px] font-bold uppercase tracking-wide text-[#031934] mb-4">Popular</h3>
          <div className="space-y-0">
            {[n, o, ...tail.slice(0,4)].filter(Boolean).map((x, idx) => (
              <div key={x._id} className="flex items-start gap-3 py-3 border-b border-gray-200 last:border-0">
                <span className="shrink-0 text-[26px] font-bold leading-none w-7" style={{color:R+'40'}}>{String(idx+1).padStart(2,'0')}</span>
                <div className="min-w-0">
                  <Link href={`${bp}${x.slug}`} className="text-[11px] leading-snug font-bold text-[#031934] hover:opacity-70 transition-opacity line-clamp-2 block">{x.title}</Link>
                  <span className="text-[9px] text-gray-400 mt-0.5 block">{ago(x.publishDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="p-5 text-white" style={{background:'linear-gradient(180deg,#000098 0%,#000008 100%)'}}>
          <h3 className="font-bold text-[15px]">Surat Berita</h3>
          <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">Langgan untuk dapatkan berita terkini terus ke peti masuk anda.</p>
          <div className="mt-3">
            <input type="email" placeholder="Alamat e-mel" className="w-full px-3 py-2 text-[11px] text-[#031934] outline-none mb-2" />
            <label className="flex items-start gap-2 text-[9px] text-gray-400 mb-2">
              <input type="checkbox" className="mt-0.5" />
              <span>Saya telah membaca dan bersetuju dengan <a href="#" style={{color:R, textDecoration:'underline'}}>Dasar Privasi</a>.</span>
            </label>
            <button className="w-full py-2 text-white text-[10px] font-bold" style={{background:R}}>Langgan</button>
          </div>
        </div>

        {/* #PILIHANRAYA */}
        <div className="p-4 text-center text-white" style={{background:'linear-gradient(135deg,#f51416,#1a1a1a)'}}>
          <span className="text-[20px] font-bold">#<span className="text-[#F5C842]">PILIHAN</span>RAYA</span>
          <p className="text-[9px] text-white/70 mt-1">Dashboard PRU16</p>
          <Link href="/election" className="inline-block mt-2 px-4 py-1.5 bg-[#F5C842] text-[#1a1a1a] text-[9px] font-bold" style={{borderRadius:3}}>Lihat &rarr;</Link>
        </div>

        {/* Berita Lain */}
        <div>
          <h3 className="text-[15px] font-bold uppercase tracking-wide text-[#031934] mb-4">Berita Lain</h3>
          <div className="space-y-0">
            {tail.slice(4,8).filter(Boolean).map(x => (
              <div key={x._id} className="flex gap-3 py-3 border-b border-gray-200 last:border-0">
                <Link href={`${bp}${x.slug}`} className="shrink-0 w-20 h-14 overflow-hidden" style={{aspectRatio:'80/56'}}>
                  <Img p={x} w={80} h={56} />
                </Link>
                <div className="min-w-0">
                  <Link href={`${bp}${x.slug}`} className="text-[11px] leading-snug font-bold text-[#031934] hover:opacity-70 transition-opacity line-clamp-2 block">{x.title}</Link>
                  <span className="text-[9px] text-gray-400 mt-0.5 block">{ago(x.publishDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>

    {/* ===== KATEGORI ===== */}
    <section className="border-t border-gray-200 py-6 px-4 mt-6">
      <h3 className="text-[14px] font-bold uppercase tracking-wide text-gray-500 pb-3">Kategori</h3>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c._id} href={`${bp}?category=${c.slug}`}
            className="px-3 py-1.5 text-gray-600 text-[10px] font-medium transition-colors category-pill"
            style={{background:'#f3f4f6', borderRadius:3}}
          >{c.title}</Link>
        ))}
      </div>
      <style>{`.category-pill:hover{background:${R}!important;color:#fff!important}`}</style>
    </section>

    {/* ===== CTA ===== */}
    <section className="py-8 text-center border-t border-gray-200 px-4">
      <h2 className="text-[18px] font-bold text-[#031934]">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Link href={bp} className="px-4 py-2 text-[11px] font-semibold text-white" style={{background:R, borderRadius:3}}>Baca Berita</Link>
        <Link href="/tentang" className="px-4 py-2 text-[11px] font-semibold" style={{color:R, border:'1px solid '+R, borderRadius:3}}>Tentang Kami</Link>
      </div>
    </section>

  </div>
  )
}