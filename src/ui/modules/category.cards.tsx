import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'

const QUERY = groq`*[_type == 'blog.category' && slug.current in ["agenda-kerajaan", "politik", "dalam-negeri", "pilihan-raya"]] | order(title asc) {
  title, color, description, 'slug': slug.current
}`

type Cat = { title: string; color?: string; description?: string; slug: string }

export default async function CategoryCards({ heading }: { heading?: string; _key?: string; _type?: string }) {
  const cats = await client.fetch<Cat[]>(QUERY, {}, { next: { revalidate: 300 } })
  if (!cats?.length) return null
  return (
    <section className="section">
      {heading && <h2 className="text-xl font-bold border-l-4 border-merah pl-3 mb-6 uppercase tracking-wide text-foreground">{heading}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cats.map((c) => (
          <Link key={c.slug} href={`/kategori/${c.slug}`}
            className="group block border border-kelabu dark:border-putih/10 rounded p-5 bg-putih dark:bg-hitam-muda transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: c.color ? c.color : undefined }}
          >
            <div className="text-sm font-bold mb-1.5" style={{ color: c.color || '#1A1A1A' }}>{c.title}</div>
            {c.description && <p className="text-xs text-kelabu-gelap dark:text-putih/50 line-clamp-2">{c.description}</p>}
          </Link>
        ))}
      </div>
    </section>
  )
}
