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

// ─── REAL / MOCK DATA ────────────────────────────
// Candidates come from ElectionData.MY (SPR Open Data)
// Demographics come from Tindak Malaysia / DOSM
// Sentiment is AI-generated via Composite AI
// Run 'scripts/generate-real-data.py' to regenerate

const mockSentiment: Record<string, any> = {
  'P001': { score: 58, label: 'neutral', source: 'Composite AI', summary: 'Sentimen di Padang Besar neutral dengan kecenderungan positif terhadap BN. Isu air menjadi kebimbangan utama pengundi namun projek pembangunan diterima baik.', topIssue: 'Isu air & infrastruktur', partySentiment: { BN: 65, PH: 45, PN: 35 }, updatedAt: new Date().toISOString() },
  'P002': { score: 62, label: 'neutral', source: 'Composite AI', summary: 'Kangar mencatatkan sentimen neutral-positif. Isu kesihatan dan harga rumah menjadi topik utama perbincangan.', topIssue: 'Kesihatan & perumahan', partySentiment: { PN: 60, PH: 45, BN: 40 }, updatedAt: new Date().toISOString() },
  'P003': { score: 55, label: 'neutral', source: 'Composite AI', summary: 'Arau kekal sebagai kubu kuat PN dengan penyandang berpengaruh. Golongan muda mahukan perubahan.', topIssue: 'Belia & pendidikan tinggi', partySentiment: { PN: 62, PH: 42, BN: 30 }, updatedAt: new Date().toISOString() },
  'P004': { score: 72, label: 'positif', source: 'Composite AI', summary: 'Langkawi mencatatkan sentimen positif tertinggi. Pemulihan pelancongan menjadi pemangkin utama.', topIssue: 'Pelancongan & kos sara hidup', partySentiment: { PN: 70, PH: 35, BN: 25 }, updatedAt: new Date().toISOString() },
  // ─── PRN 2026 Sentimen — Negeri Sembilan (36 DUN) ───
  'N01': { score: 65, label: 'positif', source: 'Composite AI', summary: 'Projek luar bandar meningkatkan keyakinan pengundi. PH masih disokong.', topIssue: 'Infrastruktur luar bandar', partySentiment: { PH: 62, PN: 38 }, updatedAt: new Date().toISOString() },
  'N02': { score: 48, label: 'neutral', source: 'Composite AI', summary: 'Sentimen bercampur — isu kos sara hidup di kawasan luar bandar.', topIssue: 'Kos sara hidup', partySentiment: { BN: 45, PN: 40, PH: 35 }, updatedAt: new Date().toISOString() },
  'N03': { score: 38, label: 'negatif', source: 'Composite AI', summary: 'Kekecewaan penduduk terhadap janji tidak ditunaikan.', topIssue: 'Bekalan air', partySentiment: { BN: 40, PN: 42, PH: 30 }, updatedAt: new Date().toISOString() },
  'N04': { score: 71, label: 'positif', source: 'Composite AI', summary: 'Populariti calon penyandang PH kukuh, projek perumahan rakyat menjadi taruhan.', topIssue: 'Perumahan mampu milik', partySentiment: { PH: 68, PN: 32 }, updatedAt: new Date().toISOString() },
  'N05': { score: 52, label: 'neutral', source: 'Composite AI', summary: 'Pengundi masih menilai prestasi. Isu ladang dan kebajikan pekebun kecil.', topIssue: 'Kebajikan pekebun kecil', partySentiment: { BN: 48, PH: 42, PN: 35 }, updatedAt: new Date().toISOString() },
  'N06': { score: 44, label: 'neutral', source: 'Composite AI', summary: 'Kawasan pedalaman kurang terjejas dengan kempen nasional. Isu jalan raya.', topIssue: 'Jalan luar bandar', partySentiment: { BN: 50, PN: 38, PH: 30 }, updatedAt: new Date().toISOString() },
  'N07': { score: 56, label: 'neutral', source: 'Composite AI', summary: 'Sentimen stabil. Program bantuan kerajaan negeri diterima baik.', topIssue: 'Bantuan rakyat', partySentiment: { BN: 52, PH: 40, PN: 35 }, updatedAt: new Date().toISOString() },
  'N08': { score: 68, label: 'positif', source: 'Composite AI', summary: 'Kawasan bandar kecil menyokong PH. Isu utama adalah peluang pekerjaan.', topIssue: 'Peluang pekerjaan', partySentiment: { PH: 65, PN: 30 }, updatedAt: new Date().toISOString() },
  'N09': { score: 62, label: 'positif', source: 'Composite AI', summary: 'Pembangunan industri kecil sederhana disambut baik.', topIssue: 'PKS & keusahawanan', partySentiment: { PH: 60, PN: 32 }, updatedAt: new Date().toISOString() },
  'N10': { score: 72, label: 'positif', source: 'Composite AI', summary: 'Kawasan perindustrian Nilai terus berkembang. Keyakinan tinggi terhadap PH.', topIssue: 'Peluang ekonomi', partySentiment: { PH: 70, PN: 28 }, updatedAt: new Date().toISOString() },
  'N11': { score: 75, label: 'positif', source: 'Composite AI', summary: 'Kawasan bandar Seremban — pembangunan pesat, sokongan kukuh kepada PH.', topIssue: 'Pengangkutan awam', partySentiment: { PH: 72, PN: 25 }, updatedAt: new Date().toISOString() },
  'N12': { score: 70, label: 'positif', source: 'Composite AI', summary: 'Temiang kekal sebagai kawasan penyandang PH yang selesa.', topIssue: 'Kebersihan & alam sekitar', partySentiment: { PH: 68, PN: 28 }, updatedAt: new Date().toISOString() },
  'N13': { score: 66, label: 'positif', source: 'Composite AI', summary: 'Aminuddin Harun masih popular. Isu infrastruktur bandar jadi tumpuan.', topIssue: 'Infrastruktur bandar', partySentiment: { PH: 64, PN: 34 }, updatedAt: new Date().toISOString() },
  'N14': { score: 58, label: 'neutral', source: 'Composite AI', summary: 'Campuran pengundi bandar dan pinggir. Persepsi bercampur terhadap perkhidmatan.', topIssue: 'Kos sara hidup', partySentiment: { PH: 55, PN: 38 }, updatedAt: new Date().toISOString() },
  'N15': { score: 45, label: 'neutral', source: 'Composite AI', summary: 'Kawasan tradisi BN — PN mula menampakkan pengaruh.', topIssue: 'Harga getah & kelapa sawit', partySentiment: { BN: 48, PN: 42, PH: 28 }, updatedAt: new Date().toISOString() },
  'N16': { score: 42, label: 'neutral', source: 'Composite AI', summary: 'Kawasan istana. Pengundi konservatif, pengaruh PN meningkat.', topIssue: 'Ekonomi desa', partySentiment: { BN: 45, PN: 44, PH: 25 }, updatedAt: new Date().toISOString() },
  'N17': { score: 46, label: 'neutral', source: 'Composite AI', summary: 'Sentimen neutral. kempen PN agresif di kawasan luar bandar.', topIssue: 'Internet & liputan', partySentiment: { BN: 46, PN: 42, PH: 28 }, updatedAt: new Date().toISOString() },
  'N18': { score: 60, label: 'positif', source: 'Composite AI', summary: 'Pilah menunjukkan sokongan baik terhadap PH. Isu pertanian utama.', topIssue: 'Pertanian & kebun', partySentiment: { PH: 58, PN: 35, BN: 30 }, updatedAt: new Date().toISOString() },
  'N19': { score: 50, label: 'neutral', source: 'Composite AI', summary: 'Bersaing sengit antara BN dan PN. Pengundi mengutamakan calon tempatan.', topIssue: 'Calon tempatan', partySentiment: { BN: 48, PN: 44, PH: 30 }, updatedAt: new Date().toISOString() },
  'N20': { score: 63, label: 'positif', source: 'Composite AI', summary: 'Pembangunan Labu sebagai kawasan pertumbuhan baru dinanti.', topIssue: 'Pembangunan tanah', partySentiment: { PH: 60, PN: 35 }, updatedAt: new Date().toISOString() },
  'N21': { score: 73, label: 'positif', source: 'Composite AI', summary: 'Kawasan majoriti Cina — PH kekal dominan, kempen PN kurang menonjol.', topIssue: 'Kos perniagaan', partySentiment: { PH: 72, PN: 22 }, updatedAt: new Date().toISOString() },
  'N22': { score: 68, label: 'positif', source: 'Composite AI', summary: 'Rahang terus menjadi kawasan selamat PH. Isu sampah & kebersihan.', topIssue: 'Kebersihan kawasan', partySentiment: { PH: 68, PN: 26 }, updatedAt: new Date().toISOString() },
  'N23': { score: 78, label: 'positif', source: 'Composite AI', summary: 'Kawasan paling pelbagai — sokongan PH sangat kukuh, majoriti besar.', topIssue: 'Perumahan & taman', partySentiment: { PH: 75, PN: 20 }, updatedAt: new Date().toISOString() },
  'N24': { score: 72, label: 'positif', source: 'Composite AI', summary: 'Kawasan satelit Seremban — pembangunan pesat, pengundi berpendapatan sederhana.', topIssue: 'Trafik & jalan jam', partySentiment: { PH: 70, PN: 25 }, updatedAt: new Date().toISOString() },
  'N25': { score: 55, label: 'neutral', source: 'Composite AI', summary: 'Paroi kawasan separa bandar pertandingan sengit PH-PN. Isu kos sara hidup.', topIssue: 'Kos sara hidup & pengangkutan', partySentiment: { PH: 52, PN: 48, BN: 30 }, updatedAt: new Date().toISOString() },
  'N26': { score: 43, label: 'neutral', source: 'Composite AI', summary: 'Chembong masih setia dengan BN. PN mula menembusi.', topIssue: 'Kemudahan asas', partySentiment: { BN: 48, PN: 42, PH: 28 }, updatedAt: new Date().toISOString() },
  'N27': { score: 58, label: 'neutral', source: 'Composite AI', summary: 'Rantau — kubu kuat Tok Mat. PN cuba mengejutkan.', topIssue: 'Kepimpinan & pengalaman', partySentiment: { BN: 55, PN: 38, PH: 32 }, updatedAt: new Date().toISOString() },
  'N28': { score: 47, label: 'neutral', source: 'Composite AI', summary: 'Kota — kawasan pinggir bandar, persaingan 3 penjuru sengit.', topIssue: 'Guna tanah & pembangunan', partySentiment: { BN: 45, PN: 42, PH: 30 }, updatedAt: new Date().toISOString() },
  'N29': { score: 64, label: 'positif', source: 'Composite AI', summary: 'Chuah majoriti Cina — PH selesa, isu alam sekitar pesisir.', topIssue: 'Alam sekitar pantai', partySentiment: { PH: 62, PN: 30 }, updatedAt: new Date().toISOString() },
  'N30': { score: 70, label: 'positif', source: 'Composite AI', summary: 'Lukut berkembang pesat. Sokongan PH stabil.', topIssue: 'Port Dickson pembangunan', partySentiment: { PH: 68, PN: 28 }, updatedAt: new Date().toISOString() },
  'N31': { score: 51, label: 'neutral', source: 'Composite AI', summary: 'Bagan Pinang BN vs PN sengit. Isu alam sekitar jadi perhatian.', topIssue: 'Pencemaran sungai', partySentiment: { BN: 48, PN: 42, PH: 30 }, updatedAt: new Date().toISOString() },
  'N32': { score: 62, label: 'positif', source: 'Composite AI', summary: 'Linggi — PH berjaya menawan hati pengundi pelbagai kaum.', topIssue: 'Jalan & pengangkutan', partySentiment: { PH: 60, PN: 35 }, updatedAt: new Date().toISOString() },
  'N33': { score: 46, label: 'neutral', source: 'Composite AI', summary: 'Sri Tanjung — pertahanan BN, PN mendekati majoriti.', topIssue: 'Kos sara hidup', partySentiment: { BN: 46, PN: 44, PH: 28 }, updatedAt: new Date().toISOString() },
  'N34': { score: 44, label: 'neutral', source: 'Composite AI', summary: 'Gemas — PN semakin mendapat tempat. Peratus keluar mengundi penting.', topIssue: 'Infrastruktur lebuh raya', partySentiment: { BN: 45, PN: 43, PH: 28 }, updatedAt: new Date().toISOString() },
  'N35': { score: 42, label: 'neutral', source: 'Composite AI', summary: 'Gemencheh — PN meningkat. Isu harga ladang dan kebajikan.', topIssue: 'Harga hasil tani', partySentiment: { BN: 44, PN: 42, PH: 26 }, updatedAt: new Date().toISOString() },
  'N36': { score: 48, label: 'neutral', source: 'Composite AI', summary: 'Repah — kawasan campuran, BN vs PN. PH berpotensi jadi kingmaker.', topIssue: 'Guna tanah & industri', partySentiment: { BN: 46, PN: 40, PH: 32 }, updatedAt: new Date().toISOString() },
}

