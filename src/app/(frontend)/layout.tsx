import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { preconnect } from 'react-dom'
import Footer from '@/ui/footer'
import Header from '@/ui/header'
import CategoryPills from '@/ui/category-pills'
import TickerBar from '@/ui/ticker-bar'
import ReadingProgress from '@/ui/reading-progress'
import AnalyticsTracker from '@/ui/analytics-tracker'
import VisualEditing from '@/ui/modules/visual-editing'
import { ThemeProvider } from '@/ui/theme-provider'
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
		<html lang="ms" data-scroll-behavior="smooth" suppressHydrationWarning>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="theme-color" content="#C41E3A" />
			</head>
			<NuqsAdapter>
				<ThemeProvider>
					<body className="bg-background dark:bg-bg-dark text-foreground dark:text-putih/90 antialiased overscroll-none">
						<ReadingProgress />
						<Header />
						<CategoryPills />
						<TickerBar />
						<main>{children}</main>
						<Footer />

						<AnalyticsTracker />
						<VisualEditing />
					</body>
				</ThemeProvider>
			</NuqsAdapter>
		</html>
	)
}
