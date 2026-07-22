import { defineField, defineType } from 'sanity'

export default defineType({
	name: 'site',
	title: 'Site',
	type: 'document',
	groups: [
		{ name: 'branding', default: true },
		{ name: 'navigation' },
		{ name: 'info' },
	],
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule) => Rule.required(),
			group: 'branding',
		}),
		defineField({
			name: 'logo',
			type: 'logo',
			group: 'branding',
		}),
		defineField({
			name: 'ogimage',
			title: 'OpenGraph image (global)',
			description: 'Used for social sharing previews',
			type: 'image',
			group: 'branding',
		}),
		defineField({
			name: 'header',
			type: 'reference',
			to: [{ type: 'navigation' }],
			group: 'navigation',
		}),
		defineField({
			name: 'ctas',
			title: 'Call-to-actions',
			type: 'array',
			of: [{ type: 'cta' }],
			group: 'navigation',
		}),
		defineField({
			name: 'footer',
			type: 'reference',
			to: [{ type: 'navigation' }],
			group: 'navigation',
		}),
		defineField({
			name: 'social',
			type: 'reference',
			to: [{ type: 'navigation' }],
			group: 'navigation',
		}),
		defineField({
			name: 'copyright',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [{ title: 'Normal', value: 'normal' }],
					lists: [],
				},
			],
			group: 'info',
		}),

		defineField({
			name: 'footerContent',
			title: 'Footer Content (lama)',
			type: 'array',
			of: [{ type: 'block' }],
			hidden: true,
			group: 'info',
		}),
		defineField({
			name: 'portalLogo',
			title: 'Logo Portal (Header)',
			description: 'Muat naik PNG lutsinar untuk header frontend',
			type: 'image',
			options: { hotspot: true },
			group: 'branding',
		}),
		defineField({
			name: 'defaultLanguage',
			title: 'Bahasa Default',
			type: 'string',
			options: {
				list: [
					{ title: 'Bahasa Melayu', value: 'bm' },
					{ title: 'English', value: 'en' },
				],
			},
			initialValue: 'bm',
			group: 'branding',
		}),
		defineField({
			name: 'tickerItems',
			title: 'Item Ticker',
			description: 'Pilih data ekonomi untuk paparan di ticker header',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'economicData' }] }],
			group: 'info',
		}),
		defineField({
			name: 'footerText',
			title: 'Teks Footer (Penafian)',
			description: 'Teks ringkas di bahagian atas footer. Guna copyright untuk teks berformat.',
			type: 'text',
			group: 'info',
		}),
	],
	preview: {
		prepare: () => ({
			title: 'Site',
		}),
	},
})
