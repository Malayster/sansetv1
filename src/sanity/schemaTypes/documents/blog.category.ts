import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons/Tag'

export default defineType({
	name: 'blog.category',
	title: 'Blog category',
	type: 'document',
	icon: TagIcon,
	fields: [
		defineField({
			name: 'title',
			type: 'string',
		}),
		defineField({
			name: 'slug',
			type: 'slug',
			options: { source: 'title' },
		}),
		defineField({
			name: 'color',
			title: 'Warna Label',
			type: 'string',
			description: 'Kod hex untuk warna kategori',
			options: {
				list: [
					{ title: 'Merah (#C41E3A)', value: '#C41E3A' },
					{ title: 'Emas (#B8860B)', value: '#B8860B' },
					{ title: 'Hijau Zamrud (#046A38)', value: '#046A38' },
					{ title: 'Biru Tua (#1E3A8A)', value: '#1E3A8A' },
					{ title: 'Hitam (#111111)', value: '#111111' },
				],
			},
		}),
		defineField({
			name: 'description',
			title: 'Deskripsi',
			type: 'text',
			rows: 2,
		}),
	],
	preview: {
		select: {
			title: 'title',
		},
	},
})
