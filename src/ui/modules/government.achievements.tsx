import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'

type Ach = { _id: string; title: string; value: string; icon: string; link?: string }

export default async function GovernmentAchievements({ heading }: { heading?: string; _key?: string; _type?: string }) {
  const items = await client.fetch<Ach[]>(groq`*[_type == 'governmentAchievement'] | order(order asc) [0...3]{_id, title, value, icon, link}`, {}, { next: { revalidate: 300 } })
  if (!items?.length) return null
  return (
    <section className="section">
      {heading && <h2 className="text-xl font-bold border-l-4 border-emas pl-3 mb-6 uppercase tracking-wide text-foreground">{heading}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((a) => (
          <div key={a._id} className="border border-kelabu dark:border-putih/10 rounded-sm p-5 bg-putih dark:bg-hitam-muda">
            <div className="text-2xl mb-2">{a.icon || '\u{1F4CA}'}</div>
            <div className="text-2xl font-bold text-foreground mb-1">{a.value}</div>
            {a.link ? (
              <Link href={a.link} className="text-sm text-kelabu-gelap dark:text-putih/60 hover:text-merah transition-colors">{a.title}</Link>
            ) : (
              <div className="text-sm text-kelabu-gelap dark:text-putih/60">{a.title}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
