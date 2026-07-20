import { defineField, defineType } from 'sanity'
import { CommentIcon } from '@sanity/icons/Comment'

export default defineType({
	name: 'form.submission',
	title: 'Penghantaran Borang',
	type: 'document',
	icon: CommentIcon,
	fields: [
		defineField({
			name: 'formId',
			type: 'string',
			title: 'Borang',
		}),
		defineField({
			name: 'name',
			type: 'string',
			title: 'Nama',
		}),
		defineField({
			name: 'email',
			type: 'string',
			title: 'Emel',
		}),
		defineField({
			name: 'message',
			type: 'text',
			title: 'Mesej',
		}),
		defineField({
			name: 'submittedAt',
			type: 'datetime',
			title: 'Tarikh Hantar',
			initialValue: () => new Date().toISOString(),
		}),
	],
	preview: {
		select: {
			title: 'name',
			subtitle: 'email',
		},
	},
	orderings: [
		{
			name: 'submittedAt',
			title: 'Tarikh Hantar',
			by: [{ field: 'submittedAt', direction: 'desc' }],
		},
	],
})
