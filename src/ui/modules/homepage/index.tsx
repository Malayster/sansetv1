import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { bp } from './nikkei-utils'
import { Hero } from './hero'
import { LatestHeadlines } from './latest-headlines'
import { MarketData } from './market-data'
import { EditorsPicks } from './editors-picks'
import { LatestBusiness } from './latest-business'
import { TechAsiaBanner } from './tech-asia-banner'
import { SpotlightSection } from './spotlight-section'
import { Datawatch } from './datawatch'
import { OpinionGrid } from './opinion-grid'
import { MostRead } from './most-read'
import { Infographics } from './infographics'
import { LifeArts } from './life-arts'
import { TrendingTopics } from './trending-topics'
import { NewsByLocation } from './news-by-location'
import { EventReports } from './event-reports'
import { SponsoredContent } from './sponsored-content'

const Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...36]{
  _id,title,excerpt,publishDate,'mainImage':metadata.image,'slug':metadata.slug.current,
  'category':categories[0]->{title,color, 'slug':slug.current},author->{name}
}`
const CQ = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`

const Sec = ({ children }: { children: React.ReactNode }) => (
  <section className="max-w-[1180px] mx-auto px-4 md:px-0">{children}</section>
)

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<any[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>

  return <div>
    {/* Hero: 3-col — main article + 4 thumbs + Latest Headlines in column 3 */}
    <Sec><Hero posts={posts} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Editor's Picks */}
    <Sec><EditorsPicks posts={posts.slice(4, 10)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Latest Headlines — standalone full-width section */}
    <Sec><LatestHeadlines posts={posts.slice(5)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Latest Business News */}
    <Sec><LatestBusiness posts={posts.slice(0, 10)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* #techAsia banner */}
    <Sec><TechAsiaBanner posts={posts.slice(10, 14)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Spotlight */}
    <Sec><SpotlightSection title="Konflik Global" tag="Sorotan" posts={posts.slice(14, 18)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Datawatch */}
    <Sec><Datawatch posts={posts.slice(18, 22)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Opinion */}
    <Sec><OpinionGrid posts={posts.slice(10, 16)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Most Read — full-width, big numbers */}
    <Sec><MostRead posts={posts} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Infographics */}
    <Sec><Infographics posts={posts.slice(15, 20)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Life & Arts */}
    <Sec><LifeArts posts={posts.slice(2, 8)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Market Data — full-width table */}
    <Sec><MarketData full /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Trending Topics */}
    <Sec><TrendingTopics posts={posts} cats={cats} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* News By Location */}
    <Sec><NewsByLocation posts={posts} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Event Reports */}
    <Sec><EventReports posts={posts.slice(20, 24)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* Sponsored Content */}
    <Sec><SponsoredContent posts={posts.slice(22, 25)} /></Sec>
    <div className="border-t border-gray-200 my-3 max-w-[1180px] mx-auto" />

    {/* CTA */}
    <section className="max-w-[1180px] mx-auto px-4 md:px-0 py-4 text-center">
      <h2 className="font-serif text-[15px] font-bold text-[#111] mb-1">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[11px] text-gray-500 mb-2.5 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2">
        <Link href="/berita" className="px-4 py-1.5 text-[11px] font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/hubungi" className="px-4 py-1.5 text-[11px] font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link>
      </div>
    </section>
  </div>
}