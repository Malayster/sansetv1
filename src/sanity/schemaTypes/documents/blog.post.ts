import { defineArrayMember, defineField, defineType } from 'sanity'
import { EditIcon } from '@sanity/icons/Edit'
import { ImageIcon } from '@sanity/icons/Image'

export default defineType({
	name: 'blog.post',
	title: 'Artikel',
	type: 'document',
	icon: EditIcon,
	groups: [
		{ name: 'content', default: true, title: 'Kandungan' },
		{ name: 'markdown', title: 'Markdown' },
		{ name: 'metadata', title: 'Metadata' },
		{ name: 'publishing', title: 'Penerbitan' },
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Tajuk',
			type: 'string',
			group: 'content',
			validation: (Rule) => Rule.required().min(5).max(200),
		}),
		defineField({
			name: 'content',
			title: 'Kandungan',
			type: 'array',
			of: [
				{ type: 'block' },
				defineArrayMember({
					type: 'image',
					icon: ImageIcon,
					options: {
						hotspot: true,
						metadata: ['lqip'],
					},
					fields: [
						defineField({
							name: 'alt',
							title: 'Teks Alternatif',
							type: 'string',
						}),
						defineField({
							name: 'figcaption',
							title: 'Kapsyen',
							type: 'array',
							of: [
								{
									type: 'block',
									styles: [{ title: 'Normal', value: 'normal' }],
								},
							],
						}),
					],
				}),
				{ type: 'accordion-list' },
				defineArrayMember({
					type: 'code',
					title: 'Code block',
					options: {
						withFilename: true,
					},
				}),
				{ type: 'custom-html' },
			],
			group: 'content',
		}),
		defineField({
			name: 'publishDate',
			title: 'Tarikh Terbit',
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
					{ title: 'Menunggu Kelulusan', value: 'pending' },
					{ title: 'Diluluskan', value: 'approved' },
					{ title: 'Diterbitkan', value: 'published' },
				],
			},
			initialValue: 'draft',
			group: 'publishing',
		}),
		defineField({
			name: 'aiGenerated',
			title: 'Dijana AI',
			description: 'Tandakan jika artikel ini dijana oleh AI',
			type: 'boolean',
			initialValue: false,
			group: 'publishing',
		}),
		defineField({
			name: 'sourceUrl',
			title: 'URL Sumber',
			description:
				'URL artikel asal dari sumber RSS. Kunci dedup utama untuk elak import berulang.',
			type: 'url',
			group: 'publishing',
			validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
		}),
		defineField({
			name: 'sourceName',
			title: 'Nama Sumber',
			description: 'Nama portal berita asal (cth: Bernama, Utusan).',
			type: 'string',
			group: 'publishing',
		}),
		defineField({
			name: 'categories',
			title: 'Kategori',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'blog.category' }], weak: true }],
			group: 'content',
			validation: (Rule) => Rule.min(1).warning(),
		}),
		defineField({
			name: 'author',
			title: 'Penulis',
			type: 'reference',
			to: [{ type: 'person' }],
			weak: true,
			group: 'content',
		}),
		defineField({
			name: 'markdown',
			type: 'code',
			description:
				'Disediakan di <slug>.md; Kosongkan untuk nyahaktif penjanaan laluan.',
			options: {
				language: 'markdown',
				languageAlternatives: [{ title: 'Markdown', value: 'markdown' }],
			},
			group: 'markdown',
		}),
		defineField({
			name: 'metadata',
			title: 'Metadata',
			type: 'metadata',
			group: 'metadata',
			validation: (Rule) =>
				Rule.custom((metadata: any, context: any) => {
					if (context.document?.status === 'published' && !metadata?.image) {
						return 'Gambar wajib dimuat naik sebelum menerbitkan artikel.'
					}
					return true
				}),
		}),
				defineField({
			name: 'language',
			title: 'Bahasa',
			type: 'string',
			options: {
				list: [
					{ title: 'Bahasa Melayu', value: 'bm' },
					{ title: 'English', value: 'en' },
				],
			},
			initialValue: 'bm',
			group: 'content',
		}),
		defineField({
			name: 'featured',
			title: 'Artikel Utama (Featured)',
			description: 'Tandakan untuk paparan di hero halaman utama',
			type: 'boolean',
			initialValue: false,
			group: 'publishing',
		}),
		defineField({
			name: 'isBreakingNews',
			title: 'Berita Tergempar',
			type: 'boolean',
			initialValue: false,
			group: 'publishing',
		}),
		defineField({
			name: 'tags',
			title: 'Tag',
			type: 'array',
			of: [{ type: 'string' }],
			options: { layout: 'tags' },
			group: 'content',
		}),
		defineField({
			name: 'readTime',
			title: 'Masa Bacaan (minit)',
			description: 'Biarkan kosong untuk kiraan automatik',
			type: 'number',
			group: 'content',
		}),
		defineField({
			name: 'electionRegion',
			title: 'Kawasan Pilihan Raya',
			type: 'reference',
			to: [{ type: 'region' }],
			description: 'Pautkan artikel ke kawasan pilihan raya (untuk dashboard)',
			group: 'content',
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'publishDate',
			media: 'metadata.image',
			status: 'status',
			ai: 'aiGenerated',
		},
		prepare: ({ title, subtitle, media, status, ai }) => ({
			title,
			subtitle: `${subtitle ?? 'Tiada tarikh'}${ai ? '  🤖 AI' : ''}  ·  ${status === 'published' ? '✅' : status === 'pending' ? '⏳' : '📝'} ${status}`,
			media,
		}),
	},
	orderings: [
		{
			name: 'publishDate',
			title: 'Tarikh Terbit',
			by: [{ field: 'publishDate', direction: 'desc' }],
		},
		{
			name: 'title',
			title: 'Tajuk',
			by: [{ field: 'title', direction: 'asc' }],
		},
	],
})
