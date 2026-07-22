import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import NewsGridClient from '@/ui/modules/blog.grid.client'

type Post = {
  _id: string; title?: string; excerpt?: string; publishDate?: string
  readTime?: number; mainImage?: any; slug?: string
  category?: { title: string; color?: string }
}

export default async function BlogGrid({
  heading, perPage = 12, categoryFilter,
}: {
  heading?: string; perPage?: number; categoryFilter?: { _ref: string }
  _key?: string; _type?: string
}) {
  const catRef = categoryFilter?._ref
  const params: Record<string, any> = { perPage: perPage + 1 }
  if (catRef) params.catRef = catRef
  const filter = catRef ? ' && references($catRef)' : ''

  const posts = await client.fetch<Post[]>(
    groq`*[_type == 'blog.post' && featured != true && status in ['published','approved']${filter}] | order(publishDate desc) [0...$perPage]{
      _id, title, excerpt, publishDate, readTime,
      'mainImage': metadata.image, 'slug': metadata.slug.current,
      'category': categories[0]->{title, color}
    }`, params, { next: { revalidate: 60 } })

  if (!posts?.length) return null
  const hasMore = posts.length > perPage
  const display = hasMore ? posts.slice(0, perPage) : posts

  return (
    <section className="section">
      {heading && <h2 className="text-xl font-bold border-l-4 border-merah pl-3 mb-6 uppercase tracking-wide text-foreground">{heading}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {display.map((p) => {
          const s = p.slug ? `/berita/${p.slug}` : '#'
          return (
            <article key={p._id} className="group bg-putih dark:bg-hitam-muda border-b border-kelabu dark:border-putih/10 pb-5">
              <Link href={s} className="block overflow-hidden mb-3">
                {p.mainImage ? (
                  <Image src={urlFor(p.mainImage).width(400).height(225).url()} alt={p.title ?? ''} width={400} height={225}
                    className="w-full aspect-video object-cover rounded-sm group-hover:opacity-90 transition-opacity" />
                ) : (
                  <div className="w-full aspect-video bg-abu dark:bg-hitam rounded-sm flex items-center justify-center text-kelabu-gelap text-xs">Tiada Imej</div>
                )}
              </Link>
              {p.category && (
                <span className="inline-block text-[11px] font-semibold uppercase text-white px-2 py-0.5 rounded-sm mb-2" style={{ backgroundColor: p.category.color || '#C41E3A' }}>
                  {p.category.title}
                </span>
              )}
              <Link href={s}>
                <h3 className="font-bold text-[18px] leading-snug line-clamp-3 group-hover:text-merah transition-colors">{p.title}</h3>
              </Link>
              {p.excerpt && <p className="text-sm text-kelabu-gelap dark:text-putih/50 mt-1.5 line-clamp-2">{p.excerpt}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-kelabu-gelap dark:text-putih/40">
                {p.publishDate && <time>{new Date(p.publishDate).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
                {p.readTime != null && <span>{p.readTime} min bacaan</span>}
              </div>
            </article>
          )
        })}
      </div>
      {hasMore && <NewsGridClient perPage={perPage} categoryFilterRef={catRef} blogDir="/berita" />}
    </section>
  )
}
