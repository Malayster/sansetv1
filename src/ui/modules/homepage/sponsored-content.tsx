import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NHead } from './nikkei-utils'

export function SponsoredContent({ posts }: { posts: P[] }) {
  if (!posts[0]) return null
  return <section className="mb-4 border border-gray-200">
    <div className="bg-gray-50 px-3 py-1.5 flex items-center justify-between border-b border-gray-200">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kandungan Tajaan</span>
      <span className="text-[9px] text-gray-400">Diarahkan oleh Biro Perniagaan Global Nikkei</span>
    </div>
    <div className="grid md:grid-cols-2 gap-4 p-4">
      <Link href={`${bp}${posts[0].slug}`} className="block overflow-hidden">
        {posts[0].mainImage
          ? <Image src={urlFor(posts[0].mainImage).width(512).height(288).url()} alt="" width={512} height={288} className="w-full object-cover" style={{ aspectRatio: '512/288' }} />
          : <div className="bg-gray-100" style={{ aspectRatio: '512/288' }} />}
      </Link>
      <div>
        <NHead p={posts[0]} sz="text-[16px]" />
        {posts[0].excerpt && <p className="text-[12px] text-gray-600 mt-1 line-clamp-3">{posts[0].excerpt}</p>}
        <Link href={`${bp}${posts[0].slug}`} className="inline-block text-[11px] text-[#C41E3A] font-bold uppercase tracking-widest mt-2 hover:underline">Baca lebih lanjut →</Link>
      </div>
    </div>
  </section>
}