import { groq } from 'next-sanity'
import ArticleImage from '@/ui/modules/blog/article-image'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/lib/env'
import { urlFor } from '@/sanity/lib/image'
import { client } from '@/sanity/lib/client'
import type { BLOG_POST_LIST_QUERY_RESULT } from '@/sanity/types'
import Date from '@/ui/modules/blog/date'
import MegaFooterCta from '@/ui/mega-footer-cta'
import Sidebar from '@/ui/sidebar'
import type { BlogCategory, Sidebar as SidebarType } from '@/sanity/types'

const FEATURED_QUERY = groq`*[_type == 'blog.post' && status in ['published', 'approved']]|order(publishDate desc)[0...20]{
  ...,
  categories[]->{_id, title, slug},
  author->{name},
  metadata{..., image{..., asset->}},
  'slug': $blogDir + metadata.slug.current,
}`

const CATEGORIES_QUERY = groq`*[_type == 'blog.category']|order(title)`

const PAGE_SIDEBAR_QUERY = groq`*[_type == 'page' && metadata.slug.current == 'index'][0]{leftSidebar, rightSidebar}`

export default async function Homepage() {
  const blogDir = `/${ROUTES.blog}/`
  const [posts, categories, page] = await Promise.all([
    client.fetch<BLOG_POST_LIST_QUERY_RESULT>(FEATURED_QUERY, { blogDir }),
    client.fetch<{ _id: string; title: string; slug: { current: string } }[]>(CATEGORIES_QUERY),
    client.fetch<{ leftSidebar: SidebarType | null; rightSidebar: SidebarType | null } | null>(PAGE_SIDEBAR_QUERY),
  ])

  const leftSidebar = page?.leftSidebar
  const rightSidebar = page?.rightSidebar

  const mainFeature = posts[0]
  const sidebarFeatures = posts.slice(1, 4)
  const carouselPosts = posts.slice(0, 4)

  if (posts.length === 0) {
    return (
      <div className="section text-center py-16 text-hitam-muda">
        <h2 className="text-2xl font-bold mb-4">Tiada Berita</h2>
        <p>Artikel akan dipaparkan selepas diluluskan oleh admin.</p>
      </div>
    )
  }

  return (
    <>
      {/* Tagline */}
      <div className="section !py-4">
        <p className="text-center text-sm text-hitam-muda font-medium">
          <strong className="text-merah">Suara Anak Negeri News</strong> — Mengulas Tuntas Kompleksiti Persoalan Politik, Ekonomi, Pendidikan, Religi, Dll
        </p>
      </div>

      {/* ====== HERO AREA: Hero Slider + Right Sidebar ====== */}
      <section className="section !py-0">
        <div className="grid md:grid-cols-[1fr_350px] gap-6">
          {/* Main Featured Hero */}
          <article className="relative overflow-hidden rounded-lg shadow-md group">
            {mainFeature.metadata?.image ? (
              <Image
                src={urlFor(mainFeature.metadata.image).width(800).height(450).url()}
                alt={mainFeature.title ?? ''}
                width={800}
                height={450}
                sizes="(max-width: 768px) 100vw, 66vw"
                className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <ArticleImage
                src={null}
                alt={mainFeature.title ?? ''}
                width={800}
                height={450}
                className="w-full aspect-[16/9]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-hitam/90 via-hitam/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-2">
                {(mainFeature.categories as unknown as BlogCategory[])?.slice(0, 3).map(cat => (
                  <Link key={cat._id} href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
                    className="text-xs font-semibold uppercase tracking-wider text-putih bg-merah px-2 py-0.5 rounded-sm">
                    {cat.title}
                  </Link>
                ))}
              </div>
              <Link href={mainFeature.slug}>
                <h2 className="text-putih font-bold text-xl md:text-2xl leading-snug line-clamp-2 hover:underline">
                  {mainFeature.title}
                </h2>
              </Link>
              <p className="text-putih/70 text-xs mt-2">
                <Date date={mainFeature.publishDate} /> MYT
              </p>
            </div>
          </article>

          {/* Hero Right Sidebar */}
          <div className="flex flex-col gap-4">
            {sidebarFeatures.map(post => (
              <article key={post._id} className="flex gap-3 group card-hover rounded-lg p-1 -m-1">
                {post.metadata?.image && (
                  <Image src={urlFor(post.metadata.image).width(150).height(150).url()}
                    alt="" width={100} height={100}
                    className="w-[100px] h-[100px] object-cover rounded shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {(post.categories as unknown as BlogCategory[])?.slice(0, 2).map(cat => (
                      <Link key={cat._id} href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
                        className="text-[10px] font-semibold uppercase text-merah hover:underline">
                        {cat.title}
                      </Link>
                    ))}
                  </div>
                  <Link href={post.slug}>
                    <h3 className="font-bold text-sm leading-snug line-clamp-3 group-hover:text-merah transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-kelabu-gelap text-xs mt-1">
                    <Date date={post.publishDate} /> MYT
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 3-COLUMN LAYOUT: Left Sidebar + Main + Right Sidebar ====== */}
      <section className="section !pt-6 !pb-0">
        <div className="grid md:grid-cols-[220px_1fr_300px] gap-6">

          {/* ─── LEFT SIDEBAR ─── */}
          {leftSidebar?.position ? (
            <Sidebar modules={leftSidebar.modules} position={leftSidebar.position} headings={[]} className="md:w-auto" />
          ) : (
            <aside className="hidden md:block space-y-5">
              {/* Kategori */}
              <div className="border border-kelabu rounded-lg overflow-hidden">
                <h4 className="font-bold text-sm text-putih bg-merah px-4 py-2.5 uppercase tracking-wide">
                  📂 Kategori
                </h4>
                <div className="divide-y divide-kelabu">
                  {categories.slice(0, 12).map(cat => (
                    <Link key={cat._id} href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
                      className="block px-4 py-2 text-xs text-hitam-muda hover:text-merah hover:bg-abu transition-colors">
                      {cat.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Berita Terkini */}
              <div className="border border-kelabu rounded-lg overflow-hidden">
                <h4 className="font-bold text-sm text-putih bg-merah px-4 py-2.5 uppercase tracking-wide">
                  🕐 Berita Terkini
                </h4>
                <div className="divide-y divide-kelabu">
                  {posts.slice(0, 8).map(post => (
                    <Link key={post._id} href={post.slug}
                      className="block px-4 py-2 group">
                      <span className="text-[11px] leading-snug text-hitam-muda group-hover:text-merah transition-colors line-clamp-2">
                        {post.title}
                      </span>
                      <p className="text-[10px] text-kelabu-gelap mt-0.5">
                        <Date date={post.publishDate} />
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* ─── MAIN CONTENT ─── */}
          <div className="min-w-0 space-y-8">

            {/* Headline Carousel */}
            <div>
              <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {carouselPosts.map((post) => (
                  <article key={post._id} className="relative min-w-[260px] md:min-w-0 md:flex-1 snap-start rounded-lg overflow-hidden shadow-md card-hover group shrink-0">
                    {post.metadata?.image ? (
                      <Image src={urlFor(post.metadata.image).width(400).height(300).url()}
                        alt="" width={400} height={300}
                        className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-abu flex items-center justify-center text-kelabu-gelap text-sm">
                        Tiada Gambar
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-hitam/80 via-hitam/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(post.categories as unknown as BlogCategory[])?.slice(0, 1).map(cat => (
                          <span key={cat._id} className="text-[10px] font-semibold uppercase bg-merah text-putih px-1.5 py-0.5 rounded-sm">
                            {cat.title}
                          </span>
                        ))}
                      </div>
                      <Link href={post.slug}>
                        <h4 className="text-putih font-bold text-xs leading-snug line-clamp-2 hover:underline">
                          {post.title}
                        </h4>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 mt-3">
                {carouselPosts.map((_, i) => (
                  <button key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-merah w-5' : 'bg-kelabu'}`} />
                ))}
              </div>
            </div>

            {/* Rubrik Category Cards */}
            <div>
              <h3 className="text-lg font-bold text-hitam border-b-2 border-merah pb-2 mb-4">
                Berita Sensasi Dalam Negeri
              </h3>
              <p className="text-sm text-hitam-muda mb-4">
                Liputan eksklusif dan laporan khas dari segenap pelusuk tanah air.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { title: 'Pendidikan Berkualiti', sub: '#Pendidikan', desc: 'Literasi, sekolah, dan kemajuan pendidikan rakyat.', cat: 'pendidikan' },
                  { title: 'Inovasi & Teknologi', sub: '#Digital', desc: 'UMKM, startup, teknologi rakyat, ekonomi digital.', cat: 'teknologi' },
                  { title: 'Alam Sekitar', sub: '#Hijau', desc: 'Perubahan iklim, mitigasi bencana, kelestarian.', cat: 'lingkungan' },
                  { title: 'Khazanah Negara', sub: '#Warisan', desc: 'Konservasi hutan, biodiversiti, keunikan alam.', cat: 'lingkungan' },
                  { title: 'Suara Komuniti', sub: '#Rakyat', desc: 'Kerjasama kerajaan dan masyarakat akar umbi.', cat: 'nasional' },
                  { title: 'Sukan & Rekreasi', sub: '#Sukan', desc: 'Liputan sukan tempatan dan antarabangsa.', cat: 'sukan' },
                ].map(sdg => (
                  <Link key={sdg.title} href={`/${ROUTES.blog}?category=${sdg.cat}`}
                    className="block bg-abu rounded-lg p-3 border border-kelabu hover:border-merah transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-merah-muda flex items-center justify-center text-merah font-bold text-sm">
                      {sdg.sub.replace('#', '')}
                    </div>
                    <h4 className="font-bold text-xs mb-0.5 group-hover:text-merah transition-colors">{sdg.title}</h4>
                    <p className="text-[10px] text-kelabu-gelap">{sdg.sub}</p>
                    <p className="text-[10px] text-hitam-muda mt-1 leading-relaxed">{sdg.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Berita Terbaru List */}
            <div>
              <h3 className="text-lg font-bold text-hitam border-b-2 border-merah pb-2 mb-4">
                Berita Terbaru
              </h3>
              <div className="space-y-4">
                {posts.slice(0, 10).map(post => (
                  <article key={post._id} className="flex gap-4 pb-4 border-b border-kelabu last:border-0 group card-hover rounded-lg p-2 -mx-2">
                    {post.metadata?.image && (
                      <Image src={urlFor(post.metadata.image).width(200).height(150).url()}
                        alt="" width={200} height={150}
                        className="w-[120px] h-[90px] object-cover rounded shrink-0 hidden sm:block" />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {(post.categories as unknown as BlogCategory[])?.slice(0, 3).map(cat => (
                          <Link key={cat._id} href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
                            className="text-[10px] font-semibold uppercase text-merah hover:underline">
                            {cat.title}
                          </Link>
                        ))}
                      </div>
                      <Link href={post.slug}>
                        <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-merah transition-colors">
                          {post.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-kelabu-gelap mt-1">
                        <Date date={post.publishDate} />
                        {post.author?.name && <span>— {post.author.name}</span>}
                      </div>
                    </div>
                  </article>
                ))}
                <Link href={`/${ROUTES.blog}`} className="action-outline text-sm font-bold uppercase !mx-0">
                  LIHAT SEMUA
                </Link>
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          {rightSidebar?.position ? (
            <Sidebar modules={rightSidebar.modules} position={rightSidebar.position} headings={[]} className="md:w-auto" />
          ) : (
            <aside className="hidden md:block space-y-5">
              {/* Popular */}
              <div className="border border-kelabu rounded-lg overflow-hidden">
                <h4 className="font-bold text-sm text-putih bg-merah px-4 py-2.5 uppercase tracking-wide">
                  🔥 Paling Popular
                </h4>
                <ol className="divide-y divide-kelabu">
                  {posts.slice(0, 10).map((post, i) => (
                    <li key={post._id} className="flex items-start gap-3 px-4 py-2.5">
                      <span className="text-xl font-bold text-merah/30 leading-none shrink-0 w-6">{i + 1}</span>
                      <Link href={post.slug} className="text-[11px] leading-snug hover:text-merah transition-colors line-clamp-2">
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Gallery Image Preview */}
              {posts.slice(0, 4).filter(p => p.metadata?.image).length > 0 && (
                <div className="border border-kelabu rounded-lg overflow-hidden">
                  <h4 className="font-bold text-sm text-putih bg-merah px-4 py-2.5 uppercase tracking-wide">
                    🖼️ Galeri
                  </h4>
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {posts.slice(0, 4).filter(p => p.metadata?.image).map(post => (
                      <Link key={post._id} href={post.slug} className="block aspect-square overflow-hidden">
                        <Image src={urlFor(post.metadata.image!).width(200).height(200).url()}
                          alt="" width={200} height={200}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Cloud */}
              <div className="border border-kelabu rounded-lg overflow-hidden">
                <h4 className="font-bold text-sm text-putih bg-merah px-4 py-2.5 uppercase tracking-wide">
                  🏷️ Tag Popular
                </h4>
                <div className="flex flex-wrap gap-1.5 p-4">
                  {categories.slice(0, 18).map(cat => (
                    <Link key={cat._id} href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
                      className="px-2.5 py-1 text-[10px] bg-abu border border-kelabu text-hitam-muda hover:text-merah hover:border-merah transition-colors rounded-sm">
                      {cat.title}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ====== TOPIK PILIHAN ====== */}
      <section className="section !pt-6">
        <h3 className="text-xl font-bold text-hitam border-b-2 border-merah pb-2 mb-6">
          Topik Pilihan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.slice(0, 8).map(post => (
            <article key={post._id} className="group card-hover rounded-lg p-2 -m-2">
              {post.metadata?.image && (
                <Image src={urlFor(post.metadata.image).width(300).height(200).url()}
                  alt="" width={300} height={200}
                  className="w-full aspect-[3/2] object-cover rounded-lg mb-2 group-hover:opacity-90 transition-opacity" />
              )}
              <div className="flex flex-wrap gap-1 mb-1">
                {(post.categories as unknown as BlogCategory[])?.slice(0, 1).map(cat => (
                  <Link key={cat._id} href={`/${ROUTES.blog}?category=${cat.slug?.current}`}
                    className="text-[10px] font-semibold uppercase text-merah hover:underline">
                    {cat.title}
                  </Link>
                ))}
              </div>
              <Link href={post.slug}>
                <h5 className="font-bold text-xs leading-snug line-clamp-3 group-hover:text-merah transition-colors">
                  {post.title}
                </h5>
              </Link>
              <p className="text-[11px] text-kelabu-gelap mt-1">
                <Date date={post.publishDate} />
              </p>
            </article>
          ))}
        </div>
      </section>

      <MegaFooterCta />
    </>
  )
}
