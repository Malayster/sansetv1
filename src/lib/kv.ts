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
  if (!ACCOUNT_ID || !API_TOKEN) return { ok: false, error: 'Missing credentials' }
  try {
    const res = await fetch(`${CF_BASE}/${namespaceId}/values/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      body: JSON.stringify(value),
    })
    return { ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` }
  } catch (e: any) {
    return { ok: false, error: e.message || 'Network error' }
  }
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
  'P001': { score: 58, label: 'neutral', source: 'Composite AI', summary: 'Sentimen di Padang Besar neutral dengan kecenderungan positif terhadap BN. Isu air menjadi kebimbangan utama pengundi namun projek pembangunan diterima baik.', topIssue: 'Isu air & infrastruktur', partySentiment: { BN: 65, PH: 45, PN: 35 }, updatedAt: new Date().toISOString() },
  'P002': { score: 62, label: 'neutral', source: 'Composite AI', summary: 'Kangar mencatatkan sentimen neutral-positif. Isu kesihatan dan harga rumah menjadi topik utama perbincangan.', topIssue: 'Kesihatan & perumahan', partySentiment: { PN: 60, PH: 45, BN: 40 }, updatedAt: new Date().toISOString() },
  'P003': { score: 55, label: 'neutral', source: 'Composite AI', summary: 'Arau kekal sebagai kubu kuat PN dengan penyandang berpengaruh. Golongan muda mahukan perubahan.', topIssue: 'Belia & pendidikan tinggi', partySentiment: { PN: 62, PH: 42, BN: 30 }, updatedAt: new Date().toISOString() },
  'P004': { score: 72, label: 'positif', source: 'Composite AI', summary: 'Langkawi mencatatkan sentimen positif tertinggi. Pemulihan pelancongan menjadi pemangkin utama.', topIssue: 'Pelancongan & kos sara hidup', partySentiment: { PN: 70, PH: 35, BN: 25 }, updatedAt: new Date().toISOString() },
  'N01': { score: 65, label: 'positif', source: 'Composite AI', summary: 'Projek pembangunan luar bandar meningkatkan keyakinan pengundi.', updatedAt: new Date().toISOString() },
  'N02': { score: 48, label: 'neutral', source: 'Composite AI', summary: 'Sentimen bercampur — isu kos sara hidup di kawasan luar bandar.', updatedAt: new Date().toISOString() },
  'N03': { score: 38, label: 'negatif', source: 'Composite AI', summary: 'Janji-janji tidak ditunaikan menyebabkan kekecewaan penduduk.', updatedAt: new Date().toISOString() },
  'N04': { score: 71, label: 'positif', source: 'Composite AI', summary: 'Populariti calon penyandang kekal kukuh di kawasan ini.', updatedAt: new Date().toISOString() },
}

const mockCandidates: Record<string, any[]> = {
  'P001': [
    { name: 'Zulkifli Ismail', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2022, votes: 16230, majority: 4172, percentage: 52.3, totalVoters: 45000, turnout: 78.5 } },
    { name: 'Mohd Saat Musa', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar', lastElection: { year: 2022, votes: 12058, majority: 0, percentage: 38.9, totalVoters: 45000, turnout: 78.5 } },
    { name: 'Rohaizat Zainal', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar', lastElection: { year: 2022, votes: 2341, majority: 0, percentage: 7.5, totalVoters: 45000, turnout: 78.5 } },
  ],
  'P002': [
    { name: 'Zakri Hassan', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2022, votes: 22100, majority: 3150, percentage: 48.7, totalVoters: 58000, turnout: 82.1 } },
    { name: 'Abdul Rashid', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar', lastElection: { year: 2022, votes: 18950, majority: 0, percentage: 41.7, totalVoters: 58000, turnout: 82.1 } },
  ],
  'P003': [
    { name: 'Shahidan Kassim', party: 'PN', partyLogo: '/flags/pn.svg', role: 'penyandang', lastElection: { year: 2022, votes: 19800, majority: 1200, percentage: 44.1, totalVoters: 52000, turnout: 76.3 } },
    { name: 'Fathin Amelina', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar', lastElection: { year: 2022, votes: 18600, majority: 0, percentage: 41.4, totalVoters: 52000, turnout: 76.3 } },
  ],
  'P004': [
    { name: 'Mohd Suhaimi Abdullah', party: 'PN', partyLogo: '/flags/pn.svg', role: 'penyandang', lastElection: { year: 2022, votes: 25400, majority: 5600, percentage: 61.2, totalVoters: 48000, turnout: 80.4 } },
    { name: 'Zambry Abd Kadir', party: 'BN', partyLogo: '/flags/bn.svg', role: 'pencabar', lastElection: { year: 2022, votes: 19800, majority: 0, percentage: 37.0, totalVoters: 48000, turnout: 80.4 } },
  ],
  'N01': [
    { name: 'Ahmad Razak', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 12340, majority: 1890, percentage: 54.1, totalVoters: 32000, turnout: 76.2 } },
    { name: 'Farid Iskandar', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' },
  ],
  'N02': [
    { name: 'Siti Aminah', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 9870, majority: 2340, percentage: 58.3, totalVoters: 28000, turnout: 74.1 } },
    { name: 'Chong Wei Keat', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' },
  ],
  'N03': [
    { name: 'Ismail bin Kassim', party: 'PN', partyLogo: '/flags/pn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7650, majority: 870, percentage: 41.2, totalVoters: 22000, turnout: 72.8 } },
    { name: 'Halimah Yusof', party: 'BN', partyLogo: '/flags/bn.svg', role: 'pencabar' },
  ],
  'N04': [
    { name: 'Noraini Hassan', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 11200, majority: 3400, percentage: 62.1, totalVoters: 26000, turnout: 78.9 } },
    { name: 'Azlan Shah', party: 'Bebas', partyLogo: '/flags/bebas.svg', role: 'pencabar' },
  ],
}

const defaultCandidates = [
  { name: 'Calon A', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang' as const },
  { name: 'Calon B', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' as const },
  { name: 'Calon C', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' as const },
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
  'P001': { malay: 78, chinese: 15, indian: 5, others: 2, medianIncome: 4389, poverty: 3.7, gini: 0.299 },
  'P002': { malay: 82, chinese: 12, indian: 4, others: 2, medianIncome: 4998, poverty: 4.3, gini: 0.349 },
  'P003': { malay: 85, chinese: 10, indian: 3, others: 2, medianIncome: 4802, poverty: 3.9 },
  'P004': { malay: 90, chinese: 5, indian: 3, others: 2, medianIncome: 5250, poverty: 5.7 },
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
