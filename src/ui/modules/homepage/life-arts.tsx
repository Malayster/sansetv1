import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead, NTime, NSec } from './nikkei-utils'

export function LifeArts({ posts }: { posts: P[] }) {
  if (!posts[0]) return null
  return <section className="mb-4">
    <NSec title="Gaya Hidup & Seni" href={`${bp}?category=Hiburan`} />
    <div className="grid md:grid-cols-4 gap-4">
      {posts.slice(0, 4).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-2">
            {p.mainImage
              ? <Image src={urlFor(p.mainImage).width(293).height(165).url()} alt="" width={293} height={165} className="w-full object-cover" style={{ aspectRatio: '293/165' }} />
              : <div className="bg-gray-100" style={{ aspectRatio: '293/165' }} />}
          </Link>
          <NHead p={p} sz="text-[13px]" />
          <NTime p={p} />
        </article>
      ))}
    </div>
  </section>
}