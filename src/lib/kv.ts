const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN
const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces`

export async function getKVValue(namespaceId: string, key: string) {
  if (!ACCOUNT_ID || !API_TOKEN) return getMockValue(key)
  try {
    const res = await fetch(`${CF_BASE}/${namespaceId}/values/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    })
    if (!res.ok) return getMockValue(key)
    return res.json()
  } catch { return getMockValue(key) }
}

export async function setKVValue(namespaceId: string, key: string, value: any) {
  if (!ACCOUNT_ID || !API_TOKEN) return
  await fetch(`${CF_BASE}/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    body: JSON.stringify(value),
  })
}

export async function listKVKeys(namespaceId: string, prefix: string) {
  if (!ACCOUNT_ID || !API_TOKEN) return []
  const res = await fetch(`${CF_BASE}/${namespaceId}/keys?prefix=${encodeURIComponent(prefix)}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.result || []
}

// ─── MOCK DATA ────────────────────────────────────
const mockSentiment: Record<string, any> = {
  'P001': { score: 72, label: 'positif', source: 'Ilham Center', summary: 'Sentimen majoritinya positif disebabkan projek pembangunan terkini.', updatedAt: '2026-07-22T10:00:00Z' },
  'P002': { score: 45, label: 'neutral', source: 'Merdeka Center', summary: 'Sentimen bercampur — isu kos sara hidup membimbangkan pengundi.', updatedAt: '2026-07-21T08:00:00Z' },
  'P003': { score: 28, label: 'negatif', source: 'Ilham Center', summary: 'Sentimen negatif akibat skandal rasuah tempatan.', updatedAt: '2026-07-20T14:00:00Z' },
  'P004': { score: 85, label: 'positif', source: 'Merdeka Center', summary: 'Populariti tinggi calon penyandang di kawasan ini.', updatedAt: '2026-07-22T09:00:00Z' },
  'N01': { score: 65, label: 'positif', source: 'Ilham Center', summary: 'Projek pembangunan luar bandar meningkatkan keyakinan pengundi.', updatedAt: '2026-07-22T10:00:00Z' },
  'N02': { score: 48, label: 'neutral', source: 'Merdeka Center', summary: 'Sentimen bercampur — isu kos sara hidup di kawasan luar bandar.', updatedAt: '2026-07-21T08:00:00Z' },
  'N03': { score: 38, label: 'negatif', source: 'Ilham Center', summary: 'Janji-janji tidak ditunaikan menyebabkan kekecewaan penduduk.', updatedAt: '2026-07-20T14:00:00Z' },
  'N04': { score: 71, label: 'positif', source: 'Merdeka Center', summary: 'Populariti calon penyandang kekal kukuh di kawasan ini.', updatedAt: '2026-07-22T09:00:00Z' },
}

const mockCandidates: Record<string, any[]> = {
  'P001': [
    { name: 'Ahmad Razak', party: 'BN', partyFlag: '/flags/bn.png', photo: '/candidates/ahmad_razak.jpg', role: 'penyandang', lastElection: { year: 2022, votes: 18456, majority: 2341, percentage: 52.3, totalVoters: 45000, turnout: 78.5 } },
    { name: 'Siti Noraini', party: 'PH', partyFlag: '/flags/ph.png', photo: '/candidates/siti_noraini.jpg', role: 'pencabar' },
    { name: 'Muhammad Faisal', party: 'PN', partyFlag: '/flags/pn.png', photo: '/candidates/muhammad_faisal.jpg', role: 'pencabar' },
  ],
  'P002': [
    { name: 'Kumar a/l Muthu', party: 'PH', partyFlag: '/flags/ph.png', photo: '/candidates/default.png', role: 'penyandang', lastElection: { year: 2022, votes: 22100, majority: 3150, percentage: 48.7, totalVoters: 58000, turnout: 82.1 } },
    { name: 'Rashid bin Ali', party: 'PN', partyFlag: '/flags/pn.png', photo: '/candidates/default.png', role: 'pencabar' },
  ],
  'P003': [
    { name: 'Ismail bin Kassim', party: 'PN', partyFlag: '/flags/pn.png', photo: '/candidates/default.png', role: 'penyandang', lastElection: { year: 2022, votes: 19800, majority: 1200, percentage: 44.1, totalVoters: 52000, turnout: 76.3 } },
    { name: 'Lim Wei Chen', party: 'PH', partyFlag: '/flags/ph.png', photo: '/candidates/default.png', role: 'pencabar' },
  ],
  'P004': [
    { name: 'Noraini Hassan', party: 'BN', partyFlag: '/flags/bn.png', photo: '/candidates/default.png', role: 'penyandang', lastElection: { year: 2022, votes: 25400, majority: 5600, percentage: 61.2, totalVoters: 48000, turnout: 80.4 } },
    { name: 'Zulkifli Ahmad', party: 'Bebas', partyFlag: '/flags/bebas.png', photo: '/candidates/default.png', role: 'pencabar' },
  ],
  'N01': [
    { name: 'Ahmad Razak', party: 'BN', partyFlag: '/flags/bn.png', photo: '/candidates/ahmad_razak.jpg', role: 'penyandang', lastElection: { year: 2023, votes: 12340, majority: 1890, percentage: 54.1, totalVoters: 32000, turnout: 76.2 } },
    { name: 'Farid Iskandar', party: 'PH', partyFlag: '/flags/ph.png', photo: '/candidates/default.png', role: 'pencabar' },
  ],
  'N02': [
    { name: 'Siti Aminah', party: 'BN', partyFlag: '/flags/bn.png', photo: '/candidates/default.png', role: 'penyandang', lastElection: { year: 2023, votes: 9870, majority: 2340, percentage: 58.3, totalVoters: 28000, turnout: 74.1 } },
    { name: 'Chong Wei Keat', party: 'PH', partyFlag: '/flags/ph.png', photo: '/candidates/default.png', role: 'pencabar' },
  ],
  'N03': [
    { name: 'Ismail bin Kassim', party: 'PN', partyFlag: '/flags/pn.png', photo: '/candidates/default.png', role: 'penyandang', lastElection: { year: 2023, votes: 7650, majority: 870, percentage: 41.2, totalVoters: 22000, turnout: 72.8 } },
    { name: 'Halimah Yusof', party: 'BN', partyFlag: '/flags/bn.png', photo: '/candidates/default.png', role: 'pencabar' },
  ],
  'N04': [
    { name: 'Noraini Hassan', party: 'BN', partyFlag: '/flags/bn.png', photo: '/candidates/default.png', role: 'penyandang', lastElection: { year: 2023, votes: 11200, majority: 3400, percentage: 62.1, totalVoters: 26000, turnout: 78.9 } },
    { name: 'Azlan Shah', party: 'Bebas', partyFlag: '/flags/bebas.png', photo: '/candidates/default.png', role: 'pencabar' },
  ],
}

const defaultCandidates = [
  { name: 'Calon A', party: 'BN', partyFlag: '/flags/bn.png', photo: '/candidates/default.png', role: 'penyandang' as const },
  { name: 'Calon B', party: 'PH', partyFlag: '/flags/ph.png', photo: '/candidates/default.png', role: 'pencabar' as const },
  { name: 'Calon C', party: 'PN', partyFlag: '/flags/pn.png', photo: '/candidates/default.png', role: 'pencabar' as const },
]

const mockComments: Record<string, any> = {
  'P001': {
    items: [
      { platform: 'tiktok', username: 'anwarmadani2026', comment: 'PRN kali ni memang panas! Calon kita mesti menang! 💪', sentiment: 'positif', likes: 234, timestamp: '2026-07-23T08:30:00Z' },
      { platform: 'twitter', username: 'merdeka_fighter', comment: 'Janji kosong je lebih... rakyat dah bosan.', sentiment: 'negatif', likes: 89, timestamp: '2026-07-23T07:15:00Z' },
      { platform: 'facebook', username: 'Ali Hassan', comment: 'Pembangunan kat sini memang nampak ketara. Harap diteruskan.', sentiment: 'positif', likes: 156, timestamp: '2026-07-23T06:45:00Z' },
      { platform: 'tiktok', username: 'voter_muda88', comment: 'Bagi peluang kat muka baru! Jangan asyik undi penyandang je.', sentiment: 'neutral', likes: 67, timestamp: '2026-07-22T22:10:00Z' },
      { platform: 'twitter', username: 'political_watch', comment: 'Isu banjir kat sini masih tak selesai. Mana janji dulu?', sentiment: 'negatif', likes: 112, timestamp: '2026-07-22T19:30:00Z' },
    ],
    totalComments: 45,
    sentimentSummary: { positif: 62, neutral: 20, negatif: 18 },
    updatedAt: '2026-07-23T10:00:00Z',
  },
  'P002': {
    items: [
      { platform: 'facebook', username: 'Kangar Voice', comment: 'Kos sara hidup makin tinggi. Calon kena janji penyelesaian.', sentiment: 'neutral', likes: 78, timestamp: '2026-07-23T09:00:00Z' },
      { platform: 'tiktok', username: 'youth_perlis', comment: 'Wakil muda diperlukan untuk Perlis yang lebih maju!', sentiment: 'positif', likes: 45, timestamp: '2026-07-23T08:00:00Z' },
    ],
    totalComments: 28,
    sentimentSummary: { positif: 50, neutral: 30, negatif: 20 },
    updatedAt: '2026-07-23T09:30:00Z',
  },
  'N01': {
    items: [
      { platform: 'facebook', username: 'Chennah Kami', comment: 'Jalan luar bandar dah mula dibaiki. Kerja baik diteruskan!', sentiment: 'positif', likes: 89, timestamp: '2026-07-23T08:00:00Z' },
      { platform: 'tiktok', username: 'ns9_fighter', comment: 'Bantuan untuk pekebun kecil masih kurang. Harap ditambah.', sentiment: 'neutral', likes: 34, timestamp: '2026-07-22T20:00:00Z' },
    ],
    totalComments: 15,
    sentimentSummary: { positif: 55, neutral: 30, negatif: 15 },
    updatedAt: '2026-07-23T09:00:00Z',
  },
}

const defaultComments = (code: string) => ({
  items: [
    { platform: 'facebook' as const, username: `Warga${code}`, comment: 'Kami harap ada perubahan positif di kawasan ini.', sentiment: 'neutral' as const, likes: 42, timestamp: '2026-07-23T08:00:00Z' },
    { platform: 'tiktok' as const, username: `voice_${code.toLowerCase()}`, comment: 'Calon mesti komited untuk rakyat! Bukan sekadar janji.', sentiment: 'positif' as const, likes: 28, timestamp: '2026-07-23T07:00:00Z' },
  ],
  totalComments: 12,
  sentimentSummary: { positif: 45, neutral: 35, negatif: 20 },
  updatedAt: '2026-07-23T10:00:00Z',
})

const mockDemographics: Record<string, any> = {
  'P001': { malay: 78, chinese: 15, indian: 5, others: 2 },
  'P002': { malay: 82, chinese: 12, indian: 4, others: 2 },
  'P003': { malay: 85, chinese: 10, indian: 3, others: 2 },
  'P004': { malay: 90, chinese: 5, indian: 3, others: 2 },
  'N01': { malay: 55, chinese: 28, indian: 14, others: 3 },
  'N02': { malay: 72, chinese: 18, indian: 8, others: 2 },
  'N03': { malay: 80, chinese: 12, indian: 5, others: 3 },
  'N04': { malay: 65, chinese: 22, indian: 10, others: 3 },
}

const defaultDemographics = { malay: 60, chinese: 25, indian: 10, others: 5 }

function getMockValue(key: string) {
  if (key.startsWith('sentiment:')) {
    const code = key.split(':')[1]
    if (mockSentiment[code]) return mockSentiment[code]
    return { score: 50, label: 'neutral', source: 'Ilham Center', summary: 'Tiada data sentimen tersedia.', updatedAt: new Date().toISOString() }
  }
  if (key.startsWith('candidates:')) {
    const code = key.split(':')[1]
    return mockCandidates[code] || defaultCandidates
  }
  if (key.startsWith('comments:')) {
    const code = key.split(':')[1]
    return mockComments[code] || defaultComments(code)
  }
  return null
}

export function getMockDemographics(code: string) {
  return mockDemographics[code] || defaultDemographics
}
