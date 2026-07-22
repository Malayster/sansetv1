import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { P, bp, NTime, NSec } from './nikkei-utils'

const LOCATIONS = [
  { name: 'Sabah', slug: 'sabah' },
  { name: 'Sarawak', slug: 'sarawak' },
  { name: 'Pulau Pinang', slug: 'penang' },
  { name: 'Johor', slug: 'johor' },
  { name: 'Selangor', slug: 'selangor' },
  { name: 'Kelantan', slug: 'kelantan' },
  { name: 'Terengganu', slug: 'terengganu' },
  { name: 'Kedah', slug: 'kedah' },
  { name: 'Perak', slug: 'perak' },
  { name: 'Pahang', slug: 'pahang' },
  { name: 'Negeri Sembilan', slug: 'negeri-sembilan' },
  { name: 'Melaka', slug: 'melaka' },
]

export function NewsByLocation({ posts }: { posts: P[] }) {
  return <section className="py-4">
    <NSec title="Berita Mengikut Negeri" />
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {LOCATIONS.map(loc => {
        const items = posts.filter(p =>
          (p.location && (p.location === loc.name || p.location?.current === loc.slug)) ||
          (p.category?.slug?.current === loc.slug || p.category?.title === loc.name)
        )
        const img = items[0]
        return <div key={loc.name} className="border border-gray-100 bg-white flex flex-col h-full">
          <div className="relative overflow-hidden" style={{ aspectRatio: '293/165' }}>
            {img?.mainImage
              ? <Image src={urlFor(img.mainImage).width(293).height(165).url()} alt="" width={293} height={165} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gray-200" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2">
              <Link href={`${bp}?location=${loc.slug}`} className="font-serif text-sm font-bold text-white hover:underline">{loc.name}</Link>
            </div>
          </div>
          <div className="flex-1 flex flex-col divide-y divide-gray-100 px-2 pb-2">
            {items.slice(0, 3).map(a => (
              <div key={a._id} className="py-1.5 first:pt-2 last:pb-0">
                <Link href={`${bp}${a.slug}`} className="text-[12px] leading-snug text-gray-700 hover:text-[#C41E3A] transition-colors line-clamp-2">{a.title}</Link>
                <NTime p={a} />
              </div>
            ))}
            {items.length === 0 && <p className="py-2 text-[11px] text-gray-400 italic">Tiada berita untuk {loc.name}</p>}
          </div>
        </div>
      })}
    </div>
  </section>
}