// ─── ElectionData.MY enrichment (dynamic, production-safe) ───
// Load from filesystem at runtime (not bundled at build time).
// Falls back to empty/mock when files don't exist (e.g. Vercel build).
import fs from 'fs'
import path from 'path'

function loadJSON<T>(relPath: string, fallback: T): T {
  try {
    const fp = path.join(process.cwd(), relPath)
    if (!fs.existsSync(fp)) return fallback
    return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {
    return fallback
  }
}

const KV_DATA_DIR = 'data/kv-output'
const realCandidatesData   = loadJSON<Record<string, any[]>>(`${KV_DATA_DIR}/candidates-real.json`, {})
const realDemographicsData = loadJSON<Record<string, any>>(`${KV_DATA_DIR}/demographics-real.json`, {})
const realHistoricalResults = loadJSON<Record<string, any>>(`${KV_DATA_DIR}/historical-results.json`, {})

const defaultCandidates = [
  { name: 'Calon A', party: 'BN', partyLogo: '/flags/bn.webp', role: 'penyandang' as const },
  { name: 'Calon B', party: 'PH', partyLogo: '/flags/ph.webp', role: 'pencabar' as const },
  { name: 'Calon C', party: 'PN', partyLogo: '/flags/pn.webp', role: 'pencabar' as const },
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
  // Negeri Sembilan 36 DUN — demografi sebenar dari ElectionData.MY (SE-16 Voter Roll / SPR-DOSM)
  'N01': { malay: 47.8, chinese: 42.6, indian: 2.0, orang_asli: 6.3, others: 1.4 },
  'N02': { malay: 66.4, chinese: 19.3, indian: 6.5, orang_asli: 7.2, others: 0.6 },
  'N03': { malay: 79.8, chinese: 5.7, indian: 8.1, orang_asli: 5.7, others: 0.7 },
  'N04': { malay: 66.3, chinese: 27.4, indian: 3.7, orang_asli: 1.9, others: 0.7 },
  'N05': { malay: 78.2, chinese: 12.0, indian: 8.7, orang_asli: 0.2, others: 0.9 },
  'N06': { malay: 92.3, chinese: 1.6, indian: 5.7, orang_asli: 0.1, others: 0.3 },
  'N07': { malay: 52.3, chinese: 9.3, indian: 33.2, orang_asli: 4.5, others: 0.7 },
  'N08': { malay: 30.4, chinese: 58.0, indian: 10.8, orang_asli: 0.0, others: 0.8 },
  'N09': { malay: 76.7, chinese: 14.2, indian: 5.2, orang_asli: 2.3, others: 1.5 },
  'N10': { malay: 46.4, chinese: 30.0, indian: 20.8, orang_asli: 0.7, others: 2.2 },
  'N11': { malay: 4.6, chinese: 71.5, indian: 21.9, orang_asli: 1.0, others: 1.0 },
  'N12': { malay: 39.3, chinese: 43.3, indian: 14.6, orang_asli: 0.2, others: 2.5 },
  'N13': { malay: 71.6, chinese: 19.0, indian: 7.7, orang_asli: 0.1, others: 1.7 },
  'N14': { malay: 72.8, chinese: 15.6, indian: 8.3, orang_asli: 0.0, others: 3.3 },
  'N15': { malay: 80.4, chinese: 11.4, indian: 5.1, orang_asli: 2.1, others: 1.0 },
  'N16': { malay: 91.9, chinese: 2.1, indian: 0.3, orang_asli: 4.8, others: 0.8 },
  'N17': { malay: 81.3, chinese: 14.5, indian: 3.5, orang_asli: 0.1, others: 0.7 },
  'N18': { malay: 65.6, chinese: 24.7, indian: 8.7, orang_asli: 0.0, others: 1.0 },
  'N19': { malay: 73.7, chinese: 15.5, indian: 5.2, orang_asli: 5.1, others: 0.5 },
  'N20': { malay: 76.2, chinese: 7.4, indian: 13.3, orang_asli: 1.5, others: 1.6 },
  'N21': { malay: 28.2, chinese: 48.3, indian: 21.7, orang_asli: 0.2, others: 1.6 },
  'N22': { malay: 30.7, chinese: 43.5, indian: 22.5, orang_asli: 0.1, others: 3.2 },
  'N23': { malay: 13.7, chinese: 58.7, indian: 25.6, orang_asli: 0.0, others: 1.9 },
  'N24': { malay: 25.1, chinese: 45.5, indian: 27.9, orang_asli: 0.0, others: 1.5 },
  'N25': { malay: 78.7, chinese: 5.7, indian: 14.4, orang_asli: 0.0, others: 1.1 },
  'N26': { malay: 82.0, chinese: 6.0, indian: 9.7, orang_asli: 1.3, others: 1.0 },
  'N27': { malay: 56.1, chinese: 15.3, indian: 27.0, orang_asli: 0.0, others: 1.6 },
  'N28': { malay: 86.4, chinese: 6.3, indian: 5.2, orang_asli: 1.1, others: 0.9 },
  'N29': { malay: 24.8, chinese: 53.4, indian: 21.1, orang_asli: 0.0, others: 0.7 },
  'N30': { malay: 24.4, chinese: 47.9, indian: 26.0, orang_asli: 0.0, others: 1.6 },
  'N31': { malay: 75.6, chinese: 6.9, indian: 9.7, orang_asli: 0.1, others: 7.6 },
  'N32': { malay: 61.8, chinese: 16.7, indian: 17.3, orang_asli: 1.3, others: 3.0 },
  'N33': { malay: 38.7, chinese: 31.3, indian: 27.1, orang_asli: 0.0, others: 2.9 },
  'N34': { malay: 83.6, chinese: 7.7, indian: 4.9, orang_asli: 0.1, others: 3.8 },
  'N35': { malay: 62.5, chinese: 21.7, indian: 15.1, orang_asli: 0.1, others: 0.7 },
  'N36': { malay: 40.1, chinese: 41.0, indian: 17.4, orang_asli: 0.4, others: 1.0 },
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
    // Try real data first, fall back to defaults
    const realData = (realCandidatesData as Record<string, any[]>)[code]
    if (realData) return realData
    return defaultCandidates
  }
  if (key.startsWith('comments:')) {
    const code = key.split(':')[1]
    return mockComments[code] || defaultComments(code)
  }
  return null
}

