import Link from 'next/link'
import { P, bp, NTime, NSideH } from './nikkei-utils'

export function LatestHeadlines({ posts }: { posts: P[] }) {
  return <div className="flex flex-col">
    <NSideH title="Tajuk Utama Terkini" href={`${bp}`} />
    <div className="flex flex-col gap-2.5 pt-1">
      {posts.slice(0, 14).map((p, i) => (
        <article key={p._id} className="flex gap-2 items-start py-1.5 border-b border-gray-100 last:border-b-0">
          <span className="font-serif text-[10px] text-[#C41E3A] font-bold mt-0.5 shrink-0 w-5">{String(i + 1)}</span>
          <div className="flex-1 min-w-0">
            <Link href={`${bp}${p.slug}`} className="text-[12px] leading-snug text-gray-800 hover:text-[#C41E3A] transition-colors line-clamp-3">{p.title}</Link>
            <NTime p={p} />
          </div>
        </article>
      ))}
    </div>
  </div>
}