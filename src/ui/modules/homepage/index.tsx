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

const A = (d?: string) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 3600000) return Math.floor(diff / 60000) + ' minit lepas'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' jam lepas'
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' hari lepas'
  return new Date(d).toLocaleDateString('ms')
}

function Img({ p, w, h, prio }: { p: P; w: number; h: number; prio?: boolean }) {
  return p.img
    ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full object-cover" style={{aspectRatio:`${w}/${h}`}} priority={prio} />
    : <div className="bg-gray-200" style={{aspectRatio:`${w}/${h}`}} />
}

function Pill({ cat }: { cat?: string }) {
  if (!cat) return null
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white bg-[#C41E3A]">{cat}</span>
}

const SectionHeader = ({ t, link }: { t: string; link?: string }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#1a1a1a]">{t}</h2>
    {link && <Link href={link} className="text-[10px] font-bold text-[#C41E3A] hover:underline uppercase tracking-wider">Lebih &rarr;</Link>}
  </div>
)

function ArticleCard({ a }: { a: P }) {
  return (
    <article>
      <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-2 relative">
        <Img p={a} w={360} h={220} />
        <span className="absolute bottom-2 left-2"><Pill cat={a.cat?.title} /></span>
      </Link>
      <Link href={`${bp}${a.slug}`} className="block font-serif text-[14px] font-bold leading-snug text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2">{a.title}</Link>
      <span className="text-[10px] text-gray-500 mt-1 block">{A(a.publishDate)}</span>
    </article>
  )
}

function ArticleRow({ a }: { a: P }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <Link href={`${bp}${a.slug}`} className="shrink-0 w-20 h-14 overflow-hidden rounded"><Img p={a} w={160} h={112} /></Link>
      <div className="min-w-0">
        <Link href={`${bp}${a.slug}`} className="text-[12px] leading-snug font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 block">{a.title}</Link>
        <span className="text-[9px] text-gray-500 mt-0.5 block">{A(a.publishDate)}</span>
      </div>
    </div>
  )
}

