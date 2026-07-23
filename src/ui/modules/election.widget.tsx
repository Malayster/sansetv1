import { groq } from 'next-sanity'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { PARTY_COLOR_HEX } from '@/ui/party-vars'

const QUERY = groq`*[_type == 'electionInfo' && isActive == true][0]{
  electionName, electionDate, states, 'slug': slug.current
}`

type State = { name: string; party: string; seats: number }

type Election = {
  electionName: string; electionDate?: string; slug?: { current: string }
  states?: State[]
}

const PARTY_COLORS = PARTY_COLOR_HEX

const PARTY_NAMES: Record<string, string> = {
  PH: 'Pakatan Harapan', BN: 'Barisan Nasional', PN: 'Perikatan Nasional',
  GPS: 'Gabungan Parti Sarawak', GRS: 'Gabungan Rakyat Sabah',
  WARISAN: 'Warisan', BEBAS: 'Bebas',
}

// Simplified Malaysia SVG — 14 state outlines
const STATE_PATHS: Record<string, string> = {
  Perlis: 'M14,6 L22,6 L24,12 L18,14 L12,12 Z',
  Kedah: 'M12,12 L18,14 L24,12 L28,20 L24,28 L14,26 L10,20 L10,16 Z',
  'Pulau Pinang': 'M8,20 L14,20 L14,26 L8,28 L4,24 Z',
  Perak: 'M10,26 L24,28 L28,38 L26,48 L18,50 L10,44 L6,34 Z',
  Kelantan: 'M24,8 L34,6 L36,16 L28,20 L24,12 Z',
  Terengganu: 'M28,20 L36,16 L40,24 L34,30 L24,28 Z',
  Pahang: 'M24,28 L34,30 L42,38 L38,50 L26,48 L24,36 Z',
  Selangor: 'M18,50 L26,48 L28,56 L22,58 L16,54 Z',
  'Kuala Lumpur': 'M22,54 L26,54 L26,58 L22,58 Z',
  'Negeri Sembilan': 'M16,56 L28,56 L24,64 L18,64 L12,60 Z',
  Melaka: 'M14,64 L22,64 L20,70 L12,70 Z',
  Johor: 'M18,64 L28,64 L30,76 L22,78 L14,76 L10,70 Z',
  Sabah: 'M50,30 L66,24 L72,36 L68,50 L58,52 L48,42 Z',
  Sarawak: 'M46,52 L62,48 L72,56 L68,74 L52,76 L44,68 L42,58 Z',
}

function daysUntil(date: string): number {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000))
}

export default async function ElectionWidget({ heading }: { heading?: string; _key?: string; _type?: string }) {
  const data = await client.fetch<Election | null>(QUERY, {}, { next: { revalidate: 300 } })
  if (!data) return null

  const states = data.states || []
  const totalSeats = states.reduce((s, st) => s + st.seats, 0)
  const countdown = data.electionDate ? daysUntil(data.electionDate) : null

  return (
  <section className="section">
  {heading && <h2 className="text-xl font-bold border-l-4 border-emas pl-3 mb-4 uppercase tracking-wide text-foreground">{heading}</h2>}
  <div className="border border-kelabu rounded-sm p-6 bg-putih max-w-md">
  <h3 className="font-bold text-lg text-foreground">{data.electionName}</h3>
  {countdown != null && (
  <p className="text-xl font-bold text-merah mt-2">{countdown} hari lagi</p>
  )}
  {data.electionDate && (
  <p className="text-xs text-kelabu-gelap mt-1">
  {new Date(data.electionDate).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}
  </p>
  )}

  {/* Malaysia SVG Map */}
  <svg viewBox="0 0 80 84" className="w-full mt-4" style={{ maxWidth: '320px' }}>
  {states.map((st) => {
  const path = STATE_PATHS[st.name]
  if (!path) return null
  return (
  <g key={st.name}>
  <title>{st.name} — {PARTY_NAMES[st.party] || st.party} ({st.seats} kerusi)</title>
  <path d={path} fill={PARTY_COLORS[st.party] || '#808080'} stroke="#fff" strokeWidth="0.5" className="hover:opacity-80 transition-opacity cursor-pointer" />
  {/* Label text for larger states */}
  {['Selangor', 'Johor', 'Pahang', 'Perak', 'Kelantan', 'Terengganu', 'Sarawak', 'Sabah'].includes(st.name) && (
  <text x={0} y={0} fontSize="2.5" fill="#fff" fontWeight="bold" dominantBaseline="middle" textAnchor="middle"
  className="pointer-events-none"
  {...(st.name === 'Selangor' ? { x: 22, y: 54 } : {})}
  {...(st.name === 'Johor' ? { x: 22, y: 72 } : {})}
  {...(st.name === 'Pahang' ? { x: 32, y: 42 } : {})}
  {...(st.name === 'Perak' ? { x: 18, y: 38 } : {})}
  {...(st.name === 'Kelantan' ? { x: 30, y: 14 } : {})}
  {...(st.name === 'Terengganu' ? { x: 34, y: 22 } : {})}
  {...(st.name === 'Sarawak' ? { x: 58, y: 62 } : {})}
  {...(st.name === 'Sabah' ? { x: 60, y: 38 } : {})}
  >
  {st.seats}
  </text>
  )}
  </g>
  )
  })}
  </svg>

  {/* Legend */}
  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-kelabu">
  {[...new Set(states.map((s) => s.party))].map((p) => (
  <span key={p} className="inline-flex items-center gap-1 text-xs text-kelabu-gelap">
  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: PARTY_COLORS[p] || '#808080' }} />
  {p}
  </span>
  ))}
  </div>

  <div className="text-xs text-kelabu-gelap mt-2">
  Jumlah: <span className="font-bold text-foreground">{totalSeats} kerusi</span>
  </div>

  <Link href="/election"
  className="inline-block mt-4 px-5 py-2 text-sm font-semibold text-merah border-2 border-merah rounded-sm hover:bg-merah hover:text-white transition-colors">
  Pusat Pilihan Raya &rarr;
  </Link>
  </div>
  </section>
  )
}
