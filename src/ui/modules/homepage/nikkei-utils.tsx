import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { ROUTES } from '@/lib/env'

export const bp = `/${ROUTES.blog}/`
export type P = any
export const R = (c?: string) => c || '#C41E3A'
export const A = (d?: string) => {
  if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return m + ' minutes ago'; const h = Math.floor(m / 60)
  if (h < 24) return h + ' hours ago'; const dy = Math.floor(h / 24)
  if (dy < 7) return dy + ' days ago'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

/* ── Shared image component ── */
export function NImg({ p, w, h, prio, cls }: { p: P; w: number; h: number; prio?: boolean; cls?: string }) {
  if (!p.mainImage) return <div className={`bg-gray-100 ${cls || ''}`} style={{ aspectRatio: `${w}/${h}` }} />
  return <Image src={urlFor(p.mainImage).width(w).height(h).url()} alt="" width={w} height={h} className={`w-full object-cover ${cls || ''}`} style={{ aspectRatio: `${w}/${h}` }} priority={prio} />
}

/* ── Tag/Category label ── */
export function NTag({ p, sz, link }: { p: P; sz?: string; link?: boolean }) {
  if (!p.category) return null
  const cls = `${sz || 'text-[10px]'} font-bold uppercase tracking-wide`
  if (link === false) return <span className={cls} style={{ color: R(p.category.color) }}>{p.category.title}</span>
  return <Link href={`${bp}?category=${p.category.title}`} className={cls} style={{ color: R(p.category.color) }}>{p.category.title}</Link>
}

/* ── Headline link ── */
export function NHead({ p, sz, cls }: { p: P; sz?: string; cls?: string }) {
  return <Link href={`${bp}${p.slug}`}><h3 className={`font-serif font-bold leading-snug text-[#111] hover:text-[#C41E3A] transition-colors line-clamp-3 ${sz || 'text-[13px]'} ${cls || ''}`}>{p.title}</h3></Link>
}

/* ── Timestamp with clock icon ── */
export function NTime({ p }: { p: P }) {
  return <div className="flex items-center gap-1 mt-0.5">
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" className="text-gray-400"><path fill="currentColor" d="M6.5 0a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"/><path fill="currentColor" d="M7 3H6v4h4v-.976L7 6z"/></svg>
    <time className="text-[11px] text-gray-400">{A(p.publishDate)}</time>
  </div>
}

/* ── Section header (red title + optional chevron link) ── */
export function NSec({ title, href }: { title: string; href?: string }) {
  return <div className="flex items-center gap-2 mb-3">
    {href ? <Link href={href} className="font-serif text-[#C41E3A] font-bold text-base hover:opacity-80">{title}</Link>
    : <h2 className="font-serif text-[#C41E3A] font-bold text-base">{title}</h2>}
    {href && <Link href={href}><svg className="w-3 h-3 text-[#C41E3A]" viewBox="0 0 332 610"><path fill="currentColor" d="M332 305L59 0 0 50 141 305 0 560l59 50 273-305z"/></svg></Link>}
  </div>
}

/* ── Divider ── */
export function NDiv() { return <div className="border-t border-gray-200 my-4" /> }

/* ── Sidebar header (underline accent) ── */
export function NSideH({ title, href }: { title: string; href?: string }) {
  if (href) return <Link href={href} className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-[#C41E3A] pb-1 mb-2 inline-block hover:text-[#C41E3A] transition-colors">{title}</Link>
  return <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b-2 border-[#C41E3A] pb-1 mb-2 inline-block">{title}</h3>
}
