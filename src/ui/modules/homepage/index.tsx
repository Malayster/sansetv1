import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { bp } from './nikkei-utils'
import { Hero } from './hero'
import { EditorsPicks } from './editors-picks'
import { TopicPromotion } from './topic-promotion'
import { OpinionGrid } from './opinion-grid'
import { TrendingTopics } from './trending-topics'
import { NewsByLocation } from './news-by-location'
import { PageWideBanner, LifeArts } from './pagewide-banner'

const Q = groq`*[_type=='blog.post' && status in ['published','approved']]|order(publishDate desc)[0...20]{
  _id,title,excerpt,publishDate,'mainImage':metadata.image,'slug':metadata.slug.current,
  'category':categories[0]->{title,color, 'slug':slug.current},author->{name}
}`
const CQ = groq`*[_type=='blog.category']|order(title)[0...12]{_id,title,'slug':slug.current,color}`

export default async function Homepage() {
  const [posts, cats] = await Promise.all([
    client.fetch<any[]>(Q, {}, { next: { revalidate: 60 } }),
    client.fetch<any[]>(CQ, {}, { next: { revalidate: 300 } }),
  ])
  if (!posts.length) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Tiada Berita</div>

  return <div className="max-w-7xl mx-auto px-4 md:px-6">
    {/* 1. HERO */}
    <Hero posts={posts} />

    {/* 2. EDITOR'S PICKS */}
    <EditorsPicks posts={posts.slice(5)} />

    {/* 3. TOPIC PROMOTION: Berita Bisnes */}
    <TopicPromotion title="Berita Bisnes" posts={posts.slice(9, 13)} />

    {/* 4. TECH BANNER */}
    <PageWideBanner title="Sorotan Teknologi" tag="#teknologi" subtag="Transformasi digital Asia" href={`/${bp}?category=Teknologi`} posts={posts.slice(13, 14)} />

    {/* 5. TOPIC PROMOTION: Nasional */}
    <TopicPromotion title="Nasional" posts={posts.slice(14, 18)} />

    {/* 6. DATAWATCH BANNER */}
    <PageWideBanner title="Infografik" tag="Infografik" subtag="Analisis mendalam sepintas lalu" href="/infografik" posts={posts.slice(18, 19)} />

    {/* 7. OPINION */}
    <OpinionGrid posts={posts.slice(10, 17)} />

    {/* 8. LIFE & ARTS */}
    <LifeArts posts={posts.slice(7, 11)} />

    {/* 9. TRENDING TOPICS */}
    <TrendingTopics posts={posts} cats={cats} />

    {/* 10. NEWS BY LOCATION */}
    <NewsByLocation posts={posts} />

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
