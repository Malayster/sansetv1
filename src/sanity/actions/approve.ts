import { useClient, type DocumentActionComponent } from 'sanity'

/**
 * GANTI butang Publish untuk artikel AI.
 * Klik Luluskan → mutate status=approved → refresh pane.
 */
export const ApproveAction: DocumentActionComponent = (props) => {
	const client = useClient({ apiVersion: '2025-07-18' })
	const doc = props.draft || props.published

	// Hide for non-blog-post or non-AI docs
	if (!doc) return null
	if (props.type !== 'blog.post') return null
	if (!doc.aiGenerated) return null

	return {
		label: '✅ Luluskan',
		tone: 'positive',
		onHandle: async () => {
			try {
				await client
					.patch(doc._id)
					.set({ status: 'approved' })
					.commit({ autoGenerateArrayKeys: true })
				// Trigger standard publish if available
				props.publish?.execute()
			} catch {
				// Fallback: still refresh the pane
				props.onComplete()
			}
		},
	}
}
