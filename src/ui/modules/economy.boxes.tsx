import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'

type Eco = { _id: string; title: string; value: string; change?: string; isPositive: boolean; type: string }

export default async function EconomyBoxes({ heading }: { heading?: string; _key?: string; _type?: string }) {
  const data = await client.fetch<Eco[]>(groq`*[_type == 'economicData'] | order(type asc) [0...4]{_id, title, value, change, isPositive, type}`, {}, { next: { revalidate: 120 } })
  if (!data?.length) return null
  return (
    <section className="section">
      {heading && <h2 className="text-xl font-bold border-l-4 border-hijau-zamrud pl-3 mb-6 uppercase tracking-wide text-foreground">{heading}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((d) => (
          <div key={d._id} className="border border-kelabu dark:border-putih/10 rounded-sm p-4 bg-putih dark:bg-hitam-muda">
            <div className="text-xs text-kelabu-gelap dark:text-putih/40 uppercase tracking-wide mb-1">{d.title}</div>
            <div className="text-xl font-bold text-foreground">{d.value}</div>
            {d.change && (
              <div className={`text-sm font-semibold mt-1 ${d.isPositive ? 'text-hijau-zamrud' : 'text-merah'}`}>
                {d.isPositive ? '\u25B2' : '\u25BC'} {d.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
