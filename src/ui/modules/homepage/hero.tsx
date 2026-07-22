import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NImg, NTag, NHead, NTime, NDiv } from './nikkei-utils'

export function Hero({ posts }: { posts: P[] }) {
  const [a, ...rest] = posts
  if (!a) return null

  return <section className="grid lg:grid-cols-[1fr_300px_300px] gap-5 py-3">
    {/* COL 1: Main hero article */}
    <article>
      <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-2"><NImg p={a} w={620} h={349} prio /></Link>
      <NTag p={a} sz="text-[11px]" />
      <Link href={`${bp}${a.slug}`}><h1 className="font-serif text-[22px] md:text-[26px] font-bold leading-tight mt-1 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{a.title}</h1></Link>
      {a.excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{a.excerpt}</p>}
      <NTime p={a} />
    </article>

    {/* COL 2: 4 article thumbnails */}
    <div className="flex flex-col gap-3">
      {rest.slice(0, 4).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1">
            {p.mainImage ? <Image src={urlFor(p.mainImage).width(294).height(165).url()} alt="" width={294} height={165} className="w-full object-cover" style={{ aspectRatio: '294/165' }} />
            : <div className="bg-gray-100" style={{ aspectRatio: '294/165' }} />}
          </Link>
          <NTag p={p} link={false} />
          <NHead p={p} sz="text-[12px]" />
          <NTime p={p} />
        </article>
      ))}
    </div>

    {/* COL 3: Latest Headlines (numbered list with clock icons) */}
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 mb-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 13 13" className="text-[#C41E3A]"><path fill="currentColor" d="M6.5 0a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/><path fill="currentColor" d="M7 3H6v4h4v-.976L7 6z"/></svg>
        <Link href={`${bp}`} className="text-[13px] font-bold text-gray-800 font-serif hover:text-[#C41E3A] transition-colors">Tajuk Utama Terkini</Link>
      </div>
      <div className="flex flex-col gap-1.5">
        {rest.slice(5, 19).map((p, i) => (
          <div key={p._id} className="flex items-start gap-2 py-1 border-b border-gray-100 last:border-b-0">
            <span className="text-[12px] font-bold text-gray-400 min-w-[16px]">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <Link href={`${bp}${p.slug}`} className="text-[11px] text-gray-800 leading-snug line-clamp-2 hover:text-[#C41E3A] transition-colors">{p.title}</Link>
              <NTime p={p} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
}
