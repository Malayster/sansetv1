import Link from 'next/link'
import { P, bp, NImg, NTag, NHead, NTime, NSec, NDiv, NSideH } from './nikkei-utils'

export function EditorsPicks({ posts }: { posts: P[] }) {
  if (posts.length < 4) return null

  return <>
    <section className="py-4">
      <NSec title="Pilihan Editor" href={`${bp}`} />
      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* ── Main: 1 spotlight + 3 cards ── */}
        <div>
          {/* Spotlight card */}
          <article className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="sm:w-[304px] shrink-0">
              <Link href={`${bp}${posts[0].slug}`} className="block overflow-hidden"><NImg p={posts[0]} w={304} h={171} /></Link>
            </div>
            <div>
              <NTag p={posts[0]} sz="text-[11px]" />
              <Link href={`${bp}${posts[0].slug}`}><h3 className="font-serif text-[16px] font-bold leading-snug mt-1 text-[#111] hover:text-[#C41E3A] transition-colors">{posts[0].title}</h3></Link>
              {posts[0].excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{posts[0].excerpt}</p>}
              <NTime p={posts[0]} />
            </div>
          </article>
          {/* 3 grid cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {posts.slice(1, 4).map(p => (
              <article key={p._id} className="group">
                <Link href={`${bp}${p.slug}`} className="block overflow-hidden mb-1.5"><NImg p={p} w={293} h={165} /></Link>
                <NTag p={p} link={false} />
                <NHead p={p} />
                <NTime p={p} />
              </article>
            ))}
          </div>
        </div>

        {/* ── Sidebar: Latest Headlines ── */}
        <aside>
          <NSideH title="Berita Terkini" href={`${bp}`} />
          <div className="divide-y divide-gray-100">
            {posts.slice(4, 13).map(p => (
              <Link key={p._id} href={`${bp}${p.slug}`} className="block py-2 text-[12px] text-gray-700 hover:text-[#C41E3A] transition-colors leading-snug">{p.title}</Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
    <NDiv />
  </>
}
