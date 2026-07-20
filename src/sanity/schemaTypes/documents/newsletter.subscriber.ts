import { defineField, defineType } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons/Envelope'

export default defineType({
	name: 'newsletter.subscriber',
	title: 'Pelanggan Newsletter',
	type: 'document',
	icon: EnvelopeIcon,
	fields: [
		defineField({
			name: 'email',
			type: 'string',
			title: 'Emel',
			validation: (Rule) => Rule.required().regex(
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				{ name: 'email', invert: false }
			).error('Sila masukkan emel yang sah'),
		}),
		defineField({
			name: 'source',
			type: 'string',
			title: 'Sumber',
			options: {
				list: ['footer', 'sidebar', 'popup', 'cta'],
			},
			initialValue: 'footer',
		}),
		defineField({
			name: 'status',
			type: 'string',
			title: 'Status',
			options: {
				list: ['subscribed', 'unsubscribed'],
			},
			initialValue: 'subscribed',
		}),
		defineField({
			name: 'subscribedAt',
			type: 'datetime',
			title: 'Tarikh Langganan',
			initialValue: () => new Date().toISOString(),
		}),
	],
	preview: {
		select: {
			title: 'email',
			subtitle: 'source',
		},
	},
	orderings: [
		{
			name: 'subscribedAt',
			title: 'Tarikh Langganan',
			by: [{ field: 'subscribedAt', direction: 'desc' }],
		},
	],
})
