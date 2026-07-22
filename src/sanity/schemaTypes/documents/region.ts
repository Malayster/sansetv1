import { defineType, defineField } from 'sanity'

export default defineType({
	name: 'region',
	title: 'Kawasan Pilihan Raya',
	type: 'document',
	fields: [
		defineField({ name: 'name', title: 'Nama Kawasan', type: 'string' }),
		defineField({
			name: 'code',
			title: 'Kod',
			type: 'string',
			description: 'Padanan ID dalam GeoJSON (contoh: P001, N01)',
		}),
		defineField({
			name: 'type',
			title: 'Jenis',
			type: 'string',
			options: {
				list: [
					{ title: 'Parlimen', value: 'parlimen' },
					{ title: 'DUN', value: 'dun' },
				],
			},
		}),
		defineField({ name: 'state', title: 'Negeri', type: 'string' }),
	],
	preview: {
		select: { title: 'name', subtitle: 'code' },
	},
})
