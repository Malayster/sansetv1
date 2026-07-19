import { groq } from 'next-sanity'
import Link from 'next/link'
import { ROUTES } from '@/lib/env'
import { client } from '@/sanity/lib/client'
import type { BLOG_POST_LIST_QUERY_RESULT, BlogCategory } from '@/sanity/types'

const CATEGORIES_QUERY = groq`*[_type == 'blog.category']|order(title){_id, title, slug}`

const POPULAR_QUERY = groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...8]{
  _id, title,
  metadata{slug},
  'slug': $blogDir + metadata.slug.current,
  categories[]->{title, slug}
}`

export default async function ArticleSidebar({ currentCategory }: { currentCategory?: string }) {
  const blogDir = `/${ROUTES.blog}/`
  const [categories, popular] = await Promise.all([
    client.fetch<{ _id: string; title: string; slug: { current: string } }[]>(CATEGORIES_QUERY),
    client.fetch<BLOG_POST_LIST_QUERY_RESULT>(POPULAR_QUERY, { blogDir }),
  ])

  return (
    <aside className="md:sticky-below-header md:w-[240px] shrink-0 space-y-5 [--offset:1rem] max-md:hidden">
      {/* ====== KATEGORI ====== */}
      <div className="border border-kelabu/60 rounded-lg overflow-hidden">
        <h4 className="bg-merah text-putih font-bold text-sm uppercase px-4 py-2.5 tracking-wide">
          📂 Kategori
        </h4>
        <div className="p-3">
          <ul className="space-y-0.5">
            {categories.slice(0, 15).map(cat => (
              <li key={cat._id}>
                <Link
                  href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
                  className={`block px-2 py-1.5 text-[13px] rounded transition-colors border-l-[3px] ${
                    currentCategory === cat.slug?.current
                      ? 'border-merah text-merah font-semibold bg-merah/5'
                      : 'border-transparent text-hitam-muda hover:text-merah hover:bg-abu'
                  }`}
                >
                  {cat.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ====== BERITA POPULAR ====== */}
      <div className="border border-kelabu/60 rounded-lg overflow-hidden">
        <h4 className="bg-hitam text-putih font-bold text-sm uppercase px-4 py-2.5 tracking-wide">
          🔥 Berita Popular
        </h4>
        <div className="p-3">
          <ol className="space-y-3">
            {popular.slice(0, 5).map((post, i) => (
              <li key={post._id} className="flex gap-2.5">
                <span className={`text-lg font-bold leading-none shrink-0 w-5 text-center ${
                  i < 3 ? 'text-merah' : 'text-hitam-muda/40'
                }`}>
                  {i + 1}
                </span>
                <Link href={post.slug} className="text-[12px] leading-snug text-hitam hover:text-merah transition-colors line-clamp-2">
                  {post.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ====== MARQUEE HEADLINE ====== */}
      <div className="border border-merah/30 rounded-lg overflow-hidden">
        <div className="bg-merah text-putih font-bold text-[11px] uppercase px-3 py-1.5 tracking-widest text-center">
          ⚡ TERGEMPAR
        </div>
        <div className="bg-[#fff8f8] overflow-hidden h-[120px]">
          <div className="animate-marquee-up p-3 space-y-2.5">
            {popular.map(post => (
              <Link key={post._id} href={post.slug} className="block group">
                <p className="text-[11px] leading-snug text-hitam group-hover:text-merah transition-colors line-clamp-2 font-medium">
                  {post.title}
                </p>
                <span className="text-[10px] text-kelabu-gelap">
                  {(post.categories as unknown as BlogCategory[])?.[0]?.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ====== TAG POPULAR ====== */}
      <div className="border border-kelabu/60 rounded-lg overflow-hidden">
        <h4 className="bg-hitam text-putih font-bold text-xs uppercase px-4 py-2.5 tracking-wide">
          🏷️ Tag Popular
        </h4>
        <div className="p-3 flex flex-wrap gap-1.5">
          {categories.slice(0, 12).map(cat => (
            <Link
              key={cat._id}
              href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
              className="px-2 py-0.5 text-[10px] bg-abu border border-kelabu/60 text-hitam-muda hover:text-merah hover:border-merah transition-colors rounded-sm"
            >
              {cat.title}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
