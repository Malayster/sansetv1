import { defineField } from 'sanity'
import { ComposeIcon } from '@sanity/icons/Compose'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'blog.grid',
	title: 'Grid Artikel — Muat Lagi',
	type: 'object',
	icon: ComposeIcon,
	fields: [
		defineField({
			name: 'heading',
			title: 'Tajuk Seksyen',
			type: 'string',
		}),
		defineField({
			name: 'perPage',
			title: 'Artikel Per Halaman',
			type: 'number',
			initialValue: 12,
			validation: (Rule) => Rule.min(3).max(48),
		}),
		defineField({
			name: 'categoryFilter',
			title: 'Tapis Kategori',
			type: 'reference',
			to: [{ type: 'blog.category' }],
			description: 'Kosongkan untuk semua kategori',
		}),
	],
	preview: {
		prepare: () => ({ title: 'Grid Artikel — Muat Lagi' }),
	},
})
