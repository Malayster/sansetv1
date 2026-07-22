import Link from 'next/link'
import { P, bp, NImg, NSec, NDiv } from './nikkei-utils'

export function PageWideBanner({ title, tag, subtag, href, posts }: { title: string; tag: string; subtag?: string; href: string; posts: P[] }) {
  const p = posts[0]
  if (!p) return null

  return <>
    <section className="py-4 grid lg:grid-cols-[1fr_300px] gap-5 items-center">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-[304px] shrink-0">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden"><NImg p={p} w={304} h={171} /></Link>
        </div>
        <div className="flex flex-col justify-center">
          <Link href={href} className="font-serif text-[#C41E3A] font-bold text-base hover:opacity-80">{tag}</Link>
          <Link href={`${bp}${p.slug}`} className="font-serif text-[18px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{p.title}</Link>
          {p.excerpt && <p className="text-[13px] text-gray-500 mt-1.5">{p.excerpt}</p>}
          <Link href={`${bp}${p.slug}`} className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#C41E3A] hover:opacity-80">
            Ketahui lebih lanjut <span className="text-lg leading-none">→</span>
          </Link>
          {subtag && <p className="text-[11px] text-gray-400 mt-2">{subtag}</p>}
        </div>
      </div>
      <aside><div className="bg-gray-50 p-4 text-center text-xs text-gray-400">Iklan</div></aside>
    </section>
    <NDiv />
  </>
}

export function LifeArts({ posts }: { posts: P[] }) {
  if (posts.length < 4) return null
  return <>
    <section className="py-4">
      <NSec title="Gaya Hidup" href={`${bp}?category=Hiburan`} />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div>
          <article className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="sm:w-[304px] shrink-0">
              <Link href={`${bp}${posts[0].slug}`} className="block overflow-hidden"><NImg p={posts[0]} w={304} h={171} /></Link>
            </div>
            <div>
              <Link href={`${bp}${posts[0].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors">{posts[0].title}</h3></Link>
              {posts[0].excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{posts[0].excerpt}</p>}
            </div>
          </article>
          <div className="grid md:grid-cols-3 gap-4">
            {posts.slice(1, 4).map(p => (
              <article key={p._id} className="group">
                <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1.5"><NImg p={p} w={293} h={165} /></Link>
                <Link href={`${bp}${p.slug}`}><h4 className="font-serif font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors text-[13px]">{p.title}</h4></Link>
              </article>
            ))}
          </div>
        </div>
        <aside>
          <div className="font-serif text-[#C41E3A] font-bold text-base mb-3">Kategori Popular</div>
          <div className="flex flex-wrap gap-1.5">
            {['Nasional','Politik','Ekonomi','Dunia','Teknologi','Sukan','Hiburan'].map(c => (
              <Link key={c} href={`${bp}?category=${c}`} className="px-2.5 py-1 text-[10px] bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#C41E3A] hover:border-[#C41E3A] transition-colors">{c}</Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
    <NDiv />
  </>
}
