import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead } from './nikkei-utils'

export function EventReports({ posts }: { posts: P[] }) {
  if (!posts[0]) return null
  return <section className="mb-4 bg-[#13334f] text-white p-4 -mx-4 md:mx-0 md:rounded">
    <div className="flex items-baseline justify-between border-b border-white/20 pb-2 mb-3">
      <h2 className="font-serif text-lg font-bold">Laporan Acara</h2>
      <span className="text-[10px] text-white/60 uppercase tracking-wider">Sorotan & wawasan dari acara Nikkei</span>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      {posts.slice(0, 3).map(p => (
        <article key={p._id} className="group">
          <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-2">
            {p.mainImage
              ? <Image src={urlFor(p.mainImage).width(293).height(165).url()} alt="" width={293} height={165} className="w-full object-cover" style={{ aspectRatio: '293/165' }} />
              : <div className="bg-white/10" style={{ aspectRatio: '293/165' }} />}
          </Link>
          <NHead p={p} sz="text-[13px]" cls="text-white hover:text-[#C41E3A]" />
          <p className="text-[10px] text-white/50 mt-0.5">Diterbitkan oleh jabatan komersial Nikkei</p>
        </article>
      ))}
    </div>
  </section>
}