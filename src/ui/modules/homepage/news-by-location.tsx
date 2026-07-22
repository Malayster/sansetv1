import Link from 'next/link'
import { P, bp, NTime, NSec, NDiv } from './nikkei-utils'

const LOCATIONS = [
  { name: 'Nasional', slug: 'nasional' },
  { name: 'Dunia', slug: 'dunia' },
  { name: 'Politik', slug: 'politik' },
  { name: 'Ekonomi', slug: 'ekonomi' },
  { name: 'Sukan', slug: 'sukan' },
  { name: 'Teknologi', slug: 'teknologi' },
  { name: 'Hiburan', slug: 'hiburan' },
  { name: 'Pendidikan', slug: 'pendidikan' },
]

export function NewsByLocation({ posts }: { posts: P[] }) {
  return <>
    <section className="py-4">
      <NSec title="Berita Mengikut Kategori" />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {LOCATIONS.map(loc => {
          const items = posts.filter(p => p.category?.slug?.current === loc.slug || p.category?.title === loc.name)
          if (!items.length) return null
          return <div key={loc.name} className="border border-gray-100 p-3">
            <Link href={`${bp}?category=${loc.slug}`} className="font-serif text-sm font-bold text-[#111] hover:text-[#C41E3A] transition-colors">{loc.name}</Link>
            <div className="mt-2 divide-y divide-gray-100">
              {items.slice(0, 2).map(a => (
                <div key={a._id} className="py-1.5 first:pt-0 last:pb-0">
                  <Link href={`${bp}${a.slug}`} className="text-[12px] leading-snug text-gray-700 hover:text-[#C41E3A] transition-colors line-clamp-2">{a.title}</Link>
                  <NTime p={a} />
                </div>
              ))}
            </div>
          </div>
        })}
      </div>
    </section>
    <NDiv />
  </>
}
