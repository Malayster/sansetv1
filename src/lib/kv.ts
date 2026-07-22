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
  // ─── PRN 2023 Negeri Sembilan (36 DUN) — Keputusan lepas + Calon PRN 2026 ───
  // PH (Pakatan Harapan) menang 17 kerusi, BN (Barisan Nasional) menang 14, PN (Perikatan Nasional) menang 5
  'N01': [
    { name: 'Yap Seong Fook', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 8240, majority: 2340, percentage: 52.8, totalVoters: 21800, turnout: 76.2 } },
    { name: 'Roslan Md Desa', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar', profile: 'Bekas pegawai daerah, bertanding atas tiket PN.' },
  ],
  'N02': [
    { name: 'Jalaluddin Alias', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 6870, majority: 1640, percentage: 48.3, totalVoters: 19800, turnout: 74.1 } },
    { name: 'Osman Idris', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
    { name: 'Mohd Fadli Harun', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' },
  ],
  'N03': [
    { name: 'Mohammad Rizam Abdul Rahman', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7650, majority: 520, percentage: 41.2, totalVoters: 26000, turnout: 72.8 } },
    { name: 'Razali Mansor', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar', lastElection: { year: 2023, votes: 7130, majority: 0, percentage: 38.4, totalVoters: 26000, turnout: 72.8 } },
  ],
  'N04': [
    { name: 'Bakri Jamaluddin', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 9120, majority: 3120, percentage: 56.1, totalVoters: 22400, turnout: 78.9 } },
    { name: 'Iskandar Abdul Rahman', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N05': [
    { name: 'Mohd Isam Mohd Isa', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 10450, majority: 2890, percentage: 54.8, totalVoters: 27500, turnout: 75.6 } },
    { name: 'Siti Zaleha Hashim', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
    { name: 'Ramasamy Muthu', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' },
  ],
  'N06': [
    { name: 'Mustafa Mohamad', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 8230, majority: 1450, percentage: 47.2, totalVoters: 24500, turnout: 73.4 } },
    { name: 'Kamaruddin Ahmad', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
    { name: 'Zulkifli Salleh', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' },
  ],
  'N07': [
    { name: 'Lokman Abdul Aziz', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7210, majority: 980, percentage: 43.5, totalVoters: 23200, turnout: 72.1 } },
    { name: 'Faizal Ramli', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N08': [
    { name: 'Teo Kok Seong', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 11540, majority: 4560, percentage: 61.3, totalVoters: 26200, turnout: 76.8 } },
    { name: 'Lim Chin Yee', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N09': [
    { name: 'Asna Amin', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 9830, majority: 3210, percentage: 55.2, totalVoters: 24800, turnout: 77.3 } },
    { name: 'Mohd Razali Harun', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N10': [
    { name: 'Arul Kumar Jambunathan', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 14230, majority: 6780, percentage: 65.4, totalVoters: 29800, turnout: 79.2 } },
    { name: 'Leong Kim Wah', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N11': [
    { name: 'Ketrina Tan Su Mei', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 12540, majority: 5890, percentage: 68.1, totalVoters: 25200, turnout: 77.9 } },
    { name: 'Wong Chee Meng', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N12': [
    { name: 'Ng Chin Tsai', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 11230, majority: 4230, percentage: 62.7, totalVoters: 24500, turnout: 76.4 } },
    { name: 'Lee Kok Keong', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N13': [
    { name: 'Aminuddin Harun', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 13240, majority: 4560, percentage: 58.9, totalVoters: 31200, turnout: 78.2 } },
    { name: 'Mohd Rasyid Zainal', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N14': [
    { name: 'Mohamad Rafie Abdul Malek', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 10890, majority: 3450, percentage: 54.2, totalVoters: 27800, turnout: 75.6 } },
    { name: 'Ahmad Faizal Hassan', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N15': [
    { name: 'Ismail Ahmad', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7230, majority: 1120, percentage: 44.6, totalVoters: 22400, turnout: 73.8 } },
    { name: 'Razali Abd Kadir', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
    { name: 'Hassanuddin Karim', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' },
  ],
  'N16': [
    { name: 'Abdul Rahim Othman', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 6890, majority: 1340, percentage: 45.3, totalVoters: 20800, turnout: 72.4 } },
    { name: 'Mohd Nasir Ismail', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N17': [
    { name: 'Ismail Lasim', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 6540, majority: 890, percentage: 42.8, totalVoters: 21400, turnout: 71.9 } },
    { name: 'Zainal Abidin Mohd', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N18': [
    { name: 'Nor Azman Mohamad', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 9450, majority: 2780, percentage: 51.6, totalVoters: 25600, turnout: 74.9 } },
    { name: 'Mohd Ali Yusof', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
    { name: 'Osman Bakar', party: 'BN', partyLogo: '/flags/bn.svg', role: 'pencabar' },
  ],
  'N19': [
    { name: 'Saiful Yazan Sulaiman', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 8120, majority: 1670, percentage: 46.2, totalVoters: 24000, turnout: 73.2 } },
    { name: 'Md Nasir Hashim', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N20': [
    { name: 'Mohd Faizal Ramli', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 10230, majority: 3120, percentage: 53.4, totalVoters: 26800, turnout: 76.1 } },
    { name: 'Abdul Halim Samad', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N21': [
    { name: 'Jimmy Lim Chee Yong', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 13450, majority: 5670, percentage: 64.8, totalVoters: 28600, turnout: 78.5 } },
    { name: 'Ooi Chee Seng', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N22': [
    { name: 'Siah Foo Cheng', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 11980, majority: 4560, percentage: 60.1, totalVoters: 27400, turnout: 77.3 } },
    { name: 'Chong Wai Keat', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N23': [
    { name: 'Yap Wee Leong', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 15230, majority: 7890, percentage: 72.3, totalVoters: 29200, turnout: 79.8 } },
    { name: 'Koh Kim Swee', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N24': [
    { name: 'Gunasekaran Ramasamy', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 12450, majority: 5120, percentage: 62.4, totalVoters: 27800, turnout: 77.6 } },
    { name: 'Lee Hang Seng', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N25': [
    { name: 'Tamat Ahmad', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 11230, majority: 2340, percentage: 48.7, totalVoters: 31800, turnout: 75.2 } },
    { name: 'Zamri Omar', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar', lastElection: { year: 2023, votes: 8890, majority: 0, percentage: 38.5, totalVoters: 31800, turnout: 75.2 } },
    { name: 'Syed Ibrahim', party: 'BN', partyLogo: '/flags/bn.svg', role: 'pencabar' },
  ],
  'N26': [
    { name: 'Zaifulbahri Jaafar', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7650, majority: 1230, percentage: 43.8, totalVoters: 24200, turnout: 72.9 } },
    { name: 'Abdul Aziz Hassan', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N27': [
    { name: 'Mohamad Hasan', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 11240, majority: 3450, percentage: 51.2, totalVoters: 30400, turnout: 74.8 } },
    { name: 'Rosman Arifin', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
    { name: 'Azman Idris', party: 'PH', partyLogo: '/flags/ph.svg', role: 'pencabar' },
  ],
  'N28': [
    { name: 'Ahmad Shukri Abdul Wahab', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7230, majority: 980, percentage: 41.5, totalVoters: 23800, turnout: 71.4 } },
    { name: 'Mohd Saiful Aziz', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N29': [
    { name: 'Yap Yee Vong', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 10560, majority: 3890, percentage: 58.9, totalVoters: 24800, turnout: 76.5 } },
    { name: 'Khoo Seng Hooi', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N30': [
    { name: 'Ean Yong Hian Wah', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 12890, majority: 5340, percentage: 63.2, totalVoters: 28200, turnout: 78.1 } },
    { name: 'Wong Soon Heng', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N31': [
    { name: 'Abdul Razak Abdul Rahman', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 8450, majority: 1560, percentage: 46.1, totalVoters: 25200, turnout: 73.5 } },
    { name: 'Mohd Azhar Ibrahim', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N32': [
    { name: 'Mohan Rajagopal', party: 'PH', partyLogo: '/flags/ph.svg', role: 'penyandang', lastElection: { year: 2023, votes: 11230, majority: 3450, percentage: 52.8, totalVoters: 29600, turnout: 75.9 } },
    { name: 'Zainal Abidin Latif', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
    { name: 'Vijay Kumar', party: 'BN', partyLogo: '/flags/bn.svg', role: 'pencabar' },
  ],
  'N33': [
    { name: 'Mohd Rashid Mohamad', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7890, majority: 1120, percentage: 43.4, totalVoters: 24800, turnout: 72.6 } },
    { name: 'Mokhtar Ismail', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N34': [
    { name: 'Abdul Samad Ibrahim', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 8340, majority: 1780, percentage: 45.6, totalVoters: 25400, turnout: 73.1 } },
    { name: 'Ibrahim Din', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N35': [
    { name: 'Abdul Razak Abdul', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 7560, majority: 1340, percentage: 44.2, totalVoters: 23600, turnout: 72.4 } },
    { name: 'Mohd Shukri Ahmad', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
  ],
  'N36': [
    { name: 'Mustafa Daud', party: 'BN', partyLogo: '/flags/bn.svg', role: 'penyandang', lastElection: { year: 2023, votes: 8120, majority: 1560, percentage: 45.8, totalVoters: 24400, turnout: 72.8 } },
    { name: 'Haron Jantan', party: 'PN', partyLogo: '/flags/pn.svg', role: 'pencabar' },
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
