import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tentang — Suara Anak Negeri',
  description: 'Tentang Suara Anak Negeri — platform media bebas yang memberi suara kepada rakyat Malaysia.',
}

export default function TentangPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-6">Tentang Suara Anak Negeri</h1>
      <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
        <p>
          <strong>Suara Anak Negeri</strong> ialah platform media bebas yang berdedikasi untuk memberi
          suara kepada rakyat Malaysia. Kami menyediakan liputan berita yang tepat, analisis politik
          yang mendalam, dan data pilihan raya yang komprehensif.
        </p>
        <p>
          Dengan fokus kepada integriti kewartawanan dan analisis berasaskan data, Suara Anak Negeri
          bertujuan menjadi sumber rujukan utama untuk rakyat Malaysia yang ingin memahami landskap
          politik negara.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-8">Misi Kami</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Menyediakan liputan berita yang adil dan seimbang</li>
          <li>Menganalisis data pilihan raya dengan telus</li>
          <li>Memberi platform untuk suara-suara yang kurang didengari</li>
          <li>Menggalakkan penglibatan sivik dalam kalangan rakyat Malaysia</li>
        </ul>
        <h2 className="text-xl font-bold text-gray-800 mt-8">Pusat Pilihan Raya</h2>
        <p>
          Lawati <Link href="/election" className="text-[#C41E3A] hover:underline font-semibold">Pusat Pilihan Raya</Link> kami
          untuk data terkini, analisis swing, dan perbandingan keputusan pilihan raya.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-8">Hubungi Kami</h2>
        <p>
          Emel: <a href="mailto:redaksi@suara-anaknegeri.com" className="text-[#C41E3A] hover:underline">redaksi@suara-anaknegeri.com</a>
        </p>
      </div>
    </div>
  )
}