export function getMockDemographics(code: string) {
  // DUN-level data takes priority — use estimates for individual DUNs
  if (mockDemographics[code]) return mockDemographics[code]

  // Map DUN codes to parent Parliament codes for demographics lookup
  const dunToParlimen: Record<string, string> = {
    // P126 Jelebu: N01-N04
    N01: 'P126', N02: 'P126', N03: 'P126', N04: 'P126',
    // P127 Jempol: N05-N08
    N05: 'P127', N06: 'P127', N07: 'P127', N08: 'P127',
    // P128 Seremban: N09-N14
    N09: 'P128', N10: 'P128', N11: 'P128', N12: 'P128', N13: 'P128', N14: 'P128',
    // P129 Kuala Pilah: N15-N19
    N15: 'P129', N16: 'P129', N17: 'P129', N18: 'P129', N19: 'P129',
    // P130 Rasah: N20-N22
    N20: 'P130', N21: 'P130', N22: 'P130',
    // P131 Rembau: N23-N26
    N23: 'P131', N24: 'P131', N25: 'P131', N26: 'P131',
    // P132 Port Dickson: N27-N30
    N27: 'P132', N28: 'P132', N29: 'P132', N30: 'P132',
    // P133 Tampin: N31-N36
    N31: 'P133', N32: 'P133', N33: 'P133', N34: 'P133', N35: 'P133', N36: 'P133',
  }
  // DUNs per parliament (for per-DUN elector estimate)
  const dunCountPerParlimen: Record<string, number> = {
    P126: 4, P127: 4, P128: 6, P129: 5, P130: 3, P131: 4, P132: 4, P133: 6,
  }

  const parlCode = dunToParlimen[code] || code
  const realData = (realDemographicsData as Record<string, any>)[parlCode]
  if (realData) {
    const dunCount = dunCountPerParlimen[parlCode] || 1
    return {
      malay: realData.malay || 55,
      chinese: realData.chinese || 25,
      indian: realData.indian || 15,
      others: realData.others || 5,
      medianIncome: realData.medianIncome,
      gini: realData.gini,
      poverty: realData.poverty,
      totalElectors: realData.totalElectors ? Math.round(realData.totalElectors / dunCount) : undefined,
      // Pass through parlCode for chart grouping
      _parlCode: parlCode,
    }
  }
  return defaultDemographics
}

export function getHistoricalResults() {
  return realHistoricalResults as Record<string, any>
}
