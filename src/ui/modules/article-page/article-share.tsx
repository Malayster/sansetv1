'use client'

import { useState } from 'react'

const ICONS = {
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.14l4.713 6.231 5.39-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z',
  facebook: 'M9.236 9.529V8.125c0-.528.044-.834.942-.834h1.07V5.625H9.358C7.646 5.625 6.75 6.834 6.75 8.125v1.404H5.25v2h1.5V18h2.486v-6.471h1.662l.226-2H9.236z',
  whatsapp: 'M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.946-1.587L.057 24z',
  mail: 'M1.5 4.5h21v15h-21z',
  link: 'M10.59 13.41a4 4 0 0 1 0-5.66l3-3a4 4 0 0 1 5.66 5.66l-1 1a4 4 0 0 1-.83.66m-.34-4.34a4 4 0 0 1 0 5.66l-3 3a4 4 0 0 1-5.66-5.66l1-1a4 4 0 0 1 .83-.66',
}

export function ArticleShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const share = (kind: 'twitter' | 'facebook' | 'whatsapp' | 'mail' | 'link') => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const t = encodeURIComponent(title)
    const u = encodeURIComponent(url)
    if (kind === 'twitter') window.open(`https://twitter.com/share?text=${t}&url=${u}`, '_blank', 'noopener')
    else if (kind === 'facebook') window.open(`https://facebook.com/sharer/sharer.php?u=${u}`, '_blank', 'noopener')
    else if (kind === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${t}%20${u}`, '_blank', 'noopener')
    else if (kind === 'mail') window.location.href = `mailto:?subject=${t}&body=${u}`
    else if (kind === 'link') {
      navigator.clipboard?.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return <div className="flex items-center gap-1.5">
    <button onClick={() => share('twitter')} aria-label="Kongsi ke X" className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#C41E3A] hover:text-white text-gray-700 flex items-center justify-center transition-colors">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d={ICONS.twitter} /></svg>
    </button>
    <button onClick={() => share('facebook')} aria-label="Kongsi ke Facebook" className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#C41E3A] hover:text-white text-gray-700 flex items-center justify-center transition-colors">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d={ICONS.facebook} /></svg>
    </button>
    <button onClick={() => share('whatsapp')} aria-label="Kongsi ke WhatsApp" className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#C41E3A] hover:text-white text-gray-700 flex items-center justify-center transition-colors">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d={ICONS.whatsapp} /></svg>
    </button>
    <button onClick={() => share('mail')} aria-label="Hantar emel" className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#C41E3A] hover:text-white text-gray-700 flex items-center justify-center transition-colors">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h18v14H3z M3 5l9 7 9-7" /></svg>
    </button>
    <button onClick={() => share('link')} aria-label="Salin pautan" className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#C41E3A] hover:text-white text-gray-700 flex items-center justify-center transition-colors relative">
      {copied
        ? <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
        : <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a4 4 0 0 1 0-5.66l3-3a4 4 0 0 1 5.66 5.66l-1 1M14 11a4 4 0 0 1 0 5.66l-3 3a4 4 0 0 1-5.66-5.66l1-1" /></svg>}
      {copied && <span className="absolute -top-7 -left-2 text-[9px] bg-black text-white px-1.5 py-0.5 rounded">Disalin!</span>}
    </button>
  </div>
}