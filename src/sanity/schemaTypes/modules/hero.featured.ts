import { defineField } from 'sanity'
import { StarIcon } from '@sanity/icons/Star'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'hero.featured',
	title: 'Hero — Artikel Utama',
	type: 'object',
	icon: StarIcon,
	fields: [
		defineField({
			name: 'heading',
			title: 'Tajuk Seksyen',
			type: 'string',
			description: 'Kosongkan untuk sembunyikan tajuk',
		}),
	],
	preview: {
		prepare: () => ({ title: 'Hero — Artikel Utama' }),
	},
})
