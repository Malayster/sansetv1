import Image from 'next/image'
import type { SanityImageSource } from '@sanity/image-url'
import { urlFor } from '@/sanity/lib/image'

export default function ArticleImage({
	src,
	alt = '',
	width = 800,
	height = 450,
	sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
	className = 'object-cover',
	fallbackAspect = '16/9',
}: {
	src?: SanityImageSource | null
	alt?: string
	width?: number
	height?: number
	sizes?: string
	className?: string
	fallbackAspect?: string
}) {
	if (src) {
		return (
			<Image
				src={urlFor(src).width(width).height(height).url()}
				alt={alt}
				width={width}
				height={height}
				sizes={sizes}
				className={className}
			/>
		)
	}

	// Fallback placeholder gradient
	return (
		<div
			className={`bg-gradient-to-br from-merah/20 via-hitam/10 to-merah/20 flex items-center justify-center ${className}`}
			style={{ aspectRatio: fallbackAspect, width: '100%' }}
			aria-hidden
		>
			<div className="text-merah/30 flex flex-col items-center gap-1">
				<svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor" className="opacity-40">
					<rect width="40" height="40" rx="4" />
					<text x="20" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">SAN</text>
				</svg>
				<span className="text-[10px] font-semibold tracking-wider uppercase">Suara Anak Negeri</span>
			</div>
		</div>
	)
}
