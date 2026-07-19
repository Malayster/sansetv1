export default function ({
	date,
	...props
}: { date?: string } & React.ComponentProps<'time'>) {
	if (!date) return null

	const d = new Date(date.replaceAll('-', '/'))
	if (isNaN(d.getTime())) return null

	return (
		<time dateTime={date} {...props}>
			{format(d)}
		</time>
	)
}

const { format } = new Intl.DateTimeFormat('ms-MY', {
	dateStyle: 'medium',
})
