import { defineType, defineField } from 'sanity'

export default defineType({
	name: 'governmentAchievement',
	title: 'Pencapaian Kerajaan',
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
			name: 'icon',
			title: 'Ikon (Emoji)',
			type: 'string',
			description: 'Guna emoji sebagai ikon (contoh: 🏗️ 📈 👥 🏠 📊)',
			initialValue: '📊',
		}),
		defineField({
			name: 'order',
			title: 'Susunan',
			type: 'number',
		}),
		defineField({
			name: 'link',
			title: 'Pautan (opsional)',
			type: 'url',
		}),
	],
	preview: {
		select: { title: 'title', subtitle: 'value' },
	},
})
