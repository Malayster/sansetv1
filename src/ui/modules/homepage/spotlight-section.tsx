import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead, NTime } from './nikkei-utils'

export function SpotlightSection({ title = 'Spotlight', tag = 'Sorotan', posts }: { title?: string; tag?: string; posts: P[] }) {
  if (!posts[0]) return null
  return <section className="bg-[#0a0a0a] text-white py-6 px-4 md:px-6 mb-4 -mx-4 md:mx-0 md:rounded">
    <div className="flex items-center gap-2 mb-4">
      <span className="bg-[#C41E3A] px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest">{tag}</span>
      <h2 className="font-serif text-xl font-bold">{title}</h2>
    </div>
    <div className="grid md:grid-cols-3 gap-5">
      {posts.slice(0, 3).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-2">
            {p.mainImage
              ? <Image src={urlFor(p.mainImage).width(293).height(165).url()} alt="" width={293} height={165} className="w-full object-cover" style={{ aspectRatio: '293/165' }} />
              : <div className="bg-white/5" style={{ aspectRatio: '293/165' }} />}
          </Link>
          <NHead p={p} sz="text-[14px]" cls="text-white hover:text-[#C41E3A]" />
          {p.excerpt && <p className="text-[11px] text-white/60 mt-1 line-clamp-2">{p.excerpt}</p>}
          <NTime p={p} />
        </article>
      ))}
    </div>
  </section>
}