'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Post = {
  _id: string; title?: string; excerpt?: string; publishDate?: string
  readTime?: number; mainImage?: { asset?: { _ref: string } }; slug?: string
  category?: { title: string; color?: string }
}

export default function NewsGridClient({ perPage, categoryFilterRef, blogDir }: { perPage: number; categoryFilterRef?: string; blogDir: string }) {
  const [items, setItems] = useState<Post[]>([])
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/grid-posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page, perPage, categoryFilterRef }) })
      const data = await res.json()
      if (data.posts?.length) { setItems((p) => [...p, ...data.posts]); setPage((p) => p + 1); if (data.posts.length < perPage) setHasMore(false) }
      else setHasMore(false)
    } catch {} finally { setLoading(false) }
  }, [page, perPage, categoryFilterRef])

  const imgUrl = (ref: string) => {
    const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
    const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    const id = ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')
    return `https://cdn.sanity.io/images/${pid}/${ds}/${id}`
  }

  return (<>
    {items.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {items.map((p) => {
          const s = p.slug ? `${blogDir}/${p.slug}` : '#'
          return (
            <article key={p._id} className="group bg-putih dark:bg-hitam-muda border-b border-kelabu dark:border-putih/10 pb-5">
              <Link href={s} className="block overflow-hidden mb-3">
                {p.mainImage?.asset?._ref ? (
                  <Image src={imgUrl(p.mainImage.asset._ref)} alt={p.title ?? ''} width={400} height={225}
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
              <Link href={s}><h3 className="font-bold text-[18px] leading-snug line-clamp-3 group-hover:text-merah transition-colors">{p.title}</h3></Link>
              {p.excerpt && <p className="text-sm text-kelabu-gelap dark:text-putih/50 mt-1.5 line-clamp-2">{p.excerpt}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-kelabu-gelap dark:text-putih/40">
                {p.publishDate && <time>{new Date(p.publishDate).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
                {p.readTime != null && <span>{p.readTime} min bacaan</span>}
              </div>
            </article>
          )
        })}
      </div>
    )}
    {hasMore && (
      <div className="text-center mt-10">
        <button onClick={loadMore} disabled={loading}
          className="w-full max-w-sm mx-auto py-3 px-6 text-sm text-kelabu-gelap dark:text-putih/50 border border-kelabu dark:border-putih/10 rounded-sm hover:bg-abu dark:hover:bg-putih/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Memuat...' : 'Muat Lagi Berita'}
        </button>
      </div>
    )}
  </>)
}
