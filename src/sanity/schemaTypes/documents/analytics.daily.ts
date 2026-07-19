import { defineField, defineType } from 'sanity'

export default defineType({
	name: 'analytics.daily',
	title: 'Analytics Harian',
	type: 'document',
	fields: [
		defineField({ name: 'date', type: 'string', title: 'Tarikh' }),
		defineField({ name: 'totalViews', type: 'number', title: 'Jumlah Paparan', initialValue: 0 }),
		defineField({ name: 'uniqueSessions', type: 'number', title: 'Sesi Unik', initialValue: 0 }),
		defineField({
			name: 'articleViews',
			type: 'array',
			title: 'Paparan Artikel',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'slug', type: 'string' },
						{ name: 'title', type: 'string' },
						{ name: 'views', type: 'number' },
					],
				},
			],
		}),
		defineField({
			name: 'categoryViews',
			type: 'array',
			title: 'Paparan Kategori',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'category', type: 'string' },
						{ name: 'views', type: 'number' },
					],
				},
			],
		}),
		defineField({
			name: 'searchQueries',
			type: 'array',
			title: 'Carian',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'query', type: 'string' },
						{ name: 'count', type: 'number' },
					],
				},
			],
		}),
		defineField({
			name: 'countries',
			type: 'array',
			title: 'Negara',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'country', type: 'string' },
						{ name: 'count', type: 'number' },
					],
				},
			],
		}),
		defineField({
			name: 'devices',
			type: 'array',
			title: 'Peranti',
			of: [
				{
					type: 'object',
					fields: [
						{ name: 'device', type: 'string' },
						{ name: 'count', type: 'number' },
					],
				},
			],
		}),
	],
	preview: {
		select: { title: 'date', subtitle: 'totalViews' },
	},
})
