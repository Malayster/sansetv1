import { defineField } from 'sanity'
import { TrendUpwardIcon } from '@sanity/icons/TrendUpward'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'economy.boxes',
	title: 'Kotak Data Ekonomi',
	type: 'object',
	icon: TrendUpwardIcon,
	fields: [
		defineField({
			name: 'heading',
			title: 'Tajuk Seksyen',
			type: 'string',
		}),
	],
	preview: {
		prepare: () => ({ title: 'Kotak Data Ekonomi' }),
	},
})
