import Link from 'next/link'
import Image from 'next/image'
import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'
import { ArticleShare } from './article-share'
import { ArticleListen } from './article-listen'

const bp = `/${ROUTES.blog}/`

type Post = any

const RELATED_Q = groq`*[_type=='blog.post' && status in ['published','approved'] && _id != $id && ($cat in categories[]->title)]|order(publishDate desc)[0...5]{
  _id,title,publishDate,'mainImage':metadata.image,'slug':metadata.slug.current,
  'category':categories[0]->{title,color,'slug':slug.current}
}`
const FALLBACK_Q = groq`*[_type=='blog.post' && status in ['published','approved'] && _id != $id]|order(publishDate desc)[0...5]{
  _id,title,publishDate,'mainImage':metadata.image,'slug':metadata.slug.current,
  'category':categories[0]->{title,color,'slug':slug.current}
}`

export async function ArticleShell({ post, children }: { post: Post; children: React.ReactNode }) {
  const cat = post?.category?.[0] ?? post?.category
  const catTitle = cat?.title ?? 'Berita'
  const catColor = cat?.color ?? '#C41E3A'
  const catSlug = cat?.slug?.current ?? catTitle.toLowerCase()
  const author = post?.author?.name ?? 'Redaksi Suara Anak Negeri'
  const pubDate = post?.publishDate ?? post?.metadata?.publishDate
  const title = post?.title ?? post?.metadata?.title ?? ''
  const excerpt = post?.excerpt ?? post?.metadata?.description ?? ''
  const mainImage = post?.mainImage ?? post?.metadata?.image

  let related: any[] = []
  try {
    related = await client.fetch<any[]>(RELATED_Q, { id: post?._id ?? '', cat: catTitle }, { next: { revalidate: 60 } })
    if (!related.length) related = await client.fetch<any[]>(FALLBACK_Q, { id: post?._id ?? '' }, { next: { revalidate: 60 } })
  } catch { related = [] }

  return <article className="max-w-[1180px] mx-auto px-4 md:px-6 py-6">
    {/* Breadcrumb */}
    <nav className="flex items-center gap-1.5 text-[11px] mb-4">
      <Link href="/" className="text-gray-500 hover:text-[#C41E3A]">Utama</Link>
      <span className="text-gray-400">›</span>
      <Link href={`${bp}?category=${catSlug}`} className="font-semibold hover:underline" style={{ color: catColor }}>{catTitle}</Link>
    </nav>

    {/* Category tag */}
    <Link href={`${bp}?category=${catSlug}`} className="inline-flex items-center gap-1.5 mb-2">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill={catColor}><circle cx="12" cy="12" r="4" /></svg>
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: catColor }}>{catTitle}</span>
    </Link>

    {/* Title */}
    <h1 className="font-serif text-[28px] md:text-[34px] font-bold leading-tight text-[#111] mb-2 max-w-3xl">{title}</h1>

    {/* Standfirst */}
    {excerpt && <p className="font-serif text-[16px] text-gray-600 leading-snug mb-4 max-w-2xl">{excerpt}</p>}

    {/* Meta row: author, date, listen, share */}
    <div className="flex items-center justify-between border-y border-gray-200 py-2.5 mb-5 max-w-4xl flex-wrap gap-3">
      <div className="flex items-center gap-3 text-[12px] text-gray-600">
        <div className="w-7 h-7 rounded-full bg-[#13334f] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {author.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-[#111]">{author}</div>
          <div className="text-[10px] text-gray-400">{pubDate ? new Date(pubDate).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ArticleListen />
        <ArticleShare title={title} />
      </div>
    </div>

    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      {/* Main content */}
      <div className="min-w-0">
        {/* Hero image full-width */}
        {mainImage && (
          <figure className="mb-5">
            <div className="overflow-hidden">
              <Image
                src={urlFor(mainImage).width(1200).height(675).url()}
                alt={title}
                width={1200}
                height={675}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            <figcaption className="text-[11px] text-gray-400 italic mt-1.5">{title}</figcaption>
          </figure>
        )}

        {/* Body content (Sanity Portable Text rendered by children) */}
        <div className="article-body prose max-w-none">
          {children}
        </div>

        {/* Share bottom */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-3">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kongsi:</span>
          <ArticleShare title={title} />
        </div>
      </div>

      {/* Sidebar — Related Articles + Ad */}
      <aside className="border-l border-gray-200 pl-6 hidden lg:block">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-[#C41E3A] pb-1 mb-3">Baca Lagi</h3>
          {related.slice(0, 5).map(p => (
            <article key={p._id} className="py-2.5 border-b border-gray-100 last:border-b-0">
              {p.mainImage && (
                <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1.5">
                  <Image src={urlFor(p.mainImage).width(293).height(165).url()} alt="" width={293} height={165} className="w-full object-cover" style={{ aspectRatio: '293/165' }} />
                </Link>
              )}
              {p.category && (
                <Link href={`${bp}?category=${p.category.slug?.current ?? p.category.title}`} className="text-[10px] font-bold uppercase tracking-wide" style={{ color: p.category.color || '#C41E3A' }}>{p.category.title}</Link>
              )}
              <Link href={`${bp}${p.slug}`} className="block"><h4 className="font-serif text-[13px] font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3 mt-0.5">{p.title}</h4></Link>
            </article>
          ))}
          {related.length === 0 && <p className="text-[11px] text-gray-400 italic">Tiada artikel berkaitan</p>}
        </div>

        {/* Ad slot dummy */}
        <div className="mt-6 bg-gray-100 border border-gray-200 h-[250px] flex items-center justify-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Iklan 300×250</span>
        </div>
      </aside>
    </div>
  </article>
}