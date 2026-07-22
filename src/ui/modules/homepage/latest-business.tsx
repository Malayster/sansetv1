import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NTag, NHead, NTime, NSec } from './nikkei-utils'

export function LatestBusiness({ posts }: { posts: P[] }) {
  if (!posts[0]) return null
  return <section className="mb-2">
    <NSec title="Berita Bisnes Terkini" href={`${bp}?category=Ekonomi`} />
    <div className="grid lg:grid-cols-[1fr_1fr_300px] gap-5">
      {/* Large lead */}
      <article>
        <Link href={`${bp}${posts[0].slug}`} className="block overflow-hidden mb-2">
          {posts[0].mainImage
            ? <Image src={urlFor(posts[0].mainImage).width(512).height(288).url()} alt="" width={512} height={288} className="w-full object-cover" style={{ aspectRatio: '512/288' }} />
            : <div className="bg-gray-100" style={{ aspectRatio: '512/288' }} />}
        </Link>
        <NTag p={posts[0]} sz="text-[11px]" />
        <NHead p={posts[0]} sz="text-[18px]" />
        {posts[0].excerpt && <p className="text-[12px] text-gray-600 mt-1 line-clamp-2">{posts[0].excerpt}</p>}
        <NTime p={posts[0]} />
      </article>

      {/* Middle: 4 small list */}
      <div className="flex flex-col divide-y divide-gray-100">
        {posts.slice(1, 5).map(p => (
          <article key={p._id} className="py-2 first:pt-0">
            <NTag p={p} sz="text-[10px]" />
            <NHead p={p} sz="text-[13px]" />
            <NTime p={p} />
          </article>
        ))}
      </div>

      {/* Right rail: small bullet list */}
      <div className="bg-[#f7f5f0] p-3">
        <h3 className="text-[10px] font-bold text-[#13334f] uppercase tracking-widest mb-2 border-b border-[#13334f] pb-1">Tajuk Bisnes</h3>
        <ul className="space-y-2">
          {posts.slice(5, 10).map((p, i) => (
            <li key={p._id} className="flex gap-2 items-start">
              <span className="font-serif text-[10px] text-[#C41E3A] font-bold mt-0.5">{i + 1}.</span>
              <Link href={`${bp}${p.slug}`} className="text-[11px] leading-snug text-gray-800 hover:text-[#C41E3A] line-clamp-2">{p.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
}