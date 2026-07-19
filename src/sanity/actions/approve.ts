import { useClient, type DocumentActionComponent } from 'sanity'

export const ApproveAction: DocumentActionComponent = (props) => {
	const client = useClient({ apiVersion: '2025-07-18' })
	const doc = props.draft || props.published

	if (props.type !== 'blog.post' || !doc?.aiGenerated || doc.status !== 'pending')
		return undefined as unknown as ReturnType<DocumentActionComponent>

	return {
		label: '✅ Luluskan',
		onHandle: async () => {
			await client.patch(doc._id!).set({ status: 'approved' }).commit()
			props.onComplete()
		},
	}
}
