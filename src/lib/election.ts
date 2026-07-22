import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import type { ElectionInfo, ElectionRegion } from '@/types/election'

export async function getActiveElection(): Promise<ElectionInfo | null> {
  return client.fetch<ElectionInfo | null>(
    groq`*[_type == 'electionInfo' && isActive == true][0]{
      _id, electionName, electionDate, electionType, regionType,
      geoJsonFile, apiEndpoint, isActive, summary,
      states[]{name, party, seats, result}
    }`,
    {},
    { next: { revalidate: 300 } },
  )
}

export async function getElectionRegions(): Promise<ElectionRegion[]> {
  return [
    { code: 'P001', name: 'Padang Besar', state: 'Perlis', lat: 6.64, lng: 100.32 },
    { code: 'P002', name: 'Kangar', state: 'Perlis', lat: 6.44, lng: 100.19 },
    { code: 'P003', name: 'Arau', state: 'Perlis', lat: 6.43, lng: 100.27 },
    { code: 'P004', name: 'Langkawi', state: 'Kedah', lat: 6.35, lng: 99.80 },
    { code: 'P005', name: 'Jerlun', state: 'Kedah', lat: 6.42, lng: 100.23 },
    { code: 'P006', name: 'Kubang Pasu', state: 'Kedah', lat: 6.27, lng: 100.42 },
    { code: 'P007', name: 'Padang Terap', state: 'Kedah', lat: 6.44, lng: 100.66 },
    { code: 'P008', name: 'Pokok Sena', state: 'Kedah', lat: 6.17, lng: 100.49 },
    { code: 'P009', name: 'Alor Setar', state: 'Kedah', lat: 6.12, lng: 100.37 },
    { code: 'P010', name: 'Kuala Kedah', state: 'Kedah', lat: 6.10, lng: 100.30 },
    { code: 'P011', name: 'Pendang', state: 'Kedah', lat: 6.00, lng: 100.48 },
    { code: 'P012', name: 'Jerai', state: 'Kedah', lat: 5.77, lng: 100.43 },
    { code: 'P013', name: 'Sik', state: 'Kedah', lat: 5.82, lng: 100.74 },
    { code: 'P014', name: 'Merbok', state: 'Kedah', lat: 5.72, lng: 100.45 },
    { code: 'P015', name: 'Sungai Petani', state: 'Kedah', lat: 5.64, lng: 100.49 },
    { code: 'P016', name: 'Baling', state: 'Kedah', lat: 5.67, lng: 100.92 },
    { code: 'P017', name: 'Padang Serai', state: 'Kedah', lat: 5.51, lng: 100.56 },
    { code: 'P018', name: 'Kulim-Bandar Baharu', state: 'Kedah', lat: 5.34, lng: 100.57 },
    { code: 'P019', name: 'Tumpat', state: 'Kelantan', lat: 6.20, lng: 102.17 },
    { code: 'P020', name: 'Pengkalan Chepa', state: 'Kelantan', lat: 6.16, lng: 102.28 },
    { code: 'P021', name: 'Kota Bharu', state: 'Kelantan', lat: 6.12, lng: 102.24 },
    { code: 'P022', name: 'Pasir Mas', state: 'Kelantan', lat: 6.05, lng: 102.14 },
    { code: 'P023', name: 'Rantau Panjang', state: 'Kelantan', lat: 6.02, lng: 101.97 },
    { code: 'P024', name: 'Kubang Kerian', state: 'Kelantan', lat: 6.09, lng: 102.28 },
    { code: 'P025', name: 'Bachok', state: 'Kelantan', lat: 6.06, lng: 102.40 },
    { code: 'P026', name: 'Ketereh', state: 'Kelantan', lat: 5.96, lng: 102.25 },
    { code: 'P027', name: 'Tanah Merah', state: 'Kelantan', lat: 5.81, lng: 102.15 },
    { code: 'P028', name: 'Pasir Puteh', state: 'Kelantan', lat: 5.83, lng: 102.40 },
    { code: 'P029', name: 'Machang', state: 'Kelantan', lat: 5.76, lng: 102.22 },
    { code: 'P030', name: 'Jeli', state: 'Kelantan', lat: 5.70, lng: 101.84 },
    { code: 'P031', name: 'Kuala Krai', state: 'Kelantan', lat: 5.53, lng: 102.20 },
    { code: 'P032', name: 'Gua Musang', state: 'Kelantan', lat: 4.88, lng: 101.96 },
  ]
}

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
