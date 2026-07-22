import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NImg, NTag, NHead, NTime, NDiv } from './nikkei-utils'

export function Hero({ posts }: { posts: P[] }) {
  const [a, ...rest] = posts
  if (!a) return null

  return <section className="grid grid-cols-[1fr_280px] gap-5 py-0">
    {/* Main hero article */}
    <article>
      <Link href={`${bp}${a.slug}`} className="block overflow-hidden mb-2"><NImg p={a} w={780} h={439} prio /></Link>
      <NTag p={a} sz="text-[11px]" />
      <Link href={`${bp}${a.slug}`}><h1 className="font-serif text-[20px] md:text-[24px] font-bold leading-tight mt-1 text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3">{a.title}</h1></Link>
      {a.excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{a.excerpt}</p>}
      <NTime p={a} />
    </article>

    {/* Side: 4 articles with thumbnails */}
    <div className="flex flex-col gap-3">
      {rest.slice(0, 4).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1">
            {p.mainImage ? <Image src={urlFor(p.mainImage).width(280).height(158).url()} alt="" width={280} height={158} className="w-full object-cover" style={{ aspectRatio: '280/158' }} />
            : <div className="bg-gray-100" style={{ aspectRatio: '280/158' }} />}
          </Link>
          <NTag p={p} link={false} />
          <NHead p={p} sz="text-[12px]" />
          <NTime p={p} />
        </article>
      ))}
    </div>
  </section>
}
