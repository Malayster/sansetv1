import { defineField } from 'sanity'
import { TagIcon } from '@sanity/icons/Tag'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'category.cards',
	title: 'Kad Kategori',
	type: 'object',
	icon: TagIcon,
	fields: [
		defineField({
			name: 'heading',
			title: 'Tajuk Seksyen',
			type: 'string',
		}),
	],
	preview: {
		prepare: () => ({ title: 'Kad Kategori' }),
	},
})
