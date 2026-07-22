import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead, NTag } from './nikkei-utils'

export function SponsoredContent({ posts }: { posts: P[] }) {
  if (!posts.length) return null
  return <section className="mb-4 border border-gray-200">
    {/* Label bar */}
    <div className="bg-gray-50 px-3 py-1.5 flex items-center justify-between border-b border-gray-200 flex-wrap gap-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kandungan Tajaan</span>
      <span className="text-[9px] text-gray-400 hidden sm:block">Tentang Kandungan Tajaan — Kandungan ini dipesan oleh Biro Perniagaan Global Nikkei</span>
    </div>
    {/* 3-col card grid */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {posts.slice(0, 3).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-2">
            {p.mainImage
              ? <Image src={urlFor(p.mainImage).width(380).height(214).url()} alt="" width={380} height={214} className="w-full object-cover" style={{ aspectRatio: '380/214' }} />
              : <div className="bg-gray-100" style={{ aspectRatio: '380/214' }} />}
          </Link>
          <NTag p={p} sz="text-[10px]" link={false} />
          <NHead p={p} sz="text-[14px]" />
          <Link href={`${bp}${p.slug}`} className="inline-block text-[10px] text-[#C41E3A] font-bold uppercase tracking-widest mt-1 hover:underline">Terokai lebih lanjut →</Link>
        </article>
      ))}
    </div>
  </section>
}