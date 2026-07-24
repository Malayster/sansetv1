import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redaksi — Suara Anak Negeri',
  description: 'Pasukan redaksi Suara Anak Negeri.',
}

export default function RedaksiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-6">Redaksi</h1>
      <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
        <p>
          <strong>Suara Anak Negeri</strong> dikendalikan oleh pasukan wartawan, penganalisis data,
          dan pembangun yang komited terhadap kewartawanan bebas dan analisis berasaskan bukti.
        </p>
        <p>
          Kami percaya pada kuasa data dan kewartawanan berkualiti untuk memperkasa rakyat Malaysia
          membuat keputusan yang lebih baik.
        </p>
        <h2 className="text-xl font-bold text-gray-800 mt-8">Hubungi Redaksi</h2>
        <p>
          Emel: <a href="mailto:redaksi@suara-anaknegeri.com" className="text-[#C41E3A] hover:underline">redaksi@suara-anaknegeri.com</a>
        </p>
      </div>
    </div>
  )
}
