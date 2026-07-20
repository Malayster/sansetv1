'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'

type SubItem = { label: string; href: string }
type MenuItem = {
	label: string
	href?: string
	columns?: { title: string; items: SubItem[] }[]
	featured?: { label: string; href: string; img: string }[]
}

const menuItems: MenuItem[] = [
	{ label: 'Utama', href: '/' },
	{
		label: 'Nasional',
		columns: [
			{
				title: 'Berita Tempatan',
				items: [
					{ label: 'Semasa', href: '/kategori/nasional' },
					{ label: 'Komuniti', href: '/tag/komuniti' },
					{ label: 'Pendidikan', href: '/tag/pendidikan' },
				],
			},
			{
				title: 'Politik',
				items: [
					{ label: 'Kerajaan', href: '/kategori/politik' },
					{ label: 'Parlimen', href: '/tag/parlimen' },
					{ label: 'Pilihan Raya', href: '/tag/pilihan-raya' },
				],
			},
			{
				title: 'Jenayah & Mahkamah',
				items: [
					{ label: 'Mahkamah', href: '/tag/mahkamah' },
					{ label: 'Jenayah', href: '/tag/jenayah' },
					{ label: 'Kes Rasuah', href: '/tag/rasuah' },
				],
			},
			{
				title: 'Lain-lain',
				items: [
					{ label: 'Cuaca & Bencana', href: '/tag/cuaca' },
					{ label: 'Agama', href: '/tag/agama' },
					{ label: 'Wawancara Khas', href: '/tag/wawancara' },
				],
			},
		],
	},
	{
		label: 'Dunia',
		columns: [
			{
				title: 'Antarabangsa',
				items: [
					{ label: 'Asia Pasifik', href: '/kategori/dunia' },
					{ label: 'Timur Tengah', href: '/tag/timur-tengah' },
					{ label: 'Eropah', href: '/tag/eropah' },
					{ label: 'Amerika', href: '/tag/amerika' },
				],
			},
			{
				title: 'ASEAN',
				items: [
					{ label: 'Indonesia', href: '/tag/indonesia' },
					{ label: 'Singapura', href: '/tag/singapura' },
					{ label: 'Thailand', href: '/tag/thailand' },
					{ label: 'Filipina', href: '/tag/filipina' },
				],
			},
		],
	},
	{
		label: 'Bisnes',
		columns: [
			{
				title: 'Ekonomi',
				items: [
					{ label: 'Pasaran Saham', href: '/kategori/bisnes' },
					{ label: 'Ringgit', href: '/tag/ringgit' },
					{ label: 'Belanjawan', href: '/tag/belanjawan' },
				],
			},
			{
				title: 'Kewangan',
				items: [
					{ label: 'Perbankan', href: '/tag/perbankan' },
					{ label: 'Insurans', href: '/tag/insurans' },
					{ label: 'Pelaburan', href: '/tag/pelaburan' },
				],
			},
			{
				title: 'Industri',
				items: [
					{ label: 'Hartanah', href: '/tag/hartanah' },
					{ label: 'Automotif', href: '/tag/automotif' },
					{ label: 'Startup', href: '/tag/startup' },
					{ label: 'Minyak & Gas', href: '/tag/minyak-gas' },
				],
			},
		],
	},
	{
		label: 'Sukan',
		columns: [
			{
				title: 'Bola Sepak',
				items: [
					{ label: 'Liga Malaysia', href: '/kategori/sukan' },
					{ label: 'Liga Juara-Juara', href: '/tag/uefa' },
					{ label: 'Piala Dunia', href: '/tag/piala-dunia' },
					{ label: 'Harimau Malaya', href: '/tag/harimau-malaya' },
				],
			},
			{
				title: 'Sukan Lain',
				items: [
					{ label: 'Badminton', href: '/tag/badminton' },
					{ label: 'E-Sukan', href: '/tag/e-sukan' },
					{ label: 'MotoGP', href: '/tag/motogp' },
					{ label: 'Olimpik', href: '/tag/olimpik' },
				],
			},
		],
	},
	{
		label: 'Hiburan',
		columns: [
			{
				title: 'Hiburan',
				items: [
					{ label: 'Filem & Drama', href: '/kategori/hiburan' },
					{ label: 'Muzik', href: '/tag/muzik' },
					{ label: 'Selebriti', href: '/tag/selebriti' },
					{ label: 'Viral', href: '/tag/viral' },
				],
			},
			{
				title: 'Gaya Hidup',
				items: [
					{ label: 'Kesihatan', href: '/tag/kesihatan' },
					{ label: 'Pelancongan', href: '/tag/pelancongan' },
					{ label: 'Makanan', href: '/tag/makanan' },
					{ label: 'Fesyen', href: '/tag/fesyen' },
				],
			},
			{
				title: 'Tekno',
				items: [
					{ label: 'Gajet', href: '/tag/gajet' },
					{ label: 'AI & Sains', href: '/tag/sains' },
					{ label: 'Media Sosial', href: '/tag/media-sosial' },
				],
			},
		],
	},
	{ label: 'Rencana', href: '/kategori/rencana' },
]

