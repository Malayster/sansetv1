'use client'

import type { DocumentActionComponent } from 'sanity'

const ApproveAction: DocumentActionComponent = (props) => {
	const doc = props.draft || props.published
	if (!doc) return null
	if (props.type !== 'blog.post') return null
	if (!doc.aiGenerated) return null

	return {
		label: '✅ Luluskan',
		tone: 'positive',
		disabled: doc.status !== 'pending',
		onHandle: async () => {
			try {
				await fetch('/api/approve', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: props.id }),
				})
			} catch (e) {
				console.error('[Luluskan]', e)
			}
			props.onComplete()
		},
	}
}

export default ApproveAction
