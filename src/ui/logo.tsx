import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getSite } from '@/sanity/lib/queries'
import Img from './img'

const DEFAULT_LOGO = 'Suara Anak Negeri'

export default async function ({
	variant: style = 'default',
	className,
}: {
	variant?: 'default' | 'light' | 'dark'
	className?: string
}) {
	const site = await getSite()
	const logo = site?.logo?.image?.[style]

	return (
		<Link
			href="/"
			className={cn(
				'logo inline-flex flex-col font-bold leading-tight',
				style === 'dark' ? 'text-putih' : 'text-foreground',
				className,
			)}
		>
			{logo ? (
				<Img
					image={logo}
					width={100}
					className="inline-block h-full w-auto object-contain"
					alt={site?.title ?? DEFAULT_LOGO}
				/>
			) : (
				<>
					<span className={cn("text-lg md:text-xl tracking-tight", style === "dark" ? "text-putih" : "text-[#1A1A1A]")}>
						{site?.title ?? DEFAULT_LOGO}
					</span>
					<span className={cn("text-xs font-normal tracking-wider", style === "dark" ? "text-putih/70" : "text-gray-500")}>
						Jambatan Suara Rakyat
					</span>
				</>
			)}
		</Link>
	)
}
