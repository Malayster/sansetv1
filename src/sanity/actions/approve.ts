import { useClient, type DocumentActionComponent } from 'sanity'

export const ApproveAction: DocumentActionComponent = (props) => {
	const client = useClient({ apiVersion: '2025-07-18' })
	const doc = props.draft || props.published

	// Only for AI-generated blog posts — replaces Publish
	if (props.type !== 'blog.post') return null
	if (!doc) return null
	if (!doc.aiGenerated) return null

	return {
		label: '✅ Luluskan',
		tone: 'positive',
		onHandle: async () => {
			const patch = client.patch(doc._id!)
			// If document was never published, set status to approved first
			if (!props.published) {
				await patch.set({ status: 'approved' }).commit()
			} else if (doc.status === 'pending') {
				await patch.set({ status: 'approved' }).commit()
			}
			// Then trigger standard publish
			if (props.publish) {
				props.publish.execute()
			} else {
				props.onComplete()
			}
		},
	}
}
