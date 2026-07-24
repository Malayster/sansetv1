import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

const Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...36]{
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
  return p.img ? <Image src={urlFor(p.img).width(w).height(h).url()} alt="" width={w} height={h} className="w-full object-cover" style={{aspectRatio:`${w}/${h}`}} priority={prio} /> : <div className="bg-gray-200" style={{aspectRatio:`${w}/${h}`}} />
}
function CatTag({ p, sz }: { p: P; sz?: string }) {
  if (!p.cat?.title) return null
  return <span className={`${sz||'text-[10px]'} font-bold uppercase tracking-widest text-[#C41E3A]`}>{p.cat.title}</span>
}
function AuthorDate({ p, small }: { p: P; small?: boolean }) {
  const d = A(p.publishDate)
  if (!d) return null
  return <p className={`${small ? 'text-[9px]' : 'text-[10px]'} text-gray-400`}>{p.author?.name ? `${p.author.name} / ` : ''}{d}</p>
}
const SectionTitle = ({ t, h }: { t: string; h?: string }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
    {h
      ? <Link href={h} className="text-[13px] font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors uppercase tracking-wider">{t}</Link>
      : <span className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider">{t}</span>
    }
  </div>
)
const ArticleCard = ({ a, w, h, sz }: { a: P; w: number; h: number; sz?: string }) => (
  <article>
    <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-1.5"><Img p={a} w={w} h={h} /></Link>
    <CatTag p={a} sz="text-[9px]" />
    <Link href={`${bp}${a.slug}`} className={`font-serif font-bold leading-snug text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 mt-0.5 block ${sz || 'text-[13px]'}`}>{a.title}</Link>
    <AuthorDate p={a} small />
  </article>
)
const ArticleRow = ({ a }: { a: P }) => (
  <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
    <Link href={`${bp}${a.slug}`} className="shrink-0 w-20 h-14 overflow-hidden"><Img p={a} w={160} h={112} /></Link>
    <div className="min-w-0">
      <CatTag p={a} sz="text-[8px]" />
      <Link href={`${bp}${a.slug}`} className="text-[11px] leading-snug font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 block mt-0.5">{a.title}</Link>
      <AuthorDate p={a} small />
    </div>
  </div>
)

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<P[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>
  const p = posts
  const [hero, ...rest] = p

  return (
  <div className="max-w-[1180px] mx-auto px-4">

    {/* ═══════ HERO: Feature + 4 Grid ═══════ */}
    <section className="grid lg:grid-cols-[1fr_360px] gap-6 py-5">
      {/* Feature */}
      <article>
        <Link href={`${bp}${hero.slug}`} className="block overflow-hidden mb-2.5"><Img p={hero} w={740} h={416} prio /></Link>
        <CatTag p={hero} sz="text-[10px]" />
        <Link href={`${bp}${hero.slug}`}>
          <h1 className="font-serif text-[24px] sm:text-[28px] lg:text-[32px] font-bold leading-tight text-[#1a1a1a] hover:text-[#C41E3A] transition-colors mt-1.5">{hero.title}</h1>
        </Link>
        {hero.excerpt && <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{hero.excerpt}</p>}
        <AuthorDate p={hero} />
      </article>

      {/* Sidebar: Latest + Trending */}
      <aside className="space-y-5">
        <div>
          <SectionTitle t="Terkini" />
          <div className="divide-y divide-gray-100">
            {rest.slice(0,6).map((a, i) => (
              <div key={a._id} className="flex items-start gap-2 py-2 first:pt-0">
                <span className="shrink-0 w-5 h-5 rounded bg-[#C41E3A]/10 text-[9px] font-bold text-[#C41E3A] flex items-center justify-center">{i+1}</span>
                <Link href={`${bp}${a.slug}`} className="text-[11px] leading-snug text-[#1a1a1a]/80 hover:text-[#C41E3A] transition-colors font-medium">{a.title}</Link>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>

    {/* ═══════ EDITOR'S PICKS ═══════ */}
    <section className="py-5 border-t border-gray-300">
      <SectionTitle t="Pilihan Editor" h={bp} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rest.slice(6,10).map(a => <ArticleCard key={a._id} a={a} w={360} h={203} />)}
      </div>
    </section>

    {/* ═══════ MAIN CONTENT + SIDEBAR ═══════ */}
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 py-5 border-t border-gray-300">
      <div className="space-y-8">
        {/* Trending Categories */}
        <div>
          <SectionTitle t="Topik Trending" />
          <div className="grid grid-cols-2 gap-5">
            {cats.slice(0,4).map(c => {
              const arts = posts.filter(a => a.cat?.title === c.title).slice(0,4)
              if (!arts.length) return null
              return (
                <div key={c._id}>
                  <Link href={`${bp}?category=${c.slug}`} className="font-serif text-[15px] font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors">{c.title}</Link>
                  <div className="mt-2 space-y-1">
                    {arts.slice(0,4).map(a => (
                      <Link key={a._id} href={`${bp}${a.slug}`} className="block text-[11px] leading-snug text-[#1a1a1a]/70 hover:text-[#C41E3A] transition-colors py-1.5 border-b border-gray-100 last:border-0">{a.title}</Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Berita Mengikut Negeri */}
        <div>
          <SectionTitle t="Berita Mengikut Negeri" h={`${bp}?category=nasional`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['KL','Selangor','Johor','Sabah','Sarawak','N.Sembilan'].map(state => {
              const arts = posts.filter(a => a.cat?.title === state || a.title?.toLowerCase().includes(state.toLowerCase())).slice(0,2)
              return (
                <div key={state}>
                  <Link href={`${bp}?location=${state.toLowerCase()}`} className="font-serif text-[12px] font-bold text-[#1a1a1a] hover:text-[#C41E3A] transition-colors">{state}</Link>
                  {arts.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
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
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="space-y-6">
        {/* Popular / trending sidebar widget */}
        <div>
          <SectionTitle t="Paling Popular" />
          <div className="space-y-0">
            {rest.slice(10,16).map((a, i) => (
              <div key={a._id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <span className="shrink-0 font-serif text-[24px] font-bold text-[#C41E3A]/30 leading-none w-6">{String(i+1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <CatTag p={a} sz="text-[8px]" />
                  <Link href={`${bp}${a.slug}`} className="text-[12px] leading-snug font-serif text-[#1a1a1a] hover:text-[#C41E3A] transition-colors line-clamp-2 block">{a.title}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest articles mini */}
        <div>
          <SectionTitle t="Berita Lain" h={bp} />
          {rest.slice(16,20).map(a => <ArticleRow key={a._id} a={a} />)}
        </div>
      </aside>
    </div>

    {/* ═══════ #PILIHANRAYA BANNER ═══════ */}
    <section className="py-5 border-t border-gray-300">
      <div className="bg-gradient-to-r from-[#C41E3A] via-[#C41E3A] to-[#1a1a1a] rounded-lg p-6 sm:p-7 text-center">
        <span className="font-serif text-[24px] sm:text-[28px] font-bold text-white">#<span className="text-[#F5C842]">PILIHAN</span>RAYA</span>
        <p className="text-[11px] text-white/70 mt-1">Liputan eksklusif pilihan raya di Malaysia</p>
        <Link href="/election" className="inline-block mt-3 px-6 py-2 bg-[#F5C842] text-[#1a1a1a] text-[11px] font-bold rounded hover:bg-white transition-colors">Dashboard PRU16 →</Link>
      </div>
    </section>

    {/* ═══════ CTA ═══════ */}
    <section className="py-6 text-center border-t border-gray-300">
      <h2 className="font-serif text-[16px] font-bold text-[#1a1a1a]">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[11px] text-gray-500 mt-1 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Link href={bp} className="px-4 py-1.5 text-[11px] font-semibold text-white bg-[#C41E3A] rounded hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/tentang" className="px-4 py-1.5 text-[11px] font-semibold text-[#C41E3A] border border-[#C41E3A] rounded hover:bg-[#C41E3A] hover:text-white transition-colors">Tentang Kami</Link>
      </div>
    </section>

  </div>
  )
}