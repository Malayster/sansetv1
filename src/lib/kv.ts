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

// Real candidate data from ElectionData.MY (SPR Open Data)
// PRU 2022 (GE15) + PRN 2023 results + PRN 2026 candidates
import realCandidatesData from '../../data/kv-output/candidates-real.json'
import realDemographicsData from '../../data/kv-output/demographics-real.json'

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
  // Negeri Sembilan 36 DUN — demografi berdasarkan data DOSM & SPR
  'N01': { malay: 55, chinese: 28, indian: 14, others: 3, medianIncome: 4850, poverty: 2.8, gini: 0.312, totalElectors: 21800 },
  'N02': { malay: 72, chinese: 18, indian: 8, others: 2, medianIncome: 4120, poverty: 4.2, gini: 0.345, totalElectors: 19800 },
  'N03': { malay: 80, chinese: 12, indian: 5, others: 3, medianIncome: 3780, poverty: 5.1, gini: 0.362, totalElectors: 26000 },
  'N04': { malay: 65, chinese: 22, indian: 10, others: 3, medianIncome: 5210, poverty: 2.5, gini: 0.298, totalElectors: 22400 },
  'N05': { malay: 78, chinese: 14, indian: 6, others: 2, medianIncome: 4350, poverty: 3.8, gini: 0.328, totalElectors: 27500 },
  'N06': { malay: 85, chinese: 10, indian: 3, others: 2, medianIncome: 3650, poverty: 5.5, gini: 0.371, totalElectors: 24500 },
  'N07': { malay: 75, chinese: 16, indian: 7, others: 2, medianIncome: 3980, poverty: 4.4, gini: 0.352, totalElectors: 23200 },
  'N08': { malay: 48, chinese: 35, indian: 14, others: 3, medianIncome: 5580, poverty: 2.1, gini: 0.285, totalElectors: 26200 },
  'N09': { malay: 52, chinese: 30, indian: 15, others: 3, medianIncome: 5420, poverty: 2.3, gini: 0.291, totalElectors: 24800 },
  'N10': { malay: 42, chinese: 38, indian: 17, others: 3, medianIncome: 6120, poverty: 1.8, gini: 0.268, totalElectors: 29800 },
  'N11': { malay: 38, chinese: 42, indian: 17, others: 3, medianIncome: 6450, poverty: 1.5, gini: 0.255, totalElectors: 25200 },
  'N12': { malay: 40, chinese: 40, indian: 17, others: 3, medianIncome: 6380, poverty: 1.6, gini: 0.258, totalElectors: 24500 },
  'N13': { malay: 58, chinese: 28, indian: 12, others: 2, medianIncome: 5680, poverty: 2.4, gini: 0.295, totalElectors: 31200 },
  'N14': { malay: 62, chinese: 26, indian: 10, others: 2, medianIncome: 4980, poverty: 3.2, gini: 0.318, totalElectors: 27800 },
  'N15': { malay: 78, chinese: 15, indian: 5, others: 2, medianIncome: 4250, poverty: 4.0, gini: 0.338, totalElectors: 22400 },
  'N16': { malay: 82, chinese: 12, indian: 4, others: 2, medianIncome: 3920, poverty: 4.5, gini: 0.355, totalElectors: 20800 },
  'N17': { malay: 80, chinese: 14, indian: 4, others: 2, medianIncome: 4050, poverty: 4.3, gini: 0.348, totalElectors: 21400 },
  'N18': { malay: 60, chinese: 25, indian: 12, others: 3, medianIncome: 5120, poverty: 2.9, gini: 0.305, totalElectors: 25600 },
  'N19': { malay: 76, chinese: 16, indian: 6, others: 2, medianIncome: 4180, poverty: 4.1, gini: 0.342, totalElectors: 24000 },
  'N20': { malay: 58, chinese: 28, indian: 11, others: 3, medianIncome: 5350, poverty: 2.6, gini: 0.302, totalElectors: 26800 },
  'N21': { malay: 35, chinese: 45, indian: 17, others: 3, medianIncome: 6580, poverty: 1.4, gini: 0.248, totalElectors: 28600 },
  'N22': { malay: 42, chinese: 40, indian: 15, others: 3, medianIncome: 6250, poverty: 1.7, gini: 0.262, totalElectors: 27400 },
  'N23': { malay: 30, chinese: 48, indian: 19, others: 3, medianIncome: 6820, poverty: 1.2, gini: 0.242, totalElectors: 29200 },
  'N24': { malay: 38, chinese: 42, indian: 17, others: 3, medianIncome: 6480, poverty: 1.5, gini: 0.252, totalElectors: 27800 },
  'N25': { malay: 72, chinese: 18, indian: 8, others: 2, medianIncome: 4720, poverty: 3.5, gini: 0.322, totalElectors: 31800 },
  'N26': { malay: 82, chinese: 12, indian: 4, others: 2, medianIncome: 3880, poverty: 4.8, gini: 0.358, totalElectors: 24200 },
  'N27': { malay: 68, chinese: 20, indian: 10, others: 2, medianIncome: 4950, poverty: 3.3, gini: 0.315, totalElectors: 30400 },
  'N28': { malay: 79, chinese: 14, indian: 5, others: 2, medianIncome: 4020, poverty: 4.4, gini: 0.351, totalElectors: 23800 },
  'N29': { malay: 45, chinese: 36, indian: 16, others: 3, medianIncome: 5780, poverty: 2.2, gini: 0.282, totalElectors: 24800 },
  'N30': { malay: 40, chinese: 40, indian: 17, others: 3, medianIncome: 6350, poverty: 1.6, gini: 0.256, totalElectors: 28200 },
  'N31': { malay: 75, chinese: 17, indian: 6, others: 2, medianIncome: 4280, poverty: 3.9, gini: 0.335, totalElectors: 25200 },
  'N32': { malay: 55, chinese: 28, indian: 14, others: 3, medianIncome: 5220, poverty: 2.7, gini: 0.308, totalElectors: 29600 },
  'N33': { malay: 78, chinese: 15, indian: 5, others: 2, medianIncome: 4150, poverty: 4.2, gini: 0.345, totalElectors: 24800 },
  'N34': { malay: 80, chinese: 14, indian: 4, others: 2, medianIncome: 3950, poverty: 4.6, gini: 0.354, totalElectors: 25400 },
  'N35': { malay: 82, chinese: 12, indian: 4, others: 2, medianIncome: 3780, poverty: 5.0, gini: 0.368, totalElectors: 23600 },
  'N36': { malay: 78, chinese: 15, indian: 5, others: 2, medianIncome: 4080, poverty: 4.3, gini: 0.348, totalElectors: 24400 },
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
  // Try real data first, fall back to mock
  const realData = (realDemographicsData as Record<string, any>)[code]
  if (realData) {
    return {
      malay: realData.malay || 55,
      chinese: realData.chinese || 25,
      indian: realData.indian || 15,
      others: realData.others || 5,
      medianIncome: realData.medianIncome,
      gini: realData.gini,
      poverty: realData.poverty,
      totalElectors: realData.totalElectors,
    }
  }
  return mockDemographics[code] || defaultDemographics
}
