import { groq } from 'next-sanity'
import Link from 'next/link'
import { stegaClean } from 'next-sanity'
import { ROUTES } from '@/lib/env'
import { client } from '@/sanity/lib/client'
import NewsletterForm from '@/ui/newsletter-form'
import type { ToCHeadings } from '@/ui/table-of-contents'

const TRENDING_QUERY = groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...6]{
  _id, title,
  metadata{slug},
  'slug': $blogDir + metadata.slug.current,
  categories[]->{title}
}`

export default async function ArticleSidebarRight({
  headings,
  currentSlug,
}: {
  headings?: ToCHeadings
  currentSlug?: string
}) {
  const blogDir = `/${ROUTES.blog}/`
  const trending = await client.fetch<TRENDING_QUERY_RESULT>(TRENDING_QUERY, { blogDir })

  const filteredHeadings = headings?.filter((h) => {
    const level = Number(stegaClean(h.style)?.slice(1))
    return level >= 2 && level <= 3
  })

  return (
    <aside className="md:sticky-below-header md:w-[260px] shrink-0 space-y-5 [--offset:1rem] max-md:hidden">
      {/* ====== ISI KANDUNGAN (TOC) ====== */}
      {filteredHeadings && filteredHeadings.length > 1 && (
        <div className="border border-kelabu/60 rounded-lg overflow-hidden">
          <h4 className="bg-hitam text-putih font-bold text-sm uppercase px-4 py-2.5 tracking-wide">
            📌 Isi Kandungan
          </h4>
          <div className="p-3">
            <ul className="space-y-1">
              {filteredHeadings.map((h, i) => (
                <li key={i} className={`text-[12px] ${h.style === 'h3' ? 'pl-3' : ''}`}>
                  <a
                    href={`#${h._key}`}
                    className="block py-1 text-hitam-muda hover:text-merah transition-colors leading-snug border-l-2 border-transparent hover:border-merah/30 pl-2"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ====== TERKINI ====== */}
      <div className="border border-kelabu/60 rounded-lg overflow-hidden">
        <h4 className="bg-merah text-putih font-bold text-sm uppercase px-4 py-2.5 tracking-wide">
          🕐 Paparan Terkini
        </h4>
        <div className="divide-y divide-kelabu/30">
          {trending.filter((p: TRENDING_ITEM) => p.slug !== currentSlug).slice(0, 4).map((post: TRENDING_ITEM) => (
            <Link key={post._id} href={post.slug} className="flex gap-3 p-3 group hover:bg-abu/50 transition-colors">
              <span className="text-[11px] text-kelabu-gelap shrink-0 mt-0.5">
                {(post.categories as unknown as { title: string }[])?.[0]?.title}
              </span>
              <h5 className="text-[12px] font-medium leading-snug text-hitam group-hover:text-merah transition-colors line-clamp-2">
                {post.title}
              </h5>
            </Link>
          ))}
        </div>
      </div>

      {/* ====== TINDAKAN PANTAS ====== */}
      <div className="border border-merah/20 bg-gradient-to-b from-merah/5 to-white rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">📢</div>
        <h4 className="font-bold text-sm mb-1 text-hitam">Ada Berita Untuk Dikongsi?</h4>
        <p className="text-[11px] text-hitam-muda mb-3">Hantar tips atau maklumat kepada redaksi kami.</p>
        <a
          href="https://wa.me/6281248468287?text=Hallo+SuaraAnakNegeri"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-merah text-putih text-xs font-bold px-4 py-2 rounded hover:bg-merah-tua transition-colors"
        >
          WhatsApp Kami
        </a>
      </div>

      {/* ====== NEWSLETTER ====== */}
      <div className="border border-merah/20 bg-gradient-to-b from-merah/5 to-white rounded-lg p-4">
        <div className="text-2xl mb-2 text-center">📬</div>
        <h4 className="font-bold text-sm mb-1 text-hitam text-center">Langgan Newsletter</h4>
        <p className="text-[11px] text-hitam-muda mb-3 text-center">
          Dapatkan berita terus ke inbox anda.
        </p>
        <NewsletterForm source="sidebar" />
      </div>

      {/* ====== IKLAN ====== */}
      <div className="border border-kelabu/60 rounded-lg overflow-hidden bg-abu/30">
        <div className="text-center py-6 px-4">
          <span className="text-[10px] text-kelabu-gelap uppercase tracking-widest">Iklan</span>
          <div className="mt-2 h-[250px] bg-white border border-dashed border-kelabu rounded flex items-center justify-center">
            <span className="text-xs text-kelabu-gelap">AdSense 300x250</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

type TRENDING_ITEM = {
  _id: string
  title: string | null
  slug: string
  categories: unknown
}

type TRENDING_QUERY_RESULT = TRENDING_ITEM[]
