import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NTime, NSec } from './nikkei-utils'

function TopicBlock({ cat, posts }: { cat: any; posts: P[] }) {
  const filtered = posts.filter(p => p.category?.title === cat.title)
  const img = filtered[0]

  return <div className="group flex flex-col h-full bg-white border border-gray-100">
    <div className="relative overflow-hidden" style={{ aspectRatio: '293/165' }}>
      {img?.mainImage ? <Image src={urlFor(img.mainImage).width(293).height(165).url()} alt="" width={293} height={165} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-2 left-2 right-2">
        <Link href={`${bp}?category=${cat.slug}`} className="font-serif text-sm font-bold text-white hover:underline underline-offset-2 line-clamp-1 block">{cat.title}</Link>
      </div>
    </div>
    <div className="flex-1 flex flex-col divide-y divide-gray-100 px-2 pb-2">
      {filtered.slice(0, 3).map(a => (
        <div key={a._id} className="py-1.5 first:pt-2 last:pb-0">
          <Link href={`${bp}${a.slug}`} className="font-serif text-[12px] font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-2">{a.title}</Link>
          <NTime p={a} />
        </div>
      ))}
      {filtered.length === 0 && <p className="py-2 text-[11px] text-gray-400 italic">Tiada artikel</p>}
    </div>
  </div>
}

export function TrendingTopics({ posts, cats }: { posts: P[]; cats: any[] }) {
  if (!cats.length) return null
  return <section className="py-4">
    <NSec title="Topik Trending" />
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cats.slice(0, 8).map(c => <TopicBlock key={c._id} cat={c} posts={posts} />)}
    </div>
  </section>
}
