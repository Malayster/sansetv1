'use client'

import { useState, useRef, useEffect } from 'react'

export function ArticleListen() {
  const [playing, setPlaying] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const toggle = () => {
    if (!supported) return
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }
    const articleEl = document.querySelector('article .article-body') ?? document.querySelector('article')
    const text = articleEl?.textContent?.slice(0, 8000) ?? ''
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ms-MY'
    u.onend = () => setPlaying(false)
    u.onerror = () => setPlaying(false)
    utterRef.current = u
    window.speechSynthesis.speak(u)
    setPlaying(true)
  }

  return <button
    onClick={toggle}
    aria-label={playing ? 'Henti dengar' : 'Dengar artikel'}
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#13334f] hover:bg-[#C41E3A] text-white text-[11px] font-semibold transition-colors">
    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
      {playing
        ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        : <path d="M8 5v14l11-7z" />}
    </svg>
    <span>{playing ? 'Henti' : 'Dengar'}</span>
  </button>
}