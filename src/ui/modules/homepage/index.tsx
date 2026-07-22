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

const Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...30]{
  _id,title,excerpt,publishDate,'mainImage':metadata.image,'slug':metadata.slug.current,
  'category':categories[0]->{title,color, 'slug':slug.current},author->{name}
}`
const CQ = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`

const Div = () => <div className="border-t border-gray-200 my-4" />

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<any[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>

  return <div className="max-w-7xl mx-auto px-4 md:px-6">
    {/* 1. HERO (3-column: main + 4 thumbs + latest headlines) */}
    <Hero posts={posts} />

    {/* 2. LATEST HEADLINES + MARKET DATA rail (below hero, 2-column) */}
    <section className="grid lg:grid-cols-[1fr_300px] gap-5 py-4">
      <LatestHeadlines posts={posts.slice(5)} />
      <MarketData />
    </section>
    <Div />

    {/* 3. EDITOR'S PICKS */}
    <EditorsPicks posts={posts.slice(4, 10)} />
    <Div />

    {/* 4. LATEST BUSINESS NEWS (3-column: lead + list + bullet) */}
    <LatestBusiness posts={posts.slice(0, 10)} />
    <Div />

    {/* 5. #TECHASIA BANNER (black bg) */}
    <TechAsiaBanner posts={posts.slice(10, 14)} />
    <Div />

    {/* 6. SPOTLIGHT (dark black, Iran-tensions style) */}
    <SpotlightSection title="Konflik Global" tag="Sorotan" posts={posts.slice(14, 18)} />
    <Div />

    {/* 7. DATAWATCH */}
    <Datawatch posts={posts.slice(18, 22)} />
    <Div />

    {/* 8. OPINION GRID */}
    <OpinionGrid posts={posts.slice(10, 16)} />
    <Div />

    {/* 9. MOST READ + INFOGRAPHICS (2-column) */}
    <section className="grid lg:grid-cols-[300px_1fr] gap-5 py-4">
      <MostRead posts={posts} />
      <Infographics posts={posts.slice(15, 20)} />
    </section>
    <Div />

    {/* 10. LIFE & ARTS (4-col grid) */}
    <LifeArts posts={posts.slice(2, 8)} />
    <Div />

    {/* 11. TRENDING TOPICS */}
    <TrendingTopics posts={posts} cats={cats} />
    <Div />

    {/* 12. NEWS BY LOCATION (Malaysian states) */}
    <NewsByLocation posts={posts} />
    <Div />

    {/* 13. EVENT REPORTS (dark blue) */}
    <EventReports posts={posts.slice(20, 24)} />
    <Div />

    {/* 14. SPONSORED CONTENT */}
    <SponsoredContent posts={posts.slice(22, 25)} />
    <Div />

    {/* CTA */}
    <section className="py-6 text-center">
      <h2 className="font-serif text-base font-bold text-[#111] mb-1.5">Suara Rakyat, Disampaikan Tanpa Tapisan</h2>
      <p className="text-sm text-gray-500 mb-3 max-w-md mx-auto">Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelosok negeri.</p>
      <div className="flex items-center justify-center gap-2.5">
        <Link href={`${bp}`} className="px-5 py-2 text-xs font-semibold text-white bg-[#C41E3A] hover:bg-[#A01830] transition-colors">Baca Berita</Link>
        <Link href="/hubungi" className="px-5 py-2 text-xs font-semibold text-[#C41E3A] border border-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors">Hubungi Kami</Link>
      </div>
    </section>
  </div>
}
