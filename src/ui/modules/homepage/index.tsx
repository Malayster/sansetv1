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

const Div = () => <div className="border-t border-gray-200 my-2" />

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<any[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-[1180px] mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>

  return <div className="max-w-[1180px] mx-auto px-4 md:px-0">

    {/* ═══ HERO ROW: 3-col full-width ═══ */}
    <Hero posts={posts} />
    <Div />

    {/* ═══ MAIN BODY: 2-col grid [780px content | 320px right rail] ═══ */}
    <div className="grid lg:grid-cols-[780px_320px] gap-8">

      {/* LEFT COLUMN: all main sections */}
      <div className="min-w-0">
        <EditorsPicks posts={posts.slice(4, 10)} />
        <Div />
        <LatestHeadlines posts={posts.slice(5)} />
        <Div />
        <LatestBusiness posts={posts.slice(0, 10)} />
        <Div />
        <TechAsiaBanner posts={posts.slice(10, 14)} />
        <Div />
        <SpotlightSection title="Konflik Global" tag="Sorotan" posts={posts.slice(14, 18)} />
        <Div />
        <Datawatch posts={posts.slice(18, 22)} />
        <Div />
        <OpinionGrid posts={posts.slice(10, 16)} />
        <Div />
        <Infographics posts={posts.slice(15, 20)} />
        <Div />
        <LifeArts posts={posts.slice(2, 8)} />
      </div>

      {/* RIGHT COLUMN: Market Data + Most Read + Ad */}
      <aside className="hidden lg:block">
        <div className="sticky top-[130px] space-y-3">
          <MarketData />
          <Div />
          <MostRead posts={posts} />
          <Div />
          <div className="bg-gray-100 border border-gray-200 h-[250px] flex items-center justify-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Iklan 300×250</span>
          </div>
        </div>
      </aside>
    </div>

    <Div />

    {/* ═══ FULL-WIDTH BOTTOM SECTIONS ═══ */}
    <TrendingTopics posts={posts} cats={cats} />
    <Div />
    <NewsByLocation posts={posts} />
    <Div />
    <EventReports posts={posts.slice(20, 24)} />
    <Div />
    <SponsoredContent posts={posts.slice(22, 25)} />
    <Div />

    {/* CTA */}
    <section className="py-4 text-center">
      <h2 className="font-serif text-[15px] font-bold text-[#111] mb-1">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-[11px] text-gray-500 mb-2.5 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2">
        <Link href="/berita" className="px-4 py-1.5 text-[11px] font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/hubungi" className="px-4 py-1.5 text-[11px] font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link>
      </div>
    </section>
  </div>
}