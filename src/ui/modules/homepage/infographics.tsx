import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead } from './nikkei-utils'

export function Infographics({ posts }: { posts: P[] }) {
  if (!posts[0]) return null
  return <section className="mb-2 bg-[#f7f5f0] p-4 -mx-4 md:mx-0 md:rounded">
    <div className="flex items-baseline justify-between border-b border-[#13334f] pb-1 mb-3">
      <h2 className="font-serif text-[#13334f] font-bold text-base">Infografik</h2>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Analisis sepintas lalu</span>
    </div>
    <div className="grid md:grid-cols-3 gap-3">
      {posts.slice(0, 3).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-2">
            {p.mainImage
              ? <Image src={urlFor(p.mainImage).width(293).height(165).url()} alt="" width={293} height={165} className="w-full object-cover" style={{ aspectRatio: '293/165' }} />
              : <div className="bg-gray-200" style={{ aspectRatio: '293/165' }} />}
          </Link>
          <NHead p={p} sz="text-[13px]" />
          <Link href={`${bp}${p.slug}`} className="text-[10px] text-[#C41E3A] uppercase tracking-wider font-bold hover:underline">Klik untuk terokai →</Link>
        </article>
      ))}
    </div>
  </section>
}