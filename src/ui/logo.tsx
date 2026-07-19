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
					<span className="text-putih text-lg md:text-xl tracking-tight">
						{site?.title ?? DEFAULT_LOGO}
					</span>
					<span className="text-putih/70 text-xs font-normal tracking-wider">
						Jambatan Suara Rakyat
					</span>
				</>
			)}
		</Link>
	)
}
