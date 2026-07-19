import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { preconnect } from 'react-dom'
import Footer from '@/ui/footer'
import Header from '@/ui/header'
import ReadingProgress from '@/ui/reading-progress'
import AnalyticsTracker from '@/ui/analytics-tracker'
import VisualEditing from '@/ui/modules/visual-editing'
import { getSite } from '@/sanity/lib/queries'
import '@/app.css'

export async function generateMetadata() {
	const site = await getSite()
	const tagline = site?.tagline || 'Jambatan Suara Rakyat'
	return {
	title: {
		default: `Suara Anak Negeri — ${tagline}`,
		template: `%s — Suara Anak Negeri`,
	},
	description:
		'Portal berita online menghadirkan informasi terkini, akurat, dan mendalam seputar peristiwa nasional dan antarabangsa.',
	metadataBase: process.env.NEXT_PUBLIC_BASE_URL
		? new URL(process.env.NEXT_PUBLIC_BASE_URL)
		: undefined,
	}
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	preconnect('https://cdn.sanity.io')

	return (
		<html lang="ms" data-scroll-behavior="smooth">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="theme-color" content="#CC0000" />
				<meta name="color-scheme" content="light" />
			</head>
			<NuqsAdapter>
				<body className="bg-background text-foreground antialiased overscroll-none">
					<ReadingProgress />
						<Header />
					<main>{children}</main>
					<Footer />

						<AnalyticsTracker />
						<VisualEditing />
				</body>
			</NuqsAdapter>
		</html>
	)
}
