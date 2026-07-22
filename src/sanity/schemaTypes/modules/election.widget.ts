import { defineField } from 'sanity'
import { ChartUpwardIcon } from '@sanity/icons/ChartUpward'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'election.widget',
	title: 'Widget Pilihan Raya — Mini',
	type: 'object',
	icon: ChartUpwardIcon,
	fields: [
		defineField({
			name: 'heading',
			title: 'Tajuk Seksyen',
			type: 'string',
		}),
	],
	preview: {
		prepare: () => ({ title: 'Widget Pilihan Raya — Mini' }),
	},
})
