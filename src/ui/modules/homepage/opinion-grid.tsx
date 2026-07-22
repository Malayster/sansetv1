import Link from 'next/link'
import { P, bp, NImg, NTag, NSec, NDiv, NSideH } from './nikkei-utils'

function Avatar({ author }: { author?: string }) {
  const initial = author?.[0] || '?'
  return <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold shrink-0">{initial}</div>
}

export function OpinionGrid({ posts }: { posts: P[] }) {
  if (posts.length < 4) return null
  return <>
    <section className="py-2">
      <NSec title="Opini" href={`${bp}?category=Opini`} />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* ── Main ── */}
        <div>
          {/* Spotlight opinion */}
          <article className="mb-3">
            <Link href={`${bp}${posts[0].slug}`} className="block overflow-hidden mb-2"><NImg p={posts[0]} w={512} h={288} /></Link>
            <div className="flex items-center gap-2 mb-1">
              <Avatar author={posts[0].author?.name || posts[0].category?.title} />
              <span className="text-[11px] font-bold text-gray-500">{posts[0].author?.name || posts[0].category?.title || 'Pengarang'}</span>
            </div>
            <NTag p={posts[0]} sz="text-[11px]" />
            <Link href={`${bp}${posts[0].slug}`}><h3 className="font-serif text-[18px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{posts[0].title}</h3></Link>
            {posts[0].excerpt && <p className="text-[13px] text-gray-500 mt-1.5">{posts[0].excerpt}</p>}
          </article>

          {/* 3 opinion base cards */}
          <div className="divide-y divide-gray-100">
            {posts.slice(1, 4).map(p => (
              <article key={p._id} className="flex gap-3 py-2 first:pt-0 last:pb-0 group">
                <Avatar author={p.author?.name || p.category?.title} />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-gray-500">{p.author?.name || 'Pengarang'}</span>
                  <Link href={`${bp}${p.slug}`}><h4 className="font-serif font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors text-[14px]">{p.title}</h4></Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── Sidebar: Most Read ── */}
        <aside>
          <NSideH title="Paling Popular" />
          <div className="divide-y divide-gray-100">
            {posts.slice(0, 6).map((p, i) => (
              <Link key={p._id} href={`${bp}${p.slug}`} className="flex gap-2 py-2 text-[12px] text-gray-700 hover:text-[#C41E3A] transition-colors leading-snug group">
                <span className="text-gray-300 font-bold text-sm w-5 shrink-0">{i + 1}.</span>
                <span>{p.title}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
    <NDiv />
  </>
}
