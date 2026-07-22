import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'

export async function getRegionNews(code: string, limit = 5) {
  return client.fetch<any[]>(
    groq`*[_type == 'blog.post' && status in ['published','approved'] && electionRegion == $code] | order(publishDate desc)[0...${limit}]{
      _id, title, excerpt, publishDate,
      'img': metadata.image,
      'slug': metadata.slug.current,
    }`,
    { code },
    { next: { revalidate: 120 } },
  )
}
