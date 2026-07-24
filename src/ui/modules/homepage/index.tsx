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
type P = any

function ago(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'j'
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd'
  return new Date(d).toLocaleDateString('ms', { day:'numeric', month:'short' })
}

function Pi({ w, h, pr, p }: { w: number; h: number; pr?: boolean; p: P }) {
  return p.img
    ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full h-full object-cover" priority={pr} />
    : <div className="w-full h-full bg-gray-200" />
}

function Cat({ c, s }: { c?: string; s?: string }) {
  if (!c) return null
  return <span className={`${s||'text-[10px]'} font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm text-white bg-[#C41E3A]`}>{c}</span>
}

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, ...tail] = posts

  const sideCol = [b, c]

  return (
  <div className="mx-auto" style={{maxWidth:1180}}>

    {/* ===== TRENDING TOPIK BAR ===== */}
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 overflow-x-auto text-[11px]">
      <span className="shrink-0 font-bold uppercase tracking-wider text-gray-400">🔥 Trending</span>
      {['Dunia','Politik','Ekonomi','Sukan','Hiburan','Teknologi'].map(t => (
        <Link key={t} href={`${bp}?category=${t.toLowerCase()}`}
          className="shrink-0 px-3 py-1 bg-gray-100 text-gray-600 hover:bg-[#C41E3A] hover:text-white rounded-sm font-medium transition-colors"
        >{t}</Link>
      ))}
    </div>

    {/* ===== HERO ===== */}
    <section className="grid lg:grid-cols-[1fr_340px] gap-5 px-4 py-5">
      {/* Feature */}
      <article>
        <Link href={`${bp}${a.slug}`} className="block relative overflow-hidden mb-3" style={{aspectRatio:'740/420'}}>
          <Pi p={a} w={740} h={420} pr />
          <span className="absolute bottom-3 left-3"><Cat c={a.cat?.title} /></span>
        </Link>
        <Link href={`${bp}${a.slug}`}>
          <h1 className="font-serif text-[22px] sm:text-[28px] lg:text-[32px] font-bold leading-tight text-[#1a1a1a] hover:text-[#C41E3A] transition-colors">{a.title}</h1>
        </Link>
        {a.excerpt && <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{a.excerpt}</p>}
        <span className="text-[10px] text-gray-400 mt-2 block">{ago(a.publishDate)}</span>
      </article>
      {/* Side: 2 stacked */}
      <aside className="space-y-5">
        {sideCol.map(x => (
          <article key={x._id}>
            <Link href={`${bp}${x.slug}`} className="block relative overflow-hidden mb-2" style={{aspectRatio:'340/200'}}>
              <Pi p={x} w={340} h={200} />
              <span className="absolute bottom-2 left-2"><Cat c={x.cat?.title} s="text-[9px]" /></span>
            </Link>
            <Link href={`${bp}${x.slug}`} className="block font-serif text-[14px] font-bold leading-snug text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2">{x.title}</Link>
            <span className="text-[9px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
          </article>
        ))}
      </aside>
    </section>

    {/* ===== MOST READ ===== */}
    <section className="border-y border-gray-200 py-4 px-4 mb-5">
      <div className="flex items-center gap-1 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">📊 Paling Dibaca</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-5 gap-y-2">
        {[d, e, f, g, h, i].filter(Boolean).map((x, idx) => (
          <div key={x._id} className="flex items-start gap-2">
            <span className="shrink-0 font-serif text-[22px] font-bold text-[#C41E3A]/30 leading-none w-5">{String(idx+1).padStart(2,'0')}</span>
            <Link href={`${bp}${x.slug}`} className="text-[10px] leading-snug text-gray-700 hover:text-[#C41E3A] transition-colors line-clamp-2 font-medium">{x.title}</Link>
          </div>
        ))}
      </div>
    </section>

    {/* ===== Pilihan Editor ===== */}
    <section className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1a1a1a]">Pilihan Editor</h2>
        <Link href={bp} className="text-[10px] font-bold text-[#C41E3A] hover:underline uppercase tracking-wider">Lebih &rarr;</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[j, k, l, m].filter(Boolean).map(x => (
          <article key={x._id}>
            <Link href={`${bp}${x.slug}`} className="block relative overflow-hidden mb-2 rounded-sm" style={{aspectRatio:'360/220'}}>
              <Pi p={x} w={360} h={220} />
              <span className="absolute bottom-2 left-2"><Cat c={x.cat?.title} s="text-[8px]" /></span>
            </Link>
            <Link href={`${bp}${x.slug}`} className="block font-serif text-[13px] font-bold leading-snug text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2">{x.title}</Link>
            <span className="text-[9px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
          </article>
        ))}
      </div>
    </section>

    {/* ===== MAIN 2-COL LAYOUT ===== */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 px-4">

      {/* LEFT COL */}
      <div className="space-y-6">

        {/* Dynamic category sections ala Foxiz */}
        {cats.slice(0,4).map(c => {
          const arts = posts.filter(x => x.cat?.title === c.title)
          if (!arts.length) return null
          return (
            <section key={c._id}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1a1a1a]">{c.title}</h2>
                <Link href={`${bp}?category=${c.slug}`} className="text-[10px] font-bold text-[#C41E3A] hover:underline uppercase tracking-wider">Lebih &rarr;</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {arts.slice(0,4).map(x => (
                  <article key={x._id}>
                    <Link href={`${bp}${x.slug}`} className="block relative overflow-hidden mb-2 rounded-sm" style={{aspectRatio:'360/220'}}>
                      <Pi p={x} w={360} h={220} />
                      <span className="absolute bottom-2 left-2"><Cat c={x.cat?.title} s="text-[8px]" /></span>
                    </Link>
                    <Link href={`${bp}${x.slug}`} className="block font-serif text-[13px] font-bold leading-snug text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2">{x.title}</Link>
                    <span className="text-[9px] text-gray-400 mt-1 block">{ago(x.publishDate)}</span>
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        {/* Berita Mengikut Negeri */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1a1a1a]">Mengikut Negeri</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['KL','Selangor','Johor','Sabah','Sarawak','N.Sembilan'].map(state => {
              const arts = posts.filter(x => x.cat?.title === state || x.title?.toLowerCase().includes(state.toLowerCase())).slice(0,2)
              return (
                <div key={state}>
                  <Link href={`${bp}?location=${state.toLowerCase()}`} className="font-serif text-[13px] font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors">{state}</Link>
                  <div className="mt-1.5 space-y-1">
                    {arts.length > 0 ? arts.map(x => (
                      <Link key={x._id} href={`${bp}${x.slug}`} className="block text-[10px] leading-snug text-gray-600 hover:text-[#C41E3A] transition-colors line-clamp-2">{x.title}</Link>
                    )) : <p className="text-[9px] text-gray-400 italic">Tiada berita</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="space-y-6">
        {/* Popular numbered */}
        <div>
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1a1a1a] mb-4">Popular</h2>
          <div className="space-y-0">
            {[n, o, ...tail.slice(0,4)].filter(Boolean).map((x, idx) => (
              <div key={x._id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <span className="shrink-0 font-serif text-[26px] font-bold text-[#C41E3A]/25 leading-none w-7">{String(idx+1).padStart(2,'0')}</span>
                <div className="min-w-0">
                  <Link href={`${bp}${x.slug}`} className="text-[11px] leading-snug font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 block">{x.title}</Link>
                  <span className="text-[9px] text-gray-400 mt-0.5 block">{ago(x.publishDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-[#1a1a1a] rounded-sm p-5 text-white">
          <h3 className="font-bold text-[15px]">Surat Berita</h3>
          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Langgan untuk dapatkan berita terkini terus ke peti masuk anda.</p>
          <div className="mt-3">
            <input type="email" placeholder="Alamat e-mel" className="w-full px-3 py-2 text-[11px] text-[#1a1a1a] rounded-sm outline-none mb-2" />
            <label className="flex items-start gap-2 text-[9px] text-gray-400 mb-2">
              <input type="checkbox" className="mt-0.5" />
              <span>Saya telah membaca dan bersetuju dengan <a href="#" className="text-[#C41E3A] underline">Dasar Privasi</a>.</span>
            </label>
            <button className="w-full py-2 bg-[#C41E3A] text-white text-[10px] font-bold rounded-sm hover:bg-[#A01830] transition-colors">Langgan</button>
          </div>
        </div>

        {/* #PILIHANRAYA widget */}
        <div className="bg-gradient-to-br from-[#C41E3A] to-[#1a1a1a] rounded-sm p-4 text-center">
          <span className="font-serif text-[20px] font-bold text-white">#<span className="text-[#F5C842]">PILIHAN</span>RAYA</span>
          <p className="text-[9px] text-white/70 mt-1">Dashboard PRU16 — data DUN Negeri Sembilan</p>
          <Link href="/election" className="inline-block mt-2 px-4 py-1.5 bg-[#F5C842] text-[#1a1a1a] text-[9px] font-bold rounded-sm hover:bg-white transition-colors">Lihat &rarr;</Link>
        </div>

        {/* Thumbnail sidebar */}
        <div>
          <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1a1a1a] mb-4">Berita Lain</h2>
          <div className="space-y-0">
            {tail.slice(4,8).filter(Boolean).map(x => (
              <div key={x._id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                <Link href={`${bp}${x.slug}`} className="shrink-0 w-20 h-14 overflow-hidden rounded-sm" style={{aspectRatio:'80/56'}}>
                  <Pi p={x} w={80} h={56} />
                </Link>
                <div className="min-w-0">
                  <Link href={`${bp}${x.slug}`} className="text-[11px] leading-snug font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 block">{x.title}</Link>
                  <span className="text-[9px] text-gray-400 mt-0.5 block">{ago(x.publishDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>

    {/* ===== TRENDING TAGS FOOTER ===== */}
    <section className="border-t border-gray-200 py-6 px-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1a1a1a]">Kategori</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c._id} href={`${bp}?category=${c.slug}`}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-[#C41E3A] hover:text-white rounded-sm text-[10px] font-medium transition-colors"
          >{c.title}</Link>
        ))}
      </div>
    </section>

    {/* ===== CTA ===== */}
    <section className="py-8 text-center border-t border-gray-200 px-4">
      <h2 className="font-serif text-[18px] font-bold text-[#1a1a1a]">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Link href={bp} className="px-4 py-2 text-[11px] font-semibold text-white bg-[#C41E3A] rounded-sm hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/tentang" className="px-4 py-2 text-[11px] font-semibold text-[#C41E3A] border border-[#C41E3A] rounded-sm hover:bg-[#C41E3A] hover:text-white transition-colors">Tentang Kami</Link>
      </div>
    </section>

  </div>
  )
}