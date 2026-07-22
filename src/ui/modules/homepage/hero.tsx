import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NImg, NTag, NHead, NTime, NDiv } from './nikkei-utils'

export function Hero({ posts }: { posts: P[] }) {
  const [a, ...rest] = posts
  if (!a) return null

  return <section className="grid lg:grid-cols-[1fr_300px_300px] gap-5 py-5">
    {/* ── Main hero article (620px) ── */}
    <article>
      <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-2"><NImg p={a} w={620} h={349} prio /></Link>
      <NTag p={a} sz="text-[11px]" />
      <Link href={`${bp}${a.slug}`}><h1 className="font-serif text-[22px] md:text-[26px] font-bold leading-tight mt-1 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{a.title}</h1></Link>
      {a.excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{a.excerpt}</p>}
      <NTime p={a} />
    </article>

    {/* ── Middle: 4 articles with thumbnails (294×165) ── */}
    <div className="flex flex-col gap-4">
      {rest.slice(0, 4).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1">
            {p.mainImage ? <Image src={urlFor(p.mainImage).width(294).height(165).url()} alt="" width={294} height={165} className="w-full object-cover" style={{ aspectRatio: '294/165' }} />
            : <div className="bg-gray-100" style={{ aspectRatio: '294/165' }} />}
          </Link>
          <NTag p={p} link={false} />
          <NHead p={p} sz="text-[13px]" />
          <NTime p={p} />
        </article>
      ))}
    </div>
  </section>
}