function SideArticle({ a, i }: { a: P; i: number }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="shrink-0 font-serif text-[28px] font-bold text-[#C41E3A]/20 leading-none w-7">{String(i+1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <Link href={`${bp}${a.slug}`} className="text-[12px] leading-snug font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 block">{a.title}</Link>
        <span className="text-[9px] text-gray-500 mt-0.5 block">{A(a.publishDate)}</span>
      </div>
    </div>
  )
}

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const [hero, s1, s2, ...rest] = posts

  return (
  <div className="max-w-[1180px] mx-auto px-4">

    {/* ═══════ HERO: Feature + 2 side ═══════ */}
    <section className="grid lg:grid-cols-[1fr_340px] gap-5 py-5">
      <article className="relative">
        <Link href={`${bp}${hero.slug}`} className="block overflow-hidden rounded-lg"><Img p={hero} w={740} h={480} prio /></Link>
        <div className="mt-3">
          <Pill cat={hero.cat?.title} />
          <Link href={`${bp}${hero.slug}`}>
            <h1 className="font-serif text-[24px] sm:text-[30px] lg:text-[34px] font-bold leading-tight text-[#1a1a1a] hover:text-[#C41E3A] transition-colors mt-2">{hero.title}</h1>
          </Link>
          {hero.excerpt && <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{hero.excerpt}</p>}
          <span className="text-[10px] text-gray-500 mt-1 block">{A(hero.publishDate)}</span>
        </div>
      </article>
      <aside className="space-y-3">
        <SectionHeader t="Terkini" />
        {[s1, s2, ...rest.slice(0,4)].map((a, i) => (
          <div key={a._id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#C41E3A] text-white text-[10px] font-bold flex items-center justify-center">{i+1}</span>
            <div className="min-w-0">
              <Link href={`${bp}${a.slug}`} className="text-[11px] leading-snug font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 block">{a.title}</Link>
              <span className="text-[9px] text-gray-500 mt-0.5 block">{A(a.publishDate)}</span>
            </div>
          </div>
        ))}
      </aside>
    </section>

    {/* ═══════ TAG BAR ═══════ */}
    <div className="border-y border-gray-200 py-3 mb-6 flex items-center gap-2 text-[10px] overflow-x-auto">
      <span className="font-bold uppercase tracking-wider text-gray-400 shrink-0">Topik:</span>
      {['Dunia','Politik','Ekonomi','Sukan','Hiburan','Teknologi','Kesihatan','Pendidikan'].map(t => (
        <Link key={t} href={`${bp}?category=${t.toLowerCase()}`} className="shrink-0 px-3 py-1 bg-gray-100 text-gray-600 hover:bg-[#C41E3A] hover:text-white rounded-full font-medium transition-colors">{t}</Link>
      ))}
    </div>

    {/* ═══════ MAIN CONTENT + SIDEBAR ═══════ */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-8">
      <div className="space-y-6">

        {/* Featured Stories */}
        <section>
          <SectionHeader t="Pilihan Editor" link={bp} />
          <div className="grid grid-cols-2 gap-4">
            {rest.slice(4,8).map(a => <ArticleCard key={a._id} a={a} />)}
          </div>
        </section>

        {/* Category sections (dynamic) */}
        {cats.slice(0,4).map(c => {
          const arts = posts.filter(a => a.cat?.title === c.title)
          if (!arts.length) return null
          return (
            <section key={c._id}>
              <SectionHeader t={c.title} link={`${bp}?category=${c.slug}`} />
              <div className="grid grid-cols-2 gap-4">
                {arts.slice(0,4).map(a => <ArticleCard key={a._id} a={a} />)}
              </div>
            </section>
          )
        })}

        {/* Berita Mengikut Negeri */}
        <section>
          <SectionHeader t="Mengikut Negeri" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['KL','Selangor','Johor','Sabah','Sarawak','N.Sembilan'].map(state => {
              const arts = posts.filter(a => a.cat?.title === state || a.title?.toLowerCase().includes(state.toLowerCase())).slice(0,2)
              return (
                <div key={state}>
                  <Link href={`${bp}?location=${state.toLowerCase()}`} className="font-serif text-[13px] font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors">{state}</Link>
                  <div className="mt-1.5 space-y-1">
                    {arts.length > 0 ? arts.map(a => (
                      <Link key={a._id} href={`${bp}${a.slug}`} className="block text-[10px] leading-snug text-gray-600 hover:text-[#C41E3A] transition-colors line-clamp-2">{a.title}</Link>
                    )) : <p className="text-[9px] text-gray-400 italic">Tiada berita</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ═══════ RIGHT SIDEBAR ═══════ */}
      <aside className="space-y-6 pt-0">
        {/* Popular */}
        <div>
          <SectionHeader t="Popular" />
          <div className="space-y-0">
            {rest.slice(8,14).map((a, i) => <SideArticle key={a._id} a={a} i={i} />)}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-[#1a1a1a] rounded-lg p-5 text-white">
          <h3 className="font-serif text-[18px] font-bold">Surat Berita</h3>
          <p className="text-[10px] text-gray-400 mt-1">Langgan untuk update terkini terus ke e-mel anda</p>
          <div className="mt-3 flex gap-1">
            <input type="email" placeholder="E-mel anda" className="flex-1 px-2.5 py-1.5 text-[10px] text-[#1a1a1a] rounded outline-none" />
            <button className="px-3 py-1.5 bg-[#C41E3A] text-white text-[10px] font-bold rounded hover:bg-[#A01830] transition-colors">Langgan</button>
          </div>
        </div>

        {/* #PILIHANRAYA */}
        <div className="bg-gradient-to-br from-[#C41E3A] to-[#1a1a1a] rounded-lg p-4 text-center">
          <span className="font-serif text-[20px] font-bold text-white">#<span className="text-[#F5C842]">PILIHAN</span>RAYA</span>
          <p className="text-[9px] text-white/70 mt-1">Dashboard PRU16</p>
          <Link href="/election" className="inline-block mt-2 px-4 py-1.5 bg-[#F5C842] text-[#1a1a1a] text-[9px] font-bold rounded hover:bg-white transition-colors">Lihat &rarr;</Link>
        </div>

        {/* Latest */}
        <div>
          <SectionHeader t="Berita Lain" link={bp} />
          <div className="space-y-0">
            {rest.slice(14,18).map(a => <ArticleRow key={a._id} a={a} />)}
          </div>
        </div>
      </aside>
    </div>

    {/* ═══════ KATEGORI FOOTER ═══════ */}
    <section className="border-t border-gray-200 py-6 mt-6">
      <SectionHeader t="Kategori" />
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c._id} href={`${bp}?category=${c.slug}`}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-[#C41E3A] hover:text-white rounded-full text-[10px] font-medium transition-colors"
          >{c.title}</Link>
        ))}
      </div>
    </section>

    {/* ═══════ CTA ═══════ */}
    <section className="py-8 text-center border-t border-gray-200">
      <h2 className="font-serif text-[18px] font-bold text-[#1a1a1a]">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Link href={bp} className="px-4 py-2 text-[11px] font-semibold text-white bg-[#C41E3A] rounded hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/tentang" className="px-4 py-2 text-[11px] font-semibold text-[#C41E3A] border border-[#C41E3A] rounded hover:bg-[#C41E3A] hover:text-white transition-colors">Tentang Kami</Link>
      </div>
    </section>

  </div>
  )
}