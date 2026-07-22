import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { preconnect } from 'react-dom'
import Footer from '@/ui/footer'
import Header from '@/ui/header'
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
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
			</head>
			<NuqsAdapter>
				<ThemeProvider>
					<body className="bg-white text-[#1A1A1A] antialiased overscroll-none">
						<ReadingProgress />
						<Header />
						<main className="min-h-screen">{children}</main>
						<Footer />

						<AnalyticsTracker />
						<VisualEditing />
					</body>
				</ThemeProvider>
			</NuqsAdapter>
		</html>
	)
}
