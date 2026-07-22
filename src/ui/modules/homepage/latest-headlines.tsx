import Link from 'next/link'
import { P, bp, NTime, NTag } from './nikkei-utils'

export function LatestHeadlines({ posts }: { posts: P[] }) {
  return <section>
    <div className="flex items-center gap-1.5 mb-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 13 13" className="text-[#C41E3A]"><path fill="currentColor" d="M6.5 0a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/><path fill="currentColor" d="M7 3H6v4h4v-.976L7 6z"/></svg>
      <Link href={`${bp}`} className="text-[13px] font-bold text-gray-800 font-serif hover:text-[#C41E3A] transition-colors">Tajuk Utama Terkini</Link>
    </div>
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-0.5">
      {posts.slice(6, 20).map((p, i) => (
        <article key={p._id} className="flex items-start gap-2.5 py-1.5 border-b border-gray-100">
          <span className="text-[12px] font-bold text-gray-400 mt-0.5">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <NTag p={p} sz="text-[10px]" />
            <Link href={`${bp}${p.slug}`} className="text-[12px] text-gray-800 leading-snug line-clamp-2 hover:text-[#C41E3A] transition-colors">{p.title}</Link>
            <NTime p={p} />
          </div>
        </article>
      ))}
    </div>
  </section>
}