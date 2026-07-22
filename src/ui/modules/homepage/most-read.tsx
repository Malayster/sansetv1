import Link from 'next/link'
import { P, bp } from './nikkei-utils'

export function MostRead({ posts }: { posts: P[] }) {
  const list = posts.slice(6, 12)
  return <div className="bg-[#f7f5f0] p-4 -mx-4 md:mx-0 md:rounded">
    <h3 className="font-serif text-[#C41E3A] font-bold text-base mb-3 border-b border-[#C41E3A] pb-1.5">Paling Baca</h3>
    <ol className="space-y-0">
      {list.map((p, i) => (
        <li key={p._id} className="flex items-start gap-3 py-2 border-b border-gray-200 last:border-b-0">
          <span className="font-serif text-[22px] font-bold text-[#C41E3A]/30 leading-none mt-0.5 shrink-0 w-6">{i + 1}</span>
          <Link href={`${bp}${p.slug}`} className="text-[12px] leading-snug text-gray-800 hover:text-[#C41E3A] transition-colors line-clamp-3">{p.title}</Link>
        </li>
      ))}
    </ol>
  </div>
}