import { defineArrayMember, defineField, defineType } from 'sanity'
import { BillIcon } from '@sanity/icons/Bill'

export default defineType({
	name: 'ad.campaign',
	title: 'Kempen Iklan',
	type: 'document',
	icon: BillIcon,
	groups: [
		{ name: 'content', default: true, title: 'Kandungan' },
		{ name: 'targeting', title: 'Sasaran' },
		{ name: 'budget', title: 'Bajet' },
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Nama Kempen',
			type: 'string',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'client',
			title: 'Pelanggan',
			type: 'string',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'type',
			title: 'Jenis Iklan',
			type: 'string',
			options: {
				list: [
					{ title: 'Banner Atas (728×90)', value: 'banner' },
					{ title: 'Sidebar (300×250)', value: 'sidebar' },
					{ title: 'Dalam Artikel', value: 'inline' },
					{ title: 'Footer Melekit (Mobile)', value: 'sticky-footer' },
				],
			},
			group: 'content',
			initialValue: 'banner',
		}),
		defineField({
			name: 'image',
			title: 'Gambar Iklan',
			type: 'image',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'link',
			title: 'URL Pautan',
			type: 'url',
			group: 'content',
			validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
		}),
		defineField({
			name: 'startDate',
			title: 'Tarikh Mula',
			type: 'date',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'endDate',
			title: 'Tarikh Tamat',
			type: 'date',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'status',
			title: 'Status',
			type: 'string',
			options: {
				list: [
					{ title: 'Draf', value: 'draft' },
					{ title: 'Aktif', value: 'active' },
					{ title: 'Dijeda', value: 'paused' },
					{ title: 'Selesai', value: 'completed' },
				],
			},
			group: 'content',
			initialValue: 'draft',
		}),
		defineField({
			name: 'targetCategories',
			type: 'array',
			of: [{ type: 'string' }],
			title: 'Sasaran Kategori',
			description: 'Kosongkan untuk semua kategori',
			group: 'targeting',
			options: {
				list: [
					'nasional', 'politik', 'ekonomi', 'dunia', 'teknologi',
					'sukan', 'pendidikan', 'hiburan', 'kesihatan', 'bisnes',
				],
			},
		}),
		defineField({
			name: 'budget',
			title: 'Bajet (RM)',
			type: 'number',
			group: 'budget',
			validation: (Rule) => Rule.min(0),
		}),
		defineField({
			name: 'cpm',
			title: 'CPM (Cost per 1000 paparan)',
			type: 'number',
			group: 'budget',
			validation: (Rule) => Rule.min(0),
			initialValue: 5,
		}),
		defineField({
			name: 'maxImpressions',
			title: 'Had Paparan',
			type: 'number',
			group: 'budget',
		}),
		defineField({
			name: 'impressions',
			title: 'Jumlah Paparan',
			type: 'number',
			group: 'budget',
			initialValue: 0,
			readOnly: true,
		}),
		defineField({
			name: 'clicks',
			title: 'Jumlah Klik',
			type: 'number',
			group: 'budget',
			initialValue: 0,
			readOnly: true,
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'client',
			media: 'image',
			status: 'status',
			impressions: 'impressions',
			clicks: 'clicks',
		},
		prepare: ({ title, subtitle, media, status, impressions, clicks }) => {
			const emoji =
				status === 'active' ? '🟢' : status === 'paused' ? '🟡' : status === 'completed' ? '🔵' : '⚪'
			return {
				title,
				subtitle: `${subtitle} · ${emoji} ${status} · ${impressions || 0} paparan · ${clicks || 0} klik`,
				media,
			}
		},
	},
	orderings: [
		{ name: 'startDate', title: 'Tarikh Mula', by: [{ field: 'startDate', direction: 'desc' }] },
		{ name: 'impressions', title: 'Paparan', by: [{ field: 'impressions', direction: 'desc' }] },
	],
})
