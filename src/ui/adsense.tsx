export default function AdSlot({ className }: { className?: string }) {
	return (
		<div className={className}>
			<div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-kelabu bg-abu py-8 text-center text-sm text-kelabu-gelap">
				<span className="text-xs uppercase tracking-wider">Iklan</span>
				<div className="h-[90px] w-full max-w-[728px] bg-kelabu/50" />
			</div>
		</div>
	)
}
