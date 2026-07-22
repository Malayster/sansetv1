import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead } from './nikkei-utils'

export function TechAsiaBanner({ posts }: { posts: P[] }) {
  const [main, ...rest] = posts
  if (!main) return null
  return <section className="bg-[#13334f] text-white py-4 mb-2 -mx-4 md:mx-0 md:rounded">
    <div className="max-w-7xl md:mx-0 px-4 md:px-6">
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="font-serif text-2xl font-bold">#teknologiAsia</h2>
        <p className="text-[11px] text-white/70 uppercase tracking-wider">Dekod transformasi teknologi Asia</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <article>
          <Link href={`${bp}${main.slug}`} className="block overflow-hidden mb-2">
            {main.mainImage
              ? <Image src={urlFor(main.mainImage).width(512).height(288).url()} alt="" width={512} height={288} className="w-full object-cover" style={{ aspectRatio: '512/288' }} />
              : <div className="bg-white/10" style={{ aspectRatio: '512/288' }} />}
          </Link>
          <NHead p={main} sz="text-[18px]" cls="text-white hover:text-[#C41E3A]" />
          {main.excerpt && <p className="text-[13px] text-white/70 mt-1 line-clamp-2">{main.excerpt}</p>}
          <Link href={`${bp}${main.slug}`} className="inline-block text-[11px] text-[#C41E3A] font-bold uppercase tracking-widest mt-2 hover:underline">Ketahui lebih lanjut →</Link>
        </article>
        <div className="flex flex-col gap-3">
          {rest.slice(0, 3).map(p => (
            <Link key={p._id} href={`${bp}${p.slug}`} className="group flex gap-3 items-start py-2 border-b border-white/10 last:border-b-0">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#C41E3A] uppercase tracking-wide font-bold mb-0.5">Teknologi</p>
                <h4 className="font-serif text-[14px] font-bold leading-snug text-white group-hover:text-[#C41E3A] transition-colors line-clamp-2">{p.title}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </section>
}