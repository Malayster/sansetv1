export default function MegaFooterCta() {
	return (
		<section className="relative overflow-hidden bg-hitam py-16 md:py-24">
			{/* Stars/decoration */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-10 left-[10%] w-2 h-2 bg-putih rounded-full" />
				<div className="absolute top-20 left-[25%] w-1.5 h-1.5 bg-putih rounded-full" />
				<div className="absolute top-8 left-[40%] w-1 h-1 bg-putih rounded-full" />
				<div className="absolute top-16 left-[55%] w-2 h-2 bg-putih rounded-full" />
				<div className="absolute top-12 left-[70%] w-1.5 h-1.5 bg-putih rounded-full" />
				<div className="absolute top-24 left-[85%] w-1 h-1 bg-putih rounded-full" />
				<div className="absolute bottom-32 left-[15%] w-1 h-1 bg-putih rounded-full" />
				<div className="absolute bottom-20 left-[35%] w-2 h-2 bg-putih rounded-full" />
				<div className="absolute bottom-28 left-[50%] w-1.5 h-1.5 bg-putih rounded-full" />
				<div className="absolute bottom-16 left-[65%] w-1 h-1 bg-putih rounded-full" />
				<div className="absolute bottom-24 left-[80%] w-2 h-2 bg-putih rounded-full" />
			</div>

			{/* Gradient blob */}
			<div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-merah/10 to-kuning/5 blur-3xl" />
			<div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-merah/10 to-transparent blur-3xl" />

			<div className="relative max-w-3xl mx-auto text-center px-4">
				<h2 className="text-2xl md:text-4xl font-bold text-putih mb-4 leading-tight">
					Suara Rakyat,<br />
					<span className="text-merah">Disampaikan Tanpa Tapisan</span>
				</h2>
				<p className="text-putih/50 text-sm md:text-base mb-8 max-w-xl mx-auto">
					Bersama kami, setiap suara didengar. Ikuti berita terkini, analisis mendalam, dan laporan eksklusif dari seluruh pelusuk negeri.
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<a href="/berita" className="action bg-merah text-putih px-8 py-3 rounded-lg hover:bg-merah-gelap transition-colors font-bold">
						📰 Baca Berita Terkini
					</a>
					<a href="https://wa.me/6281248468287" target="_blank" rel="noopener noreferrer" className="action-outline px-8 py-3 rounded-lg font-bold">
						💬 Hubungi Kami
					</a>
				</div>
			</div>
		</section>
	)
}
