import { defineType, defineField } from 'sanity'

export default defineType({
	name: 'economicData',
	title: 'Data Ekonomi',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Tajuk',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'value',
			title: 'Nilai',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'change',
			title: 'Perubahan',
			type: 'string',
		}),
		defineField({
			name: 'isPositive',
			title: 'Positif?',
			type: 'boolean',
			initialValue: true,
		}),
		defineField({
			name: 'type',
			title: 'Jenis Data',
			type: 'string',
			options: {
				list: [
					{ title: 'BSKL', value: 'bskl' },
					{ title: 'FDI', value: 'fdi' },
					{ title: 'Projek Perumahan', value: 'projekPerumahan' },
				],
			},
		}),
		defineField({
			name: 'showInTicker',
			title: 'Paparkan di Ticker',
			type: 'boolean',
			initialValue: true,
		}),
		defineField({
			name: 'lastUpdated',
			title: 'Kemaskini Terakhir',
			type: 'datetime',
		}),
		defineField({
			name: 'additionalInfo',
			title: 'Maklumat Tambahan',
			type: 'text',
		}),
	],
	preview: {
		select: { title: 'title', subtitle: 'value' },
	},
})
