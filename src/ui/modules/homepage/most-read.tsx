import Link from 'next/link'
import { P, bp, NTag } from './nikkei-utils'

export function MostRead({ posts }: { posts: P[] }) {
  const list = posts.slice(6, 12)
  return <section>
    <h3 className="text-[13px] font-bold text-gray-800 font-serif mb-3 border-b border-gray-200 pb-1.5">Paling Baca</h3>
    <ol className="space-y-0">
      {list.map((p, i) => (
        <li key={p._id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
          <span className="font-serif text-[32px] font-bold text-[#C41E3A]/20 leading-none mt-0 shrink-0 w-8 text-center">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <NTag p={p} sz="text-[9px]" />
            <Link href={`${bp}${p.slug}`} className="text-[14px] leading-snug font-serif text-gray-800 hover:text-[#C41E3A] transition-colors line-clamp-2">{p.title}</Link>
          </div>
        </li>
      ))}
    </ol>
  </section>
}