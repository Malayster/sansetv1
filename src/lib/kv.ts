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
  'P001': { score: 72, label: 'positif', summary: 'Sentimen majoritinya positif disebabkan projek pembangunan terkini.', updatedAt: '2026-07-22T10:00:00Z' },
  'P002': { score: 45, label: 'neutral', summary: 'Sentimen bercampur — isu kos sara hidup membimbangkan pengundi.', updatedAt: '2026-07-21T08:00:00Z' },
  'P003': { score: 28, label: 'negatif', summary: 'Sentimen negatif akibat skandal rasuah tempatan.', updatedAt: '2026-07-20T14:00:00Z' },
  'P004': { score: 85, label: 'positif', summary: 'Populariti tinggi calon penyandang di kawasan ini.', updatedAt: '2026-07-22T09:00:00Z' },
  'N01': { score: 65, label: 'positif', summary: 'Projek pembangunan luar bandar meningkatkan keyakinan pengundi.', updatedAt: '2026-07-22T10:00:00Z' },
  'N02': { score: 48, label: 'neutral', summary: 'Sentimen bercampur — isu kos sara hidup di kawasan luar bandar.', updatedAt: '2026-07-21T08:00:00Z' },
  'N03': { score: 38, label: 'negatif', summary: 'Janji-janji tidak ditunaikan menyebabkan kekecewaan penduduk.', updatedAt: '2026-07-20T14:00:00Z' },
  'N04': { score: 71, label: 'positif', summary: 'Populariti calon penyandang kekal kukuh di kawasan ini.', updatedAt: '2026-07-22T09:00:00Z' },
}

const mockPredictions: Record<string, any[]> = {
  'P001': [
    { candidateName: 'Ahmad Razak', party: 'BN', winRate: 68, factors: 'Pengalaman, projek pembangunan', generatedAt: '2026-07-22T00:00:00Z' },
    { candidateName: 'Siti Aminah', party: 'PH', winRate: 32, factors: 'Sokongan belia', generatedAt: '2026-07-22T00:00:00Z' },
  ],
  'P002': [
    { candidateName: 'Kumar a/l Muthu', party: 'PH', winRate: 52, factors: 'Isu kos sara hidup', generatedAt: '2026-07-21T00:00:00Z' },
    { candidateName: 'Rashid bin Ali', party: 'PN', winRate: 48, factors: 'Sentimen agama', generatedAt: '2026-07-21T00:00:00Z' },
  ],
  'P003': [
    { candidateName: 'Lim Wei Chen', party: 'PH', winRate: 35, factors: 'Skandal rasuah', generatedAt: '2026-07-20T00:00:00Z' },
    { candidateName: 'Ismail bin Kassim', party: 'PN', winRate: 65, factors: 'Gelombang perubahan', generatedAt: '2026-07-20T00:00:00Z' },
  ],
  'P004': [
    { candidateName: 'Noraini Hassan', party: 'BN', winRate: 80, factors: 'Populariti penyandang', generatedAt: '2026-07-22T00:00:00Z' },
    { candidateName: 'Zulkifli Ahmad', party: 'Bebas', winRate: 20, factors: 'Undi protes', generatedAt: '2026-07-22T00:00:00Z' },
  ],
  'N01': [
    { candidateName: 'Ahmad Razak', party: 'BN', winRate: 60, factors: 'Pengalaman, luar bandar', generatedAt: '2026-07-22T00:00:00Z' },
    { candidateName: 'Farid Iskandar', party: 'PH', winRate: 40, factors: 'Sokongan belia', generatedAt: '2026-07-22T00:00:00Z' },
  ],
  'N02': [
    { candidateName: 'Siti Aminah', party: 'BN', winRate: 55, factors: 'Populariti penyandang', generatedAt: '2026-07-21T00:00:00Z' },
    { candidateName: 'Chong Wei Keat', party: 'PH', winRate: 45, factors: 'Isu kos sara hidup', generatedAt: '2026-07-21T00:00:00Z' },
  ],
  'N03': [
    { candidateName: 'Ismail bin Kassim', party: 'PN', winRate: 58, factors: 'Gelombang perubahan', generatedAt: '2026-07-20T00:00:00Z' },
    { candidateName: 'Halimah Yusof', party: 'BN', winRate: 42, factors: 'Skandal rasuah', generatedAt: '2026-07-20T00:00:00Z' },
  ],
  'N04': [
    { candidateName: 'Noraini Hassan', party: 'BN', winRate: 75, factors: 'Populariti penyandang', generatedAt: '2026-07-22T00:00:00Z' },
    { candidateName: 'Azlan Shah', party: 'Bebas', winRate: 25, factors: 'Undi protes', generatedAt: '2026-07-22T00:00:00Z' },
  ],
}

function getMockValue(key: string) {
  if (key.startsWith('sentiment:')) {
    const code = key.split(':')[1]
    if (mockSentiment[code]) return mockSentiment[code]
    return { score: 50, label: 'neutral', summary: 'Tiada data sentimen tersedia.', updatedAt: new Date().toISOString() }
  }
  if (key.startsWith('prediction:')) {
    const code = key.split(':')[1]
    if (mockPredictions[code]) return mockPredictions[code]
    return [{ candidateName: 'N/A', party: '-', winRate: 0, factors: 'Data belum tersedia', generatedAt: new Date().toISOString() }]
  }
  return null
}