export default function NavBar() {
	const [mobileOpen, setMobileOpen] = useState(false)
	const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
	const [mobileSub, setMobileSub] = useState<number | null>(null)
	const [mobileSubAnim, setMobileSubAnim] = useState<'in' | 'out' | null>(null)
	const navRef = useRef<HTMLDivElement>(null)

	const openMobile = useCallback(() => {
		setMobileOpen(true)
		document.body.style.overflow = 'hidden'
	}, [])

	const closeMobile = useCallback(() => {
		setMobileOpen(false)
		setMobileSub(null)
		document.body.style.overflow = ''
	}, [])

	useEffect(() => {
		return () => {
			document.body.style.overflow = ''
		}
	}, [])

	// Close dropdown on outside click
	useEffect(() => {
		if (activeDropdown === null) return
		const handleClick = (e: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(e.target as Node)) {
				setActiveDropdown(null)
			}
		}
		document.addEventListener('click', handleClick)
		return () => document.removeEventListener('click', handleClick)
	}, [activeDropdown])

	const toggleDropdown = (i: number) => {
		setActiveDropdown(activeDropdown === i ? null : i)
	}

	const openSub = (i: number) => {
		setMobileSub(i)
		setMobileSubAnim('in')
	}

	const closeSub = () => {
		if (mobileSubAnim === 'out') return
		setMobileSubAnim('out')
		setTimeout(() => {
			setMobileSub(null)
			setMobileSubAnim(null)
		}, 300)
	}

	return (
		<>
			{/* Desktop Nav */}
			<nav ref={navRef} className="hidden md:flex items-center gap-0.5">
				{menuItems.map((item, i) => (
					<div key={item.label} className="relative">
						{item.href ? (
							<Link
								href={item.href}
								className="flex items-center gap-1 px-2.5 py-2 text-black/80 hover:text-black font-medium text-sm rounded-md hover:bg-black/5 transition-colors"
							>
								{item.label}
							</Link>
						) : (
							<button
								className="flex items-center gap-1 px-2.5 py-2 text-black/80 hover:text-black font-medium text-sm rounded-md hover:bg-black/5 transition-colors"
								onClick={() => toggleDropdown(i)}
							>
								{item.label}
								<svg className={`w-3 h-3 transition-transform ${activeDropdown === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
								</svg>
							</button>
						)}

						{/* Mega Dropdown */}
						{item.columns && activeDropdown === i && (
							<div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white rounded-xl shadow-2xl border border-black/5 z-50 overflow-hidden">
								<div className="flex p-5 gap-8 min-w-[600px] max-w-[720px]">
									{item.columns.map((col) => (
										<div key={col.title} className="flex-1 min-w-0">
											<h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
												{col.title}
											</h4>
											<ul className="space-y-1">
												{col.items.map((sub) => (
													<li key={sub.label}>
														<Link
															href={sub.href}
															className="block text-sm text-gray-700 hover:text-amber-600 py-0.5 transition-colors"
															onClick={() => setActiveDropdown(null)}
														>
															{sub.label}
														</Link>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</nav>

			{/* Mobile Burger */}
			<button
				className="md:hidden flex flex-col gap-1 p-1.5 -mr-1"
				onClick={() => (mobileOpen ? closeMobile() : openMobile())}
				aria-label="Menu"
			>
				<span className={`block w-5 h-0.5 bg-black rounded-full transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
				<span className={`block w-4 h-0.5 bg-black rounded-full transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
				<span className={`block w-5 h-0.5 bg-black rounded-full transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
			</button>

			{/* Mobile Overlay */}
			{mobileOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					<div className="absolute inset-0 bg-black/50" onClick={closeMobile} />
					<div className="absolute top-0 left-0 w-[80%] max-w-sm h-full bg-white shadow-2xl overflow-hidden flex flex-col">
						{/* Mobile submenu header */}
						{mobileSub !== null ? (
							<>
								<div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 shrink-0">
									<button onClick={closeSub} className="p-1 -ml-1">
										<svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
											<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
										</svg>
									</button>
									<span className="font-semibold text-sm">{menuItems[mobileSub].label}</span>
								</div>
								<div className="flex-1 overflow-y-auto py-3 px-5">
									{menuItems[mobileSub].columns?.map((col) => (
										<div key={col.title} className="mb-5">
											<h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
												{col.title}
											</h4>
											<ul className="space-y-1">
												{col.items.map((sub) => (
													<li key={sub.label}>
														<Link
															href={sub.href}
															className="block py-2 text-sm text-gray-700 border-b border-gray-50"
															onClick={closeMobile}
														>
															{sub.label}
														</Link>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</>
						) : (
							<>
								<div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
									<span className="font-bold text-sm text-gray-500">MENU</span>
									<button onClick={closeMobile} className="p-1">
										<svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								<div className="flex-1 overflow-y-auto py-2">
									{menuItems.map((item, i) => (
										<div key={item.label}>
											{item.href ? (
												<Link
													href={item.href}
													className="flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-800 border-b border-gray-50"
													onClick={closeMobile}
												>
													{item.label}
												</Link>
											) : (
												<button
													className="flex items-center justify-between w-full px-5 py-3 text-sm font-medium text-gray-800 border-b border-gray-50"
													onClick={() => openSub(i)}
												>
													{item.label}
													<svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
														<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
													</svg>
												</button>
											)}
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</>
	)
}
