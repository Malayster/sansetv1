import { defineField } from 'sanity'
import { RocketIcon } from '@sanity/icons/Rocket'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'government.achievements',
	title: 'Panel Pencapaian Kerajaan',
	type: 'object',
	icon: RocketIcon,
	fields: [
		defineField({
			name: 'heading',
			title: 'Tajuk Seksyen',
			type: 'string',
		}),
		defineField({
			name: 'limit',
			title: 'Bilangan Dipapar',
			type: 'number',
			initialValue: 3,
			validation: (Rule) => Rule.min(1).max(6),
		}),
	],
	preview: {
		prepare: () => ({ title: 'Panel Pencapaian Kerajaan' }),
	},
})
