import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead } from './nikkei-utils'

export function Datawatch({ posts }: { posts: P[] }) {
  const [main, ...rest] = posts
  if (!main) return null
  return <section className="mb-2">
    <div className="flex items-baseline justify-between border-b border-[#13334f] pb-1 mb-3">
      <h2 className="font-serif text-[#13334f] font-bold text-base">Datawatch</h2>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Analisis mendalam</span>
    </div>
    <div className="grid md:grid-cols-2 gap-5">
      <article>
        <Link href={`${bp}${main.slug}`} className="block overflow-hidden mb-2">
          {main.mainImage
            ? <Image src={urlFor(main.mainImage).width(512).height(288).url()} alt="" width={512} height={288} className="w-full object-cover" style={{ aspectRatio: '512/288' }} />
            : <div className="bg-gray-100" style={{ aspectRatio: '512/288' }} />}
        </Link>
        <NHead p={main} sz="text-[16px]" />
        {main.excerpt && <p className="text-[12px] text-gray-600 mt-1 line-clamp-2">{main.excerpt}</p>}
        <Link href={`${bp}${main.slug}`} className="inline-block text-[11px] text-[#C41E3A] font-bold uppercase tracking-widest mt-1.5 hover:underline">Terokai lebih lanjut →</Link>
      </article>
      <div className="flex flex-col gap-3">
        {rest.slice(0, 3).map(p => (
          <Link key={p._id} href={`${bp}${p.slug}`} className="group flex gap-3 items-start py-1.5 border-b border-gray-100 last:border-b-0">
            <div className="flex-1 min-w-0">
              <NHead p={p} sz="text-[13px]" plain />
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
}