import Link from 'next/link'
import { P, bp, NImg, NTag, NHead, NTime, NSec } from './nikkei-utils'

export function EditorsPicks({ posts }: { posts: P[] }) {
  if (posts.length < 4) return null

  return <section>
    <NSec title="Pilihan Editor" href={`${bp}`} />
    {/* Spotlight card + 3 grid */}
    <article className="flex flex-col sm:flex-row gap-3 mb-3">
      <div className="sm:w-[304px] shrink-0">
        <Link href={`${bp}${posts[0].slug}`} className="block overflow-hidden"><NImg p={posts[0]} w={304} h={171} /></Link>
      </div>
      <div>
        <NTag p={posts[0]} sz="text-[11px]" />
        <Link href={`${bp}${posts[0].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-0.5 text-[#111] hover:text-[#C41E3A] transition-colors">{posts[0].title}</h3></Link>
        {posts[0].excerpt && <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{posts[0].excerpt}</p>}
        <NTime p={posts[0]} />
      </div>
    </article>
    <div className="grid md:grid-cols-3 gap-3">
      {posts.slice(1, 4).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1"><NImg p={p} w={293} h={165} /></Link>
          <NTag p={p} link={false} />
          <NHead p={p} />
          <NTime p={p} />
        </article>
      ))}
    </div>
  </section>
}
