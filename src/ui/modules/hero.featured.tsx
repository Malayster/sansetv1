import { groq } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

const QUERY = groq`*[_type == 'blog.post' && featured == true && isBreakingNews != true] | order(publishDate desc) [0]{
  title,
  'category': categories[0]->{title, color},
  'mainImage': metadata.image,
  excerpt,
  publishDate,
  readTime,
  'slug': metadata.slug.current
}`

type Post = {
  title?: string
  category?: { title: string; color?: string }
  mainImage?: any
  excerpt?: string
  publishDate?: string
  readTime?: number
  slug?: string
}

export default async function HeroFeatured({
  heading,
  ...props
}: {
  heading?: string
  _key?: string
  _type?: string
}) {
  const post = await client.fetch<Post | null>(QUERY, {}, { next: { revalidate: 60 } })
  if (!post) return null

  const slug = post.slug ? `/berita/${post.slug}` : '#'

  return (
    <section className="section !pt-4">
      {heading && (
        <h2 className="text-xl font-bold border-l-4 border-merah pl-3 mb-4 uppercase tracking-wide text-foreground">
          {heading}
        </h2>
      )}
      <Link href={slug} className="group block relative overflow-hidden max-h-[500px] rounded">
        {post.mainImage ? (
          <Image
            src={urlFor(post.mainImage).width(1280).height(500).url()}
            alt={post.title ?? ''}
            width={1280}
            height={500}
            sizes="100vw"
            className="w-full max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
            priority
          />
        ) : (
          <div className="w-full h-[400px] bg-hitam-muda flex items-center justify-center text-putih/40 text-sm">
            Tiada Imej
          </div>
        )}
        {/* Bottom gradient overlay only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          {post.category && (
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-sm mb-3"
              style={{ backgroundColor: post.category.color || '#C41E3A' }}
            >
              {post.category.title}
            </span>
          )}
          <h1 className="text-white font-bold text-2xl md:text-[30px] leading-tight line-clamp-3">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-white/70 text-sm md:text-base mt-2 line-clamp-2 max-w-2xl">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3 text-white/50 text-xs">
            {post.publishDate && (
              <time dateTime={post.publishDate}>
                {new Date(post.publishDate).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            )}
            {post.readTime != null && (
              <span>{post.readTime} min bacaan</span>
            )}
          </div>
        </div>
      </Link>
    </section>
  )
}
