import AdBanner from '@/ui/ad-banner'

export default function AdSlot({
	className,
	position = 'inline',
	category,
}: {
	className?: string
	position?: string
	category?: string
}) {
	return (
		<div className={className}>
			<AdBanner position={position} category={category} />
		</div>
	)
}
